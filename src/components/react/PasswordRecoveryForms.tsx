import { useEffect, useMemo, useState } from "react";
import { apiFetch } from "../../lib/api";
import { PASSWORD_REGEX } from "../../lib/utils";

export function ForgotPasswordForm() {
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle");
  const [message, setMessage] = useState("");
  const [resetUrl, setResetUrl] = useState("");

  const submit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setStatus("loading");
    setMessage("");
    setResetUrl("");

    const result = await apiFetch("/auth/forgot-password.php", {
      method: "POST",
      body: { email },
    });

    setStatus(result.ok ? "success" : "error");
    setMessage(result.ok ? result.message || "Revisa tu correo para continuar con el cambio de contraseña." : result.message);
    if (result.ok && typeof result.data === "object" && result.data && "resetUrl" in result.data) {
      setResetUrl(String(result.data.resetUrl));
    }
  };

  return (
    <form onSubmit={submit} className="space-y-5">
      <div>
        <label className="mb-2 block text-sm text-[#888]">Email</label>
        <input
          type="email"
          value={email}
          onChange={(event) => setEmail(event.target.value)}
          className="w-full rounded-xl border border-[#2A2A2A] bg-[#111111] px-4 py-3 text-white focus:border-[#00FF66]/50 focus:outline-none"
          placeholder="tu@email.com"
          required
        />
      </div>
      <button
        type="submit"
        disabled={status === "loading"}
        className="w-full rounded-xl bg-[#00FF66] px-5 py-4 font-bold text-[#0A0A0A] transition hover:bg-[#00CC52] disabled:cursor-wait disabled:opacity-70"
      >
        {status === "loading" ? "Enviando..." : "Enviar enlace"}
      </button>
      {message && <StatusMessage status={status} message={message} />}
      {resetUrl && (
        <a
          href={resetUrl}
          className="block rounded-xl border border-[#00FF66]/30 bg-[#00FF66]/10 px-4 py-3 text-sm text-[#9CFFBF] break-all hover:border-[#00FF66]/60"
        >
          Abrir enlace de recuperación: {resetUrl}
        </a>
      )}
    </form>
  );
}

export function ResetPasswordForm({ token: initialToken = "" }: { token?: string }) {
  const [token, setToken] = useState(initialToken);
  const [password, setPassword] = useState("");
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle");
  const [message, setMessage] = useState("");
  const isValid = useMemo(() => PASSWORD_REGEX.test(password), [password]);

  useEffect(() => {
    if (initialToken || typeof window === "undefined") {
      return;
    }

    const urlToken = new URLSearchParams(window.location.search).get("token") ?? "";
    setToken(urlToken);
  }, [initialToken]);

  if (!token) {
    return (
      <p className="rounded-xl border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-300">
        El enlace no contiene token. Solicita un nuevo enlace de recuperación.
      </p>
    );
  }

  const submit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setStatus("loading");
    setMessage("");

    const result = await apiFetch("/auth/reset-password.php", {
      method: "POST",
      body: { token, password },
    });

    setStatus(result.ok ? "success" : "error");
    setMessage(result.ok ? "Contraseña actualizada. Ya puedes iniciar sesión." : result.message);
  };

  return (
    <form onSubmit={submit} className="space-y-5">
      <div>
        <label className="mb-2 block text-sm text-[#888]">Nueva contraseña</label>
        <input
          type="password"
          value={password}
          onChange={(event) => setPassword(event.target.value)}
          className="w-full rounded-xl border border-[#2A2A2A] bg-[#111111] px-4 py-3 text-white focus:border-[#00FF66]/50 focus:outline-none"
          placeholder="Mínimo 6 caracteres"
          required
        />
        <div className="mt-3 rounded-xl border border-[#2A2A2A] bg-[#111111]/70 px-4 py-3">
          <p className={`text-sm ${isValid ? "text-[#9CFFBF]" : "text-red-300"}`}>
            {isValid ? "✓" : "!"} Mínimo 6 caracteres
          </p>
        </div>
      </div>
      <button
        type="submit"
        disabled={status === "loading" || !token}
        className="w-full rounded-xl bg-[#00FF66] px-5 py-4 font-bold text-[#0A0A0A] transition hover:bg-[#00CC52] disabled:cursor-not-allowed disabled:opacity-70"
      >
        {status === "loading" ? "Actualizando..." : "Actualizar contraseña"}
      </button>
      {message && <StatusMessage status={status} message={message} />}
    </form>
  );
}

function StatusMessage({ status, message }: { status: "idle" | "loading" | "success" | "error"; message: string }) {
  return (
    <p
      className={`rounded-xl border px-4 py-3 text-sm ${
        status === "error"
          ? "border-red-500/30 bg-red-500/10 text-red-300"
          : "border-[#00FF66]/30 bg-[#00FF66]/10 text-[#9CFFBF]"
      }`}
    >
      {message}
    </p>
  );
}
