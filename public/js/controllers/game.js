angular.module('mean.system')
.controller('GameController', ['$scope', 'Global', 'game', '$timeout', '$location', 'MakeAWishFactsService', '$dialog', '$http', function ($scope, Global, game, $timeout, $location, MakeAWishFactsService, $dialog, $http) {
    $scope.global = Global;
    $scope.hasPickedCards = false;
    $scope.winningCardPicked = false;
    $scope.showTable = false;
    $scope.modalShown = false;
    $scope.game = game;
    $scope.pickedCards = [];
    var makeAWishFacts = MakeAWishFactsService.getMakeAWishFacts();
    $scope.makeAWishFact = makeAWishFacts.pop();
    $scope.totalInvites = 0;
    $scope.showAppModal = true;
    $scope.gameTour = introJs();

    $scope.timerStyle = () =>({
      'background-color': '#495057',
      'color': 'white'
    });

    $scope.gameTimerStyle = () => {
      if (game.state ==='winner has been chosen') {
        return {
          'color': '#1B5E20',
          '-webkit-animation': 'popout 1.0s infinite',
          'animation': 'popout 1.0s infinite',
          'position': 'relative'
        };
      } else if (game.time < 10 && game.state === 'waiting for players to pick') {
        return {
          'color': 'red',
          '-webkit-animation': 'popout 1.0s infinite',
          'animation': 'popout 1.0s infinite',
          'position': 'relative'
        };
      } else if (game.state === 'waiting for czar to decide') {
        return {'color': '#BF360C'};
      }
    };

    // handle search change 
    $scope.handleSearch = function() {
      $scope.global.authenticated = true;
      $scope.global.user = window.user;
      $http.post(`/api/search/users`, {searchTerm: $scope.searchValue}).then((response) => {
        $scope.inviteError = '';
        
        $scope.inviteUser = response.data.foundUsers.filter(user => user.name !== window.user.name);
      },
      (response) => {
        $scope.inviteUser = '';
        $scope.inviteError = response.data.error;
      });
    }

  // sends invites to players
  $scope.sendInvites = function(user){
    $scope.gameLink = $location.absUrl();
    if($scope.totalInvites >= 11){
      toastr.success('Sorry, you can not invite more 11 players');
      document.getElementById("closeModal").click();
    }
    else{
    $http.post('/api/invite/users', {
      userEmail: user.email,
      username: user.name,
      gameLink: $scope.gameLink
    }).then((response) => {
      $("#openSuccessModal").click();
      $scope.showSuccessMessage = response.data.message;
      $scope.totalInvites = $scope.totalInvites + 1;
    }, (response) => {
      $("#openSuccessModal").click();
      $scope.showSuccessMessage = response.data.error;
    }) 
  }
  }

  $scope.showOptions = true;

  if (window.localStorage.token) {
    $scope.showOptions = false;
  }

    $scope.pickCard = function(card) {
      if (!$scope.hasPickedCards) {
        if ($scope.pickedCards.indexOf(card.id) < 0) {
          $scope.pickedCards.push(card.id);
          if (game.curQuestion.numAnswers === 1) {
            $scope.sendPickedCards();
            $scope.hasPickedCards = true;
          } else if (game.curQuestion.numAnswers === 2 &&
            $scope.pickedCards.length === 2) {
            //delay and send
            $scope.hasPickedCards = true;
            $timeout($scope.sendPickedCards, 300);
          }
        } else {
          $scope.pickedCards.pop();
        }
      }
    };

    $scope.shuffleCards = () => {
      const card = $(`#${event.target.id}`);
      setTimeout(() => {

      $scope.startNextRound();
       $('#start-modal').modal('hide');
      }, 500);
    };

    $scope.startNextRound = () => {
      // playTone('newRound');
      if ($scope.isCzar()) {
        console.log('am @ here');
        game.startNextRound();
      }
    };


    $scope.pointerCursorStyle = (winningSet) => {
      if ($scope.isCzar() && $scope.game.state === 'waiting for czar to decide') {
        return {'cursor': 'pointer'};
      } else if (game.state === 'winner has been chosen') {
        /*
        * change the card background to the colors representing the players
        * and stop animation
        */
        return {
          'background-color': $scope.colors[winningSet.playerIndex],
          '-webkit-animation': 'none',
          'animation': 'none',
        }
      } else {
        return {};
      }
    };

    $scope.sendPickedCards = function() {
      game.pickCards($scope.pickedCards);
      $scope.showTable = true;
    };

    $scope.cardIsFirstSelected = function(card) {
      if (game.curQuestion.numAnswers > 1) {
        return card === $scope.pickedCards[0];
      } else {
        return false;
      }
    };

    $scope.cardIsSecondSelected = function(card) {
      if (game.curQuestion.numAnswers > 1) {
        return card === $scope.pickedCards[1];
      } else {
        return false;
      }
    };

    $scope.firstAnswer = function($index){
      if($index % 2 === 0 && game.curQuestion.numAnswers > 1){
        return true;
      } else{
        return false;
      }
    };

    $scope.secondAnswer = function($index){
      if($index % 2 === 1 && game.curQuestion.numAnswers > 1){
        return true;
      } else{
        return false;
      }
    };

    $scope.showFirst = function(card) {
      return game.curQuestion.numAnswers > 1 && $scope.pickedCards[0] === card.id;
    };

    $scope.showSecond = function(card) {
      return game.curQuestion.numAnswers > 1 && $scope.pickedCards[1] === card.id;
    };

    $scope.isCzar = function() {
      return game.czar === game.playerIndex;
    };

    $scope.isPlayer = function($index) {
      return $index === game.playerIndex;
    };

    $scope.isCustomGame = function() {
      return !(/^\d+$/).test(game.gameID) && game.state === 'awaiting players';
    };

    $scope.isPremium = function($index) {
      return game.players[$index].premium;
    };

    $scope.currentCzar = function($index) {
      return $index === game.czar;
    };

    $scope.winningColor = function($index) {
      if (game.winningCardPlayer !== -1 && $index === game.winningCard) {
        return $scope.colors[game.players[game.winningCardPlayer].color];
      } else {
        return '#f9f9f9';
      }
    };

    $scope.pickWinning = function(winningSet) {
      if ($scope.isCzar()) {
        game.pickWinning(winningSet.card[0]);
        $scope.winningCardPicked = true;
      }
    };

    $scope.winnerPicked = function() {
      return game.winningCard !== -1;
    };

    $scope.startGame = function() {
      game.startGame();
    };

    $scope.abandonGame = function() {
      game.leaveGame();
      $("#closeAbandonModal").click();
      setTimeout(() => {
        $location.path('/');
      })
    };

    // Catches changes to round to update when no players pick card
    // (because game.state remains the same)
    $scope.$watch('game.round', function() {
      $scope.hasPickedCards = false;
      $scope.showTable = false;
      $scope.winningCardPicked = false;
      $scope.makeAWishFact = makeAWishFacts.pop();
      if (!makeAWishFacts.length) {
        makeAWishFacts = MakeAWishFactsService.getMakeAWishFacts();
      }
      $scope.pickedCards = [];
    });

    // In case player doesn't pick a card in time, show the table
    $scope.$watch('game.state', function() {
      console.log('*********************');
      if (game.state === 'waiting for czar to decide' && $scope.showTable === false) {
        $scope.showTable = true;
      }

      if (game.state === 'game ended' && game.playerIndex === 0 || game.state ==='game dissolved') {
        const {
          players, gameID, gameWinner, round
        } = game;
        console.log('index of the game winner', gameWinner);
        
        const gameStarter = players[0].username;
        const nameOfWinner = players[gameWinner].username;
        const result = players.map(player => player.username);
        const token = localStorage.getItem('token'); 

        $http({
          method: 'POST',
          url: `/api/games/${gameID}/start`,
          data: {
            gameId: gameID,
            gamePlayers: result,
            gameWinner: nameOfWinner,
            gameCzar: gameStarter,
          },
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `${token}`,
           
          }
        }).then((response) => {
          console.log(response.data.message);
        }, (response) => {
          console.log(response.data.error);
        });

      }

      if ($scope.isCzar() && game.state === 'czar pick card' && game.table.length === 0) {
        const myModal = $('#start-modal');
        myModal.modal('show');
      }
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                            
      if (game.state === 'game dissolved') {
        playTone('error', 0.4);
        $('#start-modal').modal('hide');
      }

      if (game.state !== 'czar pick card' && game.state !== 'awaiting players' && game.state !== 'game dissolve') {
        $scope.czarHasDrawn = '';
      }

      if ($scope.isCzar() && game.state === 'czar pick card' && game.table.length === 0) {
        const myModal = $('#start-modal');
        myModal.modal('show');
      }
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                            
      if (game.state === 'game dissolved') {
        playTone('error', 0.4);
        $('#start-modal').modal('hide');
      }

      if (game.state !== 'czar pick card' && game.state !== 'awaiting players' && game.state !== 'game dissolve') {
        $scope.czarHasDrawn = '';
      }
    });

    $scope.$watch('game.gameID', function() {
      if (game.gameID && game.state === 'awaiting players') {
        if (!$scope.isCustomGame() && $location.search().game) {
          // If the player didn't successfully enter the request room,
          // reset the URL so they don't think they're in the requested room.
          $location.search({});
        } else if ($scope.isCustomGame() && !$location.search().game) {
          // Once the game ID is set, update the URL if this is a game with friends,
          // where the link is meant to be shared.
          $location.search({game: game.gameID});
          if(!$scope.modalShown){
            setTimeout(function(){
              var link = document.URL;
              var txt = 'Give the following link to your friends so they can join your game: ';
              $('#lobby-how-to-play').text(txt);
              $('#oh-el').css({'text-align': 'center', 'font-size':'22px', 'background': 'white', 'color': 'black'}).text(link);
            }, 200);
            $scope.modalShown = true;
          }
        }
      }
    });

    if ($location.search().game && !(/^\d+$/).test($location.search().game)) {
      console.log('joining custom game');
      game.joinGame('joinGame',$location.search().game);
    } else if ($location.search().custom) {
      game.joinGame('joinGame',null,true);
    } else {
      game.joinGame();
    }

    $scope.shuffleCards = () => {
      const card = $(`#${event.target.id}`);
      setTimeout(() => {

      $scope.startNextRound();
       $('#start-modal').modal('hide');
      }, 500);
    };

    $scope.startNextRound = () => {
      // playTone('newRound');
      if ($scope.isCzar()) {
        console.log('am @ here');
        game.startNextRound();
      }
    };
    // taking a tour
    $scope.gameTour.setOptions({
      exitOnOverlayClick: false,
      steps: [{
        intro: '<h3 class="text-center">Welcome to card 4 humanity</h3> <br/> I would like to take you on a quick tour of how this game is played.<br/>'
      },
      {
        element: '#player-card',
        intro: 'This shows the current player(s) in the game session with their pictures and points'
      },
      {
        element: '#question-box',
        intro: 'This panel shows the number of players that have joined the game, provides button with which you can start the game and displays the question when the game has started '
      },
      {
        element: '#start-game',
        intro: 'This is the button to start the game'
      },
      {
        element: '#invite-players',
        intro: 'This button allows you invite your friends to play the game.'
      },
      {
        element: '#counter',
        intro: 'A game session last for 20 seconds. This panel shows the number of seconds left '
      },
      {
        element: '#instructions-row',
        intro: 'This panel shows the instructions of the game. When the game starts, the answers to the question in the <strong>question box</strong> above will be shown here.',
      },
      {
        element: '#notification',
        intro: 'This displays any new notification that you have.',
      },
      // {
      //   element: '#chat-icon-container',
      //   intro: 'Feel like chatting with players in this game session? Here is the place to chat. Just click on this button and voila! the chat begins.',
      //   position: 'top'
      // },
      {
        element: '#abandon',
        intro: 'Click on this button to leave the game.'
      },
      {
        element: '#takeTourBtn',
        intro: 'If you feel like taking this tour again, you can always click here.'
      },

      {
        intro: 'YES! We have come to the end the tour. Enjoy the game!'
       
      },
      ]
    });

    // Repeate tour method:
    // This will run on click of take tour button on game screen
    $scope.repeatTour = () => {
      $scope.gameTour.start();
    };

    $scope.getNotification = () => {
      const token = localStorage.token;
      $http({
        method: 'GET',
        url: '/api/notifications',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `${token}`,
         
        }
      }).then((response) => {
        if(response.data.notification.length === 0) {
          $scope.showNoNotification = 'No new notification';
        }
        const { notification } = response.data;
        $scope.notifications = notification;
        $scope.unreadNotification = notification.length;
        $scope.false = false;

        // $scope.listOfInvites = notification.map((notif) => {
        //   if(notif.friendRequest === 0 && notif.status === 0 && notif.requestAccepted === 0) {
        //     return notif.receiver;
        //   }
        // })
        // return console.log($scope.listOfInvites);
        // return console.log(response.data.notification);
             
      }, (response) => {
        console.log(response.data.error);
      });
    }

    $scope.getNotification();

    $scope.getFriendList = () => {
      $scope.loading = true;
      $scope.showFriendError = '';
      $scope.friendList = '';
      const token = localStorage.token;
      $http({
        method: 'GET',
        url: '/api/users/friends',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `${token}`,
         
        }
      }).then((response) => {
        $scope.getNotification();
        console.log(response.data.friends); 
        
        if(response.data.friends.length === 0) {
          $scope.showFriendError = 'No friends added yet';
        }
        const { friends } = response.data;
        
        $scope.getFriendsError = '';
        $scope.friendList = friends;
        $scope.totalFriends = friends.length;
        
        $scope.name = friends.map(friend => friend.receiverName || friend.senderName);
        $scope.loading = false;   
             
      }, (response) => {
        console.log(response.data.error);
      });
    }

    $scope.sendInviteToFriend = (user, message, requestAccepted, gameInvite) => {
      if(requestAccepted) {        
        $scope.gameLink = null;
        $scope.requestStatus = 0;
        $scope.requestAccepted = requestAccepted;
        $scope.status = 0;
        $scope.name = user.sender;
        message = `${window.user.name} has accepted your friend request`;
      } else if(document.getElementById("tab-button").innerHTML === "Add as Friend") {
        $scope.gameLink = null;
        message = `You have a friend request from ${window.user.name}`;
        $scope.status = 0;
        $scope.requestStatus = 1;
        $scope.requestAccepted = 0;
        $scope.name = user.name;
        $scope.gameInvite = 0;
      } else {
        $scope.name = user.senderName || user.receiverName
        $scope.gameLink = $location.absUrl();
        message = `You have a game invite from ${window.user.name}`
        $scope.requestStatus = 0;
        $scope.status = 0;
        $scope.requestAccepted = 0;
      }
      
      $scope.listOfInvites = [];
      const token = localStorage.token;
      $http({
        method: 'POST',
        url: `/api/notifications`,
        data: {
          message,
          receiver: $scope.name,
          link: $scope.gameLink,
          requestStatus: $scope.requestStatus,
          requestAccepted: $scope.requestAccepted,
          status: $scope.status
        },
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `${token}`,
         
        }
      }).then((response) => {
        if($scope.requestAccepted !== 1 && $scope.gameInvite !== 1) {
          $scope.showSuccessMessage = 'Friend request sent successfully';
        } else if (gameInvite === 1) {
          $scope.showSuccessMessage = 'Game invite sent successfully';
        } else {
          $scope.showSuccessMessage = response.data.message;
        }

        $("#openSuccessModal").click();
        console.log('request accepted', $scope.requestAccepted);
        console.log('gameInvite', $scope.gameInvite);
        // $scope.listOfInvites.push(notification.sender);

      }, (response) => {
        console.log(response.data.error);
      });

    }

    $scope.addFriend = (name) => {
      console.log('name', name);
      const token = localStorage.token;
      $scope.isLoading = true;
      // let user = [];
      $http({
        method: 'PUT',
        url: `/api/users/friends/send`,
        data: {
          receiverName: name,
          // receiverEmail: user.email
        },
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `${token}`,
         
        },
      }).then((response) => {
        console.log('@here', user);
        $scope.sendInviteToFriend(user);
        
        $scope.isLoading = false;
        const { friends } = response.data;
        $scope.getFriendsError = '';
        $scope.friendList = friends;

      }, (response) => {
        const closeModal = '<button id="closeModal" data-dismiss="modal" type="button" class="btn btn-md text-white" style="background: red">Close</button>';        
        const infoModal = $('#infoModal');
        infoModal.find('.modal-body').empty();
        infoModal.find('.modal-body')
        .append(`<div class="text-center">Sorry, ${name} is not a registered user</div>`);
        $('.button').empty();
        infoModal.find('.button').append(closeModal);
        infoModal.modal('show')
        console.log('errorrrrrrr');
      });

    }

    $scope.removeFriend = (name) => {
      $scope.isLoading = true;
      const token = localStorage.token;
      $http({
        method: 'DELETE',
        url: `/api/users/friends/`,
        data: {
          receiverName: name
        },
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `${token}`,
         
        }
      }).then((response) => {
        $scope.isLoading = false;
        const { friends } = response.data;
        if(friends.length === 0) {
          $scope.showFriendError = 'No friends added yet';
        }
        
        $scope.getFriendsError = '';
        $scope.friendList = friends;

        $("#openSuccessModal").click();
        $scope.showSuccessMessage = "Friend removed successfully";
        
        
      }, (response) => {
        console.log(response.data.error);
      });

    }

    $scope.acceptInvite = (notif) => {
      const token = localStorage.token;
      
      $http({
        method: 'DELETE',
        url: `/api/notifications`,
        data: {
          id: notif._id
        },
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `${token}`,
         
        },
      }).then((response) => {
        $scope.sendInviteToFriend(notif, 'ssd', 1);
        $scope.getNotification();        
      }, (response) => {
        console.log(response.data.error);
      });
    }

    $scope.acceptGameInvite = (notif) => {
      const token = localStorage.token;
      
      $http({
        method: 'DELETE',
        url: `/api/notifications`,
        data: {
          id: notif._id
        },
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `${token}`,
         
        },
      }).then((response) => {
        $scope.getNotification();        
      }, (response) => {
        console.log(response.data.error);
      });
    }

    $scope.acceptFriendRequest = (notif) => {
      const token = localStorage.token;
      $scope.isLoading = true;
      // let user = [];
      $http({
        method: 'PUT',
        url: `/api/users/friends/accept`,
        data: {
          senderName:  notif.sender,
          senderEmail:  notif.senderEmail
        },
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `${token}`,
         
        },
      }).then((response) => {
        $scope.acceptInvite(notif);
        console.log(response.data.message);
        $scope.isLoading = false;

        $("#openSuccessModal").click();
        $scope.showSuccessMessage = response.data.message;

      }, (response) => {
        console.log(response.data.error);
      });

    }

    $scope.rejectFriendRequest = (notif) => {
      const token = localStorage.token;
      $scope.isLoading = true;
      // let user = [];
      $http({
        method: 'PUT',
        url: `/api/users/friends/reject`,
        data: {
          senderName: notif.sender,
        },
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `${token}`,
         
        },
      }).then((response) => {
        $scope.deleteNotification(notif);
        $scope.isLoading = false;

        $("#openSuccessModal").click();
        $scope.showSuccessMessage = response.data.message;

      }, (response) => {
        console.log(response.data.error);
      });

    }

    $scope.deleteNotification = (notif) => {
      const token = localStorage.token;
      
      $http({
        method: 'DELETE',
        url: `/api/notifications`,
        data: {
          id: notif._id
        },
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `${token}`,
         
        },
      }).then((response) => {
        $scope.getNotification();        
        console.log(response.data.message);
        
      }, (response) => {
        console.log(response.data.error);
      });
    }
}]);
