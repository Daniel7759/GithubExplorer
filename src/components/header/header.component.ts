import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { FavoritesService } from '../../services/favorites.service';
import { Observable, map } from 'rxjs';

@Component({
  selector: 'app-header',
  standalone: true,
  imports: [CommonModule, RouterModule],
  template: `
    <header class="sticky top-0 z-50 glass-effect backdrop-blur-md border-b border-gray-200 dark:border-gray-700">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div class="flex items-center justify-between h-16">
          <!-- Logo and Navigation -->
          <div class="flex items-center space-x-8">
            <div class="flex items-center space-x-3">
              <div class="w-8 h-8 bg-gradient-to-br from-primary-500 to-secondary-500 rounded-lg flex items-center justify-center">
                <svg class="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"/>
                </svg>
              </div>
              <h1 class="dark:text-primary-50 text-xl font-bold gradient-text">
                GitHub Explorer
              </h1>
            </div>
            
            <nav class="hidden md:flex space-x-6">
              <a routerLink="/dashboard" 
                 routerLinkActive="text-primary-600 dark:text-primary-400"
                 class="text-gray-700 dark:text-primary-50 hover:text-primary-600 dark:hover:text-primary-400 px-3 py-2 text-sm font-medium transition-colors">
                Dashboard
              </a>
              <a routerLink="/explore" 
                 routerLinkActive="text-primary-600 dark:text-primary-400"
                 class="text-gray-700 dark:text-primary-50 hover:text-primary-600 dark:hover:text-primary-400 px-3 py-2 text-sm font-medium transition-colors">
                Explore
              </a>
              <a routerLink="/favorites" 
                 routerLinkActive="text-primary-600 dark:text-primary-400"
                 class="text-gray-700 dark:text-primary-50 hover:text-primary-600 dark:hover:text-primary-400 px-3 py-2 text-sm font-medium transition-colors relative">
                Favorites
                @if (favoriteCount$ | async; as count) {
                  @if (count > 0) {
                    <span class="absolute -top-1 -right-1 bg-accent-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center animate-pulse">
                      {{ count }}
                    </span>
                  }
                }
              </a>
            </nav>
          </div>

          <!-- Mobile Menu -->
          <div class="flex items-center space-x-4">
            <!-- Mobile Menu Button -->
            <button (click)="toggleMobileMenu()"
                    class="md:hidden p-2 rounded-lg bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors">
              <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6h16M4 12h16M4 18h16"/>
              </svg>
            </button>
          </div>
        </div>

        <!-- Mobile Navigation -->
        @if (showMobileMenu) {
          <div class="md:hidden py-4 border-t border-gray-200 dark:border-gray-700 animate-fade-in">
            <nav class="flex flex-col space-y-2">
              <a routerLink="/dashboard" 
                 (click)="closeMobileMenu()"
                 routerLinkActive="text-primary-600 dark:text-primary-400 bg-primary-50 dark:bg-primary-900/20"
                 class="text-gray-700 dark:text-gray-300 hover:text-primary-600 dark:hover:text-primary-400 px-3 py-2 text-sm font-medium rounded-lg transition-colors">
                Dashboard
              </a>
              <a routerLink="/explore" 
                 (click)="closeMobileMenu()"
                 routerLinkActive="text-primary-600 dark:text-primary-400 bg-primary-50 dark:bg-primary-900/20"
                 class="text-gray-700 dark:text-gray-300 hover:text-primary-600 dark:hover:text-primary-400 px-3 py-2 text-sm font-medium rounded-lg transition-colors">
                Explore
              </a>
              <a routerLink="/favorites" 
                 (click)="closeMobileMenu()"
                 routerLinkActive="text-primary-600 dark:text-primary-400 bg-primary-50 dark:bg-primary-900/20"
                 class="text-gray-700 dark:text-gray-300 hover:text-primary-600 dark:hover:text-primary-400 px-3 py-2 text-sm font-medium rounded-lg transition-colors flex items-center justify-between">
                Favorites
                @if (favoriteCount$ | async; as count) {
                  @if (count > 0) {
                    <span class="bg-accent-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
                      {{ count }}
                    </span>
                  }
                }
              </a>
            </nav>
          </div>
        }
      </div>
    </header>
  `
})
export class HeaderComponent implements OnInit {
  favoriteCount$: Observable<number>;
  showMobileMenu = false;

  constructor(
    private favoritesService: FavoritesService
  ) {
    this.favoriteCount$ = this.favoritesService.favorites$.pipe(
      map(favorites => favorites.length)
    );
  }

  ngOnInit(): void {}


  toggleMobileMenu(): void {
    this.showMobileMenu = !this.showMobileMenu;
  }

  closeMobileMenu(): void {
    this.showMobileMenu = false;
  }
}