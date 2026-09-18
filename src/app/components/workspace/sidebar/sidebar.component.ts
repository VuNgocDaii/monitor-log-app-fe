import {
  Component,
  ElementRef,
  EventEmitter,
  HostListener,
  Input,
  OnDestroy,
  OnInit,
  Output,
  ViewChild,
} from '@angular/core';
import { HttpErrorResponse } from '@angular/common/http';
import { Subject, Subscription } from 'rxjs';
import { finalize, takeUntil } from 'rxjs/operators';
import {
  ProjectResponse,
  ProjectService,
} from 'src/app/services/project.service';

export interface WorkspaceMenuItem {
  id: string;
  label: string;
  icon: string;
  projectId?: string;
  projectKey?: string;
  project?: ProjectResponse;
}

interface WorkspaceMenuSection {
  id: string;
  title: string;
  items: WorkspaceMenuItem[];
  allowAdd?: boolean;
}

@Component({
  selector: 'app-sidebar',
  templateUrl: './sidebar.component.html',
  styleUrls: ['./sidebar.component.scss'],
})
export class SidebarComponent implements OnInit, OnDestroy {
  @Input() activeItemId = 'getting-started';
  @Input() currentUser: any = null;

  @Output() itemSelected = new EventEmitter<WorkspaceMenuItem>();
  @Output() collapsedChange = new EventEmitter<boolean>();

  @ViewChild('addProjectButton')
  private addProjectButton?: ElementRef<HTMLButtonElement>;

  @ViewChild('projectDialog', { static: true })
  private projectDialog?: ElementRef<HTMLDialogElement>;

  @ViewChild('projectActionsMenu')
  set projectActionsMenu(menu: ElementRef<HTMLElement> | undefined) {
    menu?.nativeElement.querySelector<HTMLButtonElement>('button')?.focus();
  }

  @ViewChild('projectNameInput')
  set projectNameInput(input: ElementRef<HTMLInputElement> | undefined) {
    input?.nativeElement.focus();
  }

  collapsed = false;
  loadingProjects = false;
  projectListError = '';
  hasMoreProjects = false;
  showCreateProject = false;
  creatingProject = false;
  createProjectError = '';

  newProjectName = '';
  newProjectKey = '';
  newProjectDescription = '';

  projectStatusFilter: 'active' | 'archived' = 'active';
  openedProjectMenu: WorkspaceMenuItem | null = null;
  projectMenuLeft = 0;
  projectMenuTop = 0;

  dialogMode: 'details' | 'edit' | 'archive' | 'restore' = 'details';
  projectDetails: ProjectResponse | null = null;
  loadingProjectDetails = false;
  savingProject = false;
  projectDetailError = '';
  projectActionError = '';
  editedProjectName = '';
  editedProjectDescription = '';

  private dialogProjectId = '';
  private projectDetailsSubscription?: Subscription;
  private menuTrigger?: HTMLButtonElement;
  private dialogReturnFocus?: HTMLElement;

  readonly projectSection: WorkspaceMenuSection = {
    id: 'projects',
    title: 'Projects',
    allowAdd: true,
    items: [],
  };

  readonly sections: WorkspaceMenuSection[] = [this.projectSection];

  private readonly pageSize = 10;
  private loadedPage = 0;
  private projectListSubscription?: Subscription;
  private readonly destroy$ = new Subject<void>();

  constructor(private readonly projectService: ProjectService) { }

  ngOnInit(): void {
    this.loadProjects(true);
  }

  ngOnDestroy(): void {
    this.projectDialog?.nativeElement.close();
    this.destroy$.next();
    this.destroy$.complete();
  }

  loadProjects(reset = false): void {
    if (!reset && (this.loadingProjects || !this.hasMoreProjects)) {
      return;
    }

    if (reset) {
      this.closeProjectMenu();
      this.projectListSubscription?.unsubscribe();
      this.loadedPage = 0;
      this.projectSection.items = [];
      this.hasMoreProjects = false;
    }

    const pageNumber = this.loadedPage + 1;
    this.loadingProjects = true;
    this.projectListError = '';

    this.projectListSubscription = this.projectService
      .searchProjectList({ status: this.projectStatusFilter, pageNumber, pageSize: this.pageSize })
      .pipe(
        takeUntil(this.destroy$),
        finalize(() => { this.loadingProjects = false; })
      )
      .subscribe({
        next: (response) => {
          if (!response || !Array.isArray(response.items)) {
            this.projectListError = 'API danh sách project trả dữ liệu không hợp lệ.';
            return;
          }

          const items = new Map(
            this.projectSection.items.map(item => [item.id, item] as const)
          );
          response.items.forEach(project => {
            items.set(project.projectId, this.toMenuItem(project));
          });
          this.projectSection.items = Array.from(items.values());
          this.loadedPage = pageNumber;
          this.hasMoreProjects = response.items.length > 0
            && pageNumber < response.totalPages;
        },
        error: (error: HttpErrorResponse) => {
          this.projectListError = this.getErrorMessage(
            error, 'Không tải được danh sách project.'
          );
        },
      });
  }

  retryLoadProjects(): void {
    this.loadProjects(this.loadedPage === 0);
  }

  openCreateProject(): void {
    this.closeProjectMenu();
    if (this.collapsed) {
      this.collapsed = false;
      this.collapsedChange.emit(false);
    }
    this.createProjectError = '';
    this.showCreateProject = true;
  }

  closeCreateProject(): void {
    if (this.creatingProject) {
      return;
    }
    this.showCreateProject = false;
    this.resetCreateForm();
    this.addProjectButton?.nativeElement.focus();
  }

  createProject(event: Event): void {
    event.preventDefault();
    if (this.creatingProject) {
      return;
    }

    const projectName = this.newProjectName.trim();
    const projectKey = this.newProjectKey.trim().toUpperCase();
    const description = this.newProjectDescription.trim();
    this.createProjectError = '';

    if (!projectName || projectName.length > 255) {
      this.createProjectError = 'Tên project bắt buộc và tối đa 255 ký tự.';
      return;
    }
    if (!/^[A-Z][A-Z0-9_]{0,19}$/.test(projectKey)) {
      this.createProjectError = 'Mã project bắt đầu bằng chữ cái, chỉ gồm chữ cái, số hoặc _, tối đa 20 ký tự.';
      return;
    }

    this.creatingProject = true;
    this.projectService.createProject({
      projectName,
      projectKey,
      description: description || null,
    })
      .pipe(
        takeUntil(this.destroy$),
        finalize(() => { this.creatingProject = false; })
      )
      .subscribe({
        next: (project) => {
          this.showCreateProject = false;
          this.resetCreateForm();
          this.selectItem(this.toMenuItem(project));
          this.projectStatusFilter = 'active';
          this.loadProjects(true);
          this.addProjectButton?.nativeElement.focus();
        },
        error: (error: HttpErrorResponse) => {
          this.createProjectError = this.getErrorMessage(
            error, 'Không tạo được project. Vui lòng thử lại.'
          );
        },
      });
  }

  selectItem(item: WorkspaceMenuItem): void {
    this.closeProjectMenu();
    this.activeItemId = item.id;
    this.itemSelected.emit(item);
  }

  toggleSidebar(): void {
    this.closeProjectMenu();
    this.collapsed = !this.collapsed;
    this.collapsedChange.emit(this.collapsed);
  }

  trackMenuItem(_index: number, item: WorkspaceMenuItem): string {
    return item.id;
  }

  toggleProjectStatusFilter(): void {
    this.projectStatusFilter = this.projectStatusFilter === 'active' ? 'archived' : 'active';
    this.loadProjects(true);
  }

  toggleProjectMenu(event: MouseEvent, item: WorkspaceMenuItem): void {
    event.stopPropagation();
    if (this.openedProjectMenu?.id === item.id) {
      this.closeProjectMenu(true);
      return;
    }
    this.menuTrigger = event.currentTarget as HTMLButtonElement;
    const rect = this.menuTrigger.getBoundingClientRect();
    const menuWidth = Math.min(216, window.innerWidth - 16);
    const menuHeight = 144;
    this.projectMenuLeft = Math.max(8, Math.min(rect.right - menuWidth, window.innerWidth - menuWidth - 8));
    this.projectMenuTop = rect.bottom + menuHeight + 8 <= window.innerHeight
      ? rect.bottom + 4
      : Math.max(8, rect.top - menuHeight - 4);
    this.openedProjectMenu = item;
  }

  closeProjectMenu(restoreFocus = false): void {
    if (!this.openedProjectMenu) {
      return;
    }
    this.openedProjectMenu = null;
    if (restoreFocus) {
      this.menuTrigger?.focus();
    }
  }

  @HostListener('document:click')
  onDocumentClick(): void {
    this.closeProjectMenu();
  }

  @HostListener('window:resize')
  onWindowResize(): void {
    this.closeProjectMenu();
  }

  @HostListener('document:keydown.escape')
  onDocumentEscape(): void {
    this.closeProjectMenu(true);
  }

  onProjectMenuKeydown(event: KeyboardEvent): void {
    if (!['ArrowDown', 'ArrowUp', 'Home', 'End'].includes(event.key)) {
      return;
    }
    event.preventDefault();
    const menu = event.currentTarget as HTMLElement;
    const buttons = Array.from(menu.querySelectorAll<HTMLButtonElement>('button:not(:disabled)'));
    if (!buttons.length) {
      return;
    }
    const current = buttons.indexOf(document.activeElement as HTMLButtonElement);
    const next = event.key === 'Home' ? 0
      : event.key === 'End' ? buttons.length - 1
        : (current + (event.key === 'ArrowUp' ? -1 : 1) + buttons.length) % buttons.length;
    buttons[next].focus();
  }

  get projectDialogTitle(): string {
    switch (this.dialogMode) {
      case 'edit': return 'Chỉnh sửa dự án';
      case 'archive': return 'Lưu trữ dự án';
      case 'restore': return 'Khôi phục dự án';
      default: return 'Thông tin dự án';
    }
  }

  openProjectDialog(
    item: WorkspaceMenuItem,
    mode: 'details' | 'edit' | 'archive' | 'restore'
  ): void {
    if (!item.projectId || this.savingProject) {
      return;
    }
    this.dialogReturnFocus = this.menuTrigger;
    this.closeProjectMenu();
    this.dialogProjectId = item.projectId;
    this.dialogMode = mode;
    const dialog = this.projectDialog?.nativeElement;
    if (dialog && !dialog.open) {
      dialog.showModal();
    }
    this.loadProjectDetails();
  }

  loadProjectDetails(): void {
    if (!this.dialogProjectId || this.savingProject) {
      return;
    }
    this.projectDetailsSubscription?.unsubscribe();
    this.projectDetails = null;
    this.projectDetailError = '';
    this.projectActionError = '';
    this.loadingProjectDetails = true;
    this.projectDetailsSubscription = this.projectService
      .getProjectInfoByProjectId(this.dialogProjectId)
      .pipe(
        takeUntil(this.destroy$),
        finalize(() => { this.loadingProjectDetails = false; })
      )
      .subscribe({
        next: (project) => {
          this.projectDetails = project;
          this.editedProjectName = project.projectName;
          this.editedProjectDescription = project.description ?? '';
          if (this.dialogMode === 'edit' && project.status === 'archived') {
            this.dialogMode = 'details';
            this.projectActionError = 'Dự án đã lưu trữ. Hãy khôi phục trước khi chỉnh sửa.';
          }
          if ((this.dialogMode === 'archive' && project.status === 'archived')
            || (this.dialogMode === 'restore' && project.status === 'active')) {
            this.dialogMode = 'details';
          }
        },
        error: (error: HttpErrorResponse) => {
          this.projectDetailError = this.getErrorMessage(error, 'Không tải được thông tin dự án.');
        },
      });
  }

  changeDialogMode(mode: 'details' | 'edit' | 'archive' | 'restore'): void {
    if (!this.projectDetails || this.loadingProjectDetails || this.savingProject) {
      return;
    }
    if (mode === 'edit' && this.projectDetails.status === 'archived') {
      return;
    }
    this.dialogMode = mode;
    this.projectActionError = '';
    this.editedProjectName = this.projectDetails.projectName;
    this.editedProjectDescription = this.projectDetails.description ?? '';
  }

  saveProjectChanges(event: Event): void {
    event.preventDefault();
    if (!this.projectDetails || this.savingProject || this.dialogMode !== 'edit') {
      return;
    }
    const name = this.editedProjectName.trim();
    if (!name || name.length > 255) {
      this.projectActionError = 'Tên dự án bắt buộc và tối đa 255 ký tự.';
      return;
    }
    this.projectActionError = '';
    this.savingProject = true;
    this.projectService.changeProjectInfoByProjectId(this.projectDetails.projectId, {
      projectName: name,
      description: this.editedProjectDescription.trim() || null,
    })
      .pipe(
        takeUntil(this.destroy$),
        finalize(() => { this.savingProject = false; })
      )
      .subscribe({
        next: (project) => { this.onProjectUpdated(project); },
        error: (error: HttpErrorResponse) => {
          this.projectActionError = this.getErrorMessage(error, 'Không lưu được thay đổi.');
        },
      });
  }

  confirmProjectStatusChange(): void {
    if (!this.projectDetails || this.savingProject
      || (this.dialogMode !== 'archive' && this.dialogMode !== 'restore')) {
      return;
    }
    this.projectActionError = '';
    this.savingProject = true;
    const request = this.dialogMode === 'archive'
      ? this.projectService.archiveProject(this.projectDetails.projectId)
      : this.projectService.restoreProject(this.projectDetails.projectId);
    request.pipe(
      takeUntil(this.destroy$),
      finalize(() => { this.savingProject = false; })
    ).subscribe({
      next: (project) => { this.onProjectUpdated(project); },
      error: (error: HttpErrorResponse) => {
        this.projectActionError = this.getErrorMessage(error, 'Không thay đổi được trạng thái dự án.');
      },
    });
  }

  closeProjectDialog(): void {
    if (this.savingProject) {
      return;
    }
    this.projectDetailsSubscription?.unsubscribe();
    this.projectDialog?.nativeElement.close();
    this.dialogProjectId = '';
    this.projectDetails = null;
    const target = this.dialogReturnFocus?.isConnected
      ? this.dialogReturnFocus : this.addProjectButton?.nativeElement;
    target?.focus();
  }

  onProjectDialogCancel(event: Event): void {
    event.preventDefault();
    this.closeProjectDialog();
  }

  onProjectDialogBackdropClick(event: MouseEvent): void {
    if (event.target === this.projectDialog?.nativeElement) {
      this.closeProjectDialog();
    }
  }

  private onProjectUpdated(project: ProjectResponse): void {
    this.projectDetails = project;
    this.dialogMode = 'details';
    this.projectActionError = '';
    if (this.activeItemId === project.projectId) {
      this.selectItem(this.toMenuItem(project));
    }
    this.loadProjects(true);
  }

  private toMenuItem(project: ProjectResponse): WorkspaceMenuItem {
    return {
      id: project.projectId,
      label: project.projectName,
      icon: 'pi pi-folder',
      projectId: project.projectId,
      projectKey: project.projectKey,
      project,
    };
  }

  private resetCreateForm(): void {
    this.newProjectName = '';
    this.newProjectKey = '';
    this.newProjectDescription = '';
    this.createProjectError = '';
  }

  private getErrorMessage(error: HttpErrorResponse, fallback: string): string {
    if (error.status === 0) {
      return 'Không kết nối được máy chủ. Kiểm tra kết nối rồi thử lại.';
    }
    if (error.status === 401) {
      return 'Phiên đăng nhập không hợp lệ hoặc đã hết hạn. Vui lòng đăng nhập lại.';
    }
    const body = error.error;
    if (body && typeof body === 'object') {
      if (body.errors && typeof body.errors === 'object') {
        const messages = Object.values(body.errors)
          .filter((value): value is string[] =>
            Array.isArray(value) && value.every(item => typeof item === 'string'))
          .map(value => value.join(' '))
          .join(' ');
        if (messages) {
          return messages;
        }
      }
      for (const message of [body.detail, body.title, body.message]) {
        if (typeof message === 'string' && message.trim()) {
          return message;
        }
      }
    }
    return fallback;
  }
}
