angular.module('mean.system')
  .controller('IndexController', ['$scope', '$http', 'Global', '$location', 'socket', 'game', 'AvatarService', function ($scope, $http, Global, $location, socket, game, AvatarService) {
    $scope.global = Global;
    $scope.gameWithCustom = 'false';

    // Run validation on user input
    $scope.validator = () => {
      const userDetails = $scope.user;
      const { name, email, password, security_question, security_answer } = userDetails;
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

    $scope.getUser = () => {
      $scope.loading = true;
      const token = localStorage.token;
      let user = [];
      $http({
        method: 'GET',
        url: `/api/profile`,
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `${token}`,
         
        }
      }).then((response) => {
        const { user } = response.data;
        $scope.user = user;
        $scope.players = response.data.players;
        $scope.loading = false;
      }, (response) => {
        console.log(response.data.error);
      });

    }
    $scope.getUser();
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
      if (term === undefined) {
        infoModal.find('.modal-body')
        .text('Click on start to continue and wait for people to join the game. Can\'t wait? Signup/Signin to invite and play with friends.');

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
      document.getElementById('login-button').innerHTML = "processing...";

      $http.post('api/auth/login', {
        email: $scope.email,
        password: $scope.password
      })
        .then((response) => {
          const token = response.data.token;
          if (token) {
            document.getElementById('login-button').innerHTML = "Sign in";
            localStorage.setItem('token', token);
            $scope.showOptions = false;
            $('#closeLogin').click();
            $scope.showSuccessMessage = response.data.message
            $('#openSuccessModal').click();
            setTimeout(() => {
              $('#close-sucess-dialog').click();
            }, 10000);
          }
        },
        (errors) => {
          $scope.hasError = {'error': 'Username or Password is Incorrect'};
          document.getElementById('login-button').innerHTML = "Sign in";
        });
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

    // sends password reset link
    $scope.sendResetLink = function(user){
      $scope.appLink = $location.absUrl();
      
      document.getElementById('reset-password').innerHTML = "sending...";
      $http.post('/api/sendresetlink', {
        email: $scope.email,
        appLink: $scope.appLink
      }).then((response) => {
        $('#closeResetModal').click();

        $scope.showSuccessMessage = response.data.message;
        $('#openSuccessModal').click();

        setTimeout(() => {
          $('#close-sucess-dialog').click();
        }, 10000);
        document.getElementById('reset-password').innerHTML = "Reset password";
      }, (errors) => {
        $scope.hasError = errors.data;
        document.getElementById('reset-password').innerHTML = "Reset password";
      }) 
    }

    $scope.closeSuccessDialog = function() {
      setTimeout(function(){
        $('#closeSuccessModal').click();
        $location.path('/#!/');
      });
    }
    // reset user password
    $scope.resetPassword = function () {
      $scope.appLink = $location.absUrl();
      
      const { password } = $scope;

      document.getElementById('reset-password').innerHTML = "processing...";

      $http.put('api/auth/passwordreset', {
        token: $scope.appLink,
        password
      }).then(
          (response) => {
          const token = response.data.token;
          if (token) {
            document.getElementById('reset-password').innerHTML = "Reset password";
            localStorage.setItem('token', token);
            
            $scope.showSuccessMessage = response.data.message
            $('#openSuccessModal').click();
            setTimeout(() => {
              $scope.closeSuccessDialog();;
            }, 10000);
            $scope.showOptions = false;
            $scope.hasError = {};
            localStorage.removeItem('userEmail')
          }
      },
      (errors) => {
        document.getElementById('reset-password').innerHTML = "Reset password";
        $scope.hasError = errors.data;
      }
);
    };

    $scope.togglePasswordVisibility = function() {
      const togglePasswordType = document.getElementById('password');
      const showVisibleIcon = document.getElementById('remove-hide');
      const hideIcon = document.getElementById('add-hide');

      if(togglePasswordType.type === 'password') {
        togglePasswordType.type = 'text';
        showVisibleIcon.classList.remove('hide')
        hideIcon.classList.add('hide')
      } else {
        togglePasswordType.type = 'password';
        showVisibleIcon.classList.add('hide')
        hideIcon.classList.remove('hide')
      }
    }
  }]);
