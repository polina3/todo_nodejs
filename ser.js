const express = require('express');
var app=express();
const server=require('http').createServer(app);
const mysql = require("mysql2");
const session = require('express-session');
const bodyParser = require("body-parser");
const io = require('socket.io').listen(server);
const fs = require('fs');

const conf=JSON.parse(fs.readFileSync('config.json'));


var l="";
var tasks_user="";
app.use(bodyParser.json())
app.use(bodyParser.urlencoded({ extended: true }));

const connection = mysql.createConnection({
	host: conf.connectionBD.host,
	user: conf.connectionBD.user,
	database: conf.connectionBD.database,
	password: conf.connectionBD.password
  });
connection.connect(function(err){
    if (err) {
      return console.error("Ошибка: " + err.message);
    }
    else{
      console.log("Подключение к серверу MySQL успешно установлено");
    }
 });

app.use("/static",express.static('static'));
app.set("view engine", "pug");
server.listen(process.env.PORT || conf.port);

app.use(session({
    key: 'application.sid',
    secret: 'some.secret.string',
    cookie: {
        maxAge: 60 * 60 * 1000,
        expires: 60 * 60 * 1000
    },
    saveUninitialized: true,
    rolling: true,
    resave: true,
    secure: true
}));
const AV = (req, res, next) => {
  if (req.session.login='' || req.session.login) {
      l=req.session.login.substring(0, req.session.login.length - 1);
      return next();
  } 
 else{
  l="";
  req.session.login='';
  res.redirect('/');
 }
 
};
const AV_M=(req, res, next)=>{
  if(req.session.login[req.session.login.length-1]!=1){
    l="";
    req.session.login='';
    res.redirect('/');
  }
  return next();
}
const AV_U=(req, res, next)=>{
  if(req.session.login[req.session.login.length-1]!=0){
    l="";
    req.session.login='';
    res.redirect('/');
  }
  return next();
}
app.get("/",(req,res)=>{
	res.render('index',{});
})
app.post("/",(req,res)=>{
  rez=[req.body.login,req.body.password];
  connection.query(conf.qBD.q,rez,
    function(err, results) {
      if(err){
        console.log(err);
        return res.render('index',{data:"error"});
      }
      console.log(results); 
      const users = results;
      if(results.length==0){
        return res.render('index',{data:"Непрвильный логин или пароль"});
      }
      req.session.login=users[0].login+users[0].root;
      if(users[0].root==1){
        return res.redirect('/m');
      }
      else{
        return res.redirect('/u');
        
      }    
    });
  })
app.get("/u",AV,AV_U,(req,res)=>{
  res.render('user',{login:req.session.login.substring(0, req.session.login.length - 1)})
})
app.get("/m",AV,AV_M,(req,res)=>{
  res.render('manager',{login:req.session.login.substring(0, req.session.login.length - 1)})
})


io.on('connection', function(socket){ 
  var room="room-"+l;
  socket.join(room);

  socket.on('start_u',()=>{
    connection.query(conf.qBD.task_user,l,(err, results)=>{
      if(err){
        console.log(err);
        return io.sockets.in(room).emit('q',{rez:'error'})
      }
      tasks_user=results;
      return io.sockets.in(room).emit('q',{rez:results});
    });
  });
  socket.on('start_m',()=>{
    console.log(l);
    connection.query(conf.qBD.task_manager,(err, results)=>{
      if(err){
        console.log(err);
        return io.sockets.in(room).emit('q',{rez:results});  
      }
      tasks_user=results;
      console.log(results); 
      return io.sockets.in(room).emit('q',{rez:results});
    })
  });
  socket.on('remove',function(data) {
    console.log(data);
		connection.query(conf.qBD.rem_user,data,(err)=>{
      if(err){
        console.log(err);
        return
      }
      else console.log("+");
    })
  });
  
  socket.on('adding',function(data) {
    var adding_task="INSERT INTO `tasks` (`id`, `tasks_name`, `data_start`, `data_end`, `executor`, `description`, `done`) VALUES ("+data[0]+",'"+data[1]+"','"+data[2]+"','"+data[3]+"','"+data[4]+"','"+data[5]+"','"+data[6]+"')";
    console.log(adding_task);
    console.log(data);
		connection.query(adding_task,(err)=>{
      if(err){
        console.log(err);
        return
      }
      else console.log("+");
    })
  });
  socket.on('reg',(data)=>{
    console.log(data);
    let reg_query="INSERT INTO `user`(`login`, `password`, `root`) VALUES (?,?,?)";
    connection.query(reg_query,data,(err)=>{
      if(err){
        console.log(err);
        return;
      }
      else console.log("+");
    })
  });
})