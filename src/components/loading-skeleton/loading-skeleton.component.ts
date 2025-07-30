import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-loading-skeleton',
  standalone: true,
  imports: [CommonModule],
  template: `
    @switch (type) {
      @case ('repository') {
        <div class="bg-white dark:bg-dark-800 rounded-xl shadow-lg p-6 border border-gray-200 dark:border-gray-700">
          <div class="animate-pulse">
            <div class="flex items-center space-x-2 mb-4">
              <div class="w-6 h-6 bg-gray-300 dark:bg-gray-600 rounded-full"></div>
              <div class="h-4 bg-gray-300 dark:bg-gray-600 rounded w-20"></div>
            </div>
            <div class="h-6 bg-gray-300 dark:bg-gray-600 rounded w-3/4 mb-2"></div>
            <div class="space-y-2 mb-4">
              <div class="h-4 bg-gray-300 dark:bg-gray-600 rounded"></div>
              <div class="h-4 bg-gray-300 dark:bg-gray-600 rounded w-5/6"></div>
            </div>
            <div class="flex space-x-4 mb-4">
              <div class="h-4 bg-gray-300 dark:bg-gray-600 rounded w-16"></div>
              <div class="h-4 bg-gray-300 dark:bg-gray-600 rounded w-16"></div>
              <div class="h-4 bg-gray-300 dark:bg-gray-600 rounded w-20"></div>
            </div>
            <div class="flex space-x-2">
              @for (item of [1,2,3]; track item) {
                <div class="h-6 bg-gray-300 dark:bg-gray-600 rounded-full w-16"></div>
              }
            </div>
          </div>
        </div>
      }
      @case ('user') {
        <div class="bg-white dark:bg-dark-800 rounded-xl shadow-lg p-6 border border-gray-200 dark:border-gray-700">
          <div class="animate-pulse">
            <div class="flex items-center space-x-4 mb-4">
              <div class="w-16 h-16 bg-gray-300 dark:bg-gray-600 rounded-full"></div>
              <div class="flex-1">
                <div class="h-6 bg-gray-300 dark:bg-gray-600 rounded w-3/4 mb-2"></div>
                <div class="h-4 bg-gray-300 dark:bg-gray-600 rounded w-1/2 mb-2"></div>
                <div class="h-4 bg-gray-300 dark:bg-gray-600 rounded"></div>
              </div>
            </div>
            <div class="space-y-2 mb-4">
              <div class="h-4 bg-gray-300 dark:bg-gray-600 rounded w-2/3"></div>
              <div class="h-4 bg-gray-300 dark:bg-gray-600 rounded w-1/2"></div>
              <div class="h-4 bg-gray-300 dark:bg-gray-600 rounded w-3/4"></div>
            </div>
            <div class="grid grid-cols-3 gap-4 py-4 border-t border-gray-200 dark:border-gray-700">
              @for (item of [1,2,3]; track item) {
                <div class="text-center">
                  <div class="h-6 bg-gray-300 dark:bg-gray-600 rounded w-12 mx-auto mb-1"></div>
                  <div class="h-3 bg-gray-300 dark:bg-gray-600 rounded w-16 mx-auto"></div>
                </div>
              }
            </div>
          </div>
        </div>
      }
      @case ('card') {
        <div class="bg-white dark:bg-dark-800 rounded-xl shadow-lg p-6 border border-gray-200 dark:border-gray-700">
          <div class="animate-pulse">
            <div class="h-8 bg-gray-300 dark:bg-gray-600 rounded w-3/4 mb-4"></div>
            <div class="space-y-3">
              <div class="h-4 bg-gray-300 dark:bg-gray-600 rounded"></div>
              <div class="h-4 bg-gray-300 dark:bg-gray-600 rounded w-5/6"></div>
              <div class="h-4 bg-gray-300 dark:bg-gray-600 rounded w-4/6"></div>
            </div>
          </div>
        </div>
      }
      @default {
        <div class="animate-pulse">
          <div class="h-4 bg-gray-300 dark:bg-gray-600 rounded w-3/4 mb-4"></div>
          <div class="space-y-3">
            <div class="h-4 bg-gray-300 dark:bg-gray-600 rounded"></div>
            <div class="h-4 bg-gray-300 dark:bg-gray-600 rounded w-5/6"></div>
          </div>
        </div>
      }
    }
  `
})
export class LoadingSkeletonComponent {
  @Input() type: 'repository' | 'user' | 'card' | 'default' = 'default';
}