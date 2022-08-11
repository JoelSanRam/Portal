import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { map } from 'rxjs/operators';
import { environment } from '../../environments/environment';
import { Theme } from "../models/theme";


@Injectable({
  providedIn: 'root'
})
export class ThemeService {
  private active: Theme;
  private customTheme;
  
  constructor(private http: HttpClient) { }

  getActiveTheme(): Theme {
    return this.active;
  }

  setCustomTheme(name, customTheme) {
    let theme = {
      name: name,
      properties: {
        "--color": customTheme.color, // HEADER AND SIDEBAR COLOR
        "--txtColor": customTheme.txtColor, // HEADER AND SIDEBAR COLOR FONT
        "--colorMenu": customTheme.colorMenu, // COLOR MENU
        "--txtColorMenu": customTheme.txtColorMenu, // COLOR MENU FONT
        "--colorBtnPrimary": customTheme.colorBtnPrimary, // BTN 1
        "--txtPrimary": customTheme.txtPrimary, // BTN 1
        "--colorBtnInfo": customTheme.colorBtnInfo, // BTN 2
        "--txtInfo": customTheme.txtInfo, // BTN 2
        "--colorBtnSuccess": customTheme.colorBtnSuccess, // BTN 3
        "--txtSuccess": customTheme.txtSuccess,// BTN 3
        "--colorBtnDanger": customTheme.colorBtnDanger, // BTN 4
        "--txtDanger": customTheme.txtDanger, // BTN 4
      }
    }
    this.setActiveTheme(theme);
  }

  setActiveTheme(theme: Theme): void {
    this.active = theme;
    localStorage.setItem('theme', JSON.stringify(this.active));
    Object.keys(this.active.properties).forEach(property => {
      document.documentElement.style.setProperty(
        property,
        this.active.properties[property]
      );
    });
  }

  saveColor(data) {
    return this.http.post<any>(`${environment.apiUrl}color`, data).pipe(map(response => {
      return response;
    }));
  }
 
  getColor() {
    return this.http.get<any>(`${environment.apiUrl}color`).pipe(map(response => {
      this.customTheme = response
      this.setCustomTheme('custom', this.customTheme);
      return this.customTheme;
    }));
  }

}
