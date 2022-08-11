import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Routes } from '@angular/router';
import { CheckoutComponent } from '@app/component';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { FormatTimePipeModule } from './pipes/format-time-pipe.module';
import { NgxSpinnerModule } from "ngx-spinner";
import { BsDatepickerModule } from "ngx-bootstrap/datepicker";
import { CurrencyFormatPipeModule } from './pipes/currency-format-pipe.module';
import { PolicyComponent } from '@app/component/aereos/checkout/policy/policy.component';
import { CookieService } from 'ngx-cookie-service';
import { TooltipModule } from 'ngx-bootstrap/tooltip';
import { SafeUrlPipeModule } from './pipes/safe-url-pipe.module';
import { CurrencyFormatSymbolModule } from './pipes/currency-format-symbol.module';
import { TranslateLoader, TranslateModule } from '@ngx-translate/core';
import { HttpClient } from '@angular/common/http';
import { CustomTranslateLoader } from '@app/loader/customTranslate.loader';
import { ConfirmCotizarComponent } from '@app/component/aereos/confirm-cotizar/confirm-cotizar.component';
import { PagarReservationComponent } from '@app/component/create-reservation/pagar-reservation/pagar-reservation/pagar-reservation.component';
import { CobrarCreditoComponent } from '@app/component/create-reservation/cobrar-credito/cobrar-credito/cobrar-credito.component';

const routes: Routes = [
  {
    path: '',
    component: CheckoutComponent
  },
  {
    path: 'confirm',
    component: ConfirmCotizarComponent
  },
];

@NgModule({
	declarations: [CheckoutComponent, PolicyComponent, ConfirmCotizarComponent,  PagarReservationComponent,
        CobrarCreditoComponent],
	imports: [
		RouterModule.forChild(routes),
		CommonModule,
		FormsModule,
		ReactiveFormsModule,
		FormatTimePipeModule,
    	NgxSpinnerModule,
		BsDatepickerModule.forRoot(),
		CurrencyFormatPipeModule,
		TooltipModule.forRoot(),
		SafeUrlPipeModule,
		CurrencyFormatSymbolModule,
		TranslateModule.forRoot({
			loader: {
			  provide: TranslateLoader,
			  useClass: CustomTranslateLoader,
			  deps: [HttpClient],
			}
		})
	],
	entryComponents:[PolicyComponent,  PagarReservationComponent,
        CobrarCreditoComponent],
	providers: [CookieService]
})
export class CheckoutModule {}
