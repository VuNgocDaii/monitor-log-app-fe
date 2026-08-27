import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { SafeUrl } from '@angular/platform-browser';
import { BaseService } from 'src/app/services/base-service';

export type SessionType = 'capture' | 'record';

export interface SessionFileItem {
  fileName: string;
  contentType: string;
  size: number;
  url: string;
  previewUrl?: string;
  safePreviewUrl?: SafeUrl;
}

export interface SessionFilesResponse {
  sessionId: string;
  sessionType: SessionType;
  files: SessionFileItem[];
}

@Injectable({ providedIn: 'root' })
export class SessionViewService extends BaseService {
  override url = '/files/session';

  getSession(sessionId: string): Observable<SessionFilesResponse> {
    return this.get(
      `${this.url}/${encodeURIComponent(sessionId)}`
    ) as Observable<SessionFilesResponse>;
  }

  getJson<T>(url: string): Observable<T> {
    return this.get(this.normalizeFileUrl(url)) as Observable<T>;
  }

  getFileBlob(url: string): Observable<Blob> {
    return this.get(
      this.normalizeFileUrl(url),
      undefined,
      'blob'
    ) as Observable<Blob>;
  }

  getSessionFileUrl(sessionId: string, file: SessionFileItem): string {
    const returnedUrl = file.url?.trim();

    if (returnedUrl) {
      return this.normalizeFileUrl(returnedUrl);
    }

    return `${this.url}/${encodeURIComponent(sessionId)}/file/${encodeURIComponent(file.fileName)}`;
  }

  private normalizeFileUrl(url: string): string {
    let normalized = url.trim();

    if (/^https?:\/\//i.test(normalized)) {
      normalized = new URL(normalized).pathname;
    }

    if (normalized.startsWith('/api/')) {
      normalized = normalized.substring(4);
    }

    return normalized.startsWith('/') ? normalized : `/${normalized}`;
  }
}
