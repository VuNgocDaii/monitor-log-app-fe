import {
  Component,
  EventEmitter,
  HostListener,
  Input,
  OnDestroy,
  OnInit,
  Output,
} from '@angular/core';
import { HttpErrorResponse } from '@angular/common/http';
import { Subject } from 'rxjs';
import { finalize, takeUntil } from 'rxjs/operators';
import { ProjectResponse } from 'src/app/services/project.service';
import {
  ProjectMemberCandidateResponse,
  ProjectMemberResponse,
  ProjectMemberService,
} from 'src/app/services/project-member.service';

@Component({
  selector: 'app-project-member-management',
  templateUrl: './project-member-management.component.html',
  styleUrls: ['./project-member-management.component.scss', './member-confirmation.scss', './member-list.scss'],
})
export class ProjectMemberManagementComponent implements OnInit, OnDestroy {
  @Input() project!: ProjectResponse;

  @Output() closed = new EventEmitter<void>();
  @Output() memberCountChanged = new EventEmitter<number>();

  readonly pageSize = 10;

  members: ProjectMemberResponse[] = [];
  memberSearch = '';
  memberPage = 1;
  memberTotalPages = 0;
  memberTotalCount = 0;
  loadingMembers = false;
  memberError = '';

  showAddMember = false;
  candidates: ProjectMemberCandidateResponse[] = [];
  candidateSearch = '';
  candidatePage = 1;
  candidateTotalPages = 0;
  candidateTotalCount = 0;
  loadingCandidates = false;
  candidateError = '';
  addingUserId = '';
  candidatePendingAdd: ProjectMemberCandidateResponse | null = null;

  memberPendingDelete: ProjectMemberResponse | null = null;
  removingUserId = '';
  verifyingRemoval = false;
  actionError = '';
  successMessage = '';

  private memberSearchTimer?: ReturnType<typeof setTimeout>;
  private candidateSearchTimer?: ReturnType<typeof setTimeout>;
  private successTimer?: ReturnType<typeof setTimeout>;
  private memberLoadSequence = 0;
  private candidateLoadSequence = 0;
  private readonly destroy$ = new Subject<void>();

  constructor(private readonly projectMemberService: ProjectMemberService) {}

  ngOnInit(): void {
    this.loadMembers();
  }

  ngOnDestroy(): void {
    if (this.memberSearchTimer) {
      clearTimeout(this.memberSearchTimer);
    }
    if (this.candidateSearchTimer) {
      clearTimeout(this.candidateSearchTimer);
    }
    if (this.successTimer) {
      clearTimeout(this.successTimer);
    }
    this.destroy$.next();
    this.destroy$.complete();
  }

  close(): void {
    if (this.isWriting) {
      return;
    }
    this.closed.emit();
  }

  @HostListener('document:keydown.escape')
  onEscape(): void {
    if (this.memberPendingDelete) {
      this.cancelRemove();
      return;
    }
    if (this.candidatePendingAdd) {
      this.cancelAdd();
      return;
    }
    if (this.showAddMember) {
      this.closeAddMember();
      return;
    }
    this.close();
  }

  onBackdropClick(event: MouseEvent): void {
    if (event.target === event.currentTarget) {
      this.close();
    }
  }

  get isWriting(): boolean {
    return !!this.addingUserId || !!this.removingUserId || this.verifyingRemoval;
  }

  get isArchived(): boolean {
    return this.project.status === 'archived';
  }

  loadMembers(page = this.memberPage): void {
    const sequence = ++this.memberLoadSequence;
    this.loadingMembers = true;
    this.memberError = '';
    this.projectMemberService.getMembers(this.project.projectId, {
      search: this.memberSearch,
      pageNumber: page,
      pageSize: this.pageSize,
    })
      .pipe(
        takeUntil(this.destroy$),
        finalize(() => {
          if (sequence === this.memberLoadSequence) {
            this.loadingMembers = false;
          }
        })
      )
      .subscribe({
        next: response => {
          if (sequence !== this.memberLoadSequence) return;
          this.members = response.items ?? [];
          this.memberPage = response.pageNumber;
          this.memberTotalPages = response.totalPages;
          this.memberTotalCount = response.totalCount;
          if (!this.memberSearch.trim()) {
            this.memberCountChanged.emit(response.totalCount);
          }
        },
        error: (error: HttpErrorResponse) => {
          if (sequence !== this.memberLoadSequence) return;
          this.memberError = this.getErrorMessage(error, 'Không tải được danh sách thành viên.');
        },
      });
  }

  onMemberSearchChanged(value: string): void {
    this.memberSearch = value;
    if (this.memberSearchTimer) {
      clearTimeout(this.memberSearchTimer);
    }
    this.memberSearchTimer = setTimeout(() => {
      this.memberPage = 1;
      this.loadMembers(1);
    }, 300);
  }

  openAddMember(): void {
    if (this.isArchived || this.isWriting) {
      return;
    }
    this.showAddMember = true;
    this.actionError = '';
    this.candidateSearch = '';
    this.candidatePage = 1;
    
    this.loadCandidates(1);
  }

  closeAddMember(): void {
    if (this.addingUserId) {
      return;
    }
    this.showAddMember = false;
    this.candidatePendingAdd = null;
    this.candidateError = '';
    this.actionError = '';
    this.candidates = [];
  }

  loadCandidates(page = this.candidatePage): void {
    if (this.isArchived) {
      return;
    }
    const sequence = ++this.candidateLoadSequence;
    this.loadingCandidates = true;
    this.candidateError = '';
    this.projectMemberService.getMemberCandidates(this.project.projectId, {
      search: this.candidateSearch,
      pageNumber: page,
      pageSize: this.pageSize,
    })
      .pipe(
        takeUntil(this.destroy$),
        finalize(() => {
          if (sequence === this.candidateLoadSequence) {
            this.loadingCandidates = false;
          }
        })
      )
      .subscribe({
        next: response => {
          if (sequence !== this.candidateLoadSequence) return;
          this.candidates = response.items ?? [];
          this.candidatePage = response.pageNumber;
          this.candidateTotalPages = response.totalPages;
          this.candidateTotalCount = response.totalCount;
        },
        error: (error: HttpErrorResponse) => {
          if (sequence !== this.candidateLoadSequence) return;
          this.candidateError = this.getErrorMessage(error, 'Không tải được danh sách tài khoản.');
        },
      });
  }

  onCandidateSearchChanged(value: string): void {
    this.candidateSearch = value;
    if (this.candidateSearchTimer) {
      clearTimeout(this.candidateSearchTimer);
    }
    this.candidateSearchTimer = setTimeout(() => {
      this.candidatePage = 1;
      this.loadCandidates(1);
    }, 300);
  }

  requestAdd(candidate: ProjectMemberCandidateResponse): void {
    if (this.isArchived || this.isWriting) {
      return;
    }
    this.actionError = '';
    this.candidatePendingAdd = candidate;
  }

  cancelAdd(): void {
    if (!this.addingUserId) {
      this.candidatePendingAdd = null;
      this.actionError = '';
    }
  }

  confirmAdd(): void {
    const candidate = this.candidatePendingAdd;
    if (!candidate || this.isArchived || this.isWriting) {
      return;
    }
    this.addingUserId = candidate.userId;
    this.actionError = '';
    this.projectMemberService.addMember(this.project.projectId, candidate.userId)
      .pipe(
        takeUntil(this.destroy$),
        finalize(() => { this.addingUserId = ''; })
      )
      .subscribe({
        next: () => {
          this.candidatePendingAdd = null;
          this.showSuccess(`Đã thêm ${this.displayName(candidate)} vào dự án.`);
          this.memberSearch = '';
          this.memberPage = 1;
          this.loadMembers(1);
          this.loadCandidates(this.candidatePage);
        },
        error: (error: HttpErrorResponse) => {
          this.actionError = this.getErrorMessage(error, 'Không thêm được thành viên.');
        },
      });
  }

  requestRemove(member: ProjectMemberResponse): void {
    if (this.isArchived || this.isWriting) {
      return;
    }
    this.actionError = '';
    this.memberPendingDelete = member;
  }

  cancelRemove(): void {
    if (!this.removingUserId) {
      this.memberPendingDelete = null;
      this.actionError = '';
    }
  }

  confirmRemove(): void {
    const member = this.memberPendingDelete;
    if (!member || this.isArchived || this.isWriting) {
      return;
    }
    this.removingUserId = member.userId;
    this.actionError = '';
    this.projectMemberService.removeMember(this.project.projectId, member.userId)
      .pipe(
        takeUntil(this.destroy$),
        finalize(() => { this.removingUserId = ''; })
      )
      .subscribe({
        next: () => this.onMemberRemoved(member),
        error: (error: HttpErrorResponse) => {
          // Một số interceptor cũ đẩy response 204 vào nhánh error vì body rỗng.
          if (error.status === 204) {
            this.onMemberRemoved(member);
            return;
          }
          this.verifyMemberRemoval(member, error);
        },
      });
  }

  displayName(user: { username: string; fullName: string | null }): string {
    return user.fullName?.trim() || user.username;
  }

  initials(user: { username: string; fullName: string | null }): string {
    const value = this.displayName(user).trim();
    const words = value.split(/\s+/).filter(Boolean);
    return (words.length > 1 ? words[0][0] + words[words.length - 1][0] : value.slice(0, 2)).toUpperCase();
  }

  trackUser(_index: number, user: { userId: string }): string {
    return user.userId;
  }

  private getErrorMessage(error: HttpErrorResponse, fallback: string): string {
    if (error.status === 0) {
      return 'Không kết nối được máy chủ.';
    }
    if (error.status === 401) {
      return 'Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại.';
    }
    const body = error.error;
    if (body && typeof body === 'object') {
      for (const message of [body.detail, body.title, body.message]) {
        if (typeof message === 'string' && message.trim()) {
          return message;
        }
      }
    }
    return fallback;
  }

  private showSuccess(message: string): void {
    this.successMessage = message;
    if (this.successTimer) {
      clearTimeout(this.successTimer);
    }
    this.successTimer = setTimeout(() => {
      this.successMessage = '';
    }, 3000);
  }

  private onMemberRemoved(member: ProjectMemberResponse): void {
    this.memberPendingDelete = null;
    this.showSuccess(`Đã xóa ${this.displayName(member)} khỏi dự án.`);
    this.memberSearch = '';
    this.memberPage = 1;
    this.loadMembers(1);

    // User vừa bị xóa khỏi project sẽ trở lại danh sách có thể thêm.
    if (this.showAddMember) {
      this.loadCandidates(this.candidatePage);
    }
  }

  private verifyMemberRemoval(member: ProjectMemberResponse, originalError: HttpErrorResponse): void {
    this.verifyingRemoval = true;
    this.projectMemberService.getMembers(this.project.projectId, {
      search: member.username,
      pageNumber: 1,
      pageSize: this.pageSize,
    })
      .pipe(
        takeUntil(this.destroy$),
        finalize(() => { this.verifyingRemoval = false; })
      )
      .subscribe({
        next: response => {
          const memberStillExists = (response.items ?? [])
            .some(item => item.userId === member.userId);

          if (!memberStillExists) {
            this.onMemberRemoved(member);
            return;
          }

          this.actionError = this.getErrorMessage(originalError, 'Không xóa được thành viên.');
        },
        error: () => {
          this.actionError = this.getErrorMessage(originalError, 'Không xóa được thành viên.');
        },
      });
  }
}
