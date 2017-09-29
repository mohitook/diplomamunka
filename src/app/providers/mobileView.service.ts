import { Injectable } from '@angular/core';
import {MediaChange, ObservableMedia} from "@angular/flex-layout";
import {MdSidenav} from '@angular/material';

@Injectable()
export class MobileViewService {
    public isMobileView: boolean;
    constructor(private media: ObservableMedia) { 
        // https://github.com/angular/material2/issues/1130
        this.isMobileView = (this.media.isActive('xs') || this.media.isActive('sm'));
        this.media.subscribe((change: MediaChange) => {
            this.isMobileView = (change.mqAlias === 'xs' || change.mqAlias === 'sm');
        });
    }

    onLinkClick(menuSidenav: MdSidenav): void {
        if (this.isMobileView) {
          menuSidenav.close();
        }
      }

}