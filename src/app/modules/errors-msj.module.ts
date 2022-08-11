import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Routes } from '@angular/router';
import { ErrorsMsjComponent } from "@app/component/aereos/errors-msj/errors-msj.component";
import { TooltipModule } from 'ngx-bootstrap/tooltip';
import { NgxSpinnerModule } from 'ngx-spinner';

const routes: Routes = [
  {
    path: '',
    component: ErrorsMsjComponent,
  }
];

@NgModule({
	declarations: [ErrorsMsjComponent],
	imports: [
		RouterModule.forChild(routes),
		CommonModule,
		TooltipModule.forRoot(),
		NgxSpinnerModule,
	],
})
export class ErrorsMsjModule {}
