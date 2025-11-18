"use client";

import { Card, CardBody } from "@heroui/react";
import { ParticipantStats, UserStats } from "@/services/statisticsService";

export function ParticipantsSummary({
  participants,
  users,
}: {
  participants: ParticipantStats;
  users: UserStats;
}) {
  // participación ya viene como porcentaje desde el backend
  const ratePercent = participants.participationRate.toFixed(1);

  return (
    <Card className="h-72">
      <CardBody className="space-y-3">
        <h3 className="text-sm font-semibold text-gray-700">
          Participación en proyectos
        </h3>

        <div className="grid grid-cols-2 gap-3 text-sm">
          <div>
            <p className="text-gray-400 text-xs">Usuarios totales</p>
            <p className="text-lg font-semibold">{users.totalUsers}</p>
          </div>
          <div>
            <p className="text-gray-400 text-xs">
              Participantes únicos en proyectos
            </p>
            <p className="text-lg font-semibold">
              {participants.totalParticipantsUnique}
            </p>
          </div>
          <div>
            <p className="text-gray-400 text-xs">
              Estudiantes en proyectos
            </p>
            <p className="text-lg font-semibold">
              {participants.studentsUnique}
            </p>
          </div>
          <div>
            <p className="text-gray-400 text-xs">Docentes en proyectos</p>
            <p className="text-lg font-semibold">
              {participants.teachersUnique}
            </p>
          </div>
        </div>

        <div className="mt-2">
          <p className="text-xs text-gray-500 mb-1">
            Índice de participación institucional
          </p>
          <div className="w-full bg-gray-100 rounded-full h-2 overflow-hidden">
            <div
              className="bg-blue-500 h-2 rounded-full"
              style={{ width: `${ratePercent}%` }}
            />
          </div>
          <p className="text-xs text-gray-600 mt-1">{ratePercent}%</p>
        </div>
      </CardBody>
    </Card>
  );
}
