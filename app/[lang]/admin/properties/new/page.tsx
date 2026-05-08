import PropertyForm from '@/components/admin/PropertyForm';

interface NewPropertyPageProps {
  params: Promise<{ lang: string }>;
}

export default async function NewPropertyPage({ params }: NewPropertyPageProps) {
  const { lang } = await params;

  return (
    <div className="min-h-screen bg-background-light">
      <PropertyForm lang={lang} />
    </div>
  );
}
