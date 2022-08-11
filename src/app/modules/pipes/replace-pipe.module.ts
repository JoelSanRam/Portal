import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReplacePipe } from '@app/shared/filter-pipe';



@NgModule({
  declarations: [ReplacePipe],
  imports: [
    CommonModule
  ],
  exports:[
    ReplacePipe
  ]
})
export class ReplacePipeModule { }
