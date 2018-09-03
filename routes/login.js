//로그인 모듈
module.exports = function(app,conn, abi){
  var express = require('express');
  var router = express.Router();    //라우팅하는 능력이 있는 객체를 추출한다.

  //BlockChain(local net)
  var Web3 = require('web3');
  var web3 = new Web3(new Web3.providers.HttpProvider("http://localhost:8545"));

  //비밀번호
  var bkfd2Password = require('pbkdf2-password'); //비밀번호 암호화
  var hasher = bkfd2Password(); //비밀번호 해쉬

  var solc = require('solc');
  var fs = require('fs'); //file 시스템

  //비동기방식
  var async = require('async');
  //세션연결


  //get 방식일 경우 -> login
  router.get('/', function(req,res){
    res.render('login');
  });
  router.post('/', function(req,res){
    //account기반 체크
    var id = req.body.id;
    var password = req.body.password; //한번로그인하면 해당 로그인 세션은 유지시킨다.
    var sql = 'SELECT authId, accounts, password, salt, username, email FROM ad_users WHERE authid = ?';
    conn.query(sql, [id], function(err, db_accounts){
      //id하고 password가 맞을경우 account 계좌를 탐색한다. 그렇지 않으면 탐색하지 않는다.
      if(err){
        console.log(err);
        res.status(500).send('DB Internal Server Error');
      }
      if(db_accounts.length == 0){
        console.log('(login.js)ID가 존재하지 않습니다.');
        //res.render('register'); //없으면 Register
      }
      // hash를 이용하여 비밀번호를 암호화 한다.
      else {
        return hasher({password:password, salt:db_accounts[0].salt}, function(err,pass,salt,hash){
            if(hash == db_accounts[0].password){
              //있으면 블록체인에서 계좌를 찾는다. Call back Function
              web3.eth.getAccounts(function(err,accounts){
                if(err){
                  console.log('(login.js)이더리움블록체인 계좌검색오류');
                }
                for(var i=0; i<accounts.length; i++){
                  if(accounts[i].toLowerCase() == db_accounts[0].accounts.toLowerCase())
                  {
                    //로그인 성공
                    //req session에 저장
                    req.session.id = id;
                    req.session.password = password;


                    console.log("(login.js)세션로그이확인" + req.session.password + req.session.accounts);
                    console.log("(login.js)사용자계좌 "+accounts[i]);
                    //메인홈페이지로 이동..
                    console.log("(login.js)사용자ID "+db_accounts[0].authId);
                    web3.eth.getBalance(db_accounts[0].accounts, function(err,result){
                      if(err){
                        console.log(err);
                      }
                      //광고확인
                      var sql = 'SELECT tx_hash,accounts FROM ad_chain';
                      //모든 광고를 보여준다.
                      conn.query(sql, function(err, ad_chain){
                      //광고가 있을경우
                      if(ad_chain.length != 0)
                      {

                        //배열로 넣기.
                        var contract_array = [];
                        for(var i =0; i < ad_chain.length;  i++)
                        {
                          //트랜잭션 만큼 select
                          let MyContract = new web3.eth.Contract(abi, ad_chain[i].tx_hash);
                          //컨트랙트 주소 -> 컨트랙트를 배포 후 계속 사용은?? (트랜잭션 주소저장 -> (DB))
                          console.log("contract정보 : "+MyContract.options.address);
                          //컨트랙주소를 웹화면에
                          MyContract.methods.getContract().call(function(err, contract){
                            if(err){}
                            contract_array.push(contract);
                            if(i == contract_array.length){
                              console.log("컨트랙트길이"+contract_array.length);
                              res.render('mainpage', {authId:db_accounts[0].authId, ad_contract:contract_array});
                            }

                          });
                        }
                      }
                      else{
                        res.render('mainpage', {authId:db_accounts[0].authId});
                      }
                    }); //sql Query

                  }); //account bal
                } //비밀번호 확인
              } //계좌 For문
              });
            }
        });
      } // 로그인 내역이 있으면
    });
  });
  //등록하면 profile로
  router.post('/profile', function(req,res){

  });

  return router;
};
