import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Routes } from '@angular/router';
import { CrearIframeComponent, IframeComponent, PreviewResultsComponent, PreviewSearchComponent } from '@app/component';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { RatingHotelModule } from './pipes/rating-hotel.module';
import { CurrencyFormatPipeModule } from './pipes/currency-format-pipe.module';
import { HttpClient } from '@angular/common/http';
import { TranslateLoader, TranslateModule } from '@ngx-translate/core';
import { CustomTranslateLoader } from '@app/loader/customTranslate.loader';

const routes: Routes = [
  {
    path: '',
    component: IframeComponent
  },
  { path: 'crear', component: CrearIframeComponent },
  { path: ':id', component: CrearIframeComponent}
];

@NgModule({
  declarations: [
    IframeComponent,
    CrearIframeComponent,
    PreviewSearchComponent,
    PreviewResultsComponent
  ],
  imports: [
    RouterModule.forChild(routes),
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    RatingHotelModule,
    CurrencyFormatPipeModule,
    TranslateModule.forRoot({
			loader: {
			  provide: TranslateLoader,
			  useClass: CustomTranslateLoader,
			  deps: [HttpClient],
			}
		})
  ]
})
export class IframeModule { }
