module.exports = function(app,conn){
  var express = require('express');
  var router = express.Router();    //라우팅하는 능력이 있는 객체를 추출한다.

  //web3 기반
  var Web3 = require('web3');
  var web3 = new Web3(new Web3.providers.HttpProvider("http://localhost:8545"));

  /* 스마트 컨트랙트 compile*/
  var solc = require('solc');
  var fs = require('fs'); //file 시스템
  //광고보기 -> 트랜잭션 실행 -> 계좌로 이동 광고가 끝나면 해당 이더를 자동으로 송금한다.
  router.post('/:url', function(req,res){
    var sql  = "SELECT accounts FROM ad_users WHERE authId = ?";
    //광고를 볼때 admin계좌가 해당 광고를 클릭한 계좌로 0.001이더를 송금한다.
    conn.query(sql, [authId], function(err, users, fields){
      if(err){
        console.log("(Advertise.js)SQL Select error Ad_user");
        console.log(err);
      }
      //관리자 ID를 통해 unlock시킨다.
      web3.eth.getAccounts(function(err,accounts){
        if(err){
          console.log(err);
          res.status(500).send('Internal Server Error');
        }

        //accounts
        password = 'pass0';   //일단 비밀번호 코드에 입력..
        var ether = "0.001";  //0.001이더
        //callback Function
        web3.eth.personal.unlockAccount(accounts[0], password, 600).then((response) => {
          console.log(response);
          //이더 전송
          var txHash = web3.eth.sendTransaction({
            from:accounts[0],
            to:users[0].accounts,
            // ether-> towei로 변환하여
            value:web3.utils.toWei(ether,"ether")}, function(err,transaction){
              if(err){
                console.log(err);
              }
              else {
                console.log('txHash:' + transaction);
              }
            });
        }).catch((error) => {
          console.log(error);
        });
      });
    });
  });
  //youtube 정보 체크
  router.get('/:url/:authId', function(req,res){
    //광고를 볼때 마다 이더리움을 얻음.
    var url = req.params.url;
    var authId = req.params.authId;
    var token = 100;  //100개

    //영상을 보는 중에 토큰이 올라가는 개수를 체크 즉 영상이 재생되면서 토큰의 개수는 올라간다.
    //시간당 토큰의 개수는 올라간다.
    //얻어야 될 토큰의 개수
    //광고등록자의 정보
    //사용자가 재미를 느껴야 되는 부분. 광고를 재밌게 보는방법은??
    //광고는 재밌게 봐야한다. 자신이 관심있는 광고 말고 광고를 재밌게 보기
    res.render('advertise', {url:url, authId:authId});
  });
  //광고보기 -> 트랜잭션을 실행시켜 송금시킨다.

  return router;
}
