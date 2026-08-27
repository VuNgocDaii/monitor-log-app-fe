import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { GenderToTextPipe } from './gender-to-text.pipe';
import { DataTypePipe } from './data-type.pipe';
import { CommonPipe } from './common.pipe';

@NgModule({
  declarations: [
    GenderToTextPipe,
    DataTypePipe,
    CommonPipe
  ],
  imports: [CommonModule],
  exports: [
    GenderToTextPipe,
    DataTypePipe,
    CommonPipe
  ],
  providers: [],
})
export class PipeModule {}
