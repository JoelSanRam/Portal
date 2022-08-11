import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { UltimasReservasComponent } from '@app/component';
import { CurrencyFormatPipeModule } from './pipes/currency-format-pipe.module';
import { HttpClient } from '@angular/common/http';
import { TranslateLoader, TranslateModule } from '@ngx-translate/core';
import { CustomTranslateLoader } from '@app/loader/customTranslate.loader';
import { RouterModule } from '@angular/router';

@NgModule({
  declarations: [
    UltimasReservasComponent
  ],
  imports: [
    CommonModule,
    RouterModule,
    CurrencyFormatPipeModule,
    TranslateModule.forRoot({
			loader: {
			  provide: TranslateLoader,
			  useClass: CustomTranslateLoader,
			  deps: [HttpClient],
			}
		})
  ],
  exports: [
    UltimasReservasComponent
  ]
})
export class UltimasReservasModule { }
