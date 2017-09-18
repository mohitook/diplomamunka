import { BetModalComponent } from './../bet-modal/bet-modal.component';
import { Component, OnInit, AfterViewChecked, ElementRef, ViewChild,Pipe,PipeTransform,Sanitizer, Inject } from '@angular/core';
import { BrowserModule, DomSanitizer } from '@angular/platform-browser';
import { AF } from "../providers/af";
import { FirebaseListObservable, FirebaseObjectObservable } from "angularfire2";
import {Observable} from 'rxjs/Observable';
import "rxjs/add/operator/map";
import 'rxjs/add/observable/interval';
import { Subject } from 'rxjs/Subject';

import {NgxPaginationModule, PaginationInstance} from 'ngx-pagination';

import { Router, ActivatedRoute } from "@angular/router";

import {MediaChange, ObservableMedia} from "@angular/flex-layout";

import {MdSidenav, MdDialog, MdDialogRef, MD_DIALOG_DATA} from '@angular/material';


@Component({
    selector: 'app-home-page',
    templateUrl: './home-page.component.html',
    styleUrls: ['./home-page.component.css']
})
export class HomePageComponent implements OnInit {

    selectedLabel;
    labels: FirebaseListObservable<any>;
    bettings: FirebaseListObservable<any>;
    isMobileView: boolean;
    labelsAreAvailable = false;

    constructor(public afService: AF, public route: ActivatedRoute, public router: Router,
       private sanitizer: DomSanitizer, private media: ObservableMedia, public dialog: MdDialog) {

      this.labels = this.afService.labels;

      this.bettings = this.afService.upcomingBettings;

      // https://github.com/angular/material2/issues/1130
      this.isMobileView = (this.media.isActive('xs') || this.media.isActive('sm'));
      this.media.subscribe((change: MediaChange) => {
          this.isMobileView = (change.mqAlias === 'xs' || change.mqAlias === 'sm');
      });

      this.labels.subscribe(x => {
        if(x != null){
          this.labelsAreAvailable = true;
        }
      });
      console.log('home-page constructor end');
    }

    ngOnInit() {
      console.log('ngOnInit');
    }

    onLinkClick(menuSidenav: MdSidenav): void {
      if (this.isMobileView) {
        menuSidenav.close();
      }
    }

    onSidenavClick(label: any){
      this.selectedLabel = label.label;
      this.router.navigate(['./gamenews', label.label]);
    }

    openDialog(key: string): void {
      console.log('key: '+key);
      const dialogRef = this.dialog.open(BetModalComponent, {
        width: '400px',
        data: { key: key }
      });
      dialogRef.afterClosed().subscribe(result => {
        console.log('The dialog was closed');
      });
    }
}