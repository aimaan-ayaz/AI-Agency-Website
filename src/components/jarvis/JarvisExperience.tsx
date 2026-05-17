"use client";

import { useState } from "react";
import { AnimatePresence } from "framer-motion";
import HudBackground from "./background/HudBackground";
import BootSequence from "./BootSequence";
import AccessGate from "./AccessGate";
import Dashboard from "./Dashboard";

type JarvisUser = "Aimaan" | "Zaid";
type Phase = "boot" | "gate" | "dashboard";

// Dev bypass — keep `false` in production. When true, skips boot + gate
// straight into the dashboard as Aimaan (local testing only).
const DEV_SKIP_AUTH = false;

export default function JarvisExperience() {
  const [phase, setPhase] = useState<Phase>(
    DEV_SKIP_AUTH ? "dashboard" : "boot"
  );
  const [user, setUser] = useState<JarvisUser>("Aimaan");

  return (
    <>
      {/* Atmosphere is always mounted; it just brightens once we're in. */}
      <HudBackground dim={phase !== "dashboard"} />

      <AnimatePresence mode="wait">
        {phase === "boot" && (
          <BootSequence key="boot" onComplete={() => setPhase("gate")} />
        )}

        {phase === "gate" && (
          <AccessGate
            key="gate"
            onGranted={(u) => {
              setUser(u);
              setPhase("dashboard");
            }}
          />
        )}

        {phase === "dashboard" && <Dashboard key="dash" user={user} />}
      </AnimatePresence>
    </>
  );
}
