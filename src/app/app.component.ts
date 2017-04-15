import { Component } from '@angular/core';
import { AF } from "./providers/af";
import { Router } from "@angular/router";
@Component({
    selector: 'app-root',
    templateUrl: './app.component.html',
    styleUrls: ['./app.component.css']
})
export class AppComponent {
    public isLoggedIn: boolean;

    throttle = 300;
    scrollDistance = 1;

    constructor(public afService: AF, private router: Router) {
        // This asynchronously checks if our user is logged it and will automatically
        // redirect them to the Login page when the status changes.
        // This is just a small thing that Firebase does that makes it easy to use.
        this.afService.af.auth.subscribe(
            (auth) => {
                if (auth == null) {
                    console.log("Not Logged in.");
                    this.isLoggedIn = false;
                    //this.router.navigate(['login']);
                }
                else {
                    console.log("Successfully Logged in.");
                    // Set the Display Name and Email so we can attribute messages to them
                    if (auth.google) {
                        this.afService.displayName = auth.google.displayName;
                        this.afService.email = auth.google.email;
                        this.afService.uid_prop = auth.auth.uid;
                        //this.afService.uid = auth.auth.uid; //google.uid returns something else..
                    }
                    else {
                        this.afService.displayName = auth.auth.displayName;
                        this.afService.email = auth.auth.email;
                        this.afService.uid_prop = auth.auth.uid;
                    }
                    this.isLoggedIn = true;

                    this.afService.getUserLabels(auth.auth.uid);

                    this.afService.checkIfFirstLogin().subscribe(x => {
                        if (x.$value == null) {
                            this.router.navigate(['']);
                            //this.router.navigate(['settings']); //it could be still an option to navigate settings
                        }
                        else {
                            this.router.navigate(['']);
                        }
                    });
                }
            }
        );
    }

    logout() {
        this.afService.logout();
    }

    onScrollDown() {
        console.log('scrolled!!');
    }

}
