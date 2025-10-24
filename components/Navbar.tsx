'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { FaBrain, FaLightbulb, FaProjectDiagram, FaTags } from 'react-icons/fa';

export default function Navbar() {
  const pathname = usePathname();

  const navItems = [
    { href: '/', label: 'Inicio', icon: FaLightbulb },
    { href: '/ideas', label: 'Mis Ideas', icon: FaBrain },
    { href: '/tags', label: 'Tags', icon: FaTags },
    { href: '/graph', label: 'Grafo', icon: FaProjectDiagram },
  ];

  return (
    <nav className="border-b border-gray-200 bg-white/80 backdrop-blur-md sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <Link href="/" className="flex items-center space-x-2 group">
            <div className="relative">
              <FaBrain className="text-einstein-600 text-2xl group-hover:text-einstein-500 transition-colors" />
              <span className="absolute -top-1 -right-1 text-xs">²</span>
            </div>
            <span className="font-bold text-xl text-gray-900">
              Mast<span className="text-einstein-600">Idea</span>
            </span>
          </Link>

          {/* Navigation */}
          <div className="flex items-center space-x-1">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = pathname === item.href;
              
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`
                    flex items-center space-x-2 px-4 py-2 rounded-lg
                    transition-all duration-200
                    ${isActive 
                      ? 'bg-einstein-100 text-einstein-700 font-medium' 
                      : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'
                    }
                  `}
                >
                  <Icon className="text-lg" />
                  <span className="hidden sm:inline">{item.label}</span>
                </Link>
              );
            })}
          </div>
        </div>
      </div>
    </nav>
  );
}
