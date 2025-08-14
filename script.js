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
        <li data-track="${song}">
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
            let trackName = li.getAttribute("data-track");
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

async function diaplayAlbums() {
    // currentFolder = folder;
    let a = await fetch(`http://10.87.219.186:5500/songs/`);

    let response = await a.text();

    let div = document.createElement("div");
    div.innerHTML = response;
    let anchors = div.getElementsByTagName("a")
    let cardContainer = document.querySelector(".card_container")

    let array = Array.from(anchors)

    for (let index = 0; index < array.length; index++) {
        const e = array[index];


        if (e.href.includes("/songs")) {
            if ((e.href.split("/").slice(-1)[0]) != "songs") {

                let folder = e.href.split("/").slice(-1)[0];
                
                // Get the metadata of the folder
                let a = await fetch(`http://10.87.219.186:5500/songs/${folder}/info.json`);
                let response = await a.json();
                cardContainer.innerHTML = cardContainer.innerHTML + `<div data-folder="${folder}" class="card">
              <div class="img">
                <div class="play">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    viewBox="0 0 24 24"
                    width="24"
                    height="24"
                    color="#000000"
                    fill="black"
                  >
                    <path
                      d="M18.8906 12.846C18.5371 14.189 16.8667 15.138 13.5257 17.0361C10.296 18.8709 8.6812 19.7884 7.37983 19.4196C6.8418 19.2671 6.35159 18.9776 5.95624 18.5787C5 17.6139 5 15.7426 5 12C5 8.2574 5 6.3861 5.95624 5.42132C6.35159 5.02245 6.8418 4.73288 7.37983 4.58042C8.6812 4.21165 10.296 5.12907 13.5257 6.96393C16.8667 8.86197 18.5371 9.811 18.8906 11.154C19.0365 11.7084 19.0365 12.2916 18.8906 12.846Z"
                      stroke="currentColor"
                      stroke-width="1.5"
                      stroke-linejoin="round"
                    />
                  </svg>
                </div>
                <img
                  src="/songs/${folder}/cover.jpg"
                  alt=""
                />
              </div>

              <h2>${response.title}</h2>
              <p>${response.description}</p>
            </div>`
            }

        }
    }

    // Folder switching
    Array.from(document.getElementsByClassName("card")).forEach(card => {
        card.addEventListener("click", () => {
            getSongs(card.dataset.folder);
        });
    });
}

async function main() {
    await getSongs(currentFolder);
    playMusic(songs[0], true);

    // display all the albums on the page
    diaplayAlbums()


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

    
    document.querySelector(".range input").addEventListener("change", e => {
        currentSong.volume = e.target.value / 100;
    });

    // Add event listener to mute the song
    document.querySelector(".volume>img").addEventListener("click", e => {
        let rangeInput = document.querySelector(".range input");
        if (e.target.src.includes("volume.svg")) {
            e.target.src = e.target.src.replace("volume.svg", "mute.svg");
            currentSong.volume = 0;
            rangeInput.value = 0;
        }
        else {
            e.target.src = "mute.svg"
            currentSong.volume = .50;
            rangeInput.value = 50;
        }
    })


}

main();
