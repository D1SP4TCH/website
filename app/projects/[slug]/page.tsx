import { Metadata } from "next";
import { notFound } from "next/navigation";
import { getProjectBySlug, projects } from "@/lib/data/projects";
import { ProjectHero } from "@/components/ui/project-hero";
import { ProjectContent } from "@/components/ui/project-content";
import { ProjectNavigation } from "@/components/ui/project-navigation";

const STATIC_CASE_STUDY_SLUGS = new Set(["vevey-landing", "portfolio"]);

export async function generateStaticParams() {
  return projects
    .filter((project) => !STATIC_CASE_STUDY_SLUGS.has(project.id))
    .map((project) => ({
      slug: project.id,
    }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const project = getProjectBySlug(slug);

  if (!project) {
    return {
      title: "Project Not Found",
    };
  }

  return {
    title: `${project.title} | Portfolio`,
    description: project.description,
  };
}

export default async function ProjectPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const project = getProjectBySlug(slug);

  if (!project) {
    notFound();
  }

  const currentIndex = projects.findIndex((p) => p.id === slug);
  const prevProject = currentIndex > 0 ? projects[currentIndex - 1] : null;
  const nextProject =
    currentIndex < projects.length - 1 ? projects[currentIndex + 1] : null;

  return (
    <main className="-mt-24 min-h-screen bg-[#2f3731] pt-24 text-white">
      <ProjectHero project={project} />
      <ProjectContent project={project} />
      <ProjectNavigation prevProject={prevProject} nextProject={nextProject} />
    </main>
  );
}

