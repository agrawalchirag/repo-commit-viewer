import React, { useState, useEffect, useCallback } from 'react';
import { Github, AlertTriangle, Info, GitCommit } from 'lucide-react';
import Header from './components/Header';
import RepoInput from './components/RepoInput';
import AuthorFilter from './components/AuthorFilter';
import CommitTable from './components/CommitTable';
import CommentModal from './components/CommentModal';
import { CommitResponse, AuthorResponse, CommentResponse } from './types';
import { getCommits, getAuthors, getComments, PaginationLinks } from './api/github';
import './App.css';

const App: React.FC = () => {
  // Repo state
  const [owner, setOwner] = useState('octocat');
  const [repo, setRepo] = useState('Spoon-Knife');
  
  // Data states
  const [commits, setCommits] = useState<CommitResponse[]>([]);
  const [authors, setAuthors] = useState<AuthorResponse[]>([]);
  const [comments, setComments] = useState<CommentResponse[]>([]);
  
  // UI states
  const [selectedAuthor, setSelectedAuthor] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedCommitSha, setSelectedCommitSha] = useState<string | null>(null);
  
  // Loading & Error states
  const [commitsLoading, setCommitsLoading] = useState(false);
  const [authorsLoading, setAuthorsLoading] = useState(false);
  const [commentsLoading, setCommentsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  // Pagination Links
  const [paginationLinks, setPaginationLinks] = useState<PaginationLinks>({});
  
  // GitHub API limits tracker
  const [rateLimit, setRateLimit] = useState<number | null>(null);
  const [rateLimitRemaining, setRateLimitRemaining] = useState<number | null>(null);

  // Update rate limit trackers from response headers
  const updateRateLimits = (headers: any) => {
    if (headers['x-ratelimit-limit']) {
      setRateLimit(parseInt(headers['x-ratelimit-limit'], 10));
    }
    if (headers['x-ratelimit-remaining']) {
      setRateLimitRemaining(parseInt(headers['x-ratelimit-remaining'], 10));
    }
  };

  // Main data fetch function
  const fetchData = useCallback(async (
    targetOwner: string, 
    targetRepo: string, 
    page: number = 1, 
    authorFilter: string = '',
    shouldReloadAuthorsAndComments: boolean = true
  ) => {
    setError(null);
    setCommitsLoading(true);

    if (shouldReloadAuthorsAndComments) {
      setAuthorsLoading(true);
      setCommentsLoading(true);
    }

    try {
      // 1. Fetch commits
      const commitsResult = await getCommits(targetOwner, targetRepo, page, 15, authorFilter);
      setCommits(commitsResult.commits);
      setPaginationLinks(commitsResult.pagination);

      // Handle loading authors and comments in parallel
      if (shouldReloadAuthorsAndComments) {
        // We use Promise.allSettled so that if comments or authors fail (e.g. rate limit / no comments), commits still show
        const [authorsRes, commentsRes] = await Promise.allSettled([
          getAuthors(targetOwner, targetRepo),
          getComments(targetOwner, targetRepo, 1, 100)
        ]);

        if (authorsRes.status === 'fulfilled') {
          setAuthors(authorsRes.value);
        } else {
          console.error('Failed to load authors:', authorsRes.reason);
        }

        if (commentsRes.status === 'fulfilled') {
          setComments(commentsRes.value.comments);
        } else {
          console.error('Failed to load comments:', commentsRes.reason);
          setComments([]);
        }
      }
    } catch (err: any) {
      console.error(err);
      const errMsg = err.response?.data?.error || err.message || 'An unexpected error occurred';
      setError(errMsg);
      
      // Update limits if header is present in error response
      if (err.response?.headers) {
        updateRateLimits(err.response.headers);
      }
    } finally {
      setCommitsLoading(false);
      if (shouldReloadAuthorsAndComments) {
        setAuthorsLoading(false);
        setCommentsLoading(false);
      }
    }
  }, []);

  // Fetch initial data on mount
  useEffect(() => {
    fetchData(owner, repo, 1, '', true);
  }, []);

  // Handle new repo search
  const handleSearch = (newOwner: string, newRepo: string) => {
    setOwner(newOwner);
    setRepo(newRepo);
    setSelectedAuthor('');
    setCurrentPage(1);
    fetchData(newOwner, newRepo, 1, '', true);
  };

  // Handle filter by author
  const handleSelectAuthor = (username: string) => {
    setSelectedAuthor(username);
    setCurrentPage(1);
    fetchData(owner, repo, 1, username, false);
  };

  // Handle page change
  const handlePageChange = (newPage: number) => {
    setCurrentPage(newPage);
    fetchData(owner, repo, newPage, selectedAuthor, false);
  };

  // Filter cached comments for the selected modal SHA
  const activeCommentsForSha = selectedCommitSha
    ? comments.filter((c) => c.commitSha === selectedCommitSha)
    : [];

  return (
    <div className="app-container">
      {/* Brand Header */}
      <Header />

      {/* API Rate Limit Alert Box */}
      {rateLimitRemaining !== null && rateLimitRemaining < 10 && (
        <div className="rate-limit-banner">
          <Info size={16} />
          <span>
            Warning: GitHub API rate limits are low ({rateLimitRemaining} / {rateLimit} remaining).
            Provide a GITHUB_TOKEN inside the docker-compose/env file to reset.
          </span>
        </div>
      )}

      {/* Control Panel Grid */}
      <div className="controls-grid">
        <RepoInput onSearch={handleSearch} isLoading={commitsLoading} defaultVal={`${owner}/${repo}`} />
        <AuthorFilter
          authors={authors}
          selectedAuthor={selectedAuthor}
          onSelectAuthor={handleSelectAuthor}
          disabled={commitsLoading || authorsLoading}
        />
      </div>

      {/* Stats Summary Dashboard */}
      <div className="summary-dashboard glass-panel">
        <div className="stat-card">
          <Github className="stat-icon" size={20} />
          <div className="stat-info">
            <span className="stat-label">Repository</span>
            <span className="stat-value">{owner}/{repo}</span>
          </div>
        </div>
        <div className="stat-card">
          <GitCommit className="stat-icon" size={20} />
          <div className="stat-info">
            <span className="stat-label">Active Page Commits</span>
            <span className="stat-value">{commits.length}</span>
          </div>
        </div>
        <div className="stat-card text-gradient">
          <div className="stat-info">
            <span className="stat-label">Unique Contributors</span>
            <span className="stat-value">{authors.length}</span>
          </div>
        </div>
      </div>

      {/* Error Alert Display */}
      {error ? (
        <div className="error-card glass-panel">
          <AlertTriangle className="error-icon" size={32} />
          <div className="error-text">
            <h3>API Query Error</h3>
            <p>{error}</p>
          </div>
          <button className="retry-btn" onClick={() => fetchData(owner, repo, currentPage, selectedAuthor, true)}>
            Retry Call
          </button>
        </div>
      ) : (
        /* Commits Table Component */
        <CommitTable
          commits={commits}
          isLoading={commitsLoading}
          onOpenComments={setSelectedCommitSha}
          currentPage={currentPage}
          onPageChange={handlePageChange}
          hasNextPage={!!paginationLinks.next}
          hasPrevPage={!!paginationLinks.prev}
        />
      )}

      {/* Comments Preview Modal */}
      <CommentModal
        isOpen={selectedCommitSha !== null}
        onClose={() => setSelectedCommitSha(null)}
        commitSha={selectedCommitSha || ''}
        comments={activeCommentsForSha}
        isLoading={commentsLoading}
      />
    </div>
  );
};

export default App;
