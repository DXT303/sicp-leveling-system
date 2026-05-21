import { useState, useEffect } from 'react';

export interface Project {
  id: number;
  name: string;
  instrument: string;
  bm_elevation: string;
  method: string;
  distance_k: string;
  progress: number;
  status: 'active' | 'completed' | 'pending';
  created_at: string;
}

export function useProjects() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/projects')
      .then(r => r.json())
      .then(setProjects)
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  const addProject = async (data: { name: string; instrument: string; bmElevation: string; method: string; distanceK: string }) => {
    const res = await fetch('/api/projects', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    const newProject = await res.json();
    setProjects(prev => [newProject, ...prev]);
    return newProject;
  };

  const deleteProject = async (id: number) => {
    await fetch(`/api/projects/${id}`, { method: 'DELETE' });
    setProjects(prev => prev.filter(p => p.id !== id));
  };

  const updateProject = async (id: number, data: Partial<Omit<Project, 'id' | 'created_at'>>) => {
    await fetch(`/api/projects/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    setProjects(prev => prev.map(p => p.id === id ? { ...p, ...data } : p));
  };

  return { projects, loading, addProject, deleteProject, updateProject };
}
