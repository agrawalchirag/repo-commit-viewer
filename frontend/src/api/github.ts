import axios from 'axios';
import { CommitResponse, AuthorResponse, CommentResponse } from '../types';

const api = axios.create({
  baseURL: '', // Empty base URL since we use proxy
  timeout: 20000,
});

export interface PaginationLinks {
  next?: number;
  prev?: number;
  first?: number;
  last?: number;
}

/**
 * Parses GitHub link headers for pagination
 * e.g., <https://api.github.com/...page=2...>; rel="next"
 */
export const parseLinkHeader = (header: string | null): PaginationLinks => {
  if (!header) return {};
  const links: PaginationLinks = {};
  const parts = header.split(',');
  
  parts.forEach(part => {
    const section = part.split(';');
    if (section.length < 2) return;
    const url = section[0].replace(/<(.*)>/, '$1').trim();
    const rel = section[1].replace(/rel="(.*)"/, '$1').trim();
    
    const pageUrl = new URL(url);
    const page = pageUrl.searchParams.get('page');
    if (page) {
      links[rel as keyof PaginationLinks] = parseInt(page, 10);
    }
  });
  
  return links;
};

/**
 * Fetches commits with pagination and author filtering
 */
export const getCommits = async (
  owner: string,
  repo: string,
  page: number = 1,
  perPage: number = 20,
  author?: string
): Promise<{ commits: CommitResponse[]; pagination: PaginationLinks }> => {
  const response = await api.get<CommitResponse[]>(`/api/repos/${owner}/${repo}/commits`, {
    params: { page, per_page: perPage, author },
  });
  
  const linkHeader = response.headers['link'] || null;
  
  return {
    commits: response.data,
    pagination: parseLinkHeader(linkHeader),
  };
};

/**
 * Fetches all unique commit authors
 */
export const getAuthors = async (owner: string, repo: string): Promise<AuthorResponse[]> => {
  const response = await api.get<AuthorResponse[]>(`/api/repos/${owner}/${repo}/authors`);
  return response.data;
};

/**
 * Fetches commit comments
 */
export const getComments = async (
  owner: string,
  repo: string,
  page: number = 1,
  perPage: number = 100
): Promise<{ comments: CommentResponse[]; pagination: PaginationLinks }> => {
  const response = await api.get<CommentResponse[]>(`/api/repos/${owner}/${repo}/comments`, {
    params: { page, per_page: perPage },
  });
  
  const linkHeader = response.headers['link'] || null;
  
  return {
    comments: response.data,
    pagination: parseLinkHeader(linkHeader),
  };
};
