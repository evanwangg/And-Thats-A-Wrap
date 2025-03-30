let billboard_container = document.getElementById("billboard-vis");

d3.csv('data/billboard_100.csv').then(function (data) {

    // format the data (convert 'weeks-on-board' to integer and 'date' to Date)
    data.forEach(function (d) {
        d['weeks-on-board'] = +d['weeks-on-board']; // convert to number
        d['rank'] = +d['rank']; // ensure rank is a number
        d['date'] = new Date(d['date']); // convert to Date object
    });

    // create the svg
    const chart_width = billboard_container.offsetWidth * 0.8;
    const chart_height = billboard_container.offsetHeight * 0.6;
    const margin = { top: 20, right: 20, bottom: 50, left: 60 };

    const svg = d3.select('#billboard-chart')
        .append('svg')
        .attr('width', chart_width)
        .attr('height', chart_height);

    // function to generate custom tick values
    function generateCustomTicks() {
        const ticks = [];
        let currentTick = 1;

        while (currentTick <= 100) {
            ticks.push(currentTick);
            if (ticks.length === 1) {
                currentTick += 9;  // add 9 for the first tick
            } else {
                currentTick += 10; // add 10 for subsequent ticks
            }
        }

        return ticks;
    }

    const container = d3.select("#billboard-artist-search")
        .append("foreignObject")
        .attr("x", 0)
        .attr("y", 10)
        .attr("width", "100%")
        .attr("height", 30)
        .append("xhtml:div")
        .attr("type", "text")
        .attr("class", "artist-filter");

    // tooltip div
    const tooltip = d3.select('#billboard-chart')
        .append('div')
        .attr('class', 'billboard-tooltip')
        .attr('pointer-events', 'none')
        .style('position', 'absolute')
        .style('background-color', '#0f5728')
        .style('color', '#fff')
        .style('padding', '5px')
        .style('border-radius', '5px')
        .style('opacity', 0);

    const instructions = d3.select('#billboard-placeholder')
        .append('text')
        .attr('class', 'placeholder-text')
        .attr('text-anchor', 'middle')
        .style('color', '#ffffff')
        .text('Search an artist name (e.g. Taylor Swift, Beyoncé) to see their Billboard Hot 100 history!');

    const search_container = container.append("foreignObject")
        .attr("x", 0)
        .attr("y", 60)
        .attr("width", "100%")
        .attr("height", 180)
        .style("z-index", "2")
        .append("xhtml:div")
        .style("position", "relative");

    const input = search_container.append("input")
        .attr("type", "text")
        .attr("placeholder", "Enter Artist Name")
        .attr("class", "artist-filter")
        .style("width", "100%")
        .style("background-color", "#2a2a2a")
        .style("color", "#f0f0f0")
        .style("border-radius", "3rem")
        .style("border", "1px solid #f0f0f0")
        .style("padding", "0.5rem")
        .style("margin", "0.5rem 0");

    const suggestionBox = search_container.append("div")
        .attr("class", "suggestion-box")
        .style("position", "absolute")
        .style("top", "3rem")
        .style("width", "100%")
        .style("max-height", "130px")
        .style("background-color", "#2a2a2a")
        .style("display", "none");

    let filteredArtists = Array.from(new Set(data.map(d => d.artist)));
    let previousInput = "";

    input.on("input", function () {
        const enteredArtist = this.value.toLowerCase();

        // reset filteredArtists based on the current data
        filteredArtists = Array.from(new Set(data.filter(d => d.artist.toLowerCase().includes(enteredArtist)).map(d => d.artist)));
        previousInput = enteredArtist;

        suggestionBox.html("");
        filteredArtists.forEach(artist => {
            suggestionBox.append("div")
                .text(artist)
                .style("padding", "5px")
                .style("cursor", "pointer")
                .style("color", "#f0f0f0")
                .on("click", function () {
                    input.node().value = artist;
                    sessionStorage.setItem('lastSearchedArtist', artist);
                    suggestionBox.style("display", "none");
                    selectedArtist = artist;
                    applyFilters(); // apply the filter to update the chart
                });
        });

        suggestionBox.style("display", filteredArtists.length ? "block" : "none")
            .style("overflow-y", "auto");
    });

    let selectedArtist = ''; // this will hold the selected artist
    let filteredData = data; // start with all data

    // Hide suggestions when clicking outside
    d3.select("body").on("click", function (event) {
        if (!container.node().contains(event.target)) {
            suggestionBox.style("display", "none");
        }
    });

    // update chart function
    function updateChart(filteredData) {

        // aggregate the data by rank and summing up the 'weeks-on-board' for each rank
        let rankData = d3.groups(filteredData, d => d.rank) // group by rank
            .map(([rank, group]) => ({
                rank: rank,
                totalWeeks: d3.sum(group, d => d['weeks-on-board']), // sum the weeks for each rank
                songs: group // keep all the songs at this rank
            }));

        // remove duplicate songs within the same rank and select the one with the highest number of consecutive weeks
        rankData.forEach(d => {
            let songMap = new Map();

            d.songs.forEach(song => {
                // if the song already exists, update its consecutive weeks if the current song has more weeks
                if (songMap.has(song.song)) {
                    let existing = songMap.get(song.song);
                    // assuming that consecutive weeks are considered as weeks-on-board
                    if (song['weeks-on-board'] > existing['weeks-on-board']) {
                        songMap.set(song.song, song);
                    }
                } else {
                    songMap.set(song.song, song);
                }
            });

            // convert the song map back to an array and sort by weeks-on-board
            d.songs = Array.from(songMap.values()).sort((a, b) => b['weeks-on-board'] - a['weeks-on-board']);
        });

        // set up scales
        const x = d3.scaleBand()
            .domain(d3.range(1, 101))
            .range([margin.left, chart_width - margin.right])
            .padding(0.1);

        const y = d3.scaleLinear()
            .domain([0, d3.max(rankData, d => d.totalWeeks)])
            .nice()
            .range([chart_height - margin.bottom, margin.top]);

        const xAxis = svg.selectAll('.billboard-axis-x')
            .data([0])
            .join(
                enter => enter.append('g')
                    .attr('class', 'billboard-axis-x')
                    .attr('transform', `translate(0,${chart_height - margin.bottom})`)
                    .style('stroke', 'white')
                    .style('stroke-width', '0.7px')
                    .style('font-size', '10px')
                    .call(d3.axisBottom(x).tickValues(generateCustomTicks()))
                    .call(enter => enter.transition().duration(50)),
                update => update.transition().duration(50),
                exit => exit.transition().duration(50).remove()
            );
        // create/update Y-axis
        svg.selectAll('.billboard-axis-y')
            .transition()
            .duration(50)
            .call(d3.axisLeft(y));

        const yAxis = svg.selectAll('.billboard-axis-y')
            .data([0])
            .join(
                enter => enter.append('g')
                    .attr('class', 'billboard-axis-y')
                    .attr('transform', `translate(${margin.left},0)`)
                    .style('color', 'white')
                    .style('font-size', '10px')
                    .call(d3.axisLeft(y))
                    .call(enter => enter.transition().duration(50)),
                update => update.transition().duration(50),
                exit => exit.transition().duration(50).remove()
            );

        // add axis labels
        svg.append('text')
            .attr('class', 'billboard-title')
            .attr('transform', `translate(${chart_width / 2},${chart_height - margin.bottom + 40})`)
            .attr('text-anchor', 'middle')
            .style('font-size', '14px')
            .style('fill', 'white')
            .text('Billboard Hot 100 Rank');

        svg.append('text')
            .attr('class', 'billboard-title')
            .attr('transform', `rotate(-90)`)
            .attr('x', -chart_height / 2 + 20)
            .attr('y', margin.left - 50)
            .attr('text-anchor', 'middle')
            .style('font-size', '14px')
            .style('fill', 'white')
            .text('Total Number of Weeks at Rank');

        const bars = svg.selectAll('.billboard-bar')
            .data(rankData, d => d.rank) // key function to track bars by rank
            .join(
                enter => enter.append('rect')
                    .attr('class', 'billboard-bar')
                    .attr('x', d => x(d.rank))
                    .attr('y', d => y(0))  // Start from 0 to animate from bottom
                    .attr('width', x.bandwidth())
                    .attr('height', 0) // Initial height for the transition
                    .attr('fill', '#1db954')
                    .on('mouseover', function (event, d) {
                        let topSongs = d.songs.slice(0, 3);
                        let tooltipContent = `
                            Top Songs at Rank ${d.rank}:<br>
                            ${topSongs.map(song => `${song.song} by ${song.artist} (${song['weeks-on-board']} weeks)`).join('<br>')}
                        `;
                        tooltip.html(tooltipContent)
                            .style('opacity', 0.9)
                            .style('left', (event.pageX + 10) + 'px')
                            .style('top', (event.pageY + 15) + 'px');
                    })
                    .on('mouseout', function () {
                        tooltip.html('').style('opacity', 0);
                    })
                    .call(enter => enter.transition().duration(50) // Transition to the final position
                        .attr('y', d => y(d.totalWeeks))
                        .attr('height', d => chart_height - margin.bottom - y(d.totalWeeks))
                    ),
                update => update.transition().duration(50) // Update the height and position for existing bars
                    .attr('y', d => y(d.totalWeeks))
                    .attr('height', d => chart_height - margin.bottom - y(d.totalWeeks)),
                exit => exit.transition().duration(50).attr('height', 0).remove() // Transition out bars
            );
    }

    // apply filters and update chart
    function applyFilters() {
        filteredData = data.filter(d => d.artist.toLowerCase().includes(selectedArtist.toLowerCase()));

        // update the timeline domain specific to the artist
        const artistExtent = d3.extent(filteredData, d => d.date); // get the date range for the selected artist
        xTimeline.domain(artistExtent);  // update the timeline domain based on the artist's data

        // redraw the timeline axis to reflect the updated domain
        timelineSvg.select('.billboard-timeline-axis')
            .call(d3.axisBottom(xTimeline));

        updateChart(filteredData);
    }

    // create a new SVG for the timeline (brushable area)
    const brush_width = billboard_container.offsetWidth * 0.6;
    const brush_height = billboard_container.offsetHeight * 0.1;
    const marginTimeline = { top: 10, right: 20, bottom: 10, left: 60 };

    const timelineSvg = d3.select('#billboard-brush')
        .append('svg')
        .attr('width', brush_width)
        .attr('height', brush_height);

    // create scale
    const xTimeline = d3.scaleTime()
        .domain(d3.extent(data, d => d.date))
        .range([marginTimeline.left, brush_width - marginTimeline.right]);

    // create axis
    timelineSvg.append('g')
        .attr('transform', `translate(0,${brush_height / 2})`)
        .attr('class', 'billboard-timeline-axis')
        .style('color', 'white')
        .style('font-size', '12px')
        .call(d3.axisBottom(xTimeline));

    // create the brush for timeline interaction
    const brush = d3.brushX()
        .extent([[marginTimeline.left, 0], [brush_width - marginTimeline.right, brush_height]])
        .on("brush end", brushed);

    // apply brush to the timeline
    timelineSvg.append('g')
        .attr('class', 'brush')
        .call(brush);

    // center the selection area vertically
    timelineSvg.selectAll(".selection").attr("y", (brush_height - 10) / 2);

    // brush handling function
    function brushed(event) {
        const selectedRange = event.selection;
        if (!selectedRange) return;

        const [x0, x1] = selectedRange;

        // filter the data based on the selected date range and artist filter
        const filteredByArtistAndDate = filteredData.filter(d => {
            const songDate = d.date.getTime();
            return songDate >= xTimeline.invert(x0).getTime() && songDate <= xTimeline.invert(x1).getTime();
        });

        // update the chart with the filtered data
        updateChart(filteredByArtistAndDate);
    }

    // create the button to reset brushing
    d3.select("#billboard-brush")
        .append('button')
        .attr('id', 'reset-button')
        .text('Reset Brushing')
        .style('padding', '8px 16px')
        .style('background-color', '#1db954')
        .style('color', '#fff')
        .style('border', 'none')
        .style('border-radius', '4px')
        .style('cursor', 'pointer')
        .on('click', function () {
            // stop autoplay if it's active
            if (autoplayActive) {
                stopAutoplayBrushing();
            }
            // reset the brush selection to the full extent of the data
            // const fullExtent = d3.extent(data, d => d.date);
            // xTimeline.domain(fullExtent); // reset the timeline domain

            // clear the brush selection
            timelineSvg.select('.brush').call(brush.move, null);

            // reset the chart to show all filtered data
            updateChart(filteredData);
        });

    let autoplayActive = false;  // track whether autoplay is active

    // add autoplay button
    d3.select('#billboard-brush')
        .append('button')
        .attr('id', 'autoplay-button')
        .text('Start Autoplay')
        .style('padding', '8px 16px')
        .style('background-color', '#1db954')
        .style('color', '#fff')
        .style('border', 'none')
        .style('border-radius', '4px')
        .style('margin-left', '10px')
        .style('cursor', 'pointer')
        .on('click', function () {
            if (autoplayActive) {
                stopAutoplayBrushing(); // stop autoplay if active
                // timelineSvg.select('.brush')
                // .call(brush.move, [xTimeline.range()[0], xTimeline.range()[1]]); // reset brush to full extent
                timelineSvg.select('.brush').call(brush.move, null); // clear the brush selection
            } else {
                startAutoplayBrushing(); // start autoplay if inactive
            }
        });

    // autoplay brushing function
    function startAutoplayBrushing() {
        autoplayActive = true; // set autoplay to active
        d3.select('#autoplay-button').text('Stop Autoplay'); // update button text

        const totalDuration = 2000;
        const stepDuration = 50;

        let currentX = xTimeline.range()[0]; // start from the left
        const endX = xTimeline.range()[1]; // end at the right

        const brushWidth = (endX - currentX) * 0.2;

        function autoplayStep() {
            if (!autoplayActive) return; // stop if autoplay is no longer active

            const nextX = currentX + (endX - currentX) * 0.02; // move to the right

            // apply brush move
            timelineSvg.select('.brush')
                .call(brush.move, [currentX, nextX + brushWidth]);

            currentX = nextX;

            if (nextX + brushWidth >= endX) {
                stopAutoplayBrushing(); // stop if end of timeline is reached

                // timelineSvg.select('.brush')
                // .call(brush.move, [xTimeline.range()[0], xTimeline.range()[1]]); // reset brush to full extent
                timelineSvg.select('.brush').call(brush.move, null); // clear the brush selection
            } else {
                setTimeout(autoplayStep, stepDuration); // keep going until end of timeline
            }
        }

        autoplayStep(); // start the autoplay
    }

    // stop the autoplay brushing
    function stopAutoplayBrushing() {
        autoplayActive = false; // set autoplay to inactive
        d3.select('#autoplay-button').text('Start Autoplay'); // update button text
        timelineSvg.select('.brush').call(brush.move, null); // clear the brush selection
    }

    // create "Reset Search" button
    d3.select("#billboard-artist-search")
        .append('button')
        .attr('id', 'reset-search-button')
        .text('Reset Search')
        .style('padding', '8px 16px')
        .style('background-color', '#1db954')
        .style('color', '#fff')
        .style('border', 'none')
        .style('border-radius', '4px')
        .style('margin-left', input.node().offsetWidth / 5 + 'px')
        .style('cursor', 'pointer')
        .on('click', function () {
            // reset the input and clear the artist filter
            input.node().value = '';
            selectedArtist = '';
            applyFilters(); // reset the chart to show all data
        });

    // initial render with all data
    updateChart(filteredData);
});
