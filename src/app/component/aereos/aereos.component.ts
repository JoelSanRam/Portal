import { Component, OnInit, Injectable, OnDestroy } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { AereosService, AuthenticationService, FirebaseService, SharedService, SweetalertService } from '@app/services';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { CookieService } from 'ngx-cookie-service';
import { PlanTarifarioComponent } from './plan-tarifario/plan-tarifario.component';
import { LottieService } from '@app/services/lottie.service';
import { Subscription } from 'rxjs';
import { TranslateService } from '@ngx-translate/core';

@Component({
	selector: "app-aereos",
	templateUrl: "./aereos.component.html",
	styleUrls: [],
})
@Injectable({
	providedIn: "root",
})
export class AereosComponent implements OnInit, OnDestroy {
	private subscription: Subscription = new Subscription();

	user;
	searchParams: any;
	listFlights: any;
	today = new Date(Date.now());
	noResults: boolean = false;
	errorType: string = 'results'
	errorMessage: string;
	tipoVuelo: string;
	flightForm: FormGroup;
	uuid: string;
	identificador: string;
	filtros: any;
	selectedFilters: any = {
		ordenar: '',
		aerolinea: [],
		escalas: [],
		horarios: {},
		duracion: [],
		precio: []
	};
	showFilters: boolean = false;
	msgServisor:string = "";

	currentPage;
	totalResultados;
	maxSize = 10;
	pagina;
	filters;
	airlines;
	url_loader;
	constructor(
		private aereosService: AereosService,
		private sharedService: SharedService,
		private formBuilder: FormBuilder,
		private modalService: NgbModal,
		private router: Router,
		private activatedRoute: ActivatedRoute,
		public sweetAlertService: SweetalertService,
		private cookies: CookieService,
		private lottieService: LottieService,
		private fb : FirebaseService,
		private auth : AuthenticationService,
		private translate: TranslateService,
	) {
		this.flightForm = this.formBuilder.group({});
		this.sharedService.usuarioObserver.subscribe((user) => {
			this.user = user;
		});
		this.activatedRoute.queryParams.subscribe(params => {
			if (this.router.getCurrentNavigation().extras.state) {
				this.searchParams = this.router.getCurrentNavigation().extras.state.searchParams;
				if (typeof (this.searchParams) != 'undefined') {
					this.searchFlights();
				}
			}
		});
		if(this.msgServisor===""){
		this.auth.getLang().subscribe(res => {
			translate.setDefaultLang(res);
		});
		}
		this.auth.setTypeLoader('vuelos');
	}

	ngOnInit() {
		this.url_loader = this.auth.getTypeLoader();
		this.fb.loginFirebase();
		this.getAirlines();
	}

	toolHtml() {
		let html = '<div class="text-left">Vuelo más económico</div>';
		return html;
	}

	preSearchFlights() {
		this.aereosService.getFlightsSearchParams().subscribe((params) => {
			this.searchParams = params;
		});
		this.searchFlights();
	}

	searchFlights() {
		if(this.msgServisor===""){
			this.auth.getLang().subscribe(res => {
				this.translate.setDefaultLang(res);
			});
		}
		this.translate.get('vuelos.problema-servidor').subscribe((data: any) => { this.msgServisor = data; });
		let request = this.searchParams.request;
		this.listFlights = [];
		this.selectedFilters = {
			ordenar: 'menor',
			aerolinea: [],
			escalas: [],
			horarios: {},
			duracion: [],
			precio: []
		};
		this.currentPage = 1;
		this.filters = {};
		this.aereosService.setSelectedFilters(this.selectedFilters);
		this.aereosService.disponibilidadAereos(request).subscribe(
			(results) => {
				this.lottieService.setLoader(false, '');
				this.formatResults(results)
				this.currentPage = results.paginacion.page;
				this.totalResultados = results.paginacion.total_items;
			},
			(err) => {
				this.lottieService.setLoader(false, '');
				this.noResults = true;
				this.errorMessage = this.msgServisor;
			}
		);
	}

	// Recibir filtros del componente FiltrosAereos y obtener resultados filtrados
	getFilters(filters, nvoFiltro) {
		var msg;
		this.translate.get('vuelos.problema-text').subscribe((data: any) => { msg = data; });
		var title;
		this.translate.get('vuelos.problema-servidor').subscribe((data: any) => { title = data; });
		if (nvoFiltro == true) { this.currentPage = 1; }
		this.filters = filters;
		this.lottieService.setLoader(true, '');
		// Crear json de filtros
		var toFilter = {
			uuid: this.uuid,
			filtros: this.filters,
			pagina: this.currentPage
		}

		this.listFlights = [];
		this.aereosService.getFilteredResults(toFilter).subscribe(results => {
			this.formatResults(results);
			this.totalResultados = results.paginacion.total_items;
			this.currentPage = results.paginacion.page;
			this.lottieService.setLoader(false, '');
		}, error => {
			this.lottieService.setLoader(false, '');
			this.sweetAlertService.info(title, msg);
			console.error(error);
		});

	}

	openFilters(value) {
		this.showFilters = value;
	}

	// Formatear resultados para mostrarse en la vista
	formatResults(results) {
		window.scroll(0, 0);
		this.listFlights = [];
		if (results.length === 0) {
			this.noResults = true;
			this.errorType = 'results';
			this.errorMessage =
				"Lo sentimos, no hay vuelos disponibles, favor de generar una nueva búsqueda.";
		} else {

			this.listFlights = results.flights;
			this.tipoVuelo = results.type;
			this.uuid = results.uuid;
			this.identificador = results.identificador;

			if (typeof this.listFlights[0].flights.items != "undefined" && this.listFlights[0].flights.items.length > 0) {
				this.noResults = false;
				this.filtros = results.filtros_busqueda;
				if (this.selectedFilters.ordenar == '') {
					this.selectedFilters.ordenar = 'menor'
				}
				if (this.selectedFilters.precio.length === 0) {
					this.selectedFilters.precio = [this.filtros.precio_maximo];
				}
				if (this.selectedFilters.duracion.length === 0) {
					for (const duracion of this.filtros.duracion) {
						this.selectedFilters.duracion.push(duracion.maximo_duracion);
					}
				}
				for (const listitem of this.listFlights) {
					for (const item of listitem.flights.items) {
						for (const tramo of item.tramos) {
							for (const [
								index,
								vuelo,
							] of tramo.vuelos.entries()) {
								if (index === 0) {
									vuelo.selected = true;
								} else {
									vuelo.selected = false;
								}
							}
						}
					}
				}
			} else {
				var msg;
				this.translate.get('vuelos.no-vuelos-disponibles').subscribe((data: any) => { msg = data; });
				this.noResults = true;
				this.errorType = 'filtros';
				this.errorMessage = msg;
			}
		}
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

	showMore(index, el) {
		let isvisible = document.getElementsByClassName("isv_" + index);
		let elements = document.getElementsByClassName("flightClass_" + index);
		console.log(isvisible)
		console.log(elements)
		let btn = "showMore_" + index;
		if (isvisible.length) {
			Array.from(isvisible).forEach(function (el) {
				el.className =
					"flight-wrapper flightClass_" + index + " collapse";
			});
			document.getElementById(btn).innerHTML =
				"Ver más vuelos <i class='fas fa-caret-down'></i>";
		} else {
			Array.from(elements).forEach(function (el) {
				el.className =
					"flight-wrapper flightClass_" +
					index +
					" isv_" +
					index +
					" collapse show";
			});
			document.getElementById(btn).innerHTML =
				"Ver menos vuelos <i class='fas fa-caret-up'></i>";
		}
	}

	// Muestra los detalles de escalas
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

	sumDescuento(detDescuento) {
		return detDescuento.adultos.descuento + detDescuento.menores.descuento;
	}

	changeSelectedFlight(event, tramo, vuelo) {
		for (let i = 0; i < tramo.vuelos.length; i++) {
			if (event.target.value == i) {
				tramo.vuelos[i].selected = true;
			} else {
				tramo.vuelos[i].selected = false;
			}
		}
	}

	openFamiliaTar(value) {
		this.lottieService.setLoader(true, '');
		let tramos = value.tramos;
		let ratekey = [];
		let air_content_provider = [];

		for (const tramo of tramos) {
			for (const vuelo of tramo.vuelos) {
				if (vuelo.selected) {
					ratekey.push(vuelo.ratekey);
					air_content_provider.push(vuelo.air_content_provider);
				}
			}
		}

		let checkFamily = {
			ratekey,
			air_content_provider: [...new Set(air_content_provider)]
		}
		console.log(checkFamily)
		this.aereosService.getFamilyFare(checkFamily).subscribe(familias => {
			this.lottieService.setLoader(false, '');
			if (familias.length > 0) {
				const modalRef = this.modalService.open(PlanTarifarioComponent, {
					size: "xl",
					centered: true,
					windowClass: "modal-familia-tarifaria",
				});
				modalRef.componentInstance.familias = familias;
				modalRef.result.then((result) => {
					let newRatekey;
					if (typeof result.ratekey == 'string') {
						newRatekey = [result.ratekey];
					} else {
						newRatekey = result.ratekey;
					}
					let checkData = {
						ratekey: newRatekey,
						air_content_provider: [...new Set(air_content_provider)]
					}
					this.checkFlight(checkData);
				});
			} else {
				this.sweetAlertService.info(familias.title, familias.message)
			}
		}, error => {
			this.lottieService.setLoader(false, '');
			this.sweetAlertService.error('Error', 'Hubo un error con el servidor al obtener las familias tarifarias, intente de nuevo');
			console.error(error)
		})
	}

	selectFlight(value) {
		let tramos = value.tramos;
		let ratekey = [];
		let air_content_provider = [];

		for (const tramo of tramos) {
			for (const vuelo of tramo.vuelos) {
				if (vuelo.selected) {
					ratekey.push(vuelo.ratekey);
					air_content_provider.push(vuelo.air_content_provider);
				}
			}
		}

		let checkData = {
			ratekey,
			air_content_provider: [...new Set(air_content_provider)]
		}

		this.checkFlight(checkData)
	}

	checkFlight(checkData) {
		var title;
		this.translate.get('vuelos.problema-servidor').subscribe((data: any) => { title = data; });
		// this.showLoader = true;
		this.lottieService.setLoader(true, '');
		this.aereosService.checkFlight(checkData).subscribe(result => {
			this.lottieService.setLoader(false, '');
			if (result.status == 'success') {
				let tarifa = result.tarifas;
				let paxs = {
					adultos: tarifa.detalle_Vuelo.adultos.cantidad,
					infantes: tarifa.detalle_Vuelo.infantes.cantidad,
					menores: tarifa.detalle_Vuelo.menores.cantidad,
					edadinfantes: this.searchParams.pax.edadinfantes,
					edadmenores: this.searchParams.pax.edadmenores,
				};

				let itemFlight = {
					uuid: this.uuid,
					ratekey: result.ratekey,
					air_content_provider: checkData.air_content_provider,
					tipoVuelo: this.tipoVuelo,
					documentacion: result.Documentacion,
					politicas: result.politicas,
					tarifa,
					paxs,
					tramos: result.tramos,
					familia_tarifaria: result.familia_tarifaria
				};
				this.goToCheckOut(itemFlight);
			} else {
				this.sweetAlertService.info(result.title, result.message);
			}
		}, error => {
			this.lottieService.setLoader(false, '');
			this.sweetAlertService.info(title, 'No es posible checar la disponibilidad del vuelo en estos momentos. Intentelo más tarde');
			console.error(error);
		});
	}

	goToCheckOut(itemFlight) {
		let date = new Date();
		date.setTime(date.getTime() + (600 * 1000));
		this.cookies.set('counter', '600', { expires: date });
		this.aereosService.setCurrentFlight(itemFlight);
		this.router.navigate(["/checkout"]);
	}

	goToPage() {
		var filtros
		if (typeof this.filters === 'undefined') {
			filtros = {
				ordenar: 'menor'
			}
		} else {
			filtros = this.filters
		}
		this.getFilters(filtros, false)
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
	}

}
