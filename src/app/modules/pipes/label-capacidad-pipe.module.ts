import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { labelCapacidadPipe } from '@app/shared/filter-pipe';



@NgModule({
  declarations: [labelCapacidadPipe],
  imports: [
    CommonModule
  ],
  exports:[labelCapacidadPipe]
})
export class LabelCapacidadPipeModule { }
