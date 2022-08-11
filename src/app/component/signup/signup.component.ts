import { Component, OnInit, ViewChild } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { FormBuilder, FormGroup, Validators  } from "@angular/forms";
import { faFacebookF, faTwitter, faInstagram, faYoutube } from "@fortawesome/free-brands-svg-icons";
/* import { DatepickerOptions } from 'ng2-datepicker';
import * as esLocale from 'date-fns/locale/es'; */
import { AgenciaService, AlertService, ValidadoresService, SweetalertService,AuthenticationService, ConfigService } from '@app/services';
import { DatePipe } from "@angular/common";
import { PoliticasComponent } from '@app/component/hoteles/politicas/politicas.component';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { BsDatepickerDirective, BsDatepickerConfig, BsLocaleService } from 'ngx-bootstrap/datepicker';
import { defineLocale } from 'ngx-bootstrap/chronos';
import { esLocale } from 'ngx-bootstrap/locale';
import { TranslateService } from '@ngx-translate/core';
import * as moment from 'moment';
defineLocale('es', esLocale);

@Component({
    selector: 'app-signup',
    templateUrl: './signup.component.html',
    styleUrls: [],
})
export class SignupComponent implements OnInit {
    @ViewChild('dpfa', { static: true }) datepicker: BsDatepickerDirective;
    bsConfig: Partial<BsDatepickerConfig>;
    signupForm: FormGroup;
    submitted = false;
    returnUrl: string;
    loading = false;
    noMatch = false;
    aceptTerms;

    faFacebookF = faFacebookF;
    faTwitter = faTwitter;
    faInstagram = faInstagram;
    faYoutube = faYoutube;

    agencia = {};
    usuario = {};
    listNacionalidades = [];
    listPaises = [];
    listEstados = [];
    listCiudades = [];

    idOperador = ConfigService.configFile.idOperador;
    labelRFC = 'RFC | NIT';
    labelEstado = 'Estado';
    labelLada = 'Lada | Indicativo';
    rsociales = ConfigService.configFile.redes_sociales;
    locale = 'es';
    maxDate: Date = moment().toDate();
    constructor(
        private formBuilder: FormBuilder,
        private agenciaService: AgenciaService,
        private alertService: AlertService,
        private route: ActivatedRoute,
        private authenticationService: AuthenticationService,
        private router: Router,
        private datePipe: DatePipe,
        private swal: SweetalertService,
        private modalService: NgbModal,
        private localeService : BsLocaleService,
        private translate: TranslateService
    ) {
        this.localeService.use(this.locale);
        this.authenticationService.getLang().subscribe(res=>{
            translate.setDefaultLang(res);
        });
    }
    ngOnInit() {
        this.bsConfig = Object.assign({}, { containerClass: 'theme-dark-blue', showWeekNumbers: false }); //validacion fecha minima
        this.datepicker.setConfig(); // asignacion de validacion a daterangepicker
        this.getListPaises();

        if(this.idOperador == 'AZAMID' || this.idOperador == 'AZAMTY' || this.idOperador == 'AZAMX' || this.idOperador == 'AZACR' || this.idOperador == 'AZABR' || this.idOperador == 'AZALTM' || this.idOperador == 'AZAPTY'){
            this.signupForm = this.formBuilder.group({
                nomAgencia: ['', Validators.required],
                fecha_aniversario: [''],
                dirAgencia: ['', Validators.required],
                pais: [Validators.required],
                estado: [Validators.required],
                ciudad: [Validators.required],
                telefono_lada: ['', Validators.required],
                telefono: ['', Validators.required],
                celular: ['', Validators.required],
                operadorSelec: [null,[Validators.required]],
                redsocial: [''],
                rfc: ['', Validators.required],
                razonSocial: ['', Validators.required],
                direccionFiscal: ['', Validators.required],
                rnt: ['', Validators.required],
                nombre: ['', Validators.required],
                email: ['', [Validators.required, Validators.email]],
                usuario: ['', Validators.required],
                pass: ['', Validators.required],
                pass2: ['', Validators.required],
                nacionalidad: ['', Validators.required]
            }); 
        }else{

            this.signupForm = this.formBuilder.group({
                nomAgencia: ['', Validators.required],
                fecha_aniversario: [''],
                dirAgencia: ['', Validators.required],
                pais: [Validators.required],
                estado: [Validators.required],
                ciudad: [Validators.required],
                telefono_lada: ['', Validators.required],
                telefono: ['', Validators.required],
                celular: ['', Validators.required],
                redsocial: [''],
                rfc: ['', Validators.required],
                razonSocial: ['', Validators.required],
                direccionFiscal: ['', Validators.required],
                rnt: ['', Validators.required],
                nombre: ['', Validators.required],
                email: ['', [Validators.required, Validators.email]],
                usuario: ['', Validators.required],
                pass: ['', Validators.required],
                pass2: ['', Validators.required],
                nacionalidad: ['', Validators.required]
            });
        }
        this.signupForm.patchValue({
            pais: null,
            estado:null,
            ciudad:null,
            nacionalidad:null,
            operadorSelec:''
        });

        this.returnUrl = this.route.snapshot.queryParams['returnUrl'] || '/login';
        if (this.idOperador == 'AZALTM') {
            this.labelRFC = 'NIT';
            this.labelEstado = 'Departamento';
            this.labelLada = 'Indicativo';
            this.signupForm.patchValue({
                pais: null,
                estado:null,
                ciudad:null
            });
        }
        this.changePais();
        this.getListNacionalidades();
    }

    get f() {
        return this.signupForm.controls;
    }

    getListNacionalidades() {
        this.agenciaService.getNacionalidadAgencia(this.idOperador).subscribe((result) => {
            this.listNacionalidades = result;
        });
    } 

    getListPaises() {
        this.agenciaService.getPais('GEON').subscribe((result) => {
            this.listPaises = result;
        });
    }   

    changePais() {
        let pais = this.f.pais.value;
        let idPais = pais;
        this.agenciaService.getEstado(idPais).subscribe((result) => {
            this.listEstados = result;
        });
    }

    changeEstado() {
        let estado = this.f.estado.value;
        let idEdo = estado;
        this.agenciaService.getCiudad(idEdo).subscribe((result) => {
            this.listCiudades = result;
        });
    }

    direFiscal(e) {
        if (e.target.checked) {
            this.signupForm.controls.direccionFiscal.setValue(
                this.signupForm.getRawValue().dirAgencia
            );
        } else {
            this.signupForm.controls.direccionFiscal.setValue('');
        }
    }

    onNgModelChange(e) {
        if (e) {
           
        }
    }

    toggleTerms(event) {
        if (event.target.checked) {
            this.aceptTerms = true;
        } else {
            this.aceptTerms = false;
        }
    }

    TerminosYCondiciones() {
        this.modalService.open(PoliticasComponent, {
            size: 'lg',
        });
    }

    compareFn(c1, c2): boolean {
        return c1 && c2 ? c1.id === c2.id : c1 === c2;
    }

    get operadorSelec(){
        return this.signupForm.get('operadorSelec');
    }

    sucursalOpe(e: any){
        this.operadorSelec?.setValue(e.target.value, {
            onlySelf: true,
        });
    }

    onSubmit() {
        
        this.submitted = true;
        if (this.signupForm.invalid) {
            var title;
            var msg;
            this.translate.get('signup.datos-invalidos').subscribe((data:any)=> { title = data;});
            this.translate.get('signup.llene-campos').subscribe((data:any)=> { msg = data;});
            this.swal.warning( title, msg );
            return;
        }
        let countrySelected = this.signupForm.value.pais;
        var country = this.listPaises.find(function(n){ if(n.id == countrySelected){ return n; }});

        let stateSelected = this.signupForm.value.estado;
        var state = this.listEstados.find(function(n){ if(n.id == stateSelected){ return n; }});

        let citySelected = this.signupForm.value.ciudad;
        var city = this.listCiudades.find(function(n){ if(n.id == citySelected){ return n; }});

        if (this.signupForm.value.pass !== this.signupForm.value.pass2) {
            var msg;
            this.translate.get('signup.pass-verificacion').subscribe((data:any)=> { msg = data;});
            this.swal.warning(msg);
            this.noMatch = true;
            return;
        }
        let fecha_aniv = this.datePipe.transform(this.f.fecha_aniversario.value,'yyyy-MM-dd');
        let data = {
            idOperador: this.idOperador,
            agencia: {
                nomAgencia: this.f.nomAgencia.value,
                fecha_aniversario: fecha_aniv,
                dirAgencia: this.f.dirAgencia.value,
                pais: country,
                estado: state,
                ciudad: city,
                telefono_lada: this.f.telefono_lada.value,
                telefono: this.f.telefono.value,
                celular: this.f.celular.value,
                redsocial: this.f.redsocial.value,
                rfc: this.f.rfc.value,
                razonSocial: this.f.razonSocial.value,
                rnt: this.f.rnt.value,
                nationality_search: this.f.nacionalidad.value,
            },
            usuario: {
                nombre: this.f.nombre.value,
                email: this.f.email.value,
                usuario: this.f.usuario.value,
                pass: this.f.pass.value,
                pass2: this.f.pass2.value,
            },
        };
        if(this.idOperador.match(/AZA/)){
            data.agencia['operadorSelec'] = this.f.operadorSelec.value;
            data.agencia['direccionFiscal'] = this.f.direccionFiscal.value;
        }

        this.agenciaService.createAgencia(data).subscribe(
            (res) => {
                this.loading = false;
                switch (res.status) {
                    case 'success':
                        this.swal.success(res.title, res.msg);
                        this.router.navigate([this.returnUrl]);
                        break;
                    case 'warning':
                        this.swal.warning(res.title, res.msg);
                        break;
                    case 'error':
                        this.swal.error(res.title, res.msg);
                        break;
                    default:
                        this.swal.info(res.title, res.msg);
                        break;
                }
            },
            (error) => {
                this.alertService.error(error.msg);
                this.loading = false;
            }
        );
    }
}
