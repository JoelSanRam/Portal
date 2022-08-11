import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Routes } from '@angular/router';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { ModalFiltersComponent, ToursComponent } from '@app/component';
import { NgxSpinnerModule } from 'ngx-spinner';
import { BuscadoresModule } from './buscadores.module';
import { LinksModule } from './links.module';
import { CalculateTdcPipeModule } from './pipes/calculate-tdc-pipe.module';
import { CategoriaPipeModule } from './pipes/categoria-pipe.module';
import { CurrencyFormatPipeModule } from './pipes/currency-format-pipe.module';
import { ModalFilterTraciturModule } from './modal-filter-tracitur.module';
import { HttpClient } from '@angular/common/http';
import { TranslateLoader, TranslateModule } from '@ngx-translate/core';
import { CustomTranslateLoader } from '@app/loader/customTranslate.loader';

const routes: Routes = [
  {
    path: '',
    component: ToursComponent
  }
];

@NgModule({
  declarations: [
    ToursComponent,
    // ModalFiltersComponent
  ],
  imports: [
    RouterModule.forChild(routes),
    CommonModule,
    BuscadoresModule,
    NgxSpinnerModule,
    FormsModule,
    ReactiveFormsModule,
    LinksModule,
    CalculateTdcPipeModule,
    CategoriaPipeModule,
    CurrencyFormatPipeModule,
    ModalFilterTraciturModule,
    TranslateModule.forRoot({
			loader: {
			  provide: TranslateLoader,
			  useClass: CustomTranslateLoader,
			  deps: [HttpClient],
			}
		})
  ],
  entryComponents:[
    ModalFilterTraciturModule
  ]
})
export class ToursModule { }
