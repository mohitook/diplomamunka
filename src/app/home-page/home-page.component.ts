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

    allNews: FirebaseListObservable<any>;

    specificNews: FirebaseListObservable<any>;

    constructor(public afService: AF,private sanitizer:DomSanitizer){

      //test things
      //this.news = this.afService.allNews.map(items => items.sort((a, b) => b.timestamp - a.timestamp)) as FirebaseListObservable<any[]>;

      this.news = this.afService.news.map(posts => {
         return posts.reverse();
     }) as FirebaseListObservable<any[]>;
      console.log("filtered: ");
      //this.news = this.news.map(items => items.filter(item => item.title == "Az első normális hír a portálon")) as FirebaseListObservable<any[]>;

      this.news.subscribe(x=>console.log(x));

      this.news.forEach((x)=>{
        console.log(x.$key);
      });
      //test things

      //this.allNews = this.afService.allNews.map(items => items.sort((a, b) => b.timestamp - a.timestamp)) as FirebaseListObservable<any[]>;

      this.allNews = this.afService.allNews;
      //this.specificNews = this.afService.specificNews;

      this.specificNews =this.afService.specificNews;

    }

    ngOnInit() {
      this.afService.filterBy('labels/nyuszi','igaz');
    }

    filter(){
      this.afService.filterBy('labels/nyuszi','igaz');
    }

}
