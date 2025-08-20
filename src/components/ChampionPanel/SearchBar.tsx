import React from 'react';

interface SearchBarProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
}

export const SearchBar: React.FC<SearchBarProps> = ({
  value,
  onChange,
  placeholder = 'チャンピオンを検索...',
}) => {
  return (
    <div className="relative">
      <div className="absolute inset-y-0 left-0 flex items-center pointer-events-none" style={{ paddingLeft: 'var(--space-12)' }}>
        <svg
          width="16"
          height="16"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
          style={{ color: 'var(--color-neutral-500)' }}
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
          />
        </svg>
      </div>
      <input
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="atlassian-input"
        style={{ 
          paddingLeft: 'calc(var(--space-12) + 16px + var(--space-8))',
          paddingRight: value ? 'calc(var(--space-12) + 16px + var(--space-8))' : 'var(--space-12)'
        }}
        placeholder={placeholder}
      />
      {value && (
        <button
          onClick={() => onChange('')}
          className="absolute inset-y-0 right-0 flex items-center atlassian-btn-subtle"
          style={{ 
            paddingRight: 'var(--space-12)',
            backgroundColor: 'transparent',
            border: 'none'
          }}
        >
          <svg
            width="16"
            height="16"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
            style={{ color: 'var(--color-neutral-500)' }}
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M6 18L18 6M6 6l12 12"
            />
          </svg>
        </button>
      )}
    </div>
  );
};