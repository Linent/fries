"use client";

import { useEffect, useState, useCallback } from "react";
import { getDirectorsProgramRole } from "@/services/userServices";

export const useProgramDirectors = () => {
  const [directors, setDirectors] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    setLoading(true);
    const data = await getDirectorsProgramRole();
    setDirectors(data);
    setLoading(false);
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  return { directors, loading, reloadDirectors: load };
};
