import { Router, Request, Response, NextFunction } from 'express';
import githubService from '../services/githubService';

const router = Router();

// Helper to copy useful headers from GitHub API to Express response
const forwardHeaders = (githubHeaders: any, res: Response) => {
  const headersToForward = [
    'link',
    'x-ratelimit-limit',
    'x-ratelimit-remaining',
    'x-ratelimit-reset',
    'x-oauth-scopes',
    'x-accepted-oauth-scopes'
  ];

  headersToForward.forEach(header => {
    if (githubHeaders[header]) {
      res.setHeader(header, githubHeaders[header]);
      // Expose headers for cross-origin access (CORS)
      res.setHeader('Access-Control-Expose-Headers', headersToForward.join(', '));
    }
  });
};

/**
 * Endpoint 1: Get commits for a repository
 * GET /api/repos/:owner/:repo/commits
 */
router.get('/repos/:owner/:repo/commits', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { owner, repo } = req.params;
    const page = parseInt(req.query.page as string) || 1;
    const perPage = parseInt(req.query.per_page as string) || 30;
    const author = req.query.author as string | undefined;

    if (!owner || !repo) {
      return res.status(400).json({ error: 'Owner and Repo parameters are required' });
    }

    const { data, headers } = await githubService.fetchCommits(owner, repo, page, perPage, author);
    
    forwardHeaders(headers, res);
    return res.json(data);
  } catch (error: any) {
    if (error.response) {
      const status = error.response.status;
      const message = error.response.data?.message || 'GitHub API Error';
      return res.status(status).json({ error: message });
    }
    return next(error);
  }
});

/**
 * Endpoint 2: Get unique commit authors for a repository
 * GET /api/repos/:owner/:repo/authors
 */
router.get('/repos/:owner/:repo/authors', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { owner, repo } = req.params;

    if (!owner || !repo) {
      return res.status(400).json({ error: 'Owner and Repo parameters are required' });
    }

    const data = await githubService.fetchAuthors(owner, repo);
    return res.json(data);
  } catch (error: any) {
    if (error.response) {
      const status = error.response.status;
      const message = error.response.data?.message || 'GitHub API Error';
      return res.status(status).json({ error: message });
    }
    return next(error);
  }
});

/**
 * Endpoint 3: Get commit comments for a repository
 * GET /api/repos/:owner/:repo/comments
 */
router.get('/repos/:owner/:repo/comments', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { owner, repo } = req.params;
    const page = parseInt(req.query.page as string) || 1;
    const perPage = parseInt(req.query.per_page as string) || 100;

    if (!owner || !repo) {
      return res.status(400).json({ error: 'Owner and Repo parameters are required' });
    }

    const { data, headers } = await githubService.fetchComments(owner, repo, page, perPage);
    
    forwardHeaders(headers, res);
    return res.json(data);
  } catch (error: any) {
    if (error.response) {
      const status = error.response.status;
      const message = error.response.data?.message || 'GitHub API Error';
      return res.status(status).json({ error: message });
    }
    return next(error);
  }
});

export default router;
