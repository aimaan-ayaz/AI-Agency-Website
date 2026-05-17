import JarvisExperience from "@/components/jarvis/JarvisExperience";

// The whole experience is client-driven (animation + WebGL + audio).
// This server page just mounts it inside the isolated JARVIS layout.
export default function JarvisPage() {
  return <JarvisExperience />;
}
