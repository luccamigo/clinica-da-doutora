import React from 'react';

const SearchBar = ({ placeholder }) => {
  return (
    <input className="search-input" type="search" placeholder={placeholder} />
  );
};

export default SearchBar;

