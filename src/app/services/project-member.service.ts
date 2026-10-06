import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { BaseService } from './base-service';

export interface ProjectMemberRoleResponse {
  roleId: string;
  roleCode: string;
  roleName: string;
  isSystem: boolean;
}

export interface ProjectMemberResponse {
  projectId: string;
  userId: string;
  username: string;
  fullName: string | null;
  email: string | null;
  isActive: boolean;
  joinedAt: string;
  joinedBy: string | null;
  roles: ProjectMemberRoleResponse[];
}

export interface ProjectMemberCandidateResponse {
  userId: string;
  username: string;
  fullName: string | null;
  email: string | null;
}

export interface PagedResponse<T> {
  items: T[];
  totalCount: number;
  pageNumber: number;
  pageSize: number;
  totalPages: number;
}

export interface ProjectMemberQuery {
  search?: string;
  pageNumber?: number;
  pageSize?: number;
}

@Injectable({ providedIn: 'root' })
export class ProjectMemberService extends BaseService {
  override url = '/projects';

  getMembers(
    projectId: string,
    query: ProjectMemberQuery = {}
  ): Observable<PagedResponse<ProjectMemberResponse>> {
    return this.get(
      `${this.url}/${encodeURIComponent(projectId)}/members`,
      this.buildParams(query)
    );
  }

  getMemberCandidates(
    projectId: string,
    query: ProjectMemberQuery = {}
  ): Observable<PagedResponse<ProjectMemberCandidateResponse>> {
    return this.get(
      `${this.url}/${encodeURIComponent(projectId)}/member-candidates`,
      this.buildParams(query)
    );
  }

  addMember(projectId: string, userId: string): Observable<ProjectMemberResponse> {
    return this.post(
      `${this.url}/${encodeURIComponent(projectId)}/members`,
      { userId }
    );
  }

  removeMember(projectId: string, userId: string): Observable<void> {
    return this.httpClient.delete(
      `${this.baseUrl}${this.url}/${encodeURIComponent(projectId)}/members/${encodeURIComponent(userId)}`,
      {
        headers: this.createHeaders(),
        responseType: 'text',
      }
    ).pipe(map(() => void 0));
  }

  private buildParams(query: ProjectMemberQuery): Record<string, string | number> {
    const params: Record<string, string | number> = {
      pageNumber: query.pageNumber ?? 1,
      pageSize: query.pageSize ?? 10,
    };

    const search = query.search?.trim();
    if (search) {
      params['search'] = search;
    }

    return params;
  }
}
