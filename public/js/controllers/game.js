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
    $scope.regionError = '';

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
        $scope.inviteUser = response.data.foundUsers;
        
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
      toastr.success(response.data.message);
      $scope.totalInvites = $scope.totalInvites + 1;
      document.getElementById("closeModal").click();
    }, (response) => {
      toastr.success(response.data.error);
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

      $scope.NextRound();
       $('#start-modal').modal('hide');
      }, 500);
    };

    $scope.startNextRound = () => {
      // playTone('newRound');
      if ($scope.isCzar()) {
        game.startNextRound();
      }
    };

    $scope.playerStyle = (player) => {
      if ((game.state === 'winner has been chosen') && (game.winningCardPlayer === player.color)) {
        return {
          '-webkit-animation': 'shake 0.7s infinite',
          'animation': 'shake 0.7s infinite',
          'position': 'relative'
        };
      }
    }


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
      if ($scope.regionIndex && $scope.regionIndex !== '') {
        $('#regionModal').modal('hide');
        game.startGame($scope.regionIndex);
      } else {
        $scope.regionError = 'Please select a region';
      }
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
      if (game.state === 'waiting for czar to decide' && $scope.showTable === false) {
        $scope.showTable = true;
      }

      if (game.state === 'game ended' && game.playerIndex === 0 || game.state ==='game dissolved') {
        const {
          players, gameID, gameWinner, round
        } = game;
        
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

    // Take tour method: This will run on ng-init
    // $scope.takeTour = () => {
    //   // $scope.gameTour.start();
      
    //   // const tourStatus = localStorage.getItem('tour_status') || localStorage.getItem('guests_tour_status');
    //   // if (tourStatus === 'true') {
    //   //   const timeout = setTimeout(() => {
    //   //     $scope.gameTour.start();
    //   //     clearTimeout(timeout);
    //   //   }, 2000);
    //   //   // localStorage.removeItem('tour_status') || localStorage.removeItem('guests_tour_status');
    //   // }
    // };

    // Repeate tour method:
    // This will run on click of take tour button on game screen
    $scope.repeatTour = () => {
      $scope.gameTour.start();
    };


}]);
