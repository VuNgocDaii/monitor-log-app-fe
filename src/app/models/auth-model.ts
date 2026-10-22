export interface IAuthModel {
    id?: string;
    username?: string;
    avatar?: string;
    menus?: any[];
    role?: string;
    roles?: string[];
    permissions?: string[];
    fullName?: string | null;
    fullname?: string;
    email?: string;
    isProvider?: boolean;
    providerId?: number;
    token?: string;
    isLock?: boolean;
}

export interface AuthTokenResponse {
    tokenType: string;
    accessToken: string | null;
    expiresIn: number;
    refreshToken: string | null;
    userId: string;
    username: string;
    fullName: string | null;
    roles: string[];
    permissions: string[];
    mustChangePassword: boolean;
    passwordExpiresAt: string | null;
}
export const INIT_AUTH_MODEL: IAuthModel = {
    id: '',
    username: '',
    avatar: '',
    menus: [],
    role: '',
    roles: [],
    permissions: [],
    fullName: '',
    fullname: '',
    email: '',
    isProvider: false,
    providerId: 0,
    token:'',
    isLock: false
};
