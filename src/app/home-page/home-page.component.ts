import { BetModalComponent } from './../bet-modal/bet-modal.component';
import { Component, OnInit, AfterViewChecked, ElementRef, ViewChild,Pipe,PipeTransform,Sanitizer, Inject } from '@angular/core';
import { BrowserModule, DomSanitizer } from '@angular/platform-browser';
import { AF } from "../providers/af";
import { MobileViewService } from "../providers/mobileView.service";
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
    labelsAreAvailable = false;

    constructor(public afService: AF, public route: ActivatedRoute, public router: Router,
       private sanitizer: DomSanitizer, private media: ObservableMedia, public dialog: MdDialog, public mobView: MobileViewService) {

      this.labels = this.afService.labels;

      this.bettings = this.afService.upcomingMatches;

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

    //from the rest api sometimes there is no real picture, only a 1px*1px ****thing
    onImgLoad(event: any, gameName: string){
      if(event.target.naturalHeight <= 1){
        switch (gameName) {
          case 'Dota 2':
            event.target.src = 'https://dota2.gamepedia.com/media/dota2.gamepedia.com/thumb/e/ea/Animal_Courier_Dire_model.png/250px-Animal_Courier_Dire_model.png?version=f0215138b198d530a16d2f5e2f08dcc2';
            break;
          case 'CS GO':
            event.target.src = 'http://www.freeiconspng.com/uploads/cs-go-csgo-inventory-icon-27.png';
            break;
          case 'LoL':
            event.target.src = 'http://news.cdn.leagueoflegends.com/public/images/pages/2015/sno/img/icon2.png';
            break;
          default:
            event.target.src = 'https://firebasestorage.googleapis.com/v0/b/dipterv-f7bce.appspot.com/o/shortRed.png?alt=media&token=d9a9551a-b155-4813-8fa8-b25436b154e3';        
            break;
        }
      }
      //console.log(event);
    }
}