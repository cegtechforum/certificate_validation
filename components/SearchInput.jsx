'use client'
import React, { useEffect, useState } from 'react';
import { Search, X } from 'lucide-react';

const SearchInput = ({ searchTerm, setSearchTerm }) => {
  const [mounted, setMounted] = useState(false);

  // Handle hydration mismatch by only rendering client-side
  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return null;
  }

  return (
    <div className="mb-6">
      <div className="relative">
        <Search
          className="absolute left-3 top-1/2 transform -translate-y-1/2 text-green-400"
          size={20}
        />
        <input
          type="text"
          placeholder="Search by name, email, mobile, or ID..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full pl-10 pr-10 py-2 bg-gray-800 border border-green-500/30 
            rounded-lg focus:border-green-500/50 text-green-400 
            placeholder-green-400/50 transition-all duration-300"
        />
        {searchTerm && (
          <button
            onClick={() => setSearchTerm('')}
            className="absolute right-3 top-1/2 transform -translate-y-1/2 
              text-green-400 hover:text-green-300 transition-colors duration-200"
          >
            <X size={16} />
          </button>
        )}
      </div>
    </div>
  );
};

export default SearchInput;