import { Component, OnDestroy, OnInit, HostListener } from '@angular/core';
import { FormArray, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { AereosService, AgenciaService, AuthenticationService, SessionService, SharedService } from '@app/services';
import { BsDatepickerConfig, BsLocaleService } from "ngx-bootstrap/datepicker";
import { defineLocale } from "ngx-bootstrap/chronos";
import { esLocale } from "ngx-bootstrap/locale";
import { NgxSpinnerService } from 'ngx-spinner';
import { SweetalertService } from "@app/services/sweetalert.service";
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { PolicyComponent } from './policy/policy.component';
import { CookieService } from 'ngx-cookie-service';
import { DatePipe } from '@angular/common';
import * as moment from 'moment';
import { DomSanitizer } from '@angular/platform-browser';
import { symbolsOnly, emailMatch, emailValidator } from '@app/helpers/validators.validator';
import { PlanTarifarioComponent } from '../plan-tarifario/plan-tarifario.component';
import { LottieService } from '@app/services/lottie.service';
import { TranslateService } from '@ngx-translate/core';
import { AppComponent } from '@app/app.component';
import { PagarReservationComponent } from '@app/component/create-reservation/pagar-reservation/pagar-reservation/pagar-reservation.component';
import { CobrarCreditoComponent } from '@app/component/create-reservation/cobrar-credito/cobrar-credito/cobrar-credito.component';
import { Subscription } from 'rxjs';


defineLocale("es", esLocale);
@Component({
	selector: "app-checkout",
	templateUrl: "./checkout.component.html",
})
export class CheckoutComponent implements OnInit, OnDestroy {
	private subscription: Subscription = new Subscription();
	user;
	counter: number;
	tick: number = 1000;
	itemFlight;
	documentacion;
	tipoVuelo;
	tarifa;
	tramos;
	politicas;
	familyFare: any;
	pasajeros;
	pasajerosDatos = {
		adultos: [],
		menores: [],
		infantes: [],
	};
	pasaportes = []
	formcheck: boolean = true;
	iframeUrl;
	uuid: string;
	ligaPago: string;
	operType: string = "";
	cotizar: boolean = true;
	reservar: boolean = false;
	today = new Date(Date.now());
	imgruta = "../../../assets/img/spinners/tarifas.gif?" + this.today;
	cobrarCredito = false;
	airlines;

	createPaxForm(): FormGroup {
		let form = this.formBuilder.group({
			nombres: ["", [Validators.required, symbolsOnly]],
			apellidos: ["", [Validators.required, symbolsOnly]],
			pais: ["MX", Validators.required],
			fecha_nacimiento: ["", Validators.required],
			sexo: ["M", Validators.required],
			numero_cliente: [""],
			titulo_id: [1, Validators.required],
			tipo_id: "",
		});
		if (this.documentacion == 'Internacional') {
			form = this.formBuilder.group({
				...form.controls,
				tipo_documento_id: [1, Validators.required],
				documento: ["", Validators.required],
				fecha_expiracion: ["", Validators.required]
			});
		}
		return form;
	}
	formPax: FormGroup = this.formBuilder.group({
		adultos: this.formBuilder.array([]),
		menores: this.formBuilder.array([]),
		infantes: this.formBuilder.array([]),
		info_mail: this.formBuilder.group({
			email: ["", [Validators.required, emailValidator]],
			emailConfirm: ["", [Validators.required, emailValidator, emailMatch]],
			ofertas: [false],
		}),
		datos_contacto: this.formBuilder.group({
			telefono: ["", [Validators.minLength(10), Validators.maxLength(10), Validators.pattern('^[0-9]*$')]],
			codigo_pais: [139, Validators.required],
			notificacion: [false],

		}),
		datos_emergencia: this.formBuilder.group({
			nombres: ["", [Validators.required, symbolsOnly]],
			apellidos: ["", [Validators.required, symbolsOnly]],
			telefono: ["", [Validators.minLength(10), Validators.maxLength(10), Validators.pattern('^[0-9]*$')]],
			email: ["", [Validators.required, emailValidator]],
			codigo_pais: [139, Validators.required],

		}),
	});
	submitted: boolean = false;
	listPaises = [];
	bsConfig: Partial<BsDatepickerConfig>;
	bsConfigExp: Partial<BsDatepickerConfig>;
	locale = "es";
	maxDate: Date = new Date();
	totalText: string = "";
	searchParams;
	ratekey;
	air_content_provider;
	interval;
	listPhones = [];
	listTitulos = [];
	listDocuments = [];
	uniqueNames: boolean = true;
	uniquePasaports: boolean = true;
	url_loader;
	tresDiasFlag: boolean = false;

	@HostListener("window:beforeunload", ["$event"]) unloadHandler(event: Event) {
		this.resetCounter();
	}
	constructor(
		private router: Router,
		private formBuilder: FormBuilder,
		private agenciaService: AgenciaService,
		// private spinnerService: NgxSpinnerService,
		private localeService: BsLocaleService,
		private sharedService: SharedService,
		private sweetAlertService: SweetalertService,
		private aereosService: AereosService,
		private modalService: NgbModal,
		private cookies: CookieService,
		private datePipe: DatePipe,
		public sanitizer: DomSanitizer,
		private lottieService: LottieService,
		private translate: TranslateService,
		private auth: AuthenticationService,
		private appComponent: AppComponent,
		private sessionservice: SessionService,
	) {
		this.sharedService.usuarioObserver.subscribe((user) => {
			this.user = user;
		});

		// Datepicker para fecha de nacimiento
		this.bsConfig = Object.assign(
			{},
			{
				containerClass: "theme-default",
				showWeekNumbers: false,
				maxDate: this.maxDate,
				dateInputFormat: 'DD/MM/YYYY'
			}
		);
		this.bsConfigExp = Object.assign(
			{},
			{
				containerClass: "theme-default",
				showWeekNumbers: false,
				minDate: this.today,
				dateInputFormat: 'DD/MM/YYYY'
			}
		);

		this.localeService.use(this.locale);
		this.auth.getLang().subscribe(res => {
			translate.setDefaultLang(res);
		});
		this.auth.setTypeLoader('vuelos');
		this.sessionservice.getSession().subscribe(response => {
			if (response) {
				let permisosdecode = JSON.parse(response);
				if (permisosdecode.gastos_cancelacion === 1) {
					this.cobrarCredito = true;
				}
			}
		});
	}

	ngOnInit(): void {
		this.auth.getTypeLoader().subscribe((res) => {
			if (res != undefined) {
				this.url_loader = res
			}
		})
		this.itemFlight = JSON.parse(localStorage.getItem('item_flight'));
		this.counter = parseInt(this.cookies.get('counter'));
		this.uuid = this.itemFlight.uuid;
		this.ratekey = this.itemFlight.ratekey;
		this.air_content_provider = this.itemFlight.air_content_provider;
		this.documentacion = this.itemFlight.documentacion;
		this.tipoVuelo = this.itemFlight.tipoVuelo;
		this.tarifa = this.itemFlight.tarifa;
		this.tramos = this.itemFlight.tramos;
		console.log(this.tramos)

		this.politicas = this.itemFlight.politicas;
		this.familyFare = this.itemFlight.familia_tarifaria;
		this.pasajeros = this.itemFlight.paxs;
		this.addPaxs(this.pasajeros);
		this.totalPax(this.pasajeros);
		this.getListPaises();
		this.startCountdown();
		this.aereosService.getFlightsSearchParams().subscribe((params) => {
			this.searchParams = params;
		});
		this.phones();
		this.titulos();
		this.documents();
		var day = moment(this.tramos[0].date).isAfter(moment().add(3, 'days'));
		if (day === true) {
			this.tresDiasFlag = true;
		}
		let storageForm = JSON.parse(localStorage.getItem(this.uuid));
		if (storageForm) {
			storageForm
			for (const adulto of storageForm.adultos) {
				if (!isNaN(Date.parse(adulto.fecha_nacimiento))) {
					adulto.fecha_nacimiento = moment(adulto.fecha_nacimiento).toDate();
				}
			}
			for (const infante of storageForm.infantes) {
				if (!isNaN(Date.parse(infante.fecha_nacimiento))) {
					infante.fecha_nacimiento = moment(infante.fecha_nacimiento).toDate();
				}
			}
			for (const menor of storageForm.menores) {
				if (!isNaN(Date.parse(menor.fecha_nacimiento))) {
					menor.fecha_nacimiento = moment(menor.fecha_nacimiento).toDate();
				}
			}
			this.formPax.patchValue({
				adultos: storageForm.adultos,
				infantes: storageForm.infantes,
				menores: storageForm.menores,
				info_mail: storageForm.info_mail,
				datos_contacto: storageForm.datos_contacto,
				datos_emergencia: storageForm.datos_emergencia
			})
		}

		this.getAirlines();
	}

	startCountdown() {
		this.interval = setInterval(() => {
			this.counter--;
			if (this.counter <= 0 || isNaN(this.counter)) {
				this.goToErrorPage();
			}
		}, this.tick);
	}

	goToErrorPage() {
		this.clearData();
		this.router.navigate(['/error'], { queryParams: { type: 'timeout' } });
		return;
	}

	resetCounter() {
		clearInterval(this.interval);
		let date = new Date();
		date.setTime(date.getTime() + (this.counter * 1000));
		this.cookies.set('counter', this.counter.toString(), { expires: date });
	}

	get f() {
		return this.formPax.controls;
	}
	get f_mail() {
		return this.f["info_mail"]["controls"];
	}
	get f_contact() {
		return this.f["datos_contacto"]["controls"];
	}
	get f_emergency() {
		return this.f["datos_emergencia"]["controls"];
	}
	get adultos() {
		return this.f["adultos"] as FormArray;
	}
	get menores() {
		return this.f["menores"] as FormArray;
	}
	get infantes() {
		return this.f["infantes"] as FormArray;
	}

	addPaxs(itemPax) {
		for (let i = 0; i < itemPax.adultos; i++) {
			this.adultos.push(this.createPaxForm());
		}
		for (let i = 0; i < itemPax.menores; i++) {
			this.menores.push(this.createPaxForm());
		}
		for (let i = 0; i < itemPax.infantes; i++) {
			this.infantes.push(this.createPaxForm());
		}
	}

	totalPax(paxs) {
		let totalSum = paxs.adultos + paxs.menores + paxs.infantes;
		if (paxs.adultos > 0 && paxs.menores > 0) {
			this.totalText = `${totalSum} personas`;
		} else if (paxs.adultos == 1 && paxs.menores == 0 && paxs.infantes == 0) {
			this.totalText = `${totalSum} adulto`;
		} else if (paxs.adultos > 1 && paxs.menores == 0 && paxs.infantes == 0) {
			this.totalText = `${totalSum} adultos`;
		}
	}

	paxDescription(paxs) {
		let paxArray = [];
		if (paxs.adultos == 1) {
			paxArray.push(`${paxs.adultos} adulto`);
		} else if (paxs.adultos > 1) {
			paxArray.push(`${paxs.adultos} adultos`);
		}
		if (paxs.menores == 1) {
			paxArray.push(`${paxs.menores} menor`);
		} else if (paxs.menores > 1) {
			paxArray.push(`${paxs.menores} menores`);
		}
		if (paxs.infantes == 1) {
			paxArray.push(`${paxs.infantes} infante`);
		} else if (paxs.infantes > 1) {
			paxArray.push(`${paxs.infantes} infantes`);
		}
		return paxArray.join(", ");
	}

	subtractYear(age) {
		let date: Date = new Date()
		age == 0 ? age = 2 : age;
		let minYear = moment(date).subtract(age, 'year').format('YYYY-MM-DD').toString();
		return new Date(minYear);
	}

	getListPaises() {
		this.agenciaService.getPais("GEON").subscribe((result) => {
			this.listPaises = result;
		});
	}

	sumCostos(tarifa) {
		return (tarifa.adultos.costo * tarifa.adultos.cantidad) + (tarifa.infantes.costo * tarifa.infantes.cantidad) + (tarifa.menores.costo * tarifa.menores.cantidad);
	}

	sumExtras(tarifa) {
		return tarifa.TUA.TUA_total + tarifa.impuestos.impuesto_total;
	}

	sumDescuento(descuento) {
		return descuento.adultos.descuento + descuento.infantes.descuento + descuento.menores.descuento
	}

	formatTime(timeString) {
		let timeTokens = timeString.split(":");
		return `${timeTokens[0]}:${timeTokens[1]}`;
	}

	formatDuration(durationString) {
		let durationTokens = durationString.split(":");
		let hour = parseInt(durationTokens[0]);
		return hour + "h " + durationTokens[1] + "m";
	}

	hasStop(flight) {
		if (
			typeof flight.showStops === "undefined" ||
			flight.showStops === ""
		) {
			flight.showStops = true;
		} else {
			flight.showStops = !flight.showStops;
		}
	}

	openPolicy() {
		const modalRef = this.modalService.open(PolicyComponent, {
			size: "md",
			centered: true,
		});
		modalRef.componentInstance.politicas = this.politicas;
	}

	onOpenCalendar(container) {
		setTimeout(() => {
			container.setViewMode('year');
		});

		container.dayHoverHandler = (event: any): void => {
		}

		container.daySelectHandler = (event: any): void => {
			container._store.dispatch(container._actions.select(event.date));
		};
	}

	openFamiliaTar() {
		this.lottieService.setLoader(true, '');
		let ratekey = this.ratekey;
		let air_content_provider = this.air_content_provider;

		let checkFamily = {
			ratekey,
			air_content_provider
		}
		this.aereosService.getFamilyFare(checkFamily).subscribe(familias => {
			this.lottieService.setLoader(false, '');
			if (familias.length > 0) {
				const modalRef = this.modalService.open(PlanTarifarioComponent, {
					size: "xl",
					centered: true,
					windowClass: "modal-familia-tarifaria",
				});
				modalRef.componentInstance.familias = familias;
				modalRef.componentInstance.prevSelected = this.familyFare;
				modalRef.result.then((result) => {
					let newRatekey;
					if (typeof result.ratekey == 'string') {
						newRatekey = [result.ratekey];
					} else {
						newRatekey = result.ratekey;
					}
					let checkData = {
						ratekey: newRatekey,
						air_content_provider
					}
					this.checkFlight(checkData);
				});
			} else {
				this.sweetAlertService.info(familias.title, familias.message)
			}
		}, error => {
			var title;
			var msg;
			this.translate.get('vuelos.error').subscribe((data: any) => { title = data; });
			this.translate.get('vuelos.error-text').subscribe((data: any) => { msg = data; });

			this.lottieService.setLoader(false, '');
			this.sweetAlertService.error(title, msg);
			console.error(error)
		})
	}

	checkFlight(checkData) {
		localStorage.setItem(this.uuid, JSON.stringify(this.formPax.value));
		this.lottieService.setLoader(true, '');
		this.aereosService.checkFlight(checkData).subscribe(result => {
			this.lottieService.setLoader(false, '');
			if (result.status == 'success') {
				let itemFlight = {
					uuid: this.uuid,
					ratekey: result.ratekey,
					air_content_provider: checkData.air_content_provider,
					tipoVuelo: this.tipoVuelo,
					documentacion: result.Documentacion,
					politicas: result.politicas,
					tarifa: result.tarifas,
					paxs: this.pasajeros,
					tramos: result.tramos,
					familia_tarifaria: result.familia_tarifaria,

				};
				this.goToCheckOut(itemFlight);
			} else {
				this.sweetAlertService.info(result.status, result.message);
			}
		}, error => {
			var title;
			var msg;
			this.translate.get('vuelos.problema-server').subscribe((data: any) => { title = data; });
			this.translate.get('vuelos.problema-text').subscribe((data: any) => { msg = data; });

			this.lottieService.setLoader(false, '');
			this.sweetAlertService.info(title, msg);
			console.error(error);
		});
	}

	goToCheckOut(itemFlight) {
		let date = new Date();
		date.setTime(date.getTime() + (600 * 1000));
		this.cookies.set('counter', '600', { expires: date });
		this.aereosService.setCurrentFlight(itemFlight);
		window.location.reload();
		window.scroll(0, 0);
	}

	fakeReq() {
		let pax = {
			adultos: [
				{
					nombres: "John",
					apellidos: "Doe",
					pais: "MX",
					fecha_nacimiento: "1982-01-05",
					sexo: "M",
					numero_cliente: "",
					titulo_id: 1,
					tipo_id: 1
				}
			],
			infantes: [],
			menores: [],
			datos_contacto: {
				nombres: "John",
				apellidos: "Doe",
				email: "alcira@travelmapsoft.com",
				ofertas: false,
				telefono: "1234567890",
				codigo_pais: 139,
				notificacion: false
			},
			datos_emergencia: {
				nombres: "test",
				apellidos: "test",
				telefono: "1234567890",
				email: "alcira@travelmapsoft.com",
				codigo_pais: 139
			},
			air_content_provider: this.air_content_provider,
			ratekey: this.ratekey,
			uuid: this.uuid
		}

		this.prebookFlightPagarReserva(pax)

	}
	//Este metodo es el mismo que el pagarReserva
/*	validateData() {
		this.submitted = true;
		this.pasajerosDatos.adultos = this.formPax.value.adultos;
		this.pasajerosDatos.menores = this.formPax.value.menores;
		this.pasajerosDatos.infantes = this.formPax.value.infantes;

		this.uniqueNames = this.validateUniqueNames()
		this.uniquePasaports = this.validateUniquePasport()
		if (this.formPax.invalid || !this.uniqueNames || !this.uniquePasaports) {
			var title;
			var msg;
			this.translate.get('vuelos.error-validacion').subscribe((data: any) => { title = data; });
			this.translate.get('vuelos.campos-requeridos').subscribe((data: any) => { msg = data; });

			this.sweetAlertService.info(
				title,
				msg
			);
			return;
		}

		if (this.pasajerosDatos.adultos.length > 0) {
			for (const adulto of this.pasajerosDatos.adultos) {
				adulto.fecha_nacimiento = this.datePipe.transform(adulto.fecha_nacimiento, 'yyyy-MM-dd')
				adulto.tipo_id = 1
				adulto.titulo_id = parseInt(adulto.titulo_id);
				if (adulto.fecha_expiracion) {
					adulto.fecha_expiracion = this.datePipe.transform(adulto.fecha_expiracion, 'yyyy-MM-dd')
				}
			}
		}
		if (this.pasajerosDatos.infantes.length > 0) {
			for (const infante of this.pasajerosDatos.infantes) {
				infante.fecha_nacimiento = this.datePipe.transform(infante.fecha_nacimiento, 'yyyy-MM-dd')
				infante.tipo_id = 3
				infante.titulo_id = parseInt(infante.titulo_id);
				if (infante.fecha_expiracion) {
					infante.fecha_expiracion = this.datePipe.transform(infante.fecha_expiracion, 'yyyy-MM-dd')
				}
			}
		}
		if (this.pasajerosDatos.menores.length > 0) {
			for (const menor of this.pasajerosDatos.menores) {
				menor.fecha_nacimiento = this.datePipe.transform(menor.fecha_nacimiento, 'yyyy-MM-dd')
				menor.tipo_id = 2
				menor.titulo_id = parseInt(menor.titulo_id);
				if (menor.fecha_expiracion) {
					menor.fecha_expiracion = this.datePipe.transform(menor.fecha_expiracion, 'yyyy-MM-dd')
				}
			}
		}

		let datos_contacto = {
			nombres: this.pasajerosDatos.adultos[0].nombres,
			apellidos: this.pasajerosDatos.adultos[0].apellidos,
			email: this.formPax.value.info_mail.email,
			ofertas: this.formPax.value.info_mail.ofertas,
			telefono: this.formPax.value.datos_contacto.telefono,
			codigo_pais: this.formPax.value.datos_contacto.codigo_pais,
			notificacion: this.formPax.value.datos_contacto.notificacion,
		}

		let paxData = {
			...this.pasajerosDatos,
			datos_contacto: datos_contacto,
			datos_emergencia: this.formPax.value.datos_emergencia,
			air_content_provider: this.air_content_provider,
			ratekey: this.ratekey,
			uuid: this.uuid
		}
		this.prebookFlight(paxData)
	}*/

	pagarReserva(tipoPago: string): void {
		this.submitted = true;
		this.pasajerosDatos.adultos = this.formPax.value.adultos;
		this.pasajerosDatos.menores = this.formPax.value.menores;
		this.pasajerosDatos.infantes = this.formPax.value.infantes;

		this.uniqueNames = this.validateUniqueNames()
		this.uniquePasaports = this.validateUniquePasport()
		if (this.formPax.invalid || !this.uniqueNames || !this.uniquePasaports) {
			var title;
			var msg;
			this.translate.get('vuelos.error-validacion').subscribe((data: any) => { title = data; });
			this.translate.get('vuelos.campos-requeridos').subscribe((data: any) => { msg = data; });

			this.sweetAlertService.info(
				title,
				msg
			);
			return;
		}

		if (this.pasajerosDatos.adultos.length > 0) {
			for (const adulto of this.pasajerosDatos.adultos) {
				adulto.fecha_nacimiento = this.datePipe.transform(adulto.fecha_nacimiento, 'yyyy-MM-dd')
				adulto.tipo_id = 1
				adulto.titulo_id = parseInt(adulto.titulo_id);
				if (adulto.fecha_expiracion) {
					adulto.fecha_expiracion = this.datePipe.transform(adulto.fecha_expiracion, 'yyyy-MM-dd')
				}
			}
		}
		if (this.pasajerosDatos.infantes.length > 0) {
			for (const infante of this.pasajerosDatos.infantes) {
				infante.fecha_nacimiento = this.datePipe.transform(infante.fecha_nacimiento, 'yyyy-MM-dd')
				infante.tipo_id = 3
				infante.titulo_id = parseInt(infante.titulo_id);
				if (infante.fecha_expiracion) {
					infante.fecha_expiracion = this.datePipe.transform(infante.fecha_expiracion, 'yyyy-MM-dd')
				}
			}
		}
		if (this.pasajerosDatos.menores.length > 0) {
			for (const menor of this.pasajerosDatos.menores) {
				menor.fecha_nacimiento = this.datePipe.transform(menor.fecha_nacimiento, 'yyyy-MM-dd')
				menor.tipo_id = 2
				menor.titulo_id = parseInt(menor.titulo_id);
				if (menor.fecha_expiracion) {
					menor.fecha_expiracion = this.datePipe.transform(menor.fecha_expiracion, 'yyyy-MM-dd')
				}
			}
		}

		let datos_contacto = {
			nombres: this.pasajerosDatos.adultos[0].nombres,
			apellidos: this.pasajerosDatos.adultos[0].apellidos,
			email: this.formPax.value.info_mail.email,
			ofertas: this.formPax.value.info_mail.ofertas,
			telefono: this.formPax.value.datos_contacto.telefono,
			codigo_pais: this.formPax.value.datos_contacto.codigo_pais,
			notificacion: this.formPax.value.datos_contacto.notificacion,
		}

		let paxData = {
			...this.pasajerosDatos,
			datos_contacto: datos_contacto,
			datos_emergencia: this.formPax.value.datos_emergencia,
			air_content_provider: this.air_content_provider,
			ratekey: this.ratekey,
			uuid: this.uuid
		}
		if (tipoPago === 'pagar') {
			this.prebookFlightPagarReserva(paxData);
		}
		else if (tipoPago === 'credito') {
			this.modalCobrarCreditoOpen(paxData);

		} else if (tipoPago === 'cotizar') {
			this.cotizarClick(paxData);
		}
	}
	
	cotizarClick(paxData): void {
		let fecha = new Date();
		let newDate = moment(fecha).toDate();
		let vencimiento = moment(newDate).add(4, 'h').unix();
		this.lottieService.setLoader(true, '');
		this.setFirebase();
		let payData = {
			key: 'key_FgdScfVGhjBgbHyWsf',
			idproducto: 'AEOS',
			monto: this.tarifa.costoTotal,
			referencia: this.uuid,
			descripcion: '',
			metadata: '',
			vencimiento: vencimiento,
		}
		this.aereosService.aereosPay(payData).subscribe((res) => { // <= genera modal con liga de pago
			if (res.status === "SUCCESS") {
				this.ligaPago = res.url;
				this.iframeUrl = this.sanitizer.bypassSecurityTrustResourceUrl(res.url);
				paxData.booking_type = "hold";
				paxData.liga_pago = this.ligaPago;
				paxData.expire_time = res.vencimiento;

				this.subscription.add(
					this.aereosService.sendPaxData(paxData).subscribe((result) => { // <= servicio de Prebooking
						console.log("res", result)
						if (result.status == 'success') {
							window.scroll(0, 0);
							this.aereosService.sendCotizarConfirm(result);
							this.lottieService.setLoader(false, '');
							this.router.navigate(['/checkout/confirm']);
	
						} else {
							this.lottieService.setLoader(false, '');
							this.sweetAlertService.error(
								result.title,
								result.message,
							);
						}
					}, error => {
						var title;
						var msg;
						this.translate.get('vuelos.error').subscribe((data: any) => { title = data; });
						this.translate.get('vuelos.error-server').subscribe((data: any) => { msg = data; });
						this.lottieService.setLoader(false, '');
						console.error(error);
						this.sweetAlertService.error(
							title,
							msg
						);
					})
				);

			} else {
				this.lottieService.setLoader(false, '');
			}
		}, error => {
			var title;
			var msg;
			this.translate.get('vuelos.error').subscribe((data: any) => { title = data; });
			this.translate.get('vuelos.error-pasarela').subscribe((data: any) => { msg = data; });

			this.lottieService.setLoader(false, '');
			this.sweetAlertService.error(
				title,
				msg,
			);
		});


	}

	//! Está función fue creada para que se abriera un modal de pago y puesto que se desecho esta opción la función no cumple ningún objetivo
	//!se puede eliminar y junto con ella el componente PagarReservationComponent
	/*modalPagarOpen() {
		const modalRef = this.modalService.open(PagarReservationComponent, { backdrop: 'static', centered: true, backdropClass: 'modal-content' });
		modalRef.componentInstance.iframeUrl = this.iframeUrl;
		modalRef.componentInstance.ligaPago = this.ligaPago;
	}*/

	modalCobrarCreditoOpen(paxData:any) {
		const modalRef = this.modalService.open(CobrarCreditoComponent, { backdrop: 'static', centered: true, backdropClass: 'modal-content' });
		modalRef.componentInstance.tramos = this.tramos;
		modalRef.componentInstance.tipoVuelo = this.tipoVuelo;
		modalRef.componentInstance.formPax = this.formPax;
		modalRef.componentInstance.user = this.user;
		modalRef.componentInstance.totalText = this.totalText;
		modalRef.componentInstance.tarifa = this.tarifa;
		modalRef.componentInstance.paxData = paxData;
		modalRef.componentInstance.uuid = this.uuid;
		modalRef.componentInstance.interval = this.interval;
	}

	validateUniqueNames(): boolean {
		let allPax = [];
		let pasport = [];
		let document = this.documentacion
		this.pasajerosDatos.adultos.map(adulto => {
			const fullName = this.concatenateName(adulto)
			allPax.push(fullName);
			if (document == 'Internacional') {
				pasport.push(adulto.documento)
			}
		})
		this.pasajerosDatos.infantes.map(infante => {
			const fullName = this.concatenateName(infante)
			allPax.push(fullName);
			if (document == 'Internacional') {
				pasport.push(infante.documento)
			}
		})
		this.pasajerosDatos.menores.map(menor => {
			const fullName = this.concatenateName(menor)
			allPax.push(fullName);
			if (document == 'Internacional') {
				pasport.push(menor.documento)
			}
		})
		if (document == 'Internacional') {
			this.pasaportes = pasport
		}
		const findDuplicates = allPax.filter((item, index) => allPax.indexOf(item) !== index);

		if (findDuplicates.length > 0) {
			return false;
		}
		return true;
	}

	validateUniquePasport() {
		this.pasaportes;
		const findDuplicatesPasport = this.pasaportes.filter((item, index) => this.pasaportes.indexOf(item) !== index);
		if (findDuplicatesPasport.length > 0) {
			return false
		}
		return true
	}

	concatenateName(pax) {
		const name = pax.nombres.replace(/\s/g, '').toLowerCase();
		const lastname = pax.apellidos.replace(/\s/g, '').toLowerCase();
		const concatenatedName = name + lastname;
		return concatenatedName.normalize('NFD').replace(/[\u0300-\u036f]/g, "");
	}
	//Este metodo es el mismo que prebookFlightPagarReserva solo que tiene comentado el formCheck
	prebookFlightPagarReserva(paxData): void {
		let fecha = new Date();
		let newDate = moment(fecha).add(10, 'm').toDate();
		let vencimiento = moment(newDate).unix();
		paxData.booking_type = "normal";
		paxData.liga_pago = "";
		paxData.expire_time = "";
		this.lottieService.setLoader(true, '');
		this.setFirebase();
		this.subscription.add(
			this.aereosService.sendPaxData(paxData).subscribe((result) => { // <= servicio de Prebooking
	
				if (result.status == 'success') {
					window.scroll(0, 0);
					this.formcheck = false;
					let payData = {
						key: 'key_FgdScfVGhjBgbHyWsf',
						idproducto: 'AEOS',
						monto: this.tarifa.costoTotal,
						referencia: this.uuid,
						descripcion: '',
						metadata: '',
						vencimiento: vencimiento,
					}
	
					this.aereosService.aereosPay(payData).subscribe((res) => { // <= genera modal con liga de pago
	
						this.ligaPago = res.url;
						this.iframeUrl = this.sanitizer.bypassSecurityTrustResourceUrl(res.url);
						this.lottieService.setLoader(false, '');
						//this.modalPagarOpen();
					}, error => {
						var title;
						var msg;
						this.translate.get('vuelos.error').subscribe((data: any) => { title = data; });
						this.translate.get('vuelos.error-pasarela').subscribe((data: any) => { msg = data; });
	
						this.lottieService.setLoader(false, '');
						this.formcheck = true;
						this.sweetAlertService.error(
							title,
							msg,
						);
					});
				} else {
					this.lottieService.setLoader(false, '');
					this.sweetAlertService.error(
						result.title,
						result.message,
					);
				}
			}, error => {
				var title;
				var msg;
				this.translate.get('vuelos.error').subscribe((data: any) => { title = data; });
				this.translate.get('vuelos.error-server').subscribe((data: any) => { msg = data; });
				this.lottieService.setLoader(false, '');
				console.error(error);
				this.sweetAlertService.error(
					title,
					msg
				);
			})
		);
	}

	flightCobrarCredito(paxData): void {
		let fecha = new Date();
		let newDate = moment(fecha).add(10, 'm').toDate();
		let vencimiento = moment(newDate).unix();
		paxData.booking_type = "normal";
		paxData.liga_pago = "";
		paxData.expire_time = "";
		this.lottieService.setLoader(true, '');
		this.setFirebase();
		paxData.booking_type = "credit";
		paxData.liga_pago = "";
		paxData.expire_time = "";

		this.subscription.add(
			this.aereosService.sendPaxData(paxData).subscribe((result) => { // <= servicio de Prebooking
				console.log("cobrar credito", result)
				if (result.status == 'success') {
					this.lottieService.setLoader(false, '');
					//this.modalCobrarCreditoOpen();
				} else {
					this.lottieService.setLoader(false, '');
					this.sweetAlertService.error(
						result.title,
						result.message,
					);
				}
			}, error => {
				var title;
				var msg;
				this.translate.get('vuelos.error').subscribe((data: any) => { title = data; });
				this.translate.get('vuelos.error-server').subscribe((data: any) => { msg = data; });
				this.lottieService.setLoader(false, '');
				console.error(error);
				this.sweetAlertService.error(
					title,
					msg
				);
			})
		);
	}

	// prebookFlight(paxData) {
	// 	let fecha = new Date();
	// 	let newDate = moment(fecha).add(10, 'm').toDate();
	// 	let vencimiento = moment(newDate).unix();
	// 	// this.spinnerService.show();

	// 	this.lottieService.setLoader(true, '');
	// 	this.setFirebase();
	// 	this.aereosService.sendPaxData(paxData).subscribe((result) => {
	// 		// this.spinnerService.hide();

	// 		if (result.status == 'success') {
	// 			window.scroll(0, 0);
	// 			// this.spinnerService.show();
	// 			this.formcheck = false;
	// 			let payData = {
	// 				key: 'key_FgdScfVGhjBgbHyWsf',
	// 				idproducto: 'AEOS',
	// 				monto: this.tarifa.costoTotal,
	// 				referencia: this.uuid,
	// 				descripcion: '',
	// 				metadata: '',
	// 				vencimiento: vencimiento,
	// 			}


	// 			this.aereosService.aereosPay(payData).subscribe((res) => {
	// 				// this.spinnerService.hide();
	// 				this.ligaPago = res.url;
	// 				this.iframeUrl = this.sanitizer.bypassSecurityTrustResourceUrl(res.url);
	// 				this.lottieService.setLoader(false, '');
	// 			}, error => {
	// 				var title;
	// 				var msg;
	// 				this.translate.get('vuelos.error').subscribe((data: any) => { title = data; });
	// 				this.translate.get('vuelos.error-pasarela').subscribe((data: any) => { msg = data; });

	// 				this.lottieService.setLoader(false, '');
	// 				this.formcheck = true;
	// 				this.sweetAlertService.error(
	// 					title,
	// 					msg,
	// 				);
	// 			});
	// 		} else {
	// 			this.lottieService.setLoader(false, '');
	// 			this.sweetAlertService.error(
	// 				result.title,
	// 				result.message,
	// 			);
	// 		}
	// 	}, error => {
	// 		var title;
	// 		var msg;
	// 		this.translate.get('vuelos.error').subscribe((data: any) => { title = data; });
	// 		this.translate.get('vuelos.error-server').subscribe((data: any) => { msg = data; });
	// 		this.lottieService.setLoader(false, '');
	// 		console.error(error);
	// 		this.sweetAlertService.error(
	// 			title,
	// 			msg
	// 		);
	// 	});
	// }

	clipboardLinkk() { 
		navigator.clipboard.writeText(this.ligaPago);
		var liga;
		this.translate.get('vuelos.liga').subscribe((data: any) => { liga = data; });
		this.sweetAlertService.success(liga);
	}

	setFirebase() {
		this.subscription.add(
			this.aereosService.setPrebooking(this.uuid)
		);
		this.watchFirebase();
	}

	watchFirebase() {

		this.aereosService.watchFirebase(this.uuid).subscribe(result => {
			var loadConfirmacion;
			var errorReservacion;
			var volverResults;
			var errorPago;
			var volverCargar;
			this.translate.get('vuelos.corfimando-reserva').subscribe((data: any) => { loadConfirmacion = data; });
			this.translate.get('vuelos.no-pudimos-procesar-reserva').subscribe((data: any) => { errorReservacion = data; });
			this.translate.get('vuelos.volver-resultados').subscribe((data: any) => { volverResults = data; });
			this.translate.get('vuelos.no-pudimos-procesar-pago').subscribe((data: any) => { errorPago = data; });
			this.translate.get('vuelos.volver-cargar').subscribe((data: any) => { volverCargar = data; });

			if (result.status_prebooking === 'CO' && result.status_payment === 'PE') {
				this.aereosService.updateToPayment(this.uuid);
			}
			if (result.status_payment === 'PA') {
				setTimeout(() => {
					window.scroll(0, 0);
					this.lottieService.setLoader(true, loadConfirmacion);
					if (result.status_booking === 'CO') {
						this.lottieService.setLoader(false, '');
						this.aereosService.setBooking(result);
						this.clearData();
						this.router.navigate(['/confirm'])
					} else if (result.status_booking === 'ERR') {
						this.lottieService.setLoader(false, '');
						// this.sweetAlertService.confirm({
						// 	title: 'Lo sentimos, no pudimos procesar tu reservación',
						// 	text: 'DA CLICK PARA VOLVER A MOSTRAR RESULTADOS.',
						// 	confirmButtonText: 'VOLVER A CARGAR'
						// }, this.goToResults.bind(this));
						this.sweetAlertService.confirm({
							title: errorReservacion,
							text: result.error_detail,
							confirmButtonText: volverResults
						}, this.goToResults.bind(this));

					}
				}, 5000)
			} else if (result.status_payment === 'DE') {
				var msg;
				this.translate.get('vuelos.cobro-vuelo').subscribe((data: any) => { msg = data; });
				window.scroll(0, 0);
				this.sweetAlertService.confirm({
					title: 'Lo sentimos, no pudimos procesar tu pago',
					text: 'EL COBRO DE TU VUELO ' + result.booking_Data.tramos[0].detalles[0].vuelos + ' ESTÁ PENDIENTE. NRO. DE RESERVA ' + result.booking_Data.localizador + ' ESTO PUEDE SER PORQUE TODAVÍA TE FALTA REALIZAR EL PAGO O PORQUE HUBO UN PROBLEMA CON LA TARJETA QUE USASTE PARA HACER LA COMPRA. ¡NO TE PREOCUPES! TODAVÍA ESTÁS A TIEMPO DE HACER EL PAGO O UTILIZAR OTRA TARJETA PARA ASEGURAR TU VIAJE.',
					confirmButtonText: 'VOLVER A CARGAR'
				}, this.goToResults.bind(this));
				this.lottieService.setLoader(false, '');
			}
		});
	}

	goToResults() {
		this.clearData();
		this.router.navigate(['/vuelos'])
	}

	clearData() {
		localStorage.removeItem('item_flight')
		localStorage.removeItem(this.uuid)
		clearInterval(this.interval);
		this.cookies.delete('counter');
	}

	phones() {
		this.aereosService.phones().subscribe(phones => {
			this.listPhones = phones.data;
		})
	}

	titulos() {
		this.aereosService.titulos().subscribe(titulos => {
			this.listTitulos = titulos.data;
		})
	}

	documents() {
		this.aereosService.documents().subscribe(documents => {
			this.listDocuments = documents.data;
		})
	}

	soloNumeros(e) {
		var key = window.event ? e.which : e.keyCode;
		if (key < 48 || key > 57) {
			e.preventDefault();
		}
	}
	cotizarPagar(event: any): void {
		this.operType = event.target.value;
		if (event.target.value === "cotizar") {
			this.cotizar = true;
			this.reservar = false;
		}
		else {
			this.reservar = true;
			this.cotizar = false;
		}
	}

	getAirlines() {
		this.subscription.add(
			this.aereosService.getAirlines().subscribe(resp => {
				this.airlines = resp.data;
			})
		)
	}

	airlineName(iata) {
		var airline;
		var iata = iata;
		var name_airline;
		airline = this.airlines.find(function (air) { return air.id == iata });
		(typeof airline === 'undefined')? name_airline = 'N/A' : name_airline = airline.airline;
		return name_airline;
	}


	ngOnDestroy() {
		this.subscription.unsubscribe();
		this.resetCounter();
	}
}
