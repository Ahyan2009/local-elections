import React from 'react';

const Navbar = () => {
  return (
    <header className="bg-white shadow-sm border-b border-gray-200 py-4 px-6 flex justify-between items-center">
      <div className="flex items-center gap-3">
        <div className="w-8 h-8 bg-emerald-700 rounded-full flex items-center justify-center text-white font-bold">
          🇵🇰
        </div>
        <h1 className="text-xl font-bold text-gray-800">انتخابات سسٹم</h1>
      </div>
    </header>
  );
};

export default Navbar;