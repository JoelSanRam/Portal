import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Routes } from '@angular/router';
import { BuscadoresModule } from './buscadores.module';
import { NgxSpinnerModule } from 'ngx-spinner';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { LinksModule } from './links.module';
import { TrasladosComponent } from '@app/component';
import { GoogleMapsModule } from '@angular/google-maps';
import { TranslateLoader, TranslateModule } from '@ngx-translate/core';
import { CustomTranslateLoader } from '@app/loader/customTranslate.loader';
import { HttpClient } from '@angular/common/http';

const routes: Routes = [
  {
    path: '',
    component: TrasladosComponent
  }
];

@NgModule({
  declarations: [
    TrasladosComponent
  ],
  imports: [
    RouterModule.forChild(routes),
    CommonModule,
    BuscadoresModule,
    NgxSpinnerModule,
    FormsModule,
    ReactiveFormsModule,
    LinksModule,
    GoogleMapsModule,
    TranslateModule.forRoot({
			loader: {
			  provide: TranslateLoader,
			  useClass: CustomTranslateLoader,
			  deps: [HttpClient],
			}
		})
  ]
})
export class TrasladosModule { }
