import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Routes } from '@angular/router';
import { ConfirmComponent } from '@app/component';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { FormatTimePipeModule } from './pipes/format-time-pipe.module';
import { TranslateLoader, TranslateModule } from '@ngx-translate/core';
import { HttpClient } from '@angular/common/http';
import { CustomTranslateLoader } from '@app/loader/customTranslate.loader';


const routes: Routes = [
  {
    path: '',
    component: ConfirmComponent
  }
];

@NgModule({
    declarations: [ConfirmComponent],
    imports: [
        RouterModule.forChild(routes),
        CommonModule,
        FormsModule,
        ReactiveFormsModule,
        FormatTimePipeModule,
        TranslateModule.forRoot({
          loader: {
            provide: TranslateLoader,
            useClass: CustomTranslateLoader,
            deps: [HttpClient],
          }
        })
    ],
})
export class ConfirmModule {}
