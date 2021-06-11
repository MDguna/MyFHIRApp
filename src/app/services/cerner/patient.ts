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
export class PatientProvider {
  private authData: AuthData;
  constructor(private events: Events, private http: HttpClient) {
    console.log('Hello PatientProvider Provider');
    this.events.subscribe('user:loggedin', authData => {
      console.log('*** [PatientProvider] authData: ', authData);
      this.authData = authData;
    });
  }

  search(query: string, tenantId: string) {
    let url = 'https://fhir-ehr.sandboxcerner.com/dstu2/' +  tenantId + '/Patient?family=';
    url = url + query;
    let opts = {
      headers: {
        Accept: 'application/json',
        Authorization: this.authData.token_type + ' ' + this.authData.access_token
      }
    };
    console.log(opts);
    return this.http.get(url, opts);
  }
}
