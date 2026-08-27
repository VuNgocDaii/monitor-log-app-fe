import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MTableComponent } from './m-table/m-table.component';
import { TableModule } from 'primeng/table';
import { ButtonModule } from 'primeng/button';




@NgModule({
  declarations: [
    MTableComponent,
  ],
  imports: [
    CommonModule,
    ButtonModule,
    TableModule,

  ],
  exports: [
    MTableComponent
  ]
})
export class MTableModule { }
