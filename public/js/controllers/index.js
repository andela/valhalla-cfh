angular.module('mean.system')
.controller('IndexController', ['$scope', 'Global', '$location', 'socket', 'game', 'AvatarService', function ($scope, Global, $location, socket, game, AvatarService) {
    $scope.global = Global;

    // login a user
    $scope.login = function() {
      $http.post('api/auth/login', {
        email: $scope.email,
        password: $scope.password
      }).then((response) => {
        const token = response.data.token;
        if(token){
          localStorage.setItem('token', token);
          $location.path('/');
        }
      },
    (response) => {
      const { error } = response.data
      $scope.hasError = error;
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