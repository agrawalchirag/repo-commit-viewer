import React, { useState } from 'react';
import { Search, Loader2 } from 'lucide-react';
import './RepoInput.css';

interface RepoInputProps {
  onSearch: (owner: string, repo: string) => void;
  isLoading: boolean;
  defaultVal?: string;
}

const RepoInput: React.FC<RepoInputProps> = ({ onSearch, isLoading, defaultVal = 'octocat/Spoon-Knife' }) => {
  const [inputValue, setInputValue] = useState(defaultVal);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    const trimmed = inputValue.trim();
    if (!trimmed) {
      setError('Please enter a repository path');
      return;
    }

    const parts = trimmed.split('/');
    if (parts.length !== 2 || !parts[0].trim() || !parts[1].trim()) {
      setError('Please use the format "owner/repo" (e.g., octocat/Spoon-Knife)');
      return;
    }

    onSearch(parts[0].trim(), parts[1].trim());
  };

  return (
    <div className="repo-search-box glass-panel">
      <form onSubmit={handleSubmit} className="search-form">
        <div className="input-wrapper">
          <Search className="search-icon" size={20} />
          <input
            type="text"
            className="repo-text-input"
            placeholder="owner/repo (e.g., facebook/react)"
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            disabled={isLoading}
          />
        </div>
        <button type="submit" className="search-submit-btn" disabled={isLoading}>
          {isLoading ? (
            <>
              <Loader2 className="btn-spinner" size={18} />
              <span>Searching...</span>
            </>
          ) : (
            <span>Analyze Repo</span>
          )}
        </button>
      </form>
      {error && <div className="input-error-msg">{error}</div>}
    </div>
  );
};

export default RepoInput;
