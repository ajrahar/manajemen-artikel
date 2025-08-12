import React from 'react';

export default function Footer() {
  return (
    <footer className="w-full bg-white border-t border-gray-200">
      <div className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8 text-center">
        <p className="text-gray-600 text-sm">
          &copy; {new Date().getFullYear()} Logoipsum. All rights reserved.
        </p>
      </div>
    </footer>
  );
}