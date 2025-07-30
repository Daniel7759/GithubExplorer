import { Component, OnInit, AfterViewInit, OnDestroy } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import {CommonModule, NgOptimizedImage} from '@angular/common';
import { GitHubService } from '../../services/github.service';
import { Chart, registerables } from 'chart.js';
import { firstValueFrom } from 'rxjs';

Chart.register(...registerables);

@Component({
  selector: 'app-repository-detail',
  standalone: true,
  imports: [CommonModule, NgOptimizedImage],
  template: `
    <div class="max-w-7xl mx-auto py-8 px-4">
      @if (loading) {
        <div class="text-center py-8">
          <div class="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto"></div>
          <p class="mt-4 text-gray-600 dark:text-gray-400">Loading repository data...</p>
        </div>
      }
      @if (error) {
        <div class="text-red-600 py-8 text-center">
          <p>{{ error }}</p>
        </div>
      }
      @if (!loading && !error) {
        <div class="space-y-8">
          <!-- Repository Header -->
          <div class="bg-white dark:bg-dark-800 p-6 rounded-xl shadow-lg">
            <div class="flex items-start justify-between mb-4">
              <div>
                <h1 class="text-3xl font-bold text-gray-900 dark:text-white mb-2">{{ repoFullName }}</h1>
                @if (repositoryDetails?.description) {
                  <p class="text-gray-600 dark:text-gray-300 mb-4">
                    {{ repositoryDetails.description }}
                  </p>
                }
                <div class="flex items-center space-x-6 text-sm text-gray-600 dark:text-gray-300">
                  <div class="flex items-center space-x-1">
                    <svg class="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                      <path
                          d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>
                    </svg>
                    <span>{{ repositoryDetails?.stargazers_count || 0 }} stars</span>
                  </div>
                  <div class="flex items-center space-x-1">
                    <svg class="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M8 3v18l5-5 5 5V3z"/>
                    </svg>
                    <span>{{ repositoryDetails?.forks_count || 0 }} forks</span>
                  </div>
                  @if (repositoryDetails?.language) {
                    <div class="flex items-center space-x-1">
                      <div class="w-3 h-3 rounded-full bg-blue-500"></div>
                      <span>{{ repositoryDetails.language }}</span>
                    </div>
                  }
                </div>
              </div>
              @if (repositoryDetails?.html_url) {
                <a [href]="repositoryDetails.html_url"
                   target="_blank"
                   class="bg-primary-600 hover:bg-primary-700 text-white px-4 py-2 rounded-lg transition-colors">
                  View on GitHub
                </a>
              }
            </div>
          </div>

          <!-- Charts Grid -->
          <div class="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <div class="bg-white dark:bg-dark-800 p-6 rounded-xl shadow-lg">
              <h3 class="text-lg font-semibold mb-4 text-gray-900 dark:text-white">Repository Activity</h3>
              <p class="text-xs text-gray-500 dark:text-gray-400 mb-2">Weekly commit activity over time</p>
              <div class="h-64 w-full">
                <canvas id="starsChart"></canvas>
              </div>
            </div>
            <div class="bg-white dark:bg-dark-800 p-6 rounded-xl shadow-lg">
              <h3 class="text-lg font-semibold mb-4 text-gray-900 dark:text-white">Commits per Week</h3>
              <div class="h-64 w-full">
                <canvas id="commitsChart"></canvas>
              </div>
            </div>
          </div>

          <!-- Additional Info Grid -->
          <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <!-- Top Contributors -->
            <div class="bg-white dark:bg-dark-800 p-6 rounded-xl shadow-lg">
              <h3 class="text-lg font-semibold mb-4 text-gray-900 dark:text-white">Top Contributors</h3>
              @if (contributors.length > 0) {
                <div class="space-y-3">
                  @for (contributor of contributors; track contributor.id) {
                    <div class="flex items-center space-x-3">
                      <img ngSrc="{{contributor.avatar_url}}"
                           width="8"
                           height="8"
                           [alt]="contributor.login"
                           class="w-8 h-8 rounded-full">
                      <div class="flex-1 min-w-0">
                        <p class="text-sm font-medium text-gray-900 dark:text-white truncate">
                          {{ contributor.login }}
                        </p>
                        <p class="text-xs text-gray-500 dark:text-gray-400">
                          {{ contributor.contributions }} contributions
                        </p>
                      </div>
                    </div>
                  }
                </div>
              } @else {
                <p class="text-gray-500 dark:text-gray-400 text-sm">No contributors data available</p>
              }
            </div>

            <!-- Languages -->
            <div class="bg-white dark:bg-dark-800 p-6 rounded-xl shadow-lg">
              <h3 class="text-lg font-semibold mb-4 text-gray-900 dark:text-white">Languages</h3>
              @if (languagesArray.length > 0) {
                <div class="space-y-2">
                  @for (lang of languagesArray; track lang.name) {
                    <div class="flex items-center justify-between">
                      <span class="text-sm text-gray-700 dark:text-gray-300">{{ lang.name }}</span>
                      <span class="text-xs text-gray-500 dark:text-gray-400">{{ lang.percentage }}%</span>
                    </div>
                  }
                </div>
              } @else {
                <p class="text-gray-500 dark:text-gray-400 text-sm">No language data available</p>
              }
            </div>

            <!-- Repository Stats -->
            <div class="bg-white dark:bg-dark-800 p-6 rounded-xl shadow-lg">
              <h3 class="text-lg font-semibold mb-4 text-gray-900 dark:text-white">Repository Stats</h3>
              <div class="space-y-3">
                <div class="flex justify-between">
                  <span class="text-sm text-gray-600 dark:text-gray-400">Created:</span>
                  <span class="text-sm text-gray-900 dark:text-white">
                    {{ repositoryDetails?.created_at | date:'MMM yyyy' }}
                  </span>
                </div>
                <div class="flex justify-between">
                  <span class="text-sm text-gray-600 dark:text-gray-400">Last updated:</span>
                  <span class="text-sm text-gray-900 dark:text-white">
                    {{ repositoryDetails?.updated_at | date:'MMM d, yyyy' }}
                  </span>
                </div>
                <div class="flex justify-between">
                  <span class="text-sm text-gray-600 dark:text-gray-400">Size:</span>
                  <span class="text-sm text-gray-900 dark:text-white">
                    {{ formatSize(repositoryDetails?.size || 0) }}
                  </span>
                </div>
                @if (repositoryDetails?.license) {
                  <div class="flex justify-between">
                    <span class="text-sm text-gray-600 dark:text-gray-400">License:</span>
                    <span class="text-sm text-gray-900 dark:text-white">
                      {{ repositoryDetails.license.name }}
                    </span>
                  </div>
                }
              </div>
            </div>
          </div>
        </div>
      }
    </div>
  `
})
export class RepositoryDetailComponent implements OnInit, AfterViewInit, OnDestroy {
  repoFullName = '';
  loading = true;
  error: string | null = null;
  repositoryDetails: any = null;
  contributors: any[] = [];
  languages: { [key: string]: number } = {};
  languagesArray: { name: string, percentage: number }[] = [];

  private chartsData: { stars: any, commits: any } | null = null;
  private starsChart: Chart | null = null;
  private commitsChart: Chart | null = null;

  constructor(private route: ActivatedRoute, private githubService: GitHubService) {}

  ngOnInit(): void {
    this.route.paramMap.subscribe(params => {
      const owner = params.get('owner');
      const repo = params.get('repo');
      if (owner && repo) {
        this.repoFullName = `${owner}/${repo}`;
        this.loadAllData(owner, repo);
      } else {
        this.error = 'Repositorio no especificado.';
        this.loading = false;
      }
    });
  }

  ngAfterViewInit(): void {
    // Solo crear gráficos si tenemos datos y no están ya creados
    if (this.chartsData && !this.loading && !this.starsChart && !this.commitsChart) {
      setTimeout(() => {
        this.createCharts();
      }, 100);
    }
  }

  ngOnDestroy(): void {
    // Limpiar gráficos al destruir el componente
    if (this.starsChart) {
      this.starsChart.destroy();
    }
    if (this.commitsChart) {
      this.commitsChart.destroy();
    }
  }

  async loadAllData(owner: string, repo: string) {
    try {
      // Cargar todos los datos en paralelo
      const [starsData, commitsData, repoDetails, contributors, languages] = await Promise.all([
        firstValueFrom(this.githubService.getStarsPerMonth(owner, repo)),
        firstValueFrom(this.githubService.getCommitsPerMonth(owner, repo)),
        firstValueFrom(this.githubService.getRepositoryDetails(owner, repo)),
        firstValueFrom(this.githubService.getRepositoryContributors(owner, repo)),
        firstValueFrom(this.githubService.getRepositoryLanguages(owner, repo))
      ]);

      this.chartsData = { stars: starsData, commits: commitsData };
      this.repositoryDetails = repoDetails;
      this.contributors = contributors;
      this.languages = languages;
      this.processLanguages();
      this.loading = false;

      // Crear gráficos después de cargar los datos
      if (!this.starsChart && !this.commitsChart) {
        setTimeout(() => {
          this.createCharts();
        }, 100);
      }
    } catch (e: any) {
      this.error = e.message || 'Error al cargar los datos del repositorio.';
      this.loading = false;
    }
  }

  private processLanguages(): void {
    const total = Object.values(this.languages).reduce((sum, bytes) => sum + bytes, 0);
    if (total > 0) {
      this.languagesArray = Object.entries(this.languages)
        .map(([name, bytes]) => ({
          name,
          percentage: Math.round((bytes / total) * 100)
        }))
        .sort((a, b) => b.percentage - a.percentage)
        .slice(0, 5); // Show only the top 5 languages
    }
  }

  formatSize(sizeInKB: number): string {
    if (sizeInKB >= 1024 * 1024) {
      return (sizeInKB / (1024 * 1024)).toFixed(1) + ' GB';
    }
    if (sizeInKB >= 1024) {
      return (sizeInKB / 1024).toFixed(1) + ' MB';
    }
    return sizeInKB.toFixed(0) + ' KB';
  }

  private createCharts(): void {
    if (!this.chartsData || this.starsChart || this.commitsChart) return;

    const starsCanvas = document.getElementById('starsChart') as HTMLCanvasElement;
    const commitsCanvas = document.getElementById('commitsChart') as HTMLCanvasElement;

    if (starsCanvas && commitsCanvas) {
      this.starsChart = this.renderStarsChart(this.chartsData.stars, starsCanvas);
      this.commitsChart = this.renderCommitsChart(this.chartsData.commits, commitsCanvas);
    }
  }

  renderStarsChart(data: { labels: string[], values: number[] }, canvas: HTMLCanvasElement): Chart {
    return new Chart(canvas, {
      type: 'line',
      data: {
        labels: data.labels,
        datasets: [{
          label: 'Weekly Activity Score',
          data: data.values,
          borderColor: '#2563eb',
          backgroundColor: 'rgba(37,99,235,0.1)',
          fill: true,
          tension: 0.4
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: {
            labels: {
              color: document.documentElement.classList.contains('dark') ? '#e5e7eb' : '#374151'
            }
          }
        },
        scales: {
          y: {
            ticks: { color: document.documentElement.classList.contains('dark') ? '#9ca3af' : '#6b7280' },
            grid: { color: document.documentElement.classList.contains('dark') ? '#374151' : '#e5e7eb' }
          },
          x: {
            ticks: { color: document.documentElement.classList.contains('dark') ? '#9ca3af' : '#6b7280' },
            grid: { color: document.documentElement.classList.contains('dark') ? '#374151' : '#e5e7eb' }
          }
        }
      }
    });
  }

  renderCommitsChart(data: { labels: string[], values: number[] }, canvas: HTMLCanvasElement): Chart {
    return new Chart(canvas, {
      type: 'bar',
      data: {
        labels: data.labels,
        datasets: [{
          label: 'Commits por mes',
          data: data.values,
          backgroundColor: '#10b981',
          borderColor: '#059669',
          borderWidth: 1
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: {
            labels: {
              color: document.documentElement.classList.contains('dark') ? '#e5e7eb' : '#374151'
            }
          }
        },
        scales: {
          y: {
            ticks: { color: document.documentElement.classList.contains('dark') ? '#9ca3af' : '#6b7280' },
            grid: { color: document.documentElement.classList.contains('dark') ? '#374151' : '#e5e7eb' }
          },
          x: {
            ticks: { color: document.documentElement.classList.contains('dark') ? '#9ca3af' : '#6b7280' },
            grid: { color: document.documentElement.classList.contains('dark') ? '#374151' : '#e5e7eb' }
          }
        }
      }
    });
  }
}
