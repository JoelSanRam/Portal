import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators, FormArray, FormControl, ValidatorFn } from '@angular/forms';
// import { DatepickerOptions } from 'ng2-datepicker';
// import * as esLocale from 'date-fns/locale/es';
import { AuthenticationService, GruposService } from '@app/services';
import { DatePipe } from '@angular/common';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { CotizacionDetalleComponent } from './cotizacion-detalle/cotizacion-detalle.component';
import { SweetalertService } from '@app/services/sweetalert.service';
import { CotizacionMensajeComponent } from './cotizacion-mensaje/cotizacion-mensaje.component';
import { NgxSpinnerService } from "ngx-spinner";
import { BsDatepickerConfig, BsLocaleService } from 'ngx-bootstrap/datepicker';
import { defineLocale } from 'ngx-bootstrap/chronos';
import { esLocale } from 'ngx-bootstrap/locale';
import { TranslateService } from '@ngx-translate/core';
import { LottieService } from '@app/services/lottie.service';
import { AppComponent } from '@app/app.component';
defineLocale('es', esLocale);

@Component({
  selector: 'app-grupos',
  templateUrl: './grupos.component.html',
  styleUrls: []
})
export class GruposComponent implements OnInit {
  submitted = false;
  loading = false;
  today = new Date(Date.now());
  imgruta;

  formGrupos: FormGroup;
  hoteles;
  hotelesList: any[];
  regiones: string[];
  fechas;
  finicio = new Date(Date.now());
  ffinal = new Date();
  bsRangeValue: Date[];
  gruposHistorial: any = [];
  zonaEvento = false;
  otroServ = false;
  otroServicios;
  selectedServ;
  controlsHabs;
  arrhabs;

  habitaciones = [
    { tipo: 'SGL' },
    { tipo: 'DBL' },
    { tipo: 'TPL' },
    { tipo: 'CPL' }
  ];

  tipoGrupo;
  planes;
  eventos;
  servicios;
  serviciosFormData;
  paramsMail;

  bsConfig: Partial<BsDatepickerConfig>;
  locale = 'es';
  url_loader;
  // options: DatepickerOptions = {
  //   minYear: 2020,
  //   maxYear: 2030,
  //   displayFormat: 'DD/MM/YYYY',
  //   barTitleFormat: 'MMMM YYYY',
  //   dayNamesFormat: 'dd',
  //   firstCalendarDay: 0, // 0 - Sunday, 1 - Monday
  //   locale: esLocale,
  //   minDate: new Date(Date.now()),
  //   placeholder: '  /   /   ',
  //   addClass: 'form-control',
  //   addStyle: {
  //     'width': '125px',
  //     'text-align': 'center',
  //     'background-color': '#fff',
  //     'color': '#000',
  //     'border-radius': '0 8px 8px 0',
  //     'border': '1px solid #ced4da',
  //     'border-left': 'none',
  //   },
  //   useEmptyBarTitle: false,
  // }

  constructor(
    private formBuilder: FormBuilder,
    private datePipe: DatePipe,
    private gruposService: GruposService,
    private modalService: NgbModal,
    private swal: SweetalertService,
    private spinnerService: NgxSpinnerService,
    private localeService: BsLocaleService,
    private translate: TranslateService,
    private auth: AuthenticationService,
    private lottieService: LottieService,
    private appComponent: AppComponent
  ) {
    this.ffinal.setDate(this.finicio.getDate() + 2);
    this.bsRangeValue = [this.finicio, this.ffinal];
    this.controlsHabs = this.habitaciones.map(c => new FormControl(false));

    this.formGrupos = this.formBuilder.group({
      hotel: this.formBuilder.array([new FormControl('')]),
      fechas: this.formBuilder.array([
        this.formBuilder.group({
          range: [''],
          // ffinal: ['']
        }),
      ]),
      tipoGrupo: this.formBuilder.group({
        nombre: ['', Validators.required],
        otro: ['']
      }),
      nhab: ['', [Validators.required, Validators.min(10)]],
      tipoHabs: this.formBuilder.array(this.controlsHabs),
      planes: ['', Validators.required],
      menores: ['', Validators.required],
      obser: [''],
      evento: this.formBuilder.group({
        tipoEvento: ['', Validators.required],
        nPer: [''],
        dia: [''],
        hora: [''],
        duracion: [''],
        servicios: this.formBuilder.array([]),
      })
    });

    this.getHoteles();
    this.hoteles = this.formGrupos.get('hotel') as FormArray;
    this.fechas = this.formGrupos.get('fechas') as FormArray;
    this.serviciosFormData = this.formGrupos.get('evento').get('servicios') as FormArray;


    this.getPlanAli();
    this.getTipos();
    this.getEventos();
    this.getServicios();
    this.getGruposHistorial();

    this.bsConfig = Object.assign({}, {
      containerClass: 'theme-default',
      showWeekNumbers: false
    });

    this.localeService.use(this.locale);
    this.imgruta = '../../../assets/img/spinners/general.gif?' + this.today;
    this.auth.setTypeLoader('defaul');
    this.auth.getLang().subscribe(res => {
      translate.setDefaultLang(res);
    });
  }

  ngOnInit() {
    this.auth.getTypeLoader().subscribe((res)=>{
      if(res != undefined){
        this.url_loader = res
      }
    })
    // this.spinnerService.show();
    this.showloader();
    this.arrhabs = this.formGrupos.controls.tipoHabs['controls'];
    // console.info('mmmm',this.controlsHabs);
    // console.info('aaaa',this.formBuilder.array(this.controlsHabs));
    this.formGrupos.patchValue({
      fechas: [{
        range: this.bsRangeValue,
        // ffinal: this.ffinal
      }],
      tipoGrupo: {
        nombre: 'Asociación',
        otro: ''
      },
      nhab: '10',
      planes: 'Todo Incluido',
      menores: '',
      obser: '',
      evento: {
        tipoEvento: 'Banquete',
        nPer: '',
        dia: '',
        hora: '',
        duracion: '',
      }
    });
  }

  get g() { return this.formGrupos.controls; }
  get f() { return this.fechas.controls; }
  get s() { return this.serviciosFormData.controls; }

  showloader(){
    if(this.url_loader.existInConfig == false ){
      this.spinnerService.show();
    }else {   
        this.lottieService.setLoader(true, '');
        // console.log(this.url_loader);
      }
  }

  hideLoader(){
    
      if( this.url_loader.existInConfig == true ){
          this.lottieService.setLoader(false, '');
      }else {  
          this.spinnerService.hide();
      }
  }


  getHoteles() {
    this.gruposService.getHotelesGrupos().subscribe(response => {
      this.hotelesList = response;
      this.regiones = Array.from(new Set(response.map(({ region }) => region)));
    });
  }

  addHotel() {
    const control = new FormControl({}, Validators.required);
    this.hoteles.push(control);
  }

  delHotel() {
    if (this.hoteles.length > 1) {
      this.hoteles.removeAt(this.hoteles.length - 1);
    }
  }

  addFechas() {
    var limitefechas;
    this.translate.get('grupos.solo-5-fechas').subscribe((data: any) => { limitefechas = data; });
    if (this.f.length < 5) {
      const control = new FormGroup({
        'range': new FormControl(this.bsRangeValue),
      });
      this.fechas.push(control);
    } else {
      this.swal.error(limitefechas);
    }
  }

  delFechas() {
    if (this.fechas.length > 1) {
      this.fechas.removeAt(this.fechas.length - 1);
    }
  }


  addServicios() {
    this.servicios.forEach(() => this.serviciosFormData.push(new FormControl(false)));
  }



  //! /////////////////////////

  getPlanAli() {
    this.gruposService.getPlanAlimentos().subscribe(response => {
      this.planes = response;
    });
  }

  getTipos() {
    this.gruposService.getTipos().subscribe(response => {
      this.tipoGrupo = response;
    });
  }

  getEventos() {
    this.gruposService.getEventos().subscribe(response => {
      this.eventos = response;
    });
  }

  getServicios() {
    this.gruposService.getServicios().subscribe(response => {
      this.servicios = response;
      this.addServicios();
    });
  }

  //! /////////////////////////
  // VALIDADORES
  //! /////////////////////////

  sendMail() {
    var msg;
    var selectHotel;
    var hotelSoloAdultos;
    var otroHotel;
    var requeridos;
    var hotelRepetido;
    var noRepetir;
    this.translate.get('grupo.cotizacion-enviada').subscribe((data: any) => { msg = data; });
    this.translate.get('grupo.select-hotel').subscribe((data: any) => { selectHotel = data; });
    this.translate.get('grupo.hotel-solo-adultos').subscribe((data: any) => { hotelSoloAdultos = data; });
    this.translate.get('grupo.otro-hotel').subscribe((data: any) => { otroHotel = data; });
    this.translate.get('grupo.campos-requeridos').subscribe((data: any) => { requeridos = data; });
    this.translate.get('grupo.hotel-repetido').subscribe((data: any) => { hotelRepetido = data; });
    this.translate.get('grupo.no-repita-hotel').subscribe((data: any) => { noRepetir = data; });
    this.submitted = true;

    for (let i = 0; i < this.hoteles.value.length; i++) {
      if (!this.hoteles.value[i].nombre) {
        this.swal.alert(selectHotel);
        return;
      }
      if (this.hoteles.value[i].adultos == 1 && this.formGrupos.value.menores == 'SI') {
        this.swal.alert(this.hoteles.value[i].nombre + hotelSoloAdultos, otroHotel);
        return;
      }
    }
    let unique = this.hoteles.value.filter((v, i, a) => a.indexOf(v) === i);
    if (this.hoteles.value.length !== unique.length) {
      this.swal.alert(hotelRepetido, noRepetir);
      return;
    }

    if (this.formGrupos.invalid) {
      this.swal.alert(requeridos);
      return;
    }

    let newFechas = [];

    this.fechas.value.forEach(f => {
      let oFechas = {
        finicio: this.datePipe.transform(f.range[0], 'yyyy-MM-dd'),
        ffinal: this.datePipe.transform(f.range[1], 'yyyy-MM-dd'),
      }
      newFechas.push(oFechas);
    });


    const selectedHabs = this.formGrupos.value.tipoHabs
      .map((checked, i) => checked ? this.habitaciones[i] : null)
      .filter(value => value !== null);

    const selectedServ = this.serviciosFormData.value
      .map((checked, i) => checked ? this.servicios[i].nombre : null)
      .filter(value => value !== null);

   

    let tipoGrupo
    if (this.formGrupos.value.tipoGrupo.nombre == 'Otro') {
      tipoGrupo = this.formGrupos.value.tipoGrupo.otro
    } else {
      tipoGrupo = this.formGrupos.value.tipoGrupo.nombre
    }

    let evento;
    if (this.zonaEvento) {
      evento = {
        tipoEvento: this.formGrupos.value.evento.tipoEvento,
        nPer: this.formGrupos.value.evento.nPer,
        dia: this.formGrupos.value.evento.dia,
        hora: this.formGrupos.value.evento.hora,
        duracion: this.formGrupos.value.evento.duracion,
        servicios: selectedServ
      }
    } else {
      evento = {}
    }
    this.loading = true;

    this.paramsMail = {
      hotel: this.hoteles.value,
      fechas: newFechas,
      tipoGrupo: tipoGrupo,
      nhab: this.formGrupos.value.nhab,
      tipoHabs: selectedHabs,
      planes: this.formGrupos.value.planes,
      menores: this.formGrupos.value.menores,
      obser: this.formGrupos.value.obser,
      evento: evento,
    }

    // this.spinnerService.show();
    this.showloader();

    this.gruposService.sendMail(this.paramsMail).subscribe(response => {
      // this.spinnerService.hide();
      this.hideLoader();
      this.loading = false;
      this.swal.success(msg);
      this.getGruposHistorial();
    });

  }

  //! /////////////////////////

  getGruposHistorial() {
    this.gruposService.getGruposList().subscribe(response => {
      // this.spinnerService.hide();
      this.hideLoader();
      this.gruposHistorial = response;
    });
  }

  getDetalle(cotizacion) {
    const modalRef = this.modalService.open(CotizacionDetalleComponent, { backdrop: 'static' });
    modalRef.componentInstance.cotizacion = cotizacion;
  }

  getMensaje(cotizacion) {
    const modalRef = this.modalService.open(CotizacionMensajeComponent, { backdrop: 'static', size: 'lg' });
    modalRef.componentInstance.cotizacion = cotizacion;
  }

}
