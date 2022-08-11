import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { CurrencyformatPipe } from '@app/shared/filter-pipe';

@NgModule({
  declarations: [
    CurrencyformatPipe
  ],
  imports: [
    CommonModule
  ],
  exports: [CurrencyformatPipe]
})
export class CurrencyFormatPipeModule { }
