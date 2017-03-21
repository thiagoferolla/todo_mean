var app = angular.module('myApp', []);

app.controller('tasks', function($scope, $http, $interval){
  $http.get('/api/pendingtasks').then(function(data){
        $scope.pendingtasks = data.data  
    });
    $http.get('/api/completedtasks').then(function(data){
        $scope.completedtasks = data.data  
    })
  $interval(updateTasks ,10000, 4);

  $http.get('/api/user').then(function(data){
    $scope.user = data;
  })

  function updateTasks(){
    $http.get('/api/pendingtasks').then(function(data){
      if (equa_tasks($scope.pendingtasks, data.data)==false){
        $scope.pendingtasks = data.data  
      }
    });

    $http.get('/api/completedtasks').then(function(data){
      if (equa_tasks($scope.completedtasks, data.data)==false){
        $scope.completedtasks = data.data  
      }
    })}; 

  function equa_tasks(oldtask, newtask){
    if (oldtask.length!=newtask.length){
      return (false);
    }
    for (i=0; i<oldtask.length; i++){
      if (oldtask[i]._id != newtask[i]._id){
        return(false);}
    }
    return (true);
  }

  $scope.complete = function(Task){
    $http.put('api/tasks',{id:Task._id, completed: true})
    updateTasks();
  };
  $scope.delete = function(Task){
    $http.delete('api/deletetasks/'+Task._id);
    updateTasks();
  };

})

$(document).ready(function(){
  $('.modal').modal();
  $('.button-collapse').sideNav('show');
});


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
    });
    }})




app.directive('modal', function(){
  return {restrict: 'E',
  transclude: true,
  scope: {title:'@title'},
  template: "<div class='modal' style='overflow-x: hidden'>"+
            "<br>"+ 
            "<h4 class='modal-title'>{{title}}</h4>"+
            "<div class='modal-content row' ng-transclude>"+
            "</div></div>",
  replace: true}
});

app.directive('editmodal', function(){
  return {restrict: 'E',
  transclude: false,
  scope: {name:'@name', date:'@date'},
  template:
          '<form id="editform" method="PUT" style="background-color: white" ng-submit="editForm()">'+
            '<p>{{task._id}}</p>'+
              '<div class="input-field col s12">'+
                '<input id="task-name" type="text" class="validate" name="taskName" value={{name}}>'+
                '<label id="task-name-label" for="task-name" class="active">Tarefa</label>'+
              '</div>'+
              '<div class="input-field col s12 m6">'+
                '<input id="task-date" type="text" placeholder="dd/mm/aaaa" class="validate" name="taskDate" value={{date}}>'+
                '<label id="task-date-label" for="task-date" class="active">Data</label>'+
              '</div>'+
            '<div class="col s12 m6">'+
              '<button id="btn-cadastrar" class="btn waves-effect waves-light modal-close" type="submit" onclick="document.getElementById("editform").reset()">Enviar'+
                '<i class="material-icons right">send</i>'+
              '</button>'+
            '</div>'+
          '</form>',    
  replace: true}
});

