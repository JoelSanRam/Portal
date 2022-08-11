import { AuthGuard } from './guard/auth.guard';
import { NgModule, Component } from '@angular/core';
import { Routes, RouterModule, PreloadAllModules } from '@angular/router';
import { LayoutComponent } from './component';
const routes: Routes = [
  {
    path: '',
    component: LayoutComponent,
    canActivate: [AuthGuard],
    children: [
      { path: 'hoteles', loadChildren: () => import('./modules/hoteles.module').then(m => m.HotelesModule) },
      { path: 'circuitos', loadChildren: () => import('./modules/circuitos.module').then(m => m.CircuitosModule) },
      { path: 'tours', loadChildren: () => import('./modules/tours.module').then(m => m.ToursModule) },
      { path: ':service/detalles/:path', loadChildren: () => import('./modules/detalles-tracitur.module').then(m => m.DetallesTraciturModule) },
      { path: 'booking/:service', loadChildren: () => import('./modules/booking-tracitur.module').then(m => m.BookingTraciturModule) },
      { path: 'traslados', loadChildren: () => import('./modules/traslados.module').then(m => m.TrasladosModule) },
      { path: 'booking-traslado', loadChildren: () => import('./modules/booking-traslado.module').then(m => m.BookingTrasladoModule) },
      { path: 'booking', loadChildren: () => import('./modules/booking.module').then(m => m.BookingModule) },
      { path: 'booking-dingus', loadChildren: () => import('./modules/booking-dingus.module').then(m => m.BookingDingusModule) },
      { path: 'booking-u', loadChildren: () => import('./modules/booking-unificado.module').then(m => m.BookingUnificadoModule) },
      { path: 'home', loadChildren: () => import('./modules/home.module').then(m => m.HomeModule) },
      { path: 'cotizaciones', loadChildren: () => import('./modules/cotizaciones.module').then(m => m.CotizacionesModule) },
      { path: 'grupos', loadChildren: () => import('./modules/grupos.module').then(m => m.GruposModule) },
      { path: 'flyers', loadChildren: () => import('./modules/flayers.module').then(m => m.FlayersModule) },
      { path: 'reservaciones', loadChildren: () => import('./modules/reservaciones.module').then(m => m.ReservacionesModule) },
      { path: 'usuario', loadChildren: () => import('./modules/usuario.module').then(m => m.UsuarioModule) },
      { path: 'agencia', loadChildren: () => import('./modules/agencia.module').then(m => m.AgenciaModule) },
      { path: 'iframe', loadChildren: () => import('./modules/iframe.module').then(m => m.IframeModule) },
      { path: 'microblog', loadChildren: () => import('./modules/microblog.module').then(m => m.MicroblogModule)},
      { path: 'vuelos', loadChildren: () => import('./modules/aereos.module').then(m => m.AereosModule)},
      { path: 'checkout', loadChildren: () => import('./modules/checkout.module').then(m => m.CheckoutModule)},
      { path: 'confirm', loadChildren: () => import('./modules/confirm.module').then(m => m.ConfirmModule)},
      { path: 'error', loadChildren: () => import('./modules/errors-msj.module').then(m => m.ErrorsMsjModule)},
      // { path: 'ticket', loadChildren: () => import('./modules/iframeHeader.module').then(m => m.IframeHeaderModule)},
      { path: '', redirectTo: '/home', pathMatch: 'full' },
    ],
  },
  { path: 'signup', loadChildren: () => import('./modules/signup.module').then(m => m.SignupModule) },
  { path: 'forgot', loadChildren: () => import('./modules/forgot.module').then(m => m.ForgotModule) },
  { path: 'login', loadChildren: () => import('./modules/login.module').then(m => m.LoginModule) },
  { path: '**', redirectTo: '/login' },
];
@NgModule({
  imports: [
    RouterModule.forRoot(routes, { scrollPositionRestoration: 'enabled', preloadingStrategy: PreloadAllModules, relativeLinkResolution: 'legacy' }),
  ],
  exports: [RouterModule],
})
export class AppRoutingModule {}
