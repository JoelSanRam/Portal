import { Injectable } from "@angular/core";
import { Router, CanActivate, ActivatedRouteSnapshot, RouterStateSnapshot } from "@angular/router";
import { AuthenticationService } from "../services";
import { JwtHelperService } from "@auth0/angular-jwt";

@Injectable({ providedIn: 'root' })
export class AuthGuard implements CanActivate {
    private token;
    private payload;
    constructor(
        private router: Router,
        private authenticationService: AuthenticationService,
        private jwth: JwtHelperService,
    ){}
    isAuthExpired(route: ActivatedRouteSnapshot, state: RouterStateSnapshot){
        const token = this.authenticationService.currentToken;
        if (!this.jwth.isTokenExpired()) {

        } else {
            this.router.navigate(['/login'], { queryParams: { returnUrl: state.url } });
        }
        return false;
    }
    canActivate(route: ActivatedRouteSnapshot, state: RouterStateSnapshot) {
        const currentUser = this.authenticationService.currentUserValue;
        if (currentUser) {
            // authorised so return true
            if (!this.jwth.isTokenExpired()) {
                this.token = this.authenticationService.currentToken;
                this.payload = this.jwth.decodeToken(this.token);
                return true;
            } else {
                this.router.navigate(['/login']);
            }
        }
        // not logged in so redirect to login page with the return url
        this.router.navigate(['/login']);
        return false;
    }
}