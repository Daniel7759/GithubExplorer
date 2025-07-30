import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { GitHubUser } from '../../types/github.types';
import { FavoritesService } from '../../services/favorites.service';

@Component({
  selector: 'app-user-card',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="bg-white dark:bg-dark-800 rounded-xl shadow-lg card-hover p-6 border border-gray-200 dark:border-gray-700">
      <!-- User Header -->
      <div class="flex items-start justify-between mb-4">
        <div class="flex items-center space-x-4">
          <img [src]="user.avatar_url" 
               [alt]="user.login"
               class="w-16 h-16 rounded-full ring-4 ring-primary-100 dark:ring-primary-900/30">
          <div class="flex-1 min-w-0">
            <h3 class="text-lg font-semibold text-gray-900 dark:text-white truncate">
              <a [href]="user.html_url" 
                 target="_blank"
                 class="hover:text-primary-600 dark:hover:text-primary-400 transition-colors">
                {{ user.name || user.login }}
              </a>
            </h3>
            <p class="text-sm text-gray-500 dark:text-gray-400">{{ '@' + user.login }}</p>
            @if (user.bio) {
              <p class="text-sm text-gray-600 dark:text-gray-300 mt-1 line-clamp-2">
                {{ user.bio }}
              </p>
            }
          </div>
        </div>

        <!-- Favorite Button -->
        <button (click)="toggleFavorite()"
                class="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors">
          @if (isFavorite) {
            <svg class="w-5 h-5 text-red-500" fill="currentColor" viewBox="0 0 24 24">
              <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"/>
            </svg>
          } @else {
            <svg class="w-5 h-5 text-gray-400 hover:text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"/>
            </svg>
          }
        </button>
      </div>

      <!-- User Info -->
      <div class="space-y-2 mb-4">
        @if (user.company) {
          <div class="flex items-center space-x-2 text-sm text-gray-600 dark:text-gray-300">
            <svg class="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
              <path d="M12 7V3H2v18h20V7H12zM6 19H4v-2h2v2zm0-4H4v-2h2v2zm0-4H4V9h2v2zm0-4H4V5h2v2zm4 12H8v-2h2v2zm0-4H8v-2h2v2zm0-4H8V9h2v2zm0-4H8V5h2v2zm10 12h-8v-2h2v-2h-2v-2h2v-2h-2V9h8v10zm-2-8h-2v2h2v-2zm0 4h-2v2h2v-2z"/>
            </svg>
            <span>{{ user.company }}</span>
          </div>
        }
        
        @if (user.location) {
          <div class="flex items-center space-x-2 text-sm text-gray-600 dark:text-gray-300">
            <svg class="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
              <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z"/>
            </svg>
            <span>{{ user.location }}</span>
          </div>
        }

        @if (user.blog) {
          <div class="flex items-center space-x-2 text-sm text-gray-600 dark:text-gray-300">
            <svg class="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
              <path d="M3.9 12c0-1.71 1.39-3.1 3.1-3.1h4V7H6.9C4.22 7 2 9.22 2 11.9v.2c0 2.68 2.22 4.9 4.9 4.9h4v-1.9H6.9c-1.71 0-3.1-1.39-3.1-3.1v-.2zM8 13h8v-2H8v2zm9.1-6H13v1.9h4.1c1.71 0 3.1 1.39 3.1 3.1v.2c0 1.71-1.39 3.1-3.1 3.1H13V17h4.1c2.68 0 4.9-2.22 4.9-4.9v-.2C22 9.22 19.78 7 17.1 7z"/>
            </svg>
            <a [href]="user.blog" target="_blank" 
               class="hover:text-primary-600 dark:hover:text-primary-400 transition-colors truncate">
              {{ user.blog }}
            </a>
          </div>
        }
      </div>

      <!-- User Stats -->
      <div class="grid grid-cols-3 gap-4 py-4 border-t border-gray-200 dark:border-gray-700">
        <div class="text-center">
          <div class="text-lg font-semibold text-gray-900 dark:text-white">
            {{ formatNumber(user.public_repos) }}
          </div>
          <div class="text-xs text-gray-500 dark:text-gray-400">Repositories</div>
        </div>
        <div class="text-center">
          <div class="text-lg font-semibold text-gray-900 dark:text-white">
            {{ formatNumber(user.followers) }}
          </div>
          <div class="text-xs text-gray-500 dark:text-gray-400">Followers</div>
        </div>
        <div class="text-center">
          <div class="text-lg font-semibold text-gray-900 dark:text-white">
            {{ formatNumber(user.following) }}
          </div>
          <div class="text-xs text-gray-500 dark:text-gray-400">Following</div>
        </div>
      </div>

      <!-- Footer -->
      <div class="text-xs text-gray-500 dark:text-gray-400 text-center">
        Joined {{ getRelativeTime(user.created_at) }}
      </div>
    </div>
  `,
  styles: [`
    .line-clamp-2 {
      display: -webkit-box;
      -webkit-line-clamp: 2;
      -webkit-box-orient: vertical;
      overflow: hidden;
    }
  `]
})
export class UserCardComponent {
  @Input() user!: GitHubUser;
  @Output() favoriteToggled = new EventEmitter<void>();

  constructor(private favoritesService: FavoritesService) {}

  get isFavorite(): boolean {
    return this.favoritesService.isFavorite('user', this.user.login);
  }

  toggleFavorite(): void {
    if (this.isFavorite) {
      this.favoritesService.removeFavorite('user', this.user.login);
    } else {
      this.favoritesService.addFavorite('user', this.user);
    }
    this.favoriteToggled.emit();
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

  getRelativeTime(dateString: string): string {
    const date = new Date(dateString);
    const now = new Date();
    const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);

    if (diffInSeconds < 60) return 'just now';
    if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)}m ago`;
    if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)}h ago`;
    if (diffInSeconds < 2592000) return `${Math.floor(diffInSeconds / 86400)}d ago`;
    if (diffInSeconds < 31536000) return `${Math.floor(diffInSeconds / 2592000)}mo ago`;
    return `${Math.floor(diffInSeconds / 31536000)}y ago`;
  }
}