import { Component, OnInit } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { AuthenticationService, MicroblogService } from "@app/services";
import { TranslateService } from '@ngx-translate/core';

@Component({
  selector: 'app-microblog',
  templateUrl: './microblog.component.html',
  styleUrls: []
})
export class MicroblogComponent implements OnInit {
  publicaciones;
  constructor(
    private router: Router,
    public microblogService: MicroblogService,
    private translate: TranslateService,
    private auth: AuthenticationService
  ) {
    this.auth.getLang().subscribe(res=>{
      translate.setDefaultLang(res);
    });
  }

  ngOnInit() {
    // this.publicaciones = this.data.data;
    this.getPubliaciones();
  }

  getPubliaciones() {
    const limit = false;
    this.microblogService.getPublicaciones(limit).subscribe(r => {
      this.publicaciones = r.data;
    });
  }

}
