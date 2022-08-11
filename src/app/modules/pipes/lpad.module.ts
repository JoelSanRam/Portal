import { NgModule } from '@angular/core';
import { lpad } from '@app/shared/filter-pipe';
@NgModule({
  declarations: [
    lpad,
  ],
  imports: [ ],
  exports: [lpad]
})
export class LpadModule { }
