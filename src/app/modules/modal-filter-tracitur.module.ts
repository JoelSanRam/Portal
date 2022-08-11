import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ModalFiltersComponent } from '@app/component';
import { FormsModule } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { TranslateLoader, TranslateModule } from '@ngx-translate/core';
import { CustomTranslateLoader } from '@app/loader/customTranslate.loader';

@NgModule({
  declarations: [ModalFiltersComponent],
  imports: [
    CommonModule,
    FormsModule,
    TranslateModule.forRoot({
			loader: {
			  provide: TranslateLoader,
			  useClass: CustomTranslateLoader,
			  deps: [HttpClient],
			}
		})
  ],
  exports:[ModalFiltersComponent]
})
export class ModalFilterTraciturModule { }
