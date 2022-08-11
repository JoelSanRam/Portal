import { AuthenticationService, IframeService } from '@app/services';
import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { SweetalertService } from '@app/services/sweetalert.service';
import { TranslateService } from '@ngx-translate/core';

@Component({
  selector: 'app-iframe',
  templateUrl: './iframe.component.html',
  styleUrls: []
})
export class IframeComponent implements OnInit {
  iframeList;

  constructor(
    private router: Router,
    private iframeService: IframeService,
    private swal: SweetalertService,
    private translate: TranslateService,
    private auth: AuthenticationService
  ) {
    this.auth.getLang().subscribe(res=>{
      translate.setDefaultLang(res);
    });
  }

  ngOnInit() {
    this.getIframeList();
  }

  createIframe() {
    this.router.navigate(['iframe/crear']);
  }

  getIframeList() {
    this.iframeService.getIframeList().subscribe(r => this.iframeList = r);
  }

  getIframe(id: number) {
    this.router.navigate([`iframe/${id}`]);
  }

  deleteIframe(id: number) {
    this.iframeService.deleteIframe(id).subscribe((r) => {
      this.swal.alert(r.title, r.msg, r.status);
      this.getIframeList();
    });
  }
}
