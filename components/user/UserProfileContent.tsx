"use client";

import { useEffect, useState } from "react";
import {
  Card,
  CardBody,
  Input,
  Button,
  Alert,
  Select,
  SelectItem,
  Spinner,
  Skeleton,
} from "@heroui/react";

import { EyeIcon, EyeOffIcon, CameraIcon } from "lucide-react";

import {
  updateUser,
  updateUserProfileImage,
  getUserById,
} from "@/services/userServices";

import { getTokenPayload } from "@/utils/auth";
import { DEFAULT_IMAGE } from "@/types/types";
import { getFaculties } from "@/services/facultyService";

/* ============================================================
   SKELETON COMPLETO DE PERFIL
   ============================================================ */
const ProfileSkeleton = () => (
  <div className="space-y-6">

    {/* Foto + texto */}
    <div className="flex items-center gap-4">
      <Skeleton className="rounded-full w-24 h-24">
        <div className="w-24 h-24 rounded-full bg-default-300" />
      </Skeleton>

      <div className="space-y-2">
        <Skeleton className="w-32 rounded-lg">
          <div className="h-3 w-32 bg-default-200 rounded-lg" />
        </Skeleton>
        <Skeleton className="w-24 rounded-lg">
          <div className="h-3 w-24 bg-default-300 rounded-lg" />
        </Skeleton>
      </div>
    </div>

    {/* Cards simuladas */}
    {[1, 2, 3].map((i) => (
      <Card key={i} className="p-4 space-y-4">
        <Skeleton className="w-40 rounded-lg">
          <div className="h-4 w-40 bg-default-300 rounded-lg" />
        </Skeleton>

        {[1, 2, 3, 4].map((j) => (
          <Skeleton key={j} className="rounded-lg">
            <div className="h-10 bg-default-200 rounded-lg" />
          </Skeleton>
        ))}
      </Card>
    ))}

    <Skeleton className="rounded-lg">
      <div className="h-10 bg-default-300 rounded-lg" />
    </Skeleton>

  </div>
);

/* ============================================================
   COMPONENTE PRINCIPAL
   ============================================================ */
const CIVIL_STATUS = [
  "soltero",
  "casado",
  "union libre",
  "separado",
  "divorciado",
  "viudo",
];

export default function UserProfileContent({ user, loading }: any) {
  const [formData, setFormData] = useState<any>({});
  const [imgPreview, setImgPreview] = useState("");
  const [imageFile, setImageFile] = useState<File | null>(null);

  const [saving, setSaving] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [msg, setMsg] = useState<any>(null);

  const [showPassword, setShowPassword] = useState(false);

  // Facultades
  const [faculties, setFaculties] = useState<any[]>([]);
  const [loadingFaculties, setLoadingFaculties] = useState(true);

  // Token
  const auth = getTokenPayload();
  const isAdmin = ["administrador", "fries"].includes(auth?.role || "");
  const isAcademic = ["estudiante", "docente"].includes(user?.role);

  /* ============================================================
     Cargar info inicial del usuario
     ============================================================ */
  useEffect(() => {
    if (user) {
      setFormData({
        ...user,
        faculty: user.faculty?._id || user.faculty || "",
      });

      setImgPreview(user.profileImage || DEFAULT_IMAGE);
    }
  }, [user]);

  /* ============================================================
     Cargar Facultades
     ============================================================ */
  useEffect(() => {
    const fetchFaculties = async () => {
      try {
        const data = await getFaculties();
        setFaculties(Array.isArray(data) ? data : []);
      } catch (error) {
        console.error("Error cargando facultades:", error);
      } finally {
        setLoadingFaculties(false);
      }
    };

    fetchFaculties();
  }, []);

  /* ============================================================
     Refrescar información del usuario después de guardar
     ============================================================ */
  const reloadUser = async () => {
    try {
      setRefreshing(true);
      const updated = await getUserById(user._id);
      setFormData({
        ...updated,
        faculty: updated.faculty?._id || "",
      });
      setImgPreview(updated.profileImage || DEFAULT_IMAGE);
    } catch (error) {
      console.error("Error recargando usuario:", error);
    } finally {
      setTimeout(() => setRefreshing(false), 500);
    }
  };

  /* ============================================================
     Guardar cambios
     ============================================================ */
  const handleSave = async () => {
    setSaving(true);
    setMsg(null);

    try {
      await updateUser(user._id, {
        ...formData,
        faculty: formData.faculty || null,
      });

      if (imageFile) {
        await updateUserProfileImage(user._id, imageFile);
      }

      setMsg({
        type: "success",
        text: "Perfil actualizado correctamente 🎉",
      });

      await reloadUser();
    } catch (error) {
      setMsg({
        type: "danger",
        text: "Error al guardar cambios.",
      });
    }

    setSaving(false);
  };

  /* ============================================================
     LOADING INICIAL
     ============================================================ */
  if (loading || !user) return <ProfileSkeleton />;

  /* ============================================================
     LOADING DE REFRESCO
     ============================================================ */
  if (refreshing) return <ProfileSkeleton />;

  /* ============================================================
     CONTENIDO REAL DEL PERFIL
     ============================================================ */
  return (
    <div className="space-y-6">

      {/* FOTO DE PERFIL */}
      <div className="flex items-center gap-4">
        <div className="relative w-24 h-24">
          <img
            src={imgPreview}
            className="w-24 h-24 rounded-full object-cover border shadow"
          />

          <label className="absolute bottom-0 right-0 bg-white shadow-md border rounded-full p-1 cursor-pointer">
            <CameraIcon className="w-5 h-5 text-gray-700" />
            <input
              type="file"
              className="hidden"
              accept="image/*"
              onChange={(e) => {
                const f = e.target.files?.[0];
                if (f) {
                  setImageFile(f);
                  setImgPreview(URL.createObjectURL(f));
                }
              }}
            />
          </label>
        </div>

        <div>
          <p className="text-gray-600 text-sm">Cambiar foto de perfil</p>
          <p className="text-[10px] text-gray-400">JPG, PNG, WEBP – Máx. 2MB</p>
        </div>
      </div>

      {/* IDENTIFICACIÓN */}
      <Card>
        <CardBody className="space-y-3">
          <h3 className="font-semibold text-gray-700">Identificación</h3>

          <Input label="Código" value={formData.codigo || ""} isReadOnly />

          <Input label="Tipo de documento" value={formData.tipo_documento} isReadOnly />

          <Input label="Número de documento" value={formData.dni || ""} isReadOnly />

          <Input
            label="Fecha de nacimiento"
            type="date"
            value={formData.dateofBirth?.slice(0, 10) || ""}
            onChange={(e) =>
              setFormData({ ...formData, dateofBirth: e.target.value })
            }
          />

          <Input
            label="Fecha de expedición"
            type="date"
            value={formData.dateofExpedition?.slice(0, 10) || ""}
            onChange={(e) =>
              setFormData({ ...formData, dateofExpedition: e.target.value })
            }
          />

          <Input
            label="Lugar de expedición"
            value={formData.placeofExpedition || ""}
            onChange={(e) =>
              setFormData({
                ...formData,
                placeofExpedition: e.target.value,
              })
            }
          />
        </CardBody>
      </Card>

      {/* INFORMACIÓN PERSONAL */}
      <Card>
        <CardBody className="space-y-3">
          <h3 className="font-semibold text-gray-700">Información personal</h3>

          <Input
            label="Primer nombre"
            value={formData.firstName || ""}
            onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
          />

          <Input
            label="Segundo nombre"
            value={formData.secondName || ""}
            onChange={(e) => setFormData({ ...formData, secondName: e.target.value })}
          />

          <Input
            label="Primer apellido"
            value={formData.firstLastName || ""}
            onChange={(e) => setFormData({ ...formData, firstLastName: e.target.value })}
          />

          <Input
            label="Segundo apellido"
            value={formData.secondLastName || ""}
            onChange={(e) => setFormData({ ...formData, secondLastName: e.target.value })}
          />

          <Input
            label="Celular"
            value={formData.celular || ""}
            onChange={(e) => setFormData({ ...formData, celular: e.target.value })}
          />

          <Input
            label="Correo"
            type="email"
            value={formData.email || ""}
            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
          />

          <Select
            label="Estado civil"
            selectedKeys={formData.civilStatus ? new Set([formData.civilStatus]) : new Set()}
            onSelectionChange={(keys) =>
              setFormData({
                ...formData,
                civilStatus: Array.from(keys)[0],
              })
            }
          >
            {CIVIL_STATUS.map((c) => (
              <SelectItem key={c}>{c.toUpperCase()}</SelectItem>
            ))}
          </Select>

          <Input
            label="Dirección"
            value={formData.direction || ""}
            onChange={(e) =>
              setFormData({ ...formData, direction: e.target.value })
            }
          />
        </CardBody>
      </Card>

      {/* INFORMACIÓN ACADÉMICA */}
      {(isAcademic || isAdmin) && (
        <Card>
          <CardBody className="space-y-3">
            <h3 className="font-semibold text-gray-700">Información académica</h3>

            {isAcademic && (
              <Input
                label="Programa académico"
                value={formData.academic_program || ""}
                isReadOnly
              />
            )}

            {/* Facultad */}
            {loadingFaculties ? (
              <div className="flex justify-center py-4">
                <Spinner color="primary" />
              </div>
            ) : (
              <Select
                label="Facultad"
                selectedKeys={
                  formData.faculty
                    ? new Set([formData.faculty])
                    : new Set()
                }
                onSelectionChange={(keys) =>
                  setFormData({
                    ...formData,
                    faculty: Array.from(keys)[0],
                  })
                }
              >
                {faculties.map((fac) => (
                  <SelectItem key={fac._id} textValue={fac.name}>
                    {fac.name} {fac.code ? `(${fac.code})` : ""}
                  </SelectItem>
                ))}
              </Select>
            )}

            <Input
              label="Grupo de investigación"
              value={formData.grupo_investigacion || ""}
              onChange={(e) =>
                setFormData({
                  ...formData,
                  grupo_investigacion: e.target.value,
                })
              }
            />

            <Input
              label="Institución"
              value={formData.institucion || ""}
              onChange={(e) =>
                setFormData({
                  ...formData,
                  institucion: e.target.value,
                })
              }
            />
          </CardBody>
        </Card>
      )}

      {/* ROL */}
      {isAdmin && (
        <Card>
          <CardBody className="space-y-2">
            <h3 className="font-semibold text-gray-700">Rol del usuario</h3>

            <Select
              label="Rol"
              selectedKeys={formData.role ? new Set([formData.role]) : new Set()}
              onSelectionChange={(keys) =>
                setFormData({ ...formData, role: Array.from(keys)[0] })
              }
            >
              {[
                "director_programa",
                "decano",
                "fries",
                "vicerrectoria",
                "docente",
                "estudiante",
                "formulador",
                "administrador",
              ].map((r) => (
                <SelectItem key={r}>{r}</SelectItem>
              ))}
            </Select>
          </CardBody>
        </Card>
      )}

      {/* CONTRASEÑA */}
      <Card>
        <CardBody>
          <h3 className="font-semibold text-gray-700 mb-2">Seguridad</h3>

          <Input
            label="Nueva contraseña"
            type={showPassword ? "text" : "password"}
            value={formData.password || ""}
            onChange={(e) =>
              setFormData({
                ...formData,
                password: e.target.value,
              })
            }
            endContent={
              <button onClick={() => setShowPassword(!showPassword)}>
                {showPassword ? <EyeOffIcon /> : <EyeIcon />}
              </button>
            }
          />
        </CardBody>
      </Card>

      {/* ALERTA */}
      {msg && (
        <Alert color={msg.type} variant="flat">
          {msg.text}
        </Alert>
      )}

      <Button color="primary" isLoading={saving} onPress={handleSave}>
        Guardar cambios
      </Button>
    </div>
  );
}
