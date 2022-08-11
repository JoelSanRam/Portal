import { AbstractControl, FormControl, ValidationErrors } from "@angular/forms";

export function symbolsOnly(control: AbstractControl): ValidationErrors | null {
    if ( !/^[^`0-9~!@#$%\^&*()_+={}|[\]\\:';"<>?,/]*$/.test(control.value)) {
      return { symbols: true };
    }
    return null;
}

export function emailMatch(control: FormControl): ValidationErrors | null {
	if (control.parent) {
		let email = control.parent.get('email');
		if (email.value !== control.value) {
			return { mismatch: true };
		} else {
			return null;
		}
	}
}

export function emailValidator(control: AbstractControl): ValidationErrors | null {
	// if(!/^(([^<>()\[\]\.,;:\s@\"]+(\.[^<>()\[\]\.,;:\s@\"]+)*)|(\".+\"))@(([^<>()[\]\.,;:\s@\"]+\.)+[^<>()[\]\.,;:\s@\"]{2,})$/i.test(control.value)) {
	if(!/\S+@\S+\.\S+/i.test(control.value)) {	
		return { email: true };
	}
	return null;
}