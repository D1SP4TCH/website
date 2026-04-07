'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useGardenEditor } from '@/lib/context/garden-editor-context';
import { GardenProject, ProjectType, GARDEN_PALETTE } from '@/lib/data/garden-portfolio';

const PROJECT_TYPES: { value: ProjectType; label: string; icon: string }[] = [
  { value: 'web', label: 'Web App', icon: '🌐' },
  { value: 'design', label: 'Design', icon: '🎨' },
  { value: 'game', label: 'Game', icon: '🎮' },
  { value: 'experiment', label: 'Experiment', icon: '🧪' },
  { value: 'backend', label: 'Backend', icon: '⚙️' },
];

interface ProjectFormData {
  title: string;
  description: string;
  type: ProjectType;
  techStack: string;
  monthsDuration: number;
  featured: boolean;
  liveUrl: string;
  githubUrl: string;
  branchColor: string;
  leafColor: string;
  flowerColor: string;
}

const defaultFormData: ProjectFormData = {
  title: '',
  description: '',
  type: 'web',
  techStack: '',
  monthsDuration: 1,
  featured: false,
  liveUrl: '',
  githubUrl: '',
  branchColor: GARDEN_PALETTE.stems[0],
  leafColor: GARDEN_PALETTE.leaves[0],
  flowerColor: GARDEN_PALETTE.leaves[4],
};

export function GardenEditorPanel() {
  const {
    isEditMode,
    projects,
    selectedProjectId,
    isSaving,
    hasUnsavedChanges,
    selectProject,
    addProject,
    updateProject,
    deleteProject,
  } = useGardenEditor();

  const [isAddingNew, setIsAddingNew] = useState(false);
  const [formData, setFormData] = useState<ProjectFormData>(defaultFormData);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  const selectedProject = projects.find(p => p.id === selectedProjectId);

  // Update form when selection changes
  useEffect(() => {
    if (selectedProject) {
      setFormData({
        title: selectedProject.title,
        description: selectedProject.description,
        type: selectedProject.type,
        techStack: selectedProject.techStack.join(', '),
        monthsDuration: selectedProject.monthsDuration,
        featured: selectedProject.featured,
        liveUrl: selectedProject.liveUrl || '',
        githubUrl: selectedProject.githubUrl || '',
        branchColor: selectedProject.colors?.branch || GARDEN_PALETTE.stems[0],
        leafColor: selectedProject.colors?.leaf || GARDEN_PALETTE.leaves[0],
        flowerColor: selectedProject.colors?.flower || GARDEN_PALETTE.leaves[4],
      });
      setIsAddingNew(false);
    }
  }, [selectedProject]);

  const handleAddNew = () => {
    selectProject(null);
    setFormData(defaultFormData);
    setIsAddingNew(true);
  };

  const handleSave = () => {
    const projectData: Omit<GardenProject, 'id'> = {
      title: formData.title,
      description: formData.description,
      type: formData.type,
      techStack: formData.techStack.split(',').map(s => s.trim()).filter(Boolean),
      monthsDuration: formData.monthsDuration,
      featured: formData.featured,
      liveUrl: formData.liveUrl || undefined,
      githubUrl: formData.githubUrl || undefined,
      date: new Date().toISOString().split('T')[0],
      position: [
        Math.random() * 6 - 3,
        0,
        Math.random() * 6 - 3,
      ] as [number, number, number],
      colors: {
        branch: formData.branchColor,
        leaf: formData.leafColor,
        flower: formData.flowerColor,
      },
    };

    if (isAddingNew) {
      addProject(projectData);
      setIsAddingNew(false);
    } else if (selectedProjectId) {
      updateProject(selectedProjectId, {
        ...projectData,
        position: selectedProject!.position,
      });
    }
  };

  const handleDelete = () => {
    if (selectedProjectId) {
      deleteProject(selectedProjectId);
      setShowDeleteConfirm(false);
    }
  };

  const handleCancel = () => {
    setIsAddingNew(false);
    selectProject(null);
  };

  if (!isEditMode) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ x: 320, opacity: 0 }}
        animate={{ x: 0, opacity: 1 }}
        exit={{ x: 320, opacity: 0 }}
        transition={{ type: 'spring', damping: 25, stiffness: 200 }}
        className="fixed right-0 top-0 h-full w-80 bg-[#2A2520] text-[#E8E4D5] shadow-2xl z-50 overflow-hidden flex flex-col"
        style={{ fontFamily: 'monospace' }}
      >
        {/* Header */}
        <div className="p-4 border-b border-[#4A4540]">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-bold tracking-wide">Garden Editor</h2>
            <div className="flex items-center gap-2">
              {hasUnsavedChanges && (
                <span className="text-xs text-yellow-400">Unsaved</span>
              )}
              {isSaving && (
                <span className="text-xs text-green-400">Saving...</span>
              )}
            </div>
          </div>
          <p className="text-xs text-[#8B8580] mt-1">
            Press E to toggle · Click plant to select
          </p>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-4">
          {!isAddingNew && !selectedProject && (
            <>
              {/* Project List */}
              <button
                onClick={handleAddNew}
                className="w-full py-3 px-4 mb-4 border-2 border-dashed border-[#4A4540] rounded-lg text-[#8B8580] hover:border-[#9DB5A0] hover:text-[#9DB5A0] transition-colors"
              >
                + Add New Plant
              </button>

              <div className="space-y-2">
                <h3 className="text-sm font-semibold text-[#8B8580] uppercase tracking-wider mb-3">
                  Your Plants ({projects.length})
                </h3>
                {projects.map(project => (
                  <button
                    key={project.id}
                    onClick={() => selectProject(project.id)}
                    className="w-full text-left p-3 rounded-lg bg-[#3A3530] hover:bg-[#4A4540] transition-colors"
                  >
                    <div className="flex items-center gap-2">
                      <span>
                        {PROJECT_TYPES.find(t => t.value === project.type)?.icon}
                      </span>
                      <span className="font-medium truncate">{project.title}</span>
                    </div>
                    <div className="text-xs text-[#8B8580] mt-1">
                      {project.techStack.slice(0, 3).join(', ')}
                    </div>
                  </button>
                ))}
              </div>
            </>
          )}

          {(isAddingNew || selectedProject) && (
            <div className="space-y-4">
              <h3 className="text-sm font-semibold text-[#9DB5A0] uppercase tracking-wider">
                {isAddingNew ? 'New Plant' : 'Edit Plant'}
              </h3>

              {/* Title */}
              <div>
                <label className="block text-xs text-[#8B8580] mb-1">Title</label>
                <input
                  type="text"
                  value={formData.title}
                  onChange={e => setFormData({ ...formData, title: e.target.value })}
                  className="w-full px-3 py-2 bg-[#1A1815] rounded border border-[#4A4540] focus:border-[#9DB5A0] focus:outline-none"
                  placeholder="Project name"
                />
              </div>

              {/* Description */}
              <div>
                <label className="block text-xs text-[#8B8580] mb-1">Description</label>
                <textarea
                  value={formData.description}
                  onChange={e => setFormData({ ...formData, description: e.target.value })}
                  className="w-full px-3 py-2 bg-[#1A1815] rounded border border-[#4A4540] focus:border-[#9DB5A0] focus:outline-none h-20 resize-none"
                  placeholder="What is this project about?"
                />
              </div>

              {/* Type */}
              <div>
                <label className="block text-xs text-[#8B8580] mb-1">Type</label>
                <div className="grid grid-cols-5 gap-1">
                  {PROJECT_TYPES.map(type => (
                    <button
                      key={type.value}
                      onClick={() => setFormData({ ...formData, type: type.value })}
                      className={`p-2 rounded text-center transition-colors ${
                        formData.type === type.value
                          ? 'bg-[#9DB5A0] text-[#1A1815]'
                          : 'bg-[#3A3530] hover:bg-[#4A4540]'
                      }`}
                      title={type.label}
                    >
                      {type.icon}
                    </button>
                  ))}
                </div>
              </div>

              {/* Tech Stack */}
              <div>
                <label className="block text-xs text-[#8B8580] mb-1">
                  Tech Stack (comma-separated)
                </label>
                <input
                  type="text"
                  value={formData.techStack}
                  onChange={e => setFormData({ ...formData, techStack: e.target.value })}
                  className="w-full px-3 py-2 bg-[#1A1815] rounded border border-[#4A4540] focus:border-[#9DB5A0] focus:outline-none"
                  placeholder="React, TypeScript, Three.js"
                />
              </div>

              {/* Duration */}
              <div>
                <label className="block text-xs text-[#8B8580] mb-1">
                  Duration: {formData.monthsDuration} month{formData.monthsDuration !== 1 ? 's' : ''}
                </label>
                <input
                  type="range"
                  min="1"
                  max="12"
                  value={formData.monthsDuration}
                  onChange={e => setFormData({ ...formData, monthsDuration: parseInt(e.target.value) })}
                  className="w-full accent-[#9DB5A0]"
                />
              </div>

              {/* Featured */}
              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="featured"
                  checked={formData.featured}
                  onChange={e => setFormData({ ...formData, featured: e.target.checked })}
                  className="accent-[#9DB5A0]"
                />
                <label htmlFor="featured" className="text-sm">Featured project</label>
              </div>

              {/* Colors */}
              <div>
                <label className="block text-xs text-[#8B8580] mb-2">Colors</label>
                <div className="grid grid-cols-3 gap-2">
                  <div>
                    <label className="block text-xs text-[#6B6560] mb-1">Branch</label>
                    <input
                      type="color"
                      value={formData.branchColor}
                      onChange={e => setFormData({ ...formData, branchColor: e.target.value })}
                      className="w-full h-8 rounded cursor-pointer"
                    />
                  </div>
                  <div>
                    <label className="block text-xs text-[#6B6560] mb-1">Leaf</label>
                    <input
                      type="color"
                      value={formData.leafColor}
                      onChange={e => setFormData({ ...formData, leafColor: e.target.value })}
                      className="w-full h-8 rounded cursor-pointer"
                    />
                  </div>
                  <div>
                    <label className="block text-xs text-[#6B6560] mb-1">Flower</label>
                    <input
                      type="color"
                      value={formData.flowerColor}
                      onChange={e => setFormData({ ...formData, flowerColor: e.target.value })}
                      className="w-full h-8 rounded cursor-pointer"
                    />
                  </div>
                </div>
              </div>

              {/* URLs */}
              <div>
                <label className="block text-xs text-[#8B8580] mb-1">Live URL</label>
                <input
                  type="url"
                  value={formData.liveUrl}
                  onChange={e => setFormData({ ...formData, liveUrl: e.target.value })}
                  className="w-full px-3 py-2 bg-[#1A1815] rounded border border-[#4A4540] focus:border-[#9DB5A0] focus:outline-none text-sm"
                  placeholder="https://..."
                />
              </div>

              <div>
                <label className="block text-xs text-[#8B8580] mb-1">GitHub URL</label>
                <input
                  type="url"
                  value={formData.githubUrl}
                  onChange={e => setFormData({ ...formData, githubUrl: e.target.value })}
                  className="w-full px-3 py-2 bg-[#1A1815] rounded border border-[#4A4540] focus:border-[#9DB5A0] focus:outline-none text-sm"
                  placeholder="https://github.com/..."
                />
              </div>

              {/* Action Buttons */}
              <div className="flex gap-2 pt-4">
                <button
                  onClick={handleSave}
                  disabled={!formData.title}
                  className="flex-1 py-2 bg-[#9DB5A0] text-[#1A1815] rounded font-medium hover:bg-[#B5C4A8] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isAddingNew ? 'Plant' : 'Update'}
                </button>
                <button
                  onClick={handleCancel}
                  className="px-4 py-2 bg-[#3A3530] rounded hover:bg-[#4A4540] transition-colors"
                >
                  Cancel
                </button>
              </div>

              {/* Delete Button */}
              {!isAddingNew && (
                <div className="pt-2">
                  {!showDeleteConfirm ? (
                    <button
                      onClick={() => setShowDeleteConfirm(true)}
                      className="w-full py-2 text-red-400 hover:text-red-300 text-sm transition-colors"
                    >
                      Delete Plant
                    </button>
                  ) : (
                    <div className="flex gap-2">
                      <button
                        onClick={handleDelete}
                        className="flex-1 py-2 bg-red-600 text-white rounded text-sm hover:bg-red-500 transition-colors"
                      >
                        Confirm Delete
                      </button>
                      <button
                        onClick={() => setShowDeleteConfirm(false)}
                        className="px-4 py-2 bg-[#3A3530] rounded text-sm hover:bg-[#4A4540] transition-colors"
                      >
                        Cancel
                      </button>
                    </div>
                  )}
                </div>
              )}
            </div>
          )}
        </div>
      </motion.div>
    </AnimatePresence>
  );
}

// Edit Mode Badge Component
export function EditModeBadge() {
  const { isEditMode, isSaving, hasUnsavedChanges, toggleEditMode } = useGardenEditor();

  return (
    <div className="fixed top-4 left-4 z-50">
      <button
        onClick={toggleEditMode}
        className={`px-3 py-1.5 rounded-full text-sm font-medium transition-all ${
          isEditMode
            ? 'bg-[#9DB5A0] text-[#1A1815]'
            : 'bg-[#2A2520] text-[#E8E4D5] hover:bg-[#3A3530]'
        }`}
        style={{ fontFamily: 'monospace' }}
      >
        {isEditMode ? (
          <span className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-green-600 animate-pulse" />
            Editing
            {isSaving && ' · Saving...'}
            {!isSaving && hasUnsavedChanges && ' · Unsaved'}
          </span>
        ) : (
          'Press E to Edit'
        )}
      </button>
    </div>
  );
}



