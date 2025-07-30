import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { GitHubService } from '../../services/github.service';
import { UserCardComponent } from '../../components/user-card/user-card.component';
import { RepositoryCardComponent } from '../../components/repository-card/repository-card.component';
import { LoadingSkeletonComponent } from '../../components/loading-skeleton/loading-skeleton.component';
import { GitHubUser, GitHubRepository, UserStats } from '../../types/github.types';

@Component({
  selector: 'app-explore',
  standalone: true,
  imports: [CommonModule, FormsModule, UserCardComponent, RepositoryCardComponent, LoadingSkeletonComponent],
  template: `
    <div class="min-h-screen bg-gray-50 dark:bg-dark-900 py-8">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <!-- Hero Section -->
        <div class="text-center mb-12">
          <h1 class="dark:text-primary-50 text-4xl font-bold gradient-text mb-4">
            Explore Developers
          </h1>
          <p class="text-lg text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
            Discover talented developers, explore their projects, and get insights into their coding journey.
          </p>
        </div>

        <!-- Search Section -->
        <div class="glass-effect rounded-2xl p-6 mb-8 border border-gray-200 dark:border-gray-700">
          <div class="max-w-md mx-auto">
            <label for="username" class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Search GitHub Users
            </label>
            <div class="flex">
              <input id="username"
                     type="text"
                     [(ngModel)]="searchUsername"
                     (keyup.enter)="searchUser()"
                     placeholder="Enter GitHub username..."
                     class="flex-1 px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-l-lg bg-white dark:bg-dark-800 text-gray-900 dark:text-white">
              <button (click)="searchUser()"
                      [disabled]="!searchUsername.trim() || userLoading"
                      class="px-6 py-2 bg-primary-600 hover:bg-primary-700 disabled:bg-gray-400 text-white rounded-r-lg transition-colors flex items-center space-x-2">
                @if (userLoading) {
                  <svg class="animate-spin w-4 h-4" fill="none" viewBox="0 0 24 24">
                    <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                    <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                } @else {
                  <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"/>
                  </svg>
                }
                <span>Search</span>
              </button>
            </div>
          </div>

          <!-- Popular Users Suggestions -->
          <div class="mt-4 text-center">
            <p class="text-sm text-gray-500 dark:text-gray-400 mb-2">Popular developers:</p>
            <div class="flex flex-wrap justify-center gap-2">
              @for (user of popularUsers; track user) {
                <button (click)="searchSpecificUser(user)"
                        class="px-3 py-1 text-sm bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-full hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors">
                  {{ user }}
                </button>
              }
            </div>
          </div>
        </div>

        <!-- User Profile Section -->
        @if (selectedUser) {
          <div class="mb-8 animate-fade-in">
            <div class="grid grid-cols-1 lg:grid-cols-3 gap-8">
              <!-- User Card -->
              <div class="lg:col-span-1">
                <app-user-card [user]="selectedUser" (favoriteToggled)="onFavoriteToggled()"></app-user-card>
                
                <!-- User Stats -->
                @if (userStats) {
                  <div class="mt-6 bg-white dark:bg-dark-800 rounded-xl shadow-lg p-6 border border-gray-200 dark:border-gray-700">
                    <h3 class="text-lg font-semibold text-gray-900 dark:text-white mb-4">Statistics</h3>
                    
                    <div class="space-y-4">
                      <div class="flex justify-between items-center">
                        <span class="text-sm text-gray-600 dark:text-gray-300">Total Stars</span>
                        <span class="font-semibold text-gray-900 dark:text-white">{{ formatNumber(userStats.totalStars) }}</span>
                      </div>
                      <div class="flex justify-between items-center">
                        <span class="text-sm text-gray-600 dark:text-gray-300">Total Forks</span>
                        <span class="font-semibold text-gray-900 dark:text-white">{{ formatNumber(userStats.totalForks) }}</span>
                      </div>
                      <div class="flex justify-between items-center">
                        <span class="text-sm text-gray-600 dark:text-gray-300">Avg Repo Size</span>
                        <span class="font-semibold text-gray-900 dark:text-white">{{ formatSize(userStats.averageRepoSize) }}</span>
                      </div>
                    </div>

                    <!-- Top Languages -->
                    @if (topLanguages.length > 0) {
                      <div class="mt-6">
                        <h4 class="text-sm font-medium text-gray-900 dark:text-white mb-3">Top Languages</h4>
                        <div class="space-y-2">
                          @for (lang of topLanguages; track lang.name) {
                            <div class="flex items-center justify-between">
                              <div class="flex items-center space-x-2">
                                <div class="w-3 h-3 rounded-full" [style.background-color]="getLanguageColor(lang.name)"></div>
                                <span class="text-sm text-gray-600 dark:text-gray-300">{{ lang.name }}</span>
                              </div>
                              <span class="text-sm font-medium text-gray-900 dark:text-white">{{ lang.count }}</span>
                            </div>
                          }
                        </div>
                      </div>
                    }
                  </div>
                }
              </div>

              <!-- Repositories Grid -->
              <div class="lg:col-span-2">
                <div class="flex items-center justify-between mb-6">
                  <h3 class="text-xl font-semibold text-gray-900 dark:text-white">
                    Repositories ({{ userRepositories.length }})
                  </h3>
                  @if (userRepositories.length > 0) {
                    <select [(ngModel)]="repoSortBy" 
                            (change)="sortRepositories()"
                            class="px-3 py-1 text-sm border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-dark-800 text-gray-900 dark:text-white">
                      <option value="updated">Recently Updated</option>
                      <option value="stars">Most Stars</option>
                      <option value="forks">Most Forks</option>
                      <option value="name">Name</option>
                    </select>
                  }
                </div>

                @if (reposLoading) {
                  <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
                    @for (item of [1,2,3,4]; track item) {
                      <app-loading-skeleton type="repository"></app-loading-skeleton>
                    }
                  </div>
                } @else if (sortedRepositories.length > 0) {
                  <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
                    @for (repo of sortedRepositories; track repo.id) {
                      <app-repository-card 
                        [repository]="repo"
                        (favoriteToggled)="onFavoriteToggled()">
                      </app-repository-card>
                    }
                  </div>
                } @else {
                  <div class="text-center py-8">
                    <svg class="mx-auto h-12 w-12 text-gray-400 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"/>
                    </svg>
                    <p class="text-gray-500 dark:text-gray-400">No public repositories found</p>
                  </div>
                }
              </div>
            </div>
          </div>
        }

        <!-- Error State -->
        @if (userError) {
          <div class="text-center py-12">
            <div class="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-6 max-w-md mx-auto">
              <svg class="mx-auto h-12 w-12 text-red-400 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z"/>
              </svg>
              <h3 class="text-lg font-medium text-red-800 dark:text-red-200 mb-2">
                User not found
              </h3>
              <p class="text-red-600 dark:text-red-300 mb-4">{{ userError }}</p>
              <button (click)="clearError()"
                      class="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg transition-colors">
                Try Again
              </button>
            </div>
          </div>
        }

        <!-- Empty State -->
        @if (!selectedUser && !userLoading && !userError) {
          <div class="text-center py-12">
            <svg class="mx-auto h-16 w-16 text-gray-400 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"/>
            </svg>
            <h3 class="text-xl font-medium text-gray-900 dark:text-white mb-2">
              Explore GitHub Developers
            </h3>
            <p class="text-gray-500 dark:text-gray-400 mb-6">
              Search for any GitHub user to view their profile, repositories, and statistics.
            </p>
            <div class="flex flex-wrap justify-center gap-2">
              @for (user of popularUsers.slice(0, 3); track user) {
                <button (click)="searchSpecificUser(user)"
                        class="bg-primary-600 hover:bg-primary-700 text-white px-4 py-2 rounded-lg transition-colors">
                  Explore {{ user }}
                </button>
              }
            </div>
          </div>
        }
      </div>
    </div>
  `
})
export class ExploreComponent implements OnInit {
  searchUsername = '';
  selectedUser: GitHubUser | null = null;
  userRepositories: GitHubRepository[] = [];
  sortedRepositories: GitHubRepository[] = [];
  userStats: UserStats | null = null;
  userLoading = false;
  reposLoading = false;
  userError: string | null = null;
  repoSortBy = 'updated';

  popularUsers = ['torvalds', 'gaearon', 'sindresorhus', 'tj', 'addyosmani', 'paulirish', 'ryanflorence', 'kentcdodds'];

  constructor(private githubService: GitHubService) {}

  ngOnInit(): void {}

  searchUser(): void {
    if (!this.searchUsername.trim()) return;

    this.userLoading = true;
    this.userError = null;
    this.selectedUser = null;
    this.userRepositories = [];
    this.userStats = null;

    this.githubService.getUser(this.searchUsername.trim()).subscribe({
      next: (user) => {
        this.selectedUser = user;
        this.userLoading = false;
        this.loadUserRepositories();
        // this.loadUserActivity(); // Comentado temporalmente
      },
      error: (error) => {
        this.userError = error.message || 'User not found';
        this.userLoading = false;
      }
    });
  }

  searchSpecificUser(username: string): void {
    this.searchUsername = username;
    this.searchUser();
  }

  private loadUserRepositories(): void {
    if (!this.selectedUser) return;

    this.reposLoading = true;
    this.githubService.getUserRepositories(this.selectedUser.login, 1, 100).subscribe({
      next: (repos) => {
        this.userRepositories = repos;
        this.sortRepositories();
        this.calculateUserStats();
        this.reposLoading = false;
      },
      error: (error) => {
        console.error('Error loading repositories:', error);
        this.reposLoading = false;
      }
    });
  }

  sortRepositories(): void {
    this.sortedRepositories = [...this.userRepositories].sort((a, b) => {
      switch (this.repoSortBy) {
        case 'stars':
          return b.stargazers_count - a.stargazers_count;
        case 'forks':
          return b.forks_count - a.forks_count;
        case 'name':
          return a.name.localeCompare(b.name);
        case 'updated':
        default:
          return new Date(b.updated_at).getTime() - new Date(a.updated_at).getTime();
      }
    });
  }

  private calculateUserStats(): void {
    if (this.userRepositories.length > 0) {
      this.userStats = this.githubService.calculateUserStats(this.userRepositories);
    }
  }

  get topLanguages(): { name: string; count: number }[] {
    if (!this.userStats) return [];

    return Object.entries(this.userStats.languageDistribution)
      .map(([name, count]) => ({ name, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 5);
  }

  clearError(): void {
    this.userError = null;
  }

  onFavoriteToggled(): void {
    // Handle favorite toggle if needed
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

  formatSize(size: number): string {
    if (size >= 1000000) {
      return (size / 1000000).toFixed(1) + 'GB';
    }
    if (size >= 1000) {
      return (size / 1000).toFixed(1) + 'MB';
    }
    return size + 'KB';
  }

  getLanguageColor(language: string): string {
    const colors: { [key: string]: string } = {
      'JavaScript': '#f1e05a',
      'TypeScript': '#2b7489',
      'Python': '#3572A5',
      'Java': '#b07219',
      'C++': '#f34b7d',
      'C#': '#239120',
      'PHP': '#4F5D95',
      'Ruby': '#701516',
      'Go': '#00ADD8',
      'Rust': '#dea584',
      'Swift': '#ffac45',
      'Kotlin': '#F18E33',
      'Dart': '#00B4AB',
      'Vue': '#4FC08D',
      'React': '#61DAFB',
      'Angular': '#DD0031'
    };
    return colors[language] || '#6B7280';
  }
}
