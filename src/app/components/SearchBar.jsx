'use client';

import { useEffect, useState, useRef } from 'react';
import { Search, X } from 'lucide-react';

export default function SearchBar({
  value,
  onDebouncedChange,
  suggestions = [],
  onSelectSuggestion,
}) {
  const [input, setInput] = useState(value);
  const [showDropdown, setShowDropdown] = useState(false);
  const wrapperRef = useRef(null);

  useEffect(() => {
    const handler = setTimeout(() => {
      onDebouncedChange(input);
    }, 300);
    return () => clearTimeout(handler);
  }, [input, onDebouncedChange]);

  useEffect(() => {
    setInput(value);
  }, [value]);

  useEffect(() => {
    function handleClickOutside(event) {
      if (wrapperRef.current && !wrapperRef.current.contains(event.target)) {
        setShowDropdown(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSelect = (item) => {
    onSelectSuggestion(item);
    setInput(item.name);
    setShowDropdown(false);
  };

  return (
    <div ref={wrapperRef} className="relative max-w-xl mx-auto w-full transition-all">
      <div className="relative flex items-center">
        <Search className="absolute left-3 text-gray-400 h-5 w-5" />
        <input
          type="text"
          placeholder="Search therapists by name, city, or specialization"
          value={input}
          onChange={(e) => {
            setInput(e.target.value);
            setShowDropdown(true);
          }}
          onFocus={() => {
            if (suggestions.length > 0) setShowDropdown(true);
          }}
          className="w-full pl-10 pr-10 py-2 rounded-full border border-gray-300 shadow-sm focus:outline-none focus:ring-2 focus:ring-emerald-400 transition duration-200 placeholder-gray-400"
        />
        {input && (
          <button
            onClick={() => setInput('')}
            className="absolute right-3 text-gray-400 hover:text-gray-600"
          >
            <X className="h-5 w-5" />
          </button>
        )}
      </div>

      {showDropdown && input.trim() !== '' && suggestions.length > 0 && (
        <ul className="absolute top-full left-0 w-full bg-white border border-gray-200 mt-2 rounded-xl shadow-lg z-50 max-h-96 overflow-y-auto animate-fade-in">
          {suggestions.map((item) => (
            <li
              key={item.id}
              className="flex items-start gap-4 px-4 py-4 hover:bg-emerald-50 transition cursor-pointer"
              onClick={() => handleSelect(item)}
            >
              {/* Image */}
              <img
                src={item.image || '/default-avatar.png'}
                alt={item.name}
                className="w-16 h-16 rounded-full object-cover border"
              />

              {/* Info */}
              <div className="flex-1">
                <div className="flex items-center justify-between">
                  <h3 className="text-base font-semibold text-gray-900">
                    {item.name}
                  </h3>
                  <span className="text-sm text-yellow-600 font-medium">
                    ⭐ {item.rating || 'N/A'}
                  </span>
                </div>

                <p className="text-sm text-gray-600">{item.specialization}</p>

                {item.clinics?.length > 0 && (
                  <p className="text-sm text-gray-500">
                    {item.clinics[0].name} – {item.clinics[0].city}
                  </p>
                )}

                <p className="text-sm text-gray-500 mt-1 line-clamp-2">
                  {item.bio}
                </p>

                <div className="mt-2 flex items-center justify-between">
                  {/* Price */}
                  <span className="text-sm font-medium text-emerald-600">
                    {item.price}
                  </span>

                  {/* First available slot */}
                  {item.availableSlots?.length > 0 && (
                    <span className="text-sm text-gray-400">
                      ⏰ {item.availableSlots[0]}
                    </span>
                  )}
                </div>
              </div>

              {/* Book Now Button */}
              <button
                className="ml-2 px-3 py-1 bg-emerald-500 text-white text-sm rounded-md hover:bg-emerald-600 transition"
                onClick={(e) => {
                  e.stopPropagation();
                  handleSelect(item);
                }}
              >
                Book Now
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
