import { useState } from "react";
import { useAuth } from "./useAuth";

interface Props {
  mode: "login" | "register";
}

export default function AuthForm({ mode }: Props) {
  const { loginUser, registerUser } = useAuth();
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle");
  const [message, setMessage] = useState("");
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
  });

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setStatus("loading");
    setMessage("");

    const result =
      mode === "register"
        ? await registerUser(formData)
        : await loginUser({ email: formData.email, password: formData.password });

    if (!result.ok) {
      setStatus("error");
      setMessage(result.message);
      return;
    }

    setStatus("success");
    setMessage(mode === "register" ? "Cuenta creada correctamente." : "Sesión iniciada correctamente.");
    window.setTimeout(() => {
      window.location.href = "/mi-cuenta";
    }, 700);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      {mode === "register" && (
        <div>
          <label className="block text-sm text-[#888] mb-2">Nombre</label>
          <input
            type="text"
            value={formData.name}
            onChange={(event) => setFormData((prev) => ({ ...prev, name: event.target.value }))}
            className="w-full rounded-xl border border-[#2A2A2A] bg-[#111111] px-4 py-3 text-white focus:border-[#00FF66]/50 focus:outline-none"
            placeholder="Tu nombre"
          />
        </div>
      )}

      <div>
        <label className="block text-sm text-[#888] mb-2">Email</label>
        <input
          type="email"
          value={formData.email}
          onChange={(event) => setFormData((prev) => ({ ...prev, email: event.target.value }))}
          className="w-full rounded-xl border border-[#2A2A2A] bg-[#111111] px-4 py-3 text-white focus:border-[#00FF66]/50 focus:outline-none"
          placeholder="tu@email.com"
        />
      </div>

      <div>
        <label className="block text-sm text-[#888] mb-2">Contraseña</label>
        <input
          type="password"
          value={formData.password}
          onChange={(event) => setFormData((prev) => ({ ...prev, password: event.target.value }))}
          className="w-full rounded-xl border border-[#2A2A2A] bg-[#111111] px-4 py-3 text-white focus:border-[#00FF66]/50 focus:outline-none"
          placeholder="Mínimo 6 caracteres"
        />
      </div>

      <button
        type="submit"
        disabled={status === "loading"}
        className="w-full rounded-xl bg-[#00FF66] px-5 py-4 font-bold text-[#0A0A0A] transition hover:bg-[#00CC52] disabled:cursor-wait disabled:opacity-70"
      >
        {status === "loading" ? "Procesando..." : mode === "register" ? "Crear cuenta" : "Iniciar sesión"}
      </button>

      {message && (
        <p
          className={`rounded-xl border px-4 py-3 text-sm ${
            status === "error"
              ? "border-red-500/30 bg-red-500/10 text-red-300"
              : "border-[#00FF66]/30 bg-[#00FF66]/10 text-[#9CFFBF]"
          }`}
        >
          {message}
        </p>
      )}
    </form>
  );
}
