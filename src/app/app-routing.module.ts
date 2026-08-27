import { RouterModule } from '@angular/router';
import { NgModule } from '@angular/core';
import { AuthGuard } from './shared/auth-guard.service';
import { Constants, Roles } from './shared/constants/constants';

@NgModule({
    imports: [
        RouterModule.forRoot(
            [
                {
                    path: 'login',
                    canActivate: [],
                    loadChildren: () =>
                        import('./components/login/login.module').then(
                            (m) => m.LoginModule
                        ),
                },
                {
                    path: 'session',
                    loadChildren: () =>
                        import('./components/session-view/session-view.module')
                            .then((m) => m.SessionViewModule),
                },
                {
                    path: '',
                    loadChildren: () =>
                        import('./components/login/login.module').then(
                            (m) => m.LoginModule
                        ),
                },
                {
                    path: '403',
                    loadChildren: () =>
                        import(
                            './components/no-permission/no-permission.module'
                        ).then((m) => m.NoPermissionModule),
                },
                {
                    path: '404',
                    loadChildren: () =>
                        import('./components/not-found/not-found.module').then(
                            (m) => m.NotFoundModule
                        ),
                },
                { path: '**', redirectTo: '404' },
            ],
            {
                scrollPositionRestoration: 'enabled',
                anchorScrolling: 'enabled',
                onSameUrlNavigation: 'reload',
            }
        ),
    ],
    exports: [RouterModule],
})
export class AppRoutingModule {}
