module.exports = function(app,conn, abi){
  var express = require('express');
  var router = express.Router();    //라우팅하는 능력이 있는 객체를 추출한다.

  //web3 기반
  var Web3 = require('web3');
  var web3 = new Web3(new Web3.providers.HttpProvider("http://localhost:8545"));

  /* 스마트 컨트랙트 compile*/
  var solc = require('solc');
  var fs = require('fs'); //file 시스템
  //유투브 동영상 체크
  var Youtube = require('youtube-node');
  var fetchVideoInfo = require('youtube-info');
  var youtube = new Youtube();



  //유투브 발급키 설정
  youtube.setKey('AIzaSyDnZc-S-lHFV3tjMDOFSFnr172TvqUWHec');

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

  //해당 광고 체크
  //youtube 정보 체크
  router.get('/:url/:authId', function(req,res){
    //광고를 볼때 마다 이더리움을 얻음.
    var url = req.params.url;
    var authId = req.params.authId;
    var time = 0;
    //유투브 정보를 준다 유투브 API로 개발 -> ./script/Youtube.js
    fetchVideoInfo(url).then(function (videoInfo) {
        time = parseInt(videoInfo .duration) * 1000;  //밀리단위로 저장
        console.log("(Advertise.js) Time Check" + time);
        //callback 실행이 다되면 송금한다.
        const timeoutObj = setTimeout(() => {

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
                res.status(500).send('(Advertise.js) Block Internal Server Error');
              }
              //accounts
              password = "pass0";   //일단 비밀번호 코드에 입력..
              var ether = "10";  //10이더
              //callback Function
              web3.eth.personal.unlockAccount(accounts[0], password, 600).then((response) => {
                console.log(response);
                //이더 전송
                var txHash = web3.eth.sendTransaction({
                  from:accounts[0],
                  to:users[0].accounts,
                  // ether-> towei로 변환하여
                  value:web3.utils.toWei(ether,"ether")
                 }, function(err,transaction){
                    if(err){
                      console.log(err);
                    }
                    else {
                      //트랜잭션코드
                      console.log('txHash:' + transaction);
                      res.render('mainpage', {authId:authId});
                    }
                  });
              }).catch((error) => {
                console.log(error);
              });
            });
          });
          console.log('(Advertise.js)광고토큰 타임체크아웃');
        }, time);
    });

    res.render('advertise', {url:url, authId:authId});
  });

  //광고보기 -> 트랜잭션을 실행시켜 송금시킨다.
  return router;
}
