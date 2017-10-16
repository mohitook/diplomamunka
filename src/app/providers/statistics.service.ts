import { Injectable } from '@angular/core';
import { AngularFire, AuthProviders, AuthMethods, FirebaseListObservable, FirebaseObjectObservable, FirebaseRef, FirebaseAuthState } from 'angularfire2';
import { Observable } from 'rxjs/Observable';
import 'rxjs/add/operator/take';


@Injectable()
export class StatisticsService {

    constructor(public af: AngularFire) { }

    addStatistics(category: string, key: string){
        this.af.database.object('statistics/' + category + '/' + key).take(1).subscribe(x=>{
            var newCount;
            if(x.$value == null){
              newCount = 0;
            }
            else{
              newCount = x.$value;
            }
            this.af.database.object('statistics/' + category + '/' + key).set(newCount + 1);
          });
    }


}