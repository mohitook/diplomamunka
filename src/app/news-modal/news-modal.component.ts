import { Observable } from 'rxjs/Observable';
import { StatisticsService } from './../providers/statistics.service';
import { MdDialog } from '@angular/material';
import { LoginPageComponent } from './../login-page/login-page.component';
import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { AF } from "../providers/af";
import { FirebaseListObservable, FirebaseObjectObservable } from "angularfire2";
import { BrowserModule, DomSanitizer } from '@angular/platform-browser';
import {NgxPaginationModule, PaginationInstance} from 'ngx-pagination';
import { ShareButton, ShareProvider } from 'ngx-sharebuttons';
import 'rxjs/add/operator/take';

@Component({
  selector: 'app-news-modal',
  templateUrl: './news-modal.component.html',
  styleUrls: ['./news-modal.component.css']
})
export class NewsModalComponent implements OnInit {
  public sub: any;
  public key:string;

  public selectedNews;
  public htmlText;

  public comments: Observable<any>;

  public commentsOpened :boolean = false;

  public newCommentText:string;

  public commentsLength:number = 0;

  verifyResent = false;

  fbButton;

  public config: PaginationInstance = {
        id: 'config',
        itemsPerPage: 10,
        currentPage: 1
    };
    p;

  constructor(private router: Router,public afService: AF ,public statService: StatisticsService, private route: ActivatedRoute,private sanitizer:DomSanitizer, public dialog: MdDialog) {
    //predefine to avoid errors
    this.selectedNews = {coverImageUrl:"",creator:{displayname:"",uid:""},labels:{},summary:"",timestamp:"",title:"", text:''}
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
         //var tmp = JSON.parse(JSON.stringify(x));
         this.htmlText = x.text; //this.sanitizer.bypassSecurityTrustHtml(tmp.text);
       }
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

  onComments(){
    this.commentsOpened=true;
    //console.log(this.key);
    this.comments = this.afService.setCommentsFilter(this.key);
    this.comments.subscribe(x=>{
      //to paginate to the last page when a new comment comes
      this.commentsLength = x.length;
      //console.log("current length: " + x.length);
    });
  }

  addComment(){
    if(this.newCommentText==null){
      this.newCommentText = "TODO: Validate if input exists!";
    }
    this.afService.sendComment(this.newCommentText).then(x=>{
      this.config.currentPage = Math.ceil(this.commentsLength / this.config.itemsPerPage);
    });
    this.newCommentText=null;
  }

  openedShareButton(event){
    //add sharecount!

    // var utc = new Date().toJSON().slice(0,10).replace(/-/g,'-');
    // console.log(utc);

    var dateObj = new Date();
    var month = dateObj.getUTCMonth() + 1;
    var year = dateObj.getUTCFullYear();

    var bonus0 = (month<10)? '0' : '';

    var currentMonth = year + '-' + bonus0 + month;
    console.log(currentMonth);
    this.statService.addStatistics('newsShared/' + currentMonth , this.selectedNews.creator.displayname);
  }

  moderateComment(commentKey: string){
    this.afService.af.database.object('comments/' + this.key + '/' + commentKey + '/moderated').set(true);
  }

  checkModerated(moderated){
    if(moderated){
      return 'red';
    }
    return 'blue';
  }

  verifyAgain(){
    this.afService.sendUserVerifyAgain().then(()=>{this.verifyResent = true;});
  }
}
