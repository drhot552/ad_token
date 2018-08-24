pragma solidity ^0.4.8;

contract ADContract {

  //광고를 계약한 주소
  address public contract_address;  //계약소유자 주소
  string url;
  string subject;
  string descript;

  //계좌잔액
  mapping (address => uint) public balanceOf; //계좌잔액

  //광고를 통한 송금
  //광고 계약등록 -> 광고를 등록하면 계약이 실행됨
  function ADContract(address _contract_address, string _url, string _subject, string _descript) public {
      balanceOf[msg.sender] = msg.value;  //해당 계약한 주소에 이더의 개수를 저장한다.
      contract_address = _contract_address;
      url = _url;
      subject = _subject;
      descript = _descript;
  }
  //스마트 컨트랙트를 통한광고 각각의 정보 얻기
  function getURL() returns (string){
      return url;
  }
  function getSubejct() returns (string){
      return subject;
  }
  function getDescript() returns (string){
      return descript;
  }
  //계약리스트 얻기
  function getContract() returns (string, string, string)
  {
    return (url, subject, descript);
  }
  //송금을 이용한 contract 실행 트랜잭션 실행
  function transfer(address _to, uint _value) payable {
    //계약을 등록한 contract주소 잔액을 감소시키고 해당 등록한 사용자의 contract의 잔액이 증가한다.
    balanceOf[contract_address] -= _value;
    balanceOf[_to]  += _value;  //해당 광고를 본 사람에게는 잔액이 증가한다.
  }
  //자신의 현재 토큰 광고를 등록했던 잔액을 나타낸다. 각토큰의 개수 -> 자신의 토큰개수를 알수 있다.
  function getBalnace(address _account) constant returns(uint){
      return balanceOf[_account];
  }
  //자신의 부족한 토큰을 이더리움으로 채운다.
  function deposit(address _from, uint _value){
    balanceOf[_from] += _value;
  }
}
