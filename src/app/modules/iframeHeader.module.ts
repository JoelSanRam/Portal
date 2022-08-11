import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { IframeheaderComponent } from '@app/component';

const routes: Routes = [
  {
    path: '',
    component: IframeheaderComponent
  },
  
];

@NgModule({
  declarations: [
    IframeheaderComponent,
   
  ],
  imports: [
    RouterModule.forChild(routes),
    
  ]
})
export class IframeHeaderModule { }
