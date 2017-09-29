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
        console.log(match);
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
}
