var app = angular.module('myApp', []);
app.controller('pendentes', function($scope){
  $scope.task={'name':'Estruturar liga gn2', 'date':'06/03/2017'}
})

$(document).ready(function(){
  $('.modal').modal();
});

$('#testando').click(function(){
  console.log('funcionou');
  document.getElementById("newtaskform").reset();
})

function newtask(){
  document.getElementById('newtaskform').reset();
}

function onclick($scope, $http){
  var data = {'name':$scope.task-name, 'data':$scope.task-date}
  $http.post('/', data).success(function(){console.log(true)}).error(function(err){console.log(err)});
}