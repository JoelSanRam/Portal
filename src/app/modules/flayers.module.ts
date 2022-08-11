import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Routes } from '@angular/router';
import { FlyersComponent } from '@app/component';
import { NgxSpinnerModule } from "ngx-spinner";
import { HttpClient } from '@angular/common/http';
import { TranslateLoader, TranslateModule } from '@ngx-translate/core';
import { CustomTranslateLoader } from '@app/loader/customTranslate.loader';
import { IfExistLinkModule } from './pipes/if-exist-link.module';

const routes: Routes = [
  {
    path: '',
    component: FlyersComponent
  }
];

@NgModule({
  declarations: [
    FlyersComponent
  ],
  imports: [
    RouterModule.forChild(routes),
    CommonModule,
    NgxSpinnerModule,
    TranslateModule.forRoot({
			loader: {
			  provide: TranslateLoader,
			  useClass: CustomTranslateLoader,
			  deps: [HttpClient],
			}
		}),
    IfExistLinkModule
  ]
})
export class FlayersModule { }
