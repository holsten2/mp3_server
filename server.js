// Get the packages we need
var express = require('express');
var mongoose = require('mongoose');
//var Llama = require('./models/llama');
var Task = require('./models/tasks');
var User = require('./models/users');
var bodyParser = require('body-parser');
var router = express.Router();

//replace this with your Mongolab URL
mongoose.connect('mongodb://holsten2:498server@ds031681.mongolab.com:31681/mp3_database');

// Create our Express application
var app = express();

// Use environment defined port or 4000
var port = process.env.PORT || 4000;

//Allow CORS so that backend and frontend could pe put on different servers
var allowCrossDomain = function(req, res, next) {
    res.header("Access-Control-Allow-Origin", "*");
    res.header("Access-Control-Allow-Headers", "X-Requested-With, X-HTTP-Method-Override, Content-Type, Accept");
    res.header("Access-Control-Allow-Methods", "POST, GET, OPTIONS, PUT, DELETE");
  next();
};
app.use(allowCrossDomain);

// Use the body-parser package in our application
app.use(bodyParser.urlencoded({
  extended: true
}));

// All our routes will start with /api
app.use('/api', router);

//Default route here
var homeRoute = router.route('/');

homeRoute.get(function(req, res) {
  res.json({ message: 'Hello World!' });
});

//Llama route 
//var llamaRoute = router.route('/llamas');
//llamaRoute.get(function(req, res) {
//  res.json([{ "name": "alice", "height": 12 }, { "name": "jane", "height": 13 }]);
//});


//users route
var UsersRoute = router.route('/users');
UsersRoute.get(function(req, res){
    var where = req.query.where;
    var sort = req.query.sort;
    var select = req.query.select;
    var skip = req.query.skip;
    var limit = req.query.limit;
    var count = req.query.count;

    var returned_users = {};
    var options = {};
    var selected = "";

    if(where){
        where = JSON.parse(where);
        returned_users = where;
    }
    if(sort){
        sort = JSON.parse(sort);
        options['sort'] = sort;

    }
    if(select){
        select = JSON.parse(select);

        for (var key in select) {
            var val = select[key];
            if (val == 1) {

                selected += " " + key;
            }
            if (val == 0) {
                selected += " -" + key;
            }
        }

    }
    if(skip){
        skip = JSON.parse(sort);
        options['skip'] = skip
    }
    if(limit){
        limit = JSON.parse(limit);
        options['limit'] = limit;

    }

    if(count){
        User.find(returned_users, selected, options).count(function (err, users) {
            if(err){
                res.status(500).json({message: "Error in getting all users", data: err});
            }
            else{
                res.status(200).json({message: "Successfully counted users in query", data: users});
            }
        });
    }

    else{
        User.find(returned_users, selected, options, function (err, users) {
            if(err){
                res.status(500).json({message: "Error in getting all users", data: err});
            }
            else{
                res.status(200).json({message: "Successfully found  users in query", data: users});
            }
        });
    }



});

UsersRoute.post(function(req, res){

    var new_user = new User(req.body);

    new_user.dateCreated = Date.now();
    if(new_user.pendingTasks == undefined){
        new_user.pendingTasks = [];
    }

    new_user.save(function(err){
        if(err){
            res.status(500).json({message: "Error in creating new user", data: err});

        }
        else{
            res.status(201).json({message: "Successfully created new user", data: new_user});

        }
    });

});

UsersRoute.options(function(req, res){
    res.writeHead(200);
    res.end();
});

//single user route ---------------------------------------------------------
var singleUserRoute = router.route('/users/:user_id');
singleUserRoute.get(function(req, res){
    var user_id = req.params.user_id;

    User.find({'_id': user_id}, function(err, user) {
        if(err){
            res.status(404).json({message: "Cannot find user", data: err });

        }
        else if(user.length == 0){
            res.status(404).json({message: "Cannot find the user with id", data: user_id });
        }
        else{
            res.status(200).json({message: "Found user", data: user });

        }
    });


});

singleUserRoute.put(function(req, res){
    var user_id = req.params.user_id;
    var new_info = req.body;
    if(new_info.pendingTasks == undefined){
        new_info.pendingTasks = [];
    }

    User.update({ '_id': user_id }, { $set : new_info }, function(err, found) {
        if(err){
            res.status(404).json({message: "Cannot update the user with data", data: new_info });

        }
        else if(found == 0){
            res.status(404).json({message: "Cannot find the user with id", data: user_id });
        }
        else{
            res.status(200).json({message: "Successfully updated User", data: ""});

        }
    });

});

singleUserRoute.delete(function(req, res){
    var user_id = req.params.user_id;

    User.findByIdAndRemove(user_id, function(err, found) {
        if (err) {
            res.status(404).json({message: "Cannot delete the user", data: user_id });
        }
        else if(found == null){
            res.status(404).json({message: "Cannot find the user with id", data: user_id });
        }
        else{
            res.status(200).json({message: "Successfully deleted user", data: user_id});
        }
    });

});


//tasks route --------------------------------------------------------------
var TaskRoute = router.route('/tasks');
TaskRoute.get(function(req, res){

    var where = req.query.where;
    var sort = req.query.sort;
    var select = req.query.select;
    var skip = req.query.skip;
    var limit = req.query.limit;
    var count = req.query.count;

    var returned_tasks = {};
    var options = {};
    var selected = "";

    if(where){
        where = JSON.parse(where);
        returned_tasks = where;
    }
    if(sort){
        sort = JSON.parse(sort);
        options['sort'] = sort;

    }
    if(select){
        select = JSON.parse(select);

        for (var key in select) {
            var val = select[key];
            if (val == 1) {

                selected += " " + key;
            }
            if (val == 0) {
                selected += " -" + key;
            }
        }

    }
    if(skip){
        options['skip'] = skip
    }
    if(limit){
        limit = JSON.parse(limit);
        options['limit'] = limit;

    }

    if(count){
        Task.find(returned_tasks).count(function (err, tasks) {
            if(err){
                res.status(500).json({message: "Error in getting all tasks", data: err});
            }
            else{
                res.status(200).json({message: "Successfully counted tasks in query", data: tasks});
            }
        });
    }

    else{
        Task.find(returned_tasks, selected, options, function (err, tasks) {
            if(err){
                res.status(500).json({message: "Error in getting all tasks", data: err});
            }
            else{
                res.status(200).json({message: "Successfully found  tasks in query", data: tasks});
            }
        });
    }

});

TaskRoute.post(function(req, res){
    var new_task = new Task(req.body);

    new_task.save(function(err){
        if(err){
            res.status(500).json({message: "Error in creating new task", data: err});

        }
        else{
            res.status(201).json({message: "Successfully created new task", data: new_task});

        }
    });


});

TaskRoute.options(function(req, res){
    res.writeHead(200);
    res.end();
});


//single task route ---------------------------------------------------------
var singleTaskRoute = router.route('/tasks/:task_id');
singleTaskRoute.get(function(req, res){
    var task_id = req.params.task_id;

    Task.find({'_id': task_id}, function(err, task) {
        if(err){
            res.status(404).json({message: "Cannot find task", data: err });

        }
        else if(task.length == 0 ){
            res.status(404).json({message: "Cannot find the task with id", data: task_id });
        }
        else{
            res.status(200).json({message: "Found task", data: task });
        }
    });

});

singleTaskRoute.put(function(req, res){
    var task_id = req.params.task_id;
    var new_info = req.body;

    Task.update({ '_id': task_id }, { $set : new_info }, function(err, found) {
        if(err){
            res.status(404).json({message: "Cannot update the task with data", data: new_info });

        }
        else if(found == 0){
            res.status(404).json({message: "Cannot find the task with data", data: task_id });
        }
        else{
            res.status(200).json({message: "Successfully updated task", data: ""});

        }
    });

});

singleTaskRoute.delete(function(req, res){
    var task_id = req.params.task_id;

    Task.findByIdAndRemove(task_id, function(err, found) {
        if (err) {
            res.status(404).json({message: "Unable to delete the task", data: task_id });
        }
        else if(found == null){
            res.status(404).json({message: "Cannot find the task with id", data: task_id });
        }
        else{
            res.status(200).json({message: "Successfully deleted task", data: task_id});
        }
    });

});



// Start the server
app.listen(port);
console.log('Server running on port ' + port); 