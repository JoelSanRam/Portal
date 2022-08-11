import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SafeUrlPipe, safeHtmlPipe } from '@app/shared/filter-pipe';

@NgModule({
  declarations: [SafeUrlPipe, safeHtmlPipe],
  imports: [
    CommonModule
  ],exports:[
    SafeUrlPipe,
    safeHtmlPipe
  ]
})
export class SafeUrlPipeModule { }
