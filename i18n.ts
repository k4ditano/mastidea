import {getRequestConfig} from 'next-intl/server';
import {cookies} from 'next/headers';

export const locales = ['es', 'en'] as const;
export type Locale = typeof locales[number];

export default getRequestConfig(async () => {
  // Lee el locale de las cookies o usa español por defecto
  const cookieStore = await cookies();
  const locale = (cookieStore.get('locale')?.value || 'es') as Locale;

  return {
    locale,
    messages: (await import(`./messages/${locale}.json`)).default
  };
});
