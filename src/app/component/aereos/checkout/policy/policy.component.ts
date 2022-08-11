import { Component, OnInit, Input } from '@angular/core';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';

@Component({
  selector: 'app-policy',
  templateUrl: './policy.component.html',
  styleUrls: []
})
export class PolicyComponent implements OnInit {
  @Input() politicas;
  constructor(public activeModal: NgbActiveModal) { }

  ngOnInit(): void {
  }

}
