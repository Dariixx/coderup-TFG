import { useEffect, useState } from "react";
import { apiGet, apiPost } from "../../../lib/api";
import { useAuth } from "../useAuth";

interface UserRecord {
  id: number;
  name: string;
  email: string;
  role_id: number;
  role: string;
  created_at: string;
}

const roles = [
  { id: 1, name: "admin" },
  { id: 2, name: "editor" },
  { id: 3, name: "cliente" },
  { id: 4, name: "invitado" },
];

export default function AdminUsersManager() {
  const { user, initialized } = useAuth();
  const [users, setUsers] = useState<UserRecord[]>([]);
  const [message, setMessage] = useState("Cargando usuarios...");
  const [status, setStatus] = useState<"idle" | "error" | "success">("idle");

  const loadUsers = async () => {
    const response = await apiGet<{ users: UserRecord[] }>("/users/index.php");
    setUsers(response.data?.users ?? []);
  };

  useEffect(() => {
    loadUsers()
      .then(() => setMessage(""))
      .catch((error) => {
        setStatus("error");
        setMessage(error instanceof Error ? error.message : "No se han podido cargar los usuarios.");
      });
  }, []);

  if (!initialized) {
    return <div className="rounded-2xl border border-[#2A2A2A] bg-[#1A1A1A] p-6 text-[#888]">Cargando sesión...</div>;
  }

  if (!user || user.role !== "admin") {
    return <div className="rounded-2xl border border-red-500/30 bg-red-500/10 p-6 text-red-200">Solo el rol `admin` puede gestionar usuarios.</div>;
  }

  const updateRole = async (userId: number, roleId: number) => {
    try {
      await apiPost("/users/update-role.php", { user_id: userId, role_id: roleId });
      setStatus("success");
      setMessage("Rol actualizado correctamente.");
      await loadUsers();
    } catch (error) {
      setStatus("error");
      setMessage(error instanceof Error ? error.message : "No se ha podido actualizar el rol.");
    }
  };

  return (
    <div className="space-y-4">
      {message && <div className={`rounded-2xl p-4 text-sm ${status === "error" ? "bg-red-500/10 text-red-300" : "bg-[#1A1A1A] text-[#888]"}`}>{message}</div>}
      {users.map((row) => (
        <div key={row.id} className="rounded-2xl border border-[#2A2A2A] bg-[#1A1A1A] p-6 flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
          <div>
            <p className="text-white font-semibold">{row.name}</p>
            <p className="text-sm text-[#888]">{row.email}</p>
          </div>
          <div className="flex items-center gap-3">
            <select
              value={row.role_id}
              onChange={(event) => updateRole(row.id, Number(event.target.value))}
              className="rounded-xl border border-[#2A2A2A] bg-[#111111] px-4 py-3 text-white"
            >
              {roles.map((role) => (
                <option key={role.id} value={role.id}>{role.name}</option>
              ))}
            </select>
            <span className="text-sm text-[#888] capitalize">{row.role}</span>
          </div>
        </div>
      ))}
    </div>
  );
}
