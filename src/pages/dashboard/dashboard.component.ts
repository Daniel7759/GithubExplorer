import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { GitHubService } from '../../services/github.service';
import { RepositoryCardComponent } from '../../components/repository-card/repository-card.component';
import { LoadingSkeletonComponent } from '../../components/loading-skeleton/loading-skeleton.component';
import { GitHubRepository, SearchFilters, POPULAR_LANGUAGES, Language, GitHubSearchResponse } from '../../types/github.types';
import { BehaviorSubject, debounceTime, distinctUntilChanged, switchMap, catchError, of } from 'rxjs';
import { Router } from '@angular/router';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, FormsModule, RepositoryCardComponent, LoadingSkeletonComponent],
  template: `
    <div class="min-h-screen bg-gray-50 dark:bg-dark-900 py-8">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <!-- Hero Section -->
        <div class="text-center mb-12">
          <h1 class="text-4xl dark:text-primary-50 font-bold gradient-text mb-4">
            Discover Amazing Projects
          </h1>
          <p class="text-lg text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
            Explore trending repositories, discover new technologies, and find inspiration from the GitHub community.
          </p>
        </div>

        <!-- Search and Filters -->
        <div class="glass-effect rounded-2xl p-6 mb-8 border border-gray-200 dark:border-gray-700">
          <div class="grid grid-cols-1 md:grid-cols-12 gap-4">
            <!-- Search Input -->
            <div class="md:col-span-5">
              <label for="search" class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Search repositories
              </label>
              <input id="search"
                     type="text"
                     [(ngModel)]="searchQuery"
                     (input)="onSearchChange()"
                     placeholder="Search by name, description, or topic..."
                     class="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent bg-white dark:bg-dark-800 text-gray-900 dark:text-white">
            </div>

            <!-- Language Filter -->
            <div class="md:col-span-3">
              <label for="language" class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Language
              </label>
              <select id="language"
                      [(ngModel)]="filters.language"
                      (change)="onFiltersChange()"
                      class="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent bg-white dark:bg-dark-800 text-gray-900 dark:text-white">
                <option value="All">All Languages</option>
                @for (language of popularLanguages; track language) {
                  <option [value]="language">{{ language }}</option>
                }
              </select>
            </div>

            <!-- Sort By -->
            <div class="md:col-span-2">
              <label for="sort" class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Sort by
              </label>
              <select id="sort"
                      [(ngModel)]="filters.sort"
                      (change)="onFiltersChange()"
                      class="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent bg-white dark:bg-dark-800 text-gray-900 dark:text-white">
                <option value="stars">Stars</option>
                <option value="forks">Forks</option>
                <option value="updated">Updated</option>
                <option value="created">Created</option>
              </select>
            </div>

            <!-- Order -->
            <div class="md:col-span-2">
              <label for="order" class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Order
              </label>
              <select id="order"
                      [(ngModel)]="filters.order"
                      (change)="onFiltersChange()"
                      class="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent bg-white dark:bg-dark-800 text-gray-900 dark:text-white">
                <option value="desc">Descending</option>
                <option value="asc">Ascending</option>
              </select>
            </div>
          </div>

          <!-- Quick Filter Tags -->
          <div class="flex flex-wrap gap-2 mt-4">
            @for (tag of quickFilters; track tag.label) {
              <button (click)="applyQuickFilter(tag)"
                      class="px-3 py-1 text-sm bg-primary-100 dark:bg-primary-900/30 text-primary-700 dark:text-primary-300 rounded-full hover:bg-primary-200 dark:hover:bg-primary-900/50 transition-colors">
                {{ tag.label }}
              </button>
            }
          </div>
        </div>

        <!-- Results Summary -->
        @if (searchResults) {
          <div class="flex items-center justify-between mb-6">
            <div class="text-sm text-gray-600 dark:text-gray-400">
              @if (searchResults.total_count > 0) {
                Found {{ formatNumber(searchResults.total_count) }} repositories
                @if (searchQuery) {
                  for "{{ searchQuery }}"
                }
                @if (filters.language !== 'All') {
                  in {{ filters.language }}
                }
              } @else {
                No repositories found
              }
            </div>
            @if (searchResults.total_count > 0) {
              <div class="flex items-center space-x-4">
                <span class="text-sm text-gray-600 dark:text-gray-400">
                  Page {{ filters.page }} of {{ Math.ceil(searchResults.total_count / filters.per_page) }}
                </span>
                <div class="flex space-x-1">
                  <button (click)="previousPage()"
                          [disabled]="filters.page <= 1"
                          class="dark:text-primary-50 px-3 py-1 text-sm bg-white dark:bg-dark-800 border border-gray-300 dark:border-gray-600 rounded disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50 dark:hover:bg-dark-700 transition-colors">
                    Previous
                  </button>
                  <button (click)="nextPage()"
                          [disabled]="filters.page >= Math.ceil(searchResults.total_count / filters.per_page)"
                          class="dark:text-primary-50 px-3 py-1 text-sm bg-white dark:bg-dark-800 border border-gray-300 dark:border-gray-600 rounded disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50 dark:hover:bg-dark-700 transition-colors">
                    Next
                  </button>
                </div>
              </div>
            }
          </div>
        }

        <!-- Repository Grid -->
        @if (loading) {
          <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            @for (item of [1,2,3,4,5,6]; track item) {
              <app-loading-skeleton type="repository"></app-loading-skeleton>
            }
          </div>
        } @else if (error) {
          <div class="text-center py-12">
            <div class="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-6 max-w-md mx-auto">
              <svg class="mx-auto h-12 w-12 text-red-400 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z"/>
              </svg>
              <h3 class="text-lg font-medium text-red-800 dark:text-red-200 mb-2">
                Error loading repositories
              </h3>
              <p class="text-red-600 dark:text-red-300 mb-4">{{ error }}</p>
              <button (click)="retrySearch()"
                      class="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg transition-colors">
                Try Again
              </button>
            </div>
          </div>
        } @else if (searchResults && searchResults.items && searchResults.items.length > 0) {
          <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 animate-fade-in">
            @for (repository of searchResults.items; track repository.id) {
              <div class="cursor-pointer" (click)="onRepositoryClick(repository)">
                <app-repository-card 
                  [repository]="repository"
                  (favoriteToggled)="onFavoriteToggled()">
                </app-repository-card>
              </div>
            }
          </div>
        } @else {
          <div class="text-center py-12">
            <svg class="mx-auto h-12 w-12 text-gray-400 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"/>
            </svg>
            <h3 class="text-lg font-medium text-gray-900 dark:text-white mb-2">
              No repositories found
            </h3>
            <p class="text-gray-500 dark:text-gray-400 mb-4">
              Try adjusting your search criteria or explore trending repositories.
            </p>
            <button (click)="showTrending()"
                    class="bg-primary-600 hover:bg-primary-700 text-white px-4 py-2 rounded-lg transition-colors">
              Show Trending
            </button>
          </div>
        }
      </div>
    </div>
  `
})
export class DashboardComponent implements OnInit {
  searchQuery = '';
  searchResults: GitHubSearchResponse<GitHubRepository> | null = null;
  loading = false;
  error: string | null = null;
  
  filters: SearchFilters = {
    language: 'All',
    sort: 'stars',
    order: 'desc',
    per_page: 30,
    page: 1
  };

  popularLanguages: Language[] = ['All', ...POPULAR_LANGUAGES];
  
  quickFilters = [
    { label: 'Trending Today', query: 'created:>2024-01-01', filters: { sort: 'stars' as const } },
    { label: 'Most Stars', query: 'stars:>1000', filters: { sort: 'stars' as const } },
    { label: 'React Projects', query: '', filters: { language: 'React' as Language } },
    { label: 'TypeScript', query: '', filters: { language: 'TypeScript' as Language } },
    { label: 'Open Source', query: 'is:public', filters: {} },
    { label: 'Recently Updated', query: 'pushed:>2024-01-01', filters: { sort: 'updated' as const } }
  ];

  private searchSubject = new BehaviorSubject<{query: string, filters: SearchFilters}>({
    query: '',
    filters: {
      language: 'All',
      sort: 'stars',
      order: 'desc',
      per_page: 30,
      page: 1
    }
  });

  Math = Math;

  constructor(private githubService: GitHubService, private router: Router) {}

  ngOnInit(): void {
    this.setupSearch();
    this.loadInitialData();
  }

  private setupSearch(): void {
    this.searchSubject.pipe(
      debounceTime(500),
      distinctUntilChanged((prev, curr) =>
        prev.query === curr.query &&
        prev.filters.page === curr.filters.page &&
        prev.filters.language === curr.filters.language &&
        prev.filters.sort === curr.filters.sort &&
        prev.filters.order === curr.filters.order
      ),
      switchMap(({query, filters}) => {
        this.loading = true;
        this.error = null;
        return this.githubService.searchRepositories(query, filters).pipe(
          catchError(error => {
            this.error = error.message || 'An error occurred';
            this.loading = false;
            return of(null);
          })
        );
      })
    ).subscribe(result => {
      this.searchResults = result;
      this.loading = false;
    });
  }

  private loadInitialData(): void {
    this.searchSubject.next({query: 'stars:>1000', filters: this.filters});
  }

  onSearchChange(): void {
    this.filters.page = 1;
    this.searchSubject.next({query: this.searchQuery || 'stars:>1000', filters: this.filters});
  }

  onFiltersChange(): void {
    this.filters.page = 1;
    this.searchSubject.next({query: this.searchQuery || 'stars:>1000', filters: this.filters});
  }

  applyQuickFilter(quickFilter: any): void {
    this.searchQuery = quickFilter.query;
    this.filters = { ...this.filters, ...quickFilter.filters, page: 1 };
    this.searchSubject.next({query: this.searchQuery || 'stars:>1000', filters: this.filters});
  }

  nextPage(): void {
    if (this.searchResults && this.filters.page < Math.ceil(this.searchResults.total_count / this.filters.per_page)) {
      this.filters.page++;
      this.executeSearch();
    }
  }

  previousPage(): void {
    if (this.filters.page > 1) {
      this.filters.page--;
      this.executeSearch();
    }
  }

  private executeSearch(): void {
    this.loading = true;
    this.error = null;

    const query = this.searchQuery || 'stars:>1000';

    this.githubService.searchRepositories(query, this.filters).pipe(
      catchError(error => {
        this.error = error.message || 'An error occurred';
        this.loading = false;
        return of(null);
      })
    ).subscribe(result => {
      this.searchResults = result;
      this.loading = false;
    });
  }

  retrySearch(): void {
    this.error = null;
    this.searchSubject.next({query: this.searchQuery || 'stars:>1000', filters: this.filters});
  }

  showTrending(): void {
    this.searchQuery = '';
    this.filters = {
      language: 'All',
      sort: 'stars',
      order: 'desc',
      per_page: 30,
      page: 1
    };
    this.searchSubject.next({query: 'stars:>1000', filters: this.filters});
  }

  onFavoriteToggled(): void {
    // This could trigger additional logic if needed
  }

  onRepositoryClick(repository: GitHubRepository): void {
    const owner = repository.owner?.login;
    const repo = repository.name;
    if (owner && repo) {
      this.router.navigate(['/repository', owner, repo]).then(r => {
        if (!r) {
          console.error('Navigation failed');
        }
      });
    }
  }


  formatNumber(num: number): string {
    if (num >= 1000000) {
      return (num / 1000000).toFixed(1) + 'M';
    }
    if (num >= 1000) {
      return (num / 1000).toFixed(1) + 'k';
    }
    return num.toString();
  }
}