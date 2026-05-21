import { useState } from "react";

export default function ContactForm() {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    subject: "",
    message: "",
  });
  const [status, setStatus] = useState<"idle" | "sending" | "sent" | "error">("idle");
  const [errorMessage, setErrorMessage] = useState("");

  const validateForm = () => {
    const missingFields = [
      !formData.name.trim() ? "nombre" : "",
      !formData.email.trim() ? "email" : "",
      !formData.subject.trim() ? "asunto" : "",
      !formData.message.trim() ? "mensaje" : "",
    ].filter(Boolean);

    if (missingFields.length) {
      return `Completa ${missingFields.join(", ")} antes de enviar el formulario.`;
    }

    if (formData.name.trim().length < 2) {
      return "El nombre debe tener al menos 2 caracteres para poder identificarte.";
    }

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      return "Introduce un email válido, por ejemplo nombre@dominio.com.";
    }

    if (formData.subject.trim().length < 4) {
      return "El asunto debe tener al menos 4 caracteres para saber de qué trata tu consulta.";
    }

    if (formData.message.trim().length < 20) {
      return "El mensaje debe tener al menos 20 caracteres para que podamos responderte bien.";
    }

    return "";
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const validationError = validateForm();

    if (validationError) {
      setErrorMessage(validationError);
      setStatus("error");
      return;
    }

    setErrorMessage("");
    setStatus("sending");

    // Simulación asíncrona defendible para la demo mientras no exista backend de contacto.
    await new Promise((resolve) => setTimeout(resolve, 1200));

    try {
      setStatus("sent");
      setFormData({ name: "", email: "", subject: "", message: "" });
      setTimeout(() => setStatus("idle"), 3000);
    } catch {
      setErrorMessage("No se pudo registrar el mensaje. Revisa la conexión y vuelve a intentarlo.");
      setStatus("error");
    }
  };

  const inputClass =
    "w-full bg-[#1A1A1A] border border-[#2A2A2A] rounded-xl px-5 py-4 text-white placeholder-[#888] focus:outline-none focus:border-[#00FF66] transition text-sm";

  return (
    <form onSubmit={handleSubmit} className="space-y-5" noValidate>
      <div className="grid md:grid-cols-2 gap-5">
        <input
          type="text"
          placeholder="Tu nombre"
          required
          value={formData.name}
          onChange={(e) => setFormData({ ...formData, name: e.target.value })}
          className={inputClass}
        />
        <input
          type="email"
          placeholder="tu@email.com"
          required
          value={formData.email}
          onChange={(e) => setFormData({ ...formData, email: e.target.value })}
          className={inputClass}
        />
      </div>
      <input
        type="text"
        placeholder="Asunto"
        required
        value={formData.subject}
        onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
        className={inputClass}
      />
      <textarea
        placeholder="Tu mensaje..."
        rows={6}
        required
        value={formData.message}
        onChange={(e) => setFormData({ ...formData, message: e.target.value })}
        className={`${inputClass} resize-none`}
      />
      <button
        type="submit"
        disabled={status === "sending"}
        className={`w-full py-4 rounded-xl font-bold text-lg transition ${
          status === "sent"
            ? "bg-green-500 text-white"
            : status === "sending"
            ? "bg-[#00FF66]/50 text-[#0A0A0A] cursor-wait"
            : "bg-[#00FF66] text-[#0A0A0A] hover:bg-[#00CC52] shadow-lg shadow-[#00FF66]/20"
        }`}
      >
        {status === "sending" ? "Enviando..." : status === "sent" ? "Mensaje enviado" : "Enviar mensaje"}
      </button>
      {status === "error" && (
        <p className="rounded-xl border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-300" role="alert">
          {errorMessage}
        </p>
      )}
      {status === "sent" && (
        <p className="rounded-xl border border-[#00FF66]/30 bg-[#00FF66]/10 px-4 py-3 text-sm text-[#9CFFBF]">
          Hemos registrado tu mensaje correctamente. Te responderemos lo antes posible.
        </p>
      )}
    </form>
  );
}
