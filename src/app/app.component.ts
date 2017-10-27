import { LoginPageComponent } from './login-page/login-page.component';
import { EditProfileComponent } from './edit-profile/edit-profile.component';
import { Component, OnInit, Renderer2 } from '@angular/core';
import { AF } from "./providers/af";
import { Router, NavigationEnd } from "@angular/router";
import {MediaChange, ObservableMedia} from "@angular/flex-layout";
import { FirebaseListObservable, FirebaseObjectObservable } from "angularfire2";

import { MdSidenav, MdDialog } from '@angular/material';

@Component({
    selector: 'app-root',
    templateUrl: './app.component.html',
    styleUrls: ['./app.component.css']
})
export class AppComponent implements OnInit {
  
  public isLoggedIn: boolean;

    throttle = 300;
    scrollDistance = 1;

    isMobileView: boolean;

    labels: FirebaseListObservable<any>;
    labelsAreAvailable = false;
    selectedLabel; 

    constructor(private renderer: Renderer2, public afService: AF, private router: Router, private media: ObservableMedia,  public dialog: MdDialog) {
        // https://github.com/angular/material2/issues/1130
        this.isMobileView = (this.media.isActive('xs') || this.media.isActive('sm'));
        this.media.subscribe((change: MediaChange) => {
            this.isMobileView = (change.mqAlias === 'xs' || change.mqAlias === 'sm');
        });
        this.labels = this.afService.labels;

        this.labels.subscribe(x => {
            if(x != null){
              this.labelsAreAvailable = true;
            }
          });

          
    }
    
    ngOnInit(): void {
      this.router.events.filter(event => event instanceof NavigationEnd).subscribe(() => {
        this.renderer.setProperty(document.body, 'scrollTop', 0);
      });
    }

    onLinkClick(menuSidenav : MdSidenav):void {
        if (this.isMobileView) {
          menuSidenav.close();
        }
      }

    logout() {
        this.afService.logout();
        this.router.navigate(['']);
    }

    openEditProfileDialog(): void {
        const dialogRef = this.dialog.open(EditProfileComponent, {
          width: '400px'
        });
        dialogRef.afterClosed().subscribe(result => {
          console.log('The dialog was closed');
        });
      }

    openLoginDialog(): void {
      const dialogRef = this.dialog.open(LoginPageComponent, {
        width: '400px'
      });
      dialogRef.afterClosed().subscribe(result => {
        console.log('The dialog was closed');
      });
    }
}
