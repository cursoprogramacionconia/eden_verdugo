"use client";

import { useState } from "react";

export default function Home() {
  const [nombreUsuario, setNombreUsuario] = useState("");
  const [password, setPassword] = useState("");
  const [estado, setEstado] = useState({ tipo: null, mensaje: "" });
  const [cargando, setCargando] = useState(false);

  const handleSubmit = async (event) => {
    event.preventDefault();
    setEstado({ tipo: null, mensaje: "" });
    setCargando(true);

    try {
      const respuesta = await fetch("/api/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ nombre_usuario: nombreUsuario, password }),
      });

      const data = await respuesta.json();

      if (!respuesta.ok) {
        throw new Error(data?.error || "Usuario y contraseña inválidos.");
      }

      setEstado({ tipo: "success", mensaje: data?.mensaje || "Inicio de sesión exitoso." });
    } catch (error) {
      setEstado({ tipo: "error", mensaje: "Usuario y contraseña inválidos." });
    } finally {
      setCargando(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-md">
        <div className="bg-white/10 backdrop-blur-xl rounded-3xl shadow-2xl border border-white/10 p-10">
          <h1 className="text-2xl font-semibold text-white text-center mb-8">
            Curso de programacion perrona con IA
          </h1>
          <form className="space-y-6" onSubmit={handleSubmit}>
            <div className="space-y-2">
              <label className="block text-sm font-medium text-slate-200" htmlFor="nombre_usuario">
                Usuario
              </label>
              <input
                id="nombre_usuario"
                type="text"
                value={nombreUsuario}
                onChange={(event) => setNombreUsuario(event.target.value)}
                className="w-full rounded-xl border border-white/20 bg-white/5 px-4 py-3 text-white placeholder:text-slate-400 focus:border-indigo-400 focus:outline-none focus:ring-2 focus:ring-indigo-400/60"
                placeholder="Ingresa tu usuario"
                autoComplete="username"
                required
              />
            </div>
            <div className="space-y-2">
              <label className="block text-sm font-medium text-slate-200" htmlFor="password">
                Contraseña
              </label>
              <input
                id="password"
                type="password"
                value={password}
                onChange={(event) => setPassword(event.target.value)}
                className="w-full rounded-xl border border-white/20 bg-white/5 px-4 py-3 text-white placeholder:text-slate-400 focus:border-indigo-400 focus:outline-none focus:ring-2 focus:ring-indigo-400/60"
                placeholder="Ingresa tu contraseña"
                autoComplete="current-password"
                required
              />
            </div>

            {estado.mensaje && (
              <div
                className={`rounded-xl px-4 py-3 text-sm font-medium ${
                  estado.tipo === "success"
                    ? "bg-emerald-500/10 text-emerald-200 border border-emerald-500/30"
                    : "bg-rose-500/10 text-rose-200 border border-rose-500/30"
                }`}
                role="alert"
              >
                {estado.mensaje}
              </div>
            )}

            <button
              type="submit"
              className="w-full rounded-xl bg-indigo-500 hover:bg-indigo-400 focus:bg-indigo-400 transition-colors px-4 py-3 text-sm font-semibold text-white focus:outline-none focus:ring-2 focus:ring-indigo-200 focus:ring-offset-2 focus:ring-offset-slate-900 disabled:cursor-not-allowed disabled:opacity-70"
              disabled={cargando}
            >
              {cargando ? "Ingresando..." : "Iniciar sesión"}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
