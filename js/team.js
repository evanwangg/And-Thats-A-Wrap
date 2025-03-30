let green = "#1DB954";
let lightGrey = "#b0b0b0";
let medGrey = "#808080";
let meddarkGrey = "#404040";
let darkGrey = "#1f1f1f";

let nancy_songs = [
    { song: "Just The Two Of Us", artist: "Marcin, Ichika Nito" },
    { song: "A Big Commotion", artist: "Satoshi Takebe" },
    { song: "I Was Sad Last Night I'm OK Now", artist: "tobi lou" },
    { song: "i found a weird piano let me know if you like it", artist: "AZALI" },
    { song: "Sugarcoat (NATTY Solo)", artist: "KISS OF LIFE" },
    { song: "Like Him", artist: "Tyler, The Creator" },
    { song: "Designer", artist: "Balu Brigada" },
    { song: "CALL ME BABY", artist: "EXO" },
    { song: "Is there free breakfast here?", artist: "Hotel Ugly" },
    { song: "Just One Day", artist: "BTS" }
]

let irene_songs = [
    { song: "Lejos de Ti", artist: "The Marias" },
    { song: "Dream of Me", artist: "NewDad" },
    { song: "Disappear", artist: "Mazzy Star" },
    { song: "Cornerstone", artist: "Arctic Monkeys" },
    { song: "Sweet Dreams, TN", artist: "The Last Shadow Puppets" },
    { song: "In Blue", artist: "Fazerdaze" },
    { song: "Soleil blanc", artist: "Requin Chagrin" },
    { song: "My dear friends", artist: "Thelma Aoyama" },
    { song: "Whiplash", artist: "aespa" },
    { song: "猿芝居", artist: "natori" },
    { song: "Drive Me Crazy", artist: "Myles Lloyd" },
    { song: "Dreams Tonite", artist: "Alvvays" },
    { song: "Womanizer", artist: "Britney Spears" },
    { song: "Tommy’s Party", artist: "Peach Pit" },
    { song: "Bedroom Talks", artist: "Fazerdaze" },
    { song: "Supernatural", artist: "NewJeans" },
    { song: "then i met her", artist: "EKKSTACY" },
    { song: "Sports car", artist: "Tate Mcrae" },
    { song: "loml", artist: "Taylor Swift" },
    { song: "Poker Face", artist: "Lady Gaga" }
]

let evan_songs = [
    { song: "Hard Feelings/Loveless", artist: "Lorde" },
    { song: "ENERGY", artist: "Beyoncé, Beam" },
    { song: "Run Away With Me", artist: "Carly Rae Jepsen" },
    { song: "About You", artist: "The 1975" },
    { song: "yeaaa", artist: "Flyana Boss" },
    { song: "Breathing Underwater", artist: "Metric"},
    { song: "Jupiter, the Bringer of Jollity", artist: "Gustav Holst" },
    { song: "New Birth", artist: "Hayato Sumino" },
    { song: "Amour Plastique", artist: "Videoclub, Adèle Castillon, Mattyeux" },
    { song: "Elle ne t'aime pas", artist: "La Femme" },
    { song: "Popcorn", artist: "D.O." },
    { song: "시작", artist: "Gaho" },
]

let aamishi_songs = [
    { song: "Outro: Tear", artist: "BTS" },
    { song: "What do you think?", artist: "Agust D" },
    { song: "Secret Loser", artist: "Ozzy Osbourne" },
    { song: "Ice on my Teeth", artist: "ATEEZ" },
    { song: "Kitty Kat", artist: "Megan Thee Stallion" },
    { song: "Ram Chahe Leela", artist: "Bhumi Trivedi" },
    { song: "Kun Faya Kun", artist: "A.R. Rahman" },
    { song: "Tricky House", artist: "xikers" },
    { song: "Tune Mari Entriyaan", artist: "Bappi Lahiri" },
    { song: "Big City Nights", artist: "Scorpions" }
]

// Team Title
d3.select("#team-page").append("div")
    .append("text")
    .style("font-size", "3em")
    .style("font-weight", "900")
    .style("color", green)
    .style("display", "block")
    .style("letter-spacing", "-1px")
    .text("Our Team");

// Team Container
let teamContainer = d3.select("#team-page").append("div")
    .style("display", "flex")
    .style("height", "80%")
    .style("justify-content", "center")
    .style("width", "100%")
    .style("background-color", "transparent");

create_member_card("Nancy Hu", "img/pfp/nancy-pfp.png", "img/avatars/User avatar sea lion.png", "n.hu@mail.utoronto.ca", nancy_songs);

create_member_card("Irene Huynh", "img/pfp/irene-pfp.png", "img/avatars/User avatar polar bear.png", "irene.huynh@mail.utoronto.ca", irene_songs);

create_member_card("Evan Wang", "img/pfp/evan-pfp.png", "img/avatars/User avatar llama.png", "eevan.wang@mail.utoronto.ca", evan_songs);

create_member_card("Aamishi Avarsekar", "img/pfp/aamishi-pfp.png", "img/avatars/User avatar dog.png", "aamishi.avarsekar@mail.utoronto.ca", aamishi_songs);

function create_member_card(name, profileImg, avatarImg, subtext, songs) {
    let memberContainer = teamContainer.append("div")
        .attr("class", "member-card")
        .style("border-radius", "20px")
        .style("margin", "10px")
        .style("padding", "1rem")
        .style("max-width", "250px")
        .style("min-width", "200px")
        .style("background-color", darkGrey)
        .style("flex-direction", "column")
        .style("justify-content", "space-between")
        .style("height", "auto");

    memberContainer.append("img")
        .attr("src", profileImg)
        .attr("class", "member-img")
        .style("width", "100%")
        .style("height", "auto")
        .style("display", "block")
        .style("border-radius", "50%")
        .style("margin", "0")
        .style("cursor", "pointer")
        .style("transition", "transform 0.3s")
        .style("transform-style", "preserve-3d")
        .on("click", function () {
            let displayImg = d3.select(this);
            displayImg.style("transform", displayImg.attr("src") === profileImg ? "rotateY(180deg)" : "rotateY(0deg)");
            setTimeout(() => {
                displayImg.attr("src", displayImg.attr("src") === profileImg ? avatarImg : profileImg);
            }, 100);
        });

    let nameContainer = memberContainer.append("div")
        .attr("class", "member-name-container")
        .style("margin", "5px 0px 0px 0px");

    nameContainer.append("text")
        .attr("class", "member-name")
        .style("color", "white")
        .style("font-weight", "bold")
        .style("font-size", "1.5rem")
        .text(name);

    let subtextContainer = memberContainer.append("div")
        .attr("class", "member-subtext-container")
        .style("margin", "5px 0px 0px 0px");

    subtextContainer.append("text")
        .attr("class", "member-subtext")
        .style("color", medGrey)
        .style("font-size", "0.85rem")
        .style("word-wrap", "break-word")
        .style("overflow-wrap", "break-word")
        .style("margin-bottom", "5px")
        .text(subtext);

    let songContainer = memberContainer.append("div")
        .attr("class", "song-container")
        .style("background-color", "transparent")
        .style("padding", "0")
        .style("width", "100%")
        .style("margin-top", "1rem");
    
    songContainer.append("div")
        .attr("class", "song-title")
        .text("Now Playing")
        .style("color", lightGrey)
        .style("font-size", "1rem")
        .style("font-weight", "700")
        .style("line-height", "0.9")
        
    let detailsContainer = songContainer
        .append("div")
        .style("display", "flex")
        .style("flex-direction", "row");
    
    let songDetailsContainer = detailsContainer
        .append("div")
        .style("flex", "1");
    let buttonContainer = detailsContainer
        .append("div")
        .style("flex", "0");
    
    let songName = songDetailsContainer.append("div")
        .style("margin-top", "0.5rem")
        .text(songs[0].song)
        .style("color", lightGrey)
        .style("font-size", "0.8rem")
        .style("font-weight", "600")
        .style("line-height", "1.2");
    let artistContainer = songDetailsContainer.append("div")
        .style("display", "flex")
        .style("flex-direction", "row")
    artistContainer.append("div")
        .html(`<i class="mdi mdi-account-music-outline"></i>`)
        .style("color", lightGrey)
        .style("margin-right", "0.1rem")
        .style("font-size", "0.8rem")
        .style("font-weight", "600")
        .style("line-height", "1.2");
    let artistName = artistContainer.append("div")
        .text(songs[0].artist)
        .style("color", lightGrey)
        .style("font-size", "0.8rem")
        .style("font-weight", "600")
        .style("line-height", "1.2");
    
    let nextArrow = buttonContainer
        .append("div")
        .html(`<i class="mdi mdi-skip-next"></i>`)
        .attr("class", "arrow next")
        .style("cursor", "pointer")
        .style("font-size", "1.5rem")
        .style("color", lightGrey)
        .on("click", function () {
            updateSong(name, 1);
        });
    
    function updateSong(name, direction) {
        let memberSongs = songs;
        let currentIndex = memberSongs.findIndex(song => song.song === songName.text());
        let newIndex = (currentIndex + direction + memberSongs.length) % memberSongs.length;
        let newSong = memberSongs[newIndex];
    
        songName.text(newSong.song);
        artistName.text(newSong.artist);
    }
}
