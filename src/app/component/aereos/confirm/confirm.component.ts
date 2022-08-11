import { Component, OnDestroy, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { AereosService, AuthenticationService } from '@app/services';
import { TranslateService } from '@ngx-translate/core';

@Component({
  selector: 'app-confirm',
  templateUrl: './confirm.component.html',
  styleUrls: []
})
export class ConfirmComponent implements OnInit, OnDestroy {
  booking: any;
  interval;
  counter: number = 60;
  constructor(private aereosService: AereosService, private router: Router, private auth: AuthenticationService, private translate: TranslateService) {
    this.auth.getLang().subscribe(res => {
      translate.setDefaultLang(res);
    });
  }

  ngOnInit() {
    this.aereosService.getBooking().subscribe(result => {
      this.booking = result;
    });
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
