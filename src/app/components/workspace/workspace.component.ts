import { Component, OnInit } from '@angular/core';
import { WorkspaceMenuItem } from './sidebar/sidebar.component';
import { AuthService } from 'src/app/services/auth.service';

@Component({
  selector: 'app-workspace',
  templateUrl: './workspace.component.html',
  styleUrls: ['./workspace.component.scss'],
})
export class WorkspaceComponent implements OnInit {
  selectedItem: WorkspaceMenuItem = {
    id: 'getting-started',
    label: 'Getting Started',
    icon: 'pi pi-star',
  };

  sidebarCollapsed = false;
  currentUser: any = null;

  constructor(private readonly authService: AuthService) {}

  ngOnInit(): void {
    this.getCurrentUser();
  }

  onMenuItemSelected(item: WorkspaceMenuItem): void {
    this.selectedItem = item;
  }

  onSidebarCollapsed(collapsed: boolean): void {
    this.sidebarCollapsed = collapsed;
  }

  getCurrentUser(): void {
    this.authService.getCurrentUser().subscribe({
      next: (response) => {
        this.currentUser = response;
      },
      error: () => {
        this.currentUser = null;
      },
    });
  }
}