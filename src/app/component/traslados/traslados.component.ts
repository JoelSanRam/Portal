import { Component, OnInit, ViewChild, Injectable } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { TrasladosService, AuthenticationService, SharedService, AgenciaService } from "@app/services";
import { SweetalertService } from '@app/services/sweetalert.service';
import { filter, min, max, sortBy, uniq, includes, find, get, pull } from "lodash-es";
import { FirebaseService } from '@app/services/firebase/firebase.service';
import { formatCurrency } from '@angular/common';
import { User } from "@app/models";
import { GoogleMap } from '@angular/google-maps'
import { NgxSpinnerService } from "ngx-spinner";
import { TranslateService } from '@ngx-translate/core';
import { LottieService } from '@app/services/lottie.service';
import { AppComponent } from '@app/app.component';

declare const google: any;
@Component({
  selector: 'traslados',
  templateUrl: './traslados.component.html',
  styleUrls: [],
})
@Injectable({
  providedIn: 'root'
})
export class TrasladosComponent implements OnInit {
  @ViewChild(GoogleMap, { static: false }) map: GoogleMap
  currentUser: User;
  currencies;
  agencia;
  currency;
  paramsBusqueda; //parametros de busqueda
  returnUrl: string;
  centerMap;
  markerMap;
  user;


  traslados_compartidos; // params prueba
  traslados_privados; //params prueba
  traslados;
  encontrados = 0; //numero de resultados encontrados
  params; // parametros de localstorage
  mapTraslados;
  zonas;
  polygons;
  cct = [];
  placeDestination;

  origen = {
    lat: 0,
    lng: 0
  };
  destino = {
    lat: 0,
    lng: 0
  };

  zoom = 8
  markers = [];
  center = google.maps.LatLngLiteral;
  options: google.maps.MapOptions = {
    zoomControl: false,
    scrollwheel: false,
    disableDoubleClickZoom: true,
    maxZoom: 15,
    minZoom: 8,
  }

  datosHotel;
  datosAeropuerto;
  today = new Date(Date.now());
  imgruta;
  permisos_gastoCan;
  url_loader;
  constructor(
    private trasladosService: TrasladosService,
    public sweetAlertService: SweetalertService,
    private router: Router,
    private authenticationService: AuthenticationService,
    private fs: FirebaseService,
    private sharedService: SharedService,
    private spinnerService: NgxSpinnerService,
    public agenciaService: AgenciaService,
    private activatedRoute: ActivatedRoute,
    private translate: TranslateService,
    private lottieService: LottieService,
    private appComponent: AppComponent
  ) {
    let idagencia = localStorage.getItem('access_agen');
    this.authenticationService.currentUser.subscribe(x => this.currentUser = x);
    this.permisos_gastoCan = this.currentUser.permisos.gastos_cancelacion;
    this.sharedService.usuarioObserver.subscribe(user => {
      this.user = user;
    });
    this.fs.currencies.subscribe(data => {
      console.log(data);
      var curr = [];
      Object.keys(data).forEach(function (key) {
        curr.push(data[key]);
      });
      this.currencies = curr;
    });
    this.imgruta = '../../../assets/img/spinners/tarifas.gif?' + this.today;
    this.agenciaService.getAgencia(idagencia).subscribe(agencia => {
      this.sharedService.setAgencia(agencia);
      this.agencia = agencia;
      this.currency = this.agencia.currency;

    });
    this.activatedRoute.queryParams.subscribe(params => {
      if (this.router.getCurrentNavigation().extras.state) {
        this.params = this.router.getCurrentNavigation().extras.state.paramsDispoTras;
      }
    });
    this.authenticationService.getLang().subscribe(res => {
      translate.setDefaultLang(res);
    });
    this.authenticationService.setTypeLoader('defaul');
  }

  ngOnInit() {
    this.authenticationService.getTypeLoader().subscribe((res) => {
      if (res != undefined) {
        this.url_loader = res
      }
    })
    
    navigator.geolocation.getCurrentPosition((position) => {
      this.center = {
        lat: position.coords.latitude,
        lng: position.coords.longitude,
      }
    })
    this.returnUrl = this.activatedRoute.snapshot.queryParams['returnUrl'] || '/traslados';
    this.sharedService.getParamsBTracitur().subscribe(params_t => {
      if (params_t) {

        this.params = params_t;

        if (this.params.tipoTrasladoTransporte == 'AH' || this.params.tipo_viaje == 'round_trip') {
          this.datosHotel = {
            nombre: this.params.destino.name,
            direccion: this.params.destino.address,
            geo: this.params.destino.geometry.location
          }

          this.datosAeropuerto = {
            nombre: this.params.origen.nombre,
            direccion: "",
            geo: this.params.origen.geometry.location
          }
        } else {
          this.datosHotel = {
            nombre: this.params.origen.name,
            direccion: this.params.origen.address,
            geo: this.params.origen.geometry.location
          }

          this.datosAeropuerto = {
            nombre: this.params.destino.nombre,
            direccion: "",
            geo: this.params.destino.geometry.location
          }
        }
        this.searchTraslado(this.params);
      }
    })

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

  calculateTDC(tarf, div, tc = 0) {
    var divisa = div;
    var total = tarf;
    if (!tc) {
      var currency = find(this.currencies, function (current_c) {
        return current_c.currency_name == divisa;
      });
      tc = currency.tasa_cambio;
    }
    var total_currency = total * tc;
    var html = '';
    if (total_currency == 0) {
      html = '<span class="text-blue">GRATIS</span>';
    } else {
      html = '$' + formatCurrency(total_currency, 'en-EN', '', '1') + ' <span class="text-orange">' + div + '</span>';
    }
    return html;
  }

  priceSince(tarf, div, tc = 0) {
    var divisa = div;
    var total = tarf;
    if (!tc) {
      var currency = find(this.currencies, function (current_c) {
        return current_c.currency_name == divisa;
      });
      tc = currency.tasa_cambio;
    }
    var total_currency = total * tc;
    var html = '';
    html = ' <span class="text-orange">' + this.user.currency + '</span> ' + '<span class="text-blue">$' + formatCurrency(total_currency, 'en-EN', '', '1') + '</span>';
    return html;
  }

  busquedatraslado() {
    /* this.sharedService.getParamsBTracitur().subscribe(r => {
    })
    return true; */
  }

  searchTraslado(params) {
    //tratado de parms de busqueda
    // this.spinnerService.show();
    this.showloader();
    var origen = {
      lat: params.origen.geometry.location.lat,
      lng: params.origen.geometry.location.lng,
      type: 'origen'
    }
    var destino = {
      lat: params.destino.geometry.location.lat,
      lng: params.destino.geometry.location.lng,
      type: 'destino'
    }

    this.mapTraslados = {
      origen: origen,
      destino: destino
    }

    var markers = [
      {
        lat: params.origen.geometry.location.lat,
        lng: params.origen.geometry.location.lng
      },
      {
        lat: params.destino.geometry.location.lat,
        lng: params.destino.geometry.location.lng
      }
    ];

    /* console.info('zonas',this.params.lugar.idDestino); */

    this.loadMarkers(markers);
    this.getZonasAll(params.lugar.idDestino);

    this.placeDestination = {
      origen: [],
      destino: []
    };

  }

  prebookForm(data) {
    var radultos = data.rooming.adultos;
    var rmenores = data.rooming.menores;
    var rinfantes = data.rooming.infantes;
    var rmayores = data.rooming.mayores;
    var rangeAdultos = [];
    var rangeAdultosMayores = [];
    var rangeInfantes = [];
    var rangeMenores = [];
    var rangeInfantesAges = [];
    var rangeMenoresAges = [];
    var maxAdt = 20;
    var maxAdM = 20;
    var maxInf = 10;
    var maxMen = 10;
    var mayores = data.occupancyRules.mayores;
    var infantes = data.occupancyRules.infantes;
    var menores = data.occupancyRules.menores;
    var ocupmin = data.occupancyRules.ocupmin;
    var minAdt = (typeof data.occupancyRules.ocupmin != "undefined") ? (data.occupancyRules.adultos == '1') ? 0 : parseInt(ocupmin) : 1;
    var minRangeInf = data.occupancyRules.edadinfantemin;
    var maxRangeInf = data.occupancyRules.edadinfantemax;
    var minRangeMen = data.occupancyRules.edadmenormin;
    var maxRangeMen = data.occupancyRules.edadmenormax;
    var agesRanges = [];
    for (var index = minAdt; index <= maxAdt; index++) {
      rangeAdultos.push(index.toString());
    }
    for (var index = 0; index <= maxAdM; index++) {
      rangeAdultosMayores.push(index.toString());
    }
    for (var index = 0; index <= maxInf; index++) {
      rangeInfantes.push(index.toString());
    }
    for (var index = 0; index <= maxMen; index++) {
      rangeMenores.push(index.toString());
    }
    for (var index = parseInt(minRangeInf); index <= parseInt(maxRangeMen); index++) {
      rangeInfantesAges.push(index.toString());
    }
    for (var index = parseInt(minRangeMen); index <= parseInt(maxRangeMen); index++) {
      rangeMenoresAges.push(index.toString());
    }
    var ocupancyOptions = {
      "ocupmin": (typeof data.occupancyRules.ocupmin != 'undefined') ? data.occupancyRules.ocupmin : 1,
      "ocupmax": (typeof data.occupancyRules.ocupmax != 'undefined') ? data.occupancyRules.ocupmax : 3,
      "adultos": {
        "options": rangeAdultos
      },
      "mayores": {
        "active": mayores,
        "options": rangeAdultosMayores
      },
      "infantes": {
        "active": infantes,
        "options": rangeInfantes,
        "option_ages": rangeInfantesAges
      },
      "menores": {
        "active": menores,
        "options": rangeMenores,
        "optionas_ages": rangeMenoresAges
      }
    }
    data.book = {
      info: data.info,
      politicas: data.politicas,
      consumer:data.consumer,
      wholesaler:data.wholesaler,
      rooming: {
        adultos: radultos.toString(),
        mayores: rmayores.toString(),
        infantes: rinfantes.toString(),
        menores: rmenores.toString(),
        
      },
      ocupancyOptions: ocupancyOptions,
      tarifas: data.tarifas,
      total: {
        currency: data.tarifas.currency,
        neto: 0,
        publico: 0
      },
      datosHotel: data.datosHotel,
      datosAeropuerto: data.datosAeropuerto
    };
    data.prebook = !data.prebook;
    this.calculateTotal(data.book);
  }

  calculateTotal(book) {
    var adultoMayorActive = book.ocupancyOptions.mayores.active;
    var infantesActive = book.ocupancyOptions.infantes.active;
    var menoresActive = book.ocupancyOptions.menores.active;

    var tarifas = book.tarifas.publica;
    var tarifasNetas = book.tarifas.neta;

    var nAdultos = parseInt(book.rooming.adultos);
    var nMayores = parseInt(book.rooming.mayores);
    var nInfantes = parseInt(book.rooming.infantes);
    var nMenores = parseInt(book.rooming.menores);

    var pAdulto = tarifas.adulto;
    var pAdultoMayor = tarifas.mayor;
    var pInfante = tarifas.infante;
    var pMenor = tarifas.menor;

    var pnAdulto = tarifasNetas.adulto;
    var pnAdultoMayor = tarifasNetas.mayor;
    var pnInfante = tarifasNetas.infante;
    var pnMenor = tarifasNetas.menor;

    var tipo_viaje = book.info.tipo_viaje;

    var total = 0;
    var totalNeto = 0;

    var impAdultos = 0;
    var impMayores = 0;
    var impInfantes = 0;
    var impMenores = 0;

    var impNAdultos = 0;
    var impNMayores = 0;
    var impNInfantes = 0;
    var impNMenores = 0;
    var ratesDetails = [{
      adultos: {
        cantidad: nAdultos,
        importen: 0,
        importep: 0
      },
      adultosmayores: {
        cantidad: pnAdultoMayor,
        importen: 0,
        importep: 0
      },
      infantes: {
        cantidad: pnInfante,
        importen: 0,
        importep: 0
      },
      menores: {
        cantidad: pnMenor,
        importen: 0,
        importep: 0
      }
    }]

    if (adultoMayorActive == '1' && tipo_viaje != 'PRIVATE') {
      impNMayores = nMayores * pnAdultoMayor;
      impMayores = nMayores * pAdultoMayor;

      ratesDetails[0].adultosmayores.importen = impNMayores;
      ratesDetails[0].adultosmayores.importep = impMayores;
    }
    if (infantesActive == '1' && tipo_viaje != 'PRIVATE') {
      impNInfantes = nInfantes * pnInfante;
      impInfantes = nInfantes * pInfante;

      ratesDetails[0].infantes.importen = impNInfantes;
      ratesDetails[0].infantes.importep = impInfantes;
    }
    if (menoresActive == '1' && tipo_viaje != 'PRIVATE') {
      impNMenores = nMenores * pnMenor;
      impMenores = nMenores * pMenor;

      ratesDetails[0].menores.importen = impNMenores;
      ratesDetails[0].menores.importep = impMenores;
    }
    book.totalVehiculos = 1;
    if (tipo_viaje == 'PRIVATE') {
      var ocupmax = parseInt(book.ocupancyOptions.ocupmax);
      var totalPasajeros = nAdultos + nMayores + nInfantes + nMenores;
      var totalVehiculos = totalPasajeros / ocupmax;
      if (totalPasajeros <= ocupmax) {
        impNAdultos = pnAdulto;
        impAdultos = pAdulto;
        totalVehiculos = 1;
        book.totalVehiculos = totalVehiculos;
      } else {
        totalVehiculos = Math.ceil(totalVehiculos);

        impNAdultos = pnAdulto * totalVehiculos;
        impAdultos = pAdulto * totalVehiculos;
        book.totalVehiculos = totalVehiculos;
      }

    } else {
      impNAdultos = nAdultos * pnAdulto;
      impAdultos = nAdultos * pAdulto;
    }


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

  createRange(number) {
    var items: number[] = [];
    for (var i = 1; i <= number; i++) {
      items.push(i);
    }
    return items;
  }

  getContainsLocationZone(polygons, locationPlace) {
    var numZonas = polygons.length;
    var Lat = parseFloat(locationPlace.lat.toFixed(6));
    var Lng = parseFloat(locationPlace.lng.toFixed(6));
    var mode = locationPlace.type;

    for (var h = 0; h < numZonas; h++) {
      var markerPlace = new google.maps.LatLng(Lat, Lng);
      var containLocation = google.maps.geometry.poly.containsLocation(markerPlace, polygons[h]); //poly not defined
      if (containLocation) {
        switch (mode) {
          case 'origen':
            this.placeDestination.origen.push(polygons[h]);
            break;
          case 'destino':
            this.placeDestination.destino.push(polygons[h]);
            break;
        }
      }
    }
  }

  loadMarkers(markers) {
    this.markers = [];
    var markerLat;
    var markerLng;
    for (let position of markers) {


      if (typeof position.lat === 'function') {
        markerLat = parseFloat(position.lat());
        markerLng = parseFloat(position.lng());
      } else {
        markerLat = parseFloat(position.lat);
        markerLng = parseFloat(position.lng);
      }
      this.markers.push({
        position: {
          lat: markerLat,
          lng: markerLng
        },
        options: {
          animation: google.maps.Animation.BOUNCE,
        }
      });

      this.markers.forEach(markersMap => {
        this.centerMap = markersMap.position;
        this.markerMap = markersMap.options;
      });


    }
  }

  colorHexadecimal() {
    return '#' + (function co(lor) {
      return (lor +=
        [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 'a', 'b', 'c', 'd', 'e', 'f'][Math.floor(Math.random() * 16)])
        && (lor.length == 6) ? lor : co(lor);
    })('');
  }

  getZonasAll(idDestino) {
    this.trasladosService.getZones(idDestino).subscribe(r => {
      this.zonas = r
      this.loadZonesMap(this.zonas);
    });
  }

  loadZonesMap(collectionZonas) {

    var arr = new Array();
    this.polygons = [];
    const bounds = new google.maps.LatLngBounds();
    var numZonas = collectionZonas.length;

    for (var i = 0; i < numZonas; i++) {
      arr = [];
      this.zonas[i].selectd = true;
      var geo = collectionZonas[i].geo;
      for (var j = 0; j < geo.length; j++) {
        arr.push(new google.maps.LatLng(
          parseFloat(geo[j].lat),
          parseFloat(geo[j].lng)
        ));
      }
      var trZona = this.zonas[i].zona_id
      var polygonColor = this.colorHexadecimal();
      this.polygons.push(new google.maps.Polygon({
        paths: arr,
        strokeColor: polygonColor,//Color Hexadecimal
        strokeOpacity: 0,
        strokeWeight: 2,
        fillColor: polygonColor,//Color Hexadecimal
        fillOpacity: 0,
        idZona: trZona
      }));

      // this.polygons[this.polygons.length-1].setMap(this.cct.map);
    }
    // cct.selectedAllZones = true;
    if (typeof this.params.origen.geometry.location.lat === 'function') {
      this.mapTraslados.origen.lat = parseFloat(this.params.origen.geometry.location.lat());
      this.mapTraslados.origen.lng = parseFloat(this.params.origen.geometry.location.lng());
    } else {
      this.mapTraslados.origen.lat = parseFloat(this.params.origen.geometry.location.lat);
      this.mapTraslados.origen.lng = parseFloat(this.params.origen.geometry.location.lng);
    }

    if (typeof this.params.destino.geometry.location.lat === 'function') {
      this.mapTraslados.destino.lat = parseFloat(this.params.destino.geometry.location.lat());
      this.mapTraslados.destino.lng = parseFloat(this.params.destino.geometry.location.lng());
    } else {
      this.mapTraslados.destino.lat = parseFloat(this.params.destino.geometry.location.lat);
      this.mapTraslados.destino.lng = parseFloat(this.params.destino.geometry.location.lng);
    }

    this.getContainsLocationZone(this.polygons, this.mapTraslados.origen);
    this.getContainsLocationZone(this.polygons, this.mapTraslados.destino);
    // this.getContainsLocationZone();
    this.searchTraslados(this.params);
  }

  searchTraslados(params) {
    var zona;
    this.translate.get('tracitur.n-existe-zona').subscribe((data: any) => { zona = data; });
    this.placeDestination = {
      origen: [],
      destino: []
    }

    if (typeof this.params.origen.geometry.location.lat === 'function') {
      this.mapTraslados.origen.lat = parseFloat(this.params.origen.geometry.location.lat());
      this.mapTraslados.origen.lng = parseFloat(this.params.origen.geometry.location.lng());
    } else {
      this.mapTraslados.origen.lat = parseFloat(this.params.origen.geometry.location.lat);
      this.mapTraslados.origen.lng = parseFloat(this.params.origen.geometry.location.lng);
    }

    if (typeof this.params.destino.geometry.location.lat === 'function') {
      this.mapTraslados.destino.lat = parseFloat(this.params.destino.geometry.location.lat());
      this.mapTraslados.destino.lng = parseFloat(this.params.destino.geometry.location.lng());
    } else {
      this.mapTraslados.destino.lat = parseFloat(this.params.destino.geometry.location.lat);
      this.mapTraslados.destino.lng = parseFloat(this.params.destino.geometry.location.lng);
    }

    this.getContainsLocationZone(this.polygons, this.mapTraslados.origen);
    this.getContainsLocationZone(this.polygons, this.mapTraslados.destino);

    var zonaA = [];
    var zonaB = [];
    this.traslados = {
      privado: [],
      compartido: []
    };

    if (typeof this.placeDestination.origen == 'undefined') {
      // loading.finish();
      this.sweetAlertService.error('', zona);
      return;
    }
    if (typeof this.placeDestination.destino == 'undefined') {
      // loading.finish();
      this.sweetAlertService.error('', zona);
      return;
    }

    switch (params.tipo_traslado) {
      case 'aeropuerto':
        if (typeof this.placeDestination.destino !== 'undefined') {
          for (let d of this.placeDestination.destino) {
            zonaA.push(d.idZona);
          }
        }
        break;
      case 'hotel':
        if (typeof this.placeDestination.origen !== 'undefined') {
          for (let d of this.placeDestination.origen) {
            zonaA.push(d.idZona);
          }
        }
        break;
    }
    var idsOrigen = [];
    var idsDestino = [];

    for (let d of this.placeDestination.origen) {
      idsOrigen.push(d.idZona);
    }
    for (let d of this.placeDestination.destino) {
      idsDestino.push(d.idZona);
    }

    var $json = {
      // origenZona:cct.placeDestination.origen.idZona,
      // destinoZona:cct.placeDestination.destino.idZona,
      origenZona: idsOrigen,
      destinoZona: idsDestino,
      finicio: params.finicio,
      ffinal: params.ffinal,
      edadmenores: [], // cct.bTraslado.edadmenores
      tipo_viaje: params.tipo_viaje,
      tipo_traslado: params.tipo_traslado,
      zonaA: zonaA,
      zonaB: zonaB,
      menores: params.menores,
      adultos: params.adultos,
      ocupacion: params.ocupacion
    };

    this.trasladosService.getTrasladosAvailables($json).subscribe(r => {
      // this.spinnerService.hide();
      this.hideLoader();
      // console.log(r)
      this.encontrados = r.results.encontrados;
      this.traslados_compartidos = r.results.compartido;
      this.traslados_privados = r.results.privado;
    });
  }

  gotoBook(book) {
    
      book.tipoTrasladoTransporte = this.params.tipoTrasladoTransporte;
      book.info.descripcion = this.removeAccents(book.info.descripcion);
      book.info.politicas = this.removeAccents(book.info.politicas);
      book.info.informacion = this.removeAccents(book.info.informacion);
      book.politicas.politicasCancelacion = this.removeAccents(book.politicas.politicasCancelacion);
      book.datosHotel = this.datosHotel;
      book.datosAeropuerto = this.datosAeropuerto;

      if (book.politicas.id != 0) {
        if (this.permisos_gastoCan == 1) {
          this.sweetAlertService.confirm({
            title: book.politicas.title,
            text: book.politicas.descripcion,
            confirmButtonText: 'Continuar'
          }, this.politicas.bind(this, book));
          // MSG.confirm( book.politicas.title, book.politicas.descripcion ,"warning","Continuar",politicas);
        } else {
          this.sweetAlertService.info(book.politicas.title, book.politicas.descripcion);
        }
      }
      else {
        var bookJson = JSON.stringify(book);
        localStorage.setItem('traslado-detalle', bookJson);
        this.router.navigate(['/booking-traslado']);
      }
       
  }

  politicas(book) {
    var bookJson = JSON.stringify(book);
    localStorage.setItem('traslado-detalle', bookJson);
    this.router.navigate(['/booking-traslado']);
    // $state.go('app.booking.addons', { json: bookJson });
  }

  removeAccents(value) {
    return value
      .replace(/á/g, 'a')
      .replace(/é/g, 'e')
      .replace(/í/g, 'i')
      .replace(/ó/g, 'o')
      .replace(/ú/g, 'u');
  }

  showInformation(info) {
    this.sweetAlertService.info('Información', info);
  }

  showPolitics(politicas) {
    this.sweetAlertService.info(politicas.title, politicas.descripcion);
  }

}
