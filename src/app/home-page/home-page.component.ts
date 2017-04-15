import { Component, OnInit, AfterViewChecked, ElementRef, ViewChild,Pipe,PipeTransform,Sanitizer } from '@angular/core';
import { BrowserModule, DomSanitizer } from '@angular/platform-browser';
import { AF } from "../providers/af";
import { FirebaseListObservable, FirebaseObjectObservable } from "angularfire2";
import {Observable} from 'rxjs/Observable';
import "rxjs/add/operator/map";

import { Router } from "@angular/router";


@Component({
    selector: 'app-home-page',
    templateUrl: './home-page.component.html',
    styleUrls: ['./home-page.component.css']
})
export class HomePageComponent implements OnInit {

    news: FirebaseListObservable<any>;
    labels: FirebaseListObservable<any>;
    userLabels: FirebaseListObservable<any>;
    allNews: FirebaseListObservable<any>;
    specificNews: FirebaseListObservable<any>;

    labelFilter:  any[] = [{ label: '' }];


    selectedLabels: Array<any>;

    selectedLabelsToSend: Array<any>;

    ///default selected value in the specific news /ng-select
    currentItem : string;

    dropdownSelected: any = {label:"Favourites", image:''};

    constructor(public afService: AF,private sanitizer:DomSanitizer){

      this.labels = this.afService.labels;
      this.selectedLabelsToSend = new Array<any>();

      this.allNews = this.afService.allNews;

      //this.specificNews =this.afService.specificNews;

    }

    ngOnInit() {

      //this.specificNews = this.afService.selectSpecificNews('all');

      this.afService.uidUpdate.subscribe(x=>{
        this.afService.getUserLastSelected().subscribe(y=>{
          this.specificNews = this.afService.selectSpecificNews(y.$value);
        });
      });
    }

    dropdownButtonOnClick(){
      //itt használom mivel az afservice.user még nicns inicializálva amikor ráhívnék a constructorban
      this.afService.user.subscribe(x=>{
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
      })
    }

    onMultipleSelected(item) {
        this.selectedLabelsToSend.push(item.label)
    }

    onMultipleDeselected(item) {
        this.selectedLabelsToSend = this.selectedLabelsToSend.filter(x => x !== item.label);
    }

    onSingleSelected(item) {
        console.log('- selected (value: ' + item.value  + ', label:' +
                       item.label + ')');

        //this.afService.filterBy('labels/'+item.label,true);

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

}
