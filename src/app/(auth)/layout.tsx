import React from 'react';

export default function AuthLayout({
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