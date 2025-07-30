import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable, BehaviorSubject, map, catchError, of, throwError } from 'rxjs';
import { GitHubRepository, GitHubUser, GitHubSearchResponse, SearchFilters, UserStats } from '../types/github.types';

@Injectable({
  providedIn: 'root'
})
export class GitHubService {
  private readonly baseUrl = 'https://api.github.com';
  private loadingSubject = new BehaviorSubject<boolean>(false);
  private errorSubject = new BehaviorSubject<string | null>(null);

  constructor(private http: HttpClient) {}

  searchRepositories(query: string, filters: Partial<SearchFilters> = {}): Observable<GitHubSearchResponse<GitHubRepository>> {
    this.setLoading(true);
    this.clearError();

    let searchQuery = query || 'stars:>1';
    
    if (filters.language && filters.language !== 'All') {
      searchQuery += ` language:${filters.language.toLowerCase()}`;
    }

    const params = new HttpParams()
      .set('q', searchQuery)
      .set('sort', filters.sort || 'stars')
      .set('order', filters.order || 'desc')
      .set('per_page', (filters.per_page || 30).toString())
      .set('page', (filters.page || 1).toString());

    return this.http.get<GitHubSearchResponse<GitHubRepository>>(`${this.baseUrl}/search/repositories`, { params })
      .pipe(
        map(response => {
          this.setLoading(false);
          return response;
        }),
        catchError(error => {
          this.setLoading(false);
          this.setError(this.getErrorMessage(error));
          return throwError(() => error);
        })
      );
  }

  getUser(username: string): Observable<GitHubUser> {
    this.setLoading(true);
    this.clearError();

    return this.http.get<GitHubUser>(`${this.baseUrl}/users/${username}`)
      .pipe(
        map(user => {
          this.setLoading(false);
          return user;
        }),
        catchError(error => {
          this.setLoading(false);
          this.setError(this.getErrorMessage(error));
          return throwError(() => error);
        })
      );
  }

  getUserRepositories(username: string, page: number = 1, perPage: number = 30): Observable<GitHubRepository[]> {
    const params = new HttpParams()
      .set('type', 'public')
      .set('sort', 'updated')
      .set('per_page', perPage.toString())
      .set('page', page.toString());

    return this.http.get<GitHubRepository[]>(`${this.baseUrl}/users/${username}/repos`, { params })
      .pipe(
        catchError(error => {
          this.setError(this.getErrorMessage(error));
          return of([]);
        })
      );
  }

  calculateUserStats(repositories: GitHubRepository[]): UserStats {
    const stats: UserStats = {
      totalStars: 0,
      totalForks: 0,
      languageDistribution: {},
      repositoryTypes: {},
      averageRepoSize: 0
    };

    let totalSize = 0;

    for (const repo of repositories) {
      stats.totalStars += repo.stargazers_count;
      stats.totalForks += repo.forks_count;
      totalSize += repo.size;

      // Language distribution
      if (repo.language) {
        stats.languageDistribution[repo.language] = (stats.languageDistribution[repo.language] || 0) + 1;
      }

      // Repository types based on topics and characteristics
      if (repo.topics.length > 0) {
        const type = this.categorizeRepository(repo);
        stats.repositoryTypes[type] = (stats.repositoryTypes[type] || 0) + 1;
      } else {
        stats.repositoryTypes['Other'] = (stats.repositoryTypes['Other'] || 0) + 1;
      }
    }

    stats.averageRepoSize = repositories.length > 0 ? Math.round(totalSize / repositories.length) : 0;

    return stats;
  }

  // Obtener datos reales de estrellas por mes para un repositorio
  getStarsPerMonth(owner: string, repo: string): Observable<{ labels: string[], values: number[] }> {
    // Usar los mismos datos de commits reales para el gráfico de actividad
    return this.getCommitsPerMonth(owner, repo);
  }

  // Obtener datos reales de commits por mes para un repositorio
  getCommitsPerMonth(owner: string, repo: string): Observable<{ labels: string[], values: number[] }> {
    // Obtener commits reales de los últimos 12 meses
    const oneYearAgo = new Date();
    oneYearAgo.setFullYear(oneYearAgo.getFullYear() - 1);

    const params = new HttpParams()
      .set('since', oneYearAgo.toISOString())
      .set('per_page', '100'); // GitHub limita a 100 por página

    return this.http.get<any[]>(`${this.baseUrl}/repos/${owner}/${repo}/commits`, { params })
      .pipe(
        map(commits => {
          if (!commits || commits.length === 0) {
            return this.generateEmptyData();
          }

          // Agrupar commits reales por mes
          const monthlyData: { [key: string]: number } = {};

          // Inicializar todos los meses con 0
          for (let i = 11; i >= 0; i--) {
            const date = new Date();
            date.setMonth(date.getMonth() - i);
            const monthKey = date.toLocaleString('default', { month: 'short', year: '2-digit' });
            monthlyData[monthKey] = 0;
          }

          // Contar commits reales por mes - usando la estructura correcta del JSON
          commits.forEach(commit => {
            // La fecha está en commit.commit.author.date según tu JSON
            const commitDate = new Date(commit.commit.author.date);
            const monthKey = commitDate.toLocaleString('default', { month: 'short', year: '2-digit' });

            if (monthlyData.hasOwnProperty(monthKey)) {
              monthlyData[monthKey]++;
            }
          });

          const labels = Object.keys(monthlyData);
          const values = Object.values(monthlyData);

          console.log('Commits procesados por mes:', monthlyData);
          console.log('Total commits encontrados:', commits.length);

          return { labels, values };
        }),
        catchError(error => {
          console.error('Error fetching commits:', error);
          return of(this.generateEmptyData());
        })
      );
  }

  // Obtener información adicional del repositorio
  getRepositoryDetails(owner: string, repo: string): Observable<any> {
    return this.http.get<any>(`${this.baseUrl}/repos/${owner}/${repo}`)
      .pipe(
        catchError(error => {
          console.error('Error fetching repository details:', error);
          return of(null);
        })
      );
  }

  // Obtener contribuidores del repositorio
  getRepositoryContributors(owner: string, repo: string): Observable<any[]> {
    return this.http.get<any[]>(`${this.baseUrl}/repos/${owner}/${repo}/contributors?per_page=5`)
      .pipe(
        catchError(error => {
          console.error('Error fetching contributors:', error);
          return of([]);
        })
      );
  }

  // Obtener lenguajes del repositorio
  getRepositoryLanguages(owner: string, repo: string): Observable<{ [key: string]: number }> {
    return this.http.get<{ [key: string]: number }>(`${this.baseUrl}/repos/${owner}/${repo}/languages`)
      .pipe(
        catchError(error => {
          console.error('Error fetching languages:', error);
          return of({});
        })
      );
  }

  // Método para generar datos vacíos en lugar de datos falsos
  private generateEmptyData(): { labels: string[], values: number[] } {
    const labels = Array.from({length: 12}, (_, i) => {
      const date = new Date();
      date.setMonth(date.getMonth() - (11 - i));
      return date.toLocaleString('default', { month: 'short', year: '2-digit' });
    });
    const values = Array.from({length: 12}, () => 0); // Todos en 0
    return { labels, values };
  }

  private categorizeRepository(repo: GitHubRepository): string {
    const topics = repo.topics.map(t => t.toLowerCase());
    const name = repo.name.toLowerCase();
    const description = (repo.description || '').toLowerCase();

    if (topics.some(t => ['frontend', 'ui', 'css', 'html', 'react', 'vue', 'angular'].includes(t))) {
      return 'Frontend';
    }
    if (topics.some(t => ['backend', 'api', 'server', 'database', 'nodejs'].includes(t))) {
      return 'Backend';
    }
    if (topics.some(t => ['mobile', 'android', 'ios', 'flutter', 'react-native'].includes(t))) {
      return 'Mobile';
    }
    if (topics.some(t => ['machine-learning', 'ai', 'ml', 'data-science', 'tensorflow', 'pytorch'].includes(t))) {
      return 'AI/ML';
    }
    if (topics.some(t => ['tool', 'cli', 'utility', 'automation'].includes(t)) || name.includes('tool')) {
      return 'Tools';
    }
    if (topics.some(t => ['game', 'gaming', 'unity', 'engine'].includes(t)) || description.includes('game')) {
      return 'Games';
    }
    if (topics.some(t => ['library', 'framework', 'package', 'npm'].includes(t))) {
      return 'Library';
    }

    return 'Other';
  }

  private setLoading(loading: boolean): void {
    this.loadingSubject.next(loading);
  }

  private setError(error: string | null): void {
    this.errorSubject.next(error);
  }

  private clearError(): void {
    this.errorSubject.next(null);
  }

  private getErrorMessage(error: any): string {
    if (error.status === 403) {
      return 'API rate limit exceeded. Please try again later.';
    }
    if (error.status === 404) {
      return 'Resource not found.';
    }
    if (error.status === 422) {
      return 'Invalid search query.';
    }
    return error.message || 'An unexpected error occurred.';
  }
}