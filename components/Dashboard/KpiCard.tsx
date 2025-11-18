"use client";

import { Card, CardBody } from "@heroui/react";

interface KpiCardProps {
  label: string;
  value: string | number;
  subtitle?: string;
}

export function KpiCard({ label, value, subtitle }: KpiCardProps) {
  return (
    <Card className="flex-1 min-w-[180px]">
      <CardBody className="space-y-1">
        <p className="text-xs uppercase tracking-wide text-gray-400">
          {label}
        </p>
        <p className="text-2xl font-semibold text-gray-800">{value}</p>
        {subtitle && (
          <p className="text-xs text-gray-500">{subtitle}</p>
        )}
      </CardBody>
    </Card>
  );
}
