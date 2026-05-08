'use client';

import { useState, useTransition, useRef, useEffect } from 'react';
import { updateUserRole, type UserWithRole, type UserRole } from '../../lib/actions/admin';

interface UsersTableProps {
  users: UserWithRole[];
  currentUserId?: string;
}

const ROLES: { id: UserRole; label: string; icon: string }[] = [
  { id: 'admin', label: 'Administrator', icon: 'shield' },
  { id: 'broker', label: 'Broker', icon: 'business' },
  { id: 'agent', label: 'Agent', icon: 'support_agent' },
  { id: 'user', label: 'Viewer', icon: 'visibility' },
];

export default function UsersTable({ users: initialUsers, currentUserId }: UsersTableProps) {
  const [users, setUsers] = useState(initialUsers);
  
  useEffect(() => {
    setUsers(initialUsers);
  }, [initialUsers]);

  const [isPending, startTransition] = useTransition();
  const [updatingId, setUpdatingId] = useState<string | null>(null);
  const [message, setMessage] = useState<{ text: string; type: 'ok' | 'err' } | null>(null);
  const [openDropdownId, setOpenDropdownId] = useState<string | null>(null);

  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setOpenDropdownId(null);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleRoleChange = (userId: string, newRole: UserRole) => {
    setOpenDropdownId(null);
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

  const getRoleDisplay = (role: UserRole) => {
    switch (role) {
      case 'admin': return { label: 'Administrator', classes: 'bg-nordic text-white' };
      case 'broker': return { label: 'Broker', classes: 'bg-primary/10 text-primary' };
      case 'agent': return { label: 'Agent', classes: 'bg-gray-100 text-gray-600' };
      default: return { label: 'Viewer', classes: 'bg-gray-100 text-gray-500' };
    }
  };

  return (
    <main className="flex-grow px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto w-full pb-12 space-y-4">
      {/* Toast */}
      {message && (
        <div
          className={`px-4 py-3 rounded-xl text-sm font-medium flex items-center gap-2 ${
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

      <div className="hidden md:grid grid-cols-12 gap-4 px-6 text-xs font-semibold uppercase tracking-wider text-nordic/50 mb-2 mt-4">
        <div className="col-span-4">User Details</div>
        <div className="col-span-3">Role & Status</div>
        <div className="col-span-3">Performance</div>
        <div className="col-span-2 text-right">Actions</div>
      </div>

      <div ref={dropdownRef} className="space-y-4">
        {users.map((user) => {
          const isCurrentUser = user.id === currentUserId;
          const isUpdating = updatingId === user.id;
          const isDropdownOpen = openDropdownId === user.id;
          const roleDisplay = getRoleDisplay(user.role);

          return (
            <div 
              key={user.id} 
              className={`user-card group relative rounded-xl p-5 shadow-sm flex flex-col md:grid md:grid-cols-12 gap-4 items-center transition-all duration-200 ${
                isCurrentUser ? 'bg-active-green border border-transparent' : 'bg-white border border-gray-100 hover:bg-active-green'
              }`}
            >
              {/* User Details */}
              <div className="col-span-12 md:col-span-4 flex items-center w-full">
                <div className="relative flex-shrink-0 w-12 h-12 rounded-full bg-nordic/10 flex items-center justify-center overflow-hidden">
                  {user.avatar_url ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={user.avatar_url}
                      alt={user.full_name ?? user.email}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <span className="text-nordic-muted font-bold uppercase text-lg">
                      {(user.full_name ?? user.email).charAt(0)}
                    </span>
                  )}
                  {isCurrentUser && (
                    <span className="absolute bottom-0 right-0 block h-3 w-3 rounded-full bg-green-400 ring-2 ring-white"></span>
                  )}
                </div>
                <div className="ml-4 overflow-hidden">
                  <div className="text-sm font-bold text-nordic truncate flex items-center gap-2">
                    {user.full_name ?? '—'}
                    {isCurrentUser && <span className="text-[10px] bg-primary/10 text-primary px-1.5 py-0.5 rounded uppercase tracking-wider">You</span>}
                  </div>
                  <div className="text-xs text-nordic/60 truncate">{user.email}</div>
                  <div className="mt-1 text-[10px] px-2 py-0.5 inline-block bg-gray-50 rounded text-nordic/50 group-hover:bg-white/50 transition-colors">
                    ID: #{user.id.substring(0, 8)}
                  </div>
                </div>
              </div>

              {/* Role & Status */}
              <div className="col-span-12 md:col-span-3 w-full flex items-center justify-between md:justify-start gap-4">
                <span className={`inline-flex items-center px-2.5 py-1 rounded-md text-xs font-medium ${roleDisplay.classes}`}>
                  {roleDisplay.label}
                </span>
                <div className="flex items-center text-xs text-nordic/60">
                  <span className={`material-icons text-[14px] mr-1 ${isUpdating ? 'animate-spin text-primary' : user.status === 'active' ? 'text-primary' : 'text-gray-400'}`}>
                    {isUpdating ? 'refresh' : user.status === 'active' ? 'check_circle' : 'schedule'}
                  </span>
                  {isUpdating ? 'Updating...' : (user.status.charAt(0).toUpperCase() + user.status.slice(1))}
                </div>
              </div>

              <div className="col-span-12 md:col-span-3 w-full grid grid-cols-2 gap-4">
                <div>
                  <div className="text-[10px] uppercase tracking-wider text-nordic/40">Properties</div>
                  <div className={`text-sm font-semibold ${user.role === 'user' ? 'text-nordic/30' : 'text-nordic'}`}>
                    {user.properties_count}
                  </div>
                </div>
                <div>
                  {user.role === 'user' ? (
                    <>
                      <div className="text-[10px] uppercase tracking-wider text-nordic/40">Last Login</div>
                      <div className="text-sm font-semibold text-nordic">
                        {user.last_login ? new Date(user.last_login).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }) : '—'}
                      </div>
                    </>
                  ) : (
                    <>
                      <div className="text-[10px] uppercase tracking-wider text-nordic/40">Sales (YTD)</div>
                      <div className="text-sm font-semibold text-nordic">
                        ${(user.sales_ytd / 1000000).toFixed(1)}M
                      </div>
                    </>
                  )}
                </div>
              </div>

              {/* Actions */}
              <div className="col-span-12 md:col-span-2 w-full flex justify-end relative">
                <button 
                  onClick={() => !isCurrentUser && setOpenDropdownId(isDropdownOpen ? null : user.id)}
                  disabled={isCurrentUser || isUpdating}
                  className={`inline-flex items-center px-4 py-2 text-xs font-medium rounded-lg focus:outline-none transition-colors w-full md:w-auto justify-center ${
                    isCurrentUser 
                      ? 'bg-transparent text-nordic/30 cursor-not-allowed border border-transparent' 
                      : 'border border-gray-200 bg-white shadow-sm text-nordic hover:border-nordic hover:text-nordic group-hover:shadow-sm'
                  }`}
                >
                  Change Role
                  <span className="material-icons text-[16px] ml-2">
                    {isDropdownOpen ? 'expand_less' : 'expand_more'}
                  </span>
                </button>

                {isDropdownOpen && !isCurrentUser && (
                  <div className="absolute top-full right-0 mt-2 w-48 rounded-lg shadow-lg bg-primary ring-1 ring-black ring-opacity-5 focus:outline-none overflow-hidden z-50 origin-top-right animate-in fade-in zoom-in-95 duration-100">
                    <div aria-orientation="vertical" className="py-1" role="menu">
                      {ROLES.map((r) => (
                        <button
                          key={r.id}
                          onClick={() => handleRoleChange(user.id, r.id)}
                          className={`w-full group flex items-center px-4 py-3 text-xs transition-colors ${
                            user.role === r.id 
                              ? 'text-white bg-white/10 font-medium' 
                              : 'text-white/70 hover:bg-white/10 hover:text-white'
                          }`}
                          role="menuitem"
                        >
                          <span className={`material-icons text-sm mr-3 ${user.role === r.id ? 'text-white' : 'text-white/50 group-hover:text-white'}`}>
                            {r.icon}
                          </span>
                          {r.label}
                        </button>
                      ))}
                      <div className="border-t border-white/10 my-1"></div>
                      <button className="w-full group flex items-center px-4 py-3 text-xs text-red-200 hover:bg-red-500/20 hover:text-red-100 transition-colors" role="menuitem">
                        <span className="material-icons text-sm mr-3 text-red-300 group-hover:text-red-100">block</span>
                        Suspend User
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          );
        })}

        {users.length === 0 && (
          <div className="py-16 text-center text-nordic-muted bg-white rounded-xl border border-gray-100">
            <span className="material-icons text-4xl mb-3 block">group</span>
            No users found.
          </div>
        )}
      </div>
    </main>
  );
}
