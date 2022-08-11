import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Routes } from '@angular/router';
import { DetalleComponent, MicroblogComponent } from '@app/component';
import { TruncateHtmlPipeModule } from './pipes/truncate-html-pipe.module';
import { HttpClient } from '@angular/common/http';
import { TranslateLoader, TranslateModule } from '@ngx-translate/core';
import { CustomTranslateLoader } from '@app/loader/customTranslate.loader';

const routes: Routes = [
  {
    path: '',
    component: MicroblogComponent
  },
  { path: ':id', component: DetalleComponent}
];

@NgModule({
  declarations: [
    MicroblogComponent,
    DetalleComponent
  ],
  imports: [
    RouterModule.forChild(routes),
    CommonModule,
    TruncateHtmlPipeModule,
    TranslateModule.forRoot({
			loader: {
			  provide: TranslateLoader,
			  useClass: CustomTranslateLoader,
			  deps: [HttpClient],
			}
		})
  ]
})
export class MicroblogModule { }
