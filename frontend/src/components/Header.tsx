import React from 'react';
import { GitBranch } from 'lucide-react';
import './Header.css';

const Header: React.FC = () => {
  return (
    <header className="app-header glass-panel">
      <div className="header-logo-container">
        <div className="logo-glow-wrapper">
          <div className="logo-glow"></div>
          <div className="logo-icon-box">
            <GitBranch className="logo-icon" size={28} />
          </div>
        </div>
        <div className="header-text">
          <h1 className="header-title">
            Git<span className="text-gradient">Commit</span>
          </h1>
          <p className="header-subtitle">Analyze, filter, and explore repository commit activity</p>
        </div>
      </div>
      <div className="header-badge">
        <span className="badge-pulse"></span>
        API Active
      </div>
    </header>
  );
};

export default Header;
