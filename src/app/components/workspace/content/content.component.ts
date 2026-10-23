import { Component, EventEmitter, Input, Output } from '@angular/core';
import { ProjectResponse } from 'src/app/services/project.service';
import { WorkspaceMenuItem } from '../sidebar/sidebar.component';

@Component({
  selector: 'app-content',
  templateUrl: './content.component.html',
  styleUrls: ['./content.component.scss'],
})
export class ContentComponent {
  @Input() selectedItem: WorkspaceMenuItem = {
    id: 'getting-started',
    label: 'Getting Started',
    icon: 'pi pi-star',
  };

  @Input() sidebarCollapsed = false;
  @Input() currentUser: any = null;
  @Output() manageProject = new EventEmitter<ProjectResponse>();
  @Output() configureProject = new EventEmitter<ProjectResponse>();
  @Output() createProject = new EventEmitter<void>();

  get selectedProject(): ProjectResponse | undefined {
    return this.selectedItem.project;
  }

  get displayName(): string {
    return this.currentUser?.fullName || this.currentUser?.username || 'bạn';
  }
}
