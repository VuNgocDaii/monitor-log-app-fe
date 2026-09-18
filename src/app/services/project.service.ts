import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { BaseService } from './base-service';

export interface ProjectResponse {
    projectId: string;
    projectKey: string;
    projectName: string;
    description: string | null;
    status: 'active' | 'archived';
    createdAt: string;
    createdBy: string | null;
    updatedAt: string | null;
    updatedBy: string | null;
    memberCount: number;
    ticketCount: number;
}

export interface ProjectListResponse {
    items: ProjectResponse[];
    totalCount: number;
    pageNumber: number;
    pageSize: number;
    totalPages: number;
}

export interface ProjectListQuery {
    search?: string;
    status?: 'active' | 'archived';
    pageNumber?: number;
    pageSize?: number;
}

export interface CreateProjectPayload {
    projectKey: string;
    projectName: string;
    description?: string | null;
}

export interface UpdateProjectPayload {
    projectName: string;
    description?: string | null;
}

@Injectable({ providedIn: 'root' })
export class ProjectService extends BaseService {
    override url = '/projects';

    createProject(payload: CreateProjectPayload): Observable<ProjectResponse> {
        return this.post(this.url, payload);
    }

    searchProjectList(payload: ProjectListQuery = {}): Observable<ProjectListResponse> {
        const params: Record<string, string | number> = {
            pageNumber: payload.pageNumber ?? 1,
            pageSize: payload.pageSize ?? 10,
        };
        if (payload.search?.trim()) {
            params['search'] = payload.search.trim();
        }
        if (payload.status) {
            params['status'] = payload.status;
        }
        return this.get(this.url, params);
    }

    getProjectInfoByProjectId(projectId: string): Observable<ProjectResponse> {
        return this.get(`${this.url}/${encodeURIComponent(projectId)}`);
    }

    changeProjectInfoByProjectId(
        projectId: string,
        payload: UpdateProjectPayload
    ): Observable<ProjectResponse> {
        return this.put(`${this.url}/${encodeURIComponent(projectId)}`, payload);
    }

    archiveProject(projectId: string): Observable<ProjectResponse> {
        return this.changeProjectStatus(projectId, 'archive');
    }

    restoreProject(projectId: string): Observable<ProjectResponse> {
        return this.changeProjectStatus(projectId, 'restore');
    }

    private changeProjectStatus(
        projectId: string,
        action: 'archive' | 'restore'
    ): Observable<ProjectResponse> {
        return this.httpClient.patch<ProjectResponse>(
            `${this.baseUrl}${this.url}/${encodeURIComponent(projectId)}/${action}`,
            {},
            { headers: this.createHeaders() }
        );
    }
}
