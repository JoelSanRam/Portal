import { Component, OnInit, Input, OnChanges } from '@angular/core';

@Component({
  selector: 'app-preview-results',
  templateUrl: './preview-results.component.html',
  styleUrls: []
})
export class PreviewResultsComponent implements OnChanges {
  @Input() colors: any;
  @Input() mkp: any;
  totalMkp;

  constructor() { }

  ngOnChanges(changes) {
    this.totalMkp = (100 - this.mkp) / 100;
  }

}
