import { Component, OnInit } from '@angular/core';
import { AuthenticationService, SweetalertService } from '@app/services';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';
import { TranslateService } from '@ngx-translate/core';

@Component({
  selector: 'app-pagar-reservation',
  templateUrl: './pagar-reservation.component.html',
  styleUrls: ['./pagar-reservation.component.sass']
})
export class PagarReservationComponent implements OnInit {
  iframeUrl;
  ligaPago: string;

  constructor( public activeModal: NgbActiveModal,private translate: TranslateService,
		private auth: AuthenticationService,private sweetAlertService: SweetalertService,) {
      this.auth.getLang().subscribe(res => {
        translate.setDefaultLang(res);
      });
     }

  ngOnInit(): void {
    console.log("ifram",this.iframeUrl)
  }
  clipboardLinkk() {
		navigator.clipboard.writeText(this.ligaPago);
		var liga;
		this.translate.get('vuelos.liga').subscribe((data: any) => { liga = data; });
		this.sweetAlertService.success(liga);
	}

}
