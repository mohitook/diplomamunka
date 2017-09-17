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

import { Router } from "@angular/router";

import {MediaChange, ObservableMedia} from "@angular/flex-layout";

import {MdSidenav, MdDialog, MdDialogRef, MD_DIALOG_DATA} from '@angular/material';


@Component({
    selector: 'app-home-page',
    templateUrl: './home-page.component.html',
    styleUrls: ['./home-page.component.css']
})
export class HomePageComponent implements OnInit {

  public configFavourite: PaginationInstance = {
        id: 'configFavourite',
        itemsPerPage: 10,
        currentPage: 1
    };

    public configAll: PaginationInstance = {
          id: 'configAll',
          itemsPerPage: 10,
          currentPage: 1
      };

      //test
      animal: string;
      name: string;

    selectedLabel:string;

    startNumber:number = 0;
    endNumber:number = 1;

    news: FirebaseListObservable<any>;
    labels: FirebaseListObservable<any>;
    userLabels: FirebaseListObservable<any>;
    allNews: FirebaseListObservable<any>;
    specificNews: FirebaseListObservable<any>;
    bettings: FirebaseListObservable<any>;

    public valueSubject: Subject<any>;

    labelFilter:  any[] = [{ label: '' }];

    selectedLabels: Array<any>;

    selectedLabelsToSend: Array<any>;

    ///default selected value in the specific news /ng-select
    currentItem : string;

    dropdownSelected: any = {label:"Favourites", image:''};

    isMobileView: boolean;
    labelsAreAvailable = false;

    public whatTime;

    constructor(public afService: AF, private sanitizer: DomSanitizer, private media: ObservableMedia, public dialog: MdDialog){
 
      this.whatTime = Observable.interval(1000).map(x => new Date());
      this.startNumber = 0;
      this.endNumber = 1;

      this.labels = this.afService.labels;
      this.selectedLabelsToSend = new Array<any>();

      this.allNews = this.afService.allNews;

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
      })

      console.log('home-page constructor end');
    }

    ngOnInit() {

      console.log('ngOnInit');

      // HLTV.getMatches().then((res) => {
      //   console.log(res);
      // });

      if(this.afService.uid_prop != null){
        this.afService.getUserLastSelected().subscribe(y=>{
          this.specificNews = this.afService.selectSpecificNews(y.$value);
        });
      }
      else {
        this.afService.uidUpdate.subscribe(x=>{
          console.log(x);
          this.afService.getUserLastSelected().subscribe(y=>{
            this.selectedLabel = y.$value;
            this.specificNews = this.afService.selectSpecificNews(y.$value);
            this.specificNews.subscribe(xxx => console.log(xxx));
          });
        });
      }
    }

    onLinkClick(menuSidenav : MdSidenav):void {
      if (this.isMobileView) {
        menuSidenav.close();
      }
    }

    dropdownButtonOnClick(){
      //itt használom mivel az afservice.user még nicns inicializálva amikor ráhívnék a constructorban

      if(this.afService.user == null){
        return;
      }

      this.afService.user.subscribe(x => {
        this.selectedLabels = new Array<any>();
        this.selectedLabelsToSend = new Array<any>();
        this.labelFilter = new Array<any>();
        if(x.labels == null){
          return;
        }
        x.labels.forEach(y=>{
          this.selectedLabels.push(y);
          this.selectedLabelsToSend.push(y);
          this.labelFilter.push({label:y});
        });
      });
    }

    onMultipleSelected(item) {
        this.selectedLabelsToSend.push(item.label);
    }

    onMultipleDeselected(item) {
        this.selectedLabelsToSend = this.selectedLabelsToSend.filter(x => x !== item.label);
    }

    onSingleSelected(item) {
        console.log('- selected (value: ' + item.value  + ', label:' +
                       item.label + ')');

        // this.afService.filterBy('labels/'+item.label,true);
        this.selectedLabel = item.label;
        this.specificNews = this.afService.selectSpecificNews(item.label);
    }

    onDropDownSelected(item){
      console.log(item);
      this.dropdownSelected = item;
      this.specificNews = this.afService.selectSpecificNews(item.label);
    }

    saveFavourites(){
      this.afService.setUserLabels(this.selectedLabelsToSend);
    }

    onNextPage(){
      this.afService.limitNumber += 2;
      console.log(this.selectedLabel);
      this.specificNews = this.afService.selectSpecificNews(this.selectedLabel);
      this.startNumber += 2;
      this.endNumber += 2;
    }

    openDialog(key: string): void {
      console.log('key: '+key);
      const dialogRef = this.dialog.open(BetModalComponent, {
        width: '400px',
        data: { key: key }
      });
      dialogRef.afterClosed().subscribe(result => {
        console.log('The dialog was closed');
        this.animal = result;
      });
    }
}