import { DOCUMENT } from '@angular/common';
import { Component, OnDestroy, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { AuthenticationService, SessionService, AgenciaService, SharedService } from "@app/services";
import { TranslateService } from '@ngx-translate/core';
import { Subscription } from 'rxjs';


@Component({
    selector: 'app-buscador',
    templateUrl: './buscador.component.html',
    styleUrls: []
})
export class BuscadorComponent implements OnInit, OnDestroy {
    subscription: Subscription = new Subscription();
    permisoshotel;
    permisostour;
    permisostraslados;
    permisoscircuitos;
    permisoVuelos;
    permisoshotelAgency;
    permisostourAgency;
    permisostrasladosAgency;
    permisoscircuitosAgency;
    permisoVuelosAgency;
    permisos = [];
    permisosAgency = [];
    permisosActive = [];
    ruta = '';
    tabActive;
    serviciosAgencia;
    serviciosAgenciaP = [];
    constructor(
        private sessionservice: SessionService,
        private sharedService: SharedService,
        private route: ActivatedRoute,
        private router: Router,
        private auth: AuthenticationService,
        private translate: TranslateService
    ) {
        this.sessionservice.getSession().subscribe(response => {

            if (response) {

                let permisosdecode = JSON.parse(response);
                this.permisos.push(permisosdecode);
                this.permisoshotel = permisosdecode.hoteles;
                this.permisostour = permisosdecode.tours;
                this.permisostraslados = permisosdecode.traslados;
                this.permisoscircuitos = permisosdecode.circuitos;
                this.permisoVuelos = permisosdecode.vuelos;

            }
        });

        this.sharedService.agenciaObserver.subscribe(agencia => {
            this.serviciosAgencia = agencia.servicios;
            this.permisoshotelAgency = this.serviciosAgencia.hoteles;
            this.permisostourAgency = this.serviciosAgencia.tours;
            this.permisostrasladosAgency = this.serviciosAgencia.traslados;
            this.permisoscircuitosAgency = this.serviciosAgencia.circuitos;
            this.permisoVuelosAgency = this.serviciosAgencia.vuelos;
            this.serviciosAgenciaP.push(this.serviciosAgencia);
            this.permisosAgency.push(this.serviciosAgencia);
            var hotelP = false;
            var vuelosP = false;
            var toursP = false;
            var trasladosP = false;
            var circuitosP = false;
            this.permisos.forEach(p => {
                if (p.hoteles == 1) {

                    hotelP = true;
                }
                if (p.vuelos == 1) {
                    vuelosP = true;

                }
                if (p.tours == 1) {
                    toursP = true;

                }
                if (p.traslados == 1) {
                    trasladosP = true;

                }
                if (p.circuitos == 1) {
                    circuitosP = true;

                }
            });
            this.serviciosAgenciaP.forEach(a => {
                if (hotelP == true && a.hoteles == 1) {
                    this.permisosActive.push('hoteles')
                }
                if (vuelosP == true && a.vuelos == 1) {
                    this.permisosActive.push('vuelos')
                }
                if (toursP == true && a.tours == 1) {

                    this.permisosActive.push('tours')
                }
                if (trasladosP == true && a.traslados == 1) {
                    this.permisosActive.push('traslados')
                }
                if (circuitosP = true && a.circuitos == 1) {

                    this.permisosActive.push('circuitos')
                }
            });
            // console.log(this.permisosActive);
            this.ruta = this.permisosActive[0];
            this.tabActive = this.ruta;
            // this.ruta = 'hoteles';
        });

        this.subscription.add(
            this.auth.currentUser.subscribe(res => {
                if (res.userData.idAgencia == 11241) {
                    this.permisoVuelos = 1;
                }
            })
        );
        this.route.queryParams.subscribe(params => {
            if (this.router.getCurrentNavigation().extras.state) {
                this.tabActive = this.router.getCurrentNavigation().extras.state.buscar;
                this.ruta = this.tabActive;
            }
        });
        this.auth.getLang().subscribe(res=>{
          translate.setDefaultLang(res);
        });
    }

    ngOnDestroy() {
        this.subscription.unsubscribe();
    }

    ngOnInit() {
        
    }

    selectTab(ev) {
        var elements = document.getElementsByClassName('tab-pane');
        Array.from(elements).forEach(function (el) {
            el.className = 'tab-pane fade';
        });
        document.getElementById(ev).classList.add('show', 'active');
    }
}