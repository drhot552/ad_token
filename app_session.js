//express 객체생성
var express = require('express');
var session = require('express-session'); //session을 사용하기 위한 모듈
var MySQLStore = require('express-mysql-session')(session);
var app = express();
var bodyParser = require('body-parser'); //post를위한 body-parser설정

//비밀번호 암호화
var bkfd2Password = require('pbkdf2-password');
var hasher = bkfd2Password();

var mysql = require('mysql');   //db

//DB Connected
var conn = mysql.createConnection({
  host     : 'localhost',
  user     : 'root',
  password : 'alswo5293', //평문 DB Password
  database : 'block'
});
conn.connect();

app.use(bodyParser.urlencoded({ extended: false }));
//session DB 저장
//
app.use(session({
  secret: '1234123uio11242@!@#111233',
  resave: false,
  saveUninitialized: true,
  store:new MySQLStore({
    host:'localhost',
    port:3306,
    user:'root',
    password:'alswo5293', //암호형 저장
    database:'block'
  })
}));

//session을 이용한 로그인 예제..html 로그인 예제
app.get('/count', function(req,res){
  //값이 세팅되어있지 않으면 false
  if(req.session.count){
    req.session.count++;
  }
  else{
    req.session.count = 1;
  }
  res.send('HI SESSION : '+req.session.count);
});

app.get('/welcome', function(req,res){
  if(req.session.displayName){
    res.send(`
      <h2> Hello, ${req.session.displayName}</h2>
      <a href="/auth/logout">logout</a>
      `);
  }
  else{
    res.send(`
      <h1>Welcome</h1>
      <ul>
        <li><a href="/auth/login">Login</a></li>
        <li><a href="/auth/register">Register</a></li>
      </ul>
      `);
  }
  //res.send(req.session);
});
app.get('/auth/register',function(req,res){
  var output =`
  <h2> Register </h2>
  <form action="/auth/register" method="post">
    <p>
      <input type="text" name="username" placeholder="username">
    </p>
    <p>
      <input type="password" name="password" placeholder="password">
    </p>
    <p>
      <input type="text" name="displayName" placeholder="displayName">
    </p>
    <p>
      <input type="submit">
    </p>
  </form>
  `;
  res.send(output);
});
var users = [];
//mysql
app.post('/auth/register', function(req,res){
  hasher({password:req.body.password}, function(err, pass, salt, hash){
    var authId='local'+req.body.username;
    var username = req.body.username;
    var password = hash;
    var salt = salt;
    var displayName = req.body.displayName;
    console.log(salt);
    //sql 구문 ->
    var sql = 'INSERT INTO users(authId, username, password, salt, displayName) VALUES (?,?,?,?,?)';
    conn.query(sql, [authId,username,password,salt,displayName], function(err, results, fields){
      if(err){

      }
//      req.session.displayName = req.body.displayName;
      res.redirect('/welcome');
      // req.session.save(function(){
      //
      // });

    });
  });
});

//DB로 변경.. 스마트컨트랙트
app.post('/auth/login', function(req,res){
  var username = req.body.username;
  var pwd = req.body.password;
  for(var i =0; i<users.length; i++){
    var user = users[i];
    if(username == user.username){
      return hasher({password:pwd, salt:user.salt}, function(err,pass,salt,hash){
        if(hash == user.password){
          req.session.displayName = user.displayName;
          req.session.save(function(){
            res.redirect('/welcome');
          });
        }
        else {
          res.send('Who are you?? <a href="/auth/login">login</a>');
        }
      });
    }
  }
});
//인증 로그인....
app.get('/auth/login', function(req,res){
  var output = `
  <h2> Login </h2>
  <form action="/auth/login" method="post">
    <p>
      <input type="text" name="username" placeholder="username">
    </p>
    <p>
      <input type="password" name="password" placeholder="password">
    </p>
    <p>
      <input type="submit">
    </p>
  </form>
  `;
  res.send(output);
});
//로그아웃
app.get('/auth/logout', function(req,res){
  delete req.session.displayName;
  req.session.save(function(){
    res.redirect('/welcome');
  });
});
//app을 listen
app.listen(3000, function(){
  console.log('Connected session, 3000 port!');
});
