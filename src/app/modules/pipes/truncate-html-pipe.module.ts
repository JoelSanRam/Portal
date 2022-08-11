import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { truncateHtml } from '@app/shared/filter-pipe';

@NgModule({
  declarations: [
    truncateHtml
  ],
  imports: [
    CommonModule
  ],
  exports: [truncateHtml]
})
export class TruncateHtmlPipeModule { }
