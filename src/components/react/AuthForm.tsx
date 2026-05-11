import { useMemo, useState } from "react";
import { useAuth } from "./useAuth";

interface Props {
  mode: "login" | "register";
}

export default function AuthForm({ mode }: Props) {
  const { loginUser, registerUser } = useAuth();
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle");
  const [message, setMessage] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
  });

  const highlights = useMemo(
    () =>
      mode === "register"
        ? [
            "Accede a tu zona personal y tus pedidos.",
            "Activa el cupón de bienvenida WELCOME20.",
            "Desbloquea cursos premium desde el primer pedido.",
          ]
        : [
            "Recupera tus pedidos y cursos comprados.",
            "Accede al panel admin si tu rol lo permite.",
            "Mantén tu sesión real validada por el backend PHP.",
          ],
    [mode],
  );

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
      window.location.href = result.user?.role === "admin" ? "/admin" : "/mi-cuenta";
    }, 700);
  };

  return (
    <div className="grid gap-6 lg:grid-cols-[1.1fr_0.9fr]">
      <form onSubmit={handleSubmit} className="space-y-5">
        {mode === "register" && (
          <div>
            <label className="block text-sm text-[#888] mb-2">Nombre</label>
            <input
              type="text"
              required
              value={formData.name}
              onChange={(event) => setFormData((prev) => ({ ...prev, name: event.target.value }))}
              className="w-full rounded-xl border border-[#2A2A2A] bg-[#111111] px-4 py-3 text-white focus:border-[#00FF66]/50 focus:outline-none transition"
              placeholder="Tu nombre"
            />
          </div>
        )}

        <div>
          <label className="block text-sm text-[#888] mb-2">Email</label>
          <input
            type="email"
            required
            value={formData.email}
            onChange={(event) => setFormData((prev) => ({ ...prev, email: event.target.value }))}
            className="w-full rounded-xl border border-[#2A2A2A] bg-[#111111] px-4 py-3 text-white focus:border-[#00FF66]/50 focus:outline-none transition"
            placeholder="tu@email.com"
          />
        </div>

        <div>
          <div className="flex items-center justify-between mb-2">
            <label className="block text-sm text-[#888]">Contraseña</label>
            <button
              type="button"
              onClick={() => setShowPassword((prev) => !prev)}
              className="text-xs text-[#888] hover:text-[#00FF66] transition"
            >
              {showPassword ? "Ocultar" : "Mostrar"}
            </button>
          </div>
          <input
            type={showPassword ? "text" : "password"}
            required
            minLength={6}
            value={formData.password}
            onChange={(event) => setFormData((prev) => ({ ...prev, password: event.target.value }))}
            className="w-full rounded-xl border border-[#2A2A2A] bg-[#111111] px-4 py-3 text-white focus:border-[#00FF66]/50 focus:outline-none transition"
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

        <p className="text-sm text-[#666]">
          {mode === "register" ? "¿Ya tienes cuenta?" : "¿Todavía no tienes cuenta?"}{" "}
          <a href={mode === "register" ? "/login" : "/register"} className="text-[#00FF66] hover:text-[#9CFFBF] transition">
            {mode === "register" ? "Inicia sesión" : "Crear cuenta"}
          </a>
        </p>

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

      <aside className="rounded-2xl border border-[#2A2A2A] bg-gradient-to-br from-[#111111] to-[#161616] p-6">
        <p className="text-xs uppercase tracking-[0.25em] text-[#00FF66] mb-4">{mode === "register" ? "Tu acceso" : "Tu espacio"}</p>
        <h3 className="text-2xl font-bold text-white mb-3">
          {mode === "register" ? "Empieza con una cuenta lista para comprar y aprender." : "Vuelve a tu panel y continúa donde lo dejaste."}
        </h3>
        <div className="space-y-3">
          {highlights.map((item) => (
            <div key={item} className="rounded-xl border border-[#2A2A2A] bg-[#0E0E0E] px-4 py-3 text-sm text-[#CFCFCF]">
              {item}
            </div>
          ))}
        </div>
      </aside>
    </div>
  );
}
