export interface CommitResponse {
  sha: string;
  authorName: string;
  authorUsername: string;
  authorAvatar: string;
  committerName: string;
  committerUsername: string;
  committerAvatar: string;
  commitTitle: string;
  commitDate: string;
  commentCount: number;
  htmlUrl: string;
}

export interface AuthorResponse {
  username: string;
  avatar: string;
  profileUrl: string;
  name: string | null;
  email: string | null;
  commitCount: number;
}

export interface CommentResponse {
  commitSha: string;
  commenterAvatar: string;
  commenterUsername: string;
  body: string;
  htmlUrl: string;
  createdAt: string;
}
