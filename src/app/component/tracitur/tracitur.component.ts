import { Component, OnInit, Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { User } from "../../models";
import {
    TraciturService,
    SharedService,
    FirebaseService,
    AuthenticationService,
    SweetalertService,
} from '@app/services';
import { TranslateService } from '@ngx-translate/core';
@Component({
    selector: 'app-tracitur',
    templateUrl: 'tracitur.component.html',
    styleUrls: [],
})
@Injectable({
    providedIn: 'root',
})
export class TraciturComponent implements OnInit {
    user;
    currentUser;
    currencies = [];
    ruta;
    constructor(
        private router: Router,
        private traciturService: TraciturService,
        private sharedService: SharedService,
        private authenticationService: AuthenticationService,
        private swal: SweetalertService,
        private translate: TranslateService
    ) {
        this.ruta = router.url;
        this.sharedService.usuarioObserver.subscribe((user) => {
            this.user = user;
        });
        this.authenticationService.currentUser.subscribe((x) => (this.currentUser = x));
        this.authenticationService.getLang().subscribe(res=>{
            translate.setDefaultLang(res);
        });
    }

    ngOnInit() {}

    showDetails(service, searchParams) {
        searchParams.d = undefined;
        searchParams.s = service.info.nombre;
        const typeService = searchParams.ts;
        const path = service.info.url_page;
        const type = typeof searchParams.s !== 'undefined' && searchParams.s !== null ? 's' : 'd';
        const broker = typeof service.broker !== 'undefined' ? service.broker : null;
        const label = searchParams.s || searchParams.d;
        const detailsParams = {
            path,
            searchParams,
            // service,
            broker,
            tipo: searchParams.ts,
        };
        localStorage.setItem('detailsService', JSON.stringify(detailsParams));
        this.router.navigate([`${typeService}/detalles/${path}`]);
    }

    // SPECIAL TOURS - CIRCUITOS
    checkAvail(book) {
        if (book.broker === 'SPTOUR') {
            const params = {
                idServicio: book.info.idServicio,
                idCategoria: book.info.idCategoria,
                fs: book.info.fechaSalida,
                idBroker: book.broker,
                idOperador: localStorage.getItem('access_ope'),
                occupancy: book.info.ocuppancy,
                disponibilidad: null,
            };
            this.traciturService.checkAvail(params).subscribe((r) => {
                const availSpecial = r.data;
                params.disponibilidad = availSpecial.disponibilidad;
                if (params.disponibilidad) {
                    this.prebooking(params, book);
                } else {
                    this.swal.error('No hay disponibilidad', 'Intente con otras fechas');
                }
            });
        } else {
            this.gotoBook(book, 'circuito');
        }
    }

    prebooking(params, book) {
        this.traciturService.prebooking(params).subscribe((r) => {
            const dispoSpecial = r.data;
            if (dispoSpecial.prebooking === 1 && params.disponibilidad === 1) {
                book.headers = dispoSpecial.header;
                this.gotoBook(book, 'circuito');
            } else {
                this.swal.alert(r.title, r.msg, r.status);
            }
        });
    }
    // ! SPECIAL TOURS - CIRCUITOS

    gotoBook(book, service) {
        let permisos;
        if(this.currentUser.permisos){
            permisos = this.currentUser.permisos;
        }else{
            permisos = this.currentUser;
        }
        if (book.politicas.id !== 0) {
            if (permisos.gastos_cancelacion === 1) {
                this.swal.confirm(
                    {
                        title: book.politicas.title,
                        text: book.politicas.descripcion,
                        confirmButtonText: 'Continuar',
                    },
                    this.politicas.bind(this, book)
                );
                return true;
            } else {
                this.swal.warning(book.politicas.title, book.politicas.descripcion);
            }
        } else {
            this.politicas(book, service);
        }
    }

    politicas(book, service) {
        const bookJson = localStorage.setItem('service_book', JSON.stringify(book));
        this.router.navigate([`booking/${service}`]);
    }
}
