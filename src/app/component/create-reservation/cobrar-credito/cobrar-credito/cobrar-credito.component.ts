import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { AereosService, AuthenticationService, SweetalertService } from '@app/services';
import { LottieService } from '@app/services/lottie.service';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';
import { TranslateService } from '@ngx-translate/core';
import { CookieService } from 'ngx-cookie-service';


@Component({
  selector: 'app-cobrar-credito',
  templateUrl: './cobrar-credito.component.html',
  styleUrls: ['./cobrar-credito.component.sass']
})
export class CobrarCreditoComponent implements OnInit {
  tramos;
  tipoVuelo;
  formPax;
  user;
  totalText: string = "";
  tarifa;
  paxData;
  uuid: string;
  interval;

  constructor(public activeModal: NgbActiveModal,private translate: TranslateService,private auth: AuthenticationService,
    private lottieService: LottieService,private aereosService: AereosService,private sweetAlertService: SweetalertService,
    private router: Router,private cookies: CookieService, ){
    this.auth.getLang().subscribe(res => {
			translate.setDefaultLang(res);
		});
   }

  ngOnInit(): void {
    console.log("tramos",this.tramos);
    console.log("tipoVuelo",this.tipoVuelo);
    console.log("formPax",this.formPax.controls.adultos.value);
  }

  formatTime(timeString) {
		let timeTokens = timeString.split(":");
		return `${timeTokens[0]}:${timeTokens[1]}`;
	}
  sumExtras(tarifa) {
		return tarifa.TUA.TUA_total + tarifa.impuestos.impuesto_total;
	}
  sumCostos(tarifa) {
		return (tarifa.adultos.costo * tarifa.adultos.cantidad) + (tarifa.infantes.costo * tarifa.infantes.cantidad) + (tarifa.menores.costo * tarifa.menores.cantidad);
	}

  confirmarCobrarCredito(): void {
		this.lottieService.setLoader(true, '');
		this.setFirebase();
		this.paxData.booking_type = "credit";
		this.paxData.liga_pago = "";
		this.paxData.expire_time = "";
		this.aereosService.sendPaxData(this.paxData).subscribe((result) => { // <= servicio de Prebooking
			console.log("cobrar credito", result)
			if (result.status == 'success') {
				this.lottieService.setLoader(false, '');
        this.activeModal.close('Modal Closed');
				
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
		});
	}
  setFirebase() {
		this.aereosService.setPrebooking(this.uuid);
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
			}
		});
	}
  clearData() {
		localStorage.removeItem('item_flight')
		localStorage.removeItem(this.uuid)
		clearInterval(this.interval);
		this.cookies.delete('counter');
	}
  goToResults() {
		this.clearData();
		this.router.navigate(['/vuelos'])
	}

}
