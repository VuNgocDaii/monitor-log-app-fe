import { Component, ElementRef, HostListener, OnDestroy, OnInit, ViewChild, ViewEncapsulation } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { DomSanitizer } from '@angular/platform-browser';
import { forkJoin, of, Subscription } from 'rxjs';
import { catchError, map } from 'rxjs/operators';
import { SessionFileItem, SessionFilesResponse, SessionViewService } from './session-view.service';
import { mountDevtoolsPanel, TabTelemetryData } from './devtools-panel';

type DevtoolsTab = 'console' | 'network' | 'actions';
type UnknownRow = Record<string, any>;

interface TicketPayload {
  type?: string;
  title?: string;
  description?: string;
  createdAt?: number;
  pageUrl?: string;
  pageTitle?: string;
  consoleLogs?: UnknownRow[];
  networkLogs?: UnknownRow[];
  userEvents?: UnknownRow[];
  annotations?: Array<{ startMs?: number; endMs?: number }>;
  video?: { durationMs?: number };
  telemetry?: Partial<TabTelemetryData>;
}

@Component({
  selector: 'app-session-view',
  templateUrl: './session-view.component.html',
  styleUrls: [
    './review.css',
    './screenshot-review.css',
    './devtools-panel.css',
    './session-view.component.scss'
  ],
  encapsulation: ViewEncapsulation.ShadowDom
})
export class SessionViewComponent implements OnInit, OnDestroy {
  @ViewChild('workspace') workspace?: ElementRef<HTMLElement>;
  @ViewChild('video') video?: ElementRef<HTMLVideoElement>;
  @ViewChild('devtoolsRoot') devtoolsRoot?: ElementRef<HTMLElement>;

  sessionId = '';
  session: SessionFilesResponse | null = null;
  mediaFiles: SessionFileItem[] = [];
  selectedMedia: SessionFileItem | null = null;
  ticket: TicketPayload = {};
  consoleLogs: UnknownRow[] = [];
  networkLogs: UnknownRow[] = [];
  actions: UnknownRow[] = [];
  activeTab: DevtoolsTab = 'console';
  selectedNetwork: UnknownRow | null = null;
  loading = true;
  errorMessage = '';
  lightboxOpen = false;
  dragging = false;
  isPlaying = false;
  currentTime = 0;
  duration = 0;
  playbackRate = 1;
  statusMessage = '';

  private readonly subscriptions = new Subscription();
  private readonly objectUrls: string[] = [];

  constructor(
    private route: ActivatedRoute,
    private sessionViewService: SessionViewService,
    private sanitizer: DomSanitizer
  ) {}

  ngOnInit(): void {
    this.subscriptions.add(this.route.paramMap.subscribe(params => {
      this.sessionId = params.get('sessionId')?.trim() ?? '';
      if (!this.sessionId) {
        this.loading = false;
        this.errorMessage = 'Không tìm thấy sessionId.';
        return;
      }
      this.loadSession();
    }));
  }

  ngOnDestroy(): void {
    this.subscriptions.unsubscribe();
    this.revokeObjectUrls();
  }

  loadSession(): void {
    this.loading = true;
    this.errorMessage = '';
    this.resetView();

    const request = this.sessionViewService.getSession(this.sessionId).subscribe({
      next: response => {
        this.session = response;
        const preferredFiles = response.sessionType === 'record'
          ? response.files.filter(file => this.isVideo(file))
          : response.files.filter(file => this.isImage(file));
        this.mediaFiles = preferredFiles.length
          ? preferredFiles
          : response.files.filter(file => this.isImage(file) || this.isVideo(file));
        this.loadMediaFiles(this.mediaFiles);
        this.loadTicket(response.files);
      },
      error: error => {
        this.loading = false;
        this.errorMessage = error?.error?.detail ?? error?.error?.title ??
          error?.error?.message ?? 'Không thể tải dữ liệu phiên.';
      }
    });
    this.subscriptions.add(request);
  }

  selectMedia(file: SessionFileItem): void {
    this.selectedMedia = file;
    this.isPlaying = false;
    this.currentTime = 0;
    this.duration = 0;
  }

  setActiveTab(tab: DevtoolsTab): void { this.activeTab = tab; }
  selectNetwork(item: UnknownRow): void { this.selectedNetwork = item; }

  togglePlay(): void {
    const player = this.video?.nativeElement;
    if (!player) return;
    if (player.paused) void player.play(); else player.pause();
  }

  seekRelative(seconds: number): void {
    const player = this.video?.nativeElement;
    if (!player) return;
    player.currentTime = Math.max(0, Math.min(player.duration || 0, player.currentTime + seconds));
  }

  seek(value: string): void {
    const player = this.video?.nativeElement;
    if (!player || !this.duration) return;
    player.currentTime = (Number(value) / 1000) * this.duration;
  }

  changePlaybackRate(value: string): void {
    const player = this.video?.nativeElement;
    this.playbackRate = Number(value) || 1;
    if (player) player.playbackRate = this.playbackRate;
  }

  updateVideoState(): void {
    const player = this.video?.nativeElement;
    if (!player) return;
    this.fitVideoAspect(player);
    this.currentTime = player.currentTime || 0;
    this.duration = Number.isFinite(player.duration)
      ? player.duration
      : (this.ticket.video?.durationMs ?? 0) / 1000;
    this.isPlaying = !player.paused;
    this.statusMessage = '';
  }

  handleMediaError(kind: 'image' | 'video'): void {
    if (kind === 'video') {
      const error = this.video?.nativeElement.error;
      this.statusMessage = error
        ? `Không thể phát video (MediaError ${error.code}: ${error.message || 'decode/load failed'}).`
        : 'Không thể giải mã hoặc phát file video.';
      return;
    }

    this.statusMessage = 'Không thể tải file ảnh.';
  }

  closeView(): void {
    if (window.history.length > 1) {
      window.history.back();
      return;
    }
    window.close();
  }

  async openFullscreen(): Promise<void> {
    const target = this.video?.nativeElement.parentElement;
    if (target?.requestFullscreen) await target.requestFullscreen();
  }

  startResize(event: PointerEvent): void {
    if (!this.workspace) return;
    this.dragging = true;
    (event.currentTarget as HTMLElement).setPointerCapture(event.pointerId);
    event.preventDefault();
  }

  resize(event: PointerEvent): void {
    if (!this.dragging || !this.workspace) return;
    const element = this.workspace.nativeElement;
    const rect = element.getBoundingClientRect();
    const percent = Math.max(35, Math.min(78, ((event.clientX - rect.left) / rect.width) * 100));
    const leftColumn = element.querySelector<HTMLElement>('.left-column');
    if (leftColumn) {
      leftColumn.style.flex = `0 0 ${percent}%`;
      leftColumn.style.width = `${percent}%`;
    }
  }

  stopResize(): void { this.dragging = false; }

  @HostListener('document:keydown', ['$event'])
  handleKeyboard(event: KeyboardEvent): void {
    const target = event.target as HTMLElement | null;
    if (target instanceof HTMLInputElement || target instanceof HTMLTextAreaElement ||
      target instanceof HTMLSelectElement || target?.isContentEditable ||
      !this.selectedMedia || !this.isVideo(this.selectedMedia)) return;

    if (event.code === 'Space' || event.key.toLowerCase() === 'k') {
      event.preventDefault(); this.togglePlay();
    } else if (event.key === 'ArrowLeft') {
      event.preventDefault(); this.seekRelative(-5);
    } else if (event.key === 'ArrowRight') {
      event.preventDefault(); this.seekRelative(5);
    } else if (event.key.toLowerCase() === 'f') {
      event.preventDefault(); void this.openFullscreen();
    }
  }

  isImage(file: SessionFileItem): boolean {
    return file.contentType?.startsWith('image/') || /\.(png|jpe?g|webp|gif)$/i.test(file.fileName);
  }

  isVideo(file: SessionFileItem): boolean {
    return file.contentType?.startsWith('video/') || /\.(webm|mp4|mov)$/i.test(file.fileName);
  }

  get seekValue(): number {
    return this.duration > 0 ? Math.round((this.currentTime / this.duration) * 1000) : 0;
  }

  get durationSeconds(): number {
    return Math.round(this.duration || (this.ticket.video?.durationMs ?? 0) / 1000);
  }

  formatTime(value: number): string {
    const seconds = Number.isFinite(value) ? Math.max(0, Math.floor(value)) : 0;
    return `${String(Math.floor(seconds / 60)).padStart(2, '0')}:${String(seconds % 60).padStart(2, '0')}`;
  }

  consoleLevel(item: UnknownRow): string {
    const level = String(item['level'] ?? item['type'] ?? 'log').toLowerCase();
    return level === 'error' || level === 'warn' ? level : 'log';
  }

  consoleText(item: UnknownRow): string {
    return this.stringify(
      item['message'] ?? item['text'] ?? item['args'] ?? item['data'] ?? item
    );
  }

  actionText(item: UnknownRow): string {
    return String(
      item['description'] ?? item['text'] ?? item['action'] ?? item['type'] ?? 'Action'
    );
  }

  networkMethod(item: UnknownRow): string {
    return String(
      item['method'] ?? item['request']?.['method'] ?? 'GET'
    ).toUpperCase();
  }

  networkUrl(item: UnknownRow): string {
    return String(
      item['url'] ?? item['request']?.['url'] ?? item['name'] ?? ''
    );
  }

  networkStatus(item: UnknownRow): string {
    return String(
      item['status'] ?? item['statusCode'] ?? item['response']?.['status'] ?? ''
    );
  }

  networkDuration(item: UnknownRow): string {
    const value =
      item['duration'] ?? item['durationMs'] ?? item['timing']?.['duration'];
    return value == null ? '' : `${Math.round(Number(value))} ms`;
  }

  displayTime(item: UnknownRow): string {
    const value = item['timestamp'] ?? item['time'] ?? item['createdAt'];
    if (value == null) return '';
    const date = new Date(value);
    return Number.isNaN(date.getTime()) ? String(value) : date.toLocaleTimeString('vi-VN');
  }

  stringify(value: unknown): string {
    if (typeof value === 'string') return value;
    try { return JSON.stringify(value, null, 2); } catch { return String(value); }
  }

  trackByFileName(_index: number, file: SessionFileItem): string { return file.fileName; }
  trackByIndex(index: number): number { return index; }

  private loadTicket(files: SessionFileItem[]): void {
    const jsonFile = files.find(file =>
      file.contentType === 'application/json' || file.fileName.toLowerCase().endsWith('.json'));

    if (!jsonFile) {
      this.applyTicket({});
      this.finishLoading();
      return;
    }

    const fileUrl = this.sessionViewService.getSessionFileUrl(
      this.sessionId,
      jsonFile
    );

    const request = this.sessionViewService.getJson<TicketPayload>(fileUrl).subscribe({
      next: ticket => { this.applyTicket(ticket ?? {}); this.finishLoading(); },
      error: () => { this.applyTicket({}); this.finishLoading(); }
    });
    this.subscriptions.add(request);
  }

  private loadMediaFiles(files: SessionFileItem[]): void {
    this.revokeObjectUrls();

    if (!files.length) {
      this.selectedMedia = null;
      return;
    }

    const requests = files.map(file => {
      const fileUrl = this.sessionViewService.getSessionFileUrl(
        this.sessionId,
        file
      );

      return this.sessionViewService.getFileBlob(fileUrl).pipe(
        map(blob => {
          if (!blob.size) {
            throw new Error(`File ${file.fileName} rỗng.`);
          }

          const contentType = this.mediaContentType(file, blob.type);
          const normalizedBlob = blob.type === contentType
            ? blob
            : new Blob([blob], { type: contentType });
          const previewUrl = URL.createObjectURL(normalizedBlob);
          this.objectUrls.push(previewUrl);

          return {
            ...file,
            previewUrl,
            safePreviewUrl: this.sanitizer.bypassSecurityTrustUrl(previewUrl)
          };
        }),
        catchError(error => {
          console.warn(`Không thể tải Blob của ${file.fileName}, dùng URL trực tiếp.`, error);
          return of({
            ...file,
            previewUrl: fileUrl,
            safePreviewUrl: this.sanitizer.bypassSecurityTrustUrl(fileUrl)
          });
        })
      );
    });

    const request = forkJoin(requests).subscribe(mediaFiles => {
      this.mediaFiles = mediaFiles;
      this.selectedMedia = mediaFiles[0] ?? null;
    });

    this.subscriptions.add(request);
  }

  private applyTicket(ticket: TicketPayload): void {
    this.ticket = ticket;
    this.consoleLogs = ticket.telemetry?.console?.length ? ticket.telemetry.console : ticket.consoleLogs ?? [];
    this.networkLogs = ticket.telemetry?.network?.length ? ticket.telemetry.network : ticket.networkLogs ?? [];
    this.actions = ticket.telemetry?.actions?.length ? ticket.telemetry.actions : ticket.userEvents ?? [];
    this.selectedNetwork = this.networkLogs[0] ?? null;
  }

  private finishLoading(): void {
    this.loading = false;
    window.setTimeout(() => this.mountDevtools(), 0);
  }

  private mountDevtools(): void {
    const root = this.devtoolsRoot?.nativeElement;
    if (!root) return;

    const nested = this.ticket.telemetry;
    const hasTelemetry = Boolean(
      nested || this.consoleLogs.length || this.networkLogs.length || this.actions.length
    );

    const telemetry: TabTelemetryData | null = hasTelemetry
      ? {
          tabId: Number(nested?.tabId ?? 0),
          openedAt: Number(nested?.openedAt ?? this.ticket.createdAt ?? Date.now()),
          info: nested?.info ?? null,
          console: this.consoleLogs,
          network: this.networkLogs,
          actions: this.actions
        }
      : null;

    mountDevtoolsPanel(root, telemetry);
  }

  private resetView(): void {
    this.revokeObjectUrls();
    this.session = null; this.mediaFiles = []; this.selectedMedia = null; this.ticket = {};
    this.consoleLogs = []; this.networkLogs = []; this.actions = []; this.selectedNetwork = null;
    this.statusMessage = '';
  }

  private mediaContentType(file: SessionFileItem, responseType: string): string {
    if (responseType.startsWith('image/') || responseType.startsWith('video/')) {
      return responseType;
    }
    if (file.contentType.startsWith('image/') || file.contentType.startsWith('video/')) {
      return file.contentType;
    }
    const name = file.fileName.toLowerCase();
    if (name.endsWith('.webm')) return 'video/webm';
    if (name.endsWith('.mp4')) return 'video/mp4';
    if (name.endsWith('.webp')) return 'image/webp';
    if (name.endsWith('.jpg') || name.endsWith('.jpeg')) return 'image/jpeg';
    return 'image/png';
  }

  private fitVideoAspect(player: HTMLVideoElement): void {
    const shell = player.parentElement;
    const width = player.videoWidth;
    const height = player.videoHeight;

    if (!shell || width <= 0 || height <= 0) return;

    shell.style.aspectRatio = `${width} / ${height}`;
    shell.style.height = 'auto';
  }

  private revokeObjectUrls(): void {
    this.objectUrls.splice(0).forEach(url => URL.revokeObjectURL(url));
  }
}
