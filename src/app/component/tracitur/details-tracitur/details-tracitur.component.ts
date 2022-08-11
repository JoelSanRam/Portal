import { Component, OnInit, OnDestroy } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { TraciturService, SharedService, FirebaseService, AuthenticationService } from '@app/services';
import { Location } from '@angular/common';
import { TraciturComponent } from '@app/component/tracitur/tracitur.component';
import { GalleryTraciturComponent } from '@app/component/tracitur/details-tracitur/gallery-tracitur/gallery-tracitur.component';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { TranslateService } from '@ngx-translate/core';

@Component({
    selector: 'app-details-tracitur',
    templateUrl: './details-tracitur.component.html',
    styleUrls: [],
})
export class DetailsTraciturComponent implements OnInit, OnDestroy {
    path;
    params;
    idOperador;
    tipo;
    fechaSalida;
    broker;
    serviceDetails;
    serviceSelected;
    gallery = [];
    searchParams;
    map;

    user;
    currentUser;
    currencies = [];
    constructor(
        private route: ActivatedRoute,
        private traciturService: TraciturService,
        private location: Location,
        private sharedService: SharedService,
        private firebaseService: FirebaseService,
        private authenticationService: AuthenticationService,
        private traciturComponent: TraciturComponent,
        private modalService: NgbModal,
        private translate: TranslateService
    ) {
        this.sharedService.usuarioObserver.subscribe((user) => {
            this.user = user;
        });
        this.authenticationService.currentUser.subscribe((x) => (this.currentUser = x));

        this.firebaseService.currencies.subscribe((data) => {
            const currencies = [];
            Object.keys(data).forEach((key) => {
                currencies.push(data[key]);
            });
            this.currencies = currencies;
        });
        this.authenticationService.getLang().subscribe(res=>{
            translate.setDefaultLang(res);
        });
    }

    ngOnInit() {
        // if (main.idioma == 'EN') {
        //     this.setLangData('EN');
        // } else {
        //     this.setLangData('ES');
        // }
        this.setLangData('ES');
        this.params = JSON.parse(localStorage.getItem('detailsService'));
        this.path = this.route.snapshot.paramMap.get('path');
        // this.serviceSelected = this.params.service;
        this.searchParams = this.params.searchParams;
        this.tipo = this.params.tipo;
        this.fechaSalida = this.params.fs;
        this.broker = this.params.broker;
        this.idOperador = localStorage.getItem('access_ope');
        this.getPage();
    }

    getPage() {
        let pathBroker;
        if (this.broker != null) {
            pathBroker = this.path + '?broker=' + this.broker;
        } else {
            pathBroker = this.path + '?broker=' + this.idOperador;
        }
        const tp = '';
        this.traciturService.searchTours(this.searchParams).subscribe((r) => {
            this.serviceSelected = r.results[0];            
        });
        this.traciturService.getServiceDetails(pathBroker).subscribe((r) => {
            const label = r.titulo;
            // main.setPageVariables(response.idServicio, response.tipo);
            this.map = r.map;
            this.serviceDetails = r;
            // this.tipo = r.tipo;
            if (this.broker == 'SPTOUR') {
                this.gallery = r.gallery;
                // this.gallery = this.data.gallery;
            } else {
                this.traciturService.getServiceGallery(this.path).subscribe((gallery) => {
                    this.gallery = gallery;
                });
            }

            if (this.tipo == 'CIR') {
            }

            this.initParams(label, r.idServicio);
        });
    }

    initParams(label, idServicio) {}

    setLangData(lang) {
        // let idLenguaje = app.lenguaje;
        // var translations = this.serviceDetails.traducciones;
        // if (idLenguaje == 'ES') {
        //     return page.data[lang];
        // } else {
        //     if (
        //         typeof translations[idLenguaje] !== 'undefined' &&
        //         typeof translations[idLenguaje][lang] !== 'undefined'
        //     ) {
        //         return translations[idLenguaje][lang];
        //     } else {
        //         return page.data[lang];
        //     }
        // }
    }

    showGallery() {
        const modalRef = this.modalService.open(GalleryTraciturComponent, { size: 'lg' });
        modalRef.componentInstance.gallery = this.gallery;
    }

    prebookForm(data, pareja) {
        let rangeAdultos_ = [];
        let rangeAdultosMayores = [];
        let rangeInfantes = [];
        let rangeMenores = [];

        let rangeInfantesAges = [];
        let rangeMenoresAges = [];

        const maxAdt = 20;
        const maxAdM = 20;
        const maxInf = 10;
        const maxMen = 10;

        const mayores = data.occupancyRules.mayores;
        const infantes = data.occupancyRules.infantes;
        const menores = data.occupancyRules.menores;
        const ocupmin = data.occupancyRules.ocupmin;

        const minAdt =
            typeof data.occupancyRules.ocupmin !== 'undefined'
                ? data.occupancyRules.mayores === '1'
                    ? 0
                    : ocupmin
                : 1;
        const minRangeInf = data.occupancyRules.edadinfantemin;
        const maxRangeInf = data.occupancyRules.edadinfantemax;
        const minRangeMen = data.occupancyRules.edadmenormin;
        const maxRangeMen = data.occupancyRules.edadmenormax;
        let agesRanges = [];

        for (let i = minAdt; i <= maxAdt; i++) {
            rangeAdultos_.push(i.toString());
            if (pareja === 1) {
                var $arrayPares = [];
                $arrayPares = this.obtenerPares(rangeAdultos_);
            }
        }
        for (let i = 0; i <= maxAdM; i++) {
            rangeAdultosMayores.push(i.toString());
        }
        for (let i = 0; i <= maxInf; i++) {
            rangeInfantes.push(i.toString());
        }
        for (let i = 0; i <= maxMen; i++) {
            rangeMenores.push(i.toString());
        }
        for (let i = parseInt(minRangeInf); i <= parseInt(maxRangeMen); i++) {
            rangeInfantesAges.push(i.toString());
        }
        for (let i = parseInt(minRangeMen); i <= parseInt(maxRangeMen); i++) {
            rangeMenoresAges.push(i.toString());
        }
        if (typeof data.ocupacion !== 'undefined') {
            var ocupacionAdultos = data.ocupacion.adultos;
            var ocupacionMenores = data.ocupacion.menores;
        } else {
            ocupacionMenores = 0;
        }

        let rangeAdultos = [];

        if (pareja === 1) {
            rangeAdultos = $arrayPares;
        } else {
            rangeAdultos = rangeAdultos_;
        }

        const ocupancyOptions = {
            ocupmin: typeof data.ocupmin !== 'undefined' ? data.ocupmin : 1,
            adultos: {
                options: rangeAdultos,
            },
            mayores: {
                active: mayores,
                options: rangeAdultosMayores,
            },
            infantes: {
                active: infantes,
                options: rangeInfantes,
                option_ages: rangeInfantesAges,
            },
            menores: {
                active: menores,
                options: rangeMenores,
                optionas_ages: rangeMenoresAges,
            },
            typePax: 0,
        };

        let typePax = 1;
        if (ocupancyOptions.mayores.active == 1) {
            typePax += 1;
        }
        if (ocupancyOptions.infantes.active == 1) {
            typePax += 1;
        }
        if (ocupancyOptions.menores.active == 1) {
            typePax += 1;
        }

        ocupancyOptions.typePax = typePax;

        data.book = {
            info: data.info,
            politicas: data.politicas,
            rooming: {
                adultos: typeof data.ocupacion !== 'undefined' ? ocupacionAdultos : ocupmin,
                mayores: '0',
                infantes: '0',
                menores: ocupacionMenores,
            },
            ocupancyOptions: ocupancyOptions,
            tarifas: data.tarifas,
            total: {
                currency: data.tarifas.currency,
                neto: 0,
                publico: 0,
            },
        };

        data.prebook = !data.prebook;
        this.calculateTotal(data.book);
    }

    obtenerPares(num) {
        let arrayPar = [];
        for (var i = 2; i <= num.length; i++) {
            if (i % 2 === 0) {
                arrayPar.push(i.toString());
            }
        }
        return arrayPar;
    }

    calculateTotal(book) {
        let adultoMayorActive = book.ocupancyOptions.mayores.active;
        let infantesActive = book.ocupancyOptions.infantes.active;
        let menoresActive = book.ocupancyOptions.menores.active;

        let tarifas = book.tarifas.publica;
        let tarifasNetas = book.tarifas.neta;

        let nAdultos = parseInt(book.rooming.adultos);
        let nMayores = parseInt(book.rooming.mayores);
        let nInfantes = parseInt(book.rooming.infantes);
        let nMenores = parseInt(book.rooming.menores);

        let pAdulto = tarifas.adulto;
        let pAdultoMayor = tarifas.mayor;
        let pInfante = tarifas.infante;
        let pMenor = tarifas.menor;

        let pnAdulto = tarifasNetas.adulto;
        let pnAdultoMayor = tarifasNetas.mayor;
        let pnInfante = tarifasNetas.infante;
        let pnMenor = tarifasNetas.menor;

        let total = 0;
        let totalNeto = 0;

        let impAdultos = 0;
        let impMayores = 0;
        let impInfantes = 0;
        let impMenores = 0;

        let impNAdultos = 0;
        let impNMayores = 0;
        let impNInfantes = 0;
        let impNMenores = 0;
        const ratesDetails = [
            {
                adultos: {
                    cantidad: nAdultos,
                    importen: 0,
                    importep: 0,
                },
                adultosmayores: {
                    cantidad: pnAdultoMayor,
                    importen: 0,
                    importep: 0,
                },
                infantes: {
                    cantidad: pnInfante,
                    importen: 0,
                    importep: 0,
                },
                menores: {
                    cantidad: pnMenor,
                    importen: 0,
                    importep: 0,
                },
            },
        ];

        if (adultoMayorActive === '1') {
            impNMayores = nMayores * pnAdultoMayor;
            impMayores = nMayores * pAdultoMayor;

            ratesDetails[0].adultosmayores.importen = impNMayores;
            ratesDetails[0].adultosmayores.importep = impMayores;
        }
        if (infantesActive === '1') {
            impNInfantes = nInfantes * pnInfante;
            impInfantes = nInfantes * pInfante;

            ratesDetails[0].infantes.importen = impNInfantes;
            ratesDetails[0].infantes.importep = impInfantes;
        }
        if (menoresActive === '1') {
            impNMenores = nMenores * pnMenor;
            impMenores = nMenores * pMenor;

            ratesDetails[0].menores.importen = impNMenores;
            ratesDetails[0].menores.importep = impMenores;
        }
        impNAdultos = nAdultos * pnAdulto;
        impAdultos = nAdultos * pAdulto;

        ratesDetails[0].adultos.importen = impNAdultos;
        ratesDetails[0].adultos.importep = impAdultos;

        total = impAdultos + impMayores + impInfantes + impMenores;
        totalNeto = impNAdultos + impNMayores + impNInfantes + impNMenores;
        if (total > 0) {
            book.available = true;
        } else {
            book.available = false;
        }

        book.ratesDetails = ratesDetails;
        book.total.neto = totalNeto;
        book.total.publico = total;
    }

    checkAvail(book) {
        this.traciturComponent.checkAvail(book);
    }

    gotoBook(book, service) {
        this.traciturComponent.gotoBook(book, service);
    }

    goBack() {
        this.location.back();
        localStorage.removeItem('detailsService');
    }

    ngOnDestroy() {
        localStorage.removeItem('detailsService');
    }
}
