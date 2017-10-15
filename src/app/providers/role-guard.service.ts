import { Observable } from 'rxjs/Observable';
import { AF } from './af';
import { Injectable } from '@angular/core';
import { 
    Router,
    CanActivate,
    ActivatedRouteSnapshot
  } from '@angular/router';

@Injectable()
export class RoleGuardService implements CanActivate {
    
    constructor( public afService: AF, public router: Router) { }

    canActivate(route: ActivatedRouteSnapshot): Observable<boolean> | boolean {
        //https://stackoverflow.com/questions/42589916/angular-2-route-guard-canactivate-based-on-firebase-user-role
        let roles = route.data["roles"] as Array<string>;

        return this.afService.af.auth.mergeMap(user=>{
            if(user)
                return this.afService.af.database.list('users/' + user.uid + '/roles');
            else{
                this.router.navigate(['']);
                return Observable.of({});
            }
        }).map(userRoles =>{
            let tmp = userRoles as Array<any>;
            var retValue = false;
            roles.forEach(role=>{
                tmp.forEach(userRole=>{
                    if(userRole.$key == role && userRole.$value == true)
                        retValue = true;
                })
            });
            return retValue;
        });
      }
}