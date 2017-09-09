import { Component } from '@angular/core';
import { AF } from "./providers/af";
import { Router } from "@angular/router";
import {MediaChange, ObservableMedia} from "@angular/flex-layout";

import {MdSidenav} from '@angular/material';

@Component({
    selector: 'app-root',
    templateUrl: './app.component.html',
    styleUrls: ['./app.component.css']
})
export class AppComponent {
    public isLoggedIn: boolean;

    throttle = 300;
    scrollDistance = 1;

    isMobileView: boolean;

    constructor(public afService: AF, private router: Router, private media: ObservableMedia) {
        // https://github.com/angular/material2/issues/1130
        this.isMobileView = (this.media.isActive('xs') || this.media.isActive('sm'));
        this.media.subscribe((change: MediaChange) => {
            this.isMobileView = (change.mqAlias === 'xs' || change.mqAlias === 'sm');
        });
    }

    onLinkClick(menuSidenav : MdSidenav):void {
        if (this.isMobileView) {
          menuSidenav.close();
        }
      }

    logout() {
        this.afService.logout();
    }

    onScrollDown() {
        console.log('scrolled!!');
    }

}
