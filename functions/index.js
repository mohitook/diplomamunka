var functions = require('firebase-functions');
var requestHandler = require('request');

// // Start writing Firebase Functions
// // https://firebase.google.com/functions/write-firebase-functions

// The Firebase Admin SDK to access the Firebase Realtime Database. 
const admin = require('firebase-admin');
admin.initializeApp(functions.config().firebase);

//global variables:
var apiKeyForCsGo = 'k772vgds4x3x875gep7cq9dh';
var apiKeyForDota2 = '4xrzt3cygq3rs5ghv4khqft7';
var apiKeyForLoL = '3atqmme9np7jwe9gbx5texn5';

//+++++++++++++++++++++++++ new bets handler

exports.handleUserBets = functions.database.ref('bets/{matchId}/{userId}').onCreate(event => {
  console.log("Handle " + event.params.userId + " new bet on match " + event.params.matchId);

  var team = event.data.child('team').val();
  var tip = event.data.child('tip').val();
  console.log('tip: ' + tip + ' | team: ' + team)

  const pathToValue = admin.database().ref('users/' + event.params.userId + '/coins');
  const pathToTeamBetsValue = admin.database().ref('matches/' + event.params.matchId + '/opponents/' + team + "/bets");
  return pathToValue.transaction(function (coins) {
    if (coins) {
      if (coins >= tip) {
        admin.database().ref('bets/' + event.params.matchId + '/' + event.params.userId + '/status').set('inProgress');
        coins = coins - tip;
      }
      else {
        console.warn(event.params.userId + " new bet on match " + event.params.matchId + " was not successfull! (not enough coin)");

        //only people who bet more that the amount of coin they have can get this state... and since they are just
        //trying to *cheat* I just simply delete their bets.
        admin.database().ref('bets/' + event.params.matchId + '/' + event.params.userId).remove();
      }
    }
    return coins;
  }).then(() => {
    console.log(event.params.userId + 'user coins updated.');
  });
});

exports.handleUserBetsPutToMatchBets = functions.database.ref('bets/{matchId}/{userId}').onUpdate(event => {
  //only trigger this when it was a change from new status to inProgress (so after the user's coins was decreased)
  if(event.data.child('status').val() == 'inProgress' && event.data.previous.child('status').val() == 'new')
  {
    console.log("Handle " + event.params.userId + " new bet on match " + event.params.matchId);
  
    var team = event.data.child('team').val();
    var tip = event.data.child('tip').val();
    console.log('tip: ' + tip + ' | team: ' + team)
  
    const pathToTeamBetsValue = admin.database().ref('matches/' + event.params.matchId + '/opponents/' + team + "/bets");
    return pathToTeamBetsValue.transaction(function (teamBets) {
      if (teamBets) {
        teamBets = teamBets + tip;
      }
      return teamBets;
    }).then(() => {
      console.log(event.params.matchId + 'team bets updated');
    });
  }
});

//------------------------- new bets handler


//++++++++++++++++++++++++++ user handlers
exports.createUserHandler = functions.auth.user().onCreate(event => {
  const user = event.data;
  const uid = user.uid;
  const email = user.email; // The email of the user.
  const displayName = user.displayName; // The display name of the user.
  const photoURL = user.photoURL;
  admin.database().ref('users/' + uid + '/coins').set(1000);
  admin.database().ref('users/' + uid + '/email').set(email);
  
  if(user.providerData[0].providerId == 'google.com'){
    admin.database().ref('users/' + uid + '/verified').set(true);
  }

  if(displayName != null){
    admin.database().ref('users/' + uid + '/displayName').set(displayName);
  }
  if(photoURL != null){
    admin.database().ref('users/' + uid + '/photoURL').set(photoURL);
  }
  admin.database().ref('users/' + uid + '/roles').set({
    admin: false,
    author: false
  });
});

exports.deleteUserHandler = functions.database.ref('users/{userId}')
.onDelete(event => {
  console.log('user deleted:' +event.params.userId);
  return admin.auth().deleteUser(event.params.userId);
})

//-------------------------- user handlers

//++++++++++++++++++++++++++++ Comments photoUrl/displayName handler

exports.modifyUserPhotoInComments = functions.database.ref('users/{userId}/photoURL')
.onUpdate(event => {
  admin.database().ref('comments').once('value',function(commentsSnap){
    commentsSnap.forEach(function(commentTopic){
      commentTopic.forEach(function(comment){
        if(comment.val().userId != null && comment.val().userId == event.params.userId){
          admin.database().ref('comments/' + commentTopic.key + '/' + comment.key + '/photoURL').set(event.data.val());
        }
      })
    })
  });
})

exports.modifydisplayNameInComments = functions.database.ref('users/{userId}/displayName')
.onUpdate(event => {
  admin.database().ref('comments').once('value',function(commentsSnap){
    commentsSnap.forEach(function(commentTopic){
      commentTopic.forEach(function(comment){
        if(comment.val().userId != null && comment.val().userId == event.params.userId){
          admin.database().ref('comments/' + commentTopic.key + '/' + comment.key + '/displayName').set(event.data.val());
        }
      })
    })
  });
})

exports.modifydisplayNameInArticles = functions.database.ref('users/{userId}/displayName')
.onUpdate(event => {
  admin.database().ref('news').once('value',function(newsSnap){
    newsSnap.forEach(function(news){
        if(news.val().creator.uid != null && news.val().creator.uid== event.params.userId){
          admin.database().ref('news/' + news.key + '/creator/displayname').set(event.data.val());
        }
      })
  });
})

//----------------------------Comments photoUrl/displayName handler


//++++++++++++++++++++++++++++ 
//check in every 12 hours. If the a match doesn't have result in 8 hours from the begin_at ->
//-> give back every bet to the users
exports.matchResultCheck = functions.https.onRequest((request, response) => {

  var matches = admin.database().ref('matches');
  matches.once('value', function (matchesSnapShot) {
    matchesSnapShot.forEach(function (match) {
      if (match.val().status == 'notFuture') {
        //4800000 is 8 hours in milliseconds
        if ((match.val().begin_at + 4800000) <= new Date().getTime()) {
          admin.database().ref('bets/' + match.key).once('value', function (betSnapShot) {
            betSnapShot.forEach(function (userBet) {
              //just to secure the bets with log
              if (userBet.val().status != 'inProgress') {
                console.log('data inconsistency: ' + match.key + '/' + userBet.key);
                return;
              }
              userBet.ref.child('status').set('rejected-noResultInTime');
              //give the coins back to the users
              admin.database().ref('users/' + userBet.key).once('value', function (userSnap) {
                userSnap.ref.child('coins').set(userSnap.val().coins + userBet.val().tip)
              });
            });
          });
        }
      }
    });
  });

  response.send('process started');

})


//--------------------------- 


//++++++++++++++++++++++++++++ fiveMinuteMatchTimeCheck

//in every 5 minutes compare the current time to the matches begin_at! (less datecheck call from clients)
exports.fiveMinuteMatchTimeCheck = functions.https.onRequest((request, response) => {
  var matches = admin.database().ref('matches');
  matches.once('value', function (matchesSnapShot) {
    matchesSnapShot.forEach(function (match) {
      if (match.val().status == 'future') {
        //420000 = 7 minute in milliseconds -deprecated.. to complicated to handle
        if (match.val().begin_at <= new Date().getTime()) {
          console.log('rewrite status of:' + match.key);
          console.log(match.val());
          admin.database().ref('matches/' + match.key + '/status').set('notFuture');
        }
      }
    });
  });
  response.send('process started');
})
//--------------------------- fiveMinuteMatchTimeCheck


//++++++++++++++++++++++++++++ EVERY GAME resultsToDb

function resultsToDb(gameName, body) {
  console.log(gameName + ' Results to DB');

  var matches = admin.database().ref('matches');
  matches.once('value', function (matchesSnapShot) {
    matchesSnapShot.forEach(function (matchSnapShot) {
      //get the key
      var dbMatchId = matchSnapShot.key.split('-')[1];
      var dbMatchData = matchSnapShot.val();
      var matchFound = false;
      var tmpMatchId;

      body.results.forEach(function (match) {
        //for log!
        tmpMatchId = match.sport_event.id;
        if (match.sport_event.id == dbMatchId && dbMatchData.status != 'finished' && dbMatchData.status != 'abandoned') {
          console.log(match.sport_event.id + 'result process.');
          matchFound = true;
          console.log(match.sport_event.id + ' result: ' + match.sport_event_status.home_score + '/' +
            match.sport_event_status.away_score + ' | Winner: ' + match.sport_event_status.winner_id
          );
          if (match.sport_event_status.winner_id == dbMatchData.opponents.left.id) {
            admin.database().ref('matches/' + matchSnapShot.key + '/winner').set('left');
            admin.database().ref('matches/' + matchSnapShot.key + '/status').set('finished');
            admin.database().ref('matches/' + matchSnapShot.key + '/result').set(
              match.sport_event_status.home_score + '/' +
              match.sport_event_status.away_score
            );
          }
          else if (match.sport_event_status.winner_id == dbMatchData.opponents.right.id) {
            admin.database().ref('matches/' + matchSnapShot.key + '/winner').set('right');
            admin.database().ref('matches/' + matchSnapShot.key + '/status').set('finished');
            admin.database().ref('matches/' + matchSnapShot.key + '/result').set(
              match.sport_event_status.home_score + '/' +
              match.sport_event_status.away_score
            );
          }
          else {
            //just to monitor 'abnormal' results like abandon/draw
            console.error('abnormal match result: ' + match.sport_event.id);
            console.error(match.sport_event_status);
            
            console.log(matchSnapShot.key + ' was abandoned! Bets goes back to users!');
            admin.database().ref('matches/' + matchSnapShot.key + '/status').set('finished'); //the prize.. function listen!

            if(match.sport_event_status.home_score == match.sport_event_status.away_score){
              admin.database().ref('matches/' + matchSnapShot.key + '/result').set('draw');
            }
            else{
              admin.database().ref('matches/' + matchSnapShot.key + '/result').set('abandoned');
            }
          }

        }
      }, this);
    });
  });
  //response.send(request.body.generated_at);
}

exports.resultsCsGo = functions.https.onRequest((request, response) => {
  var currentDate = new Date();

  if (request.body.previousDayRequest == true) {
    currentDate.setDate(currentDate.getDate() - 1);
  }

  var year = currentDate.getUTCFullYear();
  var month = currentDate.getUTCMonth() + 1;
  var day = ("0" + currentDate.getUTCDate()).slice(-2);

  var requestDate = year + '-' + month + '-' + day;

  requestHandler('http://api.sportradar.us/csgo-t1/en/schedules/' + requestDate + '/results.json?api_key=' + apiKeyForCsGo, function (error, responseInner, body) {
    if (!error && response.statusCode == 200) {
      console.log(JSON.parse(body));
      resultsToDb('CS GO', JSON.parse(body));
    }
    else {
      console.log('ERROR');
      console.log(response.statusCode);
    }
    response.send(JSON.parse(body).generated_at);
  });
})

exports.resultsLoL = functions.https.onRequest((request, response) => {

  var currentDate = new Date();

  if (request.body.previousDayRequest == true) {
    currentDate.setDate(currentDate.getDate() - 1);
  }

  var year = currentDate.getUTCFullYear();
  var month = currentDate.getUTCMonth() + 1;
  var day = ("0" + currentDate.getUTCDate()).slice(-2);

  var requestDate = year + '-' + month + '-' + day;

  requestHandler('http://api.sportradar.us/lol-t1/en/schedules/' + requestDate + '/results.json?api_key=' + apiKeyForLoL, function (error, responseInner, body) {
    if (!error && response.statusCode == 200) {
      console.log(JSON.parse(body));
      resultsToDb('LoL', JSON.parse(body));
    }
    else {
      console.log('ERROR');
      console.log(response.statusCode);
    }
    response.send(JSON.parse(body).generated_at);
  });
})

exports.resultsDota2 = functions.https.onRequest((request, response) => {

  var currentDate = new Date();

  if (request.body.previousDayRequest == true) {
    currentDate.setDate(currentDate.getDate() - 1);
  }

  var year = currentDate.getUTCFullYear();
  var month = currentDate.getUTCMonth() + 1;
  var day = ("0" + currentDate.getUTCDate()).slice(-2);

  var requestDate = year + '-' + month + '-' + day;

  requestHandler('http://api.sportradar.us/dota2-t1/en/schedules/' + requestDate + '/results.json?api_key=' + apiKeyForDota2, function (error, responseInner, body) {
    if (!error && response.statusCode == 200) {
      console.log(JSON.parse(body));
      resultsToDb('Dota 2', JSON.parse(body));
    }
    else {
      console.log('ERROR');
      console.log(response.statusCode);
    }
    response.send(JSON.parse(body).generated_at);
  });
})
//--------------------------- EVERY GAME resultsToDb


//++++++++++++++++++++++++++++ EVERY GAME dailyScheduleToDb

function dailyScheduleToDb(gameName, body) {
  body.sport_events.forEach(function (match) {

    if (new Date(match.scheduled).getTime() <= new Date().getTime() || match.status != "not_started") {
      return; //dont add matches already played/inprogress
    }

    var matches = admin.database().ref('matches');
    matches.once('value', function (matchesSnapShot) {

      var shouldReturn = false;
      matchesSnapShot.forEach(function (matchSnapShot) {
        //get the key
        var dbMatchId = matchSnapShot.key.split('-')[1];

        if (match.id == dbMatchId) {
          shouldReturn = true; //there is already a created match in the db -> mivan ha van TBD, vagy hasonló/esetleg változás? összehasonlítás írása! 
          //Csak a bets-maradjon + az eredetileg lekreált key! mert a ../bets ehhez van igazítva!
          //logikusabb így hagyni a már megtett fogadások miatt, ráadásul TBD példát sem találni..

          //új schedule megeshet.. de a ritka lekérés miatt 99%, hogy lemarad róla a rendszer..
        }
      });
      //
      if (shouldReturn) {
        return;
      }

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
          game_logo = "https://vignette.wikia.nocookie.net/leagueoflegends/images/1/12/League_of_Legends_Icon.png/revision/latest?cb=20150402234343"
          break;
        default:
          break;
      }
      //todo: continuehere
      var stream = "";

      //select the first, 1 stream is enough on the page
      if (match.streams != null) {
        if (match.streams[0] != null) {
          preText = (match.streams[0].url.indexOf('youtube') !== -1) ? 'YOUTUBE/' : (match.streams[0].url.indexOf('twitch') !== -1) ? 'TWITCH/' : '';

          if(preText == 'YOUTUBE/'){
            stream = preText + match.streams[0].url;
          }
          else if(preText == 'TWITCH/'){
            lastSlash = match.streams[0].url.lastIndexOf('/');
            stream = preText + match.streams[0].url.substring(lastSlash + 1);
            qMarkIndex = match.streams[0].url.lastIndexOf('?');
            questionMark = (qMarkIndex !== -1) ? qMarkIndex : match.streams[0].url.length;
            stream = stream.substring(0, questionMark - 1);
          }
        }
      }


      //have to set only values with five minutes at the end. (check service... limitations)
      var calculatedTimeStamp = Math.floor(new Date(match.scheduled).getTime() / 300000) * 300000;

      admin.database().ref('matches/' + newObjectKey).set({
        begin_at: calculatedTimeStamp,
        game: gameName,
        game_logo: game_logo,
        status: 'future',
        stream: stream,
        opponents: {
          left: {
            id: match.competitors[0].id,
            logo: 'https:\/\/ls.sportradar.com\/ls\/crest\/big\/'
            + match.competitors[0].id.split(':')[2] + '.png',
            name: match.competitors[0].name,
            short_name: match.competitors[0].abbreviation,
            bets: 5
          },
          //todo: check if there is only one team:-> fill with 'TBD' data -> first find some an example..
          right: {
            id: match.competitors[1].id,
            logo: 'https:\/\/ls.sportradar.com\/ls\/crest\/big\/'
            + match.competitors[1].id.split(':')[2] + '.png',
            name: match.competitors[1].name,
            short_name: match.competitors[1].abbreviation,
            bets: 5
          }
        }
      });
    });
  });
  //response.send(request.body.generated_at);
}

exports.dailyScheduleCsGo = functions.https.onRequest((request, response) => {

  var currentDate = new Date();

  if (request.body.nextDayRequest == true) {
    currentDate.setDate(currentDate.getDate() + 1);
    console.log('next day request:' + currentDate);
  }

  var year = currentDate.getUTCFullYear();
  var month = currentDate.getUTCMonth() + 1;
  var day = ("0" + currentDate.getUTCDate()).slice(-2);

  var requestDate = year + '-' + month + '-' + day;

  requestHandler('http://api.sportradar.us/csgo-t1/en/schedules/' + requestDate + '/schedule.json?api_key=' + apiKeyForCsGo, function (error, responseInner, body) {
    if (!error && response.statusCode == 200) {
      console.log(JSON.parse(body));
      dailyScheduleToDb('CS GO', JSON.parse(body));
    }
    else {
      console.log('ERROR');
      console.log(response.statusCode);
    }
    response.send(JSON.parse(body).generated_at);
  });
})

exports.dailyScheduleDota2 = functions.https.onRequest((request, response) => {

  var currentDate = new Date();

  if (request.body.nextDayRequest == true) {
    currentDate.setDate(currentDate.getDate() + 1);
    console.log('next day request:' + currentDate);
  }

  var year = currentDate.getUTCFullYear();
  var month = currentDate.getUTCMonth() + 1;
  var day = ("0" + currentDate.getUTCDate()).slice(-2);

  var requestDate = year + '-' + month + '-' + day;

  requestHandler('http://api.sportradar.us/dota2-t1/en/schedules/' + requestDate + '/schedule.json?api_key=' + apiKeyForDota2, function (error, responseInner, body) {
    if (!error && response.statusCode == 200) {
      console.log(JSON.parse(body));
      dailyScheduleToDb('Dota 2', JSON.parse(body));
    }
    else {
      console.log('ERROR');
      console.log(response.statusCode);
    }
    response.send(JSON.parse(body).generated_at);
  });
})

exports.dailyScheduleLoL = functions.https.onRequest((request, response) => {

  var currentDate = new Date();

  if (request.body.nextDayRequest == true) {
    currentDate.setDate(currentDate.getDate() + 1);
    console.log('next day request:' + currentDate);
  }

  var year = currentDate.getUTCFullYear();
  var month = currentDate.getUTCMonth() + 1;
  var day = ("0" + currentDate.getUTCDate()).slice(-2);

  var requestDate = year + '-' + month + '-' + day;

  requestHandler('http://api.sportradar.us/lol-t1/en/schedules/' + requestDate + '/schedule.json?api_key=' + apiKeyForLoL, function (error, responseInner, body) {
    if (!error && response.statusCode == 200) {
      console.log(JSON.parse(body));
      dailyScheduleToDb('LoL', JSON.parse(body));
    }
    else {
      console.log('ERROR');
      console.log(response.statusCode);
    }
    response.send(JSON.parse(body).generated_at);
  });
})

//--------------------------- EVERY GAME dailyScheduleToDb


//++++++++++++++++++++++++++++ Prize to users

//check matches/matchId/winner! if writed -> divide the prize!
exports.prizeToUsers = functions.database.ref('matches/{matchId}/status')
  .onUpdate(event => {
    //it wont happen, but in case of failures it will protect the coins
    // if(event.data.val()==null){
    //   return;
    // }

    var status = event.data.val();
    //todo: 'draw' kivitelezése visszaosztással
    if (status != 'abandoned' && status != 'finished' && status != 'draw') {
      return;
    }

    event.data.ref.parent.once('value', function (matchSnap) {
      
      if (matchSnap.val().prizeDivided == null || matchSnap.val().prizeDivided != true) {
        //set it as soon as possible
        event.data.ref.parent.child('prizeDivided').set(true);

        var winner = matchSnap.val().winner;

        admin.database().ref('bets/' + matchSnap.key).once('value', function (betSnap) {
          //give back the bets to the users
          if (matchSnap.val().result == 'abandoned' || matchSnap.val().result == 'draw') {

            admin.database().ref('users').once('value', function (userSnap) {
              userSnap.forEach(function (user) {
                betSnap.forEach(function (userBet) {
                  if (userBet.key == user.key) {
                    admin.database().ref('users/' + user.key + '/coins').set(user.val().coins + userBet.val().tip);
                    userBet.ref.child('status').set('abandoned');
                  }
                });
              });
            });
            return;
          }

          //logic: sum both opponents bets, and divide them between the winners
          var opponents = matchSnap.val().opponents;
          var coinSum = opponents.left.bets + opponents.right.bets;

          var userPlusCoinDict = [];

          betSnap.forEach(function (userBet) {
            if (userBet.val().team == winner) {

              var userPrize = coinSum * (userBet.val().tip / opponents[winner].bets);

              userPlusCoinDict.push({
                key: userBet.key,
                value: userPrize,
                originalTip: userBet.val().tip
              });
              userBet.ref.child('result').set('win');
            }
            else {
              userBet.ref.child('result').set('lose');
            }
            userBet.ref.child('status').set('finished');
          });


          userPlusCoinDict.forEach(function (userPlus) {
            coinSum = coinSum - Math.floor(userPlus.value);
          });

          //get the descending sort
          userPlusCoinDict.sort(function (a, b) { return (a.value > b.value) ? -1 : ((b.value > a.value) ? 1 : 0); });

          //add +1 coins till the remaining prize is 0 / or there is no remaining bets from users
          //with the +5 per sites when the init is up it will be really generous!
          userPlusCoinDict.forEach(function (userCoin) {
            if (coinSum > 0) {
              userCoin.value = Math.ceil(userCoin.value);
              coinSum--;
            }
            else {
              userCoin.value = Math.floor(userCoin.value);
            }
          });

          console.log('processing the following match:' + matchSnap.key);
          console.log('user plus coin dictionary: ');
          console.log(userPlusCoinDict);

          admin.database().ref('users').once('value', function (userSnap) {
            userPlusCoinDict.forEach(function (userCoin) {
              userSnap.forEach(function (user) {
                if (userCoin.key == user.key) {
                  admin.database().ref('users/' + user.key + '/coins').set(user.val().coins + userCoin.value);
                  admin.database().ref('bets/' + matchSnap.key + '/' + user.key + '/won').set(userCoin.value - userCoin.originalTip);//not tested!
                  console.log('Added *' + userCoin.value +'* to ' + user.key + ', new coins value: ' + (user.val().coins+userCoin.value));
                }
              });
            });
          });
        });
      }
    });
  })
//--------------------------- Prize to users

//++++++++++++++++++++++++++++ Client triggered match time check DEPRICATED - couse inconsistent states!

//the match's begindate will be the value
// exports.clientBetTimeCheck = functions.database.ref('checkMatchDate/{matchId}')
//   .onCreate(event => {
//     //NO SNAPSOT OR ONCE... NO PROMISE! THIS FUNCTION HAS TO BE QUICK
//     //it will be triggered even in case of the deletion from this function!
//     if (event.data.val() == null) {
//       return;
//     }
//     if (event.data.val() <= new Date().getTime()) {
//       console.log('clientBetTimeCheck: ' + event.params.matchId);
//       admin.database().ref('matches/' + event.params.matchId + '/status').set('notFuture');
//     }
//     event.data.ref.remove();
//   })
//--------------------------- Client triggered match time check - DEPRICATED - too slow!

function pendingBetsHandler(event, userId, matchId) {

  var matchId = event.data.child('matchId').val();
  //unfortunately there is no cleaner way to do it.. only with *once* scheme

  //check if the user already have bets?!
  var bet = event.data.adminRef.root.child('bets/' + matchId);

  bet.once('value', function (betSnap) {
    if (betSnap.val() != null && betSnap.val()[event.params.userID] != null
      && betSnap.val()[event.params.userID].status == 'inProgress') {
      event.data.ref.remove();
      return; //it should not modify anything.. in this case the first won't be deleted
    }

    else {
      //check the time!
      var match = event.data.adminRef.root.child('matches/' + matchId);

      match.once('value', function (matchSnap) {
        var begin_at = matchSnap.val().begin_at;
        var status = 'inProgress';
        if (matchSnap.val().begin_at <= new Date().getTime()) {
          status = 'rejected-date';

          //set match status to 'notFuture'..or something like this
          admin.database().ref('matches/' + matchId + '/status').set(
            'notFuture'
          );
          return event.data.ref.parent.parent.child('bets').child(matchId)
            .child(event.params.userID).set({
              //userId: event.data.key,
              team: event.data.child('team').val(),
              tip: event.data.child('tip').val(),
              status: status
            }).then(event.data.ref.remove());
        }

        event.data.adminRef.root.child('users/' + event.params.userID).once('value', function (userSnapshot) {
          if (userSnapshot.val().coins < event.data.child('tip').val()) {
            status = 'rejected-coin';
          }
          else {
            //modify every additional value
            newCoinOnUser = userSnapshot.val().coins - event.data.child('tip').val();
            admin.database().ref('users/' + event.params.userID + '/coins').set(newCoinOnUser);
            currentBetsOnTeam = matchSnap.val().opponents[event.data.child('team').val()].bets;
            admin.database().ref('matches/' + matchId + '/opponents/' +
              event.data.child('team').val() + '/bets').set(
              currentBetsOnTeam + event.data.child('tip').val()
              );
          }

          return event.data.ref.parent.parent.child('bets').child(matchId)
            .child(event.params.userID).set({
              //userId: event.data.key,
              team: event.data.child('team').val(),
              tip: event.data.child('tip').val(),
              status: status
            }).then(event.data.ref.remove());

        });
      });
    }
  });
}

//++++++++++++++++++++++++++++ client Bet business layer - pendingBets handling - DEPRICATED - too slow

exports.clientBetBusinessonDelete = functions.database.ref('/pendingBets/{userID}')
  .onDelete(event => {

    console.log(event.params.userID + '/' + event.params.matchId + ' deleted');

  });

exports.clientBetBusinessonCreate = functions.database.ref('/pendingBets/{userID}')
  .onCreate(event => {
    console.log(event.params.userID + '/' + event.params.matchId + ' Created');
    pendingBetsHandler(event, event.params.userID);

  });

exports.clientBetBusinessonUpdate = functions.database.ref('/pendingBets/{userID}')
  .onUpdate(event => {
    console.log('WARN! invalid operation: Update on:' + event.params.userID + '/' + event.params.matchId + '!!!');
    return;
  });

//--------------------------- client Bet business layer - pendingBets handling

//++++++++++++++++++++++++++++ HELPER FUNCTIONS

function sleep(milliseconds) {
  var start = new Date().getTime();
  for (var i = 0; i < 1e7; i++) {
    if ((new Date().getTime() - start) > milliseconds) {
      break;
    }
  }
}
