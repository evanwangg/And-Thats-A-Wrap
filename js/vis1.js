document.addEventListener("DOMContentLoaded", function () {
    const page3 = document.querySelector(".page-3");
    if (page3) {
        const observer = new IntersectionObserver(entries => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    page3.classList.add("in-view");
                } else {
                    page3.classList.remove("in-view");
                }
            });
        }, { threshold: 1 });

        observer.observe(page3);
    }
});

let container = document.getElementById('vis1');
let width = container.offsetWidth * 0.8;
let height = container.offsetHeight * 1 - 40;

let lightGreen = '#b9ffd1';
let green = '#1DB954';
let medGrey = '#808080';
let darkGrey = '#6f6f6f';

let leftArea, scaleArea, scaleSvg, middleArea, globeArea, globeSvg, rightArea;
let selectedYear = '';
let selectedCountryFeature = null;         // holds the selected country element
let selectedCountry = null;         // holds the selected globe country element
let selectedCountryName = '';       // holds the name of the selected country
let selectedBubble = null;          // holds the currently selected song bubble
let countryTopSongs;

let spotifyCountries = {
    2017: new Set(), 2018: new Set(), 2019: new Set(), 2020: new Set(), 2021: new Set()
};
// since it's listed as 'United States' in the csv file
[2017, 2018, 2019, 2020, 2021].forEach(year => {
    spotifyCountries[year].add("United States of America");
});

let currentData; // hold currently active dataset
let spotifyData = {}; // store all datasets
const years = [2017, 2018, 2019, 2020, 2021];

// let projection be a global variable to be reused on updates
let globeProjection;

d3.select(".page-1")
    .append("p")
    .attr("id", "loading-message")
    .text("Now Loading... (This could take up to 1 minute)");

Promise.all(years.map(year =>
    d3.csv(`data/spotifytop50_${year}.csv`, row => {
        spotifyCountries[year].add(row.region);
        if (row.region === 'United States') {
            row.region = 'United States of America';
        }
        return row;
    }).then(data => {
        spotifyData[year] = data;
    })
)).then(() => {
    createIntroComponent("vis1", "Mapped  ", "Wrapped");

    d3.select("#loading-message").remove();

    d3.select(".page-1")
        .append("span")
        .text("Use your left and right arrow keys to navigate, or use the Previous and Next buttons below.");

    // default year and data
    selectedYear = '2017';
    currentData = spotifyData[selectedYear];

    let row = d3.select("#vis1").append("div")
        .attr("class", "row row0")
        .style("width", `${width}px`)
        .style("height", `${height}px`);

    leftArea = row.append("div")
        .attr("class", "col-md-2 left-column")
        .style("height", `${height}px`);
    scaleArea = row.append("div")
        .attr("class", "col-md-1 scale-column")
        .style("display", "flex")
        .style("flex-direction", "column")
        .style("justify-content", "center")
        .style("align-items", "center")
        .style("height", `${height}px`);
    let scaleText = scaleArea.append("div")
        .style("color", "#b0b0b0")
        .style("font-size", "0.9rem")
        .style("font-weight", "500")
        .style("text-align", "center")
        .style("padding-top", "3rem")
        .text("");
    let scaleContainer = scaleArea.append("div")
        .style("flex-grow", "1")
        .style("width", "100%")
        .style("display", "flex")
        .style("align-items", "center")
        .style("justify-content", "center");
    scaleSvg = scaleContainer.append("svg")
        .style("width", "100%")
        .style("height", "100%");
    middleArea = row.append("div")
        .attr("class", "col-md-6 middle-column");
    rightArea = row.append("div")
        .attr("class", "col-md-3 right-column")
        .style("height", `${height}px`);

    // handle year selection
    function handleYearSelection(year) {
        selectedYear = year;
        d3.selectAll(".select-year-btn").classed("selected-year", false);
        d3.select(this).classed("selected-year", true);
        currentData = spotifyData[selectedYear];

        // check if selected country exists in current year's data
        if (selectedCountryName && !spotifyCountries[selectedYear].has(selectedCountryName)) {
            // deselect country if it's not in current year's data
            if (selectedCountry) {
                d3.select(selectedCountry).style("fill", green);
            }
            selectedCountry = null;
            selectedCountryName = '';
            sessionStorage.removeItem("countrySelected");

            // clear existing bubbles and scale
            d3.select(".bubble-group").remove();
            scaleSvg.selectAll('*').remove();
            scaleText.text("");
            rightArea.selectAll('*').remove();
            globeSvg.selectAll('image').remove();
            globeSvg.selectAll('clipPath').remove();

            // update top text
            d3.select(".selected-country-and-year")
                .text("Click on a country to find out more!");
        }

        // update country colors regardless of selection status
        globeSvg.selectAll(".country")
            .style("fill", d => {
                return (selectedCountryName === d.properties.name) ? lightGreen :
                    (spotifyCountries[selectedYear].has(d.properties.name)) ? green : medGrey;
            });

        // only update bubbles if we still have a valid selected country
        if (selectedCountryName) {

            // deselect any selected song bubble if one is selected
            if (selectedBubble) {
                selectedBubble
                    .attr("opacity", 0.7)
                    .attr("fill", darkGrey);
                selectedBubble = null;
                rightArea.selectAll('*').remove();
                globeSvg.selectAll('image').remove();
                globeSvg.selectAll('clipPath').remove();
            }

            // update country fill colors
            globeSvg.selectAll(".country")
                .style("fill", d => {
                    // keep the selected country highlighted; update others based on the dataset
                    return (selectedCountryName === d.properties.name) ? lightGreen :
                        (spotifyCountries[selectedYear].has(d.properties.name)) ? green : medGrey;
                });

            // if a country is selected, update the bubbles and legend with the new data of the selected year
            if (selectedCountryName) {
                d3.select(".selected-country-and-year")
                    .text(`${selectedCountryName.toUpperCase()}'s most streamed songs of ${selectedYear}`);

                let filteredData = currentData.filter(d => d.region === selectedCountryName);
                let songStreams = filteredData.reduce((acc, curr) => {
                    if (acc[curr.url]) {
                        acc[curr.url][1] += parseInt(curr.streams);
                        acc[curr.url][3] = Math.max(acc[curr.url][3], curr.streams);
                        acc[curr.url][4] = Math.min(acc[curr.url][4], curr.rank);
                    } else {
                        acc[curr.url] = [curr.title, parseInt(curr.streams), curr.artist, parseInt(curr.streams), parseInt(curr.rank)];
                    }
                    return acc;
                }, {});
                let sortedSongStreams = Object.entries(songStreams)
                    .sort((a, b) => b[1][1] - a[1][1])
                    .map((song, index) => [song[0], [...song[1], index]]);
                countryTopSongs = sortedSongStreams.slice(0, 80);
                let countryHighestStreams = sortedSongStreams[0] ? sortedSongStreams[0][1][1] : 1;
                let countryLowestStreams = sortedSongStreams[countryTopSongs.length - 1] ? sortedSongStreams[countryTopSongs.length - 1][1][1] : 1;

                // update bubbles
                generateBubbles(countryTopSongs, countryLowestStreams, countryHighestStreams, globeProjection);
                scaleSvg.selectAll('*').remove();
                addSizeLegend(countryLowestStreams, countryHighestStreams);
                scaleText.text("Number of Streams");
            } else {
                d3.select(".selected-country-and-year").text("Click on a country to find out more!");
            }
            if (selectedCountryFeature) {
            let centroid = d3.geoCentroid(selectedCountryFeature);
            let currRotate = globeProjection.rotate();
            let targetRotate = [-centroid[0], -centroid[1]];
            
            d3.transition()
                .duration(1000)
                .tween("rotate", () => {
                    let interpolate = d3.interpolate(currRotate, targetRotate);
                    return (t) => {
                        globeProjection.rotate(interpolate(t));
                        d3.select(".globe-group").selectAll("path")
                            .attr("d", d3.geoPath().projection(globeProjection));
                    };
                });
            }
        }
    }

    // year selection buttons
    leftArea.append("div")
        .attr("class", "select-year-btn selected-year")
        .on("click", function () { handleYearSelection.call(this, 2017); })
        .text("2017");
    leftArea.append("div")
        .attr("class", "select-year-btn")
        .on("click", function () { handleYearSelection.call(this, 2018); })
        .text("2018");
    leftArea.append("div")
        .attr("class", "select-year-btn")
        .on("click", function () { handleYearSelection.call(this, 2019); })
        .text("2019");
    leftArea.append("div")
        .attr("class", "select-year-btn")
        .on("click", function () { handleYearSelection.call(this, 2020); })
        .text("2020");
    leftArea.append("div")
        .attr("class", "select-year-btn")
        .on("click", function () { handleYearSelection.call(this, 2021); })
        .text("2021");

    let tooltip = d3.select('#vis1').append("div")
        .attr("class", "tooltip-globe")
        .style("position", "absolute")
        .style("z-index", "2")
        .style("padding", "0.5rem")
        .style("border-radius", "1.8rem")
        .style("pointer-events", "none")
        .style("opacity", 0);

    middleArea.append("text")
        .attr("class", "selected-country-and-year")
        .text(selectedCountryName ?
            `${selectedCountryName.toUpperCase()}'s most streamed songs of ${selectedYear}` :
            "Click on a country to find out more!")
        .style("align-self", "center");

    globeArea = middleArea.append("div")
        .attr("class", "row")
        .style("flex", "1")
        .style("background-color", "transparent");
    // create SVG element
    globeSvg = globeArea.append("svg")
        .attr("class", "globe-svg")
        .attr("width", width)
        .attr("height", height);

    function redrawGlobe() {
        globeSvg.selectAll(".globe-group").remove();

        // create a group for globe
        let globeGroup = globeSvg.append("g").attr("class", "globe-group");

        // vars for rotation
        let lastX, lastY, rotation = [0, 0];

        // vars for zoom
        let scale = 200;

        const projection = d3.geoOrthographic()
            .scale(scale)
            .translate([
                globeArea.node().getBoundingClientRect().width / 2,
                globeArea.node().getBoundingClientRect().height / 2
            ])
            .center([0, 0]);
        globeProjection = projection;
        const path = d3.geoPath().projection(projection);

        // https://d3js.org/world-110m.v1.json
        d3.json("https://cdn.jsdelivr.net/npm/world-atlas@2/countries-110m.json").then(world => {
            const countries = topojson.feature(world, world.objects.countries);
            const defs = globeSvg.append("defs");
            const filter = defs.append("filter").attr("id", "glow");
            filter.append("feGaussianBlur")
                .attr("stdDeviation", '20')
                .attr("result", "coloredBlur");
            const feMerge = filter.append("feMerge");
            feMerge.append("feMergeNode").attr("in", "coloredBlur");
            feMerge.append("feMergeNode").attr("in", "SourceGraphic");

            globeGroup.append("path")
                .datum({ type: "Sphere" })
                .attr("class", "globe")
                .attr("d", path)
                .style("filter", "url(#glow)")
                .on("click", (event) => {
                    if (selectedCountry) {
                        d3.select(selectedCountry).style("fill", green);
                    }
                    selectedCountry = null;
                    selectedCountryName = "";
                });

            globeGroup.selectAll(".country")
                .data(countries.features)
                .enter().append("path")
                .attr("class", "country")
                .style("fill", d => {
                    return (selectedCountryName === d.properties.name) ? lightGreen :
                        (spotifyCountries[selectedYear].has(d.properties.name)) ? green : medGrey;
                })
                .style("transition", "opacity 0.3s ease, transform 0.3s ease")
                .attr("d", path)
                .on("click", (event, d) => {
                    if (spotifyCountries[selectedYear].has(d.properties.name)) {
                        rightArea.selectAll('*').remove();
                        globeSvg.selectAll('image').remove();
                        globeSvg.selectAll('clipPath').remove();
                        scaleSvg.selectAll('*').remove();
                        scaleText.text("");

                        if (selectedCountry) {
                            d3.select(selectedCountry).style("fill", green);
                        }
                        selectedCountry = event.target;
                        d3.select(selectedCountry).style("fill", lightGreen);
                        selectedCountryName = d.properties.name;
                        sessionStorage.setItem("countrySelected", selectedCountryName);
                        d3.select(".selected-country-and-year")
                            .text(`${selectedCountryName.toUpperCase()}'s most streamed songs of ${selectedYear}`);
                        // rotate smoothly
                        let centroid = d3.geoCentroid(d); // [x, y] coordinates of the centroid
                        let currRotate = projection.rotate();
                        let targetRotate = [-centroid[0], -centroid[1]];
                        d3.transition()
                            .duration(1000)
                            .tween("rotate", () => {
                                let interpolate = d3.interpolate(currRotate, targetRotate);
                                return (t) => {
                                    projection.rotate(interpolate(t));
                                    globeGroup.selectAll("path").attr("d", path);
                                    // for drag
                                    rotation = interpolate(t);
                                    lastX = targetRotate[0];
                                    lastY = targetRotate[1];
                                }
                            })
                        projection.rotate([-centroid[0], -centroid[1]]);
                        globeGroup.selectAll("path").attr("d", path);

                        let filteredData = currentData.filter(d => d.region === selectedCountryName);
                        let songStreams = filteredData.reduce((acc, curr) => {
                            if (acc[curr.url]) {
                                acc[curr.url][1] += parseInt(curr.streams);
                                acc[curr.url][3] = Math.max(acc[curr.url][3], curr.streams);
                                acc[curr.url][4] = Math.min(acc[curr.url][4], curr.rank);
                            } else {
                                acc[curr.url] = [curr.title, parseInt(curr.streams), curr.artist, parseInt(curr.streams), parseInt(curr.rank)];
                            }
                            return acc;
                        }, {});
                        let sortedSongStreams = Object.entries(songStreams)
                            .sort((a, b) => b[1][1] - a[1][1])
                            .map((song, index) => [song[0], [...song[1], index]]);
                        countryTopSongs = sortedSongStreams.slice(0, 80);
                        let countryHighestStreams = sortedSongStreams[0] ? sortedSongStreams[0][1][1] : 1;
                        let countryLowestStreams = sortedSongStreams[countryTopSongs.length - 1] ? sortedSongStreams[countryTopSongs.length - 1][1][1] : 1;
                        generateBubbles(countryTopSongs, countryLowestStreams, countryHighestStreams, projection);
                        scaleSvg.selectAll('*').remove();
                        addSizeLegend(countryLowestStreams, countryHighestStreams);
                        scaleText.text("Number of Streams");
                    } else {
                        d3.select(selectedCountry).style("fill", green);
                        selectedCountry = null;
                        selectedCountryName = "";
                    }
                })
                .on("mouseover", (event, d) => {
                    if (spotifyCountries[selectedYear].has(d.properties.name)) {
                        tooltip.style("opacity", 0.9)
                            .style("left", `${event.pageX + 5}px`)
                            .style("top", `${event.pageY - 5}px`)
                            .style("background-color", '#2f2f2f')
                            .style("color", green)
                            .html(`${d.properties.name}`);
                        if (event.target !== selectedCountry) {
                            d3.select(event.target).style("fill", "#f0f0f0");
                        }
                    }
                })
                .on("mouseout", (event, d) => {
                    if (spotifyCountries[selectedYear].has(d.properties.name)) {
                        tooltip.style("opacity", 0);
                        if (event.target !== selectedCountry) {
                            d3.select(event.target).style("fill", green);
                        }
                    }
                });
        });

        const drag = d3.drag()
            .on("start", (event) => {
                lastX = event.x;
                lastY = event.y;
            })
            .on("drag", (event) => {
                let dx = event.x - lastX, dy = event.y - lastY;
                lastX = event.x;
                lastY = event.y;
                rotation[0] += dx * 0.4;
                rotation[1] -= dy * 0.4;
                projection.rotate(rotation);
                globeGroup.selectAll("path").attr("d", path);
            });
        const zoom = d3.zoom()
            .scaleExtent([150, 200])
            .on("zoom", (event) => {
                scale = event.transform.k;
                projection.scale(scale);
                globeGroup.selectAll("path").attr("d", path);
            });
        // apply drag and zoom behavior to SVG
        globeSvg.call(drag).call(zoom);
        selectedCountryFeature = d;
    }

    redrawGlobe();

    function generateBubbles(topSongs, lowestStreams, highestStreams, projection) {
        d3.select(".bubble-group").remove();
        scaleSvg.selectAll('*').remove();

        if (!topSongs.length) {
            scaleText.text("");
            return;
        }

        let bubbleGroup = globeSvg.append("g").attr("class", "bubble-group");
        let cx = globeArea.node().getBoundingClientRect().width / 2;
        let cy = globeArea.node().getBoundingClientRect().height / 2;
        let globeRadius = projection.scale() + 35;
        let numBubbles = topSongs.length;
        let angleStep = 2 * Math.PI / (numBubbles - 1);
        let bubbles = [];
        
        // Create a scale for bubble sizes based on streams
        const sizeScale = d3.scaleLinear()
            .domain([lowestStreams, highestStreams])
            .range([5, 30]); // Output range: bubble sizes between 5 and 30 pixels
        
        // Fisher-Yates shuffle to randomize order of topSongs
        for (let i = topSongs.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [topSongs[i], topSongs[j]] = [topSongs[j], topSongs[i]];
        }
        topSongs.forEach((song, index) => {
            let angle = index * angleStep;
            let x = cx + Math.cos(angle) * globeRadius;
            let y = cy + Math.sin(angle) * globeRadius;
            let size = sizeScale(song[1][1]); // bubble size
            x = Math.max(size, Math.min(x, globeArea.node().getBoundingClientRect().width - size)); // Clamp X to SVG width
            y = Math.max(size, Math.min(y, globeArea.node().getBoundingClientRect().height - size)); // Clamp Y to SVG height
            bubbles.push({
                x,
                y,
                size,
                trackId: song[0],
                name: song[1][0],
                totalStreams: song[1][1],
                artist: song[1][2],
                maxStreams: song[1][3],
                peakRank: song[1][4],
                rank: song[1][5],
            });
        });
        let simulation = d3.forceSimulation(bubbles)
            .force("x", d3.forceX(d => d.x).strength(0.2))
            .force("y", d3.forceY(d => d.y).strength(0.2))
            .force("collide", d3.forceCollide(d => d.size + 2))
            .on("tick", () => {
                bubbleGroup.selectAll("circle")
                    .attr("cx", d => d.x)
                    .attr("cy", d => d.y);
            });
        bubbleGroup.selectAll("circle")
            .data(bubbles)
            .enter().append("circle")
            .attr("class", "track-bubble")
            .attr("r", d => d.size)
            .attr("fill", darkGrey)
            .attr("opacity", 0.7)
            .style("transition", "opacity 0.5s ease")
            .on("click", function (event, d) {
                rightArea.selectAll('*').remove();
                globeSvg.selectAll('image').remove();
                globeSvg.selectAll('clipPath').remove();

                const clickedBubble = d3.select(this);

                if (selectedBubble && clickedBubble.node() === selectedBubble.node()) {
                    globeSvg.selectAll("circle.track-bubble")
                        .attr("opacity", 0.7)
                        .attr("fill", darkGrey);
                    selectedBubble = null;
                    rightArea.append("text")
                        .attr("class", "click-bubble-instruction")
                        .text("Click a bubble to view a song!");
                } else {
                    addSpotifyArt(d.trackId, [d.artist, d.totalStreams, d.maxStreams, d.peakRank, d.rank]);
                    globeSvg.selectAll("circle.track-bubble").attr("opacity", 0.2);
                    d3.select(this).attr("opacity", 0.7);
                    selectedBubble = this;
                    if (selectedBubble !== null) {
                        d3.select(selectedBubble).attr("fill", darkGrey);
                        d3.select(selectedBubble).select("image").remove();
                    }
                    //d3.select(this).attr("fill", green);
                    async function getSpotifyCoverArt(trackId) {
                        const embedUrl = `https://open.spotify.com/oembed?url=spotify:track:${trackId}`;
                        try {
                            const response = await fetch(embedUrl);
                            if (!response.ok) throw new Error("Failed to fetch data");
                            const data = await response.json();
                            return data.thumbnail_url;
                        } catch (error) {
                            console.error("Error fetching cover art:", error);
                            return null;
                        }
                    }
                    selectedBubble = d3.select(this);
                    getSpotifyCoverArt(d.trackId)
                        .then((thumbnailUrl) => {
                            {
                                if (thumbnailUrl) {
                                    // clipPath for a circular mask
                                    globeSvg.append("clipPath")
                                        .attr("id", `cover-art-clip-path`)
                                        .append("circle")
                                        .attr("cx", +selectedBubble.attr("cx"))
                                        .attr("cy", +selectedBubble.attr("cy"))
                                        .attr("r", +selectedBubble.attr("r"));
                                    globeSvg.append("image")
                                        .attr("x", +selectedBubble.attr("cx") - +selectedBubble.attr("r"))
                                        .attr("y", +selectedBubble.attr("cy") - +selectedBubble.attr("r"))
                                        .attr("width", 2 * +selectedBubble.attr("r"))
                                        .attr("height", 2 * +selectedBubble.attr("r"))
                                        .attr("xlink:href", thumbnailUrl)
                                        .attr("clip-path", `url(#cover-art-clip-path)`)
                                        .style("pointer-events", "none");
                                }
                            }
                        });
                }
            })
            .on("mouseover", function (event, d) {
                tooltip.style("opacity", 0.9)
                    .style("left", `${event.pageX + 5}px`)
                    .style("top", `${event.pageY - 5}px`)
                    .style("background-color", green)
                    .style("color", "#2f2f2f")
                    .html(`${d.name}`);
            })
            .on("mouseout", function (event, d) {
                tooltip.style("opacity", 0);
            });
        simulation.alpha(1).restart();
    }

    function addSizeLegend(lowestStreams, highestStreams) {
        const svgWidth = scaleSvg.node().getBoundingClientRect().width;
        const svgHeight = scaleSvg.node().getBoundingClientRect().height;
        
        const numLegendBubbles = 5;
        
        // Create a scale for bubble sizes
        const sizeLegendScale = d3.scaleLinear()
            .domain([lowestStreams, highestStreams])
            .range([5, 30]);
        
        // Create SVG group for legend
        const legendGroup = scaleSvg.append("g").attr("class", "size-legend");
        const verticalOffset = 60;
        legendGroup.append("line")
            .attr("x1", svgWidth / 2)
            .attr("y1", verticalOffset)
            .attr("x2", svgWidth / 2)
            .attr("y2", verticalOffset + 4 * 65)
            .style("stroke", "#3f3f3f")
            .style("stroke-width", 2);
        const bubbleSizes = d3.range(numLegendBubbles).map(i =>
            sizeLegendScale(lowestStreams + (i / (numLegendBubbles - 1)) * (highestStreams - lowestStreams))
        );
        bubbleSizes.forEach((size, i) => {
            legendGroup.append("circle") // Add each circle in legend with a size corresponding to stream value
                .attr("cx", svgWidth / 2)
                .attr("cy", verticalOffset + i * (size + 35))
                .attr("r", size)
                .style("fill", "#4f4f4f");
        });

        function formatNumber(num) {
            if (num >= 1e9) return (num / 1e9).toFixed(2) + "B";
            if (num >= 1e6) return (num / 1e6).toFixed(2) + "M";
            if (num >= 1e3) return (num / 1e3).toFixed(2) + "K";
            return num.toString();
        }
        legendGroup.append("text")
            .attr("x", svgWidth / 2)
            .attr("y", verticalOffset - 10)
            .attr("dy", "-5")
            .style("text-anchor", "middle")
            .style("font-size", "0.8rem")
            .text(formatNumber(lowestStreams))
            .style("fill", "white");
        legendGroup.append("text")
            .attr("x", svgWidth / 2)
            .attr("y", verticalOffset + 4 * 65 + 40)
            .attr("x", svgWidth / 2)
            .attr("y", verticalOffset + 4 * 65 + 40)
            .attr("dy", "15")
            .style("text-anchor", "middle")
            .style("font-size", "0.8rem")
            .text(formatNumber(highestStreams))
            .style("fill", "white");
    }
});

function addSpotifyArt(trackId, trackInfo) {
    let trackArtist = trackInfo[0];
    let trackTotalStreams = trackInfo[1];
    let trackMaxStreams = trackInfo[2];
    let trackPeakRank = trackInfo[3];
    let trackRank = trackInfo[4];

    async function getSpotifyCoverArt(trackId, addDisplay) {
        const embedUrl = `https://open.spotify.com/oembed?url=spotify:track:${trackId}`;
        try {
            const response = await fetch(embedUrl);
            if (!response.ok) throw new Error("Failed to fetch data");
            const data = await response.json();
            if (addDisplay) {
                createCircleTrackDisplay(trackId, data.thumbnail_url, data.title, trackArtist, trackTotalStreams, trackMaxStreams, trackPeakRank, trackRank, rightArea);
            }
            sessionStorage.setItem("globeTrackSelected", data.title);
            sessionStorage.setItem("globeTrackSelectedImg", data.thumbnail_url);
            return data.thumbnail_url;
        } catch (error) {
            console.error("Error fetching cover art:", error);
            return null;
        }
    }

    getSpotifyCoverArt(trackId, true);
}
