import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';
import { AuthenticationService } from '@app/services';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';
import { TranslateService } from '@ngx-translate/core';

@Component({
    selector: 'app-modal-filters',
    templateUrl: './modal-filters.component.html',
    styles: [],
})
export class ModalFiltersComponent implements OnInit {
    @Input() categories;
    @Input() selectedCategories;
    @Output() valueChange = new EventEmitter();

    todascat;
    constructor(
        public activeModal: NgbActiveModal,
        private translate: TranslateService,
        private auth: AuthenticationService
    ) { 
        this.auth.getLang().subscribe(res=>{
            translate.setDefaultLang(res);
        });
    }

    ngOnInit() {
        this.categories.forEach((category) => {
            if (category.selected === true) {
                return (this.todascat = false);
            } else {
                return (this.todascat = true);
            }
        });
    }

    filtrar() {
        let selectedCat;
        if (this.todascat) {
            selectedCat = this.categories.map((cat) => cat.categoria_codigo);
        } else {
            selectedCat = this.categories
                .map((checked, i) => (checked.selected ? checked.categoria_codigo : null))
                .filter((value) => value !== null);
        }

        this.valueChange.emit(selectedCat);
        this.activeModal.close();
    }

    selectAll() {
        this.categories.forEach((e) => {
            e.selected = false;
        });
    }

    getSelected(cat) {
        cat.selected = !cat.selected;
        this.categories.forEach((category) => {
            if (typeof category.selected != 'undefined' && category.selected == true) {
                this.todascat = false;
            }
        });
    }
}
