import { getUsersWithRoles } from '../../../../lib/actions/admin';
import UsersTable from '../../../../components/admin/UsersTable';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Usuarios | Admin — LuxeEstate',
};

export const dynamic = 'force-dynamic';

export default async function AdminUsersPage() {
  const users = await getUsersWithRoles();

  const admins = users.filter((u) => u.role === 'admin').length;
  const agents = users.filter((u) => u.role === 'agent').length;
  const regular = users.filter((u) => u.role === 'user').length;

  return (
    <div>
      {/* Page header */}
      <div className="mb-8">
        <h1 className="text-2xl font-semibold text-nordic-dark">Usuarios</h1>
        <p className="text-nordic-muted text-sm mt-1">
          Gestiona los roles de los usuarios registrados.
        </p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 mb-8">
        {[
          { label: 'Total usuarios', value: users.length, icon: 'group', color: 'bg-nordic-dark' },
          { label: 'Admins', value: admins, icon: 'admin_panel_settings', color: 'bg-red-600' },
          { label: 'Agentes', value: agents, icon: 'badge', color: 'bg-blue-600' },
        ].map((stat) => (
          <div
            key={stat.label}
            className="bg-white rounded-2xl p-5 border border-nordic-dark/10 shadow-sm flex items-center gap-4"
          >
            <div className={`w-10 h-10 rounded-xl ${stat.color} flex items-center justify-center flex-shrink-0`}>
              <span className="material-icons text-white text-[20px]">{stat.icon}</span>
            </div>
            <div>
              <p className="text-2xl font-bold text-nordic-dark">{stat.value}</p>
              <p className="text-xs text-nordic-muted">{stat.label}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Table */}
      <UsersTable users={users} />
    </div>
  );
}
