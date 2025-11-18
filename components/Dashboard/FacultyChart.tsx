"use client";

import { CHART_COLORS } from "@/types";
import { Card, CardHeader, CardBody } from "@heroui/react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  Cell,
} from "recharts";

interface Props {
  data: { facultyId: string; facultyName: string; count: number }[];
}

export function FacultyChart({ data }: Props) {
  const chartData = data.map((f) => ({
    name: f.facultyName,
    Cantidad: f.count,
  }));

  return (
    <Card className="h-full">
      <CardHeader>
        <div>
          <p className="text-sm text-gray-500">Distribución institucional</p>
          <h3 className="font-semibold text-gray-700">Proyectos por facultad</h3>
        </div>
      </CardHeader>
      <CardBody className="pt-4">
        <div className="w-full h-64">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={chartData}>
              <XAxis dataKey="name" fontSize={12} />
              <YAxis allowDecimals={false} />
              <Tooltip />
              <Bar dataKey="Cantidad" radius={[6, 6, 0, 0]}>
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
