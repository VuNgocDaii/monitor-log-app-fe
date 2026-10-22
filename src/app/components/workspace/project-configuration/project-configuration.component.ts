import { Component, EventEmitter, Input, OnDestroy, OnInit, Output } from '@angular/core';
import { HttpErrorResponse } from '@angular/common/http';
import { Subject } from 'rxjs';
import { finalize, takeUntil } from 'rxjs/operators';
import { ProjectResponse } from 'src/app/services/project.service';
import { ProjectModuleResponse, ProjectModuleService } from 'src/app/services/project-module.service';
import { TicketStatusResponse, TicketStatusService, TicketStatusType } from 'src/app/services/ticket-status.service';

type ConfigurationTab = 'modules' | 'statuses';

@Component({
  selector: 'app-project-configuration',
  templateUrl: './project-configuration.component.html',
  styleUrls: ['./project-configuration.component.scss'],
})
export class ProjectConfigurationComponent implements OnInit, OnDestroy {
  @Input() project!: ProjectResponse;
  @Output() closed = new EventEmitter<void>();

  readonly pageSize = 10;
  tab: ConfigurationTab = 'modules';
  search = '';
  loading = false;
  saving = false;
  error = '';
  editorOpen = false;

  modules: ProjectModuleResponse[] = [];
  modulePage = 1;
  moduleTotalPages = 0;
  moduleTotalCount = 0;
  editingModule: ProjectModuleResponse | null = null;
  moduleCode = '';
  moduleName = '';
  moduleDescription = '';

  statuses: TicketStatusResponse[] = [];
  statusType: TicketStatusType = 'dev';
  statusPage = 1;
  statusTotalPages = 0;
  statusTotalCount = 0;
  editingStatus: TicketStatusResponse | null = null;
  statusCode = '';
  statusName = '';
  statusColor = '#3B82F6';
  statusOrder = 0;
  statusDefault = false;
  statusClosed = false;

  private readonly destroy$ = new Subject<void>();
  private searchTimer?: ReturnType<typeof setTimeout>;

  constructor(
    private readonly projectModuleService: ProjectModuleService,
    private readonly ticketStatusService: TicketStatusService,
  ) {}

  ngOnInit(): void { this.loadCurrent(); }

  ngOnDestroy(): void {
    if (this.searchTimer) clearTimeout(this.searchTimer);
    this.destroy$.next();
    this.destroy$.complete();
  }

  get isArchived(): boolean { return this.project.status === 'archived'; }

  setTab(tab: ConfigurationTab): void {
    this.tab = tab;
    this.search = '';
    this.cancelEditor();
    this.loadCurrent();
  }

  loadCurrent(page = 1): void {
    if (this.tab === 'modules') this.loadModules(page);
    else this.loadStatuses(page);
  }

  loadModules(page = 1): void {
    this.loading = true;
    this.error = '';
    this.projectModuleService.getModules(this.project.projectId, {
      search: this.search,
      isActive: true,
      pageNumber: page,
      pageSize: this.pageSize,
    }).pipe(takeUntil(this.destroy$), finalize(() => { this.loading = false; })).subscribe({
      next: response => {
        this.modules = response.items ?? [];
        this.modulePage = response.pageNumber;
        this.moduleTotalPages = response.totalPages;
        this.moduleTotalCount = response.totalCount;
      },
      error: error => { this.error = this.errorMessage(error, 'Không tải được module.'); },
    });
  }

  loadStatuses(page = 1): void {
    this.loading = true;
    this.error = '';
    this.ticketStatusService.getStatuses(this.project.projectId, {
      type: this.statusType,
      search: this.search,
      isActive: true,
      pageNumber: page,
      pageSize: 20,
    }).pipe(takeUntil(this.destroy$), finalize(() => { this.loading = false; })).subscribe({
      next: response => {
        this.statuses = response.items ?? [];
        this.statusPage = response.pageNumber;
        this.statusTotalPages = response.totalPages;
        this.statusTotalCount = response.totalCount;
      },
      error: error => { this.error = this.errorMessage(error, 'Không tải được trạng thái ticket.'); },
    });
  }

  onSearchChanged(value: string): void {
    this.search = value;
    if (this.searchTimer) clearTimeout(this.searchTimer);
    this.searchTimer = setTimeout(() => this.loadCurrent(1), 300);
  }

  setStatusType(type: TicketStatusType): void {
    if (this.statusType === type) return;
    this.statusType = type;
    this.search = '';
    this.cancelEditor();
    this.loadStatuses(1);
  }

  openModuleEditor(module?: ProjectModuleResponse): void {
    if (this.isArchived) return;
    this.editingModule = module ?? null;
    this.moduleCode = module?.moduleCode ?? '';
    this.moduleName = module?.moduleName ?? '';
    this.moduleDescription = module?.description ?? '';
    this.error = '';
    this.editorOpen = true;
  }

  saveModule(): void {
    if (this.isArchived || this.saving) return;
    const moduleName = this.moduleName.trim();
    const moduleCode = this.moduleCode.trim().toUpperCase();
    if (!moduleName || moduleName.length > 255 || (!this.editingModule && !/^[A-Z][A-Z0-9_]{0,29}$/.test(moduleCode))) {
      this.error = 'Nhập tên module (tối đa 255 ký tự) và mã hợp lệ: tối đa 30 ký tự, bắt đầu bằng chữ.';
      return;
    }
    this.saving = true;
    const request = this.editingModule
      ? this.projectModuleService.updateModule(this.project.projectId, this.editingModule.moduleId, { moduleName, description: this.moduleDescription.trim() || null })
      : this.projectModuleService.createModule(this.project.projectId, { moduleCode, moduleName, description: this.moduleDescription.trim() || null });
    request.pipe(takeUntil(this.destroy$), finalize(() => { this.saving = false; })).subscribe({
      next: () => { this.cancelEditor(); this.loadModules(this.modulePage); },
      error: error => { this.error = this.errorMessage(error, 'Không lưu được module.'); },
    });
  }

  openStatusEditor(status?: TicketStatusResponse): void {
    if (this.isArchived) return;
    this.editingStatus = status ?? null;
    this.statusCode = status?.statusCode ?? '';
    this.statusName = status?.statusName ?? '';
    this.statusColor = status?.color ?? '#3B82F6';
    this.statusOrder = status?.displayOrder ?? 0;
    this.statusDefault = status?.isDefault ?? false;
    this.statusClosed = status?.isClosed ?? false;
    this.error = '';
    this.editorOpen = true;
  }

  saveStatus(): void {
    if (this.isArchived || this.saving) return;
    const statusCode = this.statusCode.trim().toLowerCase();
    const statusName = this.statusName.trim();
    const color = this.statusColor.trim() || null;
    if (!statusName || statusName.length > 100 || (!this.editingStatus && !/^[a-z][a-z0-9_]{0,29}$/.test(statusCode)) || (color && !/^#[0-9A-Fa-f]{6}$/.test(color))) {
      this.error = 'Kiểm tra tên, mã status và màu HEX (#3B82F6).';
      return;
    }
    this.saving = true;
    const payload = { statusName, color, displayOrder: Math.max(0, Number(this.statusOrder) || 0), isDefault: this.statusDefault, isClosed: this.statusClosed };
    const request = this.editingStatus
      ? this.ticketStatusService.updateStatus(this.project.projectId, this.editingStatus.statusId, payload)
      : this.ticketStatusService.createStatus(this.project.projectId, { statusType: this.statusType, statusCode, ...payload });
    request.pipe(takeUntil(this.destroy$), finalize(() => { this.saving = false; })).subscribe({
      next: () => { this.cancelEditor(); this.loadStatuses(this.statusPage); },
      error: error => { this.error = this.errorMessage(error, 'Không lưu được trạng thái ticket.'); },
    });
  }

  changeModuleStatus(module: ProjectModuleResponse): void {
    if (this.isArchived || this.saving) return;
    this.saving = true;
    this.projectModuleService.changeStatus(this.project.projectId, module.moduleId, module.isActive ? 'archive' : 'restore')
      .pipe(takeUntil(this.destroy$), finalize(() => { this.saving = false; }))
      .subscribe({ next: () => this.loadModules(this.modulePage), error: error => { this.error = this.errorMessage(error, 'Không đổi được trạng thái module.'); } });
  }

  changeTicketStatus(status: TicketStatusResponse): void {
    if (this.isArchived || this.saving || (status.isActive && status.isDefault)) return;
    this.saving = true;
    this.ticketStatusService.changeStatus(this.project.projectId, status.statusId, status.isActive ? 'archive' : 'restore')
      .pipe(takeUntil(this.destroy$), finalize(() => { this.saving = false; }))
      .subscribe({ next: () => this.loadStatuses(this.statusPage), error: error => { this.error = this.errorMessage(error, 'Không đổi được trạng thái ticket.'); } });
  }

  cancelEditor(): void {
    this.editorOpen = false;
    this.editingModule = null;
    this.editingStatus = null;
  }

  close(): void { if (!this.saving) this.closed.emit(); }

  private errorMessage(error: HttpErrorResponse, fallback: string): string {
    const body = error?.error;
    if (body?.errors && typeof body.errors === 'object') {
      const messages = Object.values(body.errors).flat().filter((item): item is string => typeof item === 'string');
      if (messages.length) return messages.join(' ');
    }
    return body?.detail || body?.title || body?.message || fallback;
  }
}
