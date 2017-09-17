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

  BET_REGEX = /^\d+$/;
  BET_REGEX_Not0 = /^[1-9][0-9]*$/;

  betFormControl = new FormControl('', [
    Validators.required,
    Validators.pattern(this.BET_REGEX_Not0),
    Validators.pattern(this.BET_REGEX)]);

  constructor(public afService: AF,
    public dialogRef: MdDialogRef<BetModalComponent>,
    @Inject(MD_DIALOG_DATA) public data: any) { 

      this.selectedBetting = this.afService.af.database.object('bettings/'+data.key);
      this.selectedBetting.subscribe(x=>{
        console.log(x);
        this.checkIfAlreadyTiped(x);
      })
    }

 ngOnInit(): void { }

    checkIfAlreadyTiped(betting: any){
      if(betting.betHistory != null){
        if(betting.betHistory[this.afService.uid] != null){
          this.alreadyTiped = true;
          if(betting.betHistory[this.afService.uid].left != null){
            this.selectedTeam = 'left';
            this.tip = betting.betHistory[this.afService.uid].left;
          }
          else{
            this.selectedTeam = 'right';
            this.tip = betting.betHistory[this.afService.uid].right;
          }
        }
      }
    }

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
