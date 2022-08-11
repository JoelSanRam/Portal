import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { CategoriaPipe } from '@app/shared/filter-pipe';



@NgModule({
  declarations: [CategoriaPipe],
  imports: [
    CommonModule
  ],
  exports:[CategoriaPipe]
})
export class CategoriaPipeModule { }
