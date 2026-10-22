import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { BaseService } from './base-service';

export type TicketStatusType = 'dev' | 'test';

export interface TicketStatusResponse {
  statusId: string;
  projectId: string;
  statusType: TicketStatusType;
  statusCode: string;
  statusName: string;
  color: string | null;
  displayOrder: number;
  isDefault: boolean;
  isClosed: boolean;
  isActive: boolean;
  ticketCount: number;
}

export interface TicketStatusPage {
  items: TicketStatusResponse[];
  totalCount: number;
  pageNumber: number;
  pageSize: number;
  totalPages: number;
}

@Injectable({ providedIn: 'root' })
export class TicketStatusService extends BaseService {
  override url = '/projects';

  getStatuses(projectId: string, query: { type?: TicketStatusType; search?: string; isActive?: boolean; pageNumber?: number; pageSize?: number } = {}): Observable<TicketStatusPage> {
    const params: Record<string, string | number | boolean> = {
      pageNumber: query.pageNumber ?? 1,
      pageSize: query.pageSize ?? 20,
    };
    if (query.type) params['type'] = query.type;
    if (query.search?.trim()) params['search'] = query.search.trim();
    if (query.isActive !== undefined) params['isActive'] = query.isActive;
    return this.get(`${this.url}/${encodeURIComponent(projectId)}/ticket-statuses`, params);
  }

  createStatus(projectId: string, payload: {
    statusType: TicketStatusType;
    statusCode: string;
    statusName: string;
    color: string | null;
    displayOrder: number;
    isDefault: boolean;
    isClosed: boolean;
  }): Observable<TicketStatusResponse> {
    return this.post(`${this.url}/${encodeURIComponent(projectId)}/ticket-statuses`, payload);
  }

  updateStatus(projectId: string, statusId: string, payload: Pick<TicketStatusResponse, 'statusName' | 'color' | 'displayOrder' | 'isDefault' | 'isClosed'>): Observable<TicketStatusResponse> {
    return this.put(`${this.url}/${encodeURIComponent(projectId)}/ticket-statuses/${encodeURIComponent(statusId)}`, payload);
  }

  changeStatus(projectId: string, statusId: string, action: 'archive' | 'restore'): Observable<TicketStatusResponse> {
    return this.httpClient.patch<TicketStatusResponse>(
      `${this.baseUrl}${this.url}/${encodeURIComponent(projectId)}/ticket-statuses/${encodeURIComponent(statusId)}/${action}`,
      {}, { headers: this.createHeaders() }
    );
  }
}
