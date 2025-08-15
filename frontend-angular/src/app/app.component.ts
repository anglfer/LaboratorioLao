import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterOutlet, RouterModule } from '@angular/router';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatSidenavModule } from '@angular/material/sidenav';
import { MatListModule } from '@angular/material/list';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { ApiService } from './services/api.service';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [
    CommonModule,
    RouterOutlet,
    RouterModule,
    MatToolbarModule,
    MatButtonModule,
    MatIconModule,
    MatSidenavModule,
    MatListModule,
    MatProgressBarModule
  ],
  template: `
    <div class="app-container">
      <mat-toolbar color="primary" class="app-toolbar">
        <button mat-icon-button (click)="toggleSidenav()">
          <mat-icon>menu</mat-icon>
        </button>
        <span class="app-title">Laboratorio LOA - Test Frontend</span>
        
        @if (apiService.loading()) {
          <mat-progress-bar mode="indeterminate" class="loading-bar"></mat-progress-bar>
        }
      </mat-toolbar>

      <mat-sidenav-container class="sidenav-container">
        <mat-sidenav #sidenav mode="side" opened class="sidenav">
          <mat-nav-list>
            <a mat-list-item routerLink="/dashboard" routerLinkActive="active">
              <mat-icon matListItemIcon>dashboard</mat-icon>
              <span matListItemTitle>Dashboard</span>
            </a>
            
            <a mat-list-item routerLink="/clientes" routerLinkActive="active">
              <mat-icon matListItemIcon>people</mat-icon>
              <span matListItemTitle>Clientes</span>
              @if (apiService.clientesCount() > 0) {
                <span matListItemMeta class="badge">{{ apiService.clientesCount() }}</span>
              }
            </a>
            
            <a mat-list-item routerLink="/obras" routerLinkActive="active">
              <mat-icon matListItemIcon>construction</mat-icon>
              <span matListItemTitle>Obras</span>
              @if (apiService.obrasActivas().length > 0) {
                <span matListItemMeta class="badge active">{{ apiService.obrasActivas().length }}</span>
              }
            </a>
            
            <a mat-list-item routerLink="/presupuestos" routerLinkActive="active">
              <mat-icon matListItemIcon>receipt</mat-icon>
              <span matListItemTitle>Presupuestos</span>
            </a>
            
            <a mat-list-item routerLink="/conceptos" routerLinkActive="active">
              <mat-icon matListItemIcon>category</mat-icon>
              <span matListItemTitle>Conceptos</span>
            </a>
            
            <a mat-list-item routerLink="/areas" routerLinkActive="active">
              <mat-icon matListItemIcon>business</mat-icon>
              <span matListItemTitle>Áreas</span>
            </a>
          </mat-nav-list>
        </mat-sidenav>

        <mat-sidenav-content class="main-content">
          @if (apiService.error()) {
            <div class="error-banner">
              <mat-icon>error</mat-icon>
              <span>{{ apiService.error() }}</span>
              <button mat-button (click)="apiService.clearError()">
                <mat-icon>close</mat-icon>
              </button>
            </div>
          }
          
          <div class="content-container">
            <router-outlet></router-outlet>
          </div>
        </mat-sidenav-content>
      </mat-sidenav-container>
    </div>
  `,
  styles: [`
    .app-container {
      height: 100vh;
      display: flex;
      flex-direction: column;
    }

    .app-toolbar {
      position: relative;
      z-index: 10;
    }

    .app-title {
      margin-left: 16px;
      flex: 1;
    }

    .loading-bar {
      position: absolute;
      bottom: 0;
      left: 0;
      right: 0;
      height: 2px;
    }

    .sidenav-container {
      flex: 1;
    }

    .sidenav {
      width: 250px;
      border-right: 1px solid #e0e0e0;
    }

    .main-content {
      display: flex;
      flex-direction: column;
    }

    .error-banner {
      background-color: #f44336;
      color: white;
      padding: 12px 16px;
      display: flex;
      align-items: center;
      gap: 8px;

      mat-icon {
        font-size: 20px;
        width: 20px;
        height: 20px;
      }

      span {
        flex: 1;
      }

      button {
        color: white;
        min-width: auto;
        padding: 0;
        
        mat-icon {
          font-size: 18px;
          width: 18px;
          height: 18px;
        }
      }
    }

    .content-container {
      flex: 1;
      padding: 24px;
      overflow-y: auto;
    }

    .badge {
      background-color: #2196F3;
      color: white;
      border-radius: 12px;
      padding: 2px 8px;
      font-size: 12px;
      font-weight: 500;
      
      &.active {
        background-color: #4CAF50;
      }
    }

    .active {
      background-color: rgba(63, 81, 181, 0.1) !important;
      
      .mat-list-item-content {
        color: #3f51b5;
      }
    }

    mat-nav-list {
      padding-top: 16px;
    }

    .mat-mdc-list-item {
      margin-bottom: 4px;
      
      &:hover {
        background-color: rgba(0, 0, 0, 0.04);
      }
    }
  `]
})
export class AppComponent {
  title = 'laboratorio-lao-frontend';

  constructor(public apiService: ApiService) {
    // Cargar datos iniciales
    this.apiService.loadAllData();
  }

  toggleSidenav() {
    // Esta función se puede expandir para manejar el toggle del sidenav en móviles
  }
}
