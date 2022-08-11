import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { CookieService } from 'ngx-cookie-service';
import { NgxSpinnerService } from 'ngx-spinner';

@Component({
  selector: 'app-errors-msj',
  templateUrl: './errors-msj.component.html',
  styleUrls: []
})
export class ErrorsMsjComponent implements OnInit {
  public type: string;

  constructor(
    private activatedRoute: ActivatedRoute,
    private router: Router,
  ) { }

  ngOnInit(): void {
    this.activatedRoute.queryParams.subscribe((params) => {
      if (params.type) {
        this.type = params.type;
      }
    });
    setTimeout(() => {
      this.goToHome();
    }, 10000);
  }
  
  goToHome() {
    this.router.navigate(['/home']);
  }
}
