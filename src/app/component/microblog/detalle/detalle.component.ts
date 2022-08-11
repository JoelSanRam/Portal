import { Component, OnInit } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { AuthenticationService, MicroblogService } from '@app/services';
import { DomSanitizer } from '@angular/platform-browser';
import { TranslateService } from '@ngx-translate/core';

@Component({
  selector: 'app-detalle',
  templateUrl: './detalle.component.html',
  styleUrls: [],
})
export class DetalleComponent implements OnInit {
  publicacion;
  operador;
  constructor(
    private activatedRoute: ActivatedRoute,
    private router: Router,
    public microblogService: MicroblogService,
    private sanitizer: DomSanitizer,
    private translate: TranslateService,
    private auth: AuthenticationService
  ) {
    activatedRoute.params.subscribe((val) => {
      this.ngOnInit();
    });
    this.auth.getLang().subscribe(res=>{
      translate.setDefaultLang(res);
    });
  }

  ngOnInit() {
    // this.publicacion = this.data.data[0];
    var id = this.activatedRoute.snapshot.paramMap.get('id');
    this.getPublicacion(id);
  }

  getPublicacion(idBlog) {
    this.microblogService.getPublicacion(idBlog).subscribe((r) => {
      this.publicacion = r.data;
      if (this.publicacion.url_video) {
        this.youtubeParser(this.publicacion.url_video);
      }
    });
  }

  youtubeParser(url) {
    const regExp = /\b[\w-]+$/;
    const match = url.match(regExp);
    const videoEmbed = 'https://www.youtube.com/embed/' + match + '?controls=0';
    this.publicacion.video_embed = this.sanitizer.bypassSecurityTrustResourceUrl(videoEmbed);
  }
}
