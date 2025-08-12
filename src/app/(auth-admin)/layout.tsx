import React from 'react';

// Layout ini memberikan latar belakang abu-abu dan menengahkan konten
export default function AdminAuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <main className="bg-gray-100 flex items-center justify-center min-h-screen">
      {children}
    </main>
  );
}