angular.module('mean.system')
  .controller('IndexController', ['$scope', '$http', 'Global', '$location', 'socket', 'game', 'AvatarService', function ($scope, $http, Global, $location, socket, game, AvatarService) {
    $scope.global = Global;
    $scope.gameWithCustom = 'false';
    
    // Run validation on user input
    $scope.validator = () => {
      const userDetails = $scope.user;
      const { name, email, password } = userDetails;
      $scope.hasError = {};
      // send the post request to the server
      $http.post('/api/validator', userDetails)
        .then((response) => {
          // toggle modal if action is successful
          $('#closeSignUp').click();
          $('#openSecondSignUp').click();
          },
          (errors) => {
          // display errors if input is empty or invalid
            $scope.hasError = errors.data
          }
        );
    };

    
    $scope.getUser = (term) => {
       console.log(term);
      $scope.loading = true;
      const token = localStorage.token;
      let user = [];
      let url;
      if(term){
        url = `/api/profile?username=${term}`;
      }
      else{
        url = '/api/profile';
      }
      
      $http({
        method: 'GET',
        url: url,
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `${token}`,
         
        }
      }).then((response) => {
        const { user , players} = response.data;
        $scope.user = user;
        $scope.players = response.data.players;
        $scope.loading = false;
      }, (response) => {
        $scope.loading = false;
        const closeModal = '<button id="closeModal" data-dismiss="modal" type="button" class="btn btn-md text-white" style="background: red">Close</button>';        
        const infoModal = $('#infoModal');
        infoModal.find('.modal-body').empty();
        infoModal.find('.modal-body')
        .append(`<div class="text-center">Sorry, ${term} is not a registered user</div>`);
        $('.button').empty();
        infoModal.find('.button').append(closeModal);
        infoModal.modal('show')
        console.log(response.data.error);
      });

      $scope.totalDonation = (donations) => {
        return donations.reduce((a,b) => parseInt(a) + parseInt(b));
      }

    }
    // $scope.getUser();
    $scope.previewImage = () => {
      // collect image chosen from the signup form
      // const imageFile = '';
      const imageFile = $('#userImage').prop('files')[0];
      
      if (imageFile) {
        document.getElementById("addHide").classList.add('hide');
        document.getElementById("removeHide").classList.add('rounded-circle');
        document.getElementById("removeHide").classList.remove('hide');
        // $('#addHide').classList.add('hide');
        const fileReader = new FileReader();
        fileReader.readAsDataURL(imageFile);
        fileReader.onload = (event) => {
          // set the preview
          $scope.imagePreview = event.target.result;
        };
      }
    };

    // toggle option to select avatar or upload an image
    $scope.toggleImageSelect = () => {
      const option = $scope.user.option;
      if(option === 'Upload image') {
        document.getElementById('image-upload').classList.remove('hide');
        document.getElementById('avatar-select').classList.add('hide');
        document.getElementById('toggle-button').classList.remove('hide');
        $scope.user.avatar = null;
        $scope.hasError = null;
      } else {
        document.getElementById('avatar-select').classList.remove('hide');
        document.getElementById('image-upload').classList.add('hide');
        document.getElementById('toggle-button').classList.remove('hide');
        $scope.hasError = null;
      }
    }

    // open modal for start Game
    $scope.startGameModal = function (term) {
      // setting the buttons
      const startButton = '<a href="/play"><button type="button" class="btn btn-md text-white" style="background: #1B5E20">Start</button></a>&nbsp;';
      const idStartButton = '<a href="/play?custom"><button type="button" class="btn btn-md text-white" style="background: #1B5E20">Start</button></a>&nbsp;';
      const closeModal = '<button id="closeModal" data-dismiss="modal" type="button" class="btn btn-md text-white" style="background: red">Close</button>';
      // call the modal and append their attributes
      const infoModal = $('#infoModal');
      // infoModal.find('.modal-body')
      //   .text('You are about to start a new game. Click button to start');

      if (term === 'custom') {
        infoModal.find('.modal-body')
        .text('You are about to start a new game. Click button to start');

        $('.button').empty();
        infoModal.find('.button').append(idStartButton, closeModal);
      }
      if (term === 'guest') {
        infoModal.find('.modal-body').empty();
        infoModal.find('.modal-body')
        .append('<div class="">Click on start to continue and wait for people to join the game.<br/> Can\'t wait? <br/>Signup/Signin to invite and play with friends.</div>');

        $('.button').empty();
        infoModal.find('.button').append(startButton, closeModal);
      }
      if (term === 'Strangers') {
        infoModal.find('.modal-body').empty();
        infoModal.find('.modal-body')
        .append('<div class="">Click on start to continue and wait for people to join the game.</div>');

        $('.button').empty();
        infoModal.find('.button').append(startButton, closeModal);
      }
      
      infoModal.modal('show');
    };
    
    const finishSignup = (userDetails) => {
      $http.post('api/auth/signup', userDetails).then(
      (response) => {
          const { token } = response.data;
          if (token) {
            localStorage.setItem('token', token);
            $scope.showOptions = false;
            $('#closeSecondModal').click();
            $scope.showSuccessMessage = response.data.message
            $('#openSuccessModal').click();

            $scope.user = null;
        document.getElementById('toggle-button').innerHTML = "Signup";

            setTimeout(() => {
              $('#close-sucess-dialog').click();
            }, 10000);
          }
        },
        (response) => {
        }
      );
    };

    $scope.signup = function () {
      // collect user details from the signup form
      const userDetails = $scope.user;
      const { name, email, password, avatar, userImage } = userDetails;
      // collect image chosen from the signup form
      const imageFile = $('#userImage').prop('files')[0];
      let imageUrl;

      if(!userImage && !avatar) {
        return $scope.hasError = {'error': 'Sorry you need to upload an image or choose an avatar'}
      }
      
      document.getElementById('has-error').classList.add('hide');
      document.getElementById('toggle-button').innerHTML = "processing...";
      if (imageFile) {
        const formData = new FormData();
        formData.append('file', imageFile);
        formData.append('upload_preset', 'lpxun7n2');
        $.ajax({
          url: 'https://api.cloudinary.com/v1_1/longe/image/upload',
          data: formData,
          type: 'POST',
          cache: false,
          processData: false,
          contentType: false,
          dataType: 'json',
        })
          .then((res) => {
            imageUrl = res.secure_url;
            userDetails.avatar = imageUrl;

            return finishSignup(userDetails);
          });
      } else {
        // send the post request to the server
        return finishSignup(userDetails);
      }
    };

    // login a user
    $scope.login = function () {
      $http.post('api/auth/login', {
        email: $scope.email,
        password: $scope.password
      })
        .then((response) => {
          $scope.getNotification();
          const token = response.data.token;
          if (token) {
            localStorage.setItem('token', token);
            $scope.showOptions = false;
            $('#closeLogin').click();
            toastr.options = {
              "closeButton": true,
              "showDuration": "100",
              "hideDuration": "1000",
              "timeOut": "50000",
              "extendedTimeOut": "1000",
              "showEasing": "swing",
              "hideEasing": "linear",
              "showMethod": "fadeIn",
              "hideMethod": "fadeOut"
            }
            toastr.success('Successfully signed in');
          }
        },
        (errors) => {
          $scope.hasError = {'error': 'Username or Password is Incorrect'};
        });
    };

    // reset user password
    $scope.resetPassword = function () {
      $http.put('api/auth/passwordreset', {
        email: $scope.email,
        password: $scope.password,
        confirmPassword: $scope.confirmPassword,
      }).then(
(         response) => {
          const token = response.data.token;
          if (token) {
            localStorage.setItem('token', token);
            $scope.showOptions = false;
            $('#closeLogin').click();
            toastr.options = {
              "closeButton": true,
              "showDuration": "100",
              "hideDuration": "1000",
              "timeOut": "50000",
              "extendedTimeOut": "1000",
              "showEasing": "swing",
              "hideEasing": "linear",
              "showMethod": "fadeIn",
              "hideMethod": "fadeOut"
            }
            toastr.success('Successfully updated password');
            $('#closeResetModal').click();
            $scope.hasError = {};
        }
      },
      (errors) => {
        $scope.hasError = errors.data;
      }
);
    };

    $scope.playAsGuest = function () {
      game.joinGame();
      $location.path('/app');
    };

    $scope.showError = function() {
      if ($location.search().error) {
        return $location.search().error;
      } 
        return false;
      
    };

    $scope.avatars = [];
    AvatarService.getAvatars()
      .then((data) => {
        $scope.avatars = data;
      });

    $scope.showOptions = true;

    if (window.localStorage.token) {
      $scope.showOptions = false;
    }
    
    $scope.signOut = function () {
      $http.get('/signout').then(
        () => {
          window.localStorage.removeItem('token');
          $scope.showOptions = true;
        }
      )
    }

    $scope.toggleResetModal = function() {
      document.getElementById('closeLogin').click();
    }

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
        
      }, (response) => {
        console.log(response.data.error);
      });
    }

    $scope.getNotification();

    $scope.sendInviteToFriend = (user, message, requestAccepted, gameInvite) => {
      if(requestAccepted) {        
        $scope.gameLink = null;
        $scope.requestStatus = 0;
        $scope.requestAccepted = requestAccepted;
        $scope.status = 0;
        $scope.name = user.sender;
        message = `${window.user.name} has accepted your friend request`;
      } else if(document.getElementById("tab-button").innerHTML === "Add friend") {
        $scope.gameLink = null;
        message = `You have a friend request from ${window.user.name}`;
        $scope.status = 0;
        $scope.requestStatus = 1;
        $scope.requestAccepted = 0;
        $scope.name = user.name;
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
        $("#openSuccessModal").click();
        const { notification } = response.data;

        if(requestAccepted !== 1 && gameInvite !== 1) {
          $scope.showSuccessMessage = 'Friend request sent successfully';
        } else if (gameInvite === 1) {
          $scope.showSuccessMessage = 'Game invite sent successfully';
        } else {
          $scope.showSuccessMessage = response.data.message;
        }
        // $scope.listOfInvites.push(notification.sender);

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
