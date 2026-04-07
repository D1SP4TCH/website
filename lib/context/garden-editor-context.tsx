'use client';

import React, {
  createContext,
  useContext,
  useState,
  useCallback,
  useEffect,
  useRef,
} from 'react';
import { GardenProject, sampleProjects } from '@/lib/data/garden-portfolio';

interface GardenEditorContextType {
  // State
  isEditMode: boolean;
  projects: GardenProject[];
  selectedProjectId: string | null;
  isSaving: boolean;
  hasUnsavedChanges: boolean;
  
  // Actions
  toggleEditMode: () => void;
  setEditMode: (mode: boolean) => void;
  selectProject: (id: string | null) => void;
  addProject: (project: Omit<GardenProject, 'id'>) => void;
  updateProject: (id: string, updates: Partial<GardenProject>) => void;
  deleteProject: (id: string) => void;
  moveProject: (id: string, position: [number, number, number]) => void;
  saveNow: () => Promise<void>;
}

const GardenEditorContext = createContext<GardenEditorContextType | null>(null);

export function useGardenEditor() {
  const context = useContext(GardenEditorContext);
  if (!context) {
    throw new Error('useGardenEditor must be used within GardenEditorProvider');
  }
  return context;
}

// Optional hook that doesn't throw if not in provider
export function useGardenEditorOptional() {
  return useContext(GardenEditorContext);
}

interface GardenEditorProviderProps {
  children: React.ReactNode;
}

export function GardenEditorProvider({ children }: GardenEditorProviderProps) {
  const [isEditMode, setIsEditMode] = useState(false);
  const [projects, setProjects] = useState<GardenProject[]>(sampleProjects);
  const [selectedProjectId, setSelectedProjectId] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
  const [isLoaded, setIsLoaded] = useState(false);
  
  const saveTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Load projects from API on mount
  useEffect(() => {
    async function loadProjects() {
      try {
        const res = await fetch('/api/garden');
        const data = await res.json();
        if (data.projects && data.projects.length > 0) {
          setProjects(data.projects);
        }
        // If no projects in KV, keep the sample projects
      } catch (error) {
        console.error('Failed to load projects from API:', error);
        // Keep sample projects on error
      } finally {
        setIsLoaded(true);
      }
    }
    loadProjects();
  }, []);

  // Auto-save with debounce
  const saveToAPI = useCallback(async (projectsToSave: GardenProject[]) => {
    setIsSaving(true);
    try {
      const res = await fetch('/api/garden', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ projects: projectsToSave }),
      });
      if (!res.ok) throw new Error('Save failed');
      setHasUnsavedChanges(false);
    } catch (error) {
      console.error('Failed to save projects:', error);
    } finally {
      setIsSaving(false);
    }
  }, []);

  // Debounced save trigger
  const triggerSave = useCallback((projectsToSave: GardenProject[]) => {
    if (!isLoaded) return; // Don't save before initial load
    
    setHasUnsavedChanges(true);
    if (saveTimeoutRef.current) {
      clearTimeout(saveTimeoutRef.current);
    }
    saveTimeoutRef.current = setTimeout(() => {
      saveToAPI(projectsToSave);
    }, 1000); // 1 second debounce
  }, [saveToAPI, isLoaded]);

  // Manual save
  const saveNow = useCallback(async () => {
    if (saveTimeoutRef.current) {
      clearTimeout(saveTimeoutRef.current);
    }
    await saveToAPI(projects);
  }, [saveToAPI, projects]);

  // Toggle edit mode
  const toggleEditMode = useCallback(() => {
    setIsEditMode(prev => !prev);
    if (isEditMode) {
      setSelectedProjectId(null);
    }
  }, [isEditMode]);

  const setEditMode = useCallback((mode: boolean) => {
    setIsEditMode(mode);
    if (!mode) {
      setSelectedProjectId(null);
    }
  }, []);

  // Select a project
  const selectProject = useCallback((id: string | null) => {
    setSelectedProjectId(id);
  }, []);

  // Generate unique ID
  const generateId = () => {
    return `project-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  };

  // Add a new project
  const addProject = useCallback((project: Omit<GardenProject, 'id'>) => {
    const newProject: GardenProject = {
      ...project,
      id: generateId(),
    };
    setProjects(prev => {
      const updated = [...prev, newProject];
      triggerSave(updated);
      return updated;
    });
    setSelectedProjectId(newProject.id);
  }, [triggerSave]);

  // Update an existing project
  const updateProject = useCallback((id: string, updates: Partial<GardenProject>) => {
    setProjects(prev => {
      const updated = prev.map(p => 
        p.id === id ? { ...p, ...updates } : p
      );
      triggerSave(updated);
      return updated;
    });
  }, [triggerSave]);

  // Delete a project
  const deleteProject = useCallback((id: string) => {
    setProjects(prev => {
      const updated = prev.filter(p => p.id !== id);
      triggerSave(updated);
      return updated;
    });
    if (selectedProjectId === id) {
      setSelectedProjectId(null);
    }
  }, [selectedProjectId, triggerSave]);

  // Move a project (update position)
  const moveProject = useCallback((id: string, position: [number, number, number]) => {
    updateProject(id, { position });
  }, [updateProject]);

  // Keyboard shortcut for edit mode
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Don't trigger if typing in an input
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) {
        return;
      }
      
      if (e.key === 'e' || e.key === 'E') {
        toggleEditMode();
      }
      
      if (e.key === 'Escape') {
        if (selectedProjectId) {
          setSelectedProjectId(null);
        } else if (isEditMode) {
          setIsEditMode(false);
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [toggleEditMode, selectedProjectId, isEditMode]);

  const value: GardenEditorContextType = {
    isEditMode,
    projects,
    selectedProjectId,
    isSaving,
    hasUnsavedChanges,
    toggleEditMode,
    setEditMode,
    selectProject,
    addProject,
    updateProject,
    deleteProject,
    moveProject,
    saveNow,
  };

  return (
    <GardenEditorContext.Provider value={value}>
      {children}
    </GardenEditorContext.Provider>
  );
}



