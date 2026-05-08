import type { UserRole } from '../../lib/actions/admin';

const roleConfig: Record<UserRole, { label: string; className: string }> = {
  admin: {
    label: 'Admin',
    className: 'bg-red-100 text-red-700 ring-1 ring-red-200',
  },
  agent: {
    label: 'Agent',
    className: 'bg-gray-100 text-gray-600 ring-1 ring-gray-200',
  },
  user: {
    label: 'User',
    className: 'bg-emerald-100 text-emerald-700 ring-1 ring-emerald-200',
  },
  broker: {
    label: 'Broker',
    className: 'bg-blue-100 text-blue-700 ring-1 ring-blue-200',
  },
};

export default function RoleBadge({ role }: { role: UserRole }) {
  const config = roleConfig[role] ?? roleConfig.user;
  return (
    <span
      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${config.className}`}
    >
      {config.label}
    </span>
  );
}
