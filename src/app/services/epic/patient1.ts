import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Events } from '@ionic/angular';
// import { Observable } from 'rxjs/Observable';

export interface AuthData {
  refresh_token: string;
  access_token: string;
  token_type: string;
  expires_in: number;
  id_token?: string;
}

export interface OpenIDTokenData {
  sub: string;
  profile: string;
  fhirUser: string;
}

export interface UserProfile {
  resourceType: string;
  id: string;
  active: boolean;
  name: {
    use: string;
    text: string;
    family: string[];
    given: string[];
  };
}
@Injectable()
export class Patient1Provider {
  private authData: AuthData;
  constructor(private events: Events, private http: HttpClient) {
    console.log('Hello PatientProvider Provider');
    this.events.subscribe('user:loggedin', authData => {
      console.log('*** [PatientProvider] authData: ', authData);
      this.authData = authData;
    });
  }

  search(query: string, FHIR: string) {
    let url = FHIR + '/FHIR/api/FHIR/DSTU2/Patient?given=Jason&family=Argonaut';
   // url = url + query + '&given=Jason';
    let opts = {
      headers: {
        Accept: 'application/json',
       // Authorization: this.authData.token_type + ' ' + this.authData.access_token
      }
    };
    console.log(opts);
    return this.http.get(url);
  }
}
