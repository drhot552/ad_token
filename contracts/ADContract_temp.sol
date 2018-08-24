pragma solidity ^0.4.8;

contract ADContract {

  //광고를 계약한 주소
  address public contract_address;  //계약소유자 주소
  string url;
  string subject;
  string descript;

  //광고를 통한 송금

  //광고 계약등록 -> 광고를 등록하면 계약이 실행됨
  function ADContract(address _contract_address, string _url, string _subject, string _descript) public {
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
  //송금을 이용한 contract 실행

}
