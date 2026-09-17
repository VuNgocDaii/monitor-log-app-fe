import { Component, Input } from '@angular/core';
import { WorkspaceMenuItem } from '../sidebar/sidebar.component';

interface ChecklistItem {
  label: string;
  completed: boolean;
  nested?: boolean;
}

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

  readonly checklist: ChecklistItem[] = [
    { label: 'Create an account with Notion', completed: true },
    { label: 'Click anywhere below and type / to see what you can create – headers, tables, to-do’s, etc.', completed: false },
    { label: 'Type /page to add a new page and nest anything, anywhere', completed: false, nested: true },
    { label: 'Find, organize, and add new pages using the sidebar to the left 👈', completed: false },
    { label: 'Check out the Todo List on the left 👈 we added for you with some more tips and tricks to best use Notion', completed: false },
  ];

  get isGettingStarted(): boolean {
    return this.selectedItem.id === 'getting-started';
  }
}
