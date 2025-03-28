document.getElementById('songSearchBtn').addEventListener('click', function(){
  const songUrl = document.getElementById('songSearchInput').value.trim();
  if(!songUrl){
    alert("请输入网易云音乐链接");
    return;
  }
  // 先获取 cookie 信息
  fetch('/get_cookie')
    .then(response => response.json())
    .then(cookieData => {
      const cookieStr = cookieData.cookie;
      // 发送歌曲解析请求时，将 cookie 作为自定义请求头传递
      fetch('/Song_V1?url=' + encodeURIComponent(songUrl) + '&level=lossless&type=json', {
        headers: {
          'X-Custom-Cookie': cookieStr
        }
      })
      .then(response => response.json())
      .then(data => {
         if(data.status && data.status !== 200){
            alert("解析失败：" + (data.msg || "未知错误"));
            return;
         }
         // 更新播放器界面：音频地址、封面、歌曲信息及歌词
         const audioPlayer = document.getElementById('audioPlayer');
         const cdCover = document.getElementById('cdCover');
         audioPlayer.src = data.url;
         cdCover.src = data.pic;
         document.getElementById('songInfo').innerHTML = data.name + " - " + data.ar_name + "<br>" + data.al_name + " (" + data.level + ", " + data.size + ")";
         document.getElementById('lyricDisplay').textContent = data.lyric;
         audioPlayer.play();
         document.getElementById('playPauseBtn').querySelector('img').src = "https://example.com/images/stop.jpg";
         document.getElementById('cd').classList.add('rotating');
      })
      .catch(err => {
          console.error("Error fetching song data", err);
          alert("解析歌曲信息失败");
      });
    })
    .catch(err => {
      console.error("获取 cookie 信息失败", err);
      alert("无法获取 cookie 信息");
    });
});