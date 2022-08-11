import { Component, OnInit } from '@angular/core';
import { ReservacionesService } from "../../../services";
import { DatePipe } from "@angular/common";

@Component({
  selector: 'app-ultimas-reservas',
  templateUrl: './ultimas-reservas.component.html',
  styleUrls: []
})
export class UltimasReservasComponent implements OnInit {
  ultimasReservas;
  hasta;
  desde;
  constructor(
    private reservacionesService: ReservacionesService,
    private datePipe: DatePipe,
  ) {
    this.hasta = new Date(Date.now());
    this.desde = new Date();
    this.desde.setDate(this.hasta.getDate() - 3);
  }

  ngOnInit() {
    this.getUltimasReservas();
  }

  getUltimasReservas () {
    // const params = '';
    let desde = this.datePipe.transform(this.desde, 'yyyy-MM-dd');
    let hasta = this.datePipe.transform(this.hasta, 'yyyy-MM-dd');
    const params = 'tipofecha=FRV&desde=' + desde + '&hasta=' + hasta + '&status=PA,CO,PE';
    this.reservacionesService.getReservaciones(params).subscribe( response => {
      // console.info('ultimas reservas',response);
      this.ultimasReservas = response;
    });
  }

}
