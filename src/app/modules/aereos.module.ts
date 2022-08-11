import { CUSTOM_ELEMENTS_SCHEMA, NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Routes } from '@angular/router';
import { AereosComponent, PlanTarifarioComponent, FiltrosAereosComponent } from "@app/component";
// import { MatSliderModule } from '@angular/material/slider';
import { TooltipModule } from 'ngx-bootstrap/tooltip';
import { NgxSpinnerModule } from 'ngx-spinner';
import { BuscadoresModule } from './buscadores.module';
import { LinksModule } from './links.module';
import { CurrencyFormatPipeModule } from "./pipes/currency-format-pipe.module";
import { CarouselModule } from 'ngx-owl-carousel-o';
import { FormatTimePipeModule } from './pipes/format-time-pipe.module';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { PaginationModule } from 'ngx-bootstrap/pagination';
import { CurrencyFormatSymbolModule } from './pipes/currency-format-symbol.module';
import { TranslateLoader, TranslateModule } from '@ngx-translate/core';
import { HttpClient } from '@angular/common/http';

import { CustomTranslateLoader } from '@app/loader/customTranslate.loader';

const routes: Routes = [
  {
    path: '',
    component: AereosComponent
  }
];

@NgModule({
	declarations: [AereosComponent, PlanTarifarioComponent, FiltrosAereosComponent],
	imports: [
		RouterModule.forChild(routes),
		CommonModule,
		// MatSliderModule,
		TooltipModule.forRoot(),
		NgxSpinnerModule,
		BuscadoresModule,
		LinksModule,
		CurrencyFormatPipeModule,
		CarouselModule,
		FormatTimePipeModule,
		FormsModule,
		ReactiveFormsModule,
		CurrencyFormatSymbolModule,
		PaginationModule.forRoot(),
		TranslateModule.forRoot({
			loader: {
			  provide: TranslateLoader,
			  useClass: CustomTranslateLoader,
			  deps: [HttpClient],
			},
		}),
	],
	entryComponents: [PlanTarifarioComponent],
})
export class AereosModule {}
