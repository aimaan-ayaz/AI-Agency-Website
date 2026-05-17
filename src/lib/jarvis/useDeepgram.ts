"use client";

import { useCallback, useEffect, useRef, type MutableRefObject } from "react";

// Deepgram Nova-2 streaming STT.
//
// Audio: our own mic stream → Web Audio graph → raw 16 kHz mono PCM →
// WebSocket to Deepgram. The same stream feeds an AnalyserNode so (a)
// the orb reacts to real voice amplitude and (b) we run a fast
// client-side silence detector so JARVIS stops listening ~1s after you
// finish — instead of waiting on Deepgram's slower endpointing.
//
// PERF: the token fetch and getUserMedia run in parallel, and the
// server caches the Deepgram key, so "tap to speak" is near-instant.

type Handlers = {
  onInterim?: (t: string) => void;
  onFinal: (t: string) => void;
  onEnd?: () => void;
  onError?: (kind: string) => void;
  onEvent?: (name: string) => void;
};

const OUT_RATE = 16000;
const VOICE_RMS = 0.045; // raw RMS above this = "speaking"
const SILENCE_MS = 1100; // silence after speech → finalize
const NOSPEECH_MS = 2600; // no speech at all → auto-exit
const DG_URL =
  "wss://api.deepgram.com/v1/listen" +
  "?model=nova-2&language=en&smart_format=true&punctuate=true" +
  "&interim_results=true&endpointing=300" +
  `&encoding=linear16&sample_rate=${OUT_RATE}&channels=1`;

function downsampleToInt16(input: Float32Array, inRate: number): ArrayBuffer {
  const ratio = inRate / OUT_RATE;
  const outLen = Math.floor(input.length / ratio);
  const out = new Int16Array(outLen);
  for (let i = 0; i < outLen; i++) {
    const s = Math.max(-1, Math.min(1, input[Math.floor(i * ratio)]));
    out[i] = s < 0 ? s * 0x8000 : s * 0x7fff;
  }
  return out.buffer;
}

export function useDeepgram(levelRef: MutableRefObject<number>) {
  const wsRef = useRef<WebSocket | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const ctxRef = useRef<AudioContext | null>(null);
  const procRef = useRef<ScriptProcessorNode | null>(null);
  const rafRef = useRef(0);
  const doneRef = useRef(false);
  const hRef = useRef<Handlers | null>(null);
  const transcriptRef = useRef("");

  const cleanup = useCallback(() => {
    cancelAnimationFrame(rafRef.current);
    levelRef.current = 0;
    try {
      procRef.current?.disconnect();
    } catch {}
    procRef.current = null;
    try {
      if (wsRef.current && wsRef.current.readyState <= 1) {
        wsRef.current.send(JSON.stringify({ type: "CloseStream" }));
        wsRef.current.close();
      }
    } catch {}
    wsRef.current = null;
    streamRef.current?.getTracks().forEach((t) => t.stop());
    streamRef.current = null;
    ctxRef.current?.close().catch(() => {});
    ctxRef.current = null;
  }, [levelRef]);

  const finalize = useCallback(
    (text: string) => {
      if (doneRef.current) return;
      doneRef.current = true;
      const h = hRef.current;
      cleanup();
      const t = text.trim();
      if (t) h?.onFinal(t);
      h?.onEnd?.();
    },
    [cleanup]
  );

  const start = useCallback(
    async (h: Handlers) => {
      doneRef.current = false;
      hRef.current = h;
      transcriptRef.current = "";

      // Token + mic concurrently (both kick off before the first await).
      const tokenP = fetch("/api/jarvis/deepgram-token", { method: "POST" })
        .then((r) => r.json().then((d) => ({ ok: r.ok, d })))
        .catch(() => ({ ok: false, d: { error: "token_failed" } }));
      const streamP = navigator.mediaDevices
        .getUserMedia({
          audio: {
            echoCancellation: true,
            noiseSuppression: true,
            channelCount: 1,
          },
        })
        .then(
          (s) => ({ s }),
          (e) => ({ err: (e as { name?: string })?.name })
        );

      const tok = await tokenP;
      if (!tok.ok || !tok.d?.token) {
        h.onError?.(tok.d?.error || "token_failed");
        return;
      }
      const token: string = tok.d.token;

      const sm = await streamP;
      if (!("s" in sm) || !sm.s) {
        const errName = "err" in sm ? sm.err : undefined;
        h.onError?.(
          errName === "NotAllowedError" ? "not-allowed" : "audio-capture"
        );
        return;
      }
      const stream = sm.s;
      streamRef.current = stream;

      // Web Audio graph: source → analyser (orb + silence VAD) + PCM tap.
      const Ctx =
        window.AudioContext ||
        (window as unknown as { webkitAudioContext: typeof AudioContext })
          .webkitAudioContext;
      const ctx = new Ctx();
      ctxRef.current = ctx;
      const src = ctx.createMediaStreamSource(stream);

      const an = ctx.createAnalyser();
      an.fftSize = 1024;
      src.connect(an);
      const abuf = new Uint8Array(an.fftSize);

      let sawSpeech = false;
      let lastVoice = performance.now();
      const startTs = performance.now();

      const tick = () => {
        an.getByteTimeDomainData(abuf);
        let s = 0;
        for (let i = 0; i < abuf.length; i++) {
          const v = (abuf[i] - 128) / 128;
          s += v * v;
        }
        const rms = Math.sqrt(s / abuf.length);
        levelRef.current = Math.min(1, levelRef.current * 0.7 + rms * 0.54);

        const now = performance.now();
        if (rms > VOICE_RMS) {
          sawSpeech = true;
          lastVoice = now;
        }
        // Fast end-of-turn: snappy stop once you go quiet.
        if (sawSpeech && now - lastVoice > SILENCE_MS) {
          finalize(transcriptRef.current);
          return;
        }
        if (!sawSpeech && now - startTs > NOSPEECH_MS) {
          finalize(""); // nothing said → exit the conversation loop
          return;
        }
        rafRef.current = requestAnimationFrame(tick);
      };
      rafRef.current = requestAnimationFrame(tick);

      const proc = ctx.createScriptProcessor(4096, 1, 1);
      procRef.current = proc;
      const mute = ctx.createGain();
      mute.gain.value = 0;
      src.connect(proc);
      proc.connect(mute);
      mute.connect(ctx.destination);

      const ws = new WebSocket(DG_URL, ["token", token]);
      wsRef.current = ws;
      let finalSegs = "";
      let sentAudio = false;

      ws.onopen = () => {
        h.onEvent?.("dg:open");
        proc.onaudioprocess = (e) => {
          if (ws.readyState !== 1) return;
          ws.send(
            downsampleToInt16(e.inputBuffer.getChannelData(0), ctx.sampleRate)
          );
          if (!sentAudio) {
            sentAudio = true;
            h.onEvent?.("dg:audio");
          }
        };
      };

      ws.onmessage = (ev) => {
        let msg: {
          type?: string;
          is_final?: boolean;
          speech_final?: boolean;
          description?: string;
          message?: string;
          channel?: { alternatives?: { transcript?: string }[] };
        };
        try {
          msg = JSON.parse(ev.data as string);
        } catch {
          return;
        }
        if (msg.type === "Error" || msg.type === "Warning") {
          h.onEvent?.(
            `dg:${msg.type}:${msg.description || msg.message || ""}`
          );
          if (msg.type === "Error") {
            hRef.current?.onError?.("dg_stream");
            finalize(finalSegs);
          }
          return;
        }
        if (msg.type !== "Results") {
          if (msg.type) h.onEvent?.(`dg:msg:${msg.type}`);
          return;
        }
        const tr = msg.channel?.alternatives?.[0]?.transcript ?? "";
        if (tr) {
          // Any recognized words also count as "speech" for the VAD,
          // so quiet/whispered input still finalizes correctly.
          sawSpeech = true;
          lastVoice = performance.now();
        }
        if (msg.is_final && tr) finalSegs = (finalSegs + " " + tr).trim();
        const shown = (finalSegs + " " + (msg.is_final ? "" : tr)).trim();
        transcriptRef.current = shown;
        if (shown) h.onInterim?.(shown);
      };

      ws.onerror = () => h.onEvent?.("dg:error");
      ws.onclose = (evt) => {
        h.onEvent?.(`dg:close:${evt.code}${evt.reason ? `:${evt.reason}` : ""}`);
        if (doneRef.current) return;
        if (!sentAudio && !finalSegs) {
          hRef.current?.onError?.(
            evt.code === 1008 || evt.code === 4001 || evt.code === 4008
              ? "dg_auth"
              : "dg_nostream"
          );
          finalize("");
          return;
        }
        finalize(finalSegs);
      };
    },
    [finalize, levelRef]
  );

  const stop = useCallback(() => {
    finalize(transcriptRef.current);
  }, [finalize]);

  useEffect(() => () => cleanup(), [cleanup]);

  return { start, stop };
}
