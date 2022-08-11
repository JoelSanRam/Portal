import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Routes } from '@angular/router';
import { FiltrosComponent, HotelesComponent, InfoHotelComponent, InfoHotelUComponent, PoliticasComponent } from '@app/component';
import { BuscadoresModule } from './buscadores.module';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { NgxSpinnerModule } from 'ngx-spinner';
import { RatingHotelModule } from './pipes/rating-hotel.module';
import { CurrencyFormatPipeModule } from './pipes/currency-format-pipe.module';
import { TruncateHtmlPipeModule } from './pipes/truncate-html-pipe.module';
import { GalleryModule, GALLERY_CONFIG, GalleryComponent } from '@ngx-gallery/core';
import { LinksModule } from './links.module';
import { GoogleMapsModule } from '@angular/google-maps';
import { ReadMoreLessComponent } from '@app/component/hoteles/read-more-less/read-more-less.component';
import { PopoverModule } from 'ngx-bootstrap/popover';
import { PaginationModule } from 'ngx-bootstrap/pagination';
import { NgbModule } from '@ng-bootstrap/ng-bootstrap';
import { HttpClient } from '@angular/common/http';
import { TranslateLoader, TranslateModule } from '@ngx-translate/core';
import { CustomTranslateLoader } from '@app/loader/customTranslate.loader';

const routes: Routes = [
  {
    path: '',
    component: HotelesComponent
  }
];

@NgModule({
  declarations: [
    HotelesComponent,
    InfoHotelComponent,
    ReadMoreLessComponent,
    PoliticasComponent,
    FiltrosComponent,
    InfoHotelUComponent
  ],
  entryComponents: [
    InfoHotelComponent,
    PoliticasComponent,
    FiltrosComponent,
    InfoHotelUComponent
  ],
  imports: [
    RouterModule.forChild(routes),
    CommonModule,
    BuscadoresModule,
    FormsModule,
    ReactiveFormsModule,
    NgxSpinnerModule,
    RatingHotelModule,
    CurrencyFormatPipeModule,
    TruncateHtmlPipeModule,
    GalleryModule,
    LinksModule,
    GoogleMapsModule,
    PopoverModule.forRoot(),
    PaginationModule.forRoot(),
    NgbModule,
    TranslateModule.forRoot({
			loader: {
			  provide: TranslateLoader,
			  useClass: CustomTranslateLoader,
			  deps: [HttpClient],
			}
		})
  ],
  providers:[
    {
      provide: GALLERY_CONFIG,
      useValue: {
        dots: true,
      },
    }
  ]
})
export class HotelesModule { }
