var express = require('express');
const app = express();
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
var Schema = mongoose.Schema;
var ObjectId = Schema.ObjectId;

app.use(bodyParser.urlencoded({extended:true}));
app.use(bodyParser.json());

var User = new Schema({
    name:String,
    email:String,
    provider:String
});
var Task = new Schema({
    user:String,
    title:String,
    date:Date,
    completed:{Boolean, default:false}
});
var users = mongoose.model('users', User);
var tasks = mongoose.model('tasks', Task);

app.use(express.static('public'));

mongoose.connect('mongodb://thiago:12345@ds161059.mlab.com:61059/dolt_data',function(err){
    if (err) return console.log(err)
    app.listen(3000, function(){
        console.log('listening 3000');
    })
});


app.get('/',(req,res)=>{
  res.sendFile(__dirname+'/views/index.html');
})

app.get('/login', (req,res)=>{
  res.sendFile(__dirname+'/views/login.html');
})

app.post('/', (req,res)=>{
    console.log(req.body);
})

