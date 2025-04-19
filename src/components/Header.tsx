import { DollarSign } from 'lucide-react';
import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ThemeToggle } from './ThemeToggle';
import { Navbar } from './Navbar';

export function Header() {
  return (
    <header className="bg-vibrant-primary dark:bg-gray-800 py-4">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between">
          <Link to="/" className="group flex items-center">
            <motion.div
              whileHover={{ scale: 1.1, rotate: 360 }}
              transition={{ duration: 0.3 }}
              className="relative"
            >
              <DollarSign className="h-8 w-8 text-white" aria-hidden="true" />
              <div className="absolute inset-0 bg-white/20 rounded-full filter blur-md animate-pulse" />
            </motion.div>
            <div className="ml-3">
              <motion.h1
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                className="text-2xl font-bold text-white group-hover:text-blue-100 transition-colors"
              >
                DolarCambio.com
              </motion.h1>
              <motion.p
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
                className="text-blue-100 text-sm"
              >
                Argentina | Tiempo Real
              </motion.p>
            </div>
          </Link>

          <div className="flex items-center space-x-6">
            <ThemeToggle />
          </div>
        </div>

        <Navbar />
      </div>
    </header>
  );
}
