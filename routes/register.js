//로그인 모듈
module.exports = function(app,conn){
  var express = require('express');
  var router = express.Router();    //라우팅하는 능력이 있는 객체를 추출한다.

  //BlockChain(Private net)
  var Web3 = require('web3');
  var web3 = new Web3(new Web3.providers.HttpProvider("http://localhost:8545"));
  //비밀번호
  var bkfd2Password = require('pbkdf2-password'); //비밀번호 암호화
  var hasher = bkfd2Password(); //비밀번호 해쉬


  //라우터
  router.get('/', function(req,res){
    res.render('register');
  });
  //post 방식 등록
  router.post('/', function(req,res){
    hasher({password:req.body.password}, function(err, pass, salt, hash){
      var authid = req.body.id;
      var password = hash;
      var salt = salt;
      var email = req.body.email;
      var name = req.body.name;
      if(req.body.password){
        req.session.password = req.body.passowrd; //패스워드
        var account = web3.eth.personal.newAccount(req.session.password, function(err,account){
            if(err){
              console.log("(Regsiter)Ethereum new account Generate!!"+err);
              console.log(err);
            }
            var sql = 'INSERT INTO ad_users(authId, accounts, username, password, salt, displayName, email) VALUES (?,?,?,?,?,?,?)';
            conn.query(sql, [authid,account,name,password,salt,name,email], function(err, results, fields){
              if(err){
                console.log("(Regsiter)SQL Insert error Ad_user");
                console.log(err);
              }
              res.render('login');
          });
        });

      }
      else{
        //알림으로 설정 변경
        console.log('(register.js) 비밀번호를 입력하세요.');
      }
    });
  });

  return router;
};
