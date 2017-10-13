import { Component, OnInit, AfterViewChecked, ElementRef, ViewChild } from '@angular/core';
import { AF } from "../providers/af";
import { FirebaseListObservable } from "angularfire2";

@Component({
    selector: 'app-home-page',
    templateUrl: './chat-page.component.html',
    styleUrls: ['./chat-page.component.css']
})
export class ChatPageComponent implements OnInit, AfterViewChecked {
    @ViewChild('scrollMe') private myScrollContainer: ElementRef;

    public newMessage: string;
    public messages: FirebaseListObservable<any>;
    constructor(public afService: AF) {
        this.messages = this.afService.messages;
    }
    ngOnInit() { }

    ngAfterViewChecked() {
        this.scrollToBottom();
    }
    scrollToBottom(): void {
        try {
            this.myScrollContainer.nativeElement.scrollTop = this.myScrollContainer.nativeElement.scrollHeight;
        } catch (err) { console.log('Scroll to bottom failed yo!') }
    }

    // I forgot to add this but thanks for letting me know in the comments so I could update it!
    sendMessage() {
        this.afService.sendMessage(this.newMessage);
        this.newMessage = '';
    }

    isYou(email) {
        if (email == this.afService.user.email)
            return true;
        else
            return false;
    }
    isMe(email) {
        if (email == this.afService.user.email)
            return false;
        else
            return true;
    }

}
