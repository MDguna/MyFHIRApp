import { Component, ChangeDetectorRef } from '@angular/core';
import {  NavController,  Events } from '@ionic/angular';
// import { Plugins } from '@capacitor/core';
import { InAppBrowser, InAppBrowserObject } from '@ionic-native/in-app-browser/ngx';
import { HttpClient, HttpParams, HttpHeaders, HttpRequest, HttpResponse, HttpErrorResponse } from '@angular/common/http';
import { switchMap, mergeMap, debounceTime, map, catchError } from 'rxjs/operators';
import { of } from 'rxjs';
import { PatientProvider, AuthData, OpenIDTokenData, UserProfile } from '../../services/cerner/patient';
import { JwtHelper } from 'angular2-jwt';
//import { TouchID } from '@ionic-native/touch-id';
//declare var touchid: any;

@Component({
  selector: 'app-browser',
  templateUrl: './browser.page.html',
  styleUrls: ['./browser.page.scss'],
})
export class BrowserPage {
  
  
  private browserRef: InAppBrowserObject;
  public authData: AuthData;
  public hasLoggedIn: boolean = false;
  public searchResults: any;
  public error: any;
  jwtHelper = new JwtHelper();
  username: string;
  user: UserProfile;
 
  private REF_TOKEN_KEY = 'refresh_token';
  clientId: string 
  ='7c78a937-3c5c-4e8e-b780-83694ae02022';
  // ='0922363e-a496-4c9a-b0e7-de6e3d48e7f4';
  scope: string 
  //='profile+openid+online_access+patient%2FAllergyIntolerance.read+patient%2FAppointment.read+patient%2FBinary.read+patient%2FCarePlan.read+patient%2FCondition.read+patient%2FContract.read+patient%2FDevice.read+patient%2FDiagnosticReport.read+patient%2FDocumentReference.read+patient%2FEncounter.read+patient%2FGoal.read+patient%2FImmunization.read+patient%2FMedicationAdministration.read+patient%2FMedicationOrder.read+patient%2FMedicationStatement.read+patient%2FObservation.read+patient%2FPatient.read+patient%2FPerson.read+patient%2FProcedure.read+patient%2FProcedureRequest.read+patient%2FRelatedPerson.read+patient%2FSchedule.read+patient%2FSlot.read+patient%2FAllergyIntolerance.write+patient%2FAppointment.write+patient%2FCondition.write+patient%2FDocumentReference.write+patient%2FMedicationStatement.write+patient%2FPatient.write+user%2FAppointment.read+user%2FPatient.read+user%2FPerson.read+user%2FSchedule.read+user%2FSlot.read+user%2FAppointment.write';
  ='online_access%20profile%20openid%20user%2FAllergyIntolerance.read%20user%2FAppointment.read%20user%2FBinary.read%20user%2FCarePlan.read%20user%2FCondition.read%20user%2FContract.read%20user%2FDevice.read%20user%2FDiagnosticReport.read%20user%2FDocumentReference.read%20user%2FEncounter.read%20user%2FGoal.read%20user%2FImmunization.read%20user%2FMedicationAdministration.read%20user%2FMedicationOrder.read%20user%2FMedicationStatement.read%20user%2FObservation.read%20user%2FOperationDefinition.read%20user%2FPatient.read%20user%2FPerson.read%20user%2FPractitioner.read%20user%2FProcedure.read%20user%2FRelatedPerson.read%20user%2FSchedule.read%20user%2FSlot.read%20user%2FStructureDefinition.read';
  redirectURL : string = 'http%3A%2F%2Flocalhost%3A8100%2Fcerner';
  tenantId : string = '0b8a0111-e8e6-4c26-a91c-5069cbc6b1ca';
  private tokenUrl : string; // = 'https://authorization.sandboxcerner.com/tenants/' +  this.tenantId + '/protocols/oauth2/profiles/smart-v1/token';
  private url : string;
   //= 'https://authorization.sandboxcerner.com/tenants/' +  this.tenantId + '/protocols/oauth2/profiles/smart-v1/personas/provider/authorize?client_id=' +  this.clientId + '' +
 // '&response_type=code&scope=' + this.scope +
 //'&state=120d4e4b-91ef-1e55-de83-bbb2ed9a3b4f&aud=https%3A%2F%2Ffhir-ehr.sandboxcerner.com%2Fdstu2%2F' +  this.tenantId + '';


  constructor(
    public navCtrl: NavController,
   // public navParams: NavParams,
    public inAppBrowser: InAppBrowser,
    private events: Events,
    private http: HttpClient,
    private patient: PatientProvider,
    private ref: ChangeDetectorRef,
    //private touchId: TouchID
  ) {
    // listen for redirect events...
    this.events.subscribe('deeplink:detected', (data, time) => {
      console.info('*** Deeplink data: ', data);
      this.browserRef.close();
    //  alert(data.url);
      if (data.url.indexOf('authorization') >= 0) {
        // if (data.url.indexOf('http://localhost:8100/#/browser?code=') >= 0) {
           let payload = data.url.split('?')[1] + '&client_id='  +  this.clientId + '&grant_type=authorization_code';
           this.getToken(payload);
        
         }
      if (data.url.indexOf('/search') >= 0) {
        console.info('**** searching from deeplink: ')
        console.warn(data.url.split('?query=')[1])
        setTimeout(() => {
          this.search({
            target: {
              value: data.url.split('?query=')[1]
            }
          });
        }, 1000);
      }
    });
   
  }

  ngOnInit() {
    console.log('ionViewDidLoad BrowserPage');
  //  alert(document.URL);
  if (document.URL.indexOf("error=") > 0) {
    let splitURL = document.URL.split("?");
    let splitParams = splitURL[1].split("&");
    //  let payload = splitURL[1] + '&client_id=' +  this.clientId + '&grant_type=authorization_code';
    //   this.getToken(payload);
    this.browserRef = this.inAppBrowser.create(splitParams[2], "_parent");
     
  }
    else if (document.URL.indexOf("?") > 0) {
      let splitURL = document.URL.split("?");
	    let splitParams = splitURL[1].split("&");
      let payload = splitURL[1] + '&client_id=' +  this.clientId + '&grant_type=authorization_code';
       this.getToken(payload);
       
    }
   // alert(this.url);
  }

  browserOpen() {
    this.url = 'https://authorization.sandboxcerner.com/tenants/' +  this.tenantId + '/protocols/oauth2/profiles/smart-v1/personas/provider/authorize?client_id=' +  this.clientId + '' +
  '&response_type=code&scope=' + this.scope +
  '&state=120d4e4b-91ef-1e55-de83-bbb2ed9a3b4f&aud=https%3A%2F%2Ffhir-ehr.sandboxcerner.com%2Fdstu2%2F' +  this.tenantId + '';
    console.info('*** authorization url: ', this.url);
    // alert(this.url);
    this.browserRef = this.inAppBrowser.create(this.url, "_parent");
    
  }

  search(query: any) {
    console.warn('*** searching for: ', query);
    this.patient
      .search(query.target.value, this.tenantId)
      .toPromise()
      .then((searchResults: any) => {
        this.searchResults = searchResults.entry;
        console.info(this.searchResults.length);
        this.ref.detectChanges();
      })
      .catch(error => {
        console.error(JSON.stringify(error));
        this.error = error;
        this.ref.detectChanges();
      });
  }

  refreshToken() {
    // this.touchId.verifyFingerprint('Scan your fingerprint please').then(
    //   res => {
    //     let token = window.localStorage.getItem(this.REF_TOKEN_KEY);
    //     if (token) {
    //       console.log('*** got TOKEN FROM LS', token);
    //       let payload = 'grant_type=refresh_token&refresh_token=' + token;
    //       this.getToken(payload);
    //     }
    //   },
    //   error => {
    //     console.error('*** touch id error: ', error);
    //   }
    // );
    // window['plugins'].touchid.verifyFingerprint(
    //   'Scan your fingerprint please', // this will be shown in the native scanner popup
    //   msg => {
    //     let token = window.localStorage.getItem(this.REF_TOKEN_KEY);
    //     if (token) {
    //       console.log('*** got TOKEN FROM LS', token);
    //       let payload = 'grant_type=refresh_token&refresh_token=' + token;
    //       this.getToken(payload);
    //     }
    //   }, // success handler: fingerprint accepted
    //   msg => {
    //     alert('not ok: ' + JSON.stringify(msg));
    //   } // error handler with errorcode and localised reason
    // );
  }

  private getToken(payload) {
    this.tokenUrl = 'https://authorization.sandboxcerner.com/tenants/' +  this.tenantId + '/protocols/oauth2/profiles/smart-v1/token';
    let reqOpts = {
      headers: {
        Accept: 'application/json',
        'Content-Type': 'application/x-www-form-urlencoded'
      }
    };
    console.info('*** getting token url: ');
    console.log(this.tokenUrl, payload, reqOpts);

    this.http
      .post(this.tokenUrl, payload, reqOpts)
      .pipe(
        
        catchError(err => {
          console.error('*** ERROR IN HTTP REQUEST', err);
          console.log(err.error);
          let prompt = confirm(`Error: ${err.error.error.toUpperCase()} ocurred would you like to see more info?`);
          if (prompt) {
            this.browserRef.close();
             this.browserRef = this.inAppBrowser.create(err.error.error_uri);
          
          }

          return of(undefined);
        })
      )
      .subscribe((response: HttpResponse<any> | HttpErrorResponse) => {
        if (response) {
          console.info('**** GOT RESPONSE>>>');
         
          this.hasLoggedIn = true;
          this.authData = <any>response;
          console.log('*** publishing response:', response);
          this.events.publish('user:loggedin', response);
        
          console.log(this.jwtHelper.decodeToken(this.authData.access_token));
          console.log(this.jwtHelper.decodeToken(this.authData.access_token).username);
         
          this.getProfile();
          if (this.authData.refresh_token) {
            console.log('*** saving refresh token to LS');
            window.localStorage.setItem(this.REF_TOKEN_KEY, this.authData.refresh_token);
          }
          this.ref.detectChanges();
        }
      });
  }

  getProfile() {
    let decodedData: OpenIDTokenData = this.jwtHelper.decodeToken(this.authData.id_token);
    if (decodedData) {
      
      this.username = decodedData.sub;
      let profileUrl = decodedData.profile;
      let reqOpts = {
        headers: {
          Accept: 'application/json',
          'Content-Type': 'application/x-www-form-urlencoded',
          Authorization: this.authData.token_type + ' ' + this.authData.access_token
        }
      };
      this.http
        .get(profileUrl, reqOpts)
        .toPromise()
        .then((profile: UserProfile) => {
          this.user = profile;
          console.info(this.user);
          this.ref.detectChanges();
        })
        .catch(error => {
          console.error(JSON.stringify(error));
          this.error = error;
          this.ref.detectChanges();
        });
    }
  }
}
