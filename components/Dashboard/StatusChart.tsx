"use client";

import { useMemo, useState } from "react";
import { Card, CardBody, CardHeader, Select, SelectItem } from "@heroui/react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  Cell,
} from "recharts";

import { CHART_COLORS } from "@/types";

const STATUS_LABELS: Record<string, string> = {
  en_formulacion: "En formulación",
  en_revision_director: "Revisión director",
  en_revision_decano: "Revisión decano",
  en_revision_fries: "Revisión FRIES",
  en_revision_vicerrectoria: "Revisión Vicerrectoría",
  aprobado: "Aprobado",
  rechazado: "Rechazado",
};

interface Props {
  data: { status: string; count: number }[];
}

export function StatusChart({ data }: Props) {
  const [statusFilter, setStatusFilter] = useState<string>("todos");

  const filteredData = useMemo(() => {
    if (statusFilter === "todos") return data;
    return data.filter((item) => item.status === statusFilter);
  }, [statusFilter, data]);

  const chartData = filteredData.map((item) => ({
    name: STATUS_LABELS[item.status] || item.status,
    count: item.count,
  }));

  return (
    <Card className="h-full">
      <CardHeader className="flex justify-between items-center pb-0">
        <div>
          <p className="text-sm text-gray-500">Proyectos por estado</p>
          <h3 className="font-semibold text-gray-700">Estado de los proyectos</h3>
        </div>

        <Select
          size="sm"
          className="max-w-[220px]"
          label="Filtrar por estado"
          selectedKeys={new Set([statusFilter])}
          onChange={(e) => setStatusFilter(e.target.value)}
        >
          <SelectItem key="todos">Todos</SelectItem>

          {Object.entries(STATUS_LABELS).map(([key, label]) => (
            <SelectItem key={key}>{label}</SelectItem>
          ))}
        </Select>
      </CardHeader>

      <CardBody className="pt-4">
        <div className="w-full h-64">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={chartData}>
              <XAxis dataKey="name" fontSize={12} />
              <YAxis allowDecimals={false} />
              <Tooltip
                contentStyle={{
                  backgroundColor: "white",
                  borderRadius: "10px",
                  border: "1px solid #E5E7EB",
                }}
              />

              <Bar dataKey="count" radius={[6, 6, 0, 0]}>
                {chartData.map((_, index) => (
                  <Cell
                    key={index}
                    fill={CHART_COLORS[index % CHART_COLORS.length]}
                  />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </CardBody>
    </Card>
  );
}
