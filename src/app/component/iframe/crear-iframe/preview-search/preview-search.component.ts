import { Component, OnInit, Input } from '@angular/core';

@Component({
  selector: 'app-preview-search',
  templateUrl: './preview-search.component.html',
  styleUrls: []
})
export class PreviewSearchComponent implements OnInit {
  @Input() colors: any;
  @Input() position: string;
  @Input() modulos: string;
  constructor() { }

  ngOnInit() {
  }

}
