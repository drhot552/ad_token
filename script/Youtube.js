var player;
var ytplayer;
//블록체인 객체는 연결한다.
var Web3 = require('web3');
var web3 = new Web3(new Web3.providers.HttpProvider("http://localhost:8545"));


// 유튜브 플레이어를 생성한다.
function onYouTubePlayerAPIReady() {
    //
    try {
      var url = document.getElementById('url'); // 자신을 찾기위해 <script> 태그들을 찾습니다.
      var authId = document.getElementById('authId'); // 자신을 찾기위해 <script> 태그들을 찾습니다.


        player = new YT.Player('player', {
            height: '600',
            width: '1100',
            videoId: url.value,
            playerVars: {
                'autoplay': 0,  // 자동실행여부
                'controls': 1,   // 재생컨트롤 노출여부
                'autohide': 0,  // 재생컨트롤이 자동으로 사라질지의 여부
                'rel': 0,          // 동영상 재생완료 후 유사동영상 노출여부
                'wmode': 'transparent'
            },
            events: {
                'onReady': onPlayerReady,
                'onStateChange': onPlayerStateChange
            }
        });
    }
    catch (e) {
    }
}
// 유튜브 플레이어가 다 만들어지면 호출됨
function onPlayerReady(event) {
    // 자동으로 플레이하는 코드로 위에서 autoplay: 0으로 하였으므로 주석처리
    ytplayer = document.getElementById("player");
    console.log(ytplayer.getDuration());
    //event.target.playVideo();
}

// 동영상의 재생이 완료되었을 때 호출됨
function onPlayerStateChange(event) {
  if (event.data == YT.PlayerState.PLAYING) {
      //event.target.setPlaybackQuality('hd720');
  }
  if (event.data === 0) {
      //해당 프로그램이 종료 됬을 때
      //영상이 다끝나면 트랜잭션을 실행시켜 해당 계좌에 입금히시킨다. 이더리움
      
      //여기서 트랜랙션을 실행
      //트랜잭션 컴파일.
      alert(event.target.getVideoUrl());
  }
}
