import React, { useEffect, useRef } from 'react';
import { X, MessageSquare, ExternalLink } from 'lucide-react';
import { CommentResponse } from '../types';
import './CommentModal.css';

interface CommentModalProps {
  isOpen: boolean;
  onClose: () => void;
  commitSha: string;
  comments: CommentResponse[];
  isLoading: boolean;
}

const CommentModal: React.FC<CommentModalProps> = ({
  isOpen,
  onClose,
  commitSha,
  comments,
  isLoading,
}) => {
  const modalRef = useRef<HTMLDivElement>(null);

  // Close modal on Escape key press
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };

    if (isOpen) {
      document.body.style.overflow = 'hidden'; // Lock background scroll
      window.addEventListener('keydown', handleKeyDown);
    }

    return () => {
      document.body.style.overflow = '';
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen, onClose]);

  // Close modal when clicking outside of contents
  const handleBackdropClick = (e: React.MouseEvent) => {
    if (modalRef.current && !modalRef.current.contains(e.target as Node)) {
      onClose();
    }
  };

  // Format comments date
  const formatCommentDate = (dateStr: string) => {
    if (!dateStr) return '';
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

  if (!isOpen) return null;

  return (
    <div className="modal-backdrop" onClick={handleBackdropClick}>
      <div className="modal-container glass-panel" ref={modalRef}>
        {/* Modal Header */}
        <div className="modal-header">
          <div className="modal-title-box">
            <MessageSquare className="modal-title-icon" size={20} />
            <div>
              <h3>Commit Comments</h3>
              <p className="modal-subtitle">Commit: <span className="modal-sha">{commitSha.substring(0, 10)}</span></p>
            </div>
          </div>
          <button className="modal-close-btn" onClick={onClose} aria-label="Close modal">
            <X size={20} />
          </button>
        </div>

        {/* Modal Content */}
        <div className="modal-body">
          {isLoading ? (
            <div className="modal-loading">
              <div className="modal-spinner"></div>
              <span>Fetching comments...</span>
            </div>
          ) : comments.length === 0 ? (
            <div className="modal-empty-state">
              <p>No comments found for this commit.</p>
            </div>
          ) : (
            <div className="comments-list">
              {comments.map((comment, index) => (
                <div key={index} className="comment-card">
                  <div className="comment-header">
                    <div className="comment-user">
                      {comment.commenterAvatar ? (
                        <img
                          src={comment.commenterAvatar}
                          alt={comment.commenterUsername}
                          className="commenter-avatar"
                        />
                      ) : (
                        <div className="commenter-avatar-placeholder">
                          {comment.commenterUsername.charAt(0).toUpperCase()}
                        </div>
                      )}
                      <div className="commenter-info">
                        <span className="commenter-username">@{comment.commenterUsername}</span>
                        <span className="comment-date">{formatCommentDate(comment.createdAt)}</span>
                      </div>
                    </div>
                    <a
                      href={comment.htmlUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="view-comment-link"
                      title="View comment thread on GitHub"
                    >
                      <span>View Thread</span>
                      <ExternalLink size={12} />
                    </a>
                  </div>
                  <div className="comment-content">
                    <p className="comment-body-text">{comment.body}</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default CommentModal;
