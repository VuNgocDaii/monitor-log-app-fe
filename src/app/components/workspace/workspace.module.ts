import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ContentComponent } from './content/content.component';
import { SidebarComponent } from './sidebar/sidebar.component';
import { WorkspaceRoutingModule } from './workspace-routing.module';
import { WorkspaceComponent } from './workspace.component';

@NgModule({
  declarations: [
    WorkspaceComponent,
    SidebarComponent,
    ContentComponent,
  ],
  imports: [
    CommonModule,
    FormsModule,
    WorkspaceRoutingModule,
  ],
})
export class WorkspaceModule {}
