import { Component, OnInit } from '@angular/core';
import { environment } from "../../../environments/environment";
import { FirebaseService } from '../../services/firebase/firebase.service';
@Component({
  selector: 'app-layout',
  templateUrl: './layout.component.html',
  styleUrls: []
})
export class LayoutComponent implements OnInit {

  constructor(private fs: FirebaseService) {
    this.fs.currencies.subscribe((data)=>{
    });
   }
  ngOnInit() {   
  }

}
