import { Component, OnInit } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { MicroblogService } from '@app/services';
import { DomSanitizer } from '@angular/platform-browser';

@Component({
  selector: 'app-ultimo-microblog',
  templateUrl: './ultimo-microblog.component.html',
  styleUrls: [],
})
export class UltimoMicroblogComponent implements OnInit {
  ultimaPublicacion;
  showblog=true;
  isReadMore: boolean = false;
  constructor(
    private router: Router,
    private microblogService: MicroblogService,
    private sanitizer: DomSanitizer
  ) {}

  ngOnInit() {
    this.getPublicaciones();
  }

  getPublicaciones() {
    const limit = true;
    this.microblogService.getPublicaciones(limit).subscribe((r) => {
      if(r){
        this.ultimaPublicacion = r.data;
        if (Object.keys(this.ultimaPublicacion).length == 0) {
          this.showblog = false;
        }
        if (typeof this.ultimaPublicacion.url_video !== 'undefined') {
          this.youtubeParser(this.ultimaPublicacion.url_video);
        }
      }
    });
  }

  youtubeParser(url) {
    const regExp = /\b[\w-]+$/;
    const match = url.match(regExp);
    const videoEmbed = 'https://www.youtube.com/embed/' + match + '?controls=0';
    this.ultimaPublicacion.video_embed = this.sanitizer.bypassSecurityTrustResourceUrl(videoEmbed);
  }

  chkDescripMicro(descripcion){
    this.isReadMore = (descripcion.length < 150);
    return descripcion;
  }
}
