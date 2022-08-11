import { Component, OnInit } from '@angular/core';
import { UserService, AuthenticationService, ConfigService } from '@app/services';
import { JwtHelperService } from '@auth0/angular-jwt';
import { NgxSpinnerService } from "ngx-spinner";
import { TranslateService } from '@ngx-translate/core';
import { User } from '@app/models';
import { NavigationExtras } from "@angular/router";
import { AereosService } from '@app/services/aereos.service';



@Component({
    selector: 'app-home',
    templateUrl: './home.component.html',
    styleUrls: [],
})
export class HomeComponent implements OnInit {
    anuncios = ConfigService.configFile.anuncios;
    today = new Date(Date.now());
    imgruta;
    idOpe;
    idOperador = ConfigService.configFile.idOperador;
    anuncio1;
    anuncio2;
    anuncio3;
    link1;
    link2;
    link3;
    currentUser: User;
    constructor(
        private spinnerService: NgxSpinnerService,
        public userService: UserService,
        public auth: AuthenticationService,
        public jwtHelper: JwtHelperService,
        private translate: TranslateService,
        private authenticationService: AuthenticationService,
        private aereosService: AereosService,
    ) {
        this.imgruta = '../../../assets/img/spinners/general.gif?' + this.today;
        this.auth.getLang().subscribe(res => {
            translate.setDefaultLang(res);
        });
        this.authenticationService.currentUser.subscribe(x => this.currentUser = x);
        this.idOpe = this.currentUser.userData.idOperador;
    }

    ngOnInit() {
        var searchParams = '';
        this.spinnerService.show();
        localStorage.removeItem('params_busqueda');
        localStorage.removeItem('traslado_params');
        localStorage.removeItem('params_tours');
        localStorage.removeItem('params_circuitos');
        localStorage.removeItem('detailsService');
        this.aereosService.setFlightsSearchParams(searchParams); //Setter
        this.spinnerService.hide();
        var operador;
        if (
            this.idOperador == "AZAMID" && this.idOpe == "AZAMID" ||
            this.idOperador == "AZAMID" && this.idOpe == "AZAMTY" ||
            this.idOperador == "AZAMID" && this.idOpe == "AZAMX"
        ) {
            operador = "AZAMID";
            this.link1 = ConfigService.configFile.anuncios[operador].principal;
            this.link2 = ConfigService.configFile.anuncios[operador].izquierda;
            this.link3 = ConfigService.configFile.anuncios[operador].derecha;

            this.anuncio1 = './assets/img/anuncio1_' + operador + '.jpg';
            this.anuncio2 = './assets/img/anuncio2_' + operador + '.jpg';
            this.anuncio3 = './assets/img/anuncio3_' + operador + '.jpg';
        } else if (
            (
                this.idOperador == "AZABR" && this.idOpe == "AZABR"
            ) || this.idOpe == "AZABR" || this.idOpe == "AZALTM" || this.idOpe == "AZACR" || this.idOpe == "AZAPTY"
        ) {
            operador = this.idOpe;
            this.link1 = ConfigService.configFile.anuncios[operador].principal;
            this.link2 = ConfigService.configFile.anuncios[operador].izquierda;
            this.link3 = ConfigService.configFile.anuncios[operador].derecha;

            this.anuncio1 = './assets/img/anuncio1_' + operador + '.jpg';
            this.anuncio2 = './assets/img/anuncio2_' + operador + '.jpg';
            this.anuncio3 = './assets/img/anuncio3_' + operador + '.jpg';
        } else {
            this.link1 = ConfigService.configFile.anuncios.principal;
            this.link2 = ConfigService.configFile.anuncios.izquierda;
            this.link3 = ConfigService.configFile.anuncios.derecha;

            this.anuncio1 = './assets/img/anuncio1.jpg';
            this.anuncio2 = './assets/img/anuncio2.jpg';
            this.anuncio3 = './assets/img/anuncio3.jpg';
        }
    }
}
