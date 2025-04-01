import spotifyDataPromise from "./dataloading.js";

let container = document.getElementById('vis2'); 

let width = container.offsetWidth * 0.8;
let height = container.offsetHeight * 0.95;
let data;

let margin = { top: 40, right: 20, bottom: 30, left: 40 };

const defaultImageUrl = "img/album-placeholder.png"

let leftArea;
let trackImg;
let trackTitle;
let trackArtist;

let selectedAttribute;
let selectedYear;
let selectedArtist;

let attrDesc = {
    "acousticness": `A confidence measure from 0.0 to 1.0 of whether the track is acoustic.
                    1.0 represents high confidence the track is acoustic.`,
    "danceability": `Describes how suitable a track is for dancing based on a
                    combination of musical elements including tempo, rhythm stability, beat strength,
                    and overall regularity.`,
    "energy": `A measure representing a perceptual measure of intensity
                and activity. Perceptual features that contribute include dynamic range, perceived
                loudness, timbre, onset rate, and general entropy.`,
    "instrumentalness": `Predicts whether a track contains no vocals. The closer the instrumentalness value is
                        to 1.0, the greater likelihood the track contains no vocal content.`,
    "liveness": `Detects the presence of an audience in the recording. A value above 0.8 provides
                strong likelihood that the track is live.`,
    "speechiness": `Detects the presence of spoken words in a track.
                    Values above 0.66 describe tracks that are likely entirely spoken words.
                    Values below 0.33 likely represent music and other non-speech tracks.`,
    "popularity": `The popularity of the track. The value will be between 0 and 100, with 100 being
                    the most popular. The popularity of a track is a value between 0 and 100, with 100
                    being the most popular. The popularity is calculated by algorithm and is mostly based
                    on the total number of plays the track has had and how recent those
                    plays are. Generally, songs that are being played a lot now will have a
                    higher popularity than songs that were played a lot in the past. Duplicate tracks
                    are rated independently.`,
};

let attrIcon = {
    "acousticness": "ear-hearing",
    "danceability": "dance-ballroom",
    "energy": "lightning-bolt",
    "instrumentalness": "music-note",
    "liveness": "microphone-variant",
    "speechiness": "account-voice",
    "popularity": "crowd"
};

let allArtists = new Set();

spotifyDataPromise.then(loadedData => {
    loadedData.forEach(row => {
        let artists = row.artists;
        
        // Check and clean up artist string format
        if (artists.startsWith('"') && artists.endsWith('"')) {
            artists = artists.slice(1, -1);
        }
        if (artists.startsWith('[') && artists.endsWith(']')) {
            artists = artists.slice(1, -1).split(',').map(artist => artist.trim());
            artists = artists.map(artist => {
                if (artist.startsWith('"') && artist.endsWith('"')) {
                    return artist.slice(1, -1);
                }
                else if (artist.startsWith("'") && artist.endsWith("'")) {
                    return artist.slice(1, -1);
                }
                return artist;
            });
        }
        
        // Add each artist to the allArtists set (assuming it is defined somewhere)
        artists.forEach(artist => allArtists.add(artist));
        
        // Attach the processed artist list to the row
        row.artist = artists;
    });

    //createIntroComponent("vis2", "Through the years:", "Audio Attributes");

    data = loadedData;

    // append row
    let row = d3.select("#vis2")
        .append("div")
        .attr("class", "row row0 g-0")
        .style("width", `${width}px`)
        .style("height", `${height}px`)

    leftArea = row
        .append("div")
        .attr("class", "col-md-3 left-column");

    leftArea.append("div")
        .attr("class", "title")
        .text("Audio Attributes")
    leftArea.append("div")
        .attr("class", "subtitle")
        .text("throughout the years")

    // Create input and suggestion container
    const container = leftArea.append("foreignObject")
        .attr("width", "100%")
        .attr("height", 180)
        .append("xhtml:div")
        .style("position", "relative");

    // Input field
    const input = container.append("input")
        .attr("type", "text")
        .attr("placeholder", "Enter Artist Name")
        .attr("class", "artist-filter");
    // Suggestion box
    const suggestionBox = container.append("div")
        .attr("class", "suggestion-box");
    // Input event logic
    let filteredArtists = Array.from(allArtists); // Start with all artists
    let previousInput = ""; // Define previousInput to track last input
    input.on("input", function () {
        const enteredArtist = this.value.toLowerCase();
        // Always filter from full list
        filteredArtists = Array.from(allArtists)
            .filter(d => d.toLowerCase().includes(enteredArtist))
            .slice(0, 500); // Only show top 500 matches
        previousInput = enteredArtist; // Update previousInput with current input
        // Display suggestions
        suggestionBox.html("");
        filteredArtists.forEach(artist => {
            suggestionBox.append("div")
                .text(artist)
                .style("padding", "5px")
                .style("cursor", "pointer")
                .style("color", "#f0f0f0")
                .on("click", function () {
                    input.node().value = artist;
                    suggestionBox.style("display", "none");
                    selectedArtist = artist;
                    sessionStorage.setItem("audioAttrsArtistSelected", selectedArtist);
                    let filteredData = data.filter(d => {
                        let artists = d.artists;
                        // If artists string starts and ends with double quotes, remove quotes
                        if (artists.startsWith('"') && artists.endsWith('"')) {
                            artists = artists.slice(1, -1);
                        }
                        // If artists are in a list format (i.e., starts with '[' and ends with ']')
                        if (artists.startsWith('[') && artists.endsWith(']')) {
                            // Remove square brackets and split by commas
                            artists = artists.slice(1, -1).split(',').map(artist => artist.trim());
                            // Clean up any surrounding quotes around each artist
                            artists = artists.map(artist => {
                                if (artist.startsWith('"') && artist.endsWith('"')) {
                                    return artist.slice(1, -1); // Remove surrounding double quotes
                                } else if (artist.startsWith("'") && artist.endsWith("'")) {
                                    return artist.slice(1, -1); // Remove surrounding single quotes
                                }
                                return artist; // Return artist name as is if no quotes
                            });
                        }
                        // Check if entered artist matches any in cleaned list of artists
                        return d.artist.some(artist =>
                            artist.toLowerCase() === (selectedArtist.toLowerCase())
                        );
                    })
                    updateChart(filteredData);
                    let firstTrack = filteredData[0];
                    if (firstTrack) {
                        if (selectedArtist) {
                            let artistIndex = (firstTrack.artist.indexOf(selectedArtist));
                            if (typeof artistIndex === 'number') {
                                let artistId = (JSON.parse("[" + firstTrack.id_artists.slice(1,-1).replace(/'/g, '"') + "]")[artistIndex]);
                                setSpotifyArtistCoverArt(artistId);
                            }
                        }
                    }
                });
        });
        suggestionBox.style("display", filteredArtists.length ? "block" : "none")
            .style("overflow-y", "auto") // Enable scrolling if needed
            .style("z-index","1");
    });
    // Disable left and right arrow keys in input box
    input.on("keydown", function (event) {
        if (event.key === "ArrowLeft" || event.key === "ArrowRight") {
            event.stopPropagation(); // Stop event from propagating to other listeners
        }
    });
    // Hide suggestions when clicking outside
    d3.select("body").on("click", function (event) {
        if (!container.node().contains(event.target)) {
            suggestionBox.style("display", "none");
        }
    });
    leftArea.append("div")
        .attr("class", "reset-button")
        .text("Reset")
        .on("click", function() {
            updateChart(data);
            input.node().value = "";
            d3.select(".most-attr-of-year").text("");
            d3.select(".track-img").attr("src", defaultImageUrl);
            d3.select(".track-title").text("Search an Artist");
            d3.select(".track-artist").text("and Click a Graph");
        })

    leftArea.append("div")
        .attr("class", "subtitle most-attr-of-year")
        .text("");
    
    let imgArea = leftArea.append("div")
        .style("flex-grow", "1");
    trackImg = imgArea.append("img")
        .attr("class", "track-img")
        .attr("src", defaultImageUrl)
        .style("width", `${imgArea.node().getBoundingClientRect().width}px`);
    trackTitle = imgArea.append("div")
        .attr("class", "track-title")
        .text("Search an Artist");
    trackArtist = imgArea.append("div")
        .attr("class", "track-artist")
        .text("and Click a Graph");

    // Append col in row
    let rightArea = row.append("div").attr("class", "col-md-9 right-column").style("height", `${height}px`);

    // Create rows in right column
    let rightRow1 = rightArea.append("div").attr("class", "row mini-row");
    let rightRow2 = rightArea.append("div").attr("class", "row mini-row");
    let rightRow3 = rightArea.append("div").attr("class", "row mini-row");

    // row 1
    let svg7 = rightRow1.append("div").attr("class", "col-md-12").append("svg").attr("class", "line-chart-svg");

    // row 2
    let col1Row2 = rightRow2.append("div").attr("class", "col-md-4 mini-col");
    let col2Row2 = rightRow2.append("div").attr("class", "col-md-4 mini-col");
    let col3Row2 = rightRow2.append("div").attr("class", "col-md-4 mini-col");
    let svg1 = col1Row2.append("svg").attr("class", "line-chart-svg");
    let svg2 = col2Row2.append("svg").attr("class", "line-chart-svg");
    let svg3 = col3Row2.append("svg").attr("class", "line-chart-svg");

    // row 3
    let col1Row3 = rightRow3.append("div").attr("class", "col-md-4 mini-col");
    let col2Row3 = rightRow3.append("div").attr("class", "col-md-4 mini-col");
    let col3Row3 = rightRow3.append("div").attr("class", "col-md-4 mini-col");
    let svg4 = col1Row3.append("svg").attr("class", "line-chart-svg");
    let svg5 = col2Row3.append("svg").attr("class", "line-chart-svg");
    let svg6 = col3Row3.append("svg").attr("class", "line-chart-svg");

    create_line_chart("acousticness", svg1.node(), data);
    create_line_chart("danceability", svg2.node(), data);
    create_line_chart("energy", svg3.node(), data);
    create_line_chart("instrumentalness", svg4.node(), data);
    create_line_chart("liveness", svg5.node(), data);
    create_line_chart("speechiness", svg6.node(), data);
    create_line_chart("popularity", svg7.node(), data); 
});

function create_line_chart(attr, svgElem, data) {
    let width = svgElem.getBoundingClientRect().width - margin.left - margin.right;
    let height = svgElem.getBoundingClientRect().height - margin.top - margin.bottom;
    
    let flipContainer = d3.select(svgElem.parentNode).append("div").attr("class", "flip-container");
    let flipInner = flipContainer.append("div").attr("class", "flip-inner");
    
    let front = flipInner.append("div").attr("class", "flip-front");
    front.node().appendChild(svgElem);
    front.append("button")
        .attr("class", "info-btn")
        .html('<i class="mdi mdi-information-outline"></i>')
        .on("click", function () {
            flipInner.classed("flipped", !flipInner.classed("flipped"));
        });
    
    let back = flipInner.append("div").attr("class", "flip-back");
    back.append("button")
        .attr("class", "info-close")
        .html('<i class="mdi mdi-close"></i>')
        .on("click", function () {
            flipInner.classed("flipped", false);
        });

    back.append("h3").attr("class", "attr-extra-info-title").text(attr.toUpperCase());
    let backContainer = back.append("div").attr("class", "attr-extra-info-container");
    backContainer.append("i").attr("class", `attr-extra-info-icon mdi mdi-${attrIcon[attr]}`);
    backContainer.append("p").attr("class", "attr-extra-info").text(attrDesc[attr]);

    d3.select(svgElem)
        .append("text")
        .text(`${attr.toUpperCase()} (avg)`)
        .attr("x", 40)
        .attr("y", 25)
        .style("font-size", "14px")
        .style("font-weight", "700")
        .style("fill", "#b0b0b0");

    let svg = d3.select(svgElem)
        .attr("width", width + margin.left + margin.right)
        .attr("height", height + margin.top + margin.bottom)
        .append("g")
        .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

    data.forEach(d => {
        d.year = new Date(d.release_date).getFullYear();
        d[attr] = +d[attr];
    });

    let groupedData = d3.group(data, d => d.year);
    let lineData = Array.from(groupedData, ([year, values]) => {
        let maxTrack = values.reduce((max, track) => {
            return track[attr] > max[attr] ? track : max;
        });
        return {
            year: +year,
            attr: attr,
            avg: d3.mean(values, d => d[attr]),
            most: maxTrack,
        }
    });
    lineData.sort((a, b) => a.year - b.year);

    let x = d3.scaleLinear()
        .domain(d3.extent(data, d => d.year))
        .range([0, width]);
    
    let y = d3.scaleLinear()
        .domain([0, d3.max(lineData, d => d.avg)])
        //.domain([0, 1])
        .range([height, 0])

    let line = d3.line()
        .x(d => x(d.year))
        .y(d => y(d.avg));

    svg.append("g")
        .attr("class", "x axis")
        .attr("transform", "translate(0," + height + ")")
        .call(d3.axisBottom(x).ticks(3).tickFormat(d3.format("d")));

    svg.append("g")
        .attr("class", "y axis")
        .call(d3.axisLeft(y).ticks(3));

    svg.append("path")
        .datum(lineData)
        .attr("class", "line")
        .attr("d", line);

    let tooltip = d3.select('#vis2').append("div")
        .attr("class", "tooltip-attr")
        .style("opacity", 0); // Initially hidden

    let hoveredData = null;
    svg.selectAll(".hitbox")
        .data(lineData)
        .enter().append("circle")
        .attr("class", "hitbox")
        .attr("cx", d => x(d.year)) // x position of each data point
        .attr("cy", d => y(d.avg)) // y position of each data point
        .attr("r", 5) // Small radius, just enough for mouse interaction
        .style("opacity", 0) // Make circle invisible
        .on("mouseover", function (event, d) {
            // Show tooltip and handle positioning based on data point
            tooltip.style("opacity", 1)
                .style("left", `${event.pageX + 10}px`)
                .style("top", `${event.pageY + 10}px`)
                .html(`Year: ${d.year}<br>${attr}: ${d.avg.toFixed(4)}`);
            hoveredData = d;
        })
        .on("mouseout", function () {
            tooltip.style("opacity", 0); // hide
        })
        // click event on line chart
        .on("click", function (event, d) {
            updateImage(hoveredData);
        });
}

function updateChart(filteredData) {    
    d3.selectAll(".line-chart-svg").each(function (d, i) {
        const attributes = ["popularity","acousticness","danceability","energy","instrumentalness","liveness","speechiness", ];
        let attr = attributes[i]
        let svgElem = d3.select(this).node();
        let svg = d3.select(this);
        let width = svgElem.getBoundingClientRect().width - margin.left - margin.right;
        let height = svgElem.getBoundingClientRect().height - margin.top - margin.bottom;
        // create scales and axes
        let xScale = d3.scaleLinear()
            .domain(d3.extent(filteredData, d => d.year))
            .range([0, width])
        let yScale = d3.scaleLinear()
            .domain([0, d3.max(filteredData, d => d[attr])])
            .range([height, 0]);
        let xAxis = d3.axisBottom().scale(xScale);
        let yAxis = d3.axisLeft().scale(yScale);
        // select existing axes
        svg.select(".x.axis")
            .transition().duration(800)
            .call(xAxis.ticks(3).tickFormat(d3.format("d")));
        svg.select(".y.axis")
            .transition().duration(800)
            .call(yAxis.ticks(3));
        // draw line
        let groupedData = d3.group(filteredData, d => d.year);
        let lineData = Array.from(groupedData, ([year, values]) => {
            let maxTrack = values.reduce((max, track) => {
                return track[attr] > max[attr] ? track : max;
            });
            return {
                year: +year,
                attr: attr,
                avg: d3.mean(values, d => d[attr]),
                most: maxTrack,
            }
        });
        lineData.sort((a, b) => a.year - b.year);

        let line = d3.line()
            .x(d => xScale(d.year))
            .y(d => yScale(d.avg));

        let path = svg.selectAll(".line").data([lineData]);
        path.enter()
            .append("path")
            .attr("class", "line")
            .merge(path)
            .transition().duration(800)
            .attr("d", line)
        path.exit().remove();

        let hoveredData = null;
        svg.selectAll(".hitbox").remove();
        svg.selectAll(".tooltip-attr").remove();

        let tooltip = d3.select('#vis2').append("div")
            .attr("class", "tooltip-attr")
            .style("opacity", 0);
        svg.selectAll(".hitbox")
            .data(lineData)
            .enter().append("circle")
            .attr("class", "hitbox")
            .attr("cx", d => xScale(d.year) + margin.left) // x position of each data point
            .attr("cy", d => yScale(d.avg) + margin.top) // y position of each data point
            .attr("r", 4)
            .attr("fill", green)
            .style("opacity", function () {
                return lineData.length < 20 ? "1" : "0";
            })
            .on("mouseover", function (event, d) {
                tooltip
                    .style("opacity", 1)
                    .style("left", `${event.pageX + 10}px`)
                    .style("top", `${event.pageY + 10}px`)
                    .html(`Year: ${d.year}<br>${attr}: ${d.avg.toFixed(4)}`);
                hoveredData = d;
            })
            .on("mouseout", function () {
                tooltip.style("opacity", 0);
            })
            .on("click", function (event, d) {
                updateImage(hoveredData);
            });
    });
}

function updateImage(hoveredData) {
    let trackId
    if (hoveredData) {
        trackId = hoveredData.most.id;
    }
    async function getSpotifyCoverArt(trackId) {
        const embedUrl = `https://open.spotify.com/oembed?url=spotify:track:${trackId}`;
        try {
            const response = await fetch(embedUrl);
            if (!response.ok) throw new Error("Failed to fetch data");
            const data = await response.json();
            trackImg.attr("src", data.thumbnail_url);
            trackTitle.text(hoveredData.most.name);
            let cleanArtists = hoveredData.most.artists
                .replace(/^\[|\]$/g, '') // Remove outer brackets
                .split(/',\s*'/) // Split on "', '" (handles spaces)
                .map(artist => artist.replace(/^['"]|['"]$/g, '').trim()) // Remove surrounding single or double quotes
                .join(", "); // Join into a single string
            trackArtist.text(cleanArtists);
            selectedYear = hoveredData.year;
            selectedAttribute = hoveredData.attr;
            d3.select(".most-attr-of-year")
                .text(
                    `Track with highest ${selectedAttribute ? selectedAttribute.toUpperCase() : '<attribute>'}
                    score of ${selectedYear ? selectedYear : '<year>'}
                    ${selectedArtist ? 'with ' + selectedArtist.toUpperCase() : ''}`
                );
            return data.thumbnail_url;
        } catch (error) {
            console.error("Error fetching cover art:", error);
            return null;
        }
    }

    getSpotifyCoverArt(trackId);
}

async function setSpotifyArtistCoverArt(artistId) {
    const embedUrl = `https://open.spotify.com/oembed?url=spotify:artist:${artistId}`;
    try {
        const response = await fetch(embedUrl);
        if (!response.ok) throw new Error("Failed to fetch data");
        const data = await response.json();
        sessionStorage.setItem("audioAttrsArtistSelectedImg", data.thumbnail_url);
        return data.thumbnail_url;
    } catch (error) {
        console.error("Error fetching cover art:", error);
        return null;
    }
}