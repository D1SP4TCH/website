import { Metadata } from "next";
import { VeveyCaseStudy } from "@/components/ui/vevey-case-study";

export const metadata: Metadata = {
  title: "Vevey | Case Study",
  description:
    "Lead developer case study for Vevey — an AI-native game-creation platform. Architecture, in-page game embeds, frontier-model benchmarks, scroll-choreographed product story, and a Vercel-hosted CDN proxy.",
};

export default function VeveyCaseStudyPage() {
  return <VeveyCaseStudy />;
}
