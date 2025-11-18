"use client";

import { Card, CardHeader, CardBody } from "@heroui/react";
import { PieChart, Pie, Tooltip, Cell, ResponsiveContainer } from "recharts";

interface Props {
  data: { type: string; count: number }[];
}

const COLORS = ["#3498db", "#2ecc71", "#9b59b6", "#e67e22"];

export function TypeChart({ data }: Props) {
  const chartData = data.map((item) => ({
    name: item.type || "Sin tipo",
    value: item.count,
  }));

  return (
    <Card className="h-full">
      <CardHeader>
        <div>
          <p className="text-sm text-gray-500">Distribución</p>
          <h3 className="font-semibold text-gray-700">Proyectos por tipo</h3>
        </div>
      </CardHeader>
      <CardBody className="pt-4">
        <div className="w-full h-64">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                dataKey="value"
                data={chartData}
                outerRadius={90}
                label
              >
                {chartData.map((entry, index) => (
                  <Cell key={entry.name} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </CardBody>
    </Card>
  );
}
