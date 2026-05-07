'use client';

import { useState, useTransition } from 'react';
import { updateUserRole, type UserWithRole, type UserRole } from '../../lib/actions/admin';
import RoleBadge from './RoleBadge';

interface UsersTableProps {
  users: UserWithRole[];
}

const ROLES: UserRole[] = ['admin', 'agent', 'user'];

export default function UsersTable({ users: initialUsers }: UsersTableProps) {
  const [users, setUsers] = useState(initialUsers);
  const [isPending, startTransition] = useTransition();
  const [updatingId, setUpdatingId] = useState<string | null>(null);
  const [message, setMessage] = useState<{ text: string; type: 'ok' | 'err' } | null>(null);

  const handleRoleChange = (userId: string, newRole: UserRole) => {
    setUpdatingId(userId);
    startTransition(async () => {
      const res = await updateUserRole(userId, newRole);
      if (res.success) {
        setUsers((prev) =>
          prev.map((u) => (u.id === userId ? { ...u, role: newRole } : u))
        );
        setMessage({ text: 'Rol actualizado correctamente.', type: 'ok' });
      } else {
        setMessage({ text: `Error: ${res.error}`, type: 'err' });
      }
      setUpdatingId(null);
      setTimeout(() => setMessage(null), 3000);
    });
  };

  return (
    <div>
      {/* Toast */}
      {message && (
        <div
          className={`mb-4 px-4 py-3 rounded-xl text-sm font-medium flex items-center gap-2 ${
            message.type === 'ok'
              ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
              : 'bg-red-50 text-red-700 border border-red-200'
          }`}
        >
          <span className="material-icons text-[18px]">
            {message.type === 'ok' ? 'check_circle' : 'error_outline'}
          </span>
          {message.text}
        </div>
      )}

      <div className="overflow-x-auto rounded-2xl border border-nordic-dark/10 bg-white shadow-sm">
        <table className="min-w-full text-sm">
          <thead>
            <tr className="bg-background-light border-b border-nordic-dark/10">
              <th className="text-left px-5 py-3.5 font-semibold text-nordic-dark/60 uppercase text-xs tracking-wider">Usuario</th>
              <th className="text-left px-5 py-3.5 font-semibold text-nordic-dark/60 uppercase text-xs tracking-wider">Email</th>
              <th className="text-left px-5 py-3.5 font-semibold text-nordic-dark/60 uppercase text-xs tracking-wider">Registrado</th>
              <th className="text-left px-5 py-3.5 font-semibold text-nordic-dark/60 uppercase text-xs tracking-wider">Rol actual</th>
              <th className="text-left px-5 py-3.5 font-semibold text-nordic-dark/60 uppercase text-xs tracking-wider">Cambiar rol</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-nordic-dark/5">
            {users.map((user) => (
              <tr key={user.id} className="hover:bg-background-light/50 transition-colors">
                {/* Avatar + Name */}
                <td className="px-5 py-4">
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-full overflow-hidden ring-2 ring-nordic-dark/10 flex-shrink-0 bg-nordic-dark/10">
                      {user.avatar_url ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img
                          src={user.avatar_url}
                          alt={user.full_name ?? user.email}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-nordic-muted text-xs font-bold uppercase">
                          {(user.full_name ?? user.email).charAt(0)}
                        </div>
                      )}
                    </div>
                    <span className="font-medium text-nordic-dark truncate max-w-[140px]">
                      {user.full_name ?? '—'}
                    </span>
                  </div>
                </td>

                {/* Email */}
                <td className="px-5 py-4 text-nordic-muted">{user.email}</td>

                {/* Created at */}
                <td className="px-5 py-4 text-nordic-muted whitespace-nowrap">
                  {new Date(user.created_at).toLocaleDateString('es-ES')}
                </td>

                {/* Current role badge */}
                <td className="px-5 py-4">
                  <RoleBadge role={user.role} />
                </td>

                {/* Role selector */}
                <td className="px-5 py-4">
                  <div className="flex items-center gap-2">
                    <select
                      defaultValue={user.role}
                      disabled={isPending && updatingId === user.id}
                      onChange={(e) =>
                        handleRoleChange(user.id, e.target.value as UserRole)
                      }
                      className="text-sm border border-nordic-dark/15 rounded-lg px-3 py-1.5 bg-white text-nordic-dark focus:outline-none focus:ring-2 focus:ring-mosque/30 focus:border-mosque transition-all disabled:opacity-50 cursor-pointer"
                    >
                      {ROLES.map((r) => (
                        <option key={r} value={r}>
                          {r.charAt(0).toUpperCase() + r.slice(1)}
                        </option>
                      ))}
                    </select>
                    {updatingId === user.id && (
                      <span className="material-icons text-mosque text-[18px] animate-spin">
                        refresh
                      </span>
                    )}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {users.length === 0 && (
          <div className="py-16 text-center text-nordic-muted">
            <span className="material-icons text-4xl mb-3 block">group</span>
            No hay usuarios
          </div>
        )}
      </div>
    </div>
  );
}
