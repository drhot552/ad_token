off//로그인 모듈
module.exports = function(app,conn,abi,bytecode){
  var express = require('express');
  var router = express.Router();    //라우팅하는 능력이 있는 객체를 추출한다.

  //web3 기반
  var Web3 = require('web3');
  var web3 = new Web3(new Web3.providers.HttpProvider("http://localhost:8545"));

  /* 스마트 컨트랙트 compile*/
  var solc = require('solc');
  var fs = require('fs'); //file 시스템
  //광고를 다보면 메인페이지로 돌아간다.
  //메인페이지
  router.get(['/:id'], function(req,res){
    //로그인 정보 ID만
    var authId = req.params.id;
    console.log('checkMainpage');
    //등록된 광고가 있을경우
    if(authId){
      var sql = 'SELECT tx_hash,accounts FROM ad_chain WHERE ';
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
  return router;
}
