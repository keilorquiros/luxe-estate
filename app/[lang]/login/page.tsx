import { Locale, getDictionary } from '../../../lib/i18n';
import LoginForm from '../../../components/auth/LoginForm';

export default async function LoginPage({ 
  params,
  searchParams,
}: { 
  params: Promise<{ lang: Locale }>;
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
  const { lang } = await params;
  const resolvedSearchParams = await searchParams;
  const redirectTo = typeof resolvedSearchParams.redirectTo === 'string' 
    ? resolvedSearchParams.redirectTo 
    : undefined;

  const dict = await getDictionary(lang);
  
  return <LoginForm lang={lang} dict={dict} redirectTo={redirectTo} />;
}
