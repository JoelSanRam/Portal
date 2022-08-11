import { TranslateLoader } from '@ngx-translate/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { catchError } from 'rxjs/operators';

const LOCAL_URL = 'https://sfk-lang.s3.amazonaws.com/';

export class CustomTranslateLoader implements TranslateLoader {
  constructor(private httpClient: HttpClient) {}

  getTranslation(lang: string): Observable<any> {
    const url = `${LOCAL_URL}${lang}.json`;
    return this.httpClient.get(url).pipe(
      // catchError((_) => this.httpClient.get(`/assets/i18n/es-mx.json`))
    );
  }
}