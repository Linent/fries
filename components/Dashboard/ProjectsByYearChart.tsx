"use client";

import { Card, CardBody } from "@heroui/react";
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
  data: { year: number; total: number }[];
}

export function ProjectsByYearChart({ data }: Props) {
  if (!data?.length) {
    return (
      <Card>
        <CardBody>No hay datos históricos de proyectos.</CardBody>
      </Card>
    );
  }

  return (
    <Card className="h-72">
      <CardBody>
        <h3 className="text-sm font-semibold text-gray-700 mb-2">
          Proyectos por año
        </h3>
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={data}>
            <CartesianGrid strokeDasharray="3 3" vertical={false} />
            <XAxis dataKey="year" />
            <YAxis />
            <Tooltip />
            <Line type="monotone" dataKey="total" />
          </LineChart>
        </ResponsiveContainer>
      </CardBody>
    </Card>
  );
}
