"use client";

import { Card, CardHeader, CardBody } from "@heroui/react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  Cell
} from "recharts";

import { CHART_COLORS } from "@/types";

interface Props {
  data: { population: string; count: number }[];
}

export function PopulationsChart({ data }: Props) {
  const chartData = data.map((p) => ({
    name: p.population,
    cantidad: p.count,
  }));

  return (
    <Card className="h-full">
      <CardHeader>
        <div>
          <p className="text-sm text-gray-500">Poblaciones beneficiadas</p>
          <h3 className="font-semibold text-gray-700">Poblaciones en proyectos</h3>
        </div>
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

              <Bar dataKey="cantidad" radius={[6, 6, 0, 0]}>
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
