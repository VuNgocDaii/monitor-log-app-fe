import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { NoPermissionComponent } from './no-permission.component';

const routes: Routes = [];

@NgModule({
  imports: [RouterModule.forChild([
    {path: '', component: NoPermissionComponent}
  ])],
  exports: [RouterModule]
})
export class NoPermissionRoutingModule { }
