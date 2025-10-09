import React, { useState, useRef } from 'react';

export default function SearchBar({ value, onChange, onSubmit }) {
  const [suggestions, setSuggestions] = useState([]);
  const [showDropdown, setShowDropdown] = useState(false);
  const inputRef = useRef();

  async function handleInput(val) {
    onChange(val);
    if (val.length >= 2) {
      const res = await fetch(`http://localhost:4000/api/card-names?q=${encodeURIComponent(val)}`);
      const names = await res.json();
      setSuggestions(names);
      setShowDropdown(true);
    } else {
      setSuggestions([]);
      setShowDropdown(false);
    }
  }

  function handleSelect(name) {
    onChange(name);
    setShowDropdown(false);
    inputRef.current.focus();
  }

  function handleBlur() {
    setTimeout(() => setShowDropdown(false), 100);
  }

  return (
    <form onSubmit={e=>{e.preventDefault(); onSubmit();}} className="flex gap-2 relative">
      <div className="flex-1 relative">
        <input
          ref={inputRef}
          value={value}
          onChange={e=>handleInput(e.target.value)}
          onBlur={handleBlur}
          onFocus={()=>{if(suggestions.length) setShowDropdown(true);}}
          className="w-full rounded-xl border p-3"
          placeholder="Search Scryfall (e.g., lightning bolt set:m11)"
          autoComplete="off"
        />
        {showDropdown && suggestions.length > 0 && (
          <ul className="absolute left-0 right-0 top-full bg-white border rounded shadow z-10 max-h-64 overflow-auto">
            {suggestions.map(name => (
              <li key={name} className="p-2 cursor-pointer text-black hover:bg-neutral-300" onMouseDown={()=>handleSelect(name)}>{name}</li>
            ))}
          </ul>
        )}
      </div>
      <button className="btn bg-neutral-900 text-white dark:bg-white dark:text-neutral-900">Search</button>
    </form>
  );
}