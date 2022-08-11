import { Component, OnInit, ElementRef, NgZone, ViewChild } from '@angular/core';
import { AuthenticationService, AgenciaService, ThemeService, SharedService, SessionService } from '@app/services';
import { SweetalertService } from '@app/services/sweetalert.service';
import { User } from "@app/models";
import { FormBuilder, FormGroup, Validators } from "@angular/forms";
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { CambiarLogoDocsComponent } from "./cambiar-logo-docs/cambiar-logo-docs.component";
import { CambiarLogoHeaderComponent } from "./cambiar-logo-header/cambiar-logo-header.component";
import { CambiarPieFlyerComponent } from "./cambiar-pie-flyer/cambiar-pie-flyer.component";
import { UsuarioFormComponent } from "./usuario-form/usuario-form.component";
import { PermisosUsuarioComponent } from './permisos-usuario/permisos-usuario.component';
import { NgxSpinnerService } from "ngx-spinner";
import { GoogleMap } from '@angular/google-maps';
import { TranslateService } from '@ngx-translate/core';

@Component({
  selector: 'app-agencia',
  templateUrl: './agencia.component.html',
  styleUrls: []
})
export class AgenciaComponent implements OnInit {
  @ViewChild(GoogleMap, { static: false }) map: GoogleMap
  private currentUser: User;
  private idAgencia: number;
  agencia;
  agenciaDataForm: FormGroup;
  agenciaMapaForm: FormGroup;
  today = new Date(Date.now());
  imgruta;
  submitted = false;
  loading = false;
  loading2 = false;
  color;
  txtColor;
  txtColorMenu;
  colorMenu;
  colorBtnSuccess;
  txtSuccess;
  colorBtnInfo;
  txtInfo;
  colorBtnPrimary;
  txtPrimary;
  colorBtnDanger;
  txtDanger;
  usuarios;
  listNacionalidades = [];
  listPaises = [];
  listEstados = [];
  listCiudades = [];
  newUsuario = {
    nombre: '',
    usuario: '',
    tipousuario: 'Agente',
  }
  theme;
  customTheme;
  disabled;
  permisosiframe;
  private geoCoder;
  @ViewChild('search', { static: true })
  public searchElementRef: ElementRef;

  themeForm: FormGroup;
  private themeWrapper = document.querySelector('body');

  center = {
    lat: 0,
    lng: 0
  };
  zoom = 15;
  display?: google.maps.LatLngLiteral;
  options = {
    draggable: true
  };

  constructor(
    // private userService: UserService,
    private authenticationService: AuthenticationService,
    private agenciaService: AgenciaService,
    private sharedService: SharedService,
    private formBuilder: FormBuilder,
    private swal: SweetalertService,
    private modalService: NgbModal,
    private spinnerService: NgxSpinnerService,
    private themeService: ThemeService,
    private ngZone: NgZone,
    private sessionservice: SessionService,
    private translate: TranslateService
  ) {
    this.agenciaDataForm = this.formBuilder.group({
      nomAgencia: ['', Validators.required],
      dirAgencia: ['', Validators.required],
      telefono: ['', Validators.required],
      celular: ['', Validators.required],
      redSocial: ['', Validators.required],
      rfc: ['', Validators.required],
      razonSocial: ['', Validators.required],
      direccionFiscal: ['', Validators.required],
      pais: ['', Validators.required],
      estado: ['', Validators.required],
      ciudad: ['', Validators.required],
      nationality_search: ['', Validators.required]
    });
    this.authenticationService.currentUser.subscribe(x => this.currentUser = x);
    this.sharedService.agenciaObserver.subscribe(agencia => {
      this.agencia = agencia;
      this.idAgencia = agencia.idAgencia;
      this.agenciaDataForm.patchValue({
        nomAgencia: this.agencia.nomAgencia,
        dirAgencia: this.agencia.dirAgencia,
        telefono: this.agencia.telefono,
        celular: this.agencia.celular,
        redSocial: this.agencia.redSocial,
        rfc: this.agencia.rfc,
        razonSocial: this.agencia.razonSocial,
        direccionFiscal: this.agencia.direccionFiscal,
        pais: this.agencia.pais.id,
        estado: this.agencia.estado.id,
        ciudad: this.agencia.ciudad.id,
        nationality_search: this.agencia.nationality_search
      });
      this.changePais();
      this.changeEstado();
    });
    this.themeForm = this.formBuilder.group({
      color: [{ value: '', disabled: this.disabled }],
      txtColor: [''],
      colorMenu: [''],
      txtColorMenu: [''],
      colorBtnPrimary: [''],
      txtPrimary: [''],
      colorBtnInfo: [''],
      txtInfo: [''],
      colorBtnSuccess: [''],
      txtSuccess: [''],
      colorBtnDanger: [''],
      txtDanger: [''],
    })

    this.sessionservice.getSession().subscribe(response => {
      if (response) {
        let permisosdecode = JSON.parse(response);
        this.permisosiframe = permisosdecode.iframe;
      }
    });
    this.imgruta = '../../../assets/img/spinners/general.gif?' + this.today;
    this.authenticationService.getLang().subscribe(res=>{
      translate.setDefaultLang(res);
    });
  }

  ngOnInit() {
    this.spinnerService.show();

    this.getUsuarios();
    this.getListPaises();
    this.getTheme();
    this.getAgencia()
    this.getListNacionalidades()

    this.geoCoder = new google.maps.Geocoder;
    this.setCurrentLocation();
    let autocomplete = new google.maps.places.Autocomplete(this.searchElementRef.nativeElement);
    autocomplete.addListener("place_changed", () => {
      this.ngZone.run(() => {
        //get the place result
        let place: google.maps.places.PlaceResult = autocomplete.getPlace();

        //verify result
        if (place.geometry === undefined || place.geometry === null) {
          return;
        }
        this.agencia.lat = place.geometry.location.lat();
        this.agencia.lnt = place.geometry.location.lng()
        this.center = {
          lat: this.agencia.lat,
          lng: this.agencia.lnt,
        }
      });
    });


    /* this.mapsAPILoader.load().then(() => {
      //this.setCurrentLocation();
      this.geoCoder = new google.maps.Geocoder;

      let autocomplete = new google.maps.places.Autocomplete(this.searchElementRef.nativeElement);
      autocomplete.addListener("place_changed", () => {
        this.ngZone.run(() => {
          //get the place result
          let place: google.maps.places.PlaceResult = autocomplete.getPlace();

          //verify result
          if (place.geometry === undefined || place.geometry === null) {
            return;
          }
          this.agencia.lat = place.geometry.location.lat();
          this.agencia.lnt = place.geometry.location.lng()
        });
      });
    }); */
  }

  get d() { return this.agenciaDataForm.controls; }
  get t() { return this.themeForm.controls; }

  getAgencia() {
    this.agenciaService.getAgencia(this.idAgencia).subscribe(agencia => {
      this.sharedService.setAgencia(agencia);
      this.agencia = agencia;
      this.spinnerService.hide();
      this.center = {
        lat: this.agencia.lat,
        lng: this.agencia.lnt,
      }
    })
  }

  private setCurrentLocation() {
    if ('geolocation' in navigator) {
      navigator.geolocation.getCurrentPosition((position) => {
        this.agencia.lat = position.coords.latitude;
        this.agencia.lnt = position.coords.longitude;
        this.getAddress(this.agencia.lat, this.agencia.lnt);
      });
    }
  }

  getAddress(latitude, longitude) {
    this.geoCoder.geocode({ 'location': { lat: latitude, lng: longitude } }, (results, status) => {
      if (status === 'OK') {
        if (results[0]) {
          let address
          address = results[0].formatted_address;
        } else {
          window.alert('No results found');
        }
      } else {
        window.alert('Geocoder failed due to: ' + status);
      }

    });
  }

  markerDragEnd(coord) {
    this.agencia.lat = coord.latLng.lat();
    this.agencia.lnt = coord.latLng.lng();
    this.center = {
      lat: this.agencia.lat,
      lng: this.agencia.lnt,
    }
    this.getAddress(this.agencia.lat, this.agencia.lnt);
  }

  getListNacionalidades() {
    this.agenciaService.getNacionalidad().subscribe((result) => {
      this.listNacionalidades = result;
    });
  }

  getListPaises() {
    this.agenciaService.getPais('GEON').subscribe(result => {
      this.listPaises = result;
      this.spinnerService.hide();
    });
  }

  changePais() {
    let pais = this.d.pais.value;
    let idPais = pais;
    this.agenciaService.getEstado(idPais).subscribe(result => {
      this.listEstados = result;
    });
  }

  changeEstado() {
    let estado = this.d.estado.value;
    let idEdo = estado;
    this.agenciaService.getCiudad(idEdo).subscribe(result => {
      this.listCiudades = result;
    });
  }

  guardarAgencia() {
    this.submitted = true;
    if (this.agenciaDataForm.invalid) {
      return;
    }

    let countrySelected = this.agenciaDataForm.value.pais;
    var country = this.listPaises.find(function (n) { if (n.id == countrySelected) { return n; } });
    this.agenciaDataForm.value.pais = country;

    let stateSelected = this.agenciaDataForm.value.estado;
    var state = this.listEstados.find(function (n) { if (n.id == stateSelected) { return n; } });
    this.agenciaDataForm.value.estado = state;

    let citySelected = this.agenciaDataForm.value.ciudad;
    var city = this.listCiudades.find(function (n) { if (n.id == citySelected) { return n; } });
    this.agenciaDataForm.value.ciudad = city;

    this.loading = true;
    this.agenciaService.updateAgencia(this.idAgencia, this.agenciaDataForm.value).subscribe(res => {
      this.loading = false;
      if (res.status == 'success') {
        this.swal.success(res.title, res.msg);
      }else{
        this.swal.error(res.title, res.msg);
      }

    },
      error => {
        this.loading = false;
        this.swal.error('Error intentelo de nuevo más tarde', 'error');
      });
    this.getAgencia();
  }

  guardarCoordenadas() {
    this.submitted = true;
    this.loading2 = true;
    let enviocord = {
      idAgencia: this.agencia.idAgencia,
      lat: this.agencia.lat,
      lnt: this.agencia.lnt
    };
    this.agenciaService.updateCoords(enviocord, this.agencia.idAgencia).subscribe(res => {
      this.loading2 = false;
      this.swal.success(res.title, res.msg);
    },
      error => {
        this.loading2 = false;
        this.swal.error('Error intentelo de nuevo más tarde', 'error');
      });
    //this.getAgencia();
  }

  modificarLogoDocs() {
    const modalRef = this.modalService.open(CambiarLogoDocsComponent, { backdrop: 'static' });
    modalRef.result.then((result) => {
      this.getAgencia();
    });
  }

  modificarLogoHeader() {
    const modalRef = this.modalService.open(CambiarLogoHeaderComponent, { backdrop: 'static' });
    modalRef.result.then((result) => {
      this.getAgencia();
    });
  }
  modificarPieFlyer() {
    const modalRef = this.modalService.open(CambiarPieFlyerComponent, { backdrop: 'static' });
    modalRef.result.then((result) => {
      this.getAgencia();
    });
  }
  getUsuarios() {
    this.agenciaService.getUsuarios(this.idAgencia).subscribe(res => {
      this.usuarios = res;
      this.spinnerService.hide();
    });
  }

  deleteUsuario(idUsuario: number) {
    this.agenciaService.delUsuario(this.idAgencia, idUsuario).subscribe(res => {
      this.swal.success(res.title, res.msg);
      this.getUsuarios();
    },
      error => {
        this.swal.error('Error intentelo de nuevo más tarde', 'error');
      });
  }

  confirmDeleteUsuario(usuario) {
    var title_trans;
		this.translate.get('agencia.borrar-usuario').subscribe((data: any) => { title_trans = data; });
    title_trans += usuario.nombre;
    this.swal.confirm({
      title: 'Eliminar usuario',
      text:  title_trans,
      confirmButtonText: 'Si, eliminar'
    }, this.deleteUsuario.bind(this, usuario.uid));
  }

  modalUsuarioForm(usuario) {
    const modalRef = this.modalService.open(UsuarioFormComponent, { backdrop: 'static' });
    modalRef.componentInstance.usuario = usuario;
    modalRef.result.then((result) => {
      this.getUsuarios();
    }).catch((error) => {
    });
  }

  modalPermisos(usuario) {
    const modalRef = this.modalService.open(PermisosUsuarioComponent, { backdrop: 'static' });
    modalRef.componentInstance.usuario = usuario;
    modalRef.result.then((result) => {
      this.getUsuarios();
    });
  }

  getTheme() {
    this.themeService.getColor().subscribe(r => {
      this.customTheme = r;
      if (r != 'undefined' || r != '') {
        this.theme = 'custom';
      } else {
        this.theme = 'default';
      }
      this.checkTheme();
    })
  }

  checkTheme() {
    if (this.theme === 'default') {
      this.disabled = true;
      for (const i in this.t) {
        this.t[i].disable();
      }
      this.themeForm.patchValue({
        color: '#FFFFFF',
        txtColor: '#000',
        colorMenu: '#009AE8',
        txtColorMenu: '#FFFFFF',
        colorBtnSuccess: '#4CDEC2',
        txtSuccess: '#FFF',
        colorBtnInfo: '#009AE8',
        txtInfo: '#FFF',
        colorBtnPrimary: '#FD841E',
        txtPrimary: '#FFF',
        colorBtnDanger: '#ED3030',
        txtDanger: '#fff',
      });
    } else if (this.theme === 'custom') {
      this.disabled = false;
      for (const i in this.t) {
        this.t[i].enable();
      }
      this.themeForm.patchValue({
        color: this.customTheme.color,
        txtColor: this.customTheme.txtColor,
        colorMenu: this.customTheme.colorMenu,
        txtColorMenu: this.customTheme.txtColorMenu,
        colorBtnSuccess: this.customTheme.colorBtnSuccess,
        txtSuccess: this.customTheme.txtSuccess,
        colorBtnInfo: this.customTheme.colorBtnInfo,
        txtInfo: this.customTheme.txtInfo,
        colorBtnPrimary: this.customTheme.colorBtnPrimary,
        txtPrimary: this.customTheme.txtPrimary,
        colorBtnDanger: this.customTheme.colorBtnDanger,
        txtDanger: this.customTheme.txtDanger,
      });
    }
    // this.themeService.setCustomTheme(this.themeForm.value);
    this.spinnerService.hide();
  }

  // APARIENCIA
  changeTheme() {
    let r;
    this.themeService.setCustomTheme(this.theme, this.themeForm.value);
    for (const field in this.themeForm.controls) {
      const control = this.themeForm.get(field);
      // if(this.themeForm.get(field).pristine) {
      let color = {
        color: field,
        valor: control.value,
      }
      this.themeService.saveColor(color).subscribe(response => {
        r = response;
      });
      // }
    }
    this.swal.toast('¡Perfil guardado con éxito!');
  }

}
