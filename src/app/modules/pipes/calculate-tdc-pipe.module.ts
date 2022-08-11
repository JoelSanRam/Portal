import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { CalculateTCDPipe } from '@app/shared/filter-pipe';



@NgModule({
  declarations: [CalculateTCDPipe],
  imports: [
    CommonModule
  ],
  exports:[CalculateTCDPipe]
})
export class CalculateTdcPipeModule { }
