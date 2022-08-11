import localeMX from '@angular/common/locales/es-MX';
import { BrowserModule } from '@angular/platform-browser';
import { NgModule, CUSTOM_ELEMENTS_SCHEMA, APP_INITIALIZER, LOCALE_ID} from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { AppRoutingModule } from './app.routing.module';
import { AppComponent } from './app.component';
import { JwtModule } from '@auth0/angular-jwt';
import { HttpClient, HttpClientModule, HTTP_INTERCEPTORS } from '@angular/common/http';
import { registerLocaleData, DatePipe } from '@angular/common';
import { TokeninterceptorService, ValidadoresService, ConfigService,} from './services';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { environment } from '@environments/environment';
import { UiKitComponent, LayoutComponent, HeaderComponent, FooterComponent} from './component/index';
import * as firebase from 'firebase/app';
import 'firebase/database';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { CarouselModule } from 'ngx-owl-carousel-o';

import { LottieModule } from 'ngx-lottie';
import player from 'lottie-web';

import { TranslateLoader, TranslateModule } from '@ngx-translate/core';
// import { TranslateHttpLoader } from '@ngx-translate/http-loader';
import { CustomTranslateLoader } from './loader/customTranslate.loader';

export function playerFactory() {
  return player;
}
// import { InfoHotelUComponent } from './component/hoteles/info-hotel-u/info-hotel-u.component';

export function jwtTokenGetter() {
  return localStorage.getItem('access_token');
}

export function initializeApp(configService: ConfigService) {
  return () => configService.load();
}

/* export function createTranslateLoader(http: HttpClient) {
  return new TranslateHttpLoader(http, './assets/i18n/', '.json?cb=' + new Date().getTime());
} */

registerLocaleData(localeMX, 'es-MX');
firebase.initializeApp(environment.firebase);

@NgModule({
  declarations: [
    AppComponent,
    UiKitComponent,
    LayoutComponent,
    HeaderComponent,
    FooterComponent
  ],
  entryComponents: [],
  imports: [
    BrowserModule,
    AppRoutingModule,
    HttpClientModule,
    FormsModule,
    ReactiveFormsModule,
    FontAwesomeModule,
    JwtModule.forRoot({
      config: {
        tokenGetter: jwtTokenGetter,
      },
    }),
    BrowserAnimationsModule,
    CarouselModule,
    LottieModule.forRoot({ player: playerFactory }),
    TranslateModule.forRoot({
      loader: {
        provide: TranslateLoader,
        useClass: CustomTranslateLoader,
        deps: [HttpClient],
      },
    }),
  ],
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
  providers: [
    DatePipe,
    ValidadoresService,
    {
      provide: HTTP_INTERCEPTORS,
      useClass: TokeninterceptorService,
      multi: true,
    },
    ConfigService,
    {
      provide: APP_INITIALIZER,
      useFactory: initializeApp,
      multi: true,
      deps: [ConfigService],
    },
    {
      provide: LOCALE_ID,
      useValue: 'es-MX'
    }
  ],
  bootstrap: [AppComponent],
})
export class AppModule {}
