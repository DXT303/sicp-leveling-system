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
  deleted_at?: string | null;
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
    if (!res.ok) throw new Error(await res.text());
    const newProject = await res.json();
    setProjects(prev => [newProject, ...prev]);
    return newProject;
  };

  const deleteProject = async (id: number) => {
    const res = await fetch(`/api/projects/${id}`, { method: 'DELETE' });
    if (!res.ok) throw new Error(await res.text());
    setProjects(prev => prev.filter(p => p.id !== id));
  };

  const restoreProject = async (id: number) => {
    const res = await fetch(`/api/projects/${id}?action=restore`, { method: 'POST' });
    if (!res.ok) throw new Error(await res.text());
  };

  const permanentDelete = async (id: number) => {
    const res = await fetch('/api/projects/trash', {
      method: 'DELETE',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id }),
    });
    if (!res.ok) throw new Error(await res.text());
  };

  const fetchTrash = async (): Promise<Project[]> => {
    const res = await fetch('/api/projects/trash');
    if (!res.ok) throw new Error(await res.text());
    return res.json();
  };

  const updateProject = async (id: number, data: Partial<Omit<Project, 'id' | 'created_at'>>) => {
    await fetch(`/api/projects/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    setProjects(prev => prev.map(p => p.id === id ? { ...p, ...data } : p));
  };

  return { projects, loading, addProject, deleteProject, restoreProject, permanentDelete, fetchTrash, updateProject };
}
