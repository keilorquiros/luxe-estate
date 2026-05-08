import PropertyForm from '@/components/admin/PropertyForm';
import { getProperty } from '@/lib/actions/admin';
import { notFound } from 'next/navigation';

interface EditPropertyPageProps {
  params: Promise<{ lang: string; id: string }>;
}

export default async function EditPropertyPage({ params }: EditPropertyPageProps) {
  const { lang, id } = await params;

  const property = await getProperty(id);

  if (!property) {
    notFound();
  }

  return (
    <div className="min-h-screen bg-background-light">
      <PropertyForm lang={lang} property={property} />
    </div>
  );
}
