import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { BaseService } from './base-service';

export interface ProjectModuleResponse {
  moduleId: string;
  projectId: string;
  moduleCode: string;
  moduleName: string;
  description: string | null;
  isActive: boolean;
  archivedAt: string | null;
  archivedBy: string | null;
  ticketCount: number;
}

export interface ProjectModulePage {
  items: ProjectModuleResponse[];
  totalCount: number;
  pageNumber: number;
  pageSize: number;
  totalPages: number;
}

@Injectable({ providedIn: 'root' })
export class ProjectModuleService extends BaseService {
  override url = '/projects';

  getModules(projectId: string, query: { search?: string; isActive?: boolean; pageNumber?: number; pageSize?: number } = {}): Observable<ProjectModulePage> {
    const params: Record<string, string | number | boolean> = {
      pageNumber: query.pageNumber ?? 1,
      pageSize: query.pageSize ?? 10,
    };
    if (query.search?.trim()) params['search'] = query.search.trim();
    if (query.isActive !== undefined) params['isActive'] = query.isActive;
    return this.get(`${this.url}/${encodeURIComponent(projectId)}/modules`, params);
  }

  createModule(projectId: string, payload: { moduleCode: string; moduleName: string; description?: string | null }): Observable<ProjectModuleResponse> {
    return this.post(`${this.url}/${encodeURIComponent(projectId)}/modules`, payload);
  }

  updateModule(projectId: string, moduleId: string, payload: { moduleName: string; description?: string | null }): Observable<ProjectModuleResponse> {
    return this.put(`${this.url}/${encodeURIComponent(projectId)}/modules/${encodeURIComponent(moduleId)}`, payload);
  }

  changeStatus(projectId: string, moduleId: string, action: 'archive' | 'restore'): Observable<ProjectModuleResponse> {
    return this.httpClient.patch<ProjectModuleResponse>(
      `${this.baseUrl}${this.url}/${encodeURIComponent(projectId)}/modules/${encodeURIComponent(moduleId)}/${action}`,
      {}, { headers: this.createHeaders() }
    );
  }
}
