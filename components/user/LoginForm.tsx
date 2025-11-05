"use client";

import { useRouter } from "next/navigation";
import { useState, useEffect } from "react";
import {
  Input,
  Button,
  Checkbox,
  Card,
  CardBody,
  CardHeader,
  Alert,
} from "@heroui/react";
import { Eye, EyeOff } from "lucide-react";
import { loginUser } from "@/services/userServices";
import LogoFries from "@/layouts/logo";

export default function LoginForm() {
  const router = useRouter();
  const [formData, setFormData] = useState({ email: "", password: "" });
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (token) {
      setIsAuthenticated(true);
      router.push("/dashboard");
    }
  }, [router]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    try {
      const { token, user } = await loginUser(
        formData.email,
        formData.password
      );

      localStorage.setItem("token", token);
      localStorage.setItem("role", user.role);
      localStorage.setItem("userName", user.firstName);

      setIsAuthenticated(true);
      router.push("/dashboard");
    } catch (err: any) {
      console.error("Error en el login:", err.toJSON ? err.toJSON() : err);

      if (err.response) {
        const status = err.response.status;
        const message = "Usuario o contraseña incorrectos";

        if (status === 400 || status === 401) {
          setError(message);
        } else if (status === 500) {
          setError("Error del servidor. Inténtalo más tarde.");
        } else {
          setError(`Error inesperado: ${status}`);
        }
      } else {
        setError("No se pudo conectar con el servidor.");
      }

      setTimeout(() => setError(null), 5000);
    }
  };

  if (isAuthenticated) {
    return null;
  }

  return (
    <div className="flex min-h-screen">
  {/* 🌈 Panel izquierdo */}
  <div className="hidden lg:flex flex-col justify-between w-1/2 bg-gradient-to-br from-red-600 to-red-800 text-white relative">
    {/* Contenedor central para logo y texto */}
    <div className="flex flex-col justify-center items-center text-center flex-1">
      <h1 className="text-4xl font-bold mb-4">Bienvenido a Fries</h1>
      <p className="text-lg text-red-100 mb-6 max-w-md">
        Sistema integral para la gestión de proyectos de extensión universitaria.
      </p>
      <LogoFries />
    </div>

    {/* Enlaces fijos en la parte inferior */}
    <div className="absolute bottom-6 left-0 right-0 flex justify-center gap-6 text-sm opacity-90">
      <a href="#" className="hover:underline">Acerca de</a>
      <a href="#" className="hover:underline">Privacidad</a>
      <a href="#" className="hover:underline">Términos</a>
    </div>
  </div>

  {/* 🧾 Panel derecho */}
  <div className="flex justify-center items-center w-full lg:w-1/2 bg-gray-50">
    <Card className="w-full max-w-md p-8 shadow-lg rounded-2xl">
      <CardHeader className="text-center mb-6">
        <h2 className="text-2xl font-bold text-gray-800">Iniciar sesión</h2>
      </CardHeader>
      <CardBody>
        {error && (
          <Alert color="warning" title="Error" description={error} className="mb-4" />
        )}
        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <Input
            name="email"
            type="email"
            label="Correo electrónico"
            value={formData.email}
            onChange={handleChange}
            isRequired
          />
          <Input
            name="password"
            label="Contraseña"
            type={showPassword ? "text" : "password"}
            value={formData.password}
            onChange={handleChange}
            endContent={
              <button type="button" onClick={() => setShowPassword(!showPassword)}>
                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            }
            isRequired
          />
          <Checkbox>Recordarme</Checkbox>
          <Button type="submit" color="primary" isLoading={loading}>
            Ingresar
          </Button>
          <a href="#" className="text-sm text-center text-gray-500 hover:text-gray-700">
            ¿Olvidaste tu contraseña?
          </a>
        </form>
      </CardBody>
    </Card>
  </div>
</div>


  );
}
