import React from 'react';
import { MessageSquare, ExternalLink, ChevronLeft, ChevronRight, Calendar } from 'lucide-react';
import { CommitResponse } from '../types';
import './CommitTable.css';

interface CommitTableProps {
  commits: CommitResponse[];
  isLoading: boolean;
  onOpenComments: (sha: string) => void;
  currentPage: number;
  onPageChange: (newPage: number) => void;
  hasNextPage: boolean;
  hasPrevPage: boolean;
}

const CommitTable: React.FC<CommitTableProps> = ({
  commits,
  isLoading,
  onOpenComments,
  currentPage,
  onPageChange,
  hasNextPage,
  hasPrevPage,
}) => {
  // Format ISO date string to a more readable format
  const formatDate = (dateStr: string) => {
    if (!dateStr) return 'Unknown Date';
    try {
      const date = new Date(dateStr);
      return date.toLocaleDateString(undefined, {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      });
    } catch {
      return dateStr;
    }
  };

  // Shorten SHA for cleaner layout
  const shortSha = (sha: string) => {
    return sha.substring(0, 7);
  };

  if (isLoading) {
    return (
      <div className="table-wrapper glass-panel">
        <div className="table-loading-container">
          <table className="commit-table skeleton-table">
            <thead>
              <tr>
                <th>Author</th>
                <th>Commit SHA</th>
                <th>Commit Title</th>
                <th>Date</th>
                <th>Comments</th>
              </tr>
            </thead>
            <tbody>
              {[...Array(5)].map((_, idx) => (
                <tr key={idx}>
                  <td>
                    <div className="author-cell">
                      <div className="skeleton skeleton-circle"></div>
                      <div className="skeleton" style={{ width: '80px', height: '14px' }}></div>
                    </div>
                  </td>
                  <td>
                    <div className="skeleton" style={{ width: '60px', height: '14px' }}></div>
                  </td>
                  <td>
                    <div className="skeleton" style={{ width: '80%', height: '14px' }}></div>
                  </td>
                  <td>
                    <div className="skeleton" style={{ width: '120px', height: '14px' }}></div>
                  </td>
                  <td>
                    <div className="skeleton" style={{ width: '40px', height: '18px', borderRadius: '12px' }}></div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    );
  }

  return (
    <div className="table-section-container">
      <div className="table-wrapper glass-panel">
        <div className="table-scroll-container">
          <table className="commit-table">
            <thead>
              <tr>
                <th>Author</th>
                <th>SHA</th>
                <th>Commit Title</th>
                <th>Date</th>
                <th className="text-center">Comments</th>
              </tr>
            </thead>
            <tbody>
              {commits.length === 0 ? (
                <tr>
                  <td colSpan={5} className="empty-table-cell">
                    <div className="empty-state">
                      <p>No commits found for this repository or author filter.</p>
                    </div>
                  </td>
                </tr>
              ) : (
                commits.map((commit) => (
                  <tr key={commit.sha} className="table-row-hover">
                    <td>
                      <div className="author-cell">
                        {commit.authorAvatar ? (
                          <img
                            src={commit.authorAvatar}
                            alt={commit.authorUsername || commit.authorName}
                            className="author-avatar"
                          />
                        ) : (
                          <div className="avatar-placeholder">
                            {commit.authorName.charAt(0).toUpperCase()}
                          </div>
                        )}
                        <div className="author-info">
                          <span className="author-name-text" title={commit.authorName}>
                            {commit.authorName}
                          </span>
                          {commit.authorUsername && (
                            <a
                              href={`https://github.com/${commit.authorUsername}`}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="author-login-link"
                            >
                              @{commit.authorUsername}
                              <ExternalLink size={10} className="inline-icon" />
                            </a>
                          )}
                        </div>
                      </div>
                    </td>
                    <td>
                      <a
                        href={commit.htmlUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="sha-badge"
                        title="View commit details on GitHub"
                      >
                        {shortSha(commit.sha)}
                        <ExternalLink size={10} />
                      </a>
                    </td>
                    <td className="commit-title-cell">
                      <span className="commit-title-text" title={commit.commitTitle}>
                        {commit.commitTitle}
                      </span>
                    </td>
                    <td>
                      <div className="date-cell">
                        <Calendar size={14} className="date-icon" />
                        <span className="date-text">{formatDate(commit.commitDate)}</span>
                      </div>
                    </td>
                    <td className="text-center">
                      {commit.commentCount > 0 ? (
                        <button
                          className="comment-count-btn active-comments"
                          onClick={() => onOpenComments(commit.sha)}
                          title={`Click to view ${commit.commentCount} comment(s)`}
                        >
                          <MessageSquare size={14} />
                          <span>{commit.commentCount}</span>
                        </button>
                      ) : (
                        <div className="comment-count-btn no-comments" title="No comments on this commit">
                          <MessageSquare size={14} />
                          <span>0</span>
                        </div>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Pagination Controls */}
      {commits.length > 0 && (
        <div className="pagination-bar glass-panel">
          <button
            className="pagination-btn"
            disabled={!hasPrevPage}
            onClick={() => onPageChange(currentPage - 1)}
          >
            <ChevronLeft size={18} />
            <span>Prev</span>
          </button>
          <div className="page-indicator">
            <span>Page</span>
            <span className="active-page-num">{currentPage}</span>
          </div>
          <button
            className="pagination-btn"
            disabled={!hasNextPage}
            onClick={() => onPageChange(currentPage + 1)}
          >
            <span>Next</span>
            <ChevronRight size={18} />
          </button>
        </div>
      )}
    </div>
  );
};

export default CommitTable;
