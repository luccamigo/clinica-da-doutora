// Campo de busca: dispara onSearch ao Enter
import React, { useEffect, useRef, useState } from 'react';
import styles from './SearchBar.module.scss';

const SearchBar = ({ placeholder, onSearch }) => {
  const [value, setValue] = useState('');
  const timer = useRef(null);

  const handleKey = (e) => {
    if (e.key === 'Enter' && onSearch) onSearch(value);
  };

  // dispara busca automaticamente com debounce
  useEffect(() => {
    if (!onSearch) return;
    if (timer.current) clearTimeout(timer.current);
    timer.current = setTimeout(() => onSearch(value), 300);
    return () => timer.current && clearTimeout(timer.current);
  }, [value, onSearch]);

  return (
    <input
      className={`${styles.input} form-control form-control-lg`}
      type="search"
      placeholder={placeholder}
      value={value}
      onChange={(e) => setValue(e.target.value)}
      onKeyDown={handleKey}
    />
  );
};

export default SearchBar;
