import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Routes } from '@angular/router';
import { PagarReservaComponent, ReservacionesComponent, ReservaDetalleComponent } from '@app/component';
import { BsDatepickerModule } from 'ngx-bootstrap/datepicker';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { NgMultiSelectDropDownModule } from 'ng-multiselect-dropdown';
import { NgxSpinnerModule } from "ngx-spinner";
import { LpadModule } from './pipes/lpad.module';
import { CurrencyFormatPipeModule } from './pipes/currency-format-pipe.module';
import { PagoComponent } from '@app/component/reservaciones/pagar-reserva/pago/pago.component';
import { ModalpagoComponent } from '@app/component/reservaciones/pagar-reserva/pago/modalpago/modalpago.component';
import { TooltipModule } from 'ngx-bootstrap/tooltip';
import { NgbModule } from '@ng-bootstrap/ng-bootstrap';
import { TabsModule } from 'ngx-bootstrap/tabs';
import { PaginationModule } from 'ngx-bootstrap/pagination';
import { TypeaheadModule } from 'ngx-bootstrap/typeahead';
import { HttpClient } from '@angular/common/http';
import { TranslateLoader, TranslateModule } from '@ngx-translate/core';
import { CustomTranslateLoader } from '@app/loader/customTranslate.loader';
import { PagarReservaPayoffComponent } from '@app/component/reservaciones/pagar-reserva-payoff/pagar-reserva-payoff.component';
import { MostarLigaPagoComponent } from '@app/component/reservaciones/mostar-liga-pago/mostar-liga-pago.component';
import { CancelacionComponent } from '../component/reservaciones/cancelacion/cancelacion.component';
import { IfExistLinkModule } from './pipes/if-exist-link.module';

const routes: Routes = [
  {
    path: '',
    component: ReservacionesComponent
  }
];

@NgModule({
  declarations: [
    ReservacionesComponent,
    PagarReservaComponent,
    ReservaDetalleComponent,
    PagoComponent,
    ModalpagoComponent,
    PagarReservaPayoffComponent,
    MostarLigaPagoComponent,
    CancelacionComponent
  ],
  imports: [
    RouterModule.forChild(routes),
    CommonModule,
    FormsModule,
    NgxSpinnerModule,
    ReactiveFormsModule,
    BsDatepickerModule.forRoot(),
    NgMultiSelectDropDownModule.forRoot(),
    LpadModule,
    CurrencyFormatPipeModule,
    TooltipModule.forRoot(),
    TabsModule.forRoot(),
    NgbModule,
    PaginationModule.forRoot(),
    TypeaheadModule.forRoot(),
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
    PagarReservaComponent,
    ReservaDetalleComponent,
    PagoComponent,
    ModalpagoComponent,
    PagarReservaPayoffComponent,
    MostarLigaPagoComponent,
    CancelacionComponent
  ]
})
export class ReservacionesModule { }
