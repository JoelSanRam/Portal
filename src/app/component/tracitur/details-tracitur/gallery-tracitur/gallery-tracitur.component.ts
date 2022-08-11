import { Component, OnInit, Input } from '@angular/core';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';
import { GalleryItem, ImageItem } from '@ngx-gallery/core';

@Component({
    selector: 'app-gallery-tracitur',
    templateUrl: './gallery-tracitur.component.html',
    styleUrls: [],
})
export class GalleryTraciturComponent implements OnInit {
    @Input() gallery;

    images: GalleryItem[];
    constructor(public activeModal: NgbActiveModal) {}

    ngOnInit() {
        const gallery = this.gallery;
        const itemes = [];
        gallery.forEach((item) => {
            itemes.push(new ImageItem({ src: item.url, thumb: item.thumb }));
        });
        this.images = itemes;
    }
}
