import { Metadata } from "next";
import { PortfolioCaseStudy } from "@/components/ui/portfolio-case-study";

export const metadata: Metadata = {
  title: "This portfolio | Case Study",
  description:
    "Case study for this portfolio — a procedural 3D garden with an autosaving live editor, L-system plants, and custom GLSL shaders.",
};

export default function PortfolioCaseStudyPage() {
  return <PortfolioCaseStudy />;
}
