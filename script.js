// 创建悬浮播放器 GUI
const musicPlayer = document.createElement("div");
musicPlayer.id = "musicPlayer";
musicPlayer.innerHTML = `
    <div id="musicHeader">🎵 网易云音乐解析</div>
    <input type="text" id="songSearchInput" placeholder="输入网易云音乐链接">
    <button id="songSearchBtn">解析</button>
    <audio id="audioPlayer" controls></audio>
    <div id="lyricsContainer"><p id="lyrics"></p></div>
    <button id="closePlayer">✖ 关闭</button>
`;

// 添加 CSS 样式
const style = document.createElement("style");
style.innerHTML = `
    #musicPlayer {
        position: fixed;
        bottom: 20px;
        right: 20px;
        width: 320px;
        background: rgba(255, 255, 255, 0.9);
        padding: 15px;
        border-radius: 12px;
        box-shadow: 0px 4px 10px rgba(0,0,0,0.2);
        backdrop-filter: blur(10px);
        z-index: 1000;
    }
    #musicHeader {
        font-size: 18px;
        font-weight: bold;
        text-align: center;
        margin-bottom: 10px;
    }
    #songSearchInput {
        width: 80%;
        padding: 6px;
        border: 1px solid #ddd;
        border-radius: 6px;
        outline: none;
    }
    #songSearchBtn {
        background: #007BFF;
        color: white;
        border: none;
        padding: 6px 10px;
        border-radius: 6px;
        cursor: pointer;
    }
    #audioPlayer {
        width: 100%;
        margin-top: 10px;
    }
    #lyricsContainer {
        height: 100px;
        overflow: hidden;
        text-align: center;
        margin-top: 10px;
        font-size: 14px;
        color: #333;
    }
    #lyrics {
        transition: transform 0.5s ease-in-out;
    }
    #closePlayer {
        width: 100%;
        background: red;
        color: white;
        border: none;
        padding: 5px;
        cursor: pointer;
        margin-top: 10px;
    }
`;

// 追加到 HTML
document.body.appendChild(style);
document.body.appendChild(musicPlayer);

// 读取 Cookie
let developerCookie = "";
function loadCookie() {
    fetch("cookie.txt")
        .then(response => response.text())
        .then(data => {
            developerCookie = data.trim();
            console.log("成功加载 Cookie:", developerCookie);
        })
        .catch(err => console.error("无法读取 cookie.txt:", err));
}

// 解析网易云音乐并播放
function searchSong() {
    const songUrl = document.getElementById("songSearchInput").value.trim();
    if (!songUrl) {
        alert("请输入网易云音乐链接");
        return;
    }

    fetch('/Song_V1?url=' + encodeURIComponent(songUrl) + '&level=lossless&type=json', {
        headers: { 'X-Custom-Cookie': developerCookie }
    })
    .then(response => response.json())
    .then(data => {
        if (!data.url) {
            alert("解析失败：" + (data.msg || "未知错误"));
            return;
        }
        
        const audioPlayer = document.getElementById('audioPlayer');
        audioPlayer.src = data.url;
        audioPlayer.play();

        // 获取歌词
        if (data.lrc) {
            fetch(data.lrc)
                .then(response => response.text())
                .then(parseLyrics)
                .catch(err => console.error("歌词加载失败:", err));
        }
    })
    .catch(err => {
        console.error("Error fetching song data", err);
        alert("解析歌曲信息失败");
    });
}

// 解析 LRC 歌词
let lyricsArray = [];
function parseLyrics(lrcText) {
    lyricsArray = [];
    const lines = lrcText.split("\n");
    for (let line of lines) {
        const match = line.match(/(\d+):(\d+).(\d+)(.*)/);
        if (match) {
            let time = parseInt(match[1]) * 60 + parseInt(match[2]) + parseInt(match[3]) / 1000;
            lyricsArray.push({ time, text: match[4].trim() });
        }
    }
    updateLyrics();
}

// 更新歌词显示
function updateLyrics() {
    const audioPlayer = document.getElementById("audioPlayer");
    const lyricsContainer = document.getElementById("lyrics");

    audioPlayer.ontimeupdate = function () {
        let currentTime = audioPlayer.currentTime;
        let activeLyric = lyricsArray.find((lyric, index) => {
            return lyric.time <= currentTime && (index === lyricsArray.length - 1 || lyricsArray[index + 1].time > currentTime);
        });

        if (activeLyric) {
            lyricsContainer.innerText = activeLyric.text;
        }
    };
}

// 绑定事件
document.addEventListener("DOMContentLoaded", loadCookie);
document.getElementById("songSearchBtn").addEventListener("click", searchSong);
document.getElementById("closePlayer").addEventListener("click", () => {
    musicPlayer.style.display = "none";
});