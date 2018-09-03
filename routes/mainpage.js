//로그인 모듈
module.exports = function(app,conn,abi,bytecode){
  var express = require('express');
  var router = express.Router();    //라우팅하는 능력이 있는 객체를 추출한다.

  //web3 기반
  var Web3 = require('web3');
  var web3 = new Web3(new Web3.providers.HttpProvider("http://localhost:8545"));

  /* 스마트 컨트랙트 compile*/
  var solc = require('solc');
  var fs = require('fs'); //file 시스템

  //메인페이지
  router.get(['/', '/:id'], function(req,res){
    //로그인 정보 ID만
    var authId = req.params.id;
    console.log('checkMainpage');
    //등록된 광고가 있을경우
    if(authId){
      var sql = 'SELECT tx_hash,accounts FROM ad_chain';
      //등록된 광고를 select 하기위한.. url 주소 트랜잭션 주소
      conn.query(sql, function(err, ad_chain){
        if(err){
        }
        if(ad_chain.length != 0){
          //계약한 주소 length만큼 for문
          var contract_array = [];
          for(var i =0; i < ad_chain.length;  i++)
          {
            //트랜잭션 만큼 select
            let MyContract = new web3.eth.Contract(abi, ad_chain[i].tx_hash);
            //컨트랙트 주소 -> 컨트랙트를 배포 후 계속 사용은?? (트랜잭션 주소저장 -> (DB))
            console.log("contract정보 : "+MyContract.options.address);
            //컨트랙주소를 웹화면에
            MyContract.methods.getContract().call(function(err, contract){
              if(err){
                console.log(err);
              }
              contract_array.push(contract);
              if(i == contract_array.length){
                console.log("컨트랙트길이"+contract_array.length);
                res.render('mainpage', {authId:authId, ad_contract:contract_array});
              }
            });
          }
        }
        //해당데이터가 없을경우
        else
          res.render('mainpage', {authId:authId});
      });
    }
    //ID가없을경우..
    else {
      res.render('mainpage', {authId:authId});
    }
  });
  //메인페이지 -> 광고 스마트 컨트랙트
  router.get('/advertise/:id', function(req,res){
    var authId = req.params.id;
    res.render('ad_register', {authId:authId});
  });

  //광고페이지등록 -> 광고 Geth를 이용하여 스마트 컨트랙트등록
  router.post('/advertise/:id', function(req,res){
    var authId = req.params.id;
    var url  = req.body.url;
    var subject = req.body.subject;
    var descript  = req.body.descript;

    var sql  = "SELECT accounts,id,authId FROM ad_users WHERE authId = ?";
    conn.query(sql, [authId], function(err, users,fields){
      //스마트계약할 계좌번호
      //가스량 gas 가스가격 gasprice
      if(err){
        console.log(err);
      }
      if(users.length == 0){
        console.log('No Data collection');
      }
      console.log('User Id 값 : ', users[0].id);
      let MyContract = new web3.eth.Contract(abi);

      //deploy 계좌를 unlock을 시켜야함
      //비밀번호 session에 저장 계좌를 unlock시킨다
      if(req.session.password){
        console.log(req.session.password);
        web3.eth.personal.unlockAccount(users[0].accounts.toLowerCase(), req.session.password, 600).then((response) => {
          console.log('User Account Unlock');
          var delplyContractTx = MyContract.deploy({
            data: bytecode,
            arguments:[url, subject, descript, 100000]  //토큰양 임의로 저장
          })
          .send({
            from: users[0].accounts.toLowerCase(),
            gas: 4000000,   //가스량 (일단 임의로 지정)
            gasPrice: '3000000000'//가스가격 (일단임의로 지정)
          })
          .then((instance) => {
            var address = instance.options.address;
            //스마트 컨트랙트 ad_user_id, authId, accounts, url, descript, tx_hash
            var sql = 'INSERT INTO ad_chain (ad_users_id, authId, accounts, url, descript, tx_hash) VALUES (?,?,?,?,?,?)';
            conn.query(sql, [users[0].id, users[0].authId, users[0].accounts, url, descript, address], function(err, result, fields){
              if(err){
                console.log(err);
                res.status(500).send('Internal Server Error');
              }
              //main page로 다시이동
              res.render('mainpage', {authId:users[0].authId});
            });
          });
        }).catch((error) => {
          console.log(error);
        });
      }

    });
  });
  //광고보기 -> 트랜잭션을 실행시켜 송금시킨다.

  return router;
};
