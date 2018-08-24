//express 객체생성
var express = require('express');
var app = express();
var bodyParser = require('body-parser'); //post를위한 body-parser설정
var mysql = require('mysql');   //db

//session
var session = require('express-session'); //session을 사용하기 위한 모듈
var MySQLStore = require('express-mysql-session')(session); //session연결


var conn = mysql.createConnection({
  host     : 'localhost',
  user     : 'root',
  password : 'alswo5293',
  database : 'block'
});
conn.connect();


//router
var login = require('./routes/login')(app,conn);
var mainpage = require('./routes/mainpage')(app,conn);
var register = require('./routes/register')(app,conn);
var profile  = require('./routes/profile')(app,conn);
var advertise  = require('./routes/advertise')(app,conn);


app.set('views', './views');
app.set('view engine', 'ejs'); //jade

//메인홈페이지
app.get('/main', function(req,res){
  res.render('main');
});
//CSS 관련
app.use('/css', express.static(__dirname + '/node_modules/bootstrap/dist/css'));
app.use('/js', express.static(__dirname + '/node_modules/bootstrap/dist/js'));
app.use(bodyParser.urlencoded({ extended: false }));

/* 앱 라우터 */
app.use('/login', login);
app.use('/mainpage', mainpage);
app.use('/register', register);
app.use('/profile', profile);
app.use('/advertise', advertise);



//app을 listen
app.listen(4000, function(){
  console.log('Connected memo, 4000 port!');
});
