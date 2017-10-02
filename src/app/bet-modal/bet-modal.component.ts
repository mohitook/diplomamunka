import { MdDialogRef, MD_DIALOG_DATA } from '@angular/material';
import { Component, OnInit, Inject } from '@angular/core';
import {FormControl, Validators} from '@angular/forms';
import { AF } from '../providers/af';
import { FirebaseListObservable, FirebaseObjectObservable } from 'angularfire2';

@Component({
  selector: 'app-bet-modal',
  templateUrl: './bet-modal.component.html',
  styleUrls: ['./bet-modal.component.css']
})
export class BetModalComponent implements OnInit {

  selectedTeam = '';
  public tip;
  selectedBetting: FirebaseObjectObservable<any>;
  alreadyTiped = false;
  everythingLoaded = false;
  game;
  matchIsFuture = false;
  matchIsInProgress = false;
  matchIsFinished = false;
  streamIsAvailable = false; //feature!

  BET_REGEX = /^\d+$/;
  BET_REGEX_Not0 = /^[1-9][0-9]*$/;

  betFormControl = new FormControl('', [
    Validators.required,
    Validators.pattern(this.BET_REGEX_Not0),
    Validators.pattern(this.BET_REGEX)]);

  constructor(public afService: AF,
    public dialogRef: MdDialogRef<BetModalComponent>,
    @Inject(MD_DIALOG_DATA) public data: any) { 

      this.selectedBetting = this.afService.af.database.object('matches/'+ data.key);
      this.selectedBetting.subscribe(match=>{
        if(match.status == 'notFuture'){
          this.matchIsInProgress = true;
        }
        else if(match.status == 'finished'){
          this.matchIsFinished = true;
        }
        else{
          this.matchIsFuture = true;
        }
        console.log(match);
        this.game = match.game;
        this.afService.checkIfAlreadyTiped(this.data.key).subscribe(matchBet=>{
          console.log(matchBet);
          if(matchBet.status!=null){ 
            this.selectedTeam = matchBet.team;
            this.alreadyTiped = true;
            this.tip = matchBet.tip;
            if(match.status == 'future')
              this.afService.af.database.object('checkMatchDate/' + data.key).set(match.begin_at);
          }
          else if(match.status == 'future'){
            //triggers the function to check if it is still able to bet!
            this.afService.af.database.object('checkMatchDate/' + data.key).set(match.begin_at);
          }
          this.everythingLoaded = true; //to fix the little 'available time' till the request is processed
        });
      });
      //this.alreadyTiped = true;
    }

 ngOnInit(): void { }

  onNoClick(): void {
    this.dialogRef.close();
  }

  onTeamClick(left: boolean){
    if(left){
      this.selectedTeam = 'left';
    }
    else{
      this.selectedTeam = 'right';
    }
  }

  getBackgroundColor(left: boolean){
    if(this.selectedTeam === '' || (left && this.selectedTeam === 'right')){
      return 'white';
    }
    if((this.selectedTeam === 'left' && left) || (!left && this.selectedTeam === 'right') ){
      return '#8c9eff';
    }
  }

  placeBets(){
    this.afService.placeTip(this.data.key,this.selectedTeam,this.tip);
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

}
