'use client';

import Link from 'next/link';
import { useAuth } from '../../../context/AuthContext'; // Adjust path
import { LogOut } from 'lucide-react';

export default function Header() {
  const { user, logout, isLoading } = useAuth();

  // Don't render anything until we know the auth status
  if (isLoading) {
    return (
        <header className="bg-blue-700 text-white p-4 flex justify-between items-center">
            <div className="text-xl font-bold">Logoipsum</div>
            <div className="h-6 bg-blue-600 rounded w-24 animate-pulse"></div>
        </header>
    );
  }

  return (
    <header className="bg-blue-700 text-white p-4 flex justify-between items-center">
      <Link href="/" className="text-xl font-bold">Logoipsum</Link>
      <nav>
        {user ? (
          <div className="flex items-center gap-4">
            <span className='font-semibold'>Welcome, {user.username}</span>
            <button onClick={logout} className="flex items-center gap-2 hover:bg-blue-600 p-2 rounded-md transition-colors" title="Logout">
              <LogOut size={20} />
            </button>
          </div>
        ) : (
          <div className="flex items-center gap-4">
            <Link href="/login" className="px-4 py-2 rounded-md hover:bg-blue-600 transition-colors">
              Login
            </Link>
            <Link href="/register" className="bg-white text-blue-700 font-semibold px-4 py-2 rounded-md hover:bg-gray-200 transition-colors">
              Register
            </Link>
          </div>
        )}
      </nav>
    </header>
  );
}