import { Injectable } from '@angular/core';
@Injectable({
    providedIn: 'root'
})
export class FocusService {
    statusFocus1: boolean;
    statusFocus2: boolean;
    constructor() { }

    public setFocus1(value: boolean) {
        this.statusFocus1 = value;
    }
    public setFocus2(value: boolean) {
        this.statusFocus2 = value;
    }
    public getFocus1() {
        return this.statusFocus1;
    }
    public getFocus2() {
        return this.statusFocus2;
    }
}