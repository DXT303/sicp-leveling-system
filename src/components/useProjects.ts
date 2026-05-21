import { useState, useEffect } from 'react';

export interface Project {
  id: number;
  name: string;
  instrument: string;
  bmElevation: string;
  method: string;
  distanceK: string;
  progress: number;
  status: 'active' | 'completed' | 'pending';
  createdAt: string;
}

const STORAGE_KEY = 'sicp_projects';

export function useProjects() {
  const [projects, setProjects] = useState<Project[]>(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      return stored ? JSON.parse(stored) : [];
    } catch {
      return [];
    }
  });

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(projects));
  }, [projects]);

  const addProject = (data: Omit<Project, 'id' | 'progress' | 'status' | 'createdAt'>) => {
    const newProject: Project = {
      ...data,
      id: Date.now(),
      progress: 0,
      status: 'active',
      createdAt: new Date().toLocaleDateString(),
    };
    setProjects(prev => [newProject, ...prev]);
    return newProject;
  };

  const deleteProject = (id: number) => {
    setProjects(prev => prev.filter(p => p.id !== id));
  };

  const updateProject = (id: number, data: Partial<Omit<Project, 'id' | 'createdAt'>>) => {
    setProjects(prev => prev.map(p => p.id === id ? { ...p, ...data } : p));
  };

  return { projects, addProject, deleteProject, updateProject };
}
