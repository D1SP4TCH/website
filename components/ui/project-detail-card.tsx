'use client';

import { useEffect } from 'react';
import { GARDEN_PALETTE, type GardenProject } from '@/lib/data/garden-portfolio';
import { getPlantTypeName } from '@/lib/utils/plant-generator';

interface ProjectDetailCardProps {
  project: GardenProject | null;
  onClose: () => void;
}

/**
 * Minimal, elegant project detail card
 * Slides in from the right when a plant is clicked
 */
export const ProjectDetailCard = ({ project, onClose }: ProjectDetailCardProps) => {
  // Handle escape key
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
  
  if (!project) return null;
  
  const plantType = getPlantTypeName(project);
  
  return (
    <div 
      className="absolute top-0 right-0 h-full w-full sm:w-96 flex items-center justify-end pointer-events-none"
      role="dialog"
      aria-modal="true"
      aria-labelledby="project-title"
    >
      <div 
        className="h-full sm:h-auto sm:max-h-[80vh] w-full sm:w-auto m-0 sm:m-6 p-6 sm:p-8 bg-white/95 backdrop-blur-md sm:rounded-2xl shadow-2xl pointer-events-auto overflow-y-auto animate-in slide-in-from-right duration-300"
        style={{ color: GARDEN_PALETTE.text }}
      >
        {/* Header */}
        <div className="flex items-start justify-between gap-4 mb-6">
          <div className="flex-1">
            <p 
              className="text-xs uppercase tracking-wider mb-1"
              style={{ color: GARDEN_PALETTE.textMuted }}
            >
              {plantType}
            </p>
            <h2 
              id="project-title"
              className="text-2xl font-medium leading-tight"
            >
              {project.title}
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
        
        {/* Description */}
        <p 
          className="text-sm leading-relaxed mb-6"
          style={{ color: GARDEN_PALETTE.textMuted }}
        >
          {project.description}
        </p>
        
        {/* Tech Stack */}
        <div className="mb-6">
          <p 
            className="text-xs uppercase tracking-wider mb-2"
            style={{ color: GARDEN_PALETTE.textMuted }}
          >
            Technologies
          </p>
          <div className="flex flex-wrap gap-2">
            {project.techStack.map((tech, i) => (
              <span
                key={i}
                className="px-3 py-1 text-xs rounded-full bg-black/5"
                style={{ color: GARDEN_PALETTE.text }}
              >
                {tech}
              </span>
            ))}
          </div>
        </div>
        
        {/* Meta info */}
        <div className="flex items-center gap-4 mb-6 text-xs" style={{ color: GARDEN_PALETTE.textMuted }}>
          <span>{project.monthsDuration} {project.monthsDuration === 1 ? 'month' : 'months'}</span>
          <span>•</span>
          <span>{new Date(project.date).toLocaleDateString('en-US', { year: 'numeric', month: 'short' })}</span>
          {project.featured && (
            <>
              <span>•</span>
              <span className="text-amber-600">Featured</span>
            </>
          )}
        </div>
        
        {/* Links */}
        <div className="flex gap-3">
          {project.liveUrl && (
            <a
              href={project.liveUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="flex-1 px-4 py-2.5 text-sm text-center rounded-lg transition-colors"
              style={{ 
                backgroundColor: GARDEN_PALETTE.text,
                color: '#fff'
              }}
            >
              View Live
            </a>
          )}
          {project.githubUrl && (
            <a
              href={project.githubUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="flex-1 px-4 py-2.5 text-sm text-center border rounded-lg hover:bg-black/5 transition-colors"
              style={{ 
                borderColor: GARDEN_PALETTE.text,
                color: GARDEN_PALETTE.text
              }}
            >
              GitHub
            </a>
          )}
        </div>
        
        {/* Keyboard hint */}
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




