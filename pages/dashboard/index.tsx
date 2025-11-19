"use client";

import { useEffect, useRef, useState } from "react";
import LayoutDashboard from "@/components/LayoutDashboard";
import {
  Card,
  CardBody,
  Skeleton,
  Chip,
} from "@heroui/react";
import { getDashboardStats } from "@/services/statisticsService";
import { StatusChart } from "@/components/Dashboard/StatusChart";
import { TypeChart } from "@/components/Dashboard/TypeChart";
import { FacultyChart } from "@/components/Dashboard/FacultyChart";
import { YearChart } from "@/components/Dashboard/YearChart";
import { PopulationsChart } from "@/components/Dashboard/PopulationsChart";
import { toTruncatedPercent } from "@/helpers/truncate";
import { getTokenPayload } from "@/utils/auth";
import { useRouter } from "next/navigation";

export default function DashboardPage() {
  const [data, setData] = useState<any | null>(null);
  const [loading, setLoading] = useState(true);
  const didRun = useRef(false);
  const router = useRouter();

  // -------------------------------------------------------------------
  // 🔒 Protección por rol
  // Solo admin y FRIES pueden ver el Dashboard
  // -------------------------------------------------------------------
  useEffect(() => {
    const user = getTokenPayload();
    const allowed = ["administrador", "fries"];

    if (!user || !allowed.includes(user.role)) {
      router.push("/extension"); // 🚫 redirigir a proyectos
    }
  }, [router]);

  // -------------------------------------------------------------------
  // 📊 Cargar estadísticas
  // -------------------------------------------------------------------
  useEffect(() => {
    if (didRun.current) return;
    didRun.current = true;

    const load = async () => {
      try {
        const summary = await getDashboardStats();
        setData(summary);
      } catch (error) {
        console.error("Error cargando dashboard:", error);
      } finally {
        setLoading(false);
      }
    };

    load();
  }, []);

  // -------------------------------------------------------------------
  // 🦴 Skeleton mientras carga
  // -------------------------------------------------------------------
  const renderSkeleton = () => (
    <div className="grid gap-4 grid-cols-1 md:grid-cols-2 xl:grid-cols-4 mb-6">
      {[...Array(4)].map((_, i) => (
        <Card key={i} className="p-4">
          <Skeleton className="h-6 w-2/3 rounded-lg bg-default-200" />
          <Skeleton className="h-8 w-1/3 mt-4 rounded-lg bg-default-300" />
        </Card>
      ))}
      <Card className="md:col-span-2 xl:col-span-4 p-4">
        <Skeleton className="h-64 rounded-lg bg-default-200" />
      </Card>
    </div>
  );

  if (loading || !data) {
    return (
      <LayoutDashboard headerTitle="Dashboard">
        {renderSkeleton()}
      </LayoutDashboard>
    );
  }

  // -------------------------------------------------------------------
  // 📊 Destructuring de los datos
  // -------------------------------------------------------------------
  const {
    totalProjects,
    projectsByStatus,
    projectsByType,
    projectsByFaculty,
    projectsByYear,
    studentsTotal,
    teachersTotal,
    studentsInProjects,
    teachersInProjects,
    studentParticipationRate,
    teacherParticipationRate,
    institutionalParticipationRate,
    populations,
  } = data;

  // -------------------------------------------------------------------
  // 🎨 Render final
  // -------------------------------------------------------------------
  return (
    <LayoutDashboard headerTitle="Dashboard">
      <h1 className="text-2xl font-bold text-gray-700 mb-4">Dashboard</h1>

      {/* KPIs */}
      <div className="grid gap-4 grid-cols-1 md:grid-cols-2 xl:grid-cols-4 mb-6">
        <Card>
          <CardBody>
            <p className="text-xs text-gray-500">Total proyectos</p>
            <p className="text-2xl font-semibold text-gray-800">
              {totalProjects ?? 0}
            </p>
            <Chip size="sm" className="mt-2" color="primary" variant="flat">
              Proyectos institucionales
            </Chip>
          </CardBody>
        </Card>

        <Card>
          <CardBody>
            <p className="text-xs text-gray-500">Estudiantes</p>
            <p className="text-lg font-semibold">
              {studentsInProjects ?? 0} / {studentsTotal ?? 0}
            </p>
            <p className="text-xs text-gray-500 mt-1">
              Participación: {studentParticipationRate.toFixed(1)}%
            </p>
          </CardBody>
        </Card>

        <Card>
          <CardBody>
            <p className="text-xs text-gray-500">Docentes</p>
            <p className="text-lg font-semibold">
              {teachersInProjects ?? 0} / {teachersTotal ?? 0}
            </p>
            <p className="text-xs text-gray-500 mt-1">
              Participación: {teacherParticipationRate.toFixed(1)}%
            </p>
          </CardBody>
        </Card>

        <Card>
          <CardBody>
            <p className="text-xs text-gray-500">
              Índice de participación institucional
            </p>
            <p className="text-2xl font-semibold text-gray-800">
              {toTruncatedPercent(institutionalParticipationRate)}%
            </p>
            <p className="text-[11px] text-gray-500 mt-1">
              Participantes únicos / usuarios totales
            </p>
          </CardBody>
        </Card>
      </div>

      {/* Gráficas principales */}
      <div className="grid gap-4 grid-cols-1 xl:grid-cols-3 mb-4">
        <div className="xl:col-span-2">
          <StatusChart data={projectsByStatus || []} />
        </div>
        <div className="xl:col-span-1">
          <TypeChart data={projectsByType || []} />
        </div>
      </div>

      <div className="grid gap-4 grid-cols-1 xl:grid-cols-2 mb-4">
        <FacultyChart data={projectsByFaculty || []} />
        <YearChart data={projectsByYear || []} />
      </div>

      {populations && populations.length > 0 && (
        <div className="grid gap-4 grid-cols-1 mb-4">
          <PopulationsChart data={populations} />
        </div>
      )}
    </LayoutDashboard>
  );
}
