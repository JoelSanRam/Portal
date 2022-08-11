import { CUSTOM_ELEMENTS_SCHEMA, NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Routes } from '@angular/router';
import { AgenciaComponent, CambiarLogoDocsComponent, CambiarLogoHeaderComponent, PermisosUsuarioComponent } from '@app/component';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { NgxSpinnerModule } from 'ngx-spinner';
import { GoogleMapsModule } from '@angular/google-maps';
import { ImageCropperModule } from 'ngx-image-cropper';
import { CambiarPieFlyerComponent } from '@app/component/agencia/cambiar-pie-flyer/cambiar-pie-flyer.component';
import { TranslateLoader, TranslateModule } from '@ngx-translate/core';
import { HttpClient } from '@angular/common/http';
import { CustomTranslateLoader } from '@app/loader/customTranslate.loader';


const routes: Routes = [
  {
    path: '',
    component: AgenciaComponent
  }
];

@NgModule({
  declarations: [
    AgenciaComponent,
    CambiarLogoDocsComponent,
    CambiarLogoHeaderComponent,
    PermisosUsuarioComponent,
    CambiarPieFlyerComponent
  ],
  imports: [
    RouterModule.forChild(routes),
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    NgxSpinnerModule,
    GoogleMapsModule,
    ImageCropperModule,
    TranslateModule.forRoot({
			loader: {
			  provide: TranslateLoader,
			  useClass: CustomTranslateLoader,
			  deps: [HttpClient],
			},
		})
  ],
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
  entryComponents:[
    CambiarLogoHeaderComponent,
    CambiarLogoDocsComponent,
    PermisosUsuarioComponent,
    CambiarPieFlyerComponent
  ]
})
export class AgenciaModule { }
