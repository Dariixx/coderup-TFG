import { generateInitials } from "../../lib/utils";
import { useAuth } from "./useAuth";

export default function AccountNavButton() {
  const { user, initialized } = useAuth();

  if (!initialized) {
    return <div className="hidden md:flex w-10 h-10 rounded-xl border border-[#2A2A2A] bg-[#1A1A1A] animate-pulse" />;
  }

  if (!user) {
    return (
      <a
        href="/login"
        className="hidden md:inline-flex items-center gap-2 border border-[#2A2A2A] text-white px-4 py-2 rounded-lg text-sm hover:border-[#00FF66]/50 transition"
      >
        <svg className="w-4 h-4 text-[#00FF66]" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.8}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 9V5.25A2.25 2.25 0 0 0 13.5 3h-6A2.25 2.25 0 0 0 5.25 5.25v13.5A2.25 2.25 0 0 0 7.5 21h6a2.25 2.25 0 0 0 2.25-2.25V15m-9-3h12m0 0-3-3m3 3-3 3" />
        </svg>
        Acceder
      </a>
    );
  }

  return (
    <a
      href="/mi-cuenta"
      className="hidden md:inline-flex items-center gap-3 border border-[#2A2A2A] bg-[#1A1A1A] text-white px-3 py-2 rounded-xl hover:border-[#00FF66]/50 transition"
    >
      <span className="w-8 h-8 rounded-lg bg-[#00FF66]/10 text-[#00FF66] flex items-center justify-center text-xs font-bold">
        {generateInitials(user.name)}
      </span>
      <span className="text-sm">{user.name.split(" ")[0]}</span>
    </a>
  );
}
