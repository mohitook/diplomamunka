// src/app/providers/af.ts
import { Injectable } from "@angular/core";
import { AngularFire, AuthProviders, AuthMethods, FirebaseListObservable, FirebaseObjectObservable, FirebaseRef } from 'angularfire2';
import { Subject } from 'rxjs/Subject';
@Injectable()
export class AF {
    public messages: FirebaseListObservable<any>;
    public news: FirebaseListObservable<any>;
    public allNews: FirebaseListObservable<any>;
    public users: FirebaseListObservable<any>;
    public specificNews: FirebaseListObservable<any>;
    public uid: string;
    public displayName: string;
    public email: string;

    public propertySubject: Subject<any>;
    public valueSubject: Subject<any>;

    constructor(public af: AngularFire) {
        this.propertySubject = new Subject();
        this.valueSubject = new Subject();
        this.messages = this.af.database.list('messages');
        this.news = this.af.database.list('news');

        this.allNews = this.af.database.list('news', {
            query: {
                orderByChild: 'labels/all',
                equalTo: true,
                limitToFirst: 2
            }
        });


        //valamiért inicializáláskor nem működik, csak pl gombnyomás után -->?!
        this.specificNews = this.af.database.list('news', {
            query: {
                orderByChild: this.propertySubject,
                equalTo: this.valueSubject?this.valueSubject:'igaz',
                limitToFirst: 2
            }
        });

        //this.filterBy('labels/nyuszi','igaz');

    }
    /**
     * Logs in the user
     * @returns {firebase.Promise<FirebaseAuthState>}
     */
    loginWithGoogle() {
        return this.af.auth.login({
            provider: AuthProviders.Google,
            method: AuthMethods.Popup,
        });
    }
    /**
     * Logs out the current user
     */
    logout() {
        return this.af.auth.logout();
    }
    /**
     * Saves a message to the Firebase Realtime Database
     * @param text
     */
    sendMessage(text) {
        var message = {
            message: text,
            displayName: this.displayName,
            email: this.email,
            timestamp: Date.now()
        };
        this.messages.push(message);

    }

    /**
     * Saves a News to the Firebase Realtime Database
     * @param text
     */
    sendNews(news) {
        console.log(news);

        var labelsTmp: any = {};

        news.labels.forEach(x => {
            console.log(x);
            labelsTmp[x] = true;
        });

        console.log(labelsTmp);

        var newsSend = {
            title: news.title,
            coverImageUrl: news.coverImageUrl,
            summary: news.summary,
            labels: labelsTmp,
            creator: {
                uid: this.uid,
                displayname: this.displayName
            },
            timestamp: Date.now()

        };
        //this.news.push(newsSend).key;
        //https://github.com/angular/angularfire2/issues/144
        var newObjectKey = (1/Date.now()) + this.uid.substring(0,5);
        newObjectKey = newObjectKey.replace('.','');
        console.log("newsObjectKey:");
        console.log(newObjectKey);
        //not necessary, it will just order the news on the firebase dashboard! dont affect to the items queried by child element!
        this.news.$ref.ref.child(newObjectKey).setWithPriority(newsSend,0-Date.now());

        //Set the timestamp as key
        //const toSet = this.af.database.object('news/' + newObjectKey);
        //toSet.set(newsSend);

        //Set the content
        const toSend = this.af.database.object(`/newscontent/${newObjectKey}`);
        toSend.set({ text: news.text });

    }

    getSingleNewsByKey(key) {
        //...And if you already have the data loaded in memory, the SDK won't do a network call unless the item has changed remotely.
        var item = this.af.database.object('/news/' + key);
        return item;
    }

    getNewsContent(key) {
        var item = this.af.database.object('/newscontent/' + key);
        item.subscribe(x => {
            console.log("it return many times, CHECK IT" + x);
        })
        return item;
    }

    filterBy(property: string, value: string) {

        this.propertySubject.next(property);
        this.valueSubject.next(value);
        this.specificNews.subscribe(x=>{
          console.log("miafenevan?!");
          console.log(x);
        })
    }

    //++Helper methods



    //--Helper methods

}
