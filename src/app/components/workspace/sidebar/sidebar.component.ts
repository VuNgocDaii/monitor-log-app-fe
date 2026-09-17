import { Component, EventEmitter, Input, Output } from '@angular/core';

export interface WorkspaceMenuItem {
  id: string;
  label: string;
  icon: string;
}

interface WorkspaceMenuSection {
  title: string;
  items: WorkspaceMenuItem[];
  allowAdd?: boolean;
}

@Component({
  selector: 'app-sidebar',
  templateUrl: './sidebar.component.html',
  styleUrls: ['./sidebar.component.scss'],
})
export class SidebarComponent {
  @Input() activeItemId = 'getting-started';

  @Output() itemSelected = new EventEmitter<WorkspaceMenuItem>();
  @Output() collapsedChange = new EventEmitter<boolean>();

  collapsed = false;

  readonly sections: WorkspaceMenuSection[] = [
    {
      title: 'Recents',
      items: [
        { id: 'getting-started', label: 'Getting Started', icon: 'pi pi-star' },
      ],
    },
    {
      title: 'Private',
      allowAdd: true,
      items: [
        { id: 'getting-started', label: 'Getting Started', icon: 'pi pi-star' },
        { id: 'todo-list', label: 'To Do List', icon: 'pi pi-list' },
      ],
    },
    {
      title: 'Teamspaces',
      allowAdd: true,
      items: [
        { id: 'teamspace', label: "Vũ Ngọc Đại's Space HQ", icon: 'pi pi-home' },
      ],
    },
    {
      title: 'Notion apps',
      items: [
        { id: 'calendar', label: 'Notion Calendar', icon: 'pi pi-calendar' },
        { id: 'desktop', label: 'Notion Desktop', icon: 'pi pi-desktop' },
        { id: 'agents', label: 'Add agents', icon: 'pi pi-comments' },
        { id: 'meeting-notes', label: 'Try AI Meeting Notes', icon: 'pi pi-file-edit' },
        { id: 'library', label: 'Library', icon: 'pi pi-book' },
        { id: 'tasks', label: 'My Tasks', icon: 'pi pi-check-square' },
        { id: 'marketplace', label: 'Marketplace', icon: 'pi pi-th-large' },
        { id: 'help', label: 'Help', icon: 'pi pi-question-circle' },
        { id: 'trash', label: 'Trash', icon: 'pi pi-trash' },
      ],
    },
  ];

  selectItem(item: WorkspaceMenuItem): void {
    this.itemSelected.emit(item);
  }

  toggleSidebar(): void {
    this.collapsed = !this.collapsed;
    this.collapsedChange.emit(this.collapsed);
  }
}
