console.log('Lets Write Javascript');
let currentSong = new Audio();
let songs = [];
let currentFolder = "NCS"; // default folder

function secondsToMinutesSeconds(seconds) {
    if (isNaN(seconds) || seconds < 0) return "00:00";
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = Math.floor(seconds % 60);
    return `${String(minutes).padStart(2, '0')}:${String(remainingSeconds).padStart(2, '0')}`;
}

async function getSongs(folder = "NCS") {
    currentFolder = folder;
    let a = await fetch(`/songs/${folder}`);
    let response = await a.text();
    let div = document.createElement("div");
    div.innerHTML = response;

    let as = div.getElementsByTagName("a");
    songs = [];

    for (let element of as) {
        if (element.href.endsWith(".mp3")) {
            songs.push(element.href.split(`/songs/${folder}/`)[1]);
        }
    }

    let songUL = document.querySelector(".songList ul");
    songUL.innerHTML = ""; // clear old songs

    for (const song of songs) {
        songUL.innerHTML += `
            <li>
                <img class="invert" src="music.svg" alt="" />
                <div class="info">
                    <div>${decodeURIComponent(song.split("/").pop())}</div>
                    <div>Arpan</div>
                </div>
                <div class="playnow">
                    <span>Play Now</span>
                    <img class="playbuttons invert" src="play.svg" alt="">
                </div>
            </li>`;
    }

    // Attach event listeners to new songs
    Array.from(document.querySelectorAll(".songList li")).forEach(li => {
        li.addEventListener("click", () => {
            let trackName = li.querySelector(".info div").innerText.trim();
            playMusic(trackName);
        });
    });
}

function playMusic(track, pause = false) {
    currentSong.src = `/songs/${currentFolder}/` + track;
    if (!pause) {
        currentSong.play();
        play.src = "pause.svg";
    }
    document.querySelector(".songinfo").innerHTML = decodeURI(track);
    document.querySelector(".songtime").innerHTML = "00:00 / 00:00";
}

async function main() {
    await getSongs(currentFolder);
    playMusic(songs[0], true);

    // Add an event listener for hamburger
    document.querySelector(".hamburger").addEventListener("click", () => {
        document.querySelector(".left").style.left = "0"
    });
     // Add an event listener for close button
    document.querySelector(".close").addEventListener("click", () => {
        document.querySelector(".left").style.left = "-120%"
    })

    // Time update
    currentSong.addEventListener("timeupdate", () => {
        document.querySelector(".songtime").innerHTML =
            `${secondsToMinutesSeconds(currentSong.currentTime)}/${secondsToMinutesSeconds(currentSong.duration)}`;
        document.querySelector(".circle").style.left =
            (currentSong.currentTime / currentSong.duration) * 100 + "%";
    });

    // Seekbar click
    document.querySelector(".seekbar").addEventListener("click", e => {
        let percent = (e.offsetX / e.target.getBoundingClientRect().width) * 100;
        document.querySelector(".circle").style.left = percent + "%";
        currentSong.currentTime = (currentSong.duration * percent) / 100;
    });

    // Play/Pause
    play.addEventListener("click", () => {
        if (currentSong.paused) {
            currentSong.play();
            play.src = "pause.svg";
        } else {
            currentSong.pause();
            play.src = "play.svg";
        }
    });

    // Prev song
    previous.addEventListener("click", () => {
        let index = songs.indexOf(currentSong.src.split("/").pop());
        index = (index - 1 + songs.length) % songs.length;
        playMusic(songs[index]);
    });

    // Next song
    next.addEventListener("click", () => {
        let index = songs.indexOf(currentSong.src.split("/").pop());
        index = (index + 1) % songs.length;
        playMusic(songs[index]);
    });

    // Volume
    document.querySelector(".range input").addEventListener("change", e => {
        currentSong.volume = e.target.value / 100;
    });

    // Folder switching
    Array.from(document.getElementsByClassName("card")).forEach(card => {
        card.addEventListener("click", () => {
            getSongs(card.dataset.folder);
        });
    });
}

main();
