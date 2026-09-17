import { Component } from '@angular/core';
import { WorkspaceMenuItem } from './sidebar/sidebar.component';

@Component({
  selector: 'app-workspace',
  templateUrl: './workspace.component.html',
  styleUrls: ['./workspace.component.scss'],
})
export class WorkspaceComponent {
  selectedItem: WorkspaceMenuItem = {
    id: 'getting-started',
    label: 'Getting Started',
    icon: 'pi pi-star',
  };

  sidebarCollapsed = false;

  onMenuItemSelected(item: WorkspaceMenuItem): void {
    this.selectedItem = item;
  }

  onSidebarCollapsed(collapsed: boolean): void {
    this.sidebarCollapsed = collapsed;
  }
}
