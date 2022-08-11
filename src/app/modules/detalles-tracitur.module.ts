import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Routes } from '@angular/router';
import { DetailsTraciturComponent, GalleryTraciturComponent } from '@app/component';
import { CalculateTdcPipeModule } from './pipes/calculate-tdc-pipe.module';
import { CurrencyFormatPipeModule } from './pipes/currency-format-pipe.module';
import { GalleryModule, GALLERY_CONFIG } from '@ngx-gallery/core';
import { HttpClient } from '@angular/common/http';
import { TranslateLoader, TranslateModule } from '@ngx-translate/core';
import { CustomTranslateLoader } from '@app/loader/customTranslate.loader';

const routes: Routes = [
  {
    path: '',
    component: DetailsTraciturComponent
  }
];

@NgModule({
  declarations: [
    DetailsTraciturComponent,
    GalleryTraciturComponent
  ],
  imports: [
    RouterModule.forChild(routes),
    CommonModule,
    CalculateTdcPipeModule,
    CurrencyFormatPipeModule,
    GalleryModule,
    TranslateModule.forRoot({
			loader: {
			  provide: TranslateLoader,
			  useClass: CustomTranslateLoader,
			  deps: [HttpClient],
			}
		})
  ],
  entryComponents:[
    GalleryTraciturComponent
  ],
  providers:[
    {
      provide: GALLERY_CONFIG,
      useValue: {
        dots: true,
      },
    },
  ]
})
export class DetallesTraciturModule { }
