import { User } from './../user-model/user';
// src/app/providers/af.ts
import { Injectable, EventEmitter } from "@angular/core";
import { AngularFire, AuthProviders, AuthMethods, FirebaseListObservable, FirebaseObjectObservable, FirebaseRef, FirebaseAuthState } from 'angularfire2';
import { Subject } from 'rxjs/Subject';
import { Observable } from 'rxjs/Observable';
import "rxjs/add/operator/share";

import * as firebase from 'firebase';

@Injectable()
export class AF {

    public isLoggedIn: boolean;

    public limitNumber: number = 2;

    private clock: Observable<Date>;

    public userBets: FirebaseListObservable<any>;
    public pendingBetsForUser: FirebaseObjectObservable<any>;
    public upcomingMatches: FirebaseListObservable<any>;
    public upcomingMatchesForNewsPage: FirebaseListObservable<any>;
    public notFutureMatches: FirebaseListObservable<any>;
    public finishedMatches: FirebaseListObservable<any>;
    public messages: FirebaseListObservable<any>;
    public news: FirebaseListObservable<any>;
    public comments: FirebaseListObservable<any>;
    public labels: FirebaseListObservable<any>;
    public allNews: FirebaseListObservable<any>;
    public users: FirebaseListObservable<any>;

    public userObs: FirebaseObjectObservable<any>;
    public user: User = new User();

    public specificNews: FirebaseListObservable<any>;
    public placeHolderSpecificNews: FirebaseListObservable<any>;
    public uid: string;
    public firstLogin: boolean = false;

    public userHasAlreadyPendingBet = false;
    public propertySubject: Subject<any>;
    public valueSubject: Subject<any>;
    public commentsSubject: Subject<any>;

    uidUpdate: EventEmitter<string> = new EventEmitter();

    public authState: FirebaseAuthState;

    public userBettings = {};

    get uid_prop(): string {
        return this.uid;
    }
    set uid_prop(value: string) {
        this.uid = value;
        this.uidUpdate.next(value);
    }

    constructor(public af: AngularFire) {
        this.propertySubject = new Subject();
        this.valueSubject = new Subject();
        this.commentsSubject = new Subject();

        this.messages = this.af.database.list('messages');
        this.news = this.af.database.list('news');
        this.labels = this.af.database.list('labels');
        this.users = this.af.database.list('users');

        this.allNews = this.af.database.list('news', {
            query: {
                orderByChild: 'labels/All',
                equalTo: true,
            }
        });

        //refactor this to a method
        //this handles the still tip'able matches. if the timestamp of the match is bigger then the current time: it is not tipable anymore
        //and not 'future'

        this.upcomingMatches = this.af.database.list('matches', {
            query: {
                orderByChild: 'status',
                equalTo: 'future'
            }
        });

        this.upcomingMatchesForNewsPage = this.af.database.list('matches', {
            query: {
                orderByChild: 'status',
                equalTo: 'future',
                limitToFirst: 5
            }
        });

        this.notFutureMatches = this.af.database.list('matches', {
            query: {
                orderByChild: 'status',
                equalTo: 'notFuture'
            }
        });

        this.finishedMatches = this.af.database.list('matches', {
            query: {
                orderByChild: 'status',
                equalTo: 'finished'
            }
        });

        //I have to get the bets related to the current user, and store them in the service
        this.userBets = this.af.database.list('bets', {
            query: {
                orderByChild: this.propertySubject,
                startAt: ''
            }
        });

        this.uidUpdate.subscribe(uid => {
            this.propertySubject.next(uid);
            this.pendingBetsForUser = this.af.database.object('pendingBets/' + uid);
            this.pendingBetsForUser.subscribe(x => {
                //this is for the client check, to disable all bet functions till there is a pending bet related to the current user!
                if (x.matchId != null) {
                    this.userHasAlreadyPendingBet = true;
                }
                else {
                    this.userHasAlreadyPendingBet = false;
                }
            });
        });

        this.userBets.subscribe(bets => {
            //make sure reInitialize it! (basically it is important just for test purposes)
            this.userBettings = {};
            bets.forEach(bet => {
                this.userBettings[bet.$key] = bet[this.uid];
            });
            console.log(this.userBettings);
        });

        //this.clock = Observable.interval(1000).map(tick => new Date()).share();

        // this.upcomingMatches.subscribe(matches => {
        //     matches.forEach(match => {
        //         if(match.begin_at <= new Date().getTime() && match.status == 'future'){
        //             this.af.database.object('checkMatchDate/' + match.$key).set(match.begin_at);
        //         }
        //     });
        // });

        this.af.auth.subscribe(
            (auth) => {
                this.authState = auth;
                console.log('af auth trigger');
                if (auth == null) {
                    console.log("Not Logged in.");
                    this.isLoggedIn = false;
                    //this.router.navigate(['login']);
                }
                else {
                    console.log("Successfully Logged in.");
                    // Set the Display Name and Email so we can attribute messages to them
                    if (auth.google) {
                        //keep it separated in case if there will be any new difference
                        this.uid_prop = auth.auth.uid;
                        //this.uid = auth.auth.uid; //google.uid returns something else..
                    }
                    else {
                        this.uid_prop = auth.auth.uid;
                    }
                    //this.addUserInfo();

                    this.isLoggedIn = true;
                    this.userObs = this.af.database.object('/users/' + this.uid_prop);
                    this.userObs.subscribe(userData => {
                        console.log('userObs sub called');
                        this.user = new User(userData);
                    });
                }
            }
        );

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
        this.uid_prop = null;
        this.userObs = null;

        this.user = new User();

        return this.af.auth.logout();
    }
    /**
     * Saves a message to the Firebase Realtime Database
     * @param text
     */
    sendMessage(text) {
        var message = {
            message: text,
            displayName: this.user.displayName,
            email: this.user.email,
            timestamp: Date.now()
        };
        this.messages.push(message);
    }

    setCommentsFilter(key: any) {
        this.comments = this.af.database.list('comments/' + key);
        this.comments.subscribe(x => {
            console.log('comments sub');
            console.log(x);
        });
        return this.comments;
    }

    sendComment(text) {
        var message = {
            message: text,
            displayName: this.user.displayName,
            email: this.user.email,
            timestamp: Date.now(),
            photoURL: this.user.photoURL,
            userId: this.uid //not the best practice..
        };
        return this.comments.push(message);
    }

    addNewLabel(label: any) {
        this.labels.$ref.ref.child(label.label).set({
            image: label.imageUrl,
            label: label.label,
            value: label.label
        })
    }

    checkAndUpdateLabels(labels: Array<string>) {
        this.labels.subscribe(originalList => {
            labels.forEach(l => {
                var isItNew = true;
                originalList.forEach(o => {
                    if (o.value == l) {
                        isItNew = false;
                    }
                });
                if (isItNew) {
                    this.labels.$ref.ref.child(l).set({
                        image: 'https://firebasestorage.googleapis.com/v0/b/dipterv-f7bce.appspot.com/o/shortRed.png?alt=media&token=d9a9551a-b155-4813-8fa8-b25436b154e3',
                        label: l,
                        value: l
                    })
                }
            })
        });
    }

    /**
     * Saves a News to the Firebase Realtime Database
     * @param text
     */
    sendNews(news) {

        this.checkAndUpdateLabels(news.labels);

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
                displayname: this.user.displayName
            },
            timestamp: Date.now()

        };
        //this.news.push(newsSend).key;
        //https://github.com/angular/angularfire2/issues/144
        var newObjectKey = (1 / Date.now()) + this.uid.substring(0, 5);
        newObjectKey = newObjectKey.replace('.', '');
        console.log("newsObjectKey:");
        console.log(newObjectKey);
        //not necessary, it will just order the news on the firebase dashboard! dont affect to the items queried by child element!
        this.news.$ref.ref.child(newObjectKey).setWithPriority(newsSend, 0 - Date.now());

        //Set the timestamp as key
        //const toSet = this.af.database.object('news/' + newObjectKey);
        //toSet.set(newsSend);

        //Set the content
        const toSend = this.af.database.object(`/newscontent/${newObjectKey}`);
        toSend.set({ text: news.text });

        return this.af.database.object('news/' + newObjectKey);
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

    setUserLabels(selectedLabels) {
        this.af.database.object('/users/' + this.uid + "/labels").set(selectedLabels);
    }

    getUserLastSelected() {
        var queryString = 'users/' + this.uid + '/lastSelected';
        console.log('getUserLastSelected - ' + queryString);
        return this.af.database.object(queryString);
    }

    selectSpecificNews(property: any) {
        console.log('selectSpecificNews - ' + property);
        this.specificNews = this.af.database.list('news', {
            query: {
                orderByChild: 'labels/' + property,
                equalTo: true,
                //limitToFirst: this.limitNumber //nem nyerek vele kb semmit..csak vesztek
            }
        });
        console.log(property);
        this.af.database.object('users/' + this.uid + '/lastSelected').set(property);
        return this.specificNews;
    }

    checkIfAlreadyTiped(matchKey) {
        //console.log('checkIfAlreadyTiped');
        //console.log(this.uid);
        return this.af.database.object('bets/' + matchKey + '/' + this.uid);
    }

    //++Email/PW Registration

    /**
   * Calls the AngularFire2 service to register a new user
   * @param model
   * @returns {firebase.Promise<void>}
   */
    registerUser(email, password) {
        console.log(email)
        return this.af.auth.createUser({
            email: email,
            password: password
        });
    }

    // /**
    //  * Saves information to display to screen when user is logged in
    //  * @param uid
    //  * @param model
    //  * @returns {firebase.Promise<void>}
    //  */
    // saveUserInfoFromForm(uid, name, email) {
    //     return this.af.database.object('users/' + uid).set({
    //         displayName: name,
    //         email: email,
    //         coins: 1000
    //     });
    // } 

    saveUserNameInAuth(name) {
        return this.authState.auth.updateProfile({
            displayName: name,
            photoURL: ''
        });
    }

    /**
    * Logs the user in using their Email/Password combo
    * @param email
    * @param password
    * @returns {firebase.Promise<FirebaseAuthState>}
    */
    loginWithEmail(email, password) {
        return this.af.auth.login({
            email: email,
            password: password,
        },
            {
                provider: AuthProviders.Password,
                method: AuthMethods.Password,
            });
    }
    //++Email/PW Registration

    //mindenki csak egyszer fogadhat, többszöri fogadással az elején tévútra lehetne terelni a többséget és ezzel a végén kaszálni!
    placeTip(matchId: string, team: string, tip: number) {

        this.af.database.object('bets/' + matchId + '/' + this.uid).set({
            team: team,
            tip: tip,
            status: 'new'
        });
        // && now < root.child('matches').child($match).child('begin_at')
        // "root.child('users').child(auth.uid).child('coins').val()>=data.child('tip').val()"

        // //so the user won't be able to set pendingBet till he/she has one!
        // this.af.database.object('pendingBets/' + this.uid).set({
        //     matchId: matchId,
        //     team: team,
        //     tip: tip,
        //     status: 'new'
        // });


        // ".write" : false,
    }

    updateProfileName(newName: string) {

         return  this.af.database.object('users/' + this.uid + '/displayName').set(newName);
    }

    updateProfileImage(newImage: string) {

         return this.af.database.object('users/' + this.uid + '/photoURL').set(newImage);
    }

    resetPassword(oldPw: string, newPw: string) {
        console.log('reset Password');
        console.log(this.user.email);
        //firebase.auth().verifyPasswordResetCode(oldPw).then
        //firebase.auth().currentUser.updatePassword(newPw);
        return firebase.auth().sendPasswordResetEmail(this.user.email);
    }

}
