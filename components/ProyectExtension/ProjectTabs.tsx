"use client";

import { useState } from "react";
import { Tabs, Tab } from "@heroui/react";
import GeneralTab from "./tabs/General/GeneralTab";
import EntidadesTab from "./tabs/Entidades/EntidadesTab";
import IntegrantesTab from "./tabs/Integrantes/IntegrantesTab";
import DescripcionTab from "./tabs/Descripcion/DescripcionTab";
import PoblacionTab from "./tabs/Poblacion/PoblacionTab";
import ResultadosImpactosTab from "./tabs/ResultadosImpactosTab/ResultadosImpactosTab";
import DocumentosTab from "./tabs/Documentos/DocumentosTab";
import ComentariosTab from "./tabs/Commets/ComentariosTabs";

export default function ProjectTabs({
  project: initialProject,
  editable,
}: {
  project: any;
  editable: boolean;
}) {
  // ✅ Estado local del proyecto (centralizado)
  const [project, setProject] = useState(initialProject);

  // 🔁 Función global para actualizar el proyecto desde cualquier tab
  const handleProjectUpdate = (updatedProject: any) => {
    if (updatedProject) {
      setProject(updatedProject);
    }
  };

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
        {/* 🔗 Ahora DescripcionTab puede actualizar el padre */}
        <DescripcionTab
          project={project}
          editable={editable}
          onProjectUpdate={handleProjectUpdate}
        />
      </Tab>

      <Tab key="population" title="Población">
        {/* 🔗 PoblacionTab también actualiza el padre */}
        <PoblacionTab
          project={project}
          editable={editable}
          onProjectUpdate={handleProjectUpdate}
        />
      </Tab>

      <Tab key="results" title="Resultados esperados">
        {/* 🔗 ResultadosImpactosTab también lo hace */}
        <ResultadosImpactosTab
          project={project}
          editable={editable}
          onProjectUpdate={handleProjectUpdate}
        />
      </Tab>
      <Tab key="documents" title="Documentos">
        <DocumentosTab project={project} editable={editable} />
      </Tab>
      <Tab key="comments" title="Comentarios">
        <ComentariosTab editable={editable} project={project} />
      </Tab>
    </Tabs>
  );
}
