// hooks/usePrograms.ts
"use client";

import { useState, useEffect, useCallback } from "react";
import {
  getPrograms,
  createProgram,
  updateProgram,
  deleteProgram,
  assignDirector,
} from "@/services/programService";

export const usePrograms = () => {
  const [programs, setPrograms] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const loadPrograms = useCallback(async () => {
    try {
      setLoading(true);
      const data = await getPrograms();
      setPrograms(data);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadPrograms();
  }, [loadPrograms]);

  const create = async (data: any) => {
    const newProgram = await createProgram(data);
    setPrograms((prev) => [newProgram, ...prev]);
  };

  const update = async (id: string, data: any) => {
    const updated = await updateProgram(id, data);
    setPrograms((prev) => prev.map((p) => (p._id === id ? updated : p)));
  };

  const remove = async (id: string) => {
    await deleteProgram(id);
    setPrograms((prev) => prev.filter((p) => p._id !== id));
  };

  const assignDir = async (programId: string, directorId: string) => {
    const updated = await assignDirector(programId, directorId);
    setPrograms((prev) =>
      prev.map((p) => (p._id === programId ? updated : p))
    );
  };

  return {
    programs,
    loading,
    create,
    update,
    remove,
    assignDir,
    reload: loadPrograms,
  };
};
