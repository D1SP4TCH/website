'use client';

import React, {
  createContext,
  useContext,
  useState,
  useCallback,
  useEffect,
  useRef,
} from 'react';
import {
  GardenProject,
  sampleProjects,
  type ProjectType,
} from '@/lib/data/garden-portfolio';

interface GardenEditorContextType {
  // State
  isEditMode: boolean;
  isAuthorized: boolean;
  projects: GardenProject[];
  selectedProjectId: string | null;
  isSaving: boolean;
  hasUnsavedChanges: boolean;

  // Actions
  toggleEditMode: () => Promise<void> | void;
  setEditMode: (mode: boolean) => Promise<void> | void;
  selectProject: (id: string | null) => void;
  addProject: (project: Omit<GardenProject, 'id'>) => void;
  updateProject: (id: string, updates: Partial<GardenProject>) => void;
  deleteProject: (id: string) => void;
  moveProject: (id: string, position: [number, number, number]) => void;
  saveNow: () => Promise<void>;
  signOut: () => void;
}

const TOKEN_STORAGE_KEY = 'garden:editor-token';

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
  const [editToken, setEditToken] = useState<string | null>(null);

  const saveTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const authPromptInFlightRef = useRef(false);

  // Restore a previously verified owner token from localStorage so the
  // owner doesn't have to re-enter the password on every visit.
  useEffect(() => {
    if (typeof window === 'undefined') return;
    try {
      const stored = window.localStorage.getItem(TOKEN_STORAGE_KEY);
      if (stored) setEditToken(stored);
    } catch {
      // localStorage unavailable (private mode, etc.) - silently ignore.
    }
  }, []);

  // Load projects from API on mount
  useEffect(() => {
    async function loadProjects() {
      try {
        const res = await fetch('/api/garden');
        const data = await res.json();
        if (data.projects && data.projects.length > 0) {
          const normalized = (
            data.projects as Array<GardenProject & { type?: ProjectType | 'backend' }>
          ).map((p) =>
            (p.type as string) === 'backend'
              ? { ...p, type: 'web' as ProjectType }
              : p,
          );
          setProjects(normalized);
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

  // Auto-save with debounce. Requires a verified owner token; without it
  // we never even call the API so non-owners can't probe the endpoint.
  const saveToAPI = useCallback(
    async (projectsToSave: GardenProject[]) => {
      if (!editToken) return;
      setIsSaving(true);
      try {
        const res = await fetch('/api/garden', {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
            'x-edit-token': editToken,
          },
          body: JSON.stringify({ projects: projectsToSave }),
        });
        if (res.status === 404 || res.status === 401) {
          // Token rotated/revoked on the server. Drop it so the next
          // edit attempt re-prompts.
          try {
            window.localStorage.removeItem(TOKEN_STORAGE_KEY);
          } catch {}
          setEditToken(null);
          setIsEditMode(false);
          return;
        }
        if (!res.ok) throw new Error('Save failed');
        setHasUnsavedChanges(false);
      } catch (error) {
        console.error('Failed to save projects:', error);
      } finally {
        setIsSaving(false);
      }
    },
    [editToken],
  );

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

  // Ask the server to validate a password. We never store unverified
  // input - only a server-confirmed token lands in localStorage.
  const requestAuthorization = useCallback(async (): Promise<boolean> => {
    if (typeof window === 'undefined') return false;
    if (authPromptInFlightRef.current) return false;
    authPromptInFlightRef.current = true;
    try {
      // Generic prompt copy on purpose - doesn't reveal what's behind it.
      const password = window.prompt('');
      if (!password) return false;

      const res = await fetch('/api/garden/auth', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ password }),
      });

      if (!res.ok) return false;

      try {
        window.localStorage.setItem(TOKEN_STORAGE_KEY, password);
      } catch {
        // If we can't persist, we still allow the current session.
      }
      setEditToken(password);
      return true;
    } catch {
      return false;
    } finally {
      authPromptInFlightRef.current = false;
    }
  }, []);

  // Toggle edit mode (gated by a verified owner token).
  const toggleEditMode = useCallback(async () => {
    if (!editToken) {
      const ok = await requestAuthorization();
      if (!ok) return;
      setIsEditMode(true);
      return;
    }
    setIsEditMode((prev) => {
      if (prev) setSelectedProjectId(null);
      return !prev;
    });
  }, [editToken, requestAuthorization]);

  const setEditMode = useCallback(
    async (mode: boolean) => {
      if (mode && !editToken) {
        const ok = await requestAuthorization();
        if (!ok) return;
      }
      setIsEditMode(mode);
      if (!mode) {
        setSelectedProjectId(null);
      }
    },
    [editToken, requestAuthorization],
  );

  const signOut = useCallback(() => {
    try {
      window.localStorage.removeItem(TOKEN_STORAGE_KEY);
    } catch {}
    setEditToken(null);
    setIsEditMode(false);
    setSelectedProjectId(null);
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
        void toggleEditMode();
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
    isAuthorized: editToken !== null,
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
    signOut,
  };

  return (
    <GardenEditorContext.Provider value={value}>
      {children}
    </GardenEditorContext.Provider>
  );
}



