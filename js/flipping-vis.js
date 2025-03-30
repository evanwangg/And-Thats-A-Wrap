let promisesAll = [
    d3.csv("data/the_grammy_awards_cleaned.csv"),
    d3.csv("data/spotify600k.csv"),
    // d3.csv("data/spotify_mock_data.csv"),  // todo - forFinal : remove
]

d3.select('#flipping-vis').style("padding-left", "6rem").style("padding-right", "6rem");

initVis(promisesAll)

function initVis(promises) {
    loadAndCleanData(promises).then(combinedData => {
        const flipping_vis = d3.select("#flipping-vis");

        let layout = flipping_vis.append("div")
            .attr("id", "parent-container")
            .style("width", "100%")
            .style("height", "100vh");

        let topInfo = layout.append("div")
            .attr("id", "top-info")
            .attr("class", "top-info info-box info-text")
            .style("width", "100%")
            .style("height", "7.5%")
            .text("How popular are Grammy nominated Songs of the Year?");

        // topInfo.append("h6")
        // .attr("class", "top-info info-box info-text")
        // .text("Use the slider to filter through the Spotify popularity score");

        let barChartWithSlider = layout.append("div")
            .attr("id", "graphing-area")
            .style("width", "100%")
            .style("height", "35%");

        let barChartArea = barChartWithSlider.append("div")
            .attr("id", "bar-chart-area");

        let svgArea = barChartArea.append("div")
            .attr("id", "svg-area")
            .style("width", "100%")
            .style("height", "90%");

        let svgTitle = barChartArea.append("div")
            .attr("id", "svg-title")
            .style("width", "100%")
            .style("height", "10%");

        svgTitle.append("h6")
            .text("Song Popularity Score (higher values indicate greater popularity on Spotify)")


        // todo remove
        let margins = { top: 30, right: 30, bottom: 25, left: 50 };

        let barChartWidth = document.getElementById("bar-chart-area").getBoundingClientRect().width - margins.left - margins.right;
        let barChartHeight = document.getElementById("bar-chart-area").getBoundingClientRect().height - margins.top - margins.bottom;

        let xScale = d3.scaleLinear()
            .domain([1, 100])  // Popularity is between 0 and 100
            .range([0, barChartWidth]);

        let yScale = d3.scaleLinear()
            .domain([0, d3.max(combinedData, d => d.popularity)])
            .range([barChartHeight, margins.top]);

        let svg = svgArea.append("svg")
            .attr("width", barChartWidth)
            .attr("height", barChartHeight)

        svg.append("rect")
            .attr("x", 0)
            .attr("y", 0)
            .attr("fill", "none")
            .attr("width", barChartWidth)
            .attr("height", barChartHeight + margins.top + margins.bottom)
            ;
        // .attr("fill", "grey");

        let histogram = d3.histogram()
            .value(d => d.popularity)
            .domain(xScale.domain())
            .thresholds(xScale.ticks(100));

        // Process the data into bins
        let bins = histogram(combinedData.filter(d => d.popularity !== null));

        // Update the yScale based on the bin data
        yScale.domain([0, d3.max(bins, d => d.length)]);

        // create bars for the histogram
        svg.selectAll(".bar")
            .data(bins)
            .enter()
            .append("rect")
            .attr("class", "bar")
            .attr("x", d => xScale(d.x0))
            .attr("y", d => yScale(d.length) - margins.bottom)
            .attr("width", d => xScale(d.x1) - xScale(d.x0) - 1)
            .attr("height", d => barChartHeight - yScale(d.length))
            .attr("fill", "#1db954") // tooltip behavior
            .on("mouseover", function (event, d) {
                let years = d.map(song => song.year).join(", ");
                let scores = d.x0;

                tooltip.style("visibility", "visible")
                    .html(`<strong>Year(s):</strong> ${years}<br><strong>Popularity:</strong> ${scores}`);
            })
            .on("mousemove", function (event) {
                tooltip.style("top", `${event.pageY - 10}px`)
                    .style("left", `${event.pageX + 10}px`);
            })
            .on("mouseleave", function () {
                tooltip.style("visibility", "hidden");
            });

        // create tooltip div (initially hidden)
        let tooltip = d3.select("body").append("div")
            .attr("id", "tooltip")
            .style("position", "absolute")
            .style("background", "rgba(0, 0, 0, 0.8)")
            .style("color", "white")
            .style("padding", "6px")
            .style("border-radius", "4px")
            .style("font-size", "12px")
            .style("pointer-events", "none")
            .style("visibility", "hidden");

        let sliderArea = barChartWithSlider.append("div")
            .attr("id", "slider-child")
            .style("width", barChartWidth - margins.left + "px")
            .style("height", "7.5%");

        // create the x-axis at the bottom of the chart
        let xAxis = d3.axisBottom(xScale)
            .ticks(10)
            .tickSize(6);

        // Append the x-axis to the svg, positioning it at the bottom
        svg.append("g")
            .attr("class", "x-axis")
            .attr("transform", `translate(0, ${barChartHeight - margins.bottom})`)
            .call(xAxis)
            .style("stroke", "white")
            .selectAll("text")
            .style("fill", "white");

        // y-axis
        let yAxis = d3.axisLeft(yScale)
            .ticks(4)
            .tickSize(6);

        svg.append("g")
            .attr("class", "y-axis")
            .attr("transform", `translate(${margins.left / 2}, ${-margins.bottom})`)
            .call(yAxis)
            .style("stroke", "white")
            .selectAll("text")
            .style("fill", "white");

        // y title
        svg.append("text")
            .attr("class", "axis-title info-text")
            .attr("x", -barChartHeight / 2)
            .attr("y", margins.left - 10)
            .attr("transform", "rotate(-90)")
            .attr("text-anchor", "middle")
            .style("font-size", "0.6em")
            // .style("font-weight", "bold")
            .text("Number of Songs");

        let vinyl_stack = layout.append("div")
            .attr("id", "vinyl-area")
            .style("width", "100%")
            .style("height", "40%");

        let vinylAreaWrapper = vinyl_stack.append("div")
            .attr("id", "vinyl-wrapper")
            .style("width", "100%")
            .style("height", "100%");

        let bottomInfo = layout.append("div")
            .attr("id", "bottom-info")
            .attr("class", "bottom-info")
            .style("width", "100%")
            .style("height", "7.5%");

        let bottomtext = bottomInfo.append("div")
            .attr("class", "info-box info-text")
            .style("flex", "4")
            .style("top", "0")
            .style("left", "0")
            // .style("background-color", "red")
            .style("height", "100%")
            .append("p")
            .text("Click on a CD to flip and hover-out to close!");

        let toggleButton = bottomInfo.append("div")
            .attr("id", "toggle-button")
            .style("text-align", "center")
            .style("flex", "1")
            .style("margin-top", "0px");

        toggleButton.append("button")
            .attr("id", "histogram-toggle")
            .text("Hide Histogram")
            .on("click", function () {
                toggleHistogram(svgArea);
            });

        createSlider(combinedData)
    })
}

async function loadAndCleanData(promises) {
    return Promise.all(promises)
        .then(async function ([grammyData, spotifyData]) {
            let filteredData = grammyData.filter(d => (d.category.toLowerCase() === "song of the year"));
            let filteredGrammyData = filteredData.filter(d => !(d.nominee === "" && d.artist === ""));

            filteredGrammyData.forEach(d => {
                if (d.artist === "" && d.nominee !== "") {
                    let extractedArtist = d.workers.match(/\(([^)]+)\)/);
                    d.artist = extractedArtist[1];  // replace artist with nominee value
                }
                d.year = +d.year;
            });

            // let filteredGrammyData = []

            spotifyData.forEach(d => {
                d.popularity = +d.popularity;
                d.id = d.id;
            });

            const combinedData = await Promise.all(filteredGrammyData.map(async songGrammy => {
                let spotifyInfo = spotifyData.find(s =>
                    s.name && songGrammy.nominee &&
                    s.name.toLowerCase() === songGrammy.nominee.toLowerCase() &&
                    s.artists && songGrammy.artist &&
                    s.artists.toLowerCase() === songGrammy.artist.toLowerCase()
                );

                if (!spotifyInfo) {
                    spotifyInfo = spotifyData.find(s =>
                        s.name && songGrammy.nominee &&
                        s.name.toLowerCase().includes(songGrammy.nominee.toLowerCase()) &&
                        s.artists && songGrammy.artist &&
                        s.artists.toLowerCase().includes(songGrammy.artist.toLowerCase())
                    );
                }

                let trackId = spotifyInfo ? spotifyInfo.id : null;
                let coverArt = trackId ? await getSpotifyCoverArt(trackId) : null;

                return {
                    ...songGrammy,
                    popularity: spotifyInfo ? spotifyInfo.popularity : null,
                    id: spotifyInfo ? spotifyInfo.id : null,
                    coverArt: coverArt
                };
            }));

            // data = combinedData
            combinedData.sort((b, a) => b.year - a.year);
            return combinedData;


        })
        .catch(function (err) {
            console.log(err);
        })
}  // end of load data

function createSlider(combinedData) {
    let slider = document.getElementById('slider-child');
    // sliderArea.innerHTML = "";

    // Create a new div inside #slider-area for noUiSlider
    let minPop = 1
    let maxPop = 100

    noUiSlider.create(slider, {
        start: [minPop, maxPop],
        connect: true,
        range: {
            'min': minPop,
            'max': maxPop
        },
        step: 1,
        tooltips: true,
        format: {
            to: value => Math.round(value),
            from: value => Math.round(value)
        }
    });

    slider.noUiSlider.on("update", function (values) {
        let selectedMin = values[0];
        let selectedMax = values[1];
        let filteredSongs = combinedData.filter(song =>
            song.popularity !== null && song.popularity >= selectedMin && song.popularity <= selectedMax
        );
        let numberVinyls = filteredSongs.length
        updateVisualization(filteredSongs, numberVinyls);
    });
}  // end of createSlider

function updateVisualization(combinedData, numberVinyls) {
    let vinylAreaWrapper = d3.select("#vinyl-wrapper");
    // Clear previous visualization
    vinylAreaWrapper.selectAll("*").remove();

    // Create new elements based on the filtered songs
    combinedData.forEach((song, i) => {
        new Vinyl("vinyl-wrapper", i, combinedData.length,
            song.coverArt, numberVinyls, song.year, song.artist, song.nominee, song.popularity);
    });
}

async function getSpotifyCoverArt(trackId) {
    // "18lMbnzRr3ZuTktR9kWvGs"
    const embedUrl = `https://open.spotify.com/oembed?url=spotify:track:${trackId}`;
    try {
        const response = await fetch(embedUrl);
        if (!response.ok) {
            // throw new Error("Failed to fetch data");
            throw new Error(`HTTP ${response.status} - ${response.statusText}`);
        }
        const data = await response.json();
        return data.thumbnail_url;
    } catch (error) {
        console.error("Error fetching cover art:", error);
        return null;
    }
}

function toggleHistogram(svgArea) {
    const histogramVisible = svgArea.style("display") !== "none";

    // Toggle visibility
    if (histogramVisible) {
        svgArea.style("display", "none");
        d3.select("#histogram-toggle").text("Show Histogram");
    } else {
        svgArea.style("display", "block");
        d3.select("#histogram-toggle").text("Hide Histogram");
    }
}
