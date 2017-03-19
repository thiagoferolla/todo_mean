var express = require('express');
const app = express();
const mongoose = require('mongoose');
var Schema = mongoose.Schema;
var ObjectId = Schema.ObjectId;
var passport = require('passport'), FacebookStrategy = require('passport-facebook').Strategy;
var GoogleStrategy = require('passport-google-oauth').OAuth2Strategy;
var morgan       = require('morgan');
var cookieParser = require('cookie-parser');
var session      = require('express-session');
var flash    = require('connect-flash');
var bodyParser = require('body-parser');
var port = process.env.PORT || 3000;

app.use(express.static('public'));
app.use(morgan('dev'));
app.use(cookieParser());
app.use(flash());
app.use(session({secret:'secrettext'}))
app.use(passport.initialize());
app.use(passport.session());
app.use(bodyParser.urlencoded({ extended: false }))
app.use(bodyParser.json())


var User = new Schema({
    provider: String,
    providerUserId: String,
    picture: String,
    accesstoken: String,
    name:String,
    email:{type: String, required:true},
    dateAdded: {type: Date, default: Date.now()}
});

var Task = new Schema({
    user:String,
    name:String,
    date:String,
    completed:{type: Boolean, default:false}
});
var users = mongoose.model('users', User);
var tasks = mongoose.model('tasks', Task);


passport.serializeUser(function(user, done) {
    done(null, user._id);
});

passport.deserializeUser(function(id, done) {
    users.findById(id, function(err, user) {
        done(err, user);
    });
});

passport.use('facebook', new FacebookStrategy({
  clientID        : "830259470446804",
  clientSecret    : "413d3c3f5bc723a013a6db18791fc6e3",
  callbackURL     : "https://dolt.herokuapp.com/login/facebook/callback",
  profileFields: ['id', 'email', 'displayName', 'photos']
},
  function(access_token, refresh_token, profile, done) {
    process.nextTick(function() {
      users.findOne({ 'providerUserId' : profile.id }, function(err, user) {
        if (err)
          return done(err);
          if (user) {
              user.picture = profile.photos[0].value;
              user.name = profile.displayName;
              user.save()
            return done(null, user);
          } else {
            var newUser = new users();
            newUser.provider = "facebook";
            newUser.providerUserId = profile.id;
            newUser.picture = profile.photos[0].value;
            newUser.access_token = access_token;            
            newUser.name  = profile.displayName;
            newUser.email = profile.emails[0].value;

            newUser.save(function(err) {
              if (err)
                throw err;
              return done(null, newUser);
            });
         } 
      });
    });
}));

passport.use(new GoogleStrategy({
    clientID  : "704799159103-kt6c8f06hc0ga6a65ulbcq9pp5p48g2v.apps.googleusercontent.com",
    clientSecret  : "347uh9K5dh4aSt9X2YJry-9N",
    callbackURL  : "https://dolt.herokuapp.com/login/google/callback"
}, function(access_token, refresh_token, profile, done){
    process.nextTick(function(){
        users.findOne({'providerUserId': profile.id}, function(err, user){
            if (err)
                return done(err);
                if (user) {
                    return done(null, user);
                } else {
                    var newUser = new users();
                    newUser.provider = "google";
                    newUser.providerUserId = profile.id;
                    newUser.access_token = access_token;
                    newUser.name = profile.displayName;
                    newUser.email = profile.emails[0].value;

                    newUser.save(function(err){
                        if (err)
                            throw err;
                        return done(null, newUser);
                    })
                }
        })
    })
}) )

mongoose.connect('mongodb://thiago:12345@ds161059.mlab.com:61059/dolt_data',function(err){
    if (err) return console.log(err)
    const server = app.listen(port, function(){
        console.log('listening '+port);
    })

});

function isLoggedIn(req, res, next) {
    if (req.isAuthenticated())
        return next();
    res.redirect('/login');
}

app.get('/login',(req,res)=>{
  res.sendFile(__dirname+'/views/login.html');
})

app.post('/api/newtask', (req,res)=>{
    var task = new tasks({user:req.user._id ,name:req.body.name, date:req.body.date, completed:false}).save(function(err){
        if (err) throw err;
        console.log('task saved');
    });
})

app.get('/login/facebook', passport.authenticate('facebook', {scope:'email'}
));

app.get('/login/facebook/callback',
  passport.authenticate('facebook', {
    successRedirect : '/',
    failureRedirect : '/login',
    scope:['email']
  })
);

app.get('/', isLoggedIn,function(req, res){
    res.sendFile(__dirname+'/views/index.html');
})

app.get('/login/google',
  passport.authenticate('google', { scope: ['profile', 'email'] }));

app.get('/login/google/callback',
  passport.authenticate('google', {
    successRedirect : '/',
    failureRedirect : '/login',
    scope:['profile', 'email']
  })
);

app.get('/logout', function(req, res){
  req.logout();
  res.redirect('/');
});

app.get('/api/pendingtasks', function(req, res){
    tasks.find({'user':req.user._id, 'completed':false},'_id name date').limit(5).sort({date: 1}).exec(function(err, task){
        if (err)
            throw (err)
        return res.end(JSON.stringify(task));
    });
;});

app.get('/api/completedtasks', function(req, res){
    tasks.find({'user':req.user._id, 'completed':true},'_id name date').limit(5).sort({date: 1}).exec(function(err, task){
        if (err)
            throw (err)
        return res.end(JSON.stringify(task))
    })
});

app.put('/api/tasks', function(req,res){
    var task = tasks.findOne({_id:req.body.id})
    tasks.findById(req.body.id, function(err, task){
        if (err){
            res.status(500).send(err)}
        else {
            task.completed = req.body.completed;
            task.save(function(err, task){
                if (err){
                    res.status(500).send(err);
                }
                else{
                    res.send(task);
                }
            })
        }
    });
})

app.delete('/api/deletetasks/:id', function(req, res){
    console.log(true);
    tasks.findOneAndRemove({_id:req.params.id}).then(function(err){
        if (err) return console.log(err)
        console.log("task deleted");
    });
});

app.get('/api/user', function (req, res){
    users.findOne({_id:req.user._id}).exec(function(err, usuario){
        res.end(JSON.stringify(usuario));
    })
})