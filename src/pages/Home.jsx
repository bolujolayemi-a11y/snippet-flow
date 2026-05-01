import Hero from "../components/Hero";
import CodeEditor from "../components/CodeEditor";
import FeatureGrid from "../components/FeatureGrid";

export default function Home() {
  return (
    <main className="flex flex-col items-center">
      <Hero />
      <CodeEditor />
      <FeatureGrid />
    </main>
  );
}