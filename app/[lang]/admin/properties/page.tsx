import { getAdminProperties } from '../../../../lib/actions/admin';
import PropertiesTable from '../../../../components/admin/PropertiesTable';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Propiedades | Admin — LuxeEstate',
};

export const dynamic = 'force-dynamic';

export default async function AdminPropertiesPage({
  params,
}: {
  params: Promise<{ lang: string }>;
}) {
  const { lang } = await params;
  const properties = await getAdminProperties();

  const featured = properties.filter((p) => p.is_featured).length;
  const forSale = properties.filter((p) => p.tag === 'for sale').length;
  const forRent = properties.filter((p) => p.tag === 'for rent').length;

  return (
    <div>
      {/* Page header */}
      <div className="mb-8">
        <h1 className="text-2xl font-semibold text-nordic-dark">Propiedades</h1>
        <p className="text-nordic-muted text-sm mt-1">
          Gestiona todas las propiedades del catálogo.
        </p>
      </div>

      {/* Stats row */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-8">
        {[
          { label: 'Total', value: properties.length, icon: 'home_work', color: 'bg-nordic-dark' },
          { label: 'Destacadas', value: featured, icon: 'star', color: 'bg-mosque' },
          { label: 'En Venta', value: forSale, icon: 'sell', color: 'bg-emerald-600' },
          { label: 'En Alquiler', value: forRent, icon: 'key', color: 'bg-blue-600' },
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
      <PropertiesTable properties={properties} lang={lang} />
    </div>
  );
}
