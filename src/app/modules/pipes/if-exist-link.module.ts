import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ifExistLink } from '@app/shared/filter-pipe';


@NgModule({
  declarations: [ifExistLink],
  imports: [
    CommonModule
  ],
  exports:[ifExistLink]
})
export class IfExistLinkModule { }
