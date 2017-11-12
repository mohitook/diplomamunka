import { FormControl, Validators } from '@angular/forms';
import { BetModalComponent } from './../bet-modal/bet-modal.component';
import { Component, OnInit, AfterViewChecked, ElementRef, ViewChild, Pipe, PipeTransform, Sanitizer, Inject, Renderer, Renderer2 } from '@angular/core';
import { BrowserModule, DomSanitizer } from '@angular/platform-browser';
import { AF } from "../providers/af";
import { MobileViewService } from "../providers/mobileView.service";
import { FirebaseListObservable, FirebaseObjectObservable } from "angularfire2";
import { Observable } from 'rxjs/Observable';
import "rxjs/add/operator/map";
import 'rxjs/add/observable/interval';
import { Subject } from 'rxjs/Subject';

import { NgxPaginationModule, PaginationInstance } from 'ngx-pagination';

import { Router, ActivatedRoute, NavigationEnd } from "@angular/router";

import { MediaChange, ObservableMedia } from "@angular/flex-layout";

import { MdSidenav, MdDialog, MdDialogRef, MD_DIALOG_DATA } from '@angular/material';


@Component({
  selector: 'app-home-page',
  templateUrl: './home-page.component.html',
  styleUrls: ['./home-page.component.css']
})
export class HomePageComponent implements OnInit {

  selectedLabel;
  labels: FirebaseListObservable<any>;
  upcomingMatches: FirebaseListObservable<any>;
  labelsAreAvailable = false;

  constructor(private renderer: Renderer2, public afService: AF, public route: ActivatedRoute, public router: Router,
    private sanitizer: DomSanitizer, private media: ObservableMedia, public dialog: MdDialog, public mobView: MobileViewService) {



    this.labels = this.afService.labels;

    this.upcomingMatches = this.afService.upcomingMatchesForNewsPage;

    this.labels.subscribe(x => {
      if (x != null) {
        this.labelsAreAvailable = true;
      }
    });
    console.log('home-page constructor end');
  }

  ngOnInit() {

    this.route.queryParams.subscribe(params => {
      let mode = params['mode'];
      let actionCode = params['oobCode'];
      let apiKey = params['apiKey'];

      this.handleAuth(mode, actionCode);

      console.log(params); // Print the parameter to the console. 
    });

    console.log('ngOnInit');
    this.router
      .events
      .filter(event => event instanceof NavigationEnd)
      .subscribe(() => {
        const contentContainer = document.querySelector('.mat-drawer-content');
        //it can be buggy in some browser versions!
        if (contentContainer != null) {
          //contentContainer.scrollTo(0, 0);
          this.renderer.setProperty(contentContainer, 'scrollTop', 0);
        }
      });
  }

  //https://firebase.google.com/docs/auth/custom-email-handler
  handleAuth(mode, actionCode) {
    // Handle the user management action.
    switch (mode) {
      case 'resetPassword':
        // Display reset password handler and UI.
        this.handleResetPassword(actionCode);
        break;
      case 'recoverEmail':
        // Display email recovery handler and UI.
        //handleRecoverEmail(auth, actionCode);
        break;
      case 'verifyEmail':
        // Display email verification handler and UI.
        this.handleVerifyEmail(actionCode);
        break;
      default:
      // Error: invalid mode.
    }
  }

  handleResetPassword(actionCode) {
    this.afService.verifyPaswordResetCode(actionCode).then(email => {
      let dialogRef = this.dialog.open(ResetPasswordDialog, {
        width: '400px',
        data: { email: email, actionCode: actionCode }
      });
    }).catch(error => {
      let dialogRef = this.dialog.open(ResetPasswordDialog, {
        width: '400px',
        data: false
      });
    });
  }

  handleVerifyEmail(actionCode) {

    let dialogRef = this.dialog.open(VerifyDialog, {
      width: '400px',
      data: actionCode
    });


  }


  onSidenavClick(label: any) {
    this.selectedLabel = label.label;
    this.router.navigate(['./gamenews', label.label]).then(() => {
      //window.scroll(0, 0); // should be here, in promise
    });
  }

  openDialog(key: string): void {
    console.log('key: ' + key);
    const dialogRef = this.dialog.open(BetModalComponent, {
      width: '400px',
      data: { key: key }
    });
    dialogRef.afterClosed().subscribe(result => {
      console.log('The dialog was closed');
    });
  }

  //from the rest api sometimes there is no real picture, only a 1px*1px ****thing
  onImgLoad(event: any, gameName: string) {
    if (event.target.naturalHeight <= 1) {
      switch (gameName) {
        case 'Dota 2':
          event.target.src = 'https://dota2.gamepedia.com/media/dota2.gamepedia.com/thumb/e/ea/Animal_Courier_Dire_model.png/250px-Animal_Courier_Dire_model.png?version=f0215138b198d530a16d2f5e2f08dcc2';
          break;
        case 'CS GO':
          event.target.src = 'https://steamuserimages-a.akamaihd.net/ugc/3336341088177464117/8D53A0CBBA686F16DC97FD2722D4F6174D6897EB/';
          break;
        case 'LoL':
          event.target.src = 'https://orig00.deviantart.net/cb31/f/2015/034/b/2/customize_icon_league_of_legends_katarina_by_matrider90-d8f43k6.png';
          break;
        default:
          event.target.src = 'https://firebasestorage.googleapis.com/v0/b/dipterv-f7bce.appspot.com/o/shortRed.png?alt=media&token=d9a9551a-b155-4813-8fa8-b25436b154e3';
          break;
      }
    }
    //console.log(event);
  }


  setBackgroundOnBet(matchKey) {

    if (this.afService.userBettings[matchKey] != null) {

      if (this.afService.userBettings[matchKey].status == 'inProgress') {
        return '#fff176';
      }
      if (this.afService.userBettings[matchKey].status == 'finished') {
        if (this.afService.userBettings[matchKey].result == 'win') {
          return '#b9f6ca';
        }
        else {
          return '#ffcdd2';
        }
      }
    }
    return '#8c9eff';
  }

  getFontWeight(matchKey, competitor, winner = '') {

    if (this.afService.userBettings[matchKey] != null) {

      //in case of live matches
      if (this.afService.userBettings[matchKey].status == 'inProgress' && competitor === this.afService.userBettings[matchKey].team) {
        return 900;
      }
      //in case of finished matches
      else if (this.afService.userBettings[matchKey].status == 'finished') {
        if (this.afService.userBettings[matchKey].team == competitor) {
          if (this.afService.userBettings[matchKey].result == 'win') {
            return 900;
          }
        }
        if (this.afService.userBettings[matchKey].team != competitor
          && this.afService.userBettings[matchKey].result == 'lose') {
          return 900;
        }
      }
    }
    else {
      if (competitor == winner) {
        return 900;
      }
    }
  }

  getFontColor(matchKey, competitor, winner = '') {


    if (this.afService.userBettings[matchKey] != null) {

      //in case of live matches
      if (this.afService.userBettings[matchKey].status == 'inProgress' && competitor === this.afService.userBettings[matchKey].team) {
        return '#e65100';
      }
      //in case of finished matches
      else if (this.afService.userBettings[matchKey].status == 'finished') {
        if (this.afService.userBettings[matchKey].team == competitor) {
          if (this.afService.userBettings[matchKey].result == 'win') {
            return '#00c853';
          }
          else if (this.afService.userBettings[matchKey].result == 'lose') {
            return '#d50000';
          }
        }
      }
    }
  }



}

@Component({
  selector: 'verify-dialog',
  templateUrl: 'verify-dialog.html',
  styleUrls: ['./home-page.component.css']
})
export class VerifyDialog {

  actionCode;
  public error: any;

  success = false;

  loading = true;

  constructor(public afService: AF,
    public dialogRef: MdDialogRef<VerifyDialog>, public dialog: MdDialog,
    @Inject(MD_DIALOG_DATA) public data: any) {
    this.actionCode = data;

    this.afService.af.auth.subscribe((auth) => {
      if(auth != null){
        console.log('loggedIn');
        this.verify();
      }
    });
  }

  verify() {
    this.afService.verifyUser(this.actionCode).then(resp => {
      console.log(resp);

      this.afService.af.database.object('users/' + this.afService.uid + '/verified').set(true);
      this.success = true;

    }).catch(error => {
      console.log(error);
      this.loading = false;
      this.success = false;
    });
  }

  onNoClick(): void {
    this.dialogRef.close();
  }

  verifyAgain() {
    this.afService.sendUserVerifyAgain().then(() => { this.onNoClick() });
  }

  loginWithEmail(event, email, password) {
    //event.preventDefault();
    this.afService.loginWithEmail(email, password).then(() => {
      console.log(this.afService.user.displayName);
      this.verify();
    })
      .catch((error: any) => {
        if (error) {
          this.error = error;
          console.log(this.error);
        }
      });
  }
}

@Component({
  selector: 'resetPasswod-dialog',
  templateUrl: 'resetPassword-dialog.html',
  styleUrls: ['./home-page.component.css']
})
export class ResetPasswordDialog {

  email = false;
  success = true;
  actionCode;

  successfullUpdate = false;

  //https://stackoverflow.com/questions/14850553/javascript-regex-for-password-containing-at-least-8-characters-1-number-1-uppe
  PASSWORD_REGEX = /^(?=.*\d)(?=.*[a-z])(?=.*[A-Z])[0-9a-zA-Z]{8,}$/;


  passwordFormControl = new FormControl('', [
    Validators.required,
    Validators.pattern(this.PASSWORD_REGEX)]);


  constructor(public afService: AF,
    public dialogRef: MdDialogRef<ResetPasswordDialog>,
    @Inject(MD_DIALOG_DATA) public data: any) {

    if (data == false) {
      this.success = false;
    } else {
      this.email = data.email;
      this.actionCode = data.actionCode;
    }
  }

  onNoClick(): void {
    this.dialogRef.close();
  }

  setNewPassword(newPassword) {
    this.afService.confirmPasswordReset(this.actionCode, newPassword).then(() => { this.successfullUpdate = true; });
  }
}