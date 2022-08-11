import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Routes } from '@angular/router';
import { CircuitosComponent, ModalFiltersComponent } from '@app/component';
import { BuscadoresModule } from './buscadores.module';
import { NgxSpinnerModule } from 'ngx-spinner';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { LinksModule } from './links.module';
import { LabelCapacidadPipeModule } from './pipes/label-capacidad-pipe.module';
import { CalculateTdcPipeModule } from './pipes/calculate-tdc-pipe.module';
import { CategoriaPipeModule } from './pipes/categoria-pipe.module';
import { ModalFilterTraciturModule } from './modal-filter-tracitur.module';
import { ReplacePipeModule } from './pipes/replace-pipe.module';
import { CurrencyFormatPipeModule } from './pipes/currency-format-pipe.module';
import { HttpClient } from '@angular/common/http';
import { TranslateLoader, TranslateModule } from '@ngx-translate/core';
import { CustomTranslateLoader } from '@app/loader/customTranslate.loader';


const routes: Routes = [
  {
    path: '',
    component: CircuitosComponent
  }
];

@NgModule({
    declarations: [CircuitosComponent],
    imports: [
        RouterModule.forChild(routes),
        CommonModule,
        BuscadoresModule,
        NgxSpinnerModule,
        FormsModule,
        ReactiveFormsModule,
        LinksModule,
        LabelCapacidadPipeModule,
        CalculateTdcPipeModule,
        CategoriaPipeModule,
        ModalFilterTraciturModule,
        ReplacePipeModule,
        CurrencyFormatPipeModule,
        TranslateModule.forRoot({
          loader: {
            provide: TranslateLoader,
            useClass: CustomTranslateLoader,
            deps: [HttpClient],
          }
        })
    ],
    entryComponents: [ModalFilterTraciturModule],
})
export class CircuitosModule {}
