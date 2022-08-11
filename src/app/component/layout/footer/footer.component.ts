import { Component, OnInit } from '@angular/core';
import { UserService, AuthenticationService, ConfigService } from '@app/services';

@Component({
  selector: 'app-footer',
  templateUrl: './footer.component.html',
  styleUrls: []
})
export class FooterComponent implements OnInit {
  rsociales = ConfigService.configFile.redes_sociales;

  constructor() { }

  today = new Date();
  year = this.today.getFullYear();

  ngOnInit() {
    // console.info('las sociales',this.rsociales);
  }

}
