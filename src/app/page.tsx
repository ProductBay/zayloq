import { Navbar } from "@/components/zayloq/layout/navbar";
import { HeroSection } from "@/components/zayloq/sections/hero-section";
import { ZayloqSimulator } from "@/components/zayloq/simulator/zayloq-simulator";
import { BuildTypesSection } from "@/components/zayloq/sections/build-types-section";
import { IntelligenceSection } from "@/components/zayloq/sections/intelligence-section";
import { WorkspacePreview } from "@/components/zayloq/demo/workspace-preview";
import { CaribbeanSection } from "@/components/zayloq/sections/caribbean-section";
import { EarlyAccessSection } from "@/components/zayloq/sections/early-access-section";
import { Footer } from "@/components/zayloq/layout/footer";

export default function Home() {
  return (
    <main className="min-h-screen">

      <Navbar />

      <HeroSection />

      <ZayloqSimulator />

      <BuildTypesSection />

      <IntelligenceSection />

      <WorkspacePreview />

      <CaribbeanSection />

      <EarlyAccessSection />

      <Footer />

    </main>
  );
}
