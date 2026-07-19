import { Link } from 'react-router-dom';
import { env } from '../config/env';
import { TrendingUp, Send } from 'lucide-react';
import PackageSlider from './PackageSlider';

export default function Footer() {
  return (
    <footer className="text-white transition-colors bg-gray-900 dark:bg-gray-950">
      <div className="px-4 py-12 mx-auto max-w-7xl sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 gap-8 md:grid-cols-4">
          {/* Company Info */}
          <div className="space-y-4">
            <div className="flex items-center space-x-2">
              <TrendingUp className="w-8 h-8 text-primary-400" />
              <span className="text-xl font-bold">Colgate-Palmolive</span>
            </div>
            <p className="text-sm text-gray-300">
              Colgate-Palmolive is a global consumer products company offering trusted oral care,
              personal care and home care brands that improve everyday life.
            </p>
            <div className="flex space-x-4">
              <a
                href={env.TELEGRAM_CHANNEL}
                target="_blank"
                rel="noopener noreferrer"
                className="p-2 transition-colors rounded-lg bg-primary-600 hover:bg-primary-700"
              >
                <Send className="w-4 h-4 text-white" />

              </a>
            </div>
          </div>

          {/* Quick Links */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Quick Links</h3>
            <ul className="space-y-2 text-sm">
              <li>
                <Link to="/" className="text-gray-300 transition-colors hover:text-white">
                  Home
                </Link>
              </li>
              <li>
                <Link to="/register" className="text-gray-300 transition-colors hover:text-white">
                  Get Started
                </Link>
              </li>
              <li>
                <Link to="/login" className="text-gray-300 transition-colors hover:text-white">
                  Login
                </Link>
              </li>
            </ul>
          </div>

          {/* <div className="space-y-4">
            <ul className="space-y-2 text-sm text-gray-300">
              <li>Full Stock Package - 70,000 ETB </li>
              <li>Half Stock Package - 35,000 ETB</li>
              <li>Quarter Stock Package - 17,500 ETB </li>
              <li>Minimum Stock Package - 7,000 ETB </li>
            </ul>
          </div> */}

          {/* Notice */}
          <div className="space-y-3 rounded-2xl border border-primary-500/30 bg-gradient-to-br from-primary-600/20 via-primary-500/10 to-transparent p-4 shadow-[0_0_30px_rgba(59,130,246,0.15)] backdrop-blur-sm">
            <div className="flex items-center space-x-2">
              <span className="inline-flex h-2.5 w-2.5 animate-pulse rounded-full bg-primary-400" />
              <h3 className="text-lg font-semibold text-primary-200">ሰላም ሞሊቮች</h3>
            </div>
            <p className="text-lg font-extrabold leading-7 text-white drop-shadow-[0_2px_6px_rgba(0,0,0,0.35)]">
              በቅርቡ ኢትዮጵያ ውስጥ ቢሮዎችን እንከፍታለን።
            </p>
            <div className="flex items-center space-x-2 text-sm font-medium text-primary-100">
              <span className="animate-bounce">✨</span>
              <span>በአዲስ እድል እና ተጨማሪ አገልግሎት</span>
            </div>
          </div>
        </div>

        <div className="mt-8">
          <PackageSlider />
        </div>

        <div className="pt-8 mt-8 text-center border-t border-gray-800">
          <div className="flex flex-col items-center justify-between md:flex-row">
            <p className="text-sm text-gray-400">
              © 2024 Colgate-Palmolive. All rights reserved.
            </p>
            <div className="flex mt-4 space-x-6 md:mt-0">
              <a href="#" className="text-sm text-gray-400 transition-colors hover:text-white">
                Privacy Policy
              </a>
              <a href="#" className="text-sm text-gray-400 transition-colors hover:text-white">
                Terms of Service
              </a>
              <a href="#" className="text-sm text-gray-400 transition-colors hover:text-white">
                Support
              </a>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
