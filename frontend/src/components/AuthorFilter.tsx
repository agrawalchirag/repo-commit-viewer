import React from 'react';
import { User } from 'lucide-react';
import { AuthorResponse } from '../types';
import './AuthorFilter.css';

interface AuthorFilterProps {
  authors: AuthorResponse[];
  selectedAuthor: string;
  onSelectAuthor: (username: string) => void;
  disabled: boolean;
}

const AuthorFilter: React.FC<AuthorFilterProps> = ({
  authors,
  selectedAuthor,
  onSelectAuthor,
  disabled,
}) => {
  return (
    <div className="author-filter-container glass-panel">
      <div className="filter-label-wrapper">
        <User size={18} className="filter-icon" />
        <span className="filter-label">Filter by Author:</span>
      </div>
      <div className="select-wrapper">
        <select
          className="author-select"
          value={selectedAuthor}
          onChange={(e) => onSelectAuthor(e.target.value)}
          disabled={disabled}
        >
          <option value="">All Authors ({authors.reduce((acc, curr) => acc + curr.commitCount, 0)} commits)</option>
          {authors.map((author) => (
            <option key={author.username} value={author.username}>
              {author.username} ({author.commitCount} commit{author.commitCount > 1 ? 's' : ''})
            </option>
          ))}
        </select>
      </div>
    </div>
  );
};

export default AuthorFilter;
