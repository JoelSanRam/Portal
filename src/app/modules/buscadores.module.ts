import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { BuscadorCircuitoComponent, BuscadorComponent, BuscadorHotelComponent, BuscadorTourComponent, BuscadorTrasladoComponent, BuscadorAereoComponent } from '@app/component';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { TypeaheadModule } from 'ngx-bootstrap/typeahead';
import { BsDatepickerModule } from 'ngx-bootstrap/datepicker';
import { LpadModule } from './pipes/lpad.module';
import { GooglePlaceModule } from 'ngx-google-places-autocomplete';
import { RangePipeModule } from './pipes/range-pipe.module';
import { TooltipModule } from 'ngx-bootstrap/tooltip';
import { TranslateLoader, TranslateModule } from '@ngx-translate/core';
import { HttpClient } from '@angular/common/http';
import { CustomTranslateLoader } from '@app/loader/customTranslate.loader';
import { NgMultiSelectDropDownModule } from 'ng-multiselect-dropdown';

@NgModule({
    declarations: [
        BuscadorComponent,
        BuscadorHotelComponent,
        BuscadorCircuitoComponent,
        BuscadorTourComponent,
        BuscadorTrasladoComponent,
        BuscadorAereoComponent,
    ],
    imports: [
        CommonModule,
        FormsModule,
        ReactiveFormsModule,
        TypeaheadModule.forRoot(),
        BsDatepickerModule.forRoot(),
        LpadModule,
        GooglePlaceModule,
        RangePipeModule,
        TooltipModule.forRoot(),
        NgMultiSelectDropDownModule.forRoot(),
        TranslateModule.forRoot({
			loader: {
			  provide: TranslateLoader,
			  useClass: CustomTranslateLoader,
			  deps: [HttpClient],
			},
		})
    ],
    exports: [
        BuscadorComponent,
        BuscadorHotelComponent,
        BuscadorCircuitoComponent,
        BuscadorTourComponent,
        BuscadorTrasladoComponent,
        BuscadorAereoComponent,
    ],
})
export class BuscadoresModule {}
