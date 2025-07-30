import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { GitHubRepository, GitHubUser } from '../types/github.types';

interface FavoriteItem {
  id: string;
  type: 'repository' | 'user';
  data: GitHubRepository | GitHubUser;
  addedAt: Date;
}

@Injectable({
  providedIn: 'root'
})
export class FavoritesService {
  private favoritesSubject = new BehaviorSubject<FavoriteItem[]>([]);
  private readonly storageKey = 'github-explorer-favorites';

  public favorites$ = this.favoritesSubject.asObservable();

  constructor() {
    this.loadFavorites();
  }

  private loadFavorites(): void {
    try {
      const saved = localStorage.getItem(this.storageKey);
      if (saved) {
        const favorites = JSON.parse(saved).map((item: any) => ({
          ...item,
          addedAt: new Date(item.addedAt)
        }));
        this.favoritesSubject.next(favorites);
      }
    } catch (error) {
      console.error('Error loading favorites:', error);
    }
  }

  private saveFavorites(): void {
    try {
      localStorage.setItem(this.storageKey, JSON.stringify(this.favoritesSubject.value));
    } catch (error) {
      console.error('Error saving favorites:', error);
    }
  }

  addFavorite(type: 'repository' | 'user', data: GitHubRepository | GitHubUser): void {
    const favorites = this.favoritesSubject.value;
    const id = type === 'repository' ? (data as GitHubRepository).full_name : (data as GitHubUser).login;
    
    if (!this.isFavorite(type, id)) {
      const newFavorite: FavoriteItem = {
        id,
        type,
        data,
        addedAt: new Date()
      };
      
      const updated = [newFavorite, ...favorites];
      this.favoritesSubject.next(updated);
      this.saveFavorites();
    }
  }

  removeFavorite(type: 'repository' | 'user', id: string): void {
    const favorites = this.favoritesSubject.value;
    const updated = favorites.filter(fav => !(fav.type === type && fav.id === id));
    this.favoritesSubject.next(updated);
    this.saveFavorites();
  }

  isFavorite(type: 'repository' | 'user', id: string): boolean {
    return this.favoritesSubject.value.some(fav => fav.type === type && fav.id === id);
  }

  getFavoritesByType(type: 'repository' | 'user'): FavoriteItem[] {
    return this.favoritesSubject.value.filter(fav => fav.type === type);
  }

  clearFavorites(): void {
    this.favoritesSubject.next([]);
    localStorage.removeItem(this.storageKey);
  }
}