import { NgModule } from '@angular/core';
import { RouterModule } from '@angular/router';
import { LoginComponent } from './login.component';
import { ChangeRequiredPasswordComponent } from './change-required-password.component';

@NgModule({
	imports: [RouterModule.forChild([
		{ path: 'change-required-password', component: ChangeRequiredPasswordComponent },
		{ path: '', component: LoginComponent, pathMatch: 'full' }
	])],
	exports: [RouterModule]
})
export class LoginRoutingModule { }
