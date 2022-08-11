import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Routes } from '@angular/router';
import { UnificadoComponent } from '@app/component';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { CurrencyFormatPipeModule } from './pipes/currency-format-pipe.module';
import { RatingHotelModule } from './pipes/rating-hotel.module';
import { TruncateHtmlPipeModule } from './pipes/truncate-html-pipe.module';
import { LabelCapacidadPipeModule } from './pipes/label-capacidad-pipe.module';
import { HttpClient } from '@angular/common/http';
import { TranslateLoader, TranslateModule } from '@ngx-translate/core';
import { CustomTranslateLoader } from '@app/loader/customTranslate.loader';


const routes: Routes = [
  {
    path: '',
    component: UnificadoComponent
  }
];

@NgModule({
  declarations: [UnificadoComponent],
  imports: [
    RouterModule.forChild(routes),
    CommonModule,
    RatingHotelModule,
    CurrencyFormatPipeModule,
    TruncateHtmlPipeModule,
    FormsModule,
    ReactiveFormsModule,
    LabelCapacidadPipeModule,
    TranslateModule.forRoot({
			loader: {
			  provide: TranslateLoader,
			  useClass: CustomTranslateLoader,
			  deps: [HttpClient],
			},
		})
  ]
})
export class BookingUnificadoModule { }
