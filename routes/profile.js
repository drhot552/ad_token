//로그인 모듈
module.exports = function(app,conn){
  var express = require('express');
  var router = express.Router();    //라우팅하는 능력이 있는 객체를 추출한다.

  //web3 기반
  var Web3 = require('web3');
  var web3 = new Web3(new Web3.providers.HttpProvider("http://localhost:8545"));


  router.get('/:id', function(req,res){
    //로그인 정보 ID만
    var authId = req.params.id;

    var sql ="SELECT username, email, accounts FROM ad_users WHERE authId = ?";
    conn.query(sql, [authId], function(err, users, fields){
      if(err){
        console.log(err);
        console.log("sql Error");
      }
      //계좌잔액..
      web3.eth.getBalance(users[0].accounts, function(err,result){
        if(err){
          console.log(err);
        }
        //ether로 변경 result
        var ether= web3.utils.fromWei(result,'ether');
        var bal = ether;

        res.render('profile', {authId:authId, name:users[0].username, email:users[0].email, accounts:users[0].db_accounts,
                                bal:bal});
      });
    });
  });
  return router;
};
