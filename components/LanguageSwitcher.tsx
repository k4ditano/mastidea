'use client';

import { useTransition } from 'react';
import { useRouter } from 'next/navigation';

export function LanguageSwitcher() {
  const [isPending, startTransition] = useTransition();
  const router = useRouter();

  const changeLanguage = (locale: string) => {
    startTransition(() => {
      // Guardar el idioma en una cookie
      document.cookie = `locale=${locale}; path=/; max-age=31536000`; // 1 año
      router.refresh();
    });
  };

  const getCurrentLocale = () => {
    const cookie = document.cookie
      .split('; ')
      .find(row => row.startsWith('locale='));
    return cookie ? cookie.split('=')[1] : 'es';
  };

  const currentLocale = typeof window !== 'undefined' ? getCurrentLocale() : 'es';

  return (
    <div className="flex items-center space-x-2">
      <button
        onClick={() => changeLanguage('es')}
        disabled={isPending}
        className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-all ${
          currentLocale === 'es'
            ? 'bg-einstein-600 text-white'
            : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
        } disabled:opacity-50`}
      >
        ES
      </button>
      <button
        onClick={() => changeLanguage('en')}
        disabled={isPending}
        className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-all ${
          currentLocale === 'en'
            ? 'bg-einstein-600 text-white'
            : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
        } disabled:opacity-50`}
      >
        EN
      </button>
    </div>
  );
}
