import React, { useState } from 'react';
import { NavLink } from 'react-router-dom';
import {
  Globe,
  TrendingUp,
  ArrowRightToLine
} from 'lucide-react';

const navItems = [
  { path: '/dolar-blue', label: 'Dólar Blue', icon: <TrendingUp size={16} /> },
  { path: '/latam', label: 'Dólar Latam', icon: <Globe size={16} /> },
  { path: '/remesas', label: 'Remesas', icon: <ArrowRightToLine size={16} /> },
];

export function Navbar() {
  return (
    <nav className="bg-vibrant-primary dark:bg-gray-800 border-b border-blue-600/20 dark:border-gray-700 p-4 mt-4 rounded-lg">
      <ul className="flex flex-row items-center gap-2">
        {navItems.map((item) => (
          <li key={item.path}>
            <NavLink
              to={item.path}
              className={({ isActive }) =>
                `flex items-center gap-1 px-2 py-2 rounded-lg text-sm font-medium transition-colors duration-200 ${
                  isActive
                    ? 'bg-blue-700 text-white'
                    : 'text-gray-200 hover:bg-blue-700/80 hover:text-white'
                }`
              }
            >
              {item.icon}
              {item.label}
            </NavLink>
          </li>
        ))}
      </ul>
    </nav>
  );
}
