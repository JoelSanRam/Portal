import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { CurrencyformatSymbolPipe } from '@app/shared/filter-pipe';



@NgModule({
  declarations: [
    CurrencyformatSymbolPipe
  ],
  imports: [
    CommonModule
  ],
  exports: [CurrencyformatSymbolPipe]
})
export class CurrencyFormatSymbolModule { }
