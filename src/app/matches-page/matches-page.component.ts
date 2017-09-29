import { MdDialog } from '@angular/material';
import { Component, OnInit } from '@angular/core';
import { AF } from "../providers/af";
import { FirebaseListObservable, FirebaseObjectObservable } from "angularfire2";
import { BetModalComponent } from './../bet-modal/bet-modal.component';
import { MobileViewService } from "../providers/mobileView.service";
import {Observable} from 'rxjs/Observable';

@Component({
  selector: 'app-matches-page',
  templateUrl: './matches-page.component.html',
  styleUrls: ['./matches-page.component.css']
})
export class MatchesPageComponent implements OnInit {

  upcomingMatches: FirebaseListObservable<any>;
  notFutureMatches: FirebaseListObservable<any>;
  finishedMatches: Observable<any>;
  labels: FirebaseListObservable<any>;
  selectedLabel;
  labelsAreAvailable = false;

  gameFilter = '';

  finishedMatchesPerUser = {};
  notFutureMatchesPerUser = {};

  constructor(public afService: AF ,public mobView: MobileViewService,  public dialog: MdDialog) {
    this.upcomingMatches = afService.upcomingMatches;
    this.notFutureMatches = afService.notFutureMatches;
    //to order them by date ascending, because the original list is descending by timestamp..
    this.finishedMatches = afService.finishedMatches.map( (arr) => { return arr.reverse(); } );
    this.labels = this.afService.labels;

    this.labels.subscribe(x => {
      if(x != null){
        this.labelsAreAvailable = true;
      }
    });

    this.finishedMatches.subscribe(matches=>{
      matches.forEach(match => {
        this.afService.checkIfAlreadyTiped(match.$key).subscribe(userBet=>{
          //check the status because it won't be null even if it should be....
          if(userBet.status!=null){
            this.finishedMatchesPerUser[match.$key] = userBet;
          }
        });
      });
    });

    this.notFutureMatches.subscribe(matches=>{
      matches.forEach(match => {
        this.afService.checkIfAlreadyTiped(match.$key).subscribe(userBet=>{
          //check the status because it won't be null even if it should be....
          if(userBet.status!=null){
            this.notFutureMatchesPerUser[match.$key] = userBet;
          }
        });
      });
    });

   }

  ngOnInit() { 
  }

  onSidenavClick(label: any){
    this.selectedLabel = label.label;
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

  setColorBasedOnBet(match, competitor, live = false){

    if(live){
      if(this.notFutureMatchesPerUser != null){
        if (competitor === this.notFutureMatchesPerUser[match].team)
          return '#e65100';
      }
    }

    if(this.finishedMatchesPerUser[match] != null){
      if(competitor == this.finishedMatchesPerUser[match].team){
        if(this.finishedMatchesPerUser[match].result == 'win'){
          return '#00c853';
        }
        else if(this.finishedMatchesPerUser[match].result == 'lose'){
          return '#d50000';
        }
      }
    }
  }

  getTeamFontStyle(matchKey, competitor, live = false){
    var color;
    var fontWeight;
    if(live && this.notFutureMatchesPerUser[matchKey] != null && competitor === this.notFutureMatchesPerUser[matchKey].team){
      color = '#e65100';
      fontWeight = 900;
    }
    else if(!live && this.finishedMatchesPerUser[matchKey] != null){
      if(this.finishedMatchesPerUser[matchKey].team == competitor && this.finishedMatchesPerUser[matchKey].result == 'win'){
        color = '#b9f6ca';
        fontWeight = 900;
      }
      else if(this.finishedMatchesPerUser[matchKey].team == competitor && this.finishedMatchesPerUser[matchKey].result == 'lose'){
        color = '#ffcdd2';
      }
    }

    return {
      'color': color,
      'font-weight': fontWeight
    };
  }

  setBorderBasedOnBet(matchKey, live = false){

    if(live){
      if(this.notFutureMatchesPerUser[matchKey]!=null){
        return '#fff176';
      }
    }

    if(this.finishedMatchesPerUser[matchKey] != null){
      if(this.finishedMatchesPerUser[matchKey].result == 'win'){
        return '#b9f6ca';
      }
      else{
        return '#ffcdd2';
      }
    }
  }

}
