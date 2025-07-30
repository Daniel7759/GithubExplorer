export interface GitHubRepository {
  id: number;
  name: string;
  full_name: string;
  description: string;
  html_url: string;
  stargazers_count: number;
  forks_count: number;
  watchers_count: number;
  language: string;
  created_at: string;
  updated_at: string;
  pushed_at: string;
  size: number;
  open_issues_count: number;
  topics: string[];
  owner: GitHubUser;
  license: {
    key: string;
    name: string;
  } | null;
}

export interface GitHubUser {
  id: number;
  login: string;
  avatar_url: string;
  html_url: string;
  name: string | null;
  bio: string | null;
  location: string | null;
  email: string | null;
  blog: string | null;
  twitter_username: string | null;
  public_repos: number;
  public_gists: number;
  followers: number;
  following: number;
  created_at: string;
  updated_at: string;
  company: string | null;
  hireable: boolean | null;
}

export interface GitHubSearchResponse<T> {
  total_count: number;
  incomplete_results: boolean;
  items: T[];
}

export interface SearchFilters {
  language: string;
  sort: 'stars' | 'forks' | 'updated' | 'created';
  order: 'asc' | 'desc';
  per_page: number;
  page: number;
}

export interface UserStats {
  totalStars: number;
  totalForks: number;
  languageDistribution: { [key: string]: number };
  repositoryTypes: { [key: string]: number };
  averageRepoSize: number;
}

export const POPULAR_LANGUAGES = [
  'JavaScript', 'TypeScript', 'Python', 'Java', 'C++', 'C#', 'PHP', 'Ruby',
  'Go', 'Rust', 'Swift', 'Kotlin', 'Dart', 'Vue', 'React', 'Angular'
] as const;

export type Language = typeof POPULAR_LANGUAGES[number] | 'All';