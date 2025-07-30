import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { GitHubRepository } from '../../types/github.types';
import { FavoritesService } from '../../services/favorites.service';

@Component({
  selector: 'app-repository-card',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="h-[350px] bg-white dark:bg-dark-800 rounded-xl shadow-lg card-hover p-6 border border-gray-200 dark:border-gray-700">
      <!-- Repository Header -->
      <div class="flex items-start justify-between mb-4">
        <div class="flex-1 min-w-0">
          <div class="flex items-center space-x-2 mb-2">
            <img [src]="repository.owner.avatar_url" 
                 [alt]="repository.owner.login"
                 class="w-6 h-6 rounded-full">
            <span class="text-sm text-gray-600 dark:text-gray-400 truncate">
              {{ repository.owner.login }}
            </span>
          </div>
          <h3 class="text-lg font-semibold text-gray-900 dark:text-white mb-1 truncate">
            <a [href]="repository.html_url" 
               target="_blank"
               class="hover:text-primary-600 dark:hover:text-primary-400 transition-colors">
              {{ repository.name }}
            </a>
          </h3>
          @if (repository.description) {
            <p class="text-sm text-gray-600 dark:text-gray-300 line-clamp-2 mb-3">
              {{ repository.description }}
            </p>
          }
        </div>

        <!-- Favorite Button -->
        <button (click)="toggleFavorite()"
                class="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors ml-2">
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

      <!-- Repository Stats -->
      <div class="flex items-center space-x-6 mb-4">
        <div class="flex items-center space-x-1 text-sm text-gray-600 dark:text-gray-300">
          <svg class="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
            <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>
          </svg>
          <span>{{ formatNumber(repository.stargazers_count) }}</span>
        </div>
        
        <div class="flex items-center space-x-1 text-sm text-gray-600 dark:text-gray-300">
          <svg class="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
            <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10c1.19 0 2.34-.21 3.41-.6.24-.09.4-.32.4-.58 0-.14-.05-.27-.14-.37L15.5 19.5c-.09-.08-.2-.13-.32-.13-.43 0-.77.35-.77.78 0 .14.04.27.11.38-.94.3-1.95.47-3.02.47-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8c0 1.07-.17 2.08-.47 3.02-.11-.07-.24-.11-.38-.11-.43 0-.78.34-.78.77 0 .12.05.23.13.32l-.95.95c-.1.09-.23.14-.37.14-.26 0-.49-.16-.58-.4C21.79 14.34 22 13.19 22 12c0-5.52-4.48-10-10-10z"/>
          </svg>
          <span>{{ formatNumber(repository.forks_count) }}</span>
        </div>

        @if (repository.language) {
          <div class="flex items-center space-x-1 text-sm">
            <div class="w-3 h-3 rounded-full" 
                 [style.background-color]="getLanguageColor(repository.language)">
            </div>
            <span class="text-gray-600 dark:text-gray-300">{{ repository.language }}</span>
          </div>
        }
      </div>

      <!-- Topics -->
      @if (repository.topics && repository.topics.length > 0) {
        <div class="flex flex-wrap gap-2 mb-4">
          @for (topic of repository.topics.slice(0, 6); track topic) {
            <span class="px-2 py-1 text-xs bg-primary-100 dark:bg-primary-900/30 text-primary-700 dark:text-primary-300 rounded-full">
              {{ topic }}
            </span>
          }
          @if (repository.topics.length > 6) {
            <span class="px-2 py-1 text-xs bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 rounded-full">
              +{{ repository.topics.length - 6 }} more
            </span>
          }
        </div>
      }

      <!-- Footer -->
      <div class="flex items-center justify-between text-xs text-gray-500 dark:text-gray-400">
        <span>Updated {{ getRelativeTime(repository.updated_at) }}</span>
        @if (repository.license) {
          <span class="flex items-center space-x-1">
            <svg class="w-3 h-3" fill="currentColor" viewBox="0 0 24 24">
              <path d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"/>
            </svg>
            <span>{{ repository.license.name }}</span>
          </span>
        }
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
export class RepositoryCardComponent {
  @Input() repository!: GitHubRepository;
  @Output() favoriteToggled = new EventEmitter<void>();

  constructor(private favoritesService: FavoritesService) {}

  get isFavorite(): boolean {
    return this.favoritesService.isFavorite('repository', this.repository.full_name);
  }

  toggleFavorite(): void {
    if (this.isFavorite) {
      this.favoritesService.removeFavorite('repository', this.repository.full_name);
    } else {
      this.favoritesService.addFavorite('repository', this.repository);
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