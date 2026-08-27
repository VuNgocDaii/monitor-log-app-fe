export interface IAuthModel {
    id?: number;
    username?: string;
    avatar?: string;
    menus?: any[];
    role?: '';
    fullname?: string;
    email?: string;
    isProvider?: boolean;
    providerId?: number;
    token?:string;
    isLock?:boolean;
}
export const INIT_AUTH_MODEL: IAuthModel = {
    id: 1,
    username: '',
    avatar: '',
    menus: [],
    role: '',
    fullname: '',
    email: '',
    isProvider: false,
    providerId: 0,
    token:'',
    isLock: false
};
