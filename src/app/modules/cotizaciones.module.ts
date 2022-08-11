import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Routes } from '@angular/router';
import { CotizacionComponent, CotizacionesComponent, EnviarCotizacionComponent, FichaTecnicaComponent, GaleriaFotosComponent } from '@app/component';
import { NgxSpinnerModule } from "ngx-spinner";
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { RatingHotelModule } from './pipes/rating-hotel.module';
import { CurrencyFormatPipeModule } from './pipes/currency-format-pipe.module';
import { HttpClient } from '@angular/common/http';
import { TranslateLoader, TranslateModule } from '@ngx-translate/core';
import { CustomTranslateLoader } from '@app/loader/customTranslate.loader';
import { IfExistLinkModule } from './pipes/if-exist-link.module';


const routes: Routes = [
  {
    path: '',
    component: CotizacionesComponent
  },
  { path: 'preview', component: CotizacionComponent }
];

@NgModule({
  declarations: [
    CotizacionesComponent,
    CotizacionComponent,
    FichaTecnicaComponent,
    GaleriaFotosComponent,
    EnviarCotizacionComponent,
  ],
  imports: [
    RouterModule.forChild(routes),
    FormsModule,
    NgxSpinnerModule,
    ReactiveFormsModule,
    CommonModule,
    RatingHotelModule,
    CurrencyFormatPipeModule,
    TranslateModule.forRoot({
			loader: {
			  provide: TranslateLoader,
			  useClass: CustomTranslateLoader,
			  deps: [HttpClient],
			}
		}),
    IfExistLinkModule
  ],
  entryComponents:[
    FichaTecnicaComponent,
    GaleriaFotosComponent,
    EnviarCotizacionComponent,
  ]
})
export class CotizacionesModule { }
