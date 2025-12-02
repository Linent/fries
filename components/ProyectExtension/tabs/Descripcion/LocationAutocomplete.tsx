"use client";

import { useState, useMemo } from "react";
import { Input, Listbox, ListboxItem, Spinner, Card } from "@heroui/react";
import colombiaData from "@/types/colombia.json"; // asegúrate de tenerlo aquí

interface Props {
  value: string;
  onChange: (value: string) => void;
  label?: string;
}

export default function LocationAutocomplete({ value, onChange, label }: Props) {
  const [query, setQuery] = useState("");

  // 🔎 Buscar ciudades/departamentos según el texto
  const results = useMemo(() => {
    if (!query.trim()) return [];

    const q = query.toLowerCase();

    return colombiaData
      .flatMap((dept: any) =>
        dept.ciudades.map((city: string) => ({
          city,
          department: dept.departamento,
          full: `${city}, ${dept.departamento}`,
        }))
      )
      .filter((item) => item.full.toLowerCase().includes(q))
      .slice(0, 12); // máximo 12 sugerencias
  }, [query]);

  return (
    <div className="relative w-full">
      <Input
        label={label || "Ubicación geográfica"}
        placeholder="Ej: Cúcuta, Norte de Santander"
        value={value}
        onValueChange={(txt) => {
          onChange(txt);
          setQuery(txt);
        }}
        autoComplete="off"
      />

      {/* Sugerencias */}
      {query.length > 0 && results.length > 0 && (
        <Card className="absolute z-20 w-full mt-1 shadow-lg border border-gray-200">
          <Listbox
            aria-label="Sugerencias de ubicaciones"
            emptyContent="No hay coincidencias"
          >
            {results.map((item, idx) => (
              <ListboxItem
                key={idx}
                onPress={() => {
                  onChange(item.full);
                  setQuery("");
                }}
              >
                {item.city} — <span className="text-gray-500">{item.department}</span>
              </ListboxItem>
            ))}
          </Listbox>
        </Card>
      )}
    </div>
  );
}
