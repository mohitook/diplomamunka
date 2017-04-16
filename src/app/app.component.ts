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

    }

    logout() {
        this.afService.logout();
    }

    onScrollDown() {
        console.log('scrolled!!');
    }

}
