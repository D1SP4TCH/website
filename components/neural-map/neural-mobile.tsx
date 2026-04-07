'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { createSampleData } from '@/lib/neural-map-data';

export const NeuralMobile = () => {
  const router = useRouter();
  const { nodes } = createSampleData();
  const [expandedSection, setExpandedSection] = useState<string | null>(null);

  const sections = nodes.filter((n) => n.type === 'section');
  const projects = nodes.filter((n) => n.type === 'project');
  const skills = nodes.filter((n) => n.type === 'skill');
  const center = nodes.find((n) => n.type === 'center');

  const handleNavigate = (url?: string) => {
    if (url) router.push(url);
  };

  return (
    <div className="min-h-screen bg-white text-black p-6 overflow-y-auto">
      {/* Header */}
      <div className="text-center mb-12 pt-8">
        <div className="w-24 h-24 mx-auto mb-4 rounded-full bg-gradient-to-br from-purple-500 to-blue-500 flex items-center justify-center text-4xl">
          {center?.icon || '👤'}
        </div>
        <h1 className="text-4xl font-bold bg-gradient-to-r from-purple-400 via-blue-400 to-cyan-400 bg-clip-text text-transparent mb-2">
          {center?.title}
        </h1>
        <p className="text-gray-600">{center?.description}</p>
      </div>

      {/* Sections */}
      <div className="space-y-4 max-w-2xl mx-auto">
        {sections.map((section) => {
          const isExpanded = expandedSection === section.id;
          const relatedProjects = projects.filter((p) =>
            p.connections.includes(section.id)
          );

          return (
            <div
              key={section.id}
              className="bg-gradient-to-br from-purple-500/10 to-blue-500/10 border border-purple-500/30 rounded-xl overflow-hidden"
            >
              <button
                onClick={() =>
                  section.url
                    ? handleNavigate(section.url)
                    : setExpandedSection(isExpanded ? null : section.id)
                }
                className="w-full p-6 flex items-center justify-between hover:bg-white/5 transition-colors"
              >
                <div className="flex items-center gap-4">
                  <div
                    className="w-16 h-16 rounded-full flex items-center justify-center text-3xl"
                    style={{ backgroundColor: `${section.color}20` }}
                  >
                    {section.icon}
                  </div>
                  <div className="text-left">
                    <h3 className="text-xl font-bold">{section.title}</h3>
                    {section.description && (
                      <p className="text-gray-600 text-sm">{section.description}</p>
                    )}
                  </div>
                </div>
                {relatedProjects.length > 0 && (
                  <svg
                    className={`w-6 h-6 transition-transform ${isExpanded ? 'rotate-180' : ''}`}
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M19 9l-7 7-7-7"
                    />
                  </svg>
                )}
              </button>

              {/* Expanded Content */}
              {isExpanded && relatedProjects.length > 0 && (
                <div className="border-t border-purple-500/30 p-4 space-y-3">
                  {relatedProjects.map((project) => {
                    const projectSkills = skills.filter((s) =>
                      project.connections.includes(s.id)
                    );

                    return (
                      <div
                        key={project.id}
                        onClick={() => handleNavigate(project.url)}
                        className="bg-gray-100 rounded-lg p-4 cursor-pointer hover:bg-gray-200 transition-colors"
                      >
                        <h4 className="font-semibold mb-1">{project.title}</h4>
                        {project.description && (
                          <p className="text-gray-600 text-sm mb-3">{project.description}</p>
                        )}
                        {projectSkills.length > 0 && (
                          <div className="flex flex-wrap gap-2">
                            {projectSkills.map((skill) => (
                              <span
                                key={skill.id}
                                className="px-2 py-1 bg-cyan-500/20 border border-cyan-500/30 rounded text-xs text-cyan-400"
                              >
                                {skill.icon} {skill.title}
                              </span>
                            ))}
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Skills Grid */}
      <div className="mt-12 max-w-2xl mx-auto">
        <h2 className="text-2xl font-bold mb-6 text-center">Skills & Technologies</h2>
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
          {skills.map((skill) => (
            <div
              key={skill.id}
              className="bg-gradient-to-br from-cyan-500/10 to-blue-500/10 border border-cyan-500/30 rounded-lg p-4 text-center hover:scale-105 transition-transform"
            >
              <div className="text-3xl mb-2">{skill.icon}</div>
              <div className="text-sm font-medium">{skill.title}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Footer Note */}
      <div className="mt-12 text-center text-gray-600 text-sm max-w-2xl mx-auto">
        <p>💡 View on desktop for an interactive neural network experience</p>
      </div>
    </div>
  );
};

