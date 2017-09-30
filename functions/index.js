var functions = require('firebase-functions');

// // Start writing Firebase Functions
// // https://firebase.google.com/functions/write-firebase-functions

// The Firebase Admin SDK to access the Firebase Realtime Database. 
const admin = require('firebase-admin');
admin.initializeApp(functions.config().firebase);

//++++++++++++++++++++++++++++ fiveMinuteMatchTimeCheck

//in every 5 minutes compare the current time to the matches begin_at! (less datecheck call from clients)
exports.fiveMinuteMatchTimeCheck = functions.https.onRequest((request, response) => {
  var matches = admin.database().ref('matches');
  matches.once('value',function(matchesSnapShot){
    matchesSnapShot.forEach(function(match){
      if(match.val().status != 'future'){
        return;
      }
      //console.log(match.val());
      if(match.val().begin_at<=new Date().getTime()){
        console.log('rewrite status of:')
        console.log(match.val());
        match.ref.child('status').set('notFuture');
      }
    });
  });
  response.send('process started');
 })
 //--------------------------- fiveMinuteMatchTimeCheck


//++++++++++++++++++++++++++++ EVERY GAME resultsToDb

function resultsToDb(gameName, request, response){
  console.log(gameName +' Results to DB');

  var matches = admin.database().ref('matches');
  matches.once('value',function(matchesSnapShot){
    matchesSnapShot.forEach(function(matchSnapShot) {
      //get the key
      var dbMatchId = matchSnapShot.key.split('-')[1];
      console.log('dbMatchId');
      console.log(dbMatchId);
      var dbMatchData = matchSnapShot.val();
      console.log(dbMatchData);
      var matchFound = false;
      var tmpMatchId;

      request.body.results.forEach(function(match){
        //for log!
        tmpMatchId = match.sport_event.id;
        if(match.sport_event.id == dbMatchId){
          console.log(match.sport_event.id + 'result process.');
          matchFound = true;
          console.log(match.sport_event.id + ' result: ' + match.sport_event_status.home_score + '/' +
          match.sport_event_status.away_score + ' | Winner: ' + match.sport_event_status.winner_id
                    );
          if(match.sport_event_status.winner_id == dbMatchData.opponents.left.id){
            admin.database().ref('matches/'+matchSnapShot.key+'/winner').set('left');
          }
          else{
            admin.database().ref('matches/'+matchSnapShot.key+'/winner').set('right');
          }
        }
        },this);
        //this log is enough on the firebase administrator page.
        if(!matchFound){
          console.log('WARN! Unexpected match id:' + tmpMatchId);
        }
    });
  });
  response.send(request.body.generated_at);
}

exports.resultsCsGo = functions.https.onRequest((request, response) => {
  resultsToDb('CS GO', request, response);
 })

 exports.resultsLoL = functions.https.onRequest((request, response) => {
  resultsToDb('LoL', request, response);
 })

 exports.resultsDota2 = functions.https.onRequest((request, response) => {
  resultsToDb('Dota 2', request, response);
 })
//--------------------------- EVERY GAME resultsToDb


//++++++++++++++++++++++++++++ EVERY GAME dailyScheduleToDb

function dailyScheduleToDb(gameName, request, response){
  console.log(request.body.generated_at);
  console.log(request.body.sport_events);
  request.body.sport_events.forEach(function(match) {
    console.log(match.scheduled);

    //just to test results!
    if(new Date(match.scheduled).getTime()<= new Date().getTime() || match.status != "not_started"){
        return; //dont add matches already played/inprogress
    }

    var matches = admin.database().ref('matches');
    matches.once('value',function(matchesSnapShot){

      matchesSnapShot.forEach(function(matchSnapShot) {
        //get the key
        var dbMatchId = matchSnapShot.key.split('-')[1];
        
        if(match.id == dbMatchId){
          return; //there is already a created match in the db -> mivan ha van TBD, vagy hasonló/esetleg változás? összehasonlítás írása! 
          //Csak a bets-maradjon + az eredetileg lekreált key! mert a ../bets ehhez van igazítva!
        }
      });

        var newObjectKey = (new Date(match.scheduled).getTime()) + '-' + match.id;
        newObjectKey = newObjectKey.replace('.', '');
        game_logo = '';
        switch (gameName) {
          case 'CS GO':
            game_logo = "https://seeklogo.com/images/C/Counter-Strike-logo-EAC70C9C3A-seeklogo.com.png"
            break;
          case 'Dota 2':
            game_logo = "https://orig05.deviantart.net/97fe/f/2013/332/c/4/dota_2_icon_by_benashvili-d6w0695.png"
            break;
          case 'LoL':
            game_logo = "https://seeklogo.com/images/C/Counter-Strike-logo-EAC70C9C3A-seeklogo.com.png"
            break;
          default:
            break;
        }

        admin.database().ref('matches/' + newObjectKey).set({
          begin_at:new Date(match.scheduled).getTime(),
          game: gameName,
          game_logo: game_logo,
          status: 'future',
          opponents:{
            left:{
              id: match.competitors[0].id,
              logo: 'http:\/\/ls.sportradar.com\/ls\/crest\/big\/' 
                    + match.competitors[0].id.split(':')[2]+'.png',
              name: match.competitors[0].name,
              short_name: match.competitors[0].abbreviation,
              bets: 5
            },
            //todo: check if there is only one team:-> fill with 'TBD' data -> first find some an example..
            right:{
              id: match.competitors[1].id,
              logo: 'http:\/\/ls.sportradar.com\/ls\/crest\/big\/' 
              + match.competitors[1].id.split(':')[2]+'.png',
              name: match.competitors[1].name,
              short_name: match.competitors[1].abbreviation,
              bets: 5
            }
          }
        });
      });
    });

  response.send(request.body.generated_at);
}

exports.dailyScheduleCsGo = functions.https.onRequest((request, response) => {
  dailyScheduleToDb('CS GO', request, response);
 })

exports.dailyScheduleDota2 = functions.https.onRequest((request, response) => {
  dailyScheduleToDb('Dota 2', request, response);
 })

 exports.dailyScheduleLoL = functions.https.onRequest((request, response) => {
  dailyScheduleToDb('LoL', request, response);
 })

//--------------------------- EVERY GAME dailyScheduleToDb


//++++++++++++++++++++++++++++ Prize to users

 //check matches/matchId/winner! if writed -> divide the prize!
exports.prizeToUsers = functions.database.ref('matches/{matchId}/winner')
.onCreate(event => {
  //it wont happen, but in case of failures it will protect the coins
  // if(event.data.val()==null){
  //   return;
  // }
  var winner = event.data.val();
  event.data.ref.parent.once('value',function(matchSnap){
    if(matchSnap.val().prizeDivided == null || matchSnap.val().prizeDivided != true){
      //set it as soon as possible
      event.data.ref.parent.child('prizeDivided').set(true);
      event.data.ref.parent.child('status').set('finished');
      admin.database().ref('bets/' + matchSnap.key).once('value',function(betSnap){
        
        //logic: sum both opponents bets, and divide them between the winners
        var opponents = matchSnap.val().opponents;
        var coinSum = opponents.left.bets + opponents.right.bets;

        var userPlusCoinDict = [];

        betSnap.forEach(function(userBet) {
          if(userBet.val().team == winner){
            
            var userPrize = coinSum * (userBet.val().tip/opponents[winner].bets);

            userPlusCoinDict.push({
              key: userBet.key,
              value: userPrize
            });
            userBet.ref.child('result').set('win');
          }
          else{
            userBet.ref.child('result').set('lose');
          }
          userBet.ref.child('status').set('finished');
        });


        userPlusCoinDict.forEach(function(userPlus){
          coinSum = coinSum - Math.floor(userPlus.value);
        });

        //get the descending sort
        userPlusCoinDict.sort(function(a,b) {return (a.value > b.value) ? -1 : ((b.value > a.value) ? 1 : 0);} ); 

        //add +1 coins till the remaining prize is 0 / or there is no remaining bets from users
        //with the +5 per sites when the init is up it will be really generous!
        userPlusCoinDict.forEach(function(userCoin){
          if(coinSum > 0 ){
            userCoin.value  = Math.ceil(userCoin.value);
            coinSum--;
          }
          else{
            userCoin.value  = Math.floor(userCoin.value);
          }
        });

        console.log('processing the following match:' + matchSnap.key);
        console.log('user plus coin dictionary: ');        
        console.log(userPlusCoinDict);

        admin.database().ref('users').once('value',function(userSnap){
          userPlusCoinDict.forEach(function(userCoin){
            userSnap.forEach(function(user){
              if(userCoin.key == user.key){
                admin.database().ref('users/'+ user.key + '/coins').set(user.val().coins + userCoin.value);
                console.log(user.val().coins + userCoin.value);
              }
            });
          });
        });
      });
    }
  });
})
//--------------------------- Prize to users

//++++++++++++++++++++++++++++ Client triggered match time check

//the match's begindate will be the value
exports.clientBetTimeCheck = functions.database.ref('checkMatchDate/{matchId}')
.onCreate(event => {
  //NO SNAPSOT OR ONCE... NO PROMISE! THIS FUNCTION HAS TO BE QUICK
  //it will be triggered even in case of the deletion from this function!
  if(event.data.val()==null){
    return;
  }
  if(event.data.val() <= new Date().getTime()){
    admin.database().ref('matches/'+event.params.matchId+'/status').set('notFuture');
  }
  event.data.ref.remove();
})
//--------------------------- Client triggered match time check


//++++++++++++++++++++++++++++ client Bet business layer - pendingBets handling

exports.clientBetBusiness = functions.database.ref('/pendingBets/{userID}')
  .onWrite(event => {
  //it will be triggered even in case of the deletion from this function!
  if(event.data.val()==null){
    return;
  }
  if(event.data.child('status').val() != 'new'){
    return;
  }

  var matchId = event.data.child('matchId').val();
  //unfortunately there is no cleaner way to do it.. only with *once* scheme

  //check if the user already have bets?!
  var bet = event.data.adminRef.root.child('bets/'+matchId);

  bet.once('value',function(betSnap){
    if(betSnap.val()!=null && betSnap.val()[event.params.userID]!=null 
        && betSnap.val()[event.params.userID].status=='inProgress'){
      event.data.ref.remove();
      return; //it should not modify anything.. in this case the first won't be deleted
    }

    else{
      //check the time!
      var match = event.data.adminRef.root.child('matches/'+matchId);
      
        match.once('value',function(matchSnap){
          var begin_at = matchSnap.val().begin_at;
          var status = 'inProgress';
          if(matchSnap.val().begin_at <= new Date().getTime()){
            status = 'rejected-date';

            //set match status to 'notFuture'..or something like this
            admin.database().ref('matches/'+matchId+'/status').set(
              'notFuture'
            );
            event.data.ref.remove();
            return event.data.ref.parent.parent.child('bets').child(matchId)
            .child(event.params.userID).set({
              //userId: event.data.key,
              team: event.data.child('team').val(),
              tip: event.data.child('tip').val(),
              status: status
            });
          }
      
        
          //check if the user have enough currency
          var user = event.data.adminRef.root.child('users/'+event.params.userID);
          user.once('value',function(userSnapshot){
            if(userSnapshot.val().coins < event.data.child('tip').val()){
              status = 'rejected-coin';
            }
            else{
              //modify every additional value
              newCoinOnUser = userSnapshot.val().coins - event.data.child('tip').val();
              admin.database().ref('users/'+event.params.userID+'/coins').set(newCoinOnUser);
              currentBetsOnTeam = matchSnap.val().opponents[event.data.child('team').val()].bets;
              admin.database().ref('matches/'+matchId+'/opponents/'+
              event.data.child('team').val() + '/bets').set(
                currentBetsOnTeam + event.data.child('tip').val()
              );
            }
            event.data.ref.remove();
            return event.data.ref.parent.parent.child('bets').child(matchId)
            .child(event.params.userID).set({
              //userId: event.data.key,
              team: event.data.child('team').val(),
              tip: event.data.child('tip').val(),
              status: status
            });
          });
        });
    }
  });
});

//--------------------------- client Bet business layer - pendingBets handling

//++++++++++++++++++++++++++++ HELPER FUNCTION

function sleep(milliseconds) {
  var start = new Date().getTime();
  for (var i = 0; i < 1e7; i++) {
    if ((new Date().getTime() - start) > milliseconds){
      break;
    }
  }
}
