import axios, { AxiosInstance, AxiosResponse } from 'axios';
import { CommitResponse, AuthorResponse, CommentResponse } from '../types';

class GithubService {
  private axiosInstance: AxiosInstance;

  constructor() {
    const token = process.env.GITHUB_TOKEN;
    const headers: Record<string, string> = {
      'Accept': 'application/vnd.github+json',
      'User-Agent': 'github-commit-viewer-api',
    };

    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }

    this.axiosInstance = axios.create({
      baseURL: 'https://api.github.com',
      headers,
      timeout: 15000,
    });
  }

  /**
   * Fetches commits for a repository
   */
  async fetchCommits(
    owner: string,
    repo: string,
    page: number = 1,
    perPage: number = 30,
    author?: string
  ): Promise<{ data: CommitResponse[]; headers: any }> {
    const params: Record<string, any> = {
      page,
      per_page: perPage,
    };

    if (author) {
      params.author = author;
    }

    const response = await this.axiosInstance.get(`/repos/${owner}/${repo}/commits`, {
      params,
    });

    const transformedData: CommitResponse[] = response.data.map((item: any) => {
      const commitTitle = item.commit?.message ? item.commit.message.split('\n')[0] : 'No commit message';
      
      return {
        sha: item.sha,
        authorName: item.commit?.author?.name || 'Unknown',
        authorUsername: item.author?.login || '',
        authorAvatar: item.author?.avatar_url || '',
        committerName: item.commit?.committer?.name || 'Unknown',
        committerUsername: item.committer?.login || '',
        committerAvatar: item.committer?.avatar_url || '',
        commitTitle,
        commitDate: item.commit?.author?.date || item.commit?.committer?.date || '',
        commentCount: item.commit?.comment_count || 0,
        htmlUrl: item.html_url || '',
      };
    });

    return {
      data: transformedData,
      headers: response.headers,
    };
  }

  /**
   * Fetches unique commit authors and counts their commits.
   * To build an accurate list, we will fetch up to 3 pages of 100 commits (300 total commits max)
   * to balance rate limits and data completeness.
   */
  async fetchAuthors(owner: string, repo: string): Promise<AuthorResponse[]> {
    const authorMap = new Map<string, AuthorResponse>();
    let page = 1;
    const perPage = 100;
    const maxPages = 3; // Limit to 300 commits to avoid hitting API limits
    let hasNextPage = true;

    while (page <= maxPages && hasNextPage) {
      const response: AxiosResponse<any[]> = await this.axiosInstance.get(`/repos/${owner}/${repo}/commits`, {
        params: {
          page,
          per_page: perPage,
        },
      });

      const commits = response.data;
      if (!commits || commits.length === 0) {
        break;
      }

      for (const item of commits) {
        // We group by login username if available, fallback to git author email for non-GitHub users
        const username = item.author?.login || item.commit?.author?.email || item.commit?.author?.name || 'Unknown';
        const name = item.commit?.author?.name || item.author?.name || null;
        const email = item.commit?.author?.email || null;
        const avatar = item.author?.avatar_url || '';
        const profileUrl = item.author?.html_url || '';

        const existing = authorMap.get(username);
        if (existing) {
          existing.commitCount += 1;
        } else {
          authorMap.set(username, {
            username,
            avatar,
            profileUrl,
            name,
            email,
            commitCount: 1,
          });
        }
      }

      // Check if there is a next page using Link header
      const linkHeader = response.headers['link'];
      if (linkHeader && linkHeader.includes('rel="next"')) {
        page++;
      } else {
        hasNextPage = false;
      }
    }

    return Array.from(authorMap.values()).sort((a, b) => b.commitCount - a.commitCount);
  }

  /**
   * Fetches all commit comments for a repository
   */
  async fetchComments(
    owner: string,
    repo: string,
    page: number = 1,
    perPage: number = 100
  ): Promise<{ data: CommentResponse[]; headers: any }> {
    const response = await this.axiosInstance.get(`/repos/${owner}/${repo}/comments`, {
      params: {
        page,
        per_page: perPage,
      },
    });

    const transformedData: CommentResponse[] = response.data.map((item: any) => {
      return {
        commitSha: item.commit_id,
        commenterAvatar: item.user?.avatar_url || '',
        commenterUsername: item.user?.login || 'Unknown',
        body: item.body || '',
        htmlUrl: item.html_url || '',
        createdAt: item.created_at || '',
      };
    });

    return {
      data: transformedData,
      headers: response.headers,
    };
  }
}

export default new GithubService();
