import { Component, Input, OnInit } from '@angular/core';
import { NgbActiveModal } from "@ng-bootstrap/ng-bootstrap";
import { OwlOptions } from 'ngx-owl-carousel-o';
import { formatCurrency } from '@angular/common';
import { TranslateService } from '@ngx-translate/core';
import { AuthenticationService } from '@app/services';

@Component({
	selector: "app-plan-tarifario",
	templateUrl: "./plan-tarifario.component.html",
	styleUrls: [],
})
export class PlanTarifarioComponent implements OnInit {
	@Input() familias;
	@Input() prevSelected;
	tipoFamilia: any;

	customOptions: OwlOptions = {
		margin: 30,
		responsive: {
			0: {
				items: 1
			},
			576: {
				items: 2
			},
			992: {
				items: 3
			}
		},
		dotsEach: true,
		autoWidth: true,

		navText : ["<div class='nav-button owl-prev'><i class='fa fa-chevron-left'></i></div>", "<div class='nav-button owl-next'><i class='fa fa-chevron-right'></i></div>"],
		nav: true
	}
	constructor(
		public activeModal: NgbActiveModal,
		private translate: TranslateService,
		private auth: AuthenticationService
	) {
		this.auth.getLang().subscribe(res => {
			translate.setDefaultLang(res);
		});
	}
	
	ngOnInit(): void {
		this.familias.map(familia => familia.isChecked = false);
		if (this.prevSelected) {
			let find = this.familias.find(familia => familia.id_familia_tarifaria == this.prevSelected.id_familia_tarifaria);
			if(find) {
				find.isChecked = true;
				this.tipoFamilia = find;
			} else {
				this.familias[0].isChecked = true
				this.tipoFamilia = this.familias[0];
			}
		} else {
			this.familias[0].isChecked = true
			this.tipoFamilia = this.familias[0];
		}
	}
	
	changeTipoTarifa(val, familia) {
		this.tipoFamilia = val.target.ngValue;
		this.familias.map(familia => familia.isChecked = false);
		familia.isChecked = true;
	}

	confirmFamily() {
		this.activeModal.close(this.tipoFamilia);
	}

	tarifaConSigno(tarifa){
		var stringPrice;
		var price;
			if (tarifa.includes('-')) {
				tarifa.replace('-', '');
				price = formatCurrency(tarifa, 'en-EN', '', '1');
				stringPrice = '- '+price;
			}else{
				price = formatCurrency(tarifa, 'en-EN', '', '1');
				stringPrice = '+ '+price;
			}
		return stringPrice;
	}
}
