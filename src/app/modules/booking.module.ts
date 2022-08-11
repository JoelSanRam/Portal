import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Routes } from '@angular/router';
import { BookingComponent } from '@app/component';
import { CurrencyFormatPipeModule } from './pipes/currency-format-pipe.module';
import { RatingHotelModule } from './pipes/rating-hotel.module';
import { TruncateHtmlPipeModule } from './pipes/truncate-html-pipe.module';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { LabelCapacidadPipeModule } from './pipes/label-capacidad-pipe.module';
import { HttpClient } from '@angular/common/http';
import { TranslateLoader, TranslateModule } from '@ngx-translate/core';
import { CustomTranslateLoader } from '@app/loader/customTranslate.loader';


const routes: Routes = [
  {
    path: '',
    component: BookingComponent
  }
];

@NgModule({
  declarations: [
    BookingComponent
  ],
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
export class BookingModule { }
