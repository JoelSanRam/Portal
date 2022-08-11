import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Routes } from '@angular/router';
import { FirstFlyersComponent, HomeComponent, UltimoMicroblogComponent } from '@app/component';
import { BuscadoresModule } from './buscadores.module';
import { NgxSpinnerModule } from "ngx-spinner";
import { TruncateHtmlPipeModule } from './pipes/truncate-html-pipe.module';
import { UltimasReservasModule } from './ultimas-reservas.module';
import { HttpClient } from '@angular/common/http';
import { TranslateLoader, TranslateModule } from '@ngx-translate/core';
import { CustomTranslateLoader } from '@app/loader/customTranslate.loader';
import { IfExistLinkModule } from './pipes/if-exist-link.module';

const routes: Routes = [
  {
    path: '',
    component: HomeComponent
  }
];

@NgModule({
  declarations: [
    HomeComponent,
    UltimoMicroblogComponent,
    FirstFlyersComponent
  ],
  imports: [
    RouterModule.forChild(routes),
    CommonModule,
    NgxSpinnerModule,
    BuscadoresModule,
    TruncateHtmlPipeModule,
    UltimasReservasModule,
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
export class HomeModule { }
