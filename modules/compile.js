//abi 컴파일을 위한 모듈생성
var solc = require('solc');
var fs = require('fs'); //file 시스템

let source = fs.readFileSync("./contracts/ADContract.sol", 'utf8');
console.log('transaction...compiling contract .....');
//컨트랙 컴파일이 오래걸림
let compiledContract = solc.compile(source); //compile 너무오래걸림.. 이걸 어떻게 해야되지.
console.log('done!!');
//compile

module.exports.abi = function(){
  //contract compile
  //filesystem
  var abi = ''; //contract json파일로
  for (let contractName in compiledContract.contracts) {
      // code and ABI that are needed by web3
      abi = JSON.parse(compiledContract.contracts[contractName].interface);
      console.log(abi);
      // contjson파일을 저장
  }
  return abi;
}
//abi 컴파일을 위한 모듈생성
module.exports.bytecode = function(){
  var bytecode = '';
  for (let contractName in compiledContract.contracts) {
      // code and ABI that are needed by web3
      bytecode = compiledContract.contracts[contractName].bytecode; //컨트랙트 생성시 바이트코드로 등록
      // contjson파일을 저장
  }
  return bytecode;
}
