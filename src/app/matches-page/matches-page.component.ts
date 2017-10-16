import { MdDialog } from '@angular/material';
import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { AF } from "../providers/af";
import { FirebaseListObservable, FirebaseObjectObservable } from "angularfire2";
import { BetModalComponent } from './../bet-modal/bet-modal.component';
import { MobileViewService } from "../providers/mobileView.service";
import {Observable} from 'rxjs/Observable';
import {NgxPaginationModule, PaginationInstance} from 'ngx-pagination';

@Component({
  selector: 'app-matches-page',
  templateUrl: './matches-page.component.html',
  styleUrls: ['./matches-page.component.css']
})
export class MatchesPageComponent implements OnInit {
 
  upcomingMatches: FirebaseListObservable<any>;
  notFutureMatches: FirebaseListObservable<any>;
  finishedMatches: Observable<any>;
  labels: Array<any>; 
  selectedLabel;
  filterArray;
  dummy = 0;
  labelsAreAvailable = false;
  onlyMyBetsChecked = false;

  finishedMatchesPerUser = {};
  notFutureMatchesPerUser = {};

  public config: PaginationInstance = {
    id: 'config',
    itemsPerPage: 10,
    currentPage: 1
};

public config2: PaginationInstance = {
  id: 'config2',
  itemsPerPage: 10,
  currentPage: 1
};

public config3: PaginationInstance = {
  id: 'config3',
  itemsPerPage: 10,
  currentPage: 1
};

p;
p2;
p3;

  constructor(public afService: AF ,public mobView: MobileViewService,  public dialog: MdDialog, private cd: ChangeDetectorRef) {
    this.upcomingMatches = afService.upcomingMatches;
    this.notFutureMatches = afService.notFutureMatches;

    //to order them by date ascending, because the original list is descending by timestamp..
    this.finishedMatches = afService.finishedMatches.map( (arr) => { return arr.reverse(); } );
    //this will trigger a "reorder" in case of new bet in finished state!
    this.afService.finishedMatches.subscribe(x=>{
      this.finishedMatches = afService.finishedMatches.map( (arr) => { return arr.reverse(); } );
    });

    this.labels = [
      {name: 'All', image: 'https://firebasestorage.googleapis.com/v0/b/dipterv-f7bce.appspot.com/o/shortRed.png?alt=media&token=d9a9551a-b155-4813-8fa8-b25436b154e3'},
      {name: 'Dota 2', image: 'https://orig05.deviantart.net/97fe/f/2013/332/c/4/dota_2_icon_by_benashvili-d6w0695.png'},
    {name: 'Counter Strike GO', image: 'https://seeklogo.com/images/C/Counter-Strike-logo-EAC70C9C3A-seeklogo.com.png'},
    {name: 'League of Legends', image: 'https://vignette.wikia.nocookie.net/leagueoflegends/images/1/12/League_of_Legends_Icon.png/revision/latest?cb=20150402234343'}
    ];

    this.afService.userBets.subscribe(x=>{
      console.log(x);
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

  checkboxChanged(event){
    console.log(event); 
  }

  filterOnlyMyBets(event){
    if(event.checked){
      console.log('checked');
      this.dummy++;
      this.filterArray = this.finishedMatchesPerUser;
    }
    else{
      this.filterArray = null;
    }
  }

  onSidenavClick(label: any){
    this.selectedLabel = label.name;
  }

  labelImgLoad(){
    //clear the placeholder in time    
    this.labelsAreAvailable = true;    
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
  }

  getTeamFontStyle(matchKey, competitor, winner = ''){
    var color;
    var fontWeight;

    if(this.afService.userBettings[matchKey] != null){

        //in case of live matches
      if(this.afService.userBettings[matchKey].status == 'inProgress' && competitor === this.afService.userBettings[matchKey].team){
        color = '#e65100';
        fontWeight = 900;
      }
      //in case of finished matches
      else if(this.afService.userBettings[matchKey].status == 'finished'){
        if(this.afService.userBettings[matchKey].team == competitor){
          if(this.afService.userBettings[matchKey].result == 'win'){
            color = '#00c853';
            fontWeight = 900;
          }
          else if(this.afService.userBettings[matchKey].result == 'lose'){
            color = '#d50000';
          }
        }
        if(this.afService.userBettings[matchKey].team != competitor 
          && this.afService.userBettings[matchKey].result == 'lose'){
            fontWeight = 900;
        }
      }

      return {
        'color': color,
        'font-weight': fontWeight
      };
    }
    else{
      if(competitor == winner){
        return {'font-weight' : 900 };
      }
    }
  }

  setBackgroundOnBet(matchKey, result?){

    if(this.afService.userBettings[matchKey] != null){

      if(this.afService.userBettings[matchKey].status == 'inProgress'){
        return '#fff176';      
      }
      if(this.afService.userBettings[matchKey].status == 'finished'){
        if(this.afService.userBettings[matchKey].result == 'win'){
          return '#b9f6ca';
        }
        else{
          return '#ffcdd2';
        }
      }
    
    }

    if(result == 'abandoned'){
      return '#9e9e9e';
    }

    if(result == 'draw'){
      return '#ce93d8';
    }

    return '#8c9eff';
  }
}
