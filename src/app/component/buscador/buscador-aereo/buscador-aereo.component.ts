import { Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { TypeaheadMatch } from 'ngx-bootstrap/typeahead/typeahead-match.class';
import { Observable, Observer, of } from 'rxjs';
import { switchMap } from 'rxjs/operators';
import { AereosService } from '@app/services/aereos.service';
import { AuthenticationService } from '@app/services';
import { User } from '@app/models';
import { BsDatepickerConfig, BsDaterangepickerDirective, BsLocaleService } from 'ngx-bootstrap/datepicker';
import { DatePipe } from '@angular/common';
import { Router, ActivatedRoute, NavigationExtras } from "@angular/router";
import { AereosComponent } from '@app/component/aereos/aereos.component';
import * as moment from 'moment';
import { LottieService } from '@app/services/lottie.service';
import { TranslateService } from '@ngx-translate/core';

@Component({
	selector: "app-buscador-aereo",
	templateUrl: "./buscador-aereo.component.html",
})
export class BuscadorAereoComponent implements OnInit {
	currentUser: User;
	// idOpe;
	tipoVuelo;
	totalDestinos;
	noDates = false;
	showOptions = false;
	destinosForm = [
		{
			origenLabel: "",
			origen: "",
			nombreOrigen: "",
			origenError: false,
			destinoLabel: "",
			destino: "",
			nombreDestino: "",
			destinoError: false,
		},
	];
	aereosForm = {
		destino: [],
		fechas: [
			{
				fecha: "",
			},
			{
				fecha: "",
			},
		],
		pax: [
			{
				adultos: 0,
				menores: 0,
				infantes: 0,
				edadesinfantes: [],
				edadesmenores: [],
			},
		],
		clase: "Clase economica",
		air_content_provider: ["amadeus", "volaris"],
		pagina: 1,
		orden: "precio",
		resultados: 200,
		PromotionCode: "VLN30",
		idoperador: "",
		type: "",
	};
	destinos;
	// Fechas
	fechas = [
		{
			dia: moment().format('DD'),
			mes: moment().format('MMM'),
			anio: moment().format('YYYY'),
			fecha: moment().toDate(),
		},
		{
			dia: moment().add(3, 'day').format('DD'),
			mes: moment().add(3, 'day').format('MMM'),
			anio: moment().add(3, 'day').format('YYYY'),
			fecha: moment().toDate(),
		},
	];
	bsConfig: Partial<BsDatepickerConfig>;
	today = moment();
	todayPlus2 = moment().add(3, 'days');

	minDate: Date = moment().add(0, 'days').toDate();
	maxDate: Date = moment().add(365, 'days').toDate();
	locale = "es";
	meses: Array<string>;
	isOpen = [false, false, false, false, false];
	fechasError: boolean = false;

	personas = {
		total: 1,
		adultos: 1,
		infantes: 0,
		menores: 0,
		edadinfantes: [],
		edadmenores: [],
		error: false,
	};
	edadesInfantes = [0, 1, 2];
	edadesMenores = [3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17];
	showMaxPerson: boolean;
	showNoInfant: boolean;
	showNoMenor: boolean;
	@ViewChild("dropdownMenuButton", { static: true })
	dropdownMenuButton: ElementRef<HTMLElement>;
	submitted = false;
	returnUrl;
	tramosHidden: boolean = false;
	searchParams: any;

	constructor(
		private aereosService: AereosService,
		private authenticationService: AuthenticationService,
		private localeService: BsLocaleService,
		private datePipe: DatePipe,
		private route: ActivatedRoute,
		private router: Router,
		private aereosComponent: AereosComponent,
		private lottieService: LottieService,
		private translate: TranslateService,
		private activatedRoute: ActivatedRoute,
	) {
		this.authenticationService.currentUser.subscribe(
			(x) => (this.currentUser = x)
		);

		this.localeService.use(this.locale);
	}

	ngOnInit(): void {
		var msg;
		this.translate.get('vuelos.buscando-precios').subscribe((data: any) => { msg = data; });
		this.lottieService.setLoader(true, msg);
		this.bsConfig = Object.assign(
			{},
			{
				minDate: this.minDate,
				maxDate: this.maxDate,
				dateInputFormat: "YYYY-MM-DD",
				containerClass: "theme-dark-blue",
				showWeekNumbers: false,
				adaptivePosition: true
			}
		);

		this.aereosService.getFlightsSearchParams().subscribe((params_aereo) => {
			if (params_aereo) {
				this.aereosForm.PromotionCode = params_aereo.request.PromotionCode;
				this.aereosForm.air_content_provider = params_aereo.request.air_content_provider;
				this.aereosForm.clase = params_aereo.request.clase;
				this.aereosForm.idoperador = params_aereo.request.idoperador;
				this.aereosForm.orden = params_aereo.request.orden;
				this.aereosForm.pagina = params_aereo.request.pagina;
				this.aereosForm.resultados = params_aereo.request.resultados;
				this.destinosForm = params_aereo.destinos;
				this.fechas = params_aereo.fechas;
				this.personas = params_aereo.pax;
				this.tipoVuelo = params_aereo.request.type;
				this.totalDestinos = params_aereo.destinos.length;
			} else {
				this.fechas[0].fecha = this.today.toDate();
				this.fechas[1].fecha = this.todayPlus2.toDate();
				this.tipoVuelo = "roundtrip";
				this.totalDestinos = 2;
				this.lottieService.setLoader(false, '');

			}

		});
		this.activatedRoute.queryParams.subscribe(params => {

			if (this.router.getCurrentNavigation().extras.state) {
				this.searchParams = this.router.getCurrentNavigation().extras.state.searchParams;
				if (typeof (this.searchParams) != 'undefined') {
					this.searchFlights();

				}
			}
		});

	}

	changeTipoVuelo(ev) {
		this.tipoVuelo = ev.target.value;
		switch (this.tipoVuelo) {
			case "roundtrip":
				this.totalDestinos = 2;
				this.destinosForm.splice(1);
				this.fechas.splice(1);
				this.fechas.push({
					dia: this.today.format('DD'),
					mes: this.today.format('MMM'),
					anio: this.today.format('YYYY'),
					fecha: this.today.toDate()
				});
				break;
			case "single":
				this.totalDestinos = 1;
				this.destinosForm.splice(1);
				this.fechas.splice(1);
				break;
			case "multitrip":
				this.totalDestinos = 2;
				this.destinosForm.splice(1);
				this.destinosForm.push({
					origenLabel: "",
					origen: "",
					nombreOrigen: "",
					origenError: false,
					destinoLabel: "",
					destino: "",
					nombreDestino: "",
					destinoError: false,
				});
				this.fechas.splice(1);
				this.fechas.push({
					dia: this.todayPlus2.format('DD'),
					mes: this.todayPlus2.format('MMM'),
					anio: this.todayPlus2.format('YYYY'),
					fecha: this.todayPlus2.toDate()
				});
				break;
		}
	}

	autocompleteAirport(airportName) {
		this.destinos = new Observable((observer: Observer<any>) => {
			observer.next(airportName);
		}).pipe(
			switchMap((query: any) => {
				if (query) {
					return this.aereosService.autocompleAirport(query);
				}
				return of([]);
			})
		);
	}

	onSelectAirport(event: TypeaheadMatch, type, index): void {
		if (type == "origen") {
			this.destinosForm[index].origenLabel =
				"(" +
				event.item.codigo +
				") " +
				event.item.ciudad +
				", " +
				event.item.pais;
			this.destinosForm[index].origen = event.item.codigo;
			this.destinosForm[index].nombreOrigen = event.item.ciudad;
		} else if (type == "destino") {
			this.destinosForm[index].destinoLabel =
				"(" +
				event.item.codigo +
				") " +
				event.item.ciudad +
				", " +
				event.item.pais;
			this.destinosForm[index].destino = event.item.codigo;
			this.destinosForm[index].nombreDestino = event.item.ciudad;
		}
	}

	addRmTramo(type, index) {
		switch (type) {
			case "add":
				if (this.totalDestinos < 6) {
					this.totalDestinos += 1;
					this.destinosForm.push({
						origenLabel: "",
						origen: "",
						nombreOrigen: "",
						origenError: false,
						destinoLabel: "",
						destino: "",
						nombreDestino: "",
						destinoError: false,
					});
					this.fechas.push({
						dia: this.todayPlus2.format('DD'),
						mes: this.todayPlus2.format('MMM'),
						anio: this.todayPlus2.format('YYYY'),
						fecha: this.todayPlus2.toDate()
					});
				}
				break;
			case "rm":
				if (this.totalDestinos > 2) {
					this.totalDestinos -= 1;
					this.destinosForm.splice(index, 1);
					this.fechas.splice(index, 1);
				}
				break;
		}
	}

	onValueChange(value: Date, index): void {
		this.fechasError = false;
		this.isOpen = [false, false, false, false, false];
		var fechaMoment = moment(value)
		this.fechas[index].fecha = fechaMoment.toDate();
		this.fechas[index].dia = fechaMoment.format('DD');
		this.fechas[index].mes = fechaMoment.format('MMM');
		this.fechas[index].anio = fechaMoment.format('YYYY');

		if (moment(this.fechas[index + 1].fecha).isSame(this.fechas[index].fecha, 'day')) {
		} else {
			if (this.fechas[index + 1] && moment(this.fechas[index + 1].fecha).isBefore(this.fechas[index].fecha, 'day')) {
				this.fechas[index + 1].fecha = fechaMoment.toDate();
				var afterdays = moment(this.fechas[index].fecha).add(2, 'days').toDate();
				this.fechas[index + 1].fecha = afterdays;

				this.fechas[index + 1].dia = moment(this.fechas[index + 1].fecha).format('DD');
				this.fechas[index + 1].mes = moment(this.fechas[index + 1].fecha).format('MMM');
				this.fechas[index + 1].anio = moment(this.fechas[index + 1].fecha).format('YYYY');
			}

		}
	}

	addRemovePerson(personType, type) {
		switch (type) {
			case "add":
				switch (personType) {
					case "adultos":
						if (this.personas.total < 9) {
							this.personas.adultos += 1;
						}
						break;
					case "menores":
						if (
							this.personas.adultos > 0 &&
							this.personas.total < 9
						) {
							this.personas.menores += 1;
							this.personas.edadmenores.push(3);
						}
						break;
					case "infantes":
						if (this.personas.infantes < this.personas.adultos && this.personas.total < 9) {
							this.personas.infantes += 1;
							this.personas.edadinfantes.push(0);
						}
						break;
				}
				break;
			case "rm":
				switch (personType) {
					case "adultos":
						if (this.personas.adultos > 0) {
							this.personas.adultos -= 1;
							if (
								this.personas.infantes > this.personas.adultos
							) {
								this.personas.infantes = this.personas.adultos;
								this.personas.edadinfantes.pop();
							}
							if (this.personas.adultos <= 0) {
								this.personas.menores = 0;
								this.personas.edadmenores = [];
							}
						}
						break;
					case "menores":
						if (this.personas.menores > 0) {
							this.personas.menores -= 1;
							this.personas.edadmenores.pop();
						}
						break;
					case "infantes":
						if (this.personas.infantes > 0) {
							this.personas.infantes -= 1;
							this.personas.edadinfantes.pop();
						}
						break;
				}
				break;
		}
		this.personas.total = this.personas.adultos + this.personas.menores + this.personas.infantes;

		this.personas.total == 9
			? (this.showMaxPerson = true)
			: (this.showMaxPerson = false);
		this.personas.infantes == this.personas.adultos
			? (this.showNoInfant = true)
			: (this.showNoInfant = false);
		this.personas.adultos == 0
			? (this.showNoMenor = true)
			: (this.showNoMenor = false);
		console.log(this.personas)
	}

	validateData() {
		let isValid = true;
		for (const destino of this.destinosForm) {
			if (
				typeof destino.origen === "undefined" ||
				destino.origen === ""
			) {
				destino.origenError = true;
				isValid = false;
			} else {
				destino.origenError = false;
			}
			if (
				typeof destino.destino === "undefined" ||
				destino.destino === ""
			) {
				destino.destinoError = true;
				isValid = false;
			} else {
				destino.destinoError = false;
			}
		}

		for (let i = 0; i < this.fechas.length; i++) {
			if (this.fechas[i + 1]) {
				if (moment(this.fechas[i + 1].fecha).isSame(this.fechas[i].fecha, 'day')) {
				} else {
					if (moment(this.fechas[i + 1].fecha).isBefore(this.fechas[i].fecha, 'day')) {
						this.fechasError = true;
						isValid = false;
					}
				}
			}
			if (typeof this.fechas[i].fecha === "undefined") {
				isValid = false;
			}
		}
		if (this.personas.total == 0) {
			this.personas.error = true;
			isValid = false;
		} else {
			this.personas.error = false;
		}
		return isValid;
	}

	searchFlights() {
		if (this.validateData()) {
			var msg;
			this.translate.get('vuelos.buscando-precios').subscribe((data: any) => { msg = data; });
			this.lottieService.setLoader(true, msg);
			if (this.tipoVuelo == "roundtrip") {
				this.aereosForm.destino = [];
				this.aereosForm.destino[0] = {
					origen: this.destinosForm[0].origen,
					nombreOrigen: this.destinosForm[0].nombreOrigen,
					destino: this.destinosForm[0].destino,
					nombreDestino: this.destinosForm[0].nombreDestino,
				};
				this.aereosForm.destino[1] = {
					origen: this.destinosForm[0].destino,
					nombreOrigen: this.destinosForm[0].nombreDestino,
					destino: this.destinosForm[0].origen,
					nombreDestino: this.destinosForm[0].nombreOrigen,
				};
			} else {
				this.aereosForm.destino = [];
				for (const destino of this.destinosForm) {
					this.aereosForm.destino.push({
						origen: destino.origen,
						nombreOrigen: destino.nombreOrigen,
						destino: destino.destino,
						nombreDestino: destino.nombreDestino,
					});
				}
			}
			this.aereosForm.fechas = [];
			for (const fecha of this.fechas) {
				this.aereosForm.fechas.push({
					fecha: this.datePipe.transform(fecha.fecha, "yyyy-MM-dd"),
				});
			}

			this.aereosForm.pax = [
				{
					adultos: this.personas.adultos,
					menores: this.personas.menores,
					infantes: this.personas.infantes,
					edadesinfantes: this.personas.edadinfantes,
					edadesmenores: this.personas.edadmenores,
				},
			];
			this.aereosForm.idoperador = this.currentUser.userData.idOperador;
			this.aereosForm.type = this.tipoVuelo;
			this.aereosForm['agencia'] = {
				id_usuario: this.currentUser.userData.idUser,
				id_agencia: this.currentUser.userData.idAgencia
			};
			this.aereosForm['origen_plataforma'] = this.currentUser.userData.origen;
			let searchParams = {
				destinos: this.destinosForm,
				fechas: this.fechas,
				pax: this.personas,
				request: this.aereosForm
			};
		
			this.submitted = true;

			this.returnUrl = this.route.snapshot.queryParams["returnUrl"] || "/vuelos";
			this.aereosService.setFlightsSearchParams(searchParams); //Setter

			let NavigationExtras: NavigationExtras = {
				state: {
					searchParams,
				},
			};
			this.tramosHidden = true;
			this.submitted = false;
			if (this.router.url == "/vuelos") {
				this.aereosComponent.preSearchFlights();
			} else {
				this.router.navigate([this.returnUrl], NavigationExtras);
			}
		}
	}
	
}
