import { useEffect, useState } from "react";

/**
 * Resolves once a given web font is loaded (or immediately if the Font Loading
 * API is unavailable). Used to rebuild the Z-mark canvas texture after Blanka
 * loads, so the brand mark never renders in a fallback face.
 */
export function useFontReady(spec: string): boolean {
  const [ready, setReady] = useState(false);

  useEffect(() => {
    let alive = true;
    const fonts = (document as Document & { fonts?: FontFaceSet }).fonts;
    if (!fonts) {
      setReady(true);
      return;
    }
    fonts
      .load(spec)
      .then(() => alive && setReady(true))
      .catch(() => alive && setReady(true));
    return () => {
      alive = false;
    };
  }, [spec]);

  return ready;
}
