'use client';

import { useEffect } from 'react';
import Link from 'next/link';
import { GARDEN_PALETTE, type GardenProject } from '@/lib/data/garden-portfolio';
import { getPlantTypeName } from '@/lib/utils/plant-generator';
import { getFeaturedProjectBySlug } from '@/lib/data/featured-projects';
import { displayProjectYear } from '@/lib/utils/display-project-year';

interface ProjectDetailCardProps {
  project: GardenProject | null;
  onClose: () => void;
}

/**
 * Minimal, elegant project detail card.
 * Slides in from the right when a plant is clicked in view mode.
 *
 * Behavior:
 * - If the plant is linked to a featured project, display the live project
 *   info (pulled from the shared data file) and a CTA into the case study.
 * - Otherwise fall back to the plant's own inline title/description — handy
 *   for legacy data that pre-dates project linking.
 * - Empty/decorative plants are filtered out upstream; this card just
 *   exits early if one sneaks through.
 */
export const ProjectDetailCard = ({ project, onClose }: ProjectDetailCardProps) => {
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };

    if (project) {
      window.addEventListener('keydown', handleEscape);
      return () => window.removeEventListener('keydown', handleEscape);
    }
  }, [project, onClose]);

  if (!project || project.isEmpty) return null;

  const linked = project.projectSlug
    ? getFeaturedProjectBySlug(project.projectSlug)
    : null;

  const plantType = getPlantTypeName(project);
  const title = linked?.title ?? project.title;
  const description = linked?.tagline ?? project.description;
  const techStack = linked?.techStack ?? project.techStack;
  const year = displayProjectYear(
    linked?.year ?? new Date(project.date).getFullYear(),
  );
  const role = linked?.role ?? null;
  const liveUrl = linked?.liveUrl ?? project.liveUrl;
  const liveLabel = linked?.liveLabel ?? (liveUrl?.startsWith('/') ? 'Open' : 'View live');

  return (
    <div
      className="absolute top-0 right-0 h-full w-full sm:w-[28rem] flex items-center justify-end pointer-events-none"
      role="dialog"
      aria-modal="true"
      aria-labelledby="project-title"
    >
      <div
        className="h-full sm:h-auto sm:max-h-[80vh] w-full sm:w-auto m-0 sm:m-6 p-10 sm:p-12 bg-white/95 backdrop-blur-md sm:rounded-2xl shadow-2xl pointer-events-auto overflow-y-auto animate-in slide-in-from-right duration-300"
        style={{ color: GARDEN_PALETTE.text }}
      >
        <div className="flex items-start justify-between gap-5 mb-7">
          <div className="flex-1 min-w-0">
            <p
              className="text-xs uppercase tracking-wider mb-2 break-words"
              style={{ color: GARDEN_PALETTE.textMuted }}
            >
              {linked?.category ?? plantType}
            </p>
            <h2
              id="project-title"
              className="text-2xl font-medium leading-tight break-words"
            >
              {title}
            </h2>
          </div>

          <button
            onClick={onClose}
            className="flex-shrink-0 w-8 h-8 flex items-center justify-center rounded-full hover:bg-black/5 transition-colors"
            aria-label="Close project details"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {description && (
          <p
            className="text-sm leading-relaxed mb-6 break-words"
            style={{ color: GARDEN_PALETTE.textMuted }}
          >
            {description}
          </p>
        )}

        {techStack.length > 0 && (
          <div className="mb-6">
            <p
              className="text-xs uppercase tracking-wider mb-2"
              style={{ color: GARDEN_PALETTE.textMuted }}
            >
              Technologies
            </p>
            <div className="flex flex-wrap gap-2">
              {techStack.map((tech, i) => (
                <span
                  key={i}
                  className="px-3 py-1 text-xs rounded-full bg-black/5 max-w-full break-words"
                  style={{ color: GARDEN_PALETTE.text }}
                >
                  {tech}
                </span>
              ))}
            </div>
          </div>
        )}

        <div
          className="flex flex-wrap items-center gap-x-4 gap-y-2 mb-6 text-xs"
          style={{ color: GARDEN_PALETTE.textMuted }}
        >
          <span>{year}</span>
          {role && (
            <>
              <span>•</span>
              <span>{role}</span>
            </>
          )}
          {project.featured && (
            <>
              <span>•</span>
              <span className="text-amber-600">Featured</span>
            </>
          )}
        </div>

        <div className="flex flex-wrap gap-3">
          {linked?.hasCaseStudy && (
            <Link
              href={`/projects/${linked.slug}`}
              className="flex-1 min-w-[9rem] px-4 py-2.5 text-sm text-center rounded-lg transition-colors"
              style={{
                backgroundColor: GARDEN_PALETTE.text,
                color: '#fff',
              }}
            >
              Read the case study →
            </Link>
          )}
          {liveUrl && (
            liveUrl.startsWith('/') ? (
              <Link
                href={liveUrl}
                className="flex-1 min-w-[9rem] px-4 py-2.5 text-sm text-center border rounded-lg hover:bg-black/5 transition-colors"
                style={{
                  borderColor: GARDEN_PALETTE.text,
                  color: GARDEN_PALETTE.text,
                }}
              >
                {liveLabel}
              </Link>
            ) : (
              <a
                href={liveUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="flex-1 min-w-[9rem] px-4 py-2.5 text-sm text-center border rounded-lg hover:bg-black/5 transition-colors"
                style={{
                  borderColor: GARDEN_PALETTE.text,
                  color: GARDEN_PALETTE.text,
                }}
              >
                {liveLabel}
              </a>
            )
          )}
          {project.githubUrl && (
            <a
              href={project.githubUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="flex-1 min-w-[9rem] px-4 py-2.5 text-sm text-center border rounded-lg hover:bg-black/5 transition-colors"
              style={{
                borderColor: GARDEN_PALETTE.text,
                color: GARDEN_PALETTE.text,
              }}
            >
              GitHub
            </a>
          )}
        </div>

        <p
          className="mt-6 text-xs text-center"
          style={{ color: GARDEN_PALETTE.textMuted }}
        >
          Press <kbd className="px-1.5 py-0.5 bg-black/5 rounded text-xs">ESC</kbd> to close
        </p>
      </div>
    </div>
  );
};
