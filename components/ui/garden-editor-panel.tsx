'use client';

import { useMemo, useState } from 'react';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import { useGardenEditor } from '@/lib/context/garden-editor-context';
import {
  GARDEN_PALETTE,
  type GardenProject,
  type PlantType,
  type ProjectType,
} from '@/lib/data/garden-portfolio';
import {
  featuredProjects,
  getFeaturedProjectBySlug,
  type FeaturedProject,
} from '@/lib/data/featured-projects';
import { displayProjectYear } from '@/lib/utils/display-project-year';

// ------------------------------------------------------------
// Constants
// ------------------------------------------------------------

const PLANT_TYPES: { value: PlantType; label: string; icon: string }[] = [
  { value: 'tree', label: 'Tree', icon: '🌳' },
  { value: 'flower', label: 'Flower', icon: '🌸' },
  { value: 'niwaki', label: 'Niwaki', icon: '🌲' },
  { value: 'bamboo', label: 'Bamboo', icon: '🎋' },
];

// Maps a featured-project category into a rough garden "type". Used to pick
// sensible procedural-plant defaults (complexity, duration hints, etc.) when
// you plant a project into the garden without hand-tweaking every field.
function categoryToType(category: string): ProjectType {
  const lower = category.toLowerCase();
  if (lower.includes('game') || lower.includes('visual novel') || lower.includes('walking sim')) {
    return 'game';
  }
  if (lower.includes('design') || lower.includes('brand')) return 'design';
  if (lower.includes('experiment') || lower.includes('lab')) return 'experiment';
  return 'web';
}

function randomPosition(): [number, number, number] {
  return [Math.random() * 6 - 3, 0, Math.random() * 6 - 3];
}

function todayISO(): string {
  return new Date().toISOString().split('T')[0];
}

function defaultColors() {
  return {
    branch: GARDEN_PALETTE.stems[0],
    leaf: GARDEN_PALETTE.leaves[0],
    flower: GARDEN_PALETTE.leaves[4],
  };
}

// Build a GardenProject payload from a featured project. The project's data
// gets copied in so the plant's procedural appearance is stable even if the
// project list changes later.
function buildProjectPlant(project: FeaturedProject): Omit<GardenProject, 'id'> {
  const year = parseInt(project.year, 10);
  const isoDate = Number.isFinite(year) ? `${year}-01-01` : todayISO();
  return {
    title: project.title,
    description: project.tagline,
    type: categoryToType(project.category),
    techStack: project.techStack ?? [],
    monthsDuration: 3,
    featured: project.hasCaseStudy,
    liveUrl: project.liveUrl,
    date: isoDate,
    position: randomPosition(),
    colors: defaultColors(),
    projectSlug: project.slug,
  };
}

function buildEmptyPlant(): Omit<GardenProject, 'id'> {
  return {
    title: 'Untitled sprout',
    description: '',
    type: 'experiment',
    techStack: [],
    monthsDuration: 2,
    featured: false,
    date: todayISO(),
    position: randomPosition(),
    colors: defaultColors(),
    isEmpty: true,
  };
}

// ------------------------------------------------------------
// Main panel
// ------------------------------------------------------------

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

  const [pickerOpen, setPickerOpen] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  const selectedProject = projects.find((p) => p.id === selectedProjectId) ?? null;

  // Close the add-picker whenever we open a selection, and vice versa.
  const openPicker = () => {
    selectProject(null);
    setPickerOpen(true);
    setShowDeleteConfirm(false);
  };

  const closePicker = () => setPickerOpen(false);

  const handleAddEmpty = () => {
    addProject(buildEmptyPlant());
    setPickerOpen(false);
  };

  const handleAddFromProject = (project: FeaturedProject) => {
    addProject(buildProjectPlant(project));
    setPickerOpen(false);
  };

  const handleDelete = () => {
    if (selectedProjectId) {
      deleteProject(selectedProjectId);
      setShowDeleteConfirm(false);
    }
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
            Press E or Esc to exit · Click plant to select
          </p>
        </div>

        <div className="flex-1 overflow-y-auto p-4">
          {pickerOpen ? (
            <ProjectPickerView
              plantedSlugs={new Set(
                projects.map((p) => p.projectSlug).filter(Boolean) as string[],
              )}
              onPickEmpty={handleAddEmpty}
              onPickProject={handleAddFromProject}
              onCancel={closePicker}
            />
          ) : selectedProject ? (
            <SelectedPlantView
              key={selectedProject.id}
              plant={selectedProject}
              onUpdate={(updates) => updateProject(selectedProject.id, updates)}
              onClose={() => selectProject(null)}
              showDeleteConfirm={showDeleteConfirm}
              onRequestDelete={() => setShowDeleteConfirm(true)}
              onCancelDelete={() => setShowDeleteConfirm(false)}
              onConfirmDelete={handleDelete}
            />
          ) : (
            <PlantListView
              plants={projects}
              onSelect={(id) => selectProject(id)}
              onOpenPicker={openPicker}
            />
          )}
        </div>
      </motion.div>
    </AnimatePresence>
  );
}

// ------------------------------------------------------------
// Sub-views
// ------------------------------------------------------------

function PlantListView({
  plants,
  onSelect,
  onOpenPicker,
}: {
  plants: GardenProject[];
  onSelect: (id: string) => void;
  onOpenPicker: () => void;
}) {
  const linkedCount = plants.filter((p) => p.projectSlug).length;
  const emptyCount = plants.length - linkedCount;

  return (
    <>
      <button
        onClick={onOpenPicker}
        className="w-full py-3 px-4 mb-4 border-2 border-dashed border-[#4A4540] rounded-lg text-[#8B8580] hover:border-[#9DB5A0] hover:text-[#9DB5A0] transition-colors"
      >
        + Add Plant
      </button>

      <div className="space-y-2">
        <h3 className="text-sm font-semibold text-[#8B8580] uppercase tracking-wider mb-3">
          Your Plants ({plants.length})
          <span className="block text-[10px] font-normal tracking-normal normal-case text-[#6B6560] mt-1">
            {linkedCount} linked · {emptyCount} decorative
          </span>
        </h3>
        {plants.length === 0 && (
          <p className="text-xs text-[#6B6560]">
            Nothing growing yet. Plant your first seed above.
          </p>
        )}
        {plants.map((plant) => {
          const linked = plant.projectSlug
            ? getFeaturedProjectBySlug(plant.projectSlug)
            : null;
          const displayTitle = linked?.title ?? plant.title;
          const subtitle = linked
            ? linked.category
            : plant.isEmpty
              ? 'Decorative plant'
              : (plant.techStack.slice(0, 3).join(', ') || '—');

          return (
            <button
              key={plant.id}
              onClick={() => onSelect(plant.id)}
              className="w-full text-left p-3 rounded-lg bg-[#3A3530] hover:bg-[#4A4540] transition-colors"
            >
              <div className="flex items-center gap-2">
                <span>
                  {PLANT_TYPES.find((t) => t.value === plant.plantType)?.icon ??
                    (linked ? '🪴' : '🌱')}
                </span>
                <span className="font-medium truncate">{displayTitle}</span>
                {linked && (
                  <span className="ml-auto text-[10px] uppercase tracking-wider text-[#9DB5A0]">
                    linked
                  </span>
                )}
                {plant.isEmpty && (
                  <span className="ml-auto text-[10px] uppercase tracking-wider text-[#6B6560]">
                    empty
                  </span>
                )}
              </div>
              <div className="text-xs text-[#8B8580] mt-1 truncate">{subtitle}</div>
            </button>
          );
        })}
      </div>
    </>
  );
}

function ProjectPickerView({
  plantedSlugs,
  onPickEmpty,
  onPickProject,
  onCancel,
}: {
  plantedSlugs: Set<string>;
  onPickEmpty: () => void;
  onPickProject: (project: FeaturedProject) => void;
  onCancel: () => void;
}) {
  const sorted = useMemo(
    () =>
      [...featuredProjects].sort((a, b) =>
        Number(plantedSlugs.has(a.slug)) - Number(plantedSlugs.has(b.slug)),
      ),
    [plantedSlugs],
  );

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-semibold text-[#9DB5A0] uppercase tracking-wider">
          Plant a seed
        </h3>
        <button
          onClick={onCancel}
          className="text-xs text-[#8B8580] hover:text-[#E8E4D5]"
        >
          Cancel
        </button>
      </div>

      <button
        onClick={onPickEmpty}
        className="w-full py-3 px-4 border-2 border-dashed border-[#4A4540] rounded-lg text-[#8B8580] hover:border-[#9DB5A0] hover:text-[#9DB5A0] transition-colors text-left"
      >
        <div className="flex items-center gap-2">
          <span>🌱</span>
          <span className="font-medium">Empty plant</span>
        </div>
        <div className="text-xs text-[#6B6560] mt-1">
          Decorative — just something pretty in the garden.
        </div>
      </button>

      <div>
        <p className="text-xs text-[#8B8580] uppercase tracking-wider mb-2">
          From projects
        </p>
        <div className="space-y-2">
          {sorted.map((project) => {
            const alreadyPlanted = plantedSlugs.has(project.slug);
            return (
              <button
                key={project.slug}
                onClick={() => onPickProject(project)}
                className="w-full text-left p-3 rounded-lg bg-[#3A3530] hover:bg-[#4A4540] transition-colors group"
              >
                <div className="flex items-center justify-between gap-2">
                  <span className="font-medium truncate">{project.title}</span>
                  <div className="flex items-center gap-2 shrink-0">
                    {alreadyPlanted && (
                      <span className="text-[10px] uppercase tracking-wider text-[#9DB5A0]">
                        planted
                      </span>
                    )}
                    <span className="text-[10px] uppercase tracking-wider text-[#6B6560]">
                      {displayProjectYear(project.year)}
                    </span>
                  </div>
                </div>
                <div className="text-xs text-[#8B8580] mt-1 truncate">
                  {project.category}
                </div>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}

function SelectedPlantView({
  plant,
  onUpdate,
  onClose,
  showDeleteConfirm,
  onRequestDelete,
  onCancelDelete,
  onConfirmDelete,
}: {
  plant: GardenProject;
  onUpdate: (updates: Partial<GardenProject>) => void;
  onClose: () => void;
  showDeleteConfirm: boolean;
  onRequestDelete: () => void;
  onCancelDelete: () => void;
  onConfirmDelete: () => void;
}) {
  const linkedProject = plant.projectSlug
    ? getFeaturedProjectBySlug(plant.projectSlug)
    : null;

  const [picking, setPicking] = useState(false);
  const plantedSlugs = useMemo(() => new Set<string>(), []); // not relevant here

  const displayTitle = linkedProject?.title ?? plant.title;
  const effectivePlantType: PlantType | undefined = plant.plantType;

  const updateColor = (key: 'branch' | 'leaf' | 'flower', value: string) => {
    onUpdate({
      colors: {
        ...plant.colors,
        [key]: value,
      },
    });
  };

  if (picking) {
    return (
      <ProjectPickerView
        plantedSlugs={plantedSlugs}
        onPickEmpty={() => {
          onUpdate({ projectSlug: undefined, isEmpty: true });
          setPicking(false);
        }}
        onPickProject={(project) => {
          onUpdate({
            projectSlug: project.slug,
            isEmpty: false,
            title: project.title,
            description: project.tagline,
            type: categoryToType(project.category),
            techStack: project.techStack ?? plant.techStack,
            liveUrl: project.liveUrl,
            featured: project.hasCaseStudy,
          });
          setPicking(false);
        }}
        onCancel={() => setPicking(false)}
      />
    );
  }

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between gap-2">
        <h3 className="text-sm font-semibold text-[#9DB5A0] uppercase tracking-wider truncate">
          {displayTitle}
        </h3>
        <button
          onClick={onClose}
          className="text-xs text-[#8B8580] hover:text-[#E8E4D5] shrink-0"
        >
          Back
        </button>
      </div>

      <div className="rounded-lg bg-[#1F1C18] border border-[#3A3530] p-3">
        {linkedProject ? (
          <div className="space-y-2">
            <div className="flex items-center gap-2 text-[10px] uppercase tracking-wider text-[#9DB5A0]">
              <span>●</span>
              <span>Linked project</span>
            </div>
            <p className="text-sm font-medium">{linkedProject.title}</p>
            <p className="text-xs text-[#8B8580]">{linkedProject.category} · {displayProjectYear(linkedProject.year)}</p>
            <div className="flex flex-wrap gap-2 pt-1">
              {linkedProject.hasCaseStudy && (
                <Link
                  href={`/projects/${linkedProject.slug}`}
                  className="text-xs px-2 py-1 rounded bg-[#9DB5A0] text-[#1A1815] hover:bg-[#B5C4A8] transition-colors"
                >
                  Open case study
                </Link>
              )}
              <button
                onClick={() => setPicking(true)}
                className="text-xs px-2 py-1 rounded bg-[#3A3530] hover:bg-[#4A4540] transition-colors"
              >
                Change project
              </button>
              <button
                onClick={() =>
                  onUpdate({
                    projectSlug: undefined,
                    isEmpty: true,
                    title: 'Untitled sprout',
                    description: '',
                  })
                }
                className="text-xs px-2 py-1 rounded text-[#8B8580] hover:text-[#E8E4D5] transition-colors"
              >
                Unlink
              </button>
            </div>
          </div>
        ) : (
          <div className="space-y-2">
            <div className="flex items-center gap-2 text-[10px] uppercase tracking-wider text-[#6B6560]">
              <span>○</span>
              <span>Empty plant</span>
            </div>
            <p className="text-xs text-[#8B8580]">
              Decorative only. Link a project to turn this into a clickable
              portfolio plant.
            </p>
            <button
              onClick={() => setPicking(true)}
              className="text-xs px-2 py-1 rounded bg-[#9DB5A0] text-[#1A1815] hover:bg-[#B5C4A8] transition-colors"
            >
              Link to a project
            </button>
          </div>
        )}
      </div>

      <div>
        <label className="block text-xs text-[#8B8580] mb-2 uppercase tracking-wider">
          Plant type
        </label>
        <div className="grid grid-cols-4 gap-1">
          <button
            onClick={() => onUpdate({ plantType: undefined })}
            className={`p-2 rounded text-center text-[10px] transition-colors ${
              !effectivePlantType
                ? 'bg-[#9DB5A0] text-[#1A1815]'
                : 'bg-[#3A3530] hover:bg-[#4A4540]'
            }`}
            title="Auto (based on project type)"
          >
            auto
          </button>
          {PLANT_TYPES.map((type) => (
            <button
              key={type.value}
              onClick={() => onUpdate({ plantType: type.value })}
              className={`p-2 rounded text-center transition-colors ${
                effectivePlantType === type.value
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

      <div>
        <label className="block text-xs text-[#8B8580] mb-2 uppercase tracking-wider">
          Colors
        </label>
        <div className="grid grid-cols-3 gap-2">
          <div>
            <label className="block text-[10px] text-[#6B6560] mb-1">Branch</label>
            <input
              type="color"
              value={plant.colors?.branch ?? GARDEN_PALETTE.stems[0]}
              onChange={(e) => updateColor('branch', e.target.value)}
              className="w-full h-8 rounded cursor-pointer"
            />
          </div>
          <div>
            <label className="block text-[10px] text-[#6B6560] mb-1">Leaf</label>
            <input
              type="color"
              value={plant.colors?.leaf ?? GARDEN_PALETTE.leaves[0]}
              onChange={(e) => updateColor('leaf', e.target.value)}
              className="w-full h-8 rounded cursor-pointer"
            />
          </div>
          <div>
            <label className="block text-[10px] text-[#6B6560] mb-1">Flower</label>
            <input
              type="color"
              value={plant.colors?.flower ?? GARDEN_PALETTE.leaves[4]}
              onChange={(e) => updateColor('flower', e.target.value)}
              className="w-full h-8 rounded cursor-pointer"
            />
          </div>
        </div>
      </div>

      <div>
        <label className="block text-xs text-[#8B8580] mb-1 uppercase tracking-wider">
          Size: {plant.monthsDuration} month{plant.monthsDuration !== 1 ? 's' : ''}
        </label>
        <input
          type="range"
          min={1}
          max={12}
          value={plant.monthsDuration}
          onChange={(e) =>
            onUpdate({ monthsDuration: parseInt(e.target.value, 10) })
          }
          className="w-full accent-[#9DB5A0]"
        />
        <p className="text-[10px] text-[#6B6560] mt-1">
          Drives plant height and branch complexity.
        </p>
      </div>

      <div className="flex items-center gap-2 pt-1">
        <input
          id="plant-featured"
          type="checkbox"
          checked={plant.featured}
          onChange={(e) => onUpdate({ featured: e.target.checked })}
          className="accent-[#9DB5A0]"
        />
        <label htmlFor="plant-featured" className="text-xs">
          Glow (featured plant)
        </label>
      </div>

      <div className="pt-3 border-t border-[#3A3530]">
        {!showDeleteConfirm ? (
          <button
            onClick={onRequestDelete}
            className="w-full py-2 text-red-400 hover:text-red-300 text-sm transition-colors"
          >
            Delete plant
          </button>
        ) : (
          <div className="flex gap-2">
            <button
              onClick={onConfirmDelete}
              className="flex-1 py-2 bg-red-600 text-white rounded text-sm hover:bg-red-500 transition-colors"
            >
              Confirm delete
            </button>
            <button
              onClick={onCancelDelete}
              className="px-4 py-2 bg-[#3A3530] rounded text-sm hover:bg-[#4A4540] transition-colors"
            >
              Cancel
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

// ------------------------------------------------------------
// Edit Mode Badge (unchanged — still the top-left toggle chip)
// ------------------------------------------------------------

export function EditModeBadge() {
  const { isEditMode, isAuthorized, isSaving, hasUnsavedChanges, toggleEditMode, signOut } =
    useGardenEditor();

  // Don't show anything until the owner is in edit mode. No "Press E"
  // hint, no toggle pill - the feature is invisible to visitors.
  if (!isEditMode) return null;

  return (
    <div className="fixed top-4 left-4 z-50 flex items-center gap-2">
      <button
        onClick={() => {
          void toggleEditMode();
        }}
        className="px-3 py-1.5 rounded-full text-sm font-medium transition-all bg-[#9DB5A0] text-[#1A1815]"
        style={{ fontFamily: 'monospace' }}
      >
        <span className="flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-green-600 animate-pulse" />
          Editing
          {isSaving && ' · Saving...'}
          {!isSaving && hasUnsavedChanges && ' · Unsaved'}
        </span>
      </button>
      {isAuthorized && (
        <button
          onClick={signOut}
          className="px-2 py-1 rounded-full text-[11px] font-medium bg-[#2A2520] text-[#8B8580] hover:text-[#E8E4D5] transition-colors"
          style={{ fontFamily: 'monospace' }}
          title="Forget owner token on this device"
        >
          lock
        </button>
      )}
    </div>
  );
}
