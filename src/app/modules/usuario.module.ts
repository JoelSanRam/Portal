import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Routes } from '@angular/router';
import { CambiarImgComponent, ModificarPerfilComponent, UsuarioComponent, UsuarioFormComponent } from '@app/component';
import { NgxSpinnerModule } from "ngx-spinner";
import { UltimasReservasModule } from './ultimas-reservas.module';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { ImageCropperModule } from 'ngx-image-cropper';
import { HttpClient } from '@angular/common/http';
import { TranslateLoader, TranslateModule } from '@ngx-translate/core';
import { CustomTranslateLoader } from '@app/loader/customTranslate.loader';

const routes: Routes = [
  {
    path: '',
    component: UsuarioComponent
  }
];

@NgModule({
  declarations: [
    UsuarioComponent,
    ModificarPerfilComponent,
    CambiarImgComponent,
    UsuarioFormComponent
  ],
  imports: [
    RouterModule.forChild(routes),
    CommonModule,
    NgxSpinnerModule,
    UltimasReservasModule,
    FormsModule,
    ReactiveFormsModule,
    ImageCropperModule,
    TranslateModule.forRoot({
			loader: {
			  provide: TranslateLoader,
			  useClass: CustomTranslateLoader,
			  deps: [HttpClient],
			}
		})
  ],
  entryComponents:[
    ModificarPerfilComponent,
    CambiarImgComponent,
    UsuarioFormComponent
  ]
})
export class UsuarioModule { }
