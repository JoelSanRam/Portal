import { Component, OnInit } from '@angular/core';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';
import { AuthenticationService, HotelService } from "@app/services";
@Component({
  selector: 'app-politicas',
  templateUrl: './politicas.component.html',
  styleUrls: []
})
export class PoliticasComponent implements OnInit {
  terminosCondiciones;
  currentUser;
  idOpe;
  constructor(
    private hotelService: HotelService,
    public activeModal: NgbActiveModal,
    private auth : AuthenticationService
  ) {
    this.auth.currentUser.subscribe(x => this.currentUser = x);
    this.idOpe = this.currentUser.userData.idOperador;

  }

  ngOnInit() {
    this.hotelService.terminosCondiciones(this.idOpe).subscribe(tc => this.terminosCondiciones = tc.ptcsterminos);
  }

  closeModal() {
    this.activeModal.close('Modal Closed');
  }

}
