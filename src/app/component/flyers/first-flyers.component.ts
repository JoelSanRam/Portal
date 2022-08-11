import { Component, OnInit } from '@angular/core';
import { AuthenticationService, FlyersService } from '@app/services';
import { TranslateService } from '@ngx-translate/core';

@Component({
  selector: 'app-first-flyers',
  templateUrl: './first-flyers.component.html',
  styleUrls: [],
})
export class FirstFlyersComponent implements OnInit {
  idOperador;
  firstFlyers = [];
  token;

  constructor(
    private flyersService: FlyersService,
    private translate: TranslateService,
    private auth: AuthenticationService
  ) {
    this.auth.getLang().subscribe(res=>{
      translate.setDefaultLang(res);
    });
  }

  ngOnInit() {
    this.idOperador = localStorage.getItem('access_ope');
    this.getFirstFlyers();
    this.token = localStorage.getItem('access_token');
  }

  getFirstFlyers() {
    this.flyersService.getFlyers(this.idOperador).subscribe((response) => {
      if(response){
        this.firstFlyers = response;
        this.firstFlyers[0].active = true;
        for (let f of this.firstFlyers) {
          let flyer = f.flyers.slice(0, 4);
          f.flyers = flyer;
        }
      }
    });
  }

  setActive(flyer) {
    for (let flyers of this.firstFlyers) {
      flyers.active = false;
    }
    flyer.active = true;
  }
}
