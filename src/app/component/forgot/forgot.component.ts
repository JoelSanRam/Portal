import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators  } from "@angular/forms";
import { SweetalertService } from '../../services/sweetalert.service';
import { Router, ActivatedRoute } from '@angular/router';
import { AuthenticationService, ConfigService } from "../../services";
import { TranslateService } from '@ngx-translate/core';

@Component({
  selector: 'app-forgot',
  templateUrl: './forgot.component.html',
  styleUrls: []
})
export class ForgotComponent implements OnInit {
  forgotForm: FormGroup;
  loading = false;
  submitted = false;
  returnUrl: string;
  rsociales = ConfigService.configFile.redes_sociales;

  metodorecuperar:boolean = false;
  userInvalid:boolean = false;
  mailInvalid:boolean = false;
  timeout: any = null;

  constructor(
    private formBuilder: FormBuilder,
    public swal: SweetalertService,
    private route: ActivatedRoute,
    private router: Router,
    private authenticationService: AuthenticationService,
    private translate: TranslateService
  ) { 
    this.forgotForm = this.formBuilder.group({
      'usuario': ['', Validators.required]
    })
    this.authenticationService.getLang().subscribe(res=>{
      translate.setDefaultLang(res);
    });
  }

  ngOnInit() {
    this.returnUrl = this.route.snapshot.queryParams['returnUrl'] || '/login';
  }

  get f() { return this.forgotForm.controls; }

  onSubmit() {
    this.submitted = true; 
    if (this.forgotForm.invalid) {
      return;
    }
    if(this.mailInvalid == true || this.userInvalid == true){
      return;
    }
    this.loading = true;
    this.authenticationService.forgotPass(this.forgotForm.value).subscribe(response => {
      this.router.navigate([this.returnUrl]);
      this.swal.success(response.title);
    });
  }

  changeMethod(){
    this.forgotForm.patchValue({ usuario: '' });
    if(!this.metodorecuperar){
      this.metodorecuperar = true;
    }else{
      this.metodorecuperar = false;
    }
  }

  validateFormatInput(type, event: any){
    
    clearTimeout(this.timeout);
    var $this = this;
    this.timeout = setTimeout(function () {
      if (event.keyCode != 13) {
        let valInput = event.target.value;
        $this.validMail(type,valInput);
      }
    }, 1000);
    
  }

  validMail(type,valInput ){
    let mailformat = /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9-]+(?:\.[a-zA-Z0-9-]+)*$/;
    if(type == 'mail'){
      if(valInput.match(mailformat)){
        this.mailInvalid = false;
      }else{
        this.mailInvalid = true;
      }
    }else{
      if(valInput.match(mailformat)){
        this.userInvalid = true;
      }else{
        this.userInvalid = false;
      }
    }
  }

}
