import { Component, OnInit, Input } from '@angular/core';

@Component({
  selector: 'app-read-more-less',
  templateUrl: './read-more-less.component.html',
  styleUrls: ['./read-more-less.component.scss']
})
export class ReadMoreLessComponent implements OnInit {
  @Input() isReadMore: boolean = false;
  public isCollapsed: boolean = true;
  constructor() { }

  ngOnInit() {
  }

}
