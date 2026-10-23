import { Component, Input } from '@angular/core';

@Component({
  selector: 'app-loading',
  template: `
    <div *ngIf="isLoading" class="loading-overlay" role="status" aria-live="polite">
      <div class="loading-spinner" aria-hidden="true"></div>
      <span>Đang xử lý...</span>
    </div>
  `,
  styles: [`
    .loading-overlay {
      position: fixed;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      background-color: var(--monitor-backdrop);
      display: flex;
      justify-content: center;
      align-items: center;
      flex-direction: column;
      gap: 16px;
      color: var(--monitor-text);
      z-index: 9999;
    }
    .loading-spinner {
      width: 32px;
      height: 32px;
      border: 3px solid var(--monitor-line);
      border-top-color: var(--monitor-accent);
      border-radius: 50%;
      animation: spin 1s linear infinite;
    }
    @keyframes spin {
      0% { transform: rotate(0deg); }
      100% { transform: rotate(360deg); }
    }
  `]
})
export class LoadingComponent {
  @Input() isLoading: boolean = false;
}
