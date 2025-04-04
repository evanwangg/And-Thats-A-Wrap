import spotifyDataPromise from "./dataloading.js";

let songAttrContainer = document.getElementById("song-attr-spider-graph-vis");

let width = songAttrContainer.offsetWidth * 0.8;
let height = songAttrContainer.offsetHeight * 1 - 40;
let margin = { top: 40, right: 20, bottom: 30, left: 40 };

let white = '#f0f0f0';
let green = "#1DB954";
let lightGrey = "#b0b0b0";
let medGrey = "#808080";
let darkGrey = "#1f1f1f";

let leftArea;
let leftAreaBottom;
let middleArea;
let middleAreaTop;
let middleAreaBottom
let svg;
let rightArea;
let rightAreaTop;
let rightAreaBottom;

let data;
let selectedSong;
let top5SimilarSongs;

let radius = 0; //= Math.min(width, height) / 2 - 50;

let attrs = [
    { axis: "popularity", value: 0 },
    { axis: "acousticness", value: 0 },
    { axis: "energy", value: 0 },
    { axis: "danceability", value: 0 },
    { axis: "instrumentalness", value: 0 },
    { axis: "liveness", value: 0 },
    { axis: "speechiness", value: 0 },
];
const levels = 4;

let allSongs = new Set();

spotifyDataPromise.then((loadedData) => {
    loadedData.forEach ((d) => {
        d.popularity = d.popularity / 100;
        d.artists = d.artists.substring(2, d.artists.length - 2);
        allSongs.add(d.name);
    });

    selectedSong = null; //loadedData[114381];
    if (selectedSong) {
        top5SimilarSongs = findTop5SimilarSongs(selectedSong, loadedData, attrs);

        attrs.forEach(attr => {
            if (selectedSong.hasOwnProperty(attr.axis)) {
                attr.value = selectedSong[attr.axis]; // set vals based on songs data
            }
        });
    }

    let row = d3.select("#song-attr-spider-graph-vis")
        .append("div")
        .style("width", `${width}px`)
        .style("height", `${height}px`)
        .style("display", "flex")
        .style("margin-top", "2rem")
        .style("flex-direction", "row");
    leftArea = row
        .append("div")
        .style("width", "23%")
        .attr("height", height);
    let leftAreaText = leftArea
        .append("div")
        .style("font-size", "0.8rem")
        .style("font-weight", "700")
        .style("color", white)
        .text("Based on the audio attributes, you might like:");
    leftAreaBottom = leftArea
        .append("div")
        .style("width", "100%")
        .style("height", "auto");
    middleArea = row
        .append("div")
        .style("width", "54%")
        .attr("height", height)
        .style("display", "flex")
        .style("flex-direction", "column");
    middleAreaTop = middleArea
        .append("div")
        .style("width", "100%")
        .style("height", "auto")
        .style("display", "flex")
        .style("justify-content", "center")
        .style("align-item", "center")
        .style("z-index", "1");
    middleAreaBottom = middleArea
        .append("div")
        .style("width", "100%")
        .style("flex", "1")
    svg = middleAreaBottom.append("svg")
        .attr("width", "100%")
        .attr("height", "100%")
        .append("g")
        .attr("transform", `translate(
            ${middleAreaBottom.node().getBoundingClientRect().width / 2},
            ${middleAreaBottom.node().getBoundingClientRect().height / 2}
        )`);
    rightArea = row
        .append("div")
        .style("width", "23%")
        .attr("height", height);
    let rightAreaText = rightArea
        .append("div")
        .style("font-size", "1.5rem")
        .style("font-weight", "700")
        .style("color", white)
        .text("Currently Visualizing:")
    rightAreaTop = rightArea
        .append("div")
        .style("width", "100%")
        .attr("height", "100%");
    rightAreaBottom = rightArea
        .append("div")
        .style("width", "100%")
        .attr("height", "30%");
    
    if (selectedSong) {
        addSpotifyArt(selectedSong.id, selectedSong.name, selectedSong.artists, rightAreaTop);
        addSpotifyEmbed(selectedSong.id, rightAreaBottom);
        top5SimilarSongs.forEach(song => {
            addSpotifyEmbed(song.id, leftAreaBottom);
        });
    }

    let tooltip = d3.select('#song-attr-spider-graph-vis').append("div")
        .attr("class", "tooltip-radial")
        .style("position", "absolute")
        .style("z-index", "2")
        .style("padding", "0.5rem")
        .style("border-radius", "0.2rem")
        .style("pointer-events", "none")
        .style("opacity", 0)
        .style("color", green)
        .style("background-color", "#2f2f2f");

    // Create container div
    const container = middleAreaTop
        .append("div")
        .style("width", "70%")
        .style("height", "100%");

    // Input field
    const input = container.append("input")
        .attr("type", "text")
        .attr("placeholder", "Enter Song Name To See Its Attributes")
        .attr("class", "song-filter")
        .style("width", "100%")
        .style("background-color", "#2a2a2a")
        .style("color", white)
        .style("border", "1px solid #f0f0f0")
        .style("border-radius", "3rem")
        .style("padding", "0.5rem")
        .style("position", "relative");

    radius = Math.min(
        middleAreaBottom.node().getBoundingClientRect().width,
        middleAreaBottom.node().getBoundingClientRect().height) / 2 - 20

    // Suggestion box
    const suggestionBox = container.append("div")
        .attr("class", "suggestion-box")
        .style("max-height", "130px")
        .style("width", `${container.node().getBoundingClientRect().width}px`)
        .style("background-color", "#2a2a2a")
        .style("position", "absolute")
        .style("z-index", "2")
        .style("display", "none");

    // Input event logic
    let filteredSongs = Array.from(loadedData);
    let previousInput = "";

    input.on("input", function () {
    const enteredSong = this.value.toLowerCase();

    filteredSongs = Array.from(loadedData)
        .filter(d => d.name.toLowerCase().includes(enteredSong))
        .slice(0, 100); // Show top 100 matches

    previousInput = enteredSong;
    suggestionBox.html("");

    filteredSongs.forEach(song => {
        suggestionBox.append("div")
            .text(song.name + " - " + song.artists)
            .style("padding", "5px")
            .style("cursor", "pointer")
            .style("color", "#f0f0f0")
            .style("white-space", "nowrap")
            .style("overflow", "hidden")
            .style("text-overflow", "ellipsis")
            .on("click", function () {
                input.node().value = song.name + " - " + song.artists;
                suggestionBox.style("display", "none");
                selectedSong = song;
                let selectedSongData = loadedData.filter(d => d.id.toLowerCase().includes(song.id.toLowerCase()))[0];
                attrs.forEach(attr => {
                    if (selectedSongData.hasOwnProperty(attr.axis)) {
                        attr.value = selectedSongData[attr.axis]; // set vals based on songs data
                    }
                });
                updateChart(attrs);
                rightAreaTop.select('*').remove();
                rightAreaBottom.select('*').remove();
                leftAreaBottom.selectAll('*').remove();
                setTimeout(() => {
                    addSpotifyArt(selectedSongData.id, selectedSongData.name, selectedSongData.artists, rightAreaTop);
                    addSpotifyEmbed(selectedSongData.id, rightAreaBottom);
                    top5SimilarSongs = findTop5SimilarSongs(selectedSongData, loadedData, attrs);
                    top5SimilarSongs.forEach(song => {
                        addSpotifyEmbed(song.id, leftAreaBottom);
                    });
                }, 300);
            });
    });

    suggestionBox.style("display", filteredSongs.length ? "block" : "none")
        //.style("overflow", "hidden")
        .style("overflow-y", "auto");
    });

    // Hide suggestions when clicking outside
    d3.select("body").on("click", function (event) {
        if (!container.node().contains(event.target)) {
            suggestionBox.style("display", "none");
        }
    });
    
    const angleSlice = (2 * Math.PI) / attrs.length;
    const rScale = d3.scaleLinear().domain([0, 1]).range([0, radius]);

    // generate polygon points
    function generatePolygon(level) {
        return attrs.map((d, i) => [
            rScale(level) * Math.cos(angleSlice * i - Math.PI / 2),
            rScale(level) * Math.sin(angleSlice * i - Math.PI / 2)
        ]);
    }

    // draw grid lines (concentric polygons)
    for (let i = 1; i <= levels; i++) {
        let gridPoints = generatePolygon(i / levels);
        svg.append("polygon")
            .attr("points", gridPoints.map(p => p.join(",")).join(" "))
            .attr("stroke", i === levels ? lightGrey : "#2f2f2f")
            .attr("stroke-width", 1)
            .attr("fill", "none");
    }

    // draw axes
    const axis = svg.selectAll(".spider-axis")
        .data(attrs)
        .enter()
        .append("g")
        .attr("class", "spider-axis")
        .each(function(d, i) {
            d3.select(this)
                .append("line")
                .attr("x1", 0)
                .attr("y1", 0)
                .attr("x2", rScale(1) * Math.cos(angleSlice * i - Math.PI / 2))
                .attr("y2", rScale(1) * Math.sin(angleSlice * i - Math.PI / 2))
                .attr("stroke", medGrey)
                .attr("stroke-width", 1);
            d3.select(this)
                .append("text")
                .attr("x", (rScale(1) + 10) * Math.cos(angleSlice * i - Math.PI / 2))
                .attr("y", (rScale(1) + 10) * Math.sin(angleSlice * i - Math.PI / 2))
                .attr("text-anchor", "middle")
                .attr("dominant-baseline", "middle")
                .attr("fill", white)
                .text(d.axis);
        });

    // draw spider chart
    const line = d3.lineRadial()
        .radius(d => rScale(d.value))
        .angle((d, i) => i * angleSlice);
            
    // draw data lines
    svg.append("path")
        .datum([...attrs, attrs[0]]) // close shape
        .attr("d", line)
        .attr("fill", "rgba(30, 215, 96, 0.3)")
        .attr("stroke", green)
        .attr("stroke-width", 2);

    // draw data pts
    svg.selectAll(".circle")
        .data(attrs)
        .enter()
        .append("circle")
        .attr("class", "circle")
        .attr("cx", (d, i) => rScale(d.value) * Math.cos(i * angleSlice - Math.PI / 2))
        .attr("cy", (d, i) => rScale(d.value) * Math.sin(i * angleSlice - Math.PI / 2))
        .attr("r", 4)
        .attr("fill", white)
        .on("mouseover", function(event, d) {
            tooltip.transition().duration(50).style("opacity", "1");
            tooltip.text(`${d.axis}: ${d.axis == 'popularity' ? d.value * 100 : d.value}`);
            tooltip.style("left", (event.pageX + 5) + "px")
                   .style("top", (event.pageY + 5) + "px");
        })
        .on("mouseout", function() {
            tooltip.transition().duration(50).style("opacity", "0");
        });

    function updateChart(newData) {
        // Update data
        attrs.forEach((d, i) => d.value = newData[i].value);
    
        // Redraw data line
        svg.select("path")
            .datum([...attrs, attrs[0]])
            .transition().duration(300)
            .attr("d", line);
    
        // Update data points
        svg.selectAll(".circle")
            .data(attrs)
            .transition().duration(300)
            .attr("cx", (d, i) => rScale(d.value) * Math.cos(i * angleSlice - Math.PI / 2))
            .attr("cy", (d, i) => rScale(d.value) * Math.sin(i * angleSlice - Math.PI / 2));
    }
});

function calculateDistance(song1, song2, attrs) {
    return Math.sqrt(
        attrs.reduce((sum, attr) => {
            const diff = song1[attr.axis] - song2[attr.axis];
            return sum + diff * diff;
        }, 0)
    );
}

function findTop5SimilarSongs(selectedSong, loadedData, attrs) {
    return loadedData
        .filter(song => song !== selectedSong) // Exclude selected song
        .map(song => ({
            song,
            distance: calculateDistance(selectedSong, song, attrs)
        }))
        .sort((a, b) => a.distance - b.distance) // Sort by closest
        .slice(0, 5) // Take top 5
        .map(entry => entry.song); // Return only song data
}

function addSpotifyArt(trackId, trackName, trackArtist, div) {
    async function getSpotifyCoverArt(trackId) {
        const embedUrl = `https://open.spotify.com/oembed?url=spotify:track:${trackId}`;
        try {
            const response = await fetch(embedUrl);
            if (!response.ok) throw new Error("Failed to fetch data");
            const data = await response.json();
            createTrackDisplay(data.thumbnail_url, trackName, trackArtist, div);
            sessionStorage.setItem("radialTrackSelected", trackName);
            sessionStorage.setItem("radialTrackSelectedImg", data.thumbnail_url);
            return data.thumbnail_url;
        } catch (error) {
            console.error("Error fetching cover art:", error);
            return null;
        }
    }
    getSpotifyCoverArt(trackId);
}

function addSpotifyEmbed(trackId, div) {
    div.append("iframe")
        .attr("src", `https://open.spotify.com/embed/track/${trackId}`)
        .attr("width", "100%")
        .attr("height", "80")
        .style("margin-top", "0.5rem")
        .attr("allow", "autoplay; clipboard-write; encrypted-media; picture-in-picture")
        .attr("loading", "lazy")
        .style("opacity", "0.6");
}
