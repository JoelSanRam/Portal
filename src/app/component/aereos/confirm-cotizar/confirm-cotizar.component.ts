import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { AereosService } from '../../../services/aereos.service';

@Component({
  selector: 'app-confirm-cotizar',
  templateUrl: './confirm-cotizar.component.html',
  styleUrls: ['./confirm-cotizar.component.sass']
})
export class ConfirmCotizarComponent implements OnInit {
interval;
counter: number = 60;
cotizarResult:any;

  constructor(private router: Router,private aereosService: AereosService) {
    this.cotizarResult=this.aereosService.getCotizarConfirm();

   }

  ngOnInit(): void {
    this.interval = setInterval(() => {
      this.counter--;
      if (this.counter === 0) {
        this.router.navigate(['/reservaciones'])
      }
    }, 1000)
  }

  ngOnDestroy(): void {
    clearInterval(this.interval);
  }


}
