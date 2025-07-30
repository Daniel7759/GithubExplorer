import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FavoritesService } from '../../services/favorites.service';
import { RepositoryCardComponent } from '../../components/repository-card/repository-card.component';
import { UserCardComponent } from '../../components/user-card/user-card.component';
import { GitHubRepository, GitHubUser } from '../../types/github.types';
import { Observable, map } from 'rxjs';
import {FormsModule} from "@angular/forms";
import {RouterLink} from "@angular/router";

interface FavoriteItem {
  id: string;
  type: 'repository' | 'user';
  data: GitHubRepository | GitHubUser;
  addedAt: Date;
}

@Component({
  selector: 'app-favorites',
  standalone: true,
  imports: [CommonModule, RepositoryCardComponent, UserCardComponent, FormsModule, RouterLink],
  template: `
    <div class="min-h-screen bg-gray-50 dark:bg-dark-900 py-8">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <!-- Header -->
        <div class="text-center mb-12">
          <h1 class="dark:text-primary-50 text-4xl font-bold gradient-text mb-4">
            Your Favorites
          </h1>
          <p class="text-lg text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
            Keep track of your favorite repositories and developers in one place.
          </p>
        </div>

        <!-- Tabs -->
        <div class="flex justify-center mb-8">
          <div class="glass-effect rounded-lg p-1 border border-gray-200 dark:border-gray-700">
            <button (click)="activeTab = 'all'"
                    [class]="activeTab === 'all' ? 'bg-primary-600 text-white' : 'text-gray-700 dark:text-gray-300 hover:text-primary-600 dark:hover:text-primary-400'"
                    class="px-4 py-2 rounded-md text-sm font-medium transition-colors">
              All ({{ totalFavorites$ | async }})
            </button>
            <button (click)="activeTab = 'repositories'"
                    [class]="activeTab === 'repositories' ? 'bg-primary-600 text-white' : 'text-gray-700 dark:text-gray-300 hover:text-primary-600 dark:hover:text-primary-400'"
                    class="px-4 py-2 rounded-md text-sm font-medium transition-colors">
              Repositories ({{ repositoryCount$ | async }})
            </button>
            <button (click)="activeTab = 'users'"
                    [class]="activeTab === 'users' ? 'bg-primary-600 text-white' : 'text-gray-700 dark:text-gray-300 hover:text-primary-600 dark:hover:text-primary-400'"
                    class="px-4 py-2 rounded-md text-sm font-medium transition-colors">
              Users ({{ userCount$ | async }})
            </button>
          </div>
        </div>

        <!-- Actions Bar -->
        @if ((totalFavorites$ | async)! > 0) {
          <div class="flex items-center justify-between mb-6">
            <div class="flex items-center space-x-4">
              <select [(ngModel)]="sortBy" 
                      (change)="updateDisplayedFavorites()"
                      class="px-3 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-dark-800 text-gray-900 dark:text-white">
                <option value="recent">Recently Added</option>
                <option value="name">Name</option>
                <option value="stars">Most Stars</option>
              </select>
            </div>
            
            <button (click)="confirmClearAll()"
                    class="px-4 py-2 text-sm text-red-600 hover:text-red-700 dark:text-red-400 dark:hover:text-red-300 border border-red-300 dark:border-red-600 rounded-lg hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors">
              Clear All
            </button>
          </div>
        }

        <!-- Content -->
        @if ((totalFavorites$ | async)! > 0) {
          <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 animate-fade-in">
            @switch (activeTab) {
              @case ('all') {
                @for (favorite of displayedFavorites; track favorite.id) {
                  @if (favorite.type === 'repository') {
                    <app-repository-card 
                      [repository]="asRepository(favorite.data)"
                      (favoriteToggled)="onFavoriteToggled()">
                    </app-repository-card>
                  } @else {
                    <app-user-card 
                      [user]="asUser(favorite.data)"
                      (favoriteToggled)="onFavoriteToggled()">
                    </app-user-card>
                  }
                }
              }
              @case ('repositories') {
                @for (favorite of repositoryFavorites; track favorite.id) {
                  <app-repository-card 
                    [repository]="asRepository(favorite.data)"
                    (favoriteToggled)="onFavoriteToggled()">
                  </app-repository-card>
                }
              }
              @case ('users') {
                @for (favorite of userFavorites; track favorite.id) {
                  <app-user-card 
                    [user]="asUser(favorite.data)"
                    (favoriteToggled)="onFavoriteToggled()">
                  </app-user-card>
                }
              }
            }
          </div>
        } @else {
          <!-- Empty State -->
          <div class="text-center py-16">
            <svg class="mx-auto h-16 w-16 text-gray-400 mb-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"/>
            </svg>
            <h3 class="text-xl font-medium text-gray-900 dark:text-white mb-2">
              No favorites yet
            </h3>
            <p class="text-gray-500 dark:text-gray-400 mb-8 max-w-sm mx-auto">
              Start exploring repositories and developers to add them to your favorites collection.
            </p>
            <div class="flex flex-col sm:flex-row gap-4 justify-center">
              <a routerLink="/dashboard" 
                 class="inline-flex items-center px-6 py-3 bg-primary-600 hover:bg-primary-700 text-white font-medium rounded-lg transition-colors">
                <svg class="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>
                </svg>
                Explore Repositories
              </a>
              <a routerLink="/explore" 
                 class="inline-flex items-center px-6 py-3 bg-secondary-600 hover:bg-secondary-700 text-white font-medium rounded-lg transition-colors">
                <svg class="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"/>
                </svg>
                Find Developers
              </a>
            </div>
          </div>
        }

        <!-- Clear All Confirmation Modal -->
        @if (showClearConfirmation) {
          <div class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div class="bg-white dark:bg-dark-800 rounded-xl p-6 max-w-sm w-full border border-gray-200 dark:border-gray-700 animate-fade-in">
              <div class="text-center">
                <svg class="mx-auto h-12 w-12 text-red-400 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z"/>
                </svg>
                <h3 class="text-lg font-medium text-gray-900 dark:text-white mb-2">
                  Clear All Favorites?
                </h3>
                <p class="text-gray-500 dark:text-gray-400 mb-6">
                  This action cannot be undone. All your favorite repositories and users will be removed.
                </p>
                <div class="flex space-x-3">
                  <button (click)="cancelClearAll()"
                          class="flex-1 px-4 py-2 bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-gray-200 rounded-lg hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors">
                    Cancel
                  </button>
                  <button (click)="clearAllFavorites()"
                          class="flex-1 px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg transition-colors">
                    Clear All
                  </button>
                </div>
              </div>
            </div>
          </div>
        }
      </div>
    </div>
  `
})
export class FavoritesComponent implements OnInit {
  activeTab: 'all' | 'repositories' | 'users' = 'all';
  sortBy: 'recent' | 'name' | 'stars' = 'recent';
  showClearConfirmation = false;
  
  favorites: FavoriteItem[] = [];
  displayedFavorites: FavoriteItem[] = [];
  repositoryFavorites: FavoriteItem[] = [];
  userFavorites: FavoriteItem[] = [];

  totalFavorites$: Observable<number>;
  repositoryCount$: Observable<number>;
  userCount$: Observable<number>;

  // Type assertion for template
  GitHubRepository = {} as GitHubRepository;
  GitHubUser = {} as GitHubUser;

  constructor(private favoritesService: FavoritesService) {
    this.totalFavorites$ = this.favoritesService.favorites$.pipe(
      map(favorites => favorites.length)
    );
    this.repositoryCount$ = this.favoritesService.favorites$.pipe(
      map(favorites => favorites.filter(f => f.type === 'repository').length)
    );
    this.userCount$ = this.favoritesService.favorites$.pipe(
      map(favorites => favorites.filter(f => f.type === 'user').length)
    );
  }

  ngOnInit(): void {
    this.favoritesService.favorites$.subscribe(favorites => {
      this.favorites = favorites;
      this.repositoryFavorites = favorites.filter(f => f.type === 'repository');
      this.userFavorites = favorites.filter(f => f.type === 'user');
      this.updateDisplayedFavorites();
    });
  }

  updateDisplayedFavorites(): void {
    let filtered = [...this.favorites];

    // Filter by tab
    if (this.activeTab === 'repositories') {
      filtered = filtered.filter(f => f.type === 'repository');
    } else if (this.activeTab === 'users') {
      filtered = filtered.filter(f => f.type === 'user');
    }

    // Sort
    filtered.sort((a, b) => {
      switch (this.sortBy) {
        case 'name':
          const nameA = a.type === 'repository' 
            ? (a.data as GitHubRepository).name 
            : (a.data as GitHubUser).login;
          const nameB = b.type === 'repository' 
            ? (b.data as GitHubRepository).name 
            : (b.data as GitHubUser).login;
          return nameA.localeCompare(nameB);
        
        case 'stars':
          const starsA = a.type === 'repository' 
            ? (a.data as GitHubRepository).stargazers_count 
            : (a.data as GitHubUser).public_repos;
          const starsB = b.type === 'repository' 
            ? (b.data as GitHubRepository).stargazers_count 
            : (b.data as GitHubUser).public_repos;
          return starsB - starsA;
        
        case 'recent':
        default:
          return b.addedAt.getTime() - a.addedAt.getTime();
      }
    });

    this.displayedFavorites = filtered;
    this.repositoryFavorites = this.favorites.filter(f => f.type === 'repository');
    this.userFavorites = this.favorites.filter(f => f.type === 'user');
  }

  confirmClearAll(): void {
    this.showClearConfirmation = true;
  }

  cancelClearAll(): void {
    this.showClearConfirmation = false;
  }

  clearAllFavorites(): void {
    this.favoritesService.clearFavorites();
    this.showClearConfirmation = false;
  }

  onFavoriteToggled(): void {
    // The favorite list will automatically update through the subscription
  }

  // Utilities for casting data types
  asRepository(data: GitHubRepository | GitHubUser): GitHubRepository {
    return data as GitHubRepository;
  }
  asUser(data: GitHubRepository | GitHubUser): GitHubUser {
    return data as GitHubUser;
  }
}