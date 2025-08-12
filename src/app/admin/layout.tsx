'use client';

import { useState } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import Image from 'next/image';
import { ChevronDown, LogOut } from 'lucide-react';

export default function AdminLayout({ children }: { children: React.ReactNode }) {
    const [dropdownOpen, setDropdownOpen] = useState(false);
    const router = useRouter();
    const pathname = usePathname();

    // Asumsi: Data admin dari localStorage atau context
    // Kamu bisa ganti ini dengan context, auth hook, dll.
    const admin = {
        name: 'John Doe',
        avatar: 'https://ui-avatars.com/api/?name=John+Doe&background=0ea5e9&color=fff&size=128', // fallback avatar
    };

    const handleLogout = () => {
        // Hapus token atau session
        localStorage.removeItem('authToken'); // sesuaikan dengan cara loginmu
        // Redirect ke halaman login
        router.push('/admin/login');
    };

    return (
        <div className="min-h-screen bg-gray-100">
            {/* Header */}
            <header className="bg-white shadow">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 flex justify-between items-center">
                    <h1 className="text-3xl font-bold text-gray-900">Admin Dashboard</h1>

                    {/* Admin Profile */}
                    <div className="relative">
                        <button
                            onClick={() => setDropdownOpen(prev => !prev)}
                            className="flex items-center gap-3 focus:outline-none"
                        >
                            <span className="text-sm font-medium text-gray-700">{admin.name}</span>
                            <div className="w-10 h-10 rounded-full overflow-hidden bg-blue-500 flex items-center justify-center">
                                <Image
                                    src={admin.avatar}
                                    alt={admin.name}
                                    width={40}
                                    height={40}
                                    className="object-cover"
                                />
                            </div>
                            <ChevronDown size={16} className="text-gray-500" />
                        </button>

                        {/* Dropdown */}
                        {dropdownOpen && (
                            <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg overflow-hidden z-10 border">
                                <div className="p-2 text-xs text-gray-500 border-b">
                                    Signed in as <br />
                                    <span className="font-medium text-gray-700">{admin.name}</span>
                                </div>
                                <button
                                    onClick={handleLogout}
                                    className="w-full flex items-center gap-2 px-4 py-2 text-sm text-red-600 hover:bg-red-50 transition"
                                >
                                    <LogOut size={16} />
                                    Logout
                                </button>
                            </div>
                        )}
                    </div>
                </div>
            </header>

            {/* Main Content */}
            <main className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
                {children}
            </main>

            {/* Close dropdown saat klik di luar */}
            {dropdownOpen && (
                <div
                    className="fixed inset-0 z-0"
                    onClick={() => setDropdownOpen(false)}
                />
            )}
        </div>
    );
}