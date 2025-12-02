"use client";

import { useEffect, useState } from "react";
import { getProgramsByFaculty } from "@/services/programService";

export function useProgramsByFaculty(facultyId: string | null) {
  const [programs, setPrograms] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!facultyId) return;

    const load = async () => {
      setLoading(true);
      try {
        const data = await getProgramsByFaculty(facultyId);
        setPrograms(data);
      } finally {
        setLoading(false);
      }
    };

    load();
  }, [facultyId]);

  return { programs, loading };
}
