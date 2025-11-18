"use client";

import { Card, CardBody } from "@heroui/react";
import {
  PieChart,
  Pie,
  Cell,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";

const COLORS = ["#3b82f6", "#22c55e", "#f97316", "#a855f7", "#ef4444"];

interface Props {
  data: Record<string, number>; // { Remunerado: 10, Solidario: 5 }
}

export function ProjectsByTypeChart({ data }: Props) {
  const chartData = Object.entries(data || {}).map(
    ([name, value]) => ({ name, value })
  );

  if (!chartData.length) {
    return (
      <Card>
        <CardBody>No hay datos de proyectos por tipo.</CardBody>
      </Card>
    );
  }

  return (
    <Card className="h-72">
      <CardBody>
        <h3 className="text-sm font-semibold text-gray-700 mb-2">
          Proyectos por tipo
        </h3>
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={chartData}
              dataKey="value"
              nameKey="name"
              outerRadius={80}
              label
            >
              {chartData.map((entry, index) => (
                <Cell
                  key={`cell-${index}`}
                  fill={COLORS[index % COLORS.length]}
                />
              ))}
            </Pie>
            <Tooltip />
            <Legend />
          </PieChart>
        </ResponsiveContainer>
      </CardBody>
    </Card>
  );
}
