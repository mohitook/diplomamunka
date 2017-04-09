import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { AF } from "../providers/af";
import { FirebaseListObservable, FirebaseObjectObservable } from "angularfire2";
import { BrowserModule, DomSanitizer } from '@angular/platform-browser';

@Component({
  selector: 'app-news-modal',
  templateUrl: './news-modal.component.html',
  styleUrls: ['./news-modal.component.css']
})
export class NewsModalComponent implements OnInit {
  private sub: any;
  private key:string;

  public selectedNews;

  private htmlText;

  constructor(private router: Router,public afService: AF ,private route: ActivatedRoute,private sanitizer:DomSanitizer) {
    //predefine to avoid errors
    this.selectedNews = {coverImageUrl:"",creator:{displayname:"",uid:""},labels:{},summary:"",timestamp:"",title:""}
  }

  ngOnInit() {

    this.sub = this.route.params.subscribe(params => {
       this.key = params['key'];
       });

       this.afService.getSingleNewsByKey(this.key).subscribe(x=>{
         //if the provided key doesn't exists / avoid errors
         if(x.title == null){
           this.router.navigate(['']);
           return;
         }
         //Object.assign(this.selectedNews,news);
         this.selectedNews = JSON.parse(JSON.stringify(x)); //this is the only working DEEP COPY! wtf...

         //http://stackoverflow.com/questions/38446235/div-innerhtml-not-working-with-iframe-html-in-angular2-html-inject
         //in fact it is not secure right now!! TODO: read about this bypassSecurityTrustHtml

         //this.selectedNews.content.text = this.sanitizer.bypassSecurityTrustHtml(this.selectedNews.content.text);
       },
       err =>{
         console.log("ERROR")
       },
     ()=>{console.log("yay")});

     this.afService.getNewsContent(this.key).subscribe(x=>{
       if(x.text == null){
         this.htmlText = "test news with no content!"
       }
       else{
         var tmp = JSON.parse(JSON.stringify(x));
         this.htmlText = this.sanitizer.bypassSecurityTrustHtml(tmp.text);
       }
     });
  }
}
