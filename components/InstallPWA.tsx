'use client';

import { useState, useEffect } from 'react';
import { FaDownload, FaTimes } from 'react-icons/fa';

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>;
}

export default function InstallPWA() {
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [showInstallPrompt, setShowInstallPrompt] = useState(false);

  useEffect(() => {
    // Verificar si ya está instalado
    if (window.matchMedia('(display-mode: standalone)').matches) {
      return;
    }

    // Escuchar evento beforeinstallprompt
    const handler = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e as BeforeInstallPromptEvent);
      
      // Mostrar prompt después de un delay
      setTimeout(() => {
        setShowInstallPrompt(true);
      }, 5000);
    };

    window.addEventListener('beforeinstallprompt', handler);

    return () => {
      window.removeEventListener('beforeinstallprompt', handler);
    };
  }, []);

  const handleInstallClick = async () => {
    if (!deferredPrompt) return;

    deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    
    if (outcome === 'accepted') {
      setDeferredPrompt(null);
      setShowInstallPrompt(false);
    }
  };

  const handleDismiss = () => {
    setShowInstallPrompt(false);
    // No mostrar de nuevo en esta sesión
    sessionStorage.setItem('pwa-prompt-dismissed', 'true');
  };

  if (!showInstallPrompt || sessionStorage.getItem('pwa-prompt-dismissed')) {
    return null;
  }

  return (
    <div className="fixed bottom-4 right-4 z-50 max-w-sm">
      <div className="bg-gradient-to-r from-purple-600 to-blue-600 text-white rounded-2xl shadow-2xl p-5 animate-slide-up">
        <button
          onClick={handleDismiss}
          className="absolute top-2 right-2 text-white hover:text-gray-200 transition-colors"
        >
          <FaTimes />
        </button>
        
        <div className="flex items-start space-x-3 mb-4">
          <div className="bg-white bg-opacity-20 rounded-lg p-2">
            <FaDownload className="text-2xl" />
          </div>
          <div>
            <h4 className="font-bold text-lg mb-1">
              Instala MastIdea
            </h4>
            <p className="text-sm text-purple-100">
              Accede más rápido y úsala sin conexión
            </p>
          </div>
        </div>
        
        <button
          onClick={handleInstallClick}
          className="w-full bg-white text-purple-600 font-semibold py-3 rounded-lg hover:bg-gray-100 transition-colors"
        >
          Instalar aplicación
        </button>
      </div>
    </div>
  );
}
