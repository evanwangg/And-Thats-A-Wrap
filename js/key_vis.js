import spotifyDataPromise from "./dataloading.js";

let key_container = document.getElementById('key-vis');
let keyChart_container = document.getElementById('keys-chart-container');
let keySongs_container = d3.select('#keys-songs-container');

let keySelected = 0;
let keyMode = 1; // 0 = minor, 1 = major
let start_new;

spotifyDataPromise.then(data => {
    // Prepare the data
    data.forEach(row => {
        row.trackID = row.id;
        row.title = row.name;
        row.artists = row.artists;
        row.date = new Date(row.release_date);
        row.key = +row.key;
        row.mode = +row.mode;
    });

    // Group songs by year, mode, and key
    let yearKeyModeCount = {};

    data.forEach(d => {
        let year = d.date.getFullYear();
        let key = d.key;
        let mode = d.mode;

        // Initialize the year if it doesn't exist
        if (!yearKeyModeCount[year]) yearKeyModeCount[year] = {};

        // Initialize the mode (0 or 1) for the year if it doesn't exist
        if (!yearKeyModeCount[year][mode]) {
            yearKeyModeCount[year][mode] = {};
        }

        // Initialize the key count for the specific key and mode if it doesn't exist
        if (!yearKeyModeCount[year][mode][key]) {
            yearKeyModeCount[year][mode][key] = 0;
        }

        // Increment the count for the specific key and mode
        yearKeyModeCount[year][mode][key]++;
    });

    // Set up the chart dimensions
    let margin = {top: 20, right: 30, bottom: 50, left: 100};
    let width = (keyChart_container.offsetWidth) - margin.left - margin.right;
    let height = (keyChart_container.offsetHeight) - margin.top - margin.bottom;

    // Append SVG to container
    let svg = d3.select("#key-chart").append("svg")
        .attr("width", width + margin.left + margin.right)
        .attr("height", height + margin.top + margin.bottom)
        .append("g")
        .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

    let keysLineChartTooltip = d3.select("body").append('div')
        .attr('class', 'intake-tooltip');

    let key_index = 0;
    let keyNotesPositions = [
        { note_index: 0, note: "C", yPosition: 80},
        { note_index: 1, note: "C♯/D♭", yPosition: 80},
        { note_index: 2, note: "D", yPosition: 70},
        { note_index: 3, note: "D♯/E♭", yPosition: 70},
        { note_index: 4, note: "E", yPosition: 60},
        { note_index: 5, note: "F", yPosition: 50},
        { note_index: 6, note: "F♯/G♭", yPosition: 50},
        { note_index: 7, note: "G", yPosition: 40},
        { note_index: 8, note: "G♯/A♭", yPosition: 40},
        { note_index: 9, note: "A", yPosition: 30},
        { note_index: 10, note: "A♯/B♭", yPosition: 30},
        { note_index: 11, note: "B", yPosition: 20}
    ];

    // Create the line chart
    function updateChart(selectedKey) {
        keySongs_container.selectAll("iframe").remove();
        keySongs_container.selectAll(".key-songs-text").remove();
        keySelected = selectedKey;

        // Prepare the data for the line chart
        let chartData = [];
        Object.keys(yearKeyModeCount).forEach(year => {
            if (year !== '1899' && year !== '2021') { // Exclude the data for 1899 and 2021
                let count = yearKeyModeCount[year][keyMode] && yearKeyModeCount[year][keyMode][selectedKey] 
                    ? yearKeyModeCount[year][keyMode][selectedKey] 
                    : 0; // Get count or 0 if no songs for that year/key
                chartData.push({
                    year: year,
                    count: count
                });
            }
        });

        // Set scales
        let xScale = d3.scaleBand()
            .domain(chartData.map(d => d.year))
            .range([0, width])
            .padding(0.1);

        let yScale = d3.scaleLinear()
            .domain([0, d3.max(chartData, d => d.count)])
            .nice()
            .range([height, 0]);

        // Clear previous chart elements
        svg.selectAll("*").remove();

        // Add X and Y axes
        svg.append("g")
            .attr("class", "key-x-axis")
            .attr("transform", "translate(0," + height + ")")
            .call(d3.axisBottom(xScale).tickValues(xScale.domain().filter(function(_, i) {
                return !(i % 5);
              })))
            .selectAll("text")
            .attr("transform", "rotate(-45)")
            .style("text-anchor", "end");

        svg.append("g")
            .attr("class", "key-y-axis")
            .call(d3.axisLeft(yScale));

        // Set the colour and increase the thickness of the x and y-axis lines
        svg.select(".key-x-axis path")
            .style("stroke", "white")
            .style("stroke-width", 2);
        
        svg.select(".key-y-axis path")
            .style("stroke", "white")
            .style("stroke-width", 2);

        // Add axis labels
        svg.append("text")
            .attr("transform", "translate(" + (width / 2) + " ," + (height + 45) + ")")
            .style("text-anchor", "middle")
            .attr("class", "key-axis-label")
            .text("Year")
            .style("fill", "white");

        svg.append("text")
            .attr("transform", "rotate(-90)")
            .attr("y", -45)
            .attr("x", -height / 2)
            .style("text-anchor", "middle")
            .attr("class", "key-axis-label")
            .text("Number of Songs")
            .style("fill","white");

        // Create a line generator function
        let line = d3.line()
            .x(d => xScale(d.year) + xScale.bandwidth() / 2)
            .y(d => yScale(d.count));

        // Draw the line for the selected key
        svg.append("path")
            .data([chartData])
            .attr("class", "line")
            .attr("fill", "none")
            .attr("stroke", "#1DB954")
            .attr("stroke-width", 2)
            .attr("d", line);

        // Add data points (circles) on the line
        svg.selectAll(".dot")
            .data(chartData)
            .enter().append("circle")
            .attr("class", "dot")
            .attr("cx", d => xScale(d.year) + xScale.bandwidth() / 2)
            .attr("cy", d => yScale(d.count))
            .attr("r", 3.5)
            .attr("fill", "#1DB954")
            .style("cursor", "default") 
            .on('mouseover', function(event, d) {
                keysLineChartTooltip.style('visibility', 'visible')
                    .html(`
                        <strong>Year:</strong> ${d.year}<br>
                        <strong>Number of Songs:</strong> ${d.count}<br>
                        <strong>Key:</strong> ${keyNotesPositions[selectedKey].note} ${keyMode ? 'Major' : 'Minor'}<br>
                    `)
                    .style('left', `${event.pageX + 10}px`)
                    .style('top', `${event.pageY + 10}px`);
            })
            .on('mousemove', function(event) {
                keysLineChartTooltip.style('left', `${event.pageX + 10}px`)
                    .style('top', `${event.pageY + 10}px`);
            })
            .on('mouseout', function() {
                keysLineChartTooltip.style('visibility', 'hidden');
            });
        
        keySongs_container.append("text")
            .attr("x", 0)
            .attr("class", "key-songs-text")
            .text(`Some Songs in ${keyNotesPositions[selectedKey].note} ${keyMode ? 'Major' : 'Minor'}:`);

        // For the songs that show up:
        let filteredData = data.filter(d => d.key === selectedKey && d.mode === keyMode);
        
        for (let i = 0; i < 3; i++) {
            let randomSong = filteredData[Math.floor(Math.random() * filteredData.length)];

            keySongs_container.append("iframe")
                .attr("src", `https://open.spotify.com/embed/track/${randomSong.trackID}`)
                .attr("width", "80%")
                .attr("height", "80")
                .style("opacity", "0.7")
                .style("transition", "opacity 0.3s ease, transform 0.3s ease") // css transitions
                .attr("allow", "autoplay; clipboard-write; encrypted-media; picture-in-picture")
                .attr("loading", "lazy");

        }
        
    }

    // Function to draw the staff
    function drawStaff(svg, staffWidth) {
        staffWidth = staffWidth - 47;
        // let lineSpacing = (key_container.offsetHeight * 0.2 / 6);
        let lineSpacing = 20; // Distance between staff lines

        // Draw the staff's thicker side lines
        for (let i = 0; i < 2; i++) {
            svg.append("line")
                .attr("x1", i * staffWidth)
                .attr("y1", 20)
                .attr("x2", i * staffWidth)
                .attr("y2", (4 * lineSpacing) + 20)
                .attr("stroke", "#1DB954")
                .attr("stroke-width", 7);                  
        }

        // Draw the staff (5 lines)
        for (let i = 0; i < 5; i++) {
            svg.append("line")
                .attr("x1", 0)
                .attr("y1", (i * lineSpacing) + 20) // Start each line lower down
                .attr("x2", staffWidth)
                .attr("y2", (i * lineSpacing) + 20)
                .attr("stroke", "#1DB954")
                .attr("stroke-width", 2);
        }
    }
  
    // Function to draw a quarter note at a given position (x, y) on the staff
    function drawQuarterNote(svg, x, y, key) {
        if (keyNotesPositions[key].note.endsWith('♭')){
            drawSharp(svg, x, y, key); 
        }
        
        // Create the stem of the quarter note
        let stem = svg.append("line")
            .attr("class", "stem " + "stem" + key)
            .attr("x1", x + 13)
            .attr("y1", y + 32)
            .attr("x2", x + 13)
            .attr("y2", y - 20) // Controls length
            .attr("stroke", "gray")
            .attr("stroke-width", 4);
        
        if ((key === 0) || (key === 1)) {
            // Draw a line through the center of the ellipse (horizontal)
            svg.append("line")
                .attr("class", "key-line " + "key-line" + key)
                .attr("x1", x - 25)
                .attr("y1", y + 40)
                .attr("x2", x + 25)
                .attr("y2", y + 40)
                .attr("stroke", "gray")
                .attr("stroke-width", 3);          
        }

        // Create the rotated elliptical note head
        let head = svg.append("ellipse")
            .attr("id", "note" + key) // Assign an ID for the note based on the key
            .attr("class", "note-head")
            .attr("cx", x)
            .attr("cy", y + 40)
            .attr("rx", 15) // key_container.offsetHeight * 0.2 / 12
            .attr("ry", 11) // key_container.offsetHeight * 0.2 / 12 - 4
            .attr("fill", "gray")
            .attr("transform", "rotate(-30 " + x + " " + (y + 35) + ")")
            .style("cursor", "pointer")
            .on("click", function() {
                // Make all notes gray
                d3.selectAll(".stem").attr("stroke", "gray");
                d3.selectAll(".key-line").attr("stroke", "gray");
                d3.selectAll(".sharp").attr("fill", "gray");
                d3.selectAll(".note-head").attr("fill", "gray");

                // Make the selected note stem, line through head, head, and sharp green
                d3.selectAll(".stem" + key).attr("stroke", "#1DB954");
                d3.selectAll(".key-line" + key).attr("stroke", "#1DB954");
                d3.select(this) // Select the current ellipse (the one that was hovered)
                    .transition()
                    .duration(200)
                    .attr("fill", "#1DB954");

                if (keyNotesPositions[key].note.endsWith('♭')){
                    d3.selectAll(".sharp" + key).attr("fill", "#1DB954");
                }
                
                keySelected = key;
                sessionStorage.setItem("keySelected", `${keyNotesPositions[key].note} ${keyMode ? 'Major' : 'Minor'}`);
                updateChart(key);
            })
            .on('mouseover', function(event, d) {
                // Make the hovered note stem, line through head, head, and sharp bright green
                d3.selectAll(".stem" + key).attr("stroke", d3.rgb("#1DB954").brighter(1.5));
                d3.selectAll(".key-line" + key).attr("stroke", d3.rgb("#1DB954").brighter(1.5));
                d3.select(this)
                    .transition()
                    .duration(200)
                    .attr("rx", 17)
                    .attr("ry", 13)
                    .attr("fill", d3.rgb("#1DB954").brighter(1.5)); // Make the fill color lighter
                
                if (keyNotesPositions[key].note.endsWith('♭')){
                    d3.selectAll(".sharp" + key).attr("fill", d3.rgb("#1DB954").brighter(1.5));
                }

                keysLineChartTooltip.style('visibility', 'visible')
                    .html(`
                        <strong>Key:</strong> ${keyNotesPositions[key].note} ${keyMode ? 'Major' : 'Minor'}<br>
                    `)
                    .style('left', `${event.pageX + 10}px`)
                    .style('top', `${event.pageY + 10}px`);
            })
            .on('mousemove', function(event) {
                keysLineChartTooltip.style('left', `${event.pageX + 10}px`)
                    .style('top', `${event.pageY + 10}px`);
            })
            .on('mouseout', function() {
                // Make the note stem, line through head, head, and sharp back to green (if currently selected) or gray
                d3.selectAll(".stem" + key)
                    .attr("stroke", function() {
                        let stemID = "stem stem" + keySelected;
                        if (d3.select(this).attr("class") === stemID) {
                            return "#1DB954";
                        } else {
                            return "gray";
                        }
                    });

                d3.selectAll(".key-line" + key)
                    .attr("stroke", function() {
                        let keyLineID = "key-line key-line" + keySelected;
                        if (d3.select(this).attr("class") === keyLineID) {
                            return "#1DB954";
                        } else {
                            return "gray";
                        }
                    });

                d3.select(this)
                    .transition()
                    .duration(200)
                    .attr("rx", 15)
                    .attr("ry", 11)
                    .attr("fill", function() {
                        // Check if the current ellipse is already selected one
                        let headID = "note" + keySelected;
                        if (d3.select(this).attr("id") === headID) {
                            return "#1DB954";
                        } else {
                            return "gray";
                        }
                    });

                if (keyNotesPositions[key].note.endsWith('♭')){
                    d3.selectAll(".sharp" + key)
                        .attr("fill", function() {
                            let sharpID = "sharp sharp" + keySelected;
                            if (d3.select(this).attr("class") === sharpID) {
                                return "#1DB954";
                            } else {
                                return "gray";
                            }
                        });
                }

                keysLineChartTooltip.style('visibility', 'hidden');
            });
        
    }
    

    // Function to draw a sharp symbol to the left of the note
    function drawSharp(svg, x, y, key) {
        svg.append("text")
            .attr("class", "sharp " + "sharp" + key)
            .attr("x", x - 35) // Adjust to place the sharp symbol to the left of the note
            .attr("y", y + 55)
            .attr("font-size", "40px")
            .attr("fill", "gray")
            .text("♯");
    }

    // Function to draw multiple quarter notes along the staff
    function drawNotes(svg) {
        let startX = 50; // Starting position for the first note
        // let noteSpacing = 90; // Horizontal space between notes
        let noteSpacing = key_container.offsetWidth / 14;
        let xPosition_index = 0; // Only goes from 0 to 5

        while (key_index < 12){
            drawQuarterNote(svg, startX + xPosition_index * noteSpacing, keyNotesPositions[key_index].yPosition, key_index);
            
            xPosition_index += 1;
            key_index += 1;
            if (key_index === 6){
                start_new = true;
            }
        }
    }

    // Function to set up the SVG container and draw the staff and notes
    function drawNotesWithStaff(keysSVGContainer) {
        let keyMargin = { top: 20, right: 40, bottom: 40, left: 40 };

        let keyWidth = key_container.offsetWidth;
        // let keyHeight = key_container.offsetHeight * 0.2;
        let keyHeight = 160 - margin.top - margin.bottom;
        let staffWidth = keyWidth - keyMargin.left - keyMargin.right;

        let svg = d3.select(keysSVGContainer)
            .append("svg")
            .attr("width", keyWidth)
            .attr("height", keyHeight + margin.top + margin.bottom)
            .append("g")
            .attr("transform", `translate(${keyMargin.left + keyMargin.right},${0})`);

        // Draw the staff first
        drawStaff(svg, staffWidth);

        // Draw the 6 quarter notes along the staff
        drawNotes(svg);
    }


    const majorKeyButton = d3.select('#major-key');
    const minorKeyButton = d3.select('#minor-key');

    // Button click events
    minorKeyButton.on('click', function() {
        keyMode = 0;
        minorKeyButton.classed('active', true);
        majorKeyButton.classed('active', false);
        updateChart(keySelected);
    });

    majorKeyButton.on('click', function() {
        keyMode = 1;
        majorKeyButton.classed('active', true);
        minorKeyButton.classed('active', false);
        updateChart(keySelected);
    });

    // Initially, Major Keys is selected/active
    minorKeyButton.classed('active', false);
    majorKeyButton.classed('active', true);

    // Initial chart for the default selected key (0)
    updateChart(0);
    drawNotesWithStaff("#musical-keys-container");

    // Initial note shown in key 0 (C): make the note stem, line through head, and head green
    d3.selectAll(".stem" + 0).attr("stroke", "#1DB954");
    d3.selectAll(".key-line" + 0).attr("stroke", "#1DB954");
    d3.select("#note" + 0)
        .transition()
        .duration(200)
        .attr("fill", "#1DB954");
});
