import { Locale, getDictionary } from '../../../lib/i18n';
import LoginForm from '../../../components/auth/LoginForm';

export default async function LoginPage({ params }: { params: Promise<{ lang: Locale }> }) {
  const { lang } = await params;
  const dict = await getDictionary(lang);
  
  return <LoginForm lang={lang} dict={dict} />;
}
