import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { LinksComponent } from '@app/component/buscador/links/links.component';
import { RouterModule } from '@angular/router';
import { TranslateLoader, TranslateModule } from '@ngx-translate/core';
import { HttpClient } from '@angular/common/http';
import { CustomTranslateLoader } from '@app/loader/customTranslate.loader';
@NgModule({
  declarations: [
    LinksComponent
  ],
  imports: [
    CommonModule,
    RouterModule,
    TranslateModule.forRoot({
			loader: {
			  provide: TranslateLoader,
			  useClass: CustomTranslateLoader,
			  deps: [HttpClient],
			}
		})
  ],
  exports: [LinksComponent]
})
export class LinksModule { }
