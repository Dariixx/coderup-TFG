import { useState, type FormEvent } from "react";
import { subscribeNewsletter } from "../../lib/api";
import { EMAIL_REGEX } from "../../lib/utils";

export default function NewsletterForm() {
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle");
  const [message, setMessage] = useState("");

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const nextEmail = email.trim();

    if (!EMAIL_REGEX.test(nextEmail)) {
      setStatus("error");
      setMessage("Introduce un email válido.");
      return;
    }

    setStatus("loading");
    setMessage("");

    const response = await subscribeNewsletter(nextEmail);
    setStatus(response.ok ? "success" : "error");
    setMessage(response.message);

    if (response.ok) {
      setEmail("");
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-3">
      <div className="flex gap-2">
        <input
          type="email"
          value={email}
          onChange={(event) => setEmail(event.target.value)}
          placeholder="tu@email.com"
          className="min-w-0 flex-1 rounded-lg border border-[#2A2A2A] bg-[#1A1A1A] px-4 py-2 text-sm text-white placeholder-[#888] focus:border-[#00FF66] focus:outline-none"
        />
        <button
          type="submit"
          disabled={status === "loading"}
          className="inline-flex items-center justify-center rounded-lg bg-[#00FF66] px-4 py-2 text-sm font-semibold text-[#0A0A0A] transition hover:bg-[#00CC52] disabled:cursor-wait disabled:opacity-70"
          aria-label="Enviar newsletter"
        >
          <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="m4.5 12 15-7.5-4.5 15-3-6-7.5-1.5Z" />
          </svg>
        </button>
      </div>
      {message && (
        <p className={`rounded-lg border px-3 py-2 text-xs ${status === "success" ? "border-[#00FF66]/30 bg-[#00FF66]/10 text-[#9CFFBF]" : "border-red-500/30 bg-red-500/10 text-red-300"}`}>
          {message}
        </p>
      )}
    </form>
  );
}
