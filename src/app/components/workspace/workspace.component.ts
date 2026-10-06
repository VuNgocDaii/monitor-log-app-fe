import { Component, OnInit } from '@angular/core';
import { WorkspaceMenuItem } from './sidebar/sidebar.component';
import { AuthService } from 'src/app/services/auth.service';
import { ProjectResponse } from 'src/app/services/project.service';

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
  managedProject: ProjectResponse | null = null;

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

  openProjectManagement(project: ProjectResponse): void {
    this.managedProject = project;
  }

  closeProjectManagement(): void {
    this.managedProject = null;
  }

  onProjectMemberCountChanged(memberCount: number): void {
    if (!this.managedProject) {
      return;
    }

    this.managedProject.memberCount = memberCount;

    if (this.selectedItem.projectId === this.managedProject.projectId && this.selectedItem.project) {
      this.selectedItem = {
        ...this.selectedItem,
        project: {
          ...this.selectedItem.project,
          memberCount,
        },
      };
    }
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
