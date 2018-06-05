angular.module('mean.system')
.controller('IndexController', ['$scope', '$http', 'Global', '$location', 'socket', 'game', 'AvatarService', function ($scope, $http, Global, $location, socket, game, AvatarService) {
    $scope.global = Global;

    // 
    const sendSignUPRequest = (userDetails) => {
      // send the post request to the server
      $http.post('/api/auth/signup', userDetails)
      .then(
        (response) => {
          const token = response.data.token;
          localStorage.setItem('token', token);
          $location.path('/');
        },
        (error) => {
          // display server errors
          $scope.hasError = error.data
        })
    };

    $scope.previewImage = () => {
      // collect image chosen from the signup form
      const imageFile = $('#userImage').prop('files')[0];
      if (imageFile) {
        const fileReader = new FileReader();
        fileReader.readAsDataURL(imageFile);
        fileReader.onload = event => {
          // set the preview
          $scope.imagePreview = event.target.result;
        };
      }
    };

    $scope.signup = function(){
      // collect user details from the signup form
      const userDetails = $scope.user;
      const { name, email, password } = userDetails;
      $scope.hasError = {};

      // collect image chosen from the signup form
      const imageFile = $('#userImage').prop('files')[0];
      const error = {}
      let imageUrl;

      // validate name, email and password is available
      Object.entries({ name, email, password }).forEach(([key, value]) => {
        if (!value || value === '') {
          error[key] = `Please supply your ${key}`;
        }
      });
      // validate that either an avatar or an image upload is chosen
      if (!imageFile && !userDetails.avatar) {
        error.avatar = 'Please choose an avatar or upload an image';
      }

      // if any validation fails, display the error
      if (Object.keys(error).length !== 0) {
        $scope.hasError = error;
      } else {
        // upload the image to cloudinary
        if (imageFile) {
          const formData = new FormData();
          formData.append('file', imageFile);
          formData.append('upload_preset', 'lpxun7n2');
          $.ajax({
            url: 'https://api.cloudinary.com/v1_1/longe/image/upload',
            data: formData,
            type: 'POST',
            cache : false,
            processData: false,
            contentType: false,
            dataType: 'json',
          })
            .then((res) => {
              imageUrl = res.secure_url;
              userDetails.avatar = imageUrl;

              return sendSignUPRequest(userDetails);
            });
        } else {
          // send the post request to the server
          return sendSignUPRequest(userDetails);
        }
      }
    };

    // login a user
    $scope.login = function() {
      $http.post('api/auth/login', {
        email: $scope.email,
        password: $scope.password
      }).then((response) => {
        const token = response.data.token;
        if(token){
          localStorage.setItem('token', token);
          toastr.success('Successfully signed in');
          $location.path('/');
        }
      },
    (response) => {
      const { error } = response.data
      toastr.error(error);
    })
    };

    $scope.playAsGuest = function() {
      game.joinGame();
      $location.path('/app');
    };

    $scope.showError = function() {
      if ($location.search().error) {
        return $location.search().error;
      } else {
        return false;
      }
    };

    $scope.avatars = [];
    AvatarService.getAvatars()
      .then(function(data) {
        $scope.avatars = data;
      });

}]);