var app = angular.module('myApp', []);


app.controller('tasks', function($scope, $http, $interval){
  $interval(function(){
    $scope.$applyAsync($http.get('/api/pendingtasks').then(function(data){
    $scope.pendingtasks = data.data
  }));
    $scope.$applyAsync($http.get('/api/completedtasks').then(function(data){
      $scope.completedtasks = data.data
    }))
  },  1,1);

  $scope.complete = function(Task){
    $http.put('api/tasks',{id:Task._id, completed: true})
  };
  $scope.delete = function(Task){
    $http.delete('api/deletetasks/'+Task._id);
  };

})

$(document).ready(function(){
  $('.modal').modal();
});

$('#btn-cadastrar').click(function(){
  console.log('funcionou');
  document.getElementById("newtaskform").reset();
})

function newtask(){
  document.getElementById('newtaskform').reset();
}

app.controller('modal', function($scope, $http){
  $scope.task = {}
  $scope.submitForm = function(){
    $http({
      method: 'POST',
      url: '/api/newtask',
      data: $scope.task
    }).success(function(){
      console.log(true);
    }).error(function(err){
      console.log(err);
    })}})


app.directive('teste', function(){
  return {restrict: 'E',
  transclude: true,
  scope: {title:'@title'},
  template:'<div class="panel">' +
            '<h6><strong>{{title}}</strong></h6>' +
            '<div class="panel-content" ng-transclude></div>' +
            '</div>',
  replace: true}
});

app.directive('modal', function(){
  return {restrict: 'E',
  transclude: true,
  scope: {title:'@title'},
  template: "<div id='modal1' class='modal' style='overflow-x: hidden'>"+
            "<br>"+ 
            "<h4 class='modal-title'>{{title}}</h4>"+
            "<div class='modal-content row' ng-transclude>"+
            "</div></div>",
  replace: true}
});

$(function(){
  var socket = io();
  socket.on('message', function(msg){
    console.log(msg);
  })
})