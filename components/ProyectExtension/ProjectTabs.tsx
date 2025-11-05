"use client";

import { useState } from "react";
import { Tabs, Tab } from "@heroui/react";
import GeneralTab from "./tabs/General/GeneralTab";
import EntidadesTab from "./tabs/Entidades/EntidadesTab";
import IntegrantesTab from "./tabs/Integrantes/IntegrantesTab";
import DescripcionTab from "./tabs/Descripcion/DescripcionTab";
import PoblacionTab from "./tabs/Poblacion/PoblacionTab";
import ResultadosImpactosTab from "./tabs/ResultadosImpactosTab/ResultadosImpactosTab";

export default function ProjectTabs({
  project: initialProject,
  editable,
}: {
  project: any;
  editable: boolean;
}) {
  // ✅ Estado local del proyecto
  const [project, setProject] = useState(initialProject);

  return (
    <Tabs variant="solid" color="danger">
      <Tab key="general" title="General">
        <GeneralTab project={project} editable={editable} />
      </Tab>

      <Tab key="entities" title="Entidades e integrantes">
        <EntidadesTab project={project} editable={editable} />
        <IntegrantesTab project={project} editable={editable} />
      </Tab>

      <Tab key="description" title="Descripción">
        <DescripcionTab project={project} editable={editable} />
      </Tab>

      <Tab key="population" title="Población">
        <PoblacionTab project={project} editable={editable} />
      </Tab>

      <Tab key="results" title="Resultados esperados">
        {/* ✅ Pasamos función para actualizar el proyecto */}
        <ResultadosImpactosTab
          project={project}
          editable={editable}
          onProjectUpdate={setProject}
        />
      </Tab>
    </Tabs>
  );
}
