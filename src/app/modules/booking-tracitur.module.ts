import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Routes } from '@angular/router';
import { BookingTraciturComponent } from '@app/component';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { ReplacePipeModule } from './pipes/replace-pipe.module';
import { LabelCapacidadPipeModule } from './pipes/label-capacidad-pipe.module';
import { HttpClient } from '@angular/common/http';
import { TranslateLoader, TranslateModule } from '@ngx-translate/core';
import { CustomTranslateLoader } from '@app/loader/customTranslate.loader';
import { CurrencyFormatPipeModule } from './pipes/currency-format-pipe.module';

const routes: Routes = [
  {
    path: '',
    component: BookingTraciturComponent
  }
];

@NgModule({
  declarations: [
    BookingTraciturComponent,
  ],
  imports: [
    RouterModule.forChild(routes),
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    ReplacePipeModule,
    LabelCapacidadPipeModule,
    TranslateModule.forRoot({
			loader: {
			  provide: TranslateLoader,
			  useClass: CustomTranslateLoader,
			  deps: [HttpClient],
			},
		}),
    CurrencyFormatPipeModule
  ]
})
export class BookingTraciturModule { }
