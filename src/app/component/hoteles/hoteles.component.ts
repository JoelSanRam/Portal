import { Component, OnInit, ViewChild, ElementRef, Injectable, HostListener, Input } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { HotelService, AlertService, AuthenticationService, SharedService, CotizacionesService, SessionService, AgenciaService } from "@app/services";
import { User } from "@app/models";
import { filter, min, max, sortBy, uniq, includes, find, get, pull } from "lodash-es";
import { SweetalertService } from '@app/services/sweetalert.service';
import * as moment from 'moment';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { FiltrosComponent } from './filtros/filtros.component';
import { InfoHotelComponent } from './info-hotel/info-hotel.component';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { formatCurrency, ViewportScroller } from '@angular/common';
import { registerLocaleData } from '@angular/common';
import localeEs from '@angular/common/locales/es';
import { FirebaseService } from '@app/services/firebase/firebase.service';
import { NgxSpinnerService } from "ngx-spinner";
import { debounceTime, distinctUntilChanged } from 'rxjs/operators';
import { Subject } from 'rxjs';
import { InfoHotelUComponent } from "./info-hotel-u/info-hotel-u.component";
import { LottieService } from '@app/services/lottie.service';
import { AppComponent } from '@app/app.component';
import { TranslateService } from '@ngx-translate/core';

registerLocaleData(localeEs);

@Component({
    selector: 'app-results',
    templateUrl: './hoteles.component.html',
    styleUrls: []
})
@Injectable({
    providedIn: 'root'
})

export class HotelesComponent implements OnInit {
    @ViewChild('tagInput') tagInputRef: ElementRef;
    public loading: boolean = false;
    public index;
    tags = [];
    today = new Date(Date.now());
    imgruta;
    currentUser: User;
    ctrlHoteles = [];
    nomhotel = '';
    hoteles = [];
    arrHotels = [];
    paginacion;
    resulthotel;
    returnUrl: string;
    arrnum;
    arrplanes;
    arrcategoria;
    arrbrokers;
    arrresult;
    // Filtros

    arregloplann = [];
    arreglocatn = [];
    filterBrokers = 1;
    filbroker = [];
    filorder = "PRICE_ASC";
    filhotel = '';
    filterHotelChanged: Subject<string> = new Subject<string>();
    filplanes = [];
    filcategorias = [];
    filtroarregloplanes = [];
    filtroarreglocat = [];
    limitResult = 0;
    filtrosvarios: FormGroup;
    form: FormGroup;
    currencies;
    rnumnoches;
    rnumhabs;

    btn_ver = 'VER MÁS';
    paramsBusqueda; //parametros de busqueda
    user;
    velo;

    reserva_;
    permisosbroker;
    permisosgastos;
    permisoscotizar;
    permisosreservar;
    // SCROLL TO TOP
    showScroll: boolean;
    showScrollHeight = 300;
    hideScrollHeight = 10;
    mensaje;
    mensajeshow = false;
    resultadosshow = false;
    verboton = false;
    arrDestacados = [];
    idOpe;
    isReadMore: boolean = false;
    //PERSMISOS DE LINKS TRASLADOS
    permisoshotel;
    permisostour;
    permisostraslados;
    permisoscircuitos;
    cotizaciones_novistas;
    nombresfiltros = [];
    arrsemanas = [];
    showdetalles = false;
    fechas;
    totalResultados = 0;
    showBoundaryLinks = true;
    rotate = true;
    maxSize = 10;
    currentPage;
    idAgencia;
    agencia;
    currencyA;
    calculo;

    importeTotalCalculado;
    currencyAgencia;
    tasasCambio;

    paramsCache;
    filtrar = {
        planes: [],
        categorias: [],
        order: 'PRICE_ASC',
        hotel: '',
        brokers: []
    };
    url_loader;
    constructor(
        private formBuilder: FormBuilder,
        private hotelService: HotelService,
        private activatedRoute: ActivatedRoute,
        private authenticationService: AuthenticationService,
        private router: Router,
        private spinnerService: NgxSpinnerService,
        private modalService: NgbModal,
        public sharedService: SharedService,
        public sweetAlertService: SweetalertService,
        private fs: FirebaseService,
        private cotizacionesService: CotizacionesService,
        private sessionservice: SessionService,
        public agenciaService: AgenciaService,
        private lottieService: LottieService,
        private appComponent: AppComponent,
        private translate: TranslateService,
        private scroller: ViewportScroller
    ) {
        this.authenticationService.currentUser.subscribe(x => this.currentUser = x);
        this.idOpe = this.currentUser.userData.idOperador;
        this.sharedService.usuarioObserver.subscribe(user => {
            this.user = user;
        });
        this.fs.currencies.subscribe(data => {
            var curr = [];
            Object.keys(data).forEach(function (key) {
                curr.push(data[key]);
            });
            this.currencies = curr;
        });
        this.sessionservice.getSession().subscribe(response => {
            if (response) {
                let permisosdecode = JSON.parse(response);
                this.permisosbroker = permisosdecode.brokers;
                this.permisosgastos = permisosdecode.gastos_cancelacion;
                this.permisoscotizar = permisosdecode.cotizar;
                this.permisosreservar = permisosdecode.reservar;
                this.permisoshotel = permisosdecode.holetes_age;
                this.permisostour = permisosdecode.tours_age;
                this.permisostraslados = permisosdecode.traslados_age;
                this.permisoscircuitos = permisosdecode.circuitos_age;
            }
        });

        this.cotizacionesService.getCotizacionesNoVistas().subscribe((r) => {
            this.cotizaciones_novistas = r;
            if (typeof this.cotizaciones_novistas == undefined || this.cotizaciones_novistas == "") {
                this.cotizaciones_novistas = 0;
            }
        });

        this.filterHotelChanged
            .pipe(debounceTime(1000), distinctUntilChanged())
            .subscribe(model => {
                this.filhotel = model;
                this.onSubmit(this.filhotel, 'hotel');
            });

        this.imgruta = '../../../assets/img/spinners/tarifas.gif?' + this.today;

        this.activatedRoute.queryParams.subscribe(params => {
            console.log("params", params)
            if (Object.keys(params).length !== 0) {
                var destino = {
                    Label: decodeURI(params.label),
                    nombre: decodeURI(params.nombre),
                    idDest: params.idDest,
                    pais: decodeURI(params.pais),
                    id: (Array.isArray(params.id)) ? [parseInt(params.id[0])] : [parseInt(params.id)],
                    Type: params.type,
                }
                var habs = JSON.parse(params.habs);
                if (typeof (params.paginacion) != 'undefined') {
                    this.paramsBusqueda = {
                        paginacion: JSON.parse(params.paginacion)
                    }
                    if (typeof (params.filtrar) != 'undefined') {
                        this.paramsBusqueda.filtrar = JSON.parse(params.filtrar);
                        this.filorder = this.paramsBusqueda.filtrar.order;
                    }
                    this.paramsBusqueda.habitaciones = habs;
                } else {
                    this.paramsBusqueda = {
                        destino: destino,
                        ffinal: params.ffinal,
                        finicio: params.finicio,
                        habitaciones: habs,
                        nhabs: habs.length,
                        nacionalidad: JSON.parse(params.nacionalidad),
                        filters: JSON.parse(params.filters)
                    };
                }
                this.paramsCache = params;
            }
        });
        this.authenticationService.setTypeLoader('defaul');
        this.authenticationService.getLang().subscribe(res => {
            translate.setDefaultLang(res);
        });
    }

    // SCROLL TO TOP
    @HostListener('window:scroll', [])
    onWindowScroll() {
        if ((window.pageYOffset || document.documentElement.scrollTop || document.body.scrollTop) > this.showScrollHeight) {
            this.showScroll = true;
        } else if (this.showScroll && (window.pageYOffset || document.documentElement.scrollTop || document.body.scrollTop) < this.hideScrollHeight) {
            this.showScroll = false;
        }
    }

    ngOnInit() {
        this.authenticationService.getTypeLoader().subscribe((res) => {
            if (res != undefined) {
                this.url_loader = res
            }
        })
        this.showloader()
        this.idAgencia = JSON.parse(localStorage.getItem('access_agen'));
        this.arreglocatn = [' '];
        this.arregloplann = [' '];
        this.filcategorias = [];
        this.filtroarregloplanes = [];
        this.filtrosvarios = this.formBuilder.group({
            hotel: [''],
            order: [''],
            planes: [''],
            categorias: [''],
            brokers: [''],


        });
        this.returnUrl = this.activatedRoute.snapshot.queryParams['returnUrl'] || '/hoteles';


        this.searchHotles(this.paramsBusqueda, 1);
        this.agenciaService.getAgencia(this.idAgencia).subscribe(agencia => {
            this.sharedService.setAgencia(agencia);
            this.agencia = agencia;
            this.currencyAgencia = agencia.currency;
            this.getTasaCambio(this.currencyAgencia);
        });
    }

    showloader() {
        if (this.url_loader.existInConfig == false) {
            this.spinnerService.show();
        } else {
            this.lottieService.setLoader(true, '');
            // console.log(this.url_loader);
        }
    }

    hideLoader() {

        if (this.url_loader.existInConfig == true) {
            this.lottieService.setLoader(false, '');
        } else {
            this.spinnerService.hide();
        }
    }

    getTasaCambio(currencyAgencia) {
        var moneda = currencyAgencia;
        var tarifa = 0;
        this.hotelService.getTasacambio(moneda).subscribe((res) => {
            this.tasasCambio = res.data;
        });
    }

    calculateTDC(tarf, tdc, currencyTarifa, broker) {
        let currency_user = this.user;
        var tasaCambioAplicable
        if (tdc === null || tdc == 0) {
            var tasaCambioFB = this.currencies.find(function (tc) { return tc.currency_name == currency_user.currency });
            tdc = tasaCambioFB.tasa_cambio;
        }

        if (broker == 0) {
            //*********************Tasa de cambio para agencias con currency USD */
            if (this.currencyAgencia == 'USD' && (currencyTarifa != this.currencyAgencia)) {
                tasaCambioAplicable = this.tasasCambio.find(function (t) { if (t.currency == currencyTarifa) { return t } })
                tdc = tasaCambioAplicable.tasaCambio;
            }
            //***************************************** */
        }
        var total_currency = tarf * tdc;

        return total_currency;
    }

    calculateNN(tarf, div, noches) {
        var total_currency = tarf * div;

        return total_currency;
    }

    toolHtml(nomHotel, nomRoom, plan, dia, broker, unificado) {
        if (unificado) {
            var detallepromo = dia.promotion.description;
            var detalle = dia.details;
            var $textGratis = '<span class="clime bold">Gratis</span>';
            var $html = '<h3 class="popover-title popover-header titlepop">' + nomHotel + '<BR> ' + nomRoom + ' ' + plan + '</h3>';
            $html += '<div class="text-left" >';
            var $s = "<br>";
            $html += nomHotel + $s;

            var $cont = 1;
            for (let d of detalle) {
                $html += 'Habitación ' + $cont + $s;
                $html += 'Adultos: ' + d.occupancy.adults + $s;
                if (d.occupancy.childs.length > 0) {
                    $html += 'Menores: ' + d.occupancy.childs + $s;
                }
                $html += 'Importe: ' + this.user.currency + ' $' + dia.rate.public + $s + $s;
                $cont++;
            }
        } else {
            if (dia.importesxdia == null) {
                return;
            }
            var detallepromo = dia.importesxdia.detallePromo;
            var detalle = dia.importesxdia.detallepaxs;
            var $textGratis = '<span class="clime bold">Gratis</span>';
            var $html = '<h3 class="popover-title popover-header titlepop">' + nomHotel + '<BR> ' + nomRoom + ' ' + plan + '</h3>';
            $html += '<div class="text-left" >';
            var $s = "<br>";
            $html += nomHotel + $s;
            switch (broker) {
                case 'RSTL':
                    var $cont = 1;
                    for (let d of detalle) {
                        $html += 'Habitación ' + $cont + $s;
                        $html += 'Adultos: ' + d.adultos + $s;
                        $html += 'Menores: ' + d.menores + $s;
                        $html += 'Importe: ' + this.user.currency + ' $' + d.importehab + $s + $s;
                        $cont++;
                    }
                    break;
                case 'HTBD':
                    var $cont = 1;
                    for (let d of detalle) {
                        $html += 'Habitación ' + $cont + $s;
                        $html += 'Adultos: ' + d.adultos + $s;
                        $html += 'Menores: ' + d.menores + $s;
                        $html += 'Importe: ' + this.user.currency + ' $' + d.importehab + $s + $s;
                        $cont++;
                    }
                    break;
                case 'BOOK':
                    var $cont = 1;
                    for (let d of detalle) {
                        $html += 'Habitación ' + $cont + $s;
                        $html += 'Adultos: ' + d.adultos + $s;
                        $html += 'Menores: ' + d.menores + $s;
                        $html += 'Importe: ' + this.user.currency + ' $' + d.importehab + $s + $s;
                        $cont++;
                    }
                    break;
                case 'ESBD':
                    var $cont = 1;
                    for (let d of detalle) {
                        $html += 'Habitación ' + $cont + $s;
                        $html += 'Adultos: ' + d.adultos + $s;
                        $html += 'Menores: ' + d.menores + $s;
                        $html += 'Importe: ' + this.user.currency + ' $' + d.importehab + $s + $s;
                        $cont++;
                    }
                    break;
                case 'W2MT':
                    var $cont = 1;
                    for (let d of detalle) {
                        $html += 'Habitación ' + $cont + $s;
                        $html += 'Adultos: ' + d.adultos + $s;
                        $html += 'Menores: ' + d.menores + $s;
                        $html += 'Importe: ' + this.user.currency + ' $' + d.importehab + $s + $s;
                        $cont++;
                    }
                    break;
                case 'LOTS':
                    var $cont = 1;
                    for (let d of detalle) {
                        $html += 'Habitación ' + $cont + $s;
                        $html += 'Adultos: ' + d.adultos + $s;
                        $html += 'Menores: ' + d.menores + $s;
                        $html += 'Importe: ' + this.user.currency + ' $' + d.importehab + $s + $s;
                        $cont++;
                    }
                    break;
                case 'DING':
                    var $cont = 1;
                    for (let d of detalle) {
                        $html += 'Habitación ' + $cont + $s;
                        $html += 'Adultos: ' + d.adultos + $s;
                        $html += 'Menores: ' + d.menores + $s;
                        $html += 'Importe: ' + this.user.currency + ' $' + d.importehab + $s + $s;
                        $cont++;
                    }
                    break;
                default:
                    var $cont = 1;
                    for (let d of detalle) {
                        $html += "Habitacion " + $cont + $s;
                        var $tipoTarifa = d.ocupacion;
                        var $menores = d.menores;
                        var $juniors = d.juniors;
                        var $extras = d.extras;
                        var $tarifa = d.tarifa;
                        var $precio = '';
                        var $preciotarifa = ($tarifa.sintarifa != 1) ? formatCurrency($tarifa.adultos, 'en-EN', '', '1') : '<SPAN CLASS="cred">SIN TARIFA</SPAN>';
                        $html += "Adultos(" + $tipoTarifa + "): " + this.user.currency + " " + $preciotarifa + $s;
                        if ($extras > 0) {
                            $html += "Extra (" + $extras + "):" + " " + formatCurrency($tarifa.extras, 'en-EN', '', '1') + $s;
                        }
                        if ($menores > 0) {
                            for (let m of $tarifa.menores_det) {
                                $precio = (m.gratis != 0) ? $textGratis : (m.precio != 0) ? formatCurrency(m.precio, 'en-EN', '', '1') : $textGratis;
                                $html += "Menor(" + m.edad + "): " + $precio;
                                $html += $s;
                            }
                        }
                        if ($juniors > 0) {
                            for (let j of $tarifa.juniors_det) {
                                $precio = (j.precio > 0) ? formatCurrency(j.precio, 'en-EN', '', '1') : $textGratis;
                                $html += "Junior(" + j.edad + "): " + $precio;
                                $html += $s;
                            }
                        }

                        $cont++;
                    }
                    $html += "" + detallepromo;
                    $html += '</div>';
                    break;
            }
        }

        return $html;
    }

    loadMore($event) {
        let scrollHeight = $event.srcElement.children[0].scrollHeight;
        let clientHeight = $event.srcElement.children[0].clientHeight;
        let scrollOffset = $event.srcElement.children[0].scrollTop;
        let screenHeight = scrollHeight - clientHeight;
        let limit = screenHeight - (screenHeight * 0.30);
        if (limit < scrollOffset) {
            this.limitResult += 3;
        }
    }
    busquedahotel(itemsBusqueda) {
        this.filhotel = '';
        this.filorder = "PRICE_ASC";
        this.arreglocatn = [' '];
        this.arregloplann = [' '];
        var destino = (Array.isArray(itemsBusqueda.destino.id)) ? [parseInt(itemsBusqueda.destino.id[0])] : [parseInt(itemsBusqueda.destino.id)];
        itemsBusqueda.destino.id = destino;
        this.searchHotles(itemsBusqueda, 1);
        return true;
    }

    removeTag(tag) {
        this.currentPage = 1;
        let index = this.tags.indexOf(tag);
        this.tags.splice(index, 1);

        let tipoplacat;
        for (let plan of this.filtroarregloplanes) {
            if (plan.plan == tag) {
                tipoplacat = 'Planes';
                pull(this.filtroarregloplanes, plan);
            }
        }
        for (let cat of this.filtroarreglocat) {
            if (cat.categoria == tag) {
                tipoplacat = 'Categorias';
                pull(this.filtroarreglocat, cat);
            }
        }
        if (this.filtroarregloplanes.length > 0) {
            for (let pl of this.filtroarregloplanes) {
                for (let pl2 of pl.idPlan) {
                    this.arregloplann.push(pl2);
                }
            }
        } else {
            this.arregloplann = [];
        }
        if (this.filtroarreglocat.length > 0) {
            for (let ct of this.filtroarreglocat) {
                for (let ct2 of ct.idCategoria) {
                    this.arreglocatn.push(ct2);
                }
            }
        } else {
            this.arreglocatn = [];
        }
        pull(this.filtroarreglocat, tag);
        if (!!tag) {
            let dataresult = [];
            let data = {};
            switch (tag) {
                case 'Producto propio':
                case 'Confirmadas':
                    this.filterBrokers = 1;
                    data['brokers'] = [];
                    data['hotel'] = this.filhotel;
                    data['categorias'] = this.arreglocatn;
                    data['order'] = this.filorder;
                    data['planes'] = this.arregloplann;
                    break;
                default:
                    let brokers2 = this.filtrosvarios.getRawValue().brokers;
                    let hotel2 = this.filtrosvarios.getRawValue().hotel;
                    let order2 = this.filtrosvarios.getRawValue().order;
                    this.filtrosvarios.reset({
                        brokers: brokers2,
                        hotel: '',
                        order: order2
                    });
                    this.filhotel = '';
                    data['hotel'] = this.filhotel;
                    data['brokers'] = this.filbroker;
                    data['categorias'] = this.arreglocatn;
                    data['order'] = this.filorder;
                    data['planes'] = this.arregloplann;
                    break;
            }
            switch (tipoplacat) {
                case 'Planes':
                    data['planes'] = this.arregloplann;
                    data['brokers'] = this.filbroker;
                    data['hotel'] = this.filhotel;
                    data['categorias'] = this.arreglocatn;
                    data['order'] = this.filorder;
                    break;
                case 'Categorias':
                    data['categorias'] = this.arreglocatn;
                    data['planes'] = this.arregloplann;
                    data['brokers'] = this.filbroker;
                    data['hotel'] = this.filhotel;
                    data['order'] = this.filorder;
                    break;
            }
            dataresult = this.arrresult;
            dataresult['filtrar'] = data;
            //busqueda.paginacion.page
            dataresult['paginacion'].page = 1;
            pull(this.tags, tag);
            this.searchHotles(dataresult, 0);
        } else {
            this.tags.splice(-1);
        }
    }

    searchHotles(data, type) {
        // console.info('el data',data);
        if (type == 1) {
            this.tags = [];
            this.filtroarregloplanes = [];
            this.filtroarreglocat = [];
            this.filtrosvarios = this.formBuilder.group({
                hotel: [''],
                order: [''],
                brokers: [1]
            });
            // this.filtrosvarios.controls['order'].setValue('PRICE_ASC');
        }
        // this.spinnerService.show();
        this.showloader();
        let hoteles = [];
        let planesdisponibles = [];
        let filtroPlan = [];
        let filtroCat = [];
        let categoriasdisponibles = [];
        let filtroBrokers = [];
        let brokers_disponibles = [];

        let destac = [];

        this.hotelService.searchHotel(data).subscribe(result => {
            if (result) {
                if (result.status == 'success') {
                    this.resultadosshow = true;
                    this.mensajeshow = false;
                    var r = result.data;
                    this.limitResult = 3;
                    this.arrresult = r;
                    this.resulthotel = result.data;
                    this.rnumnoches = r.numnoches;
                    this.rnumhabs = r.numhabs;
                    this.arrplanes = r.filtros.planesdisponibles;
                    this.arrcategoria = r.filtros.categoriasdisponibles;
                    this.arrbrokers = r.filtros.brokers_disponibles;
                    if (r.filtrar) {
                        this.filorder = r.filtrar.order
                        this.filhotel = r.filtrar.hotel;
                        this.filbroker = r.filtrar.brokers;
                        this.filtrar = r.filtrar;

                        this.filtrosAplicados(r.filtros, r.filtrar)
                    }
                    destac = r.destacados;
                    this.arrDestacados = destac;
                    hoteles = r.hoteles;
                    hoteles.map(function (h) {
                        h.limitRooms = 3;

                    });
                    console.log('hoteles', hoteles);
                    if (typeof r.paginacion != 'undefined') {
                        this.paginacion = r.paginacion;
                        this.currentPage = r.paginacion.page;
                        this.arrnum = Array(this.paginacion.pages).fill(1).map((x, i) => i);
                        this.currentPage = r.paginacion.page;
                        this.totalResultados = r.paginacion.total_items;
                    }
                    // this.getPager(this.paginacion);
                    // this.goToPage();
                    this.ctrlHoteles['hoteles'] = hoteles;
                    this.arrHotels = hoteles;
                    this.ctrlHoteles['semanas'] = r.semanas[0];
                    this.ctrlHoteles['rnumhabs'] = r.rnumhabs;
                    this.ctrlHoteles['rnumnoches'] = r.rnumnoches;
                    //PLANES DISPONIBLES
                    for (let p of r.filtros.planesdisponibles) {
                        for (let idPlan of p.idPlan) {
                            var finded = filter(filtroPlan, function (p) {
                                return p == idPlan
                            });
                            if (finded.length == 0) {
                                filtroPlan.push(idPlan);
                            }
                        }
                        planesdisponibles.push(p);
                        this.ctrlHoteles['todoslosplanes'] = true;
                    }
                    this.ctrlHoteles['filtroPlan'] = filtroPlan;
                    this.ctrlHoteles['planesdisponibles'] = planesdisponibles;

                    //CATEGORIAS DISPONIBLES
                    for (let c of r.filtros.categoriasdisponibles) {
                        filtroCat.push(c);
                        categoriasdisponibles.push(c);
                        this.ctrlHoteles['todaslascategorias'] = true;
                    }
                    this.ctrlHoteles['filtroCat'] = filtroCat;
                    this.ctrlHoteles['categoriasdisponibles'] = categoriasdisponibles;

                    //BROKER DISPONIBLES
                    for (let bd of r.filtros.brokers_disponibles) {
                        filtroBrokers.push(bd.status);
                        brokers_disponibles.push(bd);
                        this.ctrlHoteles['allBrokers'] = true;
                    }
                    this.ctrlHoteles['brokers_disponibles'] = brokers_disponibles;
                    this.ctrlHoteles['filtroBrokers'] = filtroBrokers;
                    this.fechas = r.meta;
                    setTimeout(() => {
                        // this.spinnerService.hide();
                        this.hideLoader();
                    }, 2000);
                    //this.spinnerService.hide();

                } else {
                    this.resultadosshow = false;
                    this.mensajeshow = true;
                    this.mensaje = result.msg;
                    // this.spinnerService.hide();
                    this.hideLoader();
                }

            }
        }, err => {
            this.resultadosshow = false;
            this.mensajeshow = true;
            // this.spinnerService.hide();
            this.hideLoader();
        });
    }

    goToPage(busqueda, page) {
        let paramsn = {
            destino: this.paramsBusqueda.destino,
            finicio: this.paramsBusqueda.finicio,
            ffinal: this.paramsBusqueda.ffinal,
            habitaciones: this.paramsBusqueda.habitaciones,
            nhabs: this.paramsBusqueda.nhabs,
            planalimentos: this.paramsBusqueda.planalimentos,
            bestprice: this.paramsBusqueda.bestprice,
            sortOrder: "PRICE_ASC",
            nacionalidad: {
                code: "MX",
                name: "México"
            },
            paginacion: {
                id: busqueda.paginacion.id,
                page: page,
                // page: pagActual,
                pages: busqueda.paginacion.pages,
                timestamp: busqueda.paginacion.timestamp
            },
            filtrar: busqueda.filtrar,
        };

        this.buscarHoteles(paramsn, false);
        window.scrollTo(0, 0)
    }

    buscarHoteles(busqueda, resetPages) {
        var $busqueda = busqueda;
        let nomhotel = "";
        if ($busqueda.finicio === '' || $busqueda.finicio === null) {
            alert('error');
            return;
        }
        if ($busqueda.ffinal === '' || $busqueda.ffinal === null) {
            alert('error');
            return;
        }
        if (typeof resetPages == 'undefined') {
            $busqueda["paginacion"] = null;
        }
        this.searchHotles($busqueda, 0);
        /* this.router.navigate([this.returnUrl]).then(()=>{
          //console.info('corre despues del routunhg');
        }); */
    };

    disponibles(hoteles) {

        if (typeof hoteles === 'undefined') {
            return;
        } else if (typeof hoteles.length === 'undefined') {
            return;
        } else if (hoteles.length <= 0) {
            return;
        }
        var removeAccents = function (value) {
            return value
                .replace(/á/g, 'a')
                .replace(/é/g, 'e')
                .replace(/í/g, 'i')
                .replace(/ó/g, 'o')
                .replace(/ú/g, 'u');
        }
        var $results = [];
        for (let h of hoteles) {
            var $hoteles = removeAccents(h.datoshotel.nombre).toUpperCase();
            var $search = removeAccents(this.nomhotel).toUpperCase();
            var $cat = false;
            var $brk = false;
            var $isset = $hoteles.indexOf($search) > -1;
            if (this.ctrlHoteles['filtroBrokers']) {
                for (let bk of this.ctrlHoteles['filtroBrokers']) {
                    if (h.datoshotel.status.id === bk) {
                        $brk = true;
                    }
                }
            }
            if ($isset || $hoteles === '') {
                for (let fc of this.ctrlHoteles['filtroCat']) {
                    if (h.datoshotel.categoria.categoria === fc.categoria) {
                        $cat = true;
                    }
                }

                if ($cat && $brk) {
                    var $existeplan = false;
                    for (let r of h.rooms) {
                        for (let fp of this.ctrlHoteles['filtroPlan']) {
                            if (r.datosplan.idPlan === fp) {
                                $existeplan = true;
                            }
                        }
                    }
                    if ($existeplan) {
                        $results.push(h);
                    }
                };
            };
        }
        $results = this.orderby($results);
        $results = sortBy($results, 'order');
        return $results;
    }

    mejorprecioBroker(hotel) {
        var $preciominimoObj = [];
        var $preciominimo = 0;
        var idCurrency = this.user.currency; //MXN
        var divisa;
        var broker;
        var currencyTarifa;
        if (hotel.uuid) {
            for (let r of hotel.rooms) {
                // if (includes(this.ctrlHoteles['filtroPlan'], r.mealplan.id)) {
                var total = r.rates.rate.public;
                var tc = r.rates.rate.exchange.exchange_rate; //MXN
                let currency = r.rates.rate.exchange.currency;
                if (tc === null || tc == 0) {
                    var tasaCambioFB = this.currencies.find(function (tc) { return tc.currency_name == idCurrency });
                    tc = tasaCambioFB.tasa_cambio;
                }
                let total_currency;
                if (idCurrency == currency) {
                    total_currency = total;
                    $preciominimoObj.push(total_currency);
                } else {
                    total_currency = total * tc;
                    $preciominimoObj.push(total_currency);
                }
                // }
            }
        } else {
            for (let r of hotel.rooms) {
                var tasaCambioAplicable;
                currencyTarifa = r.tarifas.divisa.currency;

                // this.getTasaCambio(this.currencyAgencia, currencyTarifa);
                if (r.idBroker) {
                    if (includes(this.ctrlHoteles['filtroPlan'], r.datosplan.idPlan)) {
                        var total = r.tarifas.total;
                        var tc = r.tarifas.divisa.tasa_cambio;
                        // tc = 0;
                        if (tc === null || tc == 0) {
                            var tasaCambioFB = this.currencies.find(function (tc) { return tc.currency_name == idCurrency });
                            tc = tasaCambioFB.tasa_cambio;
                        }

                        //*********************Tasa de cambio para agencias con currency USD */
                        if (this.currencyAgencia == 'USD' && (currencyTarifa != this.currencyAgencia)) {
                            tasaCambioAplicable = this.tasasCambio.find(function (t) { if (t.currency == currencyTarifa) { return t } })
                            tc = tasaCambioAplicable.tasaCambio;
                        }
                        //***************************************** */
                        var total_currency = total * tc;
                        $preciominimoObj.push(total_currency);
                    }

                }
            }
        }

        var numnoches = this.rnumnoches;
        var numhabs = this.rnumhabs;
        var order = 'PRICE_ASC'; //Obtener del data busqueda
        switch (order) {
            case 'PRICE_ASC':
                $preciominimo = min($preciominimoObj);
                break;
            case 'PRICE_DESC':
                $preciominimo = max($preciominimoObj);
                break;
        }
        $preciominimo = ($preciominimo / numnoches) / numhabs;
        var textNoche;
        this.translate.get('hotel.precio-mas-bajo').subscribe((data: any) => {
            textNoche = data;
        });
        var html = '<div class="col-xl-12 col-lg-12 col-md-12 p-0"><p class="text-precio-hab">' + textNoche + '</p><h2><span>' + idCurrency + '</span> $' + formatCurrency($preciominimo, 'en-EN', '', '1') + '</h2> </div>';
        return html;
    }

    filterRoom(rooms) {
        var $results = [];
        var $rooms = [];
        for (let room of rooms) {
            for (let fp of this.ctrlHoteles['filtroPlan']) {
                if (room.idBroker) {
                    if (room.datosplan.idPlan === fp) {
                        $rooms.push(room);
                    }
                } else {
                    if (room.mealplan.id === fp) {
                        $rooms.push(room);
                    }
                }
            }
        }
        $rooms = sortBy($rooms, 'tarifas.total_currency');
        var r = uniq($rooms, function (x) {
            return x.datosroom.idRoom;
        });
        var r = $rooms;
        return r;
    }

    getFechaLimite(r) {
        var tituloPoliticas;
        var msgErrorPoliticas;
        this.translate.get('hotel.politicas-cancelacion').subscribe((data: any) => { tituloPoliticas = data; });
        this.translate.get('hotel.error-politicas').subscribe((data: any) => { msgErrorPoliticas = data; });

        var $json = { idBroker: r.idBroker, idHotel: r.idHotel };
        switch (r.idBroker) {
            default:
                var $politicas = r.politicas;
                this.sweetAlertService.info($politicas.title, $politicas.descripcion);
                break;
            case 'RSTL':
                $json['ffinal'] = this.paramsBusqueda.ffinal;
                $json['finicio'] = this.paramsBusqueda.finicio;
                $json['lineas'] = r.broker_book;
                this.hotelService.getPoliticasCancelacion($json).subscribe(res => {
                    switch (res.status) {
                        case 'success':
                            var $politicas = res.data;
                            var fecha_limite_agencia = $politicas.fecha_limite_pago;
                            var title = 'Políticas del hotel';
                            if ($politicas.entra_en_gastos == 1) {
                                title = 'Reserva en Gastos de Cancelacion';
                                fecha_limite_agencia = 'Inmediato';
                                if ($politicas.dias_antes == 999 || $politicas.dias_antes == 998) {
                                    title = 'Reserva en No reembolsable';
                                }
                            }
                            var $politicas_ = '';
                            for (let p of $politicas.politicas) {
                                $politicas_ += p + '<br>';
                            }
                            this.sweetAlertService.info(title, $politicas_ + '<br><br><p><b>Fecha Limite de Pago: ' + fecha_limite_agencia + '</b></p>');
                            break;
                        case 'error':
                            var status = res.status;
                            var title_ = (res.title === '') ? tituloPoliticas : res.title;
                            var msg = (res.msg === '') ? msgErrorPoliticas : r.msg;
                            this.sweetAlertService.error(title_, msg);
                            break;
                    }
                });
                break;

        }
    }

    getFechaLimiteUnificado(r) {
        // console.info('info hotel',r);
        var $json = {
            idBroker: r.broker,
            idHotel: r.info.id
        };
        var $politicas = r.politics;
        this.sweetAlertService.info($politicas.name, $politicas.description);
    }

    orderby(hoteles) {
        for (let h of hoteles) {
            var $totales = [];
            for (let room of h.rooms) {
                for (let fp of this.ctrlHoteles['filtroPlan']) {
                    if (room.datosplan.idPlan === fp) {
                        var total = room.tarifas.total;
                        var divisa = room.tarifas.divisa.currency;
                        var currency = find(this.currencies, function (current_c) {
                            return current_c.currency_name == divisa;
                        });
                        var tc = currency.tasa_cambio;
                        var total_currency = total * tc;
                        $totales.push(total_currency);
                    }
                }
            }
        }
        return hoteles;
    }

    getdetalles(room, fechas) {
        var idBroker = room.idBroker;
        switch (idBroker) {
            case 'RSTL':
                room.fechas = fechas;
                this.GetHotelRateRules(room);
                break;
            case 'HTBD':
                this.GetHotelRateRules(room);
                break;
            case 'BOOK':
            case 'ESBD':
            case 'W2MT':
            case 'LOTS':
                this.GetHotelRateRules(room);
                break;
            case 'DING':
                this.GetHotelRateRules(room);
                break;
            default:
                this.GetHotelRateRulesOperador(room);
                break;
        }
    }

    getdetallesUnificado(room, idBroker) {
        var rateg = {
            broker: idBroker,
            rate_key: room.rates.rate.rate_key
        }
        this.GetHotelRateRulesUnificado(rateg, room);
    }

    GetHotelRateRulesOperador(room) {
        if (typeof room.semanas === 'undefined') {
            room.detalle = !room.detalle;
        } else {
            room.detalle = !room.detalle;
        }
    }

    GetHotelRateRules(room) {
        var idBroker = room.idBroker;
        var checkin;
        var checkout;
        if (typeof room.semanas === 'undefined') {
            var params = {};
            switch (idBroker) {
                case 'HTDO':
                    var ocupacion = room.details_params.ocupacion;
                    var data = room.details_params.detailsRate;
                    params = {
                        idBroker: idBroker,
                        broker_book: room.broker_book,
                        sd: data.sd,
                        ed: data.ed,
                        habs: this.paramsBusqueda.habitaciones
                    }
                    break;
                case 'RSTL':
                    checkin = room.fechas.finicioSql;
                    checkout = room.fechas.ffinalSql;
                    params = { idBroker: idBroker, broker_book: room.broker_book, divisa: room.tarifas.divisa, checkin: checkin, checkout: checkout };
                    break;
                case 'HTBD':
                    checkin = this.paramsBusqueda.finicio;
                    checkout = this.paramsBusqueda.ffinal;
                    params = {
                        idBroker: idBroker,
                        broker_book: room.broker_book,
                        checkin: checkin,
                        checkout: checkout
                    };
                    break;
                case 'BOOK':
                case 'ESBD':
                case 'W2MT':
                case 'LOTS':
                    checkin = this.paramsBusqueda.finicio;
                    checkout = this.paramsBusqueda.ffinal;
                    params = {
                        idBroker: idBroker,
                        broker_book: room.broker_book,
                        checkin: checkin,
                        checkout: checkout,
                        outlet: room.outlet
                    };
                    break;
                case 'DING':
                    checkin = this.paramsBusqueda.finicio;
                    checkout = this.paramsBusqueda.ffinal;
                    params = {
                        idBroker: idBroker,
                        broker_book: room.broker_book,
                        checkin: checkin,
                        checkout: checkout,
                        outlet: room.outlet
                    };
                    break;
                default:
                    break;
            }
            room.semanas = [];
            this.hotelService.getHotelRatesDetails(params).subscribe(res => {
                room.semanas = res.data;
                room.detalle = true;
            });
        } else {
            room.detalle = !room.detalle;
        }
    }

    GetHotelRateRulesUnificado(rateg, room) {
        this.hotelService.getHotelRatesDetails(rateg).subscribe(res => {
            room.semanas = res.data;
            room.detalle = true;
        });
    }

    toogleSpiner(i) {
        if (this.loading && this.index == i) {
            this.loading = false;
            this.index = undefined;
        } else {
            this.loading = true;
            this.index = i;
        }
    }

    vermenos(limite) {
        this.arrHotels[limite].limitRooms = 3;
    }

    isOpen(el, val, idHotel, broker, limite) {
        console.log('el', el);
        console.log('val', val);


        this.arrHotels[limite].limitRooms += 10;
        // limite.limitRooms += 10;

        var textVerMas;
        var textVerMenos;
        this.translate.get('hotel.ver-mas').subscribe((data: any) => { textVerMas = data; });
        this.translate.get('hotel.ver-menos').subscribe((data: any) => { textVerMenos = data; });
        var isvisible = document.getElementsByClassName(val + '-isv');
        var elements = document.getElementsByClassName(val + '-room');
        var btn = el + val;
        /* if (isvisible.length) { //si bloque esta visible el isOpen que el bloque de cuartos ya se desplego, por lo tanto va a hacer el collapse
            Array.from(isvisible).forEach(function (el) {
                el.className = 'row pb-2 ' + val + '-room collapse';
            });
            document.getElementById(btn).innerHTML = textVerMas;
            var elementoHotel = 'hotel-' + idHotel + '-' + broker;
            // this.scroller.scrollToAnchor(elementoHotel);
            document.getElementById(elementoHotel).scrollIntoView({
                behavior: "smooth",
                block: "center",
                inline: "nearest"
            });
        } else {  *///si no, despliega y pone boton en ver menos
        Array.from(elements).forEach(function (el) {
            el.className = 'row pb-2 ' + val + '-isv';
        });
        document.getElementById(btn).innerHTML = textVerMas;
        console.log('hotel =>', this.arrHotels[limite])
        // }
    }

    isOpenDestacado(el, val, idHotel, broker) {
        var textVerMas;
        var textVerMenos;
        this.translate.get('hotel.ver-mas').subscribe((data: any) => { textVerMas = data; });
        this.translate.get('hotel.ver-menos').subscribe((data: any) => { textVerMenos = data; });
        var isvisible = document.getElementsByClassName(val + '-isvi');
        var elements = document.getElementsByClassName(val + '-rooms');
        var btn = el + val;
        if (isvisible.length) {
            Array.from(isvisible).forEach(function (el) {
                el.className = 'row pb-2 ' + val + '-rooms collapse';
            });
            document.getElementById(btn).innerHTML = textVerMas;
            var elementoHotel = 'hotel-' + idHotel + '-' + broker;
            // this.scroller.scrollToAnchor(elementoHotel);
            document.getElementById(elementoHotel).scrollIntoView({
                behavior: "smooth",
                block: "center",
                inline: "nearest"
            });
        } else {
            Array.from(elements).forEach(function (el) {
                el.className = 'row pb-2 ' + val + '-isvi collapse show';
            });
            document.getElementById(btn).innerHTML = textVerMenos;
        }
    }

    reservaModal(datoshotel, fechas, room) {
        if (room.idHotel) {
            var idhh = room.idHotel + '-' + room.datosroom.idRoom;
        } else {
            var idhh = datoshotel.hotel_id + '-' + room.info.id;
        }
        let unico = idhh;
        this.toogleSpiner(unico);
        var data = {
            datoshotel: datoshotel,
            fechas: fechas,
            datosroom: room
        };
        if (room.idHotel) {
            this.getPoliticasCancelacion(data);
        } else {
            this.getPoliticasCancelacionUnificado(data);
        }
    }

    getPoliticasCancelacion(data) {
        var datosroom = data.datosroom;
        var idBroker = data.datosroom.idBroker;
        var hotel = data.datoshotel.brokers[0];
        hotel = hotel.split('-');
        var idHotel = hotel[0];
        this.sessionservice.session().subscribe(user => {
            this.sessionservice.getSession().subscribe(response => {
                if (response) {
                    let permisosdecode = JSON.parse(response);
                    this.permisosgastos = permisosdecode.gastos_cancelacion;
                }
            });
        });
        var $permisos_gastoCan = this.permisosgastos;
        var $permisoGastosCancelacion = 0;
        var $json;
        if ($permisos_gastoCan !== 'undefined') {
            $permisoGastosCancelacion = $permisos_gastoCan;
        }
        // this.spinnerService.show();
        this.showloader();
        switch (idBroker) {
            case 'DING':
                $json = {
                    idBroker: idBroker,
                    checkin: data.fechas.finicioSql,
                    checkout: data.fechas.ffinalSql,
                    book: data.datosroom.broker_book,
                    outlet: data.datosroom.outlet,
                };
                this.hotelService.CheckHotelDetailRules($json).subscribe(r => {
                    this.hideLoader();
                    switch (r.status) {
                        case 'success':
                            data.hotel = r.data;
                            var $politicas = r.data.hotel;
                            r = this.msgPoliticas($politicas.politicas, data.datosroom, data.fechas, data);

                            if (r == false) {
                                this.doReservaBroker(data);
                            }
                            break;
                        case 'error':
                            this.sweetAlertService.info('Póliticas de Cancelación', 'Error al intentar obtener las póliticas de gastos de cancelación, por favor intente nuevamente. Error: ' + r.data.msg);
                            break;
                    }
                    let ding = data.datosroom.idHotel + '-' + data.datosroom.datosroom.idRoom;
                    this.toogleSpiner(ding);
                });
                break;
            default:
                this.hideLoader();
                var politicas = datosroom.politicas;
                if (politicas.aplica_politicas == 1) {
                    this.msgPoliticas(politicas, data.datosroom, data.fechas, data);
                    return;
                }
                let unico = data.datosroom.idHotel + '-' + data.datosroom.datosroom.idRoom;
                this.toogleSpiner(unico);
                this.doReservaBroker(data);
                break;
        }
    }

    getPoliticasCancelacionUnificado(data) {
        this.showloader();
        var idBroker = data.datoshotel.broker;
        var rate_key = data.datosroom.rates.rate.rate_key;
        this.sessionservice.session().subscribe(user => {
            this.sessionservice.getSession().subscribe(response => {
                if (response) {
                    let permisosdecode = JSON.parse(response);
                    this.permisosgastos = permisosdecode.gastos_cancelacion;
                }
            });
        });
        var $permisos_gastoCan = this.permisosgastos;
        var $permisoGastosCancelacion = 0;
        if ($permisos_gastoCan !== 'undefined') {
            $permisoGastosCancelacion = $permisos_gastoCan;
        }

        var $json = {
            broker: idBroker,
            rate_key: rate_key
        };
        this.hotelService.CheckHotelDetailRules($json).subscribe(r => {
            this.hideLoader();
            switch (r.status) {
                case 'success':
                    if (r.data.hotel.update == 1) {
                        var dataHotel = r.data.hotel;
                        for (let [key, value] of Object.entries(dataHotel)) {
                            data.datoshotel[key] = value;
                        }
                    }
                    if (r.data.mealplan.update == 1) {
                        var dataMealPlan = r.data.mealplan;
                        for (let [key, value] of Object.entries(dataMealPlan)) {
                            data.datosroom.mealplan[key] = value;
                        }
                    }
                    if (r.data.room.update == 1) {
                        var dataRoom = r.data.room;
                        for (let [key, value] of Object.entries(dataRoom)) {
                            data.datosroom.info[key] = value;
                        }
                    }
                    if (r.data.politics.update == 1) {
                        var dataPolitics = r.data.politics;
                        for (let [key, value] of Object.entries(dataPolitics)) {
                            data.datosroom.politics[key] = value;
                        }
                    }
                    if (r.data.rates.update == 1) {
                        var dataRate = r.data.rates;
                        var exchange_nuevo;
                        var exchange_viejo = data.datosroom.rates.rate.exchange;
                        var importe_viejo = data.datosroom.rates.rate.public;
                        let showMSG = false;
                        for (let [key, value] of Object.entries(dataRate)) {
                            data.datosroom.rates.rate[key] = value;
                            if (key == 'public') {
                                showMSG = true;
                            }
                            if (key == 'currrency') {
                                exchange_nuevo = value;
                            } else {
                                exchange_nuevo = exchange_viejo;
                            }
                        }

                        var importe_nuevo_net = data.datosroom.rates.rate.net * exchange_nuevo.exchange_rate;
                        var importe_nuevo_public = data.datosroom.rates.rate.public * exchange_nuevo.exchange_rate;

                        data.datosroom.rates.rate.net = importe_nuevo_net;
                        data.datosroom.rates.rate.public = importe_nuevo_public;
                        data.datosroom.rates.exchange = exchange_nuevo;

                        data.hotel = data;
                        var $politicas = data.datosroom.politics;

                        var data_changes = {
                            old_amount: importe_viejo,
                            old_exchange: exchange_viejo,
                            new_amount: importe_nuevo_public,
                            new_exchange: exchange_nuevo
                        };

                        var antiguaTarifaRedondeada = Math.ceil(data_changes.old_amount * data_changes.old_exchange.exchange_rate);
                        var nuevaTarifaRedondeada = Math.ceil(data_changes.new_amount * data_changes.new_exchange.exchange_rate);

                        if (showMSG) {
                            var message = 'Se ha recibido una actualizazión de tarifa de ' + formatCurrency(antiguaTarifaRedondeada, 'en-EN', '', '1') + ' ' + this.currencyAgencia + ' a ' + formatCurrency(nuevaTarifaRedondeada, 'en-EN', '', '1') + ' ' + this.currencyAgencia;
                            this.sweetAlertService.info('¡Ha cambiado la tarifa!', message);
                        }

                        if ($politicas.apply == 1 || $politicas.apply == 2) {
                            this.msgPoliticasUnificado($politicas, data.datosroom, data.fechas, data);
                            return;
                        }
                        if ($politicas.apply == 0) {
                            this.doReservaBrokerUnificado(data);
                            return;
                        }

                    } else {
                        data.hotel = data;
                        var $politicas = data.datosroom.politics;
                        if ($politicas.apply == 1 || $politicas.apply == 2) {
                            this.msgPoliticasUnificado($politicas, data.datosroom, data.fechas, data);
                            return;
                        }
                        if ($politicas.apply == 0) {
                            this.doReservaBrokerUnificado(data);
                            return;
                        }
                    }
                    break;
                case 'error':
                    this.sweetAlertService.info('Póliticas de Cancelación', 'Error al intentar obtener las póliticas de gastos de cancelación, por favor intente nuevamente. Error: ' + r.data.msg);
                    break;
            }
            let ding = data.datoshotel.code + '-' + data.datosroom.mealplan.id;
            this.toogleSpiner(ding);
        }, error => {
            // this.spinnerService.hide();
            this.hideLoader();
        });
    }

    msgPoliticasUnificado(politicas, room, fechas, data) {
        var msg;
        this.translate.get('hotel.confirm_continuar').subscribe((data: any) => { msg = data; });
        var tarifa;
        this.translate.get('hotel.tarifa-noReembolsable').subscribe((data: any) => { tarifa = data; });
        var comunicarse;
        this.translate.get('hotel.comunicarse').subscribe((data: any) => { comunicarse = data; });
        var gastosCancelacion;
        this.translate.get('hotel.gastos-cancelacion').subscribe((data: any) => { gastosCancelacion = data; });
        var seleccionar_opcion;
        this.translate.get('hotel.seleccionar_opcion').subscribe((data: any) => { seleccionar_opcion = data; });
        var $noreembolsable = false;
        var $gastosCancelacion = false;
        var $politicasDescripcion = '';
        var $Habitacionnoexiste = false;
        this.reserva_ = data;
        var $permisos_gastoCan = this.permisosgastos;

        $politicasDescripcion = politicas.description;
        switch (politicas.id) {
            case 1:
                $noreembolsable = true;
                break;
            case 2:
                $gastosCancelacion = true;
                break;
        }

        var $permisosGastosCancelacion = 0;
        if (typeof ($permisos_gastoCan) !== 'undefined') {
            $permisosGastosCancelacion = $permisos_gastoCan;
        }
        if ($noreembolsable) {
            var det = 'NO REEMBOLSABLE';
            if ($permisosGastosCancelacion == 1) {
                var det = 'POLITICAS: ' + $politicasDescripcion + msg;
                this.sweetAlertService.confirm({
                    title: tarifa,
                    text: det,
                    confirmButtonText: 'Continuar'
                }, this.doReservaBrokerUnificado.bind(this, data));
                return true;
            }
            this.sweetAlertService.info(tarifa, '\n' + comunicarse);
            return true;
        }
        if ($gastosCancelacion) {
            var det = 'POLITICAS: ' + $politicasDescripcion + '\n' + msg;
            if ($permisosGastosCancelacion == 1) {
                var det = 'POLITICAS: ' + $politicasDescripcion + '\n' + msg;
                this.sweetAlertService.confirm({
                    title: gastosCancelacion,
                    text: det,
                    confirmButtonText: 'Continuar'
                }, this.doReservaBrokerUnificado.bind(this, data));
                return true;
            }
            this.sweetAlertService.info(gastosCancelacion, det + '\n' + comunicarse);
            return true;
        }
        if ($Habitacionnoexiste) {
            var det = 'La habitación selecciona ya no se encuentra disponible en el Broker. ';
            this.sweetAlertService.info('Error', det + seleccionar_opcion);
            return true;
        }
        return false;
    }

    msgPoliticas(politicas, room, fechas, data) {
        var msg;
        this.translate.get('hotel.confirm_continuar').subscribe((data: any) => { msg = data; });
        var tarifa;
        this.translate.get('hotel.tarifa-noReembolsable').subscribe((data: any) => { tarifa = data; });
        var comunicarse;
        this.translate.get('hotel.comunicarse').subscribe((data: any) => { comunicarse = data; });
        var gastosCancelacion;
        this.translate.get('hotel.gastos-cancelacion').subscribe((data: any) => { gastosCancelacion = data; });
        var seleccionar_opcion;
        this.translate.get('hotel.seleccionar_opcion').subscribe((data: any) => { seleccionar_opcion = data; });
        var continuar;
        this.translate.get('hotel.continuar').subscribe((data: any) => { continuar = data; });
        var idBroker = room.idBroker;
        var $room_nombre = room.datosroom.nombre.toUpperCase();
        var $search = '';
        var $noreembolsable = false;
        var $gastosCancelacion = false;
        var $politicasDescripcion = '';
        var $Habitacionnoexiste = false;
        this.reserva_ = data;

        var $permisos_gastoCan = this.permisosgastos;


        switch (idBroker) {
            case 'OMBE':
                $politicasDescripcion = politicas.descripcion;
                switch (politicas.id) {
                    case 1:
                        $noreembolsable = true;
                        break;
                    case 2:
                        $gastosCancelacion = true;
                        break;
                }
                break;
            case 'HTDO':
                $search = ('No Reembolsable').toUpperCase();
                $noreembolsable = $room_nombre.indexOf($search) > -1;
                $politicasDescripcion = politicas.descripcion;
                if (politicas.Id == 9) {
                    $gastosCancelacion = true;
                } else if (politicas.aplica_politicas == 1) {
                    $gastosCancelacion = true;
                }
                break;
            case 'RSTL':
                var $politicasCancelacion = '';
                for (let i of politicas.politicas) {
                    $politicasDescripcion += i + '<br>';
                }
                data.politicas_reserva = politicas;
                if (politicas.entra_en_gastos == 1) {
                    $gastosCancelacion = true;
                }
                if (politicas.dias_antes == 999 || politicas.dias_antes == 998 || politicas.dias_antes > 999) {
                    $gastosCancelacion = false;
                    $noreembolsable = true;
                }
                break;
            case 'HTBD':
                $politicasDescripcion = politicas.descripcion;
                switch (politicas.id) {
                    case 1:
                        $noreembolsable = true;
                        break;
                    case 2:
                        $gastosCancelacion = true;
                        break;
                }
                break;
            case 'BOOK':
            case 'ESBD':
            case 'W2MT':
            case 'LOTS':
                $politicasDescripcion = politicas.descripcion;
                switch (politicas.id) {
                    case 1:
                        $noreembolsable = true;
                        break;
                    case 2:
                        $gastosCancelacion = true;
                        break;
                }
                break;
            case 'DING':
                $politicasDescripcion = politicas.descripcion;
                switch (politicas.id) {
                    case 1:
                        $noreembolsable = true;
                        break;
                    case 2:
                        $gastosCancelacion = true;
                        break;
                }
                break;
            default:
                $gastosCancelacion = true;
                $politicasDescripcion = politicas.descripcion;
                break;
        }

        var $permisosGastosCancelacion = 0;
        if (typeof ($permisos_gastoCan) !== 'undefined') {
            $permisosGastosCancelacion = $permisos_gastoCan;
        }
        if ($noreembolsable) {
            var det = 'NO REEMBOLSABLE';
            if ($permisosGastosCancelacion == 1) {
                if (idBroker === 'RSTL') {
                    var fechaLimitePago = { fla: politicas.fecha_limite_agencia, flh: politicas.fecha_limite_hotel };
                    data.politicas_reserva = politicas;
                }
                var det = 'POLITICAS: ' + $politicasDescripcion + msg;
                this.sweetAlertService.confirm({
                    title: tarifa,
                    text: det,
                    confirmButtonText: continuar
                }, this.doReservaBroker.bind(this, data));
                return true;
            }
            this.sweetAlertService.info(tarifa, '\n' + comunicarse);
            return true;
        }
        if ($gastosCancelacion) {
            var det = 'POLITICAS: ' + $politicasDescripcion + '\n' + msg;
            if ($permisosGastosCancelacion == 1) {
                if (idBroker === 'RSTL') {
                    var fechaLimitePago = { fla: politicas.fecha_limite_agencia, flh: politicas.fecha_limite_hotel };
                    data.politicas_reserva = politicas;
                }
                var det = 'POLITICAS: ' + $politicasDescripcion + '\n ' + msg;
                this.sweetAlertService.confirm({
                    title: gastosCancelacion,
                    text: det,
                    confirmButtonText: 'Continuar'
                }, this.doReservaBroker.bind(this, data));
                return true;
            }
            this.sweetAlertService.info(gastosCancelacion, det + '\n' + comunicarse);
            return true;
        }
        if ($Habitacionnoexiste) {
            var det = 'La habitación selecciona ya no se encuentra disponible en el Broker. ';
            this.sweetAlertService.info('Error', det + seleccionar_opcion);
            return true;
        }
        if (idBroker == 'HTDO') {
            var gastos = this.checkgastoscancelacion(politicas, fechas);
            if (!gastos) {
                var det = 'POLITICAS: ' + $politicasDescripcion + '. ' + '\n ' + msg;
                if ($permisosGastosCancelacion == 1) {
                    this.sweetAlertService.confirm({
                        title: gastosCancelacion,
                        text: det,
                        confirmButtonText: 'Continuar'
                    }, this.doReservaBroker.bind(this, data));
                    // return true;
                }
                this.sweetAlertService.info(gastosCancelacion, det + '\n ' + comunicarse);
                // return true;
            }
        }
        return false;
    }

    checkgastoscancelacion($politicas, $fechas) {
        var checkin = moment($fechas.finicioSql, "YYYY-MM-DD");
        var hoy = moment();
        var diferencia = checkin.diff(hoy, "days");
        if (diferencia > $politicas.DaysToApplyCancellation) {
            return true;
        } else {
            return false;
        }
    }

    doReservaBrokerUnificado(data) {
        // console.log(data);
        let datoshotel = data.datoshotel;
        let datosroom = data.datosroom;
        let $fechas = this.fechas;
        let idBroker = datoshotel.broker;
        let idHotel = datoshotel.code;
        let politicas = data.datosroom.politics;
        let titularPrincipal = 0;

        if (typeof datoshotel.destination.nombre === 'undefined') {
            datoshotel.destination.nombre = '';
        }

        var $datoshotel = {
            idBroker: idBroker,
            hotel_id: idHotel,
            hotel_producto: data.datosroom.product,
            nombre_hotel: datoshotel.name,
            idCategoria: datoshotel.category.id,
            dirHotel: datoshotel.address,
            urlLogo: datoshotel.url_img,
            status: datoshotel.status.id,
            destino: datoshotel.destination.nombre,
            broker: idBroker
        }
        titularPrincipal = 1;
        return false;
        var $datosroom = {
            room_id: datosroom.info.id,
            nombre_room: datosroom.info.name,
            descripcion: datosroom.info.description,
            status: datosroom.status
        }
        var $datosplan = {
            plan_id: datosroom.mealplan.id,
            nombre_plan: datosroom.mealplan.name
        }
        var $paxs = [];
        var $tarifas = datosroom.rates;

        for (let pax of $tarifas.occupancies) {
            if (typeof (pax.occupancy.childs) == 'undefined') {
                pax.edadmenores = [];
            }
            if (typeof (pax.occupancy.juniors) == 'undefined') {
                pax.edadjuniors = [];
            }

            var $paxes = [];

            for (var a = 0; a < pax.occupancy.adults; a++) {
                let $paxItem = {
                    titulo: '',
                    nombres: '',
                    apellidos: '',
                    type: 'AD',
                    edad: '',
                };
                $paxes.push($paxItem);
            }

            var $total_menores = pax.occupancy.childs;
            for (let edad_menor of $total_menores) {
                let $paxItem = {
                    nombres: '',
                    apellidos: '',
                    type: 'CH',
                    edad: edad_menor
                };
                $paxes.push($paxItem);
            }

            var $pax = {
                adultos: pax.occupancy.adults,
                menores: pax.occupancy.childs,
                edadmenores: pax.edadmenores,
                juniors: pax.juniors,
                edadjuniors: pax.edadjuniors,
                extras: pax.extras,
                nombres: "",
                apellidos: "",
                observaciones: "",
                chk: false,
                titular_principal: titularPrincipal,
                importehab: pax.importe,
                importehab_neta: pax.importe_neta,
                importehab_neta_operador: pax.importe_neta_operador,
                tipotarifa: pax.tipotarifa,
                paxes: $paxes
            }
            $paxs.push($pax);
        }
        var $itemReserva = {
            fechas: $fechas,
            datoshotel: $datoshotel,
            datosroom: $datosroom,
            datosplan: $datosplan,
            paxs: $paxs,
            importe: $tarifas.rate.public,
            importe_neto: $tarifas.rate.net,
            importe_neta_operador: $tarifas.rate.net || $tarifas.rate.net,
            book: $tarifas.rate.rate_key,
            exchange: $tarifas.rate.exchange,
            politicas: politicas,
        }
        this.hotelService.setCurrentReserva($itemReserva);

        let objCache = {};
        for (const property in this.paramsCache) {
            objCache[property] = this.paramsCache[property];
        }
        if (typeof (this.paginacion.id) != 'undefined') {
            objCache['paginacion'] = JSON.stringify(this.paginacion);
        }
        if (typeof (this.filtrar) != 'undefined') {
            objCache['filtrar'] = JSON.stringify(this.filtrar);
        }
        this.router.navigate(['/booking-u'], { queryParams: objCache });
    }

    doReservaBroker(data) {
        var fechas = data.fechas;
        var datoshotel = data.datoshotel;
        var datosroom = data.datosroom;
        var $fechas = fechas;
        var idBroker = data.datosroom.idBroker;
        var idHotel = (typeof (datoshotel.hotel_id) == 'undefined') ? datoshotel.idHotel : datoshotel.hotel_id;
        /* for (let h of datoshotel.brokers) {
            var cadena = h.split('-');
            var broker = cadena[1];
            if (idBroker === broker) {
                idHotel = cadena[0]
            }
        } */
        var titularPrincipal = 0;

        /*  console.log(idHotel)
         return false; */
        if (typeof datoshotel.destino === 'undefined') {
            datoshotel.destino = '';
        }

        var $datoshotel = {
            idBroker: idBroker,
            hotel_id: idHotel,
            hotel_producto: data.datosroom.producto,
            nombre_hotel: datoshotel.nombre,
            idCategoria: datoshotel.categoria.idCategoria,
            dirHotel: datoshotel.direccion,
            urlLogo: datoshotel.url_logo,
            status: datoshotel.status.id,
            informacion_importante: datoshotel.info || '',
            hotel_politicas: datoshotel.politicas || '',
            destino: datoshotel.destino
        }
        if (
            idBroker === 'BOOK' ||
            idBroker === 'ESBD' ||
            idBroker === 'W2MT' ||
            idBroker === 'LOTS' ||
            idBroker === 'DING'
        ) {
            titularPrincipal = 1;
            $datoshotel['important_info'] = datoshotel.important_info;
        }
        var $datosroom = {
            room_id: datosroom.datosroom.idRoom,
            nombre_room: datosroom.datosroom.nombre,
            currency_divisa: datosroom.tarifas.divisa,
            descripcion: datosroom.datosroom.descripcion,
            status: datosroom.status
        }
        if (idBroker === 'OMBE') {
            $datoshotel['important_info'] = datoshotel.important_info;
            $datosroom['rate_plan_name'] = datosroom.datosroom.rate_plan_name;
        }
        var $datosplan = {
            plan_id: datosroom.datosplan.idPlan,
            nombre_plan: datosroom.datosplan.plan,
            id: datosroom.datosplan.id,
            bbPrice: datosroom.datosplan.bbPrice
        }
        var $paxs = [];
        var $tarifas = datosroom.tarifas;

        for (let pax of $tarifas.detalles) {
            if (typeof (pax.edadmenores) == 'undefined') {
                pax.edadmenores = [];
            }
            if (typeof (pax.edadjuniors) == 'undefined') {
                pax.edadjuniors = [];
            }

            var $paxes = [];
            if (
                idBroker === 'RSTL' ||
                idBroker === 'BOOK' ||
                idBroker === 'ESBD' ||
                idBroker === 'W2MT' ||
                idBroker === 'LOTS' ||
                idBroker === 'DING'
            ) {
                for (var a = 0; a < pax.adultos; a++) {
                    let $paxItem = {
                        titulo: '',
                        nombres: '',
                        apellidos: '',
                        type: 'AD',
                        edad: '',
                    };
                    $paxes.push($paxItem);
                }

                for (let edad_menor of pax.menores) {
                    let $paxItem = {
                        nombres: '',
                        apellidos: '',
                        type: 'CH',
                        edad: edad_menor
                    };
                    $paxes.push($paxItem);
                }
            }

            var $pax = {
                adultos: pax.adultos,
                menores: pax.menores,
                edadmenores: pax.edadmenores,
                juniors: pax.juniors,
                edadjuniors: pax.edadjuniors,
                extras: pax.extras,
                nombres: "",
                apellidos: "",
                observaciones: "",
                chk: false,
                titular_principal: titularPrincipal,
                importehab: pax.importe,
                importehab_neta: pax.importe_neta,
                importehab_neta_operador: pax.importe_neta_operador,
                tipotarifa: pax.tipotarifa,
                paxes: $paxes
            }
            $paxs.push($pax);
        }
        var $itemReserva = {
            fechas: $fechas,
            datoshotel: $datoshotel,
            datosroom: $datosroom,
            datosplan: $datosplan,
            paxs: $paxs,
            importe: $tarifas.total,
            importe_neto: $tarifas.total_neta,
            importe_neta_operador: $tarifas.total_neto_operador || $tarifas.total_neta,
            tipotarifa: $tarifas.descripcion,
            book: datosroom.broker_book,
            currency: $tarifas.divisa,
            politicas: datosroom.politicas,
            outlet: datosroom.outlet,
            checkRate: data.hotel//Para hotelbeds
        }

        let objCache = {};
        for (const property in this.paramsCache) {
            objCache[property] = this.paramsCache[property];
        }
        if (typeof (this.paginacion.id) != 'undefined') {
            objCache['paginacion'] = JSON.stringify(this.paginacion);
        }
        if (typeof (this.filtrar) != 'undefined') {
            objCache['filtrar'] = JSON.stringify(this.filtrar);
        }


        switch (idBroker) {
            case 'OMBE':
                $itemReserva['importe_neto_broker'] = $tarifas.total_neto_broker;
                $itemReserva['importe_neto_operador'] = $tarifas.total_neto_operador;
                this.hotelService.setCurrentReserva($itemReserva);
                // this.router.navigate(['/booking-omnibees']);
                this.router.navigate(['/booking-omnibees'], { queryParams: objCache });
                break;
            case 'BOOK':
            case 'ESBD':
            case 'W2MT':
            case 'LOTS':
                this.hotelService.setCurrentReserva($itemReserva);
                // this.router.navigate(['/booking-juniper']);
                this.router.navigate(['/booking-juniper'], { queryParams: objCache });
                break;
            case 'DING':
                // console.log('item res', $itemReserva)
                this.hotelService.setCurrentReserva($itemReserva);
                // this.router.navigate(['/booking-dingus']);
                this.router.navigate(['/booking-dingus'], { queryParams: objCache });
                break;
            default:
                this.hotelService.setCurrentReserva($itemReserva);
                // this.router.navigate(['/booking']);
                this.router.navigate(['/booking'], { queryParams: objCache });
                break;
        }
    }

    camposfiltros(arrefil, dato) {
        /*
        **
          dato:1 => planes de alimento
          dato:2 => categorias
        **
        */
        if (typeof (this.filtrar) != 'undefined') {
            if (dato == 1) {
                for (let idplan of this.filtrar.planes) {
                    var plan_index = arrefil.findIndex(val => val.idPlan[0] == idplan);
                    arrefil[plan_index].selected = true;
                }
            } else {
                for (let idcategoria of this.filtrar.categorias) {
                    var categoria_index = arrefil.findIndex(val => val.idCategoria[0] == idcategoria);
                    arrefil[categoria_index].selected = true;
                }
            }
        }


        const modalRef = this.modalService.open(FiltrosComponent, {
            size: 'sm'
        });
        modalRef.componentInstance.arrefil = arrefil;
        modalRef.componentInstance.tipo = dato;
        modalRef.componentInstance.valueChange.subscribe(($e) => {
            // console.info('valores devueltos',$e);
            this.currentPage = 1;
            this.addTags($e);
            return false;
        })
    }

    getInfoHotel(hotelBroker, hotel, tipo) {
        //Detalle con la discrepacia de estructura en en json de respuesta
        var idOperador = this.idOpe;
        if (tipo == 0) {
            var dataBroker = hotelBroker[0].split('-');
            var idBroker = dataBroker[1];
            var idHotel = dataBroker[0];
        } else {
            var idBroker = hotelBroker;
            var idHotel = hotel;

        }
        var json = {
            broker: idBroker,
            idHotel: idHotel,
            operador: idOperador
        };
        this.hotelService.getInfoHotel(json).subscribe(res => {
            if (res != '' || res != null) {
                if (tipo == 0) {
                    const modalInfo = this.modalService.open(InfoHotelComponent, { size: 'lg' });
                    modalInfo.componentInstance.infoHoteljson = res;
                } else {
                    const modalInfo = this.modalService.open(InfoHotelUComponent, { size: 'lg' });
                    modalInfo.componentInstance.infoHoteljson = res.data;
                }
            } else {
                this.sweetAlertService.info('¡Sin datos de hotel!', '\n Discúlpenos, el proveedor no tiene cargado información.');
            }

        });
    }

    onHotelChange(val) {
        this.filterHotelChanged.next(val);
    }

    onSubmit(val, type) {
        var busquedaDirecta = false;
        switch (type) {
            case 'hotel':
                this.addTags(val);
                break;
            case 'price':
                busquedaDirecta = true;
                this.filtrar.order = val;

                break;
            case 'broker':
                busquedaDirecta = true;
                this.filterBrokers = val;
                let arrfinalbro = [];
                switch (this.filterBrokers) {
                    case 1:
                        for (let broker of this.arrbrokers) {
                            if (broker.status == 'CO') {
                                for (let bro of broker.brokers) {
                                    arrfinalbro.push(bro.idBroker);
                                }
                            }
                        }
                        for (let broker of this.arrbrokers) {
                            if (broker.status == 'PP') {
                                for (let bro of broker.brokers) {
                                    arrfinalbro.push(bro.idBroker);
                                }
                            }
                        }
                        break;
                    case 2:
                        for (let broker of this.arrbrokers) {
                            if (broker.status == 'CO') {
                                for (let bro of broker.brokers) {
                                    arrfinalbro.push(bro.idBroker);
                                }
                            }
                        }
                        break;
                    case 3:
                        for (let broker of this.arrbrokers) {
                            if (broker.status == 'PP') {
                                for (let bro of broker.brokers) {
                                    arrfinalbro.push(bro.idBroker);
                                }
                            }
                        }
                        break;
                    default:
                        for (let broker of this.arrbrokers) {
                            if (broker.status == 'CO') {
                                for (let bro of broker.brokers) {
                                    arrfinalbro.push(bro.idBroker);
                                }
                            }
                        }
                        for (let broker of this.arrbrokers) {
                            if (broker.status == 'PP') {
                                for (let bro of broker.brokers) {
                                    arrfinalbro.push(bro.idBroker);
                                }
                            }
                        }
                        break;
                }
                this.filtrar.brokers = arrfinalbro;
                break
        }

        if (busquedaDirecta) {
            this.paramsBusqueda.filtrar = this.filtrar;
            this.paginacion.page = 1;
            this.paramsBusqueda.paginacion = this.paginacion;
            this.searchHotles(this.paramsBusqueda, 0);
        }
    }

    cotizar(hotel, fechas, room) {
        //Detalle con el formato y nodos para enviar a backend con unificacion V2
        var paxs;
        var idBroker;
        var idHotel;
        var name;
        var direccion;
        var categoria;
        if (hotel.code) { //UNIFICADO V2
            fechas = {
                finicioSql: this.fechas.checkin,
                ffinalSql: this.fechas.checkout
            };
            idHotel = hotel.code;
            name = hotel.name;
            direccion = hotel.address;
            categoria = hotel.category.id;
            paxs = this.paramsBusqueda.habitaciones;
            idBroker = hotel.broker;
        } else { // NORMALES
            if (hotel.broker) {
                idHotel = hotel.hotel_id;
                idBroker = hotel.broker;
                name = hotel.name;
                direccion = hotel.address;
                categoria = hotel.category.id;
                paxs = this.paramsBusqueda.habitaciones;
            } else {
                var dataBroker = hotel.brokers[0].split('-')
                idHotel = dataBroker[0];
                idBroker = dataBroker[1];
                name = hotel.nombre;
                direccion = hotel.direccion;
                categoria = hotel.categoria.idCategoria;
                paxs = room.tarifas.detalles;
            }
        }
        let hotelJson = {
            'hotel_id': idHotel,
            'idBroker': idBroker,
            'hotel_nombre': name,
            'hotel_direccion': direccion,
            'hotel_categoria': categoria
        }
        let paxsArray = [];
        for (const p of paxs) {
            var edadMenores = [];
            var edadJuniors = [];
            if (hotel.broker) {
                for (const e of p.edadmenores) {
                    edadMenores.push({ edad: e.edad });
                }
                p.menores = p.edadmenores;
                p.juniors = [];
                p.extras = 0;
            } else {
                for (const e of p.menores) {
                    edadMenores.push({ edad: e });
                }
                for (const e of p.juniors) {
                    edadJuniors.push({ edad: e });
                }
            }
            paxsArray.push({
                adultos: p.adultos,
                menores: p.menores.length,
                juniors: p.juniors.length,
                extras: p.extras,
                edadjuniors: edadJuniors,
                edadmenores: edadMenores
            });
        }

        let total = 0;
        let divisa;
        let datos_room;
        let plan;
        let currency_user = this.user;

        if (hotel.code) { // UNIFICACION V2
            total = room.rates.rate.public;
            divisa = {
                currency: room.rates.rate.exchange.currency,
                currency_name: room.rates.rate.exchange.currency,
                tasa_cambio: room.rates.rate.exchange.exchange_rate
            };
            if (divisa.tasa_cambio == null || divisa.tasa_cambio == 0) {
                var tasaCambioFB = this.currencies.find(function (tc) { return tc.currency_name == currency_user.currency });
                divisa.tasa_cambio = tasaCambioFB.tasa_cambio;
            }

            datos_room = {
                descripcion: room.info.description,
                idRoom: room.info.id,
                nombre: room.info.name
            };
            plan = {
                idPlan: room.mealplan.id,
                plan: room.mealplan.name
            };
        } else {
            if (room.tarifas.divisa.tasa_cambio === null || room.tarifas.divisa.tasa_cambio == 0) {
                var tasaCambioFB = this.currencies.find(function (tc) { return tc.currency_name == currency_user.currency });
                room.tarifas.divisa.tasa_cambio = tasaCambioFB.tasa_cambio;
            }

            total = room.tarifas.total;
            divisa = room.tarifas.divisa;
            datos_room = room.datosroom;
            plan = room.datosplan;
        }

        let item = {
            'paxs': paxsArray,
            'fechas': fechas,
            'importe': total,
            'divisa': divisa,
            'hotel': hotelJson,
            'room': datos_room,
            'plan': plan,
        }
        // return false
        this.cotizacionesService.saveCotizaciones(item).subscribe(r => {
            this.cotizaciones_novistas += 1;
            this.cotizacionesService.setCotizacionesNoVistas(this.cotizaciones_novistas);
            this.sweetAlertService.success(r.title, r.msg);
        });
    }

    // SCROLL TO TOP
    scrollToTop() {
        (function smoothscroll() {
            var currentScroll = document.documentElement.scrollTop || document.body.scrollTop;
            if (currentScroll > 0) {
                window.requestAnimationFrame(smoothscroll);
                window.scrollTo(0, currentScroll - (currentScroll / 5));
            }
        })();
    }

    checkDescripcionLength(descripcion) {
        this.isReadMore = (descripcion.length < 100);
        return descripcion;
    }

    checkDescripcionHotelLength(descripcion) {
        this.isReadMore = (descripcion.length < 150);
        return descripcion;
    }

    filtrosAplicados(filtros, filtrar) {
        if (this.tags.length <= 0) {
            if (filtrar.planes.length > 0) {
                let tagPlan;
                for (let id of filtrar.planes) {
                    tagPlan = filtros.planesdisponibles.find(function (np) { return np.idPlan[0] == id });
                    this.tags.push({ id: tagPlan.idPlan[0], nombre: tagPlan.plan, type: 'planes' });
                    // this.addTag(tagPlan.plan);
                }
            }

            if (filtrar.categorias.length > 0) {
                let tagCategoria;
                for (let id of filtrar.categorias) {
                    tagCategoria = filtros.categoriasdisponibles.find(function (tc) { return tc.idCategoria[0] == id });
                    this.tags.push({ id: tagCategoria.idCategoria[0], nombre: tagCategoria.categoria, type: 'categorias' });
                    // this.addTag(tagCategoria.categoria);
                }
            }

            if (filtrar.hotel != '') {
                this.tags.push({ id: 0, nombre: filtrar.hotel, type: 'hotel' })
            }
        }
    }

    addTags(filtros) {
        var tag;
        var x;
        if (filtros.type == 1) {
            x = this.tags.filter(element => element.type === "categorias");
        } else {
            x = this.tags.filter(element => element.type === "planes");
        }
        this.tags = x;
        if (Array.isArray(filtros)) {
            for (let filtro of filtros) {
                if (typeof (filtro.selected) != 'undefined' && filtro.selected == true) {
                    if (typeof (filtro.idPlan) != 'undefined') {
                        tag = { id: filtro.idPlan[0], nombre: filtro.plan, type: 'planes' }
                    } else {
                        tag = { id: filtro.idCategoria[0], nombre: filtro.categoria, type: 'categorias' }
                    }
                    if (this.tags.filter(value => value.id == tag.id && value.type == tag.type).length <= 0) {
                        this.tags.push(tag)
                    }
                }
                /* if (typeof (filtro.selected) != 'undefined' && filtro.selected == false) {
                    if (typeof (filtro.idPlan) != 'undefined') {
                        tag = { id: filtro.idPlan[0], nombre: filtro.plan, type: 'planes' }
                    } else {
                        tag = { id: filtro.idCategoria[0], nombre: filtro.categoria, type: 'categorias' }
                    }
                    var erasedTag = this.tags.findIndex(value => value.id == tag.id && value.type == tag.type);
                    //según la nueva implementacion esto no se utiliza producto a que se reinician los valores cada filtrado
                    this.tags.splice(erasedTag, 1);
                } */
            }
        } else {
            tag = { id: 0, nombre: filtros, type: 'hotel' };
            if (filtros != '') {
                if (this.tags.filter(tag => tag.type == 'hotel').length <= 0) {
                    this.tags.push(tag)
                } else {
                    var tagHotel = this.tags.findIndex(h => h.type == 'hotel')
                    this.tags[tagHotel].nombre = filtros;
                }
            } else {
                var tagHotel = this.tags.findIndex(h => h.type == 'hotel')
                this.tags.splice(tagHotel, 1);
            }
        }

        this.ejecutarFiltrado();
    }

    removeTags(tag) {
        var erasedTag = this.tags.findIndex(value => value.id == tag.id && value.type == tag.type);
        this.tags.splice(erasedTag, 1);
        this.ejecutarFiltrado();
    }

    ejecutarFiltrado() {
        this.filtrar.planes = [];
        this.filtrar.categorias = [];
        this.filtrar.hotel = '';

        for (let f of this.tags) {
            if (f.type == 'planes') {
                this.filtrar.planes.push(f.id);
            }
            if (f.type == 'categorias') {
                this.filtrar.categorias.push(f.id)
            }
            if (f.type == 'hotel') {
                this.filtrar.hotel = f.nombre
            }
        }
        this.paramsBusqueda.filtrar = this.filtrar;
        this.paginacion.page = 1;
        this.paramsBusqueda.paginacion = this.paginacion;
        this.searchHotles(this.paramsBusqueda, 0);
    }

}