import { NgModule } from '@angular/core';
import { RouterModule } from '@angular/router';
import { SessionViewComponent } from './session-view.component';

@NgModule({
  imports: [
    RouterModule.forChild([
      {
        path: ':sessionId',
        component: SessionViewComponent
      }
    ])
  ],
  exports: [RouterModule]
})
export class SessionViewRoutingModule {}
