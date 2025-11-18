"use client";

import { Card, CardHeader, CardBody } from "@heroui/react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  ResponsiveContainer,
} from "recharts";

interface Props {
  data: { year: number; count: number }[];
}

export function YearChart({ data }: Props) {
  const chartData = data.map((d) => ({
    year: d.year,
    count: d.count,
  }));

  return (
    <Card className="h-full">
      <CardHeader>
        <div>
          <p className="text-sm text-gray-500">Evolución en el tiempo</p>
          <h3 className="font-semibold text-gray-700">
            Proyectos registrados por año
          </h3>
        </div>
      </CardHeader>
      <CardBody className="pt-4">
        <div className="w-full h-64">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="year" />
              <YAxis allowDecimals={false} />
              <Tooltip />
              <Line type="monotone" dataKey="count" stroke="#3498db" />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </CardBody>
    </Card>
  );
}
