let intake_container = document.getElementById('intake-vis');
let intake_title = document.getElementById('intake-title');


// Create overlay (added as a sibling to #intake-chart (svg) in the DOM)
createOverlay();

// Function to show the overlay
function showOverlay() {
    let overlay = d3.select("#intake-overlay");
    overlay.style("visibility", "visible");
    overlay.style("z-index", 9999); // Ensure it stays on top
}

// Function to hide the overlay
function hideOverlay() {
    let overlay = d3.select("#intake-overlay");
    overlay.style("visibility", "hidden");
    overlay.style("z-index", 1); // Reset z-index
}

// Create overlay div
function createOverlay() {
    d3.select("#intake-chart")
        .append("div")
        .attr("id", "intake-overlay")
        .style("position", "absolute")
        .style("top", 0)
        .style("left", 0)
        .style("width", "100%")
        .style("height", "100%")
        .style("background-color", "rgba(255, 0, 0, 0)") // Transparent overlay
        .style("visibility", "hidden")
        .style("z-index", 9999); // Ensures it is on top of other content
}

d3.csv("data/music_intake.csv", row => { 
    row.Year = +row.Year;
    row['Total Physical'] = +row['Total Physical'];
    row['Total Downloads'] = +row['Downloads & Other Digital'] || 0;
    row['Total Streaming'] = +row['Total Streaming'] || 0;
    row['Total'] = +(row['Total Physical'] + row['Total Downloads'] + row['Total Streaming']); 

    // Calculate Leftover as Total - Total Physical - Total Downloads - Total Streaming
    row['Leftover'] = +(row['Total'] - row['Total Physical'] - row['Total Downloads'] - row['Total Streaming']);
 
    return row;
}).then(data => {
    let barsTime = 500; // Time it takes for the bars to disappear
    let drawRingsTime = 2500;
    let ringsDisappearTime = 2300;

    let currentChart = 'circles';
    let prev_category_selected; // To keep track of the previously selected category

    let colours = {'Total Physical': '#9fa0fd', 'Total Downloads': '#ff8679', 'Total Streaming': '#00d8a4', 'Leftover': '#C9C9C9'}

    let radius = intake_container.offsetWidth * 0.15;
    let innerHoleRadius = radius / 5;
    const ringThickness = (radius - innerHoleRadius) / data.length;

    const margin = { top: 0, right: 20, bottom: 0, left: 60 };
    const width = intake_container.offsetWidth * 0.3;
    const height = intake_container.offsetHeight * 0.9;

    let svg = d3.select('#intake-chart')
        .append("svg")
        .attr("width", width + margin.left + margin.right)
        .attr("height", height + margin.top + margin.bottom)
        .append("g")
        .attr("transform", `translate(${margin.left},${margin.top})`);

    let tooltip = d3.select("body").append('div')
        .attr('class', 'intake-tooltip');
    
    let tooltipBars = d3.select("body").append('div')
        .attr('class', 'intake-tooltip-bars');

    let dataToUse = data;

    // Create concentric circles group
    let yearGroups = svg.selectAll('.year-group')
        .data(dataToUse)
        .enter().append('g')
        .attr('class', 'year-group')
        .attr("transform", `translate(${width / 2},${height / 2})`);
    
    // Draw inner hole circle
    svg.append('circle')
        .attr('cx', width / 2)
        .attr('cy', height / 2)
        .attr('r', innerHoleRadius)
        .style('fill', '#e0e0e0')
        .transition().duration(500)
        .style("opacity", 1)
        .delay(function(d, i) { 
            return (2 * dataToUse.length - i) * 30;
        });
    
    // Display the text in the inner hole
    writeHoleText('all');

    function addLegend() {
        let legend_container = document.getElementById('intake-legend');
        let widthLegend = 200;
        let heightLegend = 100;
        let marginLegendLeft = legend_container.offsetLeft;

        // Append an SVG container for the legend
        let svgLegend = d3.select('#intake-legend').append('svg')
            .attr('width', widthLegend)
            .attr('height', heightLegend)
            .attr("transform", `translate(${marginLegendLeft}, 0)`);

        // Set up the legend items
        let legendItems = Object.entries(colours).slice(0, -1); // Exclude 'Leftover'

        // Create a group for each legend item
        let legend = svgLegend.selectAll('.intake-legend-items')
            .data(legendItems)
            .enter().append('g')
            .attr('class', 'intake-legend-items')
            .attr('transform', (d, i) => `translate(0, ${i * 25})`); // Space each legend item

        // Add colored rectangles for each category
        legend.append('rect')
            .attr('width', 20)
            .attr('height', 20)
            .attr('fill', d => d[1]); // Use the color from the 'colours' object

        // Add text labels for each category
        legend.append('text')
            .attr('x', 30)
            .attr('y', 15)
            .text(d => d[0]) // Use the category name from the 'colours' object
            .style('fill', 'white');
    }

    // Function to add the text in the middle of the hole
    function writeHoleText(selectedCategory) {     
        if (selectedCategory === 'all') {
            svg.append('text')
                .attr('class', 'intake-text')
                .attr('x', width / 2)
                .attr('y', height / 2 - 16)
                .attr('dy', '.3em')
                .text('Music Intake')
                .style("opacity", 0);
    
            svg.append('text')
                .attr('class', 'intake-text')
                .attr('x', width / 2)
                .attr('y', height / 2)
                .attr('dy', '.3em')
                .text('Method')
                .style("opacity", 0);
        
            svg.append('text')
                .attr('class', 'intake-text')
                .attr('x', width / 2)
                .attr('y', height / 2 + 16)
                .attr('dy', '.3em')
                .text('Proportions')
                .style("opacity", 0);
        } else {
            let words = selectedCategory.split(" ");
            let additions = [-16, 0];
            for (let i = 0; i < 2; i++) {
                svg.append('text')
                    .attr('class', 'intake-text')
                    .attr('x', width / 2)
                    .attr('y', height / 2 + additions[i])
                    .attr('dy', '.3em')
                    .text(words[i])
                    .style("opacity", 0);
            }
    
            svg.append('text')
                .attr('class', 'intake-text')
                .attr('x', width / 2)
                .attr('y', height / 2 + 16)
                .attr('dy', '.3em')
                .text('Proportions')
                .style("opacity", 0);
        }

        svg.selectAll('text')
            .transition().duration(1000)
            .style("opacity", 1);
    }
    
    // Function to fade in/out inner hole circle and text
    // value = 0 means fade out, value = 1 means fade in
    function innerHoleVisibility(value) {
        svg.selectAll('circle')
            .transition().duration(1000)
            .style("opacity", value)
            .delay(function(d, i) { 
                return (dataToUse.length - i) * 30;
            });
        
        // Remove the inner hole text
        svg.selectAll('text')
            .transition().duration(500)
            .style("opacity", 0)
            .delay(1000)
            .on('end', function() {
                d3.select(this).remove();
            });
    }

    // Function to create arcs using polar coordinates
    function createArc(startAngle, endAngle, innerRadius, outerRadius) {
        let angle = d3.arc()
            .innerRadius(innerRadius)
            .outerRadius(outerRadius)
            .startAngle(startAngle)
            .endAngle(endAngle);
        return angle();
    }

    // Function to update concentric circles chart based on selected category
    // buttonClicked is whether a category button (not including 'all') was clicked
    function drawRings(selectedCategory, buttonClicked) {
        // Remove existing arcs to re-draw the chart
        svg.selectAll('.intake-arc').remove();
        
        // Show the inner hole
        innerHoleVisibility(1);
        
        // Add the text in the inner hole
        setTimeout(function() {
            writeHoleText(selectedCategory);
        }, 1000); // Wait for the inner hole to be shown first
    
        // Recreate the tooltip
        tooltip = d3.select("body").append('div')
                    .attr('class', 'intake-tooltip');
        
        yearGroups.each(function(d, i) {
            let g = d3.select(this);

            let outerRadius = innerHoleRadius + (i + 1) * ringThickness;
            let innerRadius = outerRadius - ringThickness + 2;
            let currentAngle = 0;
            let transitionDelay = 0; // Delay variable to stagger the transitions

            let categoriesData = ['Total Physical', 'Total Downloads', 'Total Streaming', 'Leftover'];
            
            let selectedProportion = d[selectedCategory]; // The proportion of the selected category
            let restProportion = d.Total - selectedProportion; // The proportion of the leftover

    
            if (buttonClicked) {
                // If the user selected a category, create a new dataset with only the selected category and leftover parts
                // and use these categories to iterate over later
                categoriesData = [selectedCategory, 'Leftover'];
            }
            
            categoriesData.forEach((category, idx) => {
                let oldLeftover = d['Leftover']; // Save the old leftover value
                if (buttonClicked){
                    d['Leftover'] = restProportion;
                }

                let startAngle = currentAngle;
                let endAngle = startAngle + (d[category] / d.Total) * 2 * Math.PI; // Compute end angle based on proportion

                // Create the arc path using polar coordinates
                let arcPath = createArc(startAngle, startAngle, innerRadius, outerRadius);
            
                let newArcPath;

                // Append the arc path to the SVG
                g.append('path')
                    .attr('class', 'intake-arc')
                    //.attr('d', arcPath)
                    // SAVE THE ANGLES AND RADII AS CUSTOM ATTRIBUTES
                    // (Important for reversing/detransitioning later)
                    .attr('startAngle', startAngle)
                    .attr('endAngle', endAngle)
                    .attr('innerRadius', innerRadius)
                    .attr('outerRadius', outerRadius)
                    .style('fill', colours[category])
                    .style('opacity', 0)
                    .transition()
                    .duration(2500)
                    .delay(transitionDelay)
                    .style('opacity', 1)
                    .attrTween("d", function() {
                        // Interpolate from startAngle to endAngle (clockwise)
                        let interpolate = d3.interpolate(startAngle, endAngle);
                        return function(t) {
                            // Create the arc path and use the interpolated angle for smooth transition
                            newArcPath = createArc(startAngle, interpolate(t), innerRadius, outerRadius);
                            return newArcPath;
                        };
                    });
                
                // Labels for first and last year/ring (may not use since to small)
                // if (i === 0) {
                //     g.append('text')
                //         .attr('class', 'circles-year-label')
                //         .attr('x', 0)
                //         .attr('y', -(outerRadius + innerRadius) / 2 + 1)
                //         .attr('text-anchor', 'middle')
                //         .attr('dominant-baseline', 'middle')
                //         .text(`1999`)
                //         .style('font-size', '8px')
                //         .style('fill', 'white');
                // }

                // // Add label to the outermost ring
                // if (i === dataToUse.length - 1) {
                //     g.append('text')
                //         .attr('class', 'circles-year-label')
                //         .attr('x', 0)
                //         .attr('y', -(outerRadius + innerRadius) / 2 + 1)
                //         .attr('text-anchor', 'middle')
                //         .attr('dominant-baseline', 'middle')
                //         .text(`2023`)
                //         .style('font-size', '8px')
                //         .style('fill', 'white');
                // }

                g.on('mouseover', function(event) {
                    // Set the hovered year
                    let hoveredYear = d.Year;
                    
                    // Reduce opacity of all arcs that are not in the hovered yearGroup
                    svg.selectAll('.intake-arc')
                        .transition().duration(200)
                        .style('opacity', function(d) {
                            // If this arc is in the hovered year, keep its opacity at 1
                            return d.Year === hoveredYear ? 1 : 0.4;
                        });

                    tooltip.style('visibility', 'visible')
                        .html(`
                            <strong>Year:</strong> ${d.Year}<br>
                            <strong>Total Physical:</strong> $${d['Total Physical']}B (${Math.floor((d['Total Physical'] / d['Total']) * 100)}%)<br>
                            <strong>Total Downloads:</strong> $${d['Total Downloads']}B (${Math.floor((d['Total Downloads'] / d['Total']) * 100)}%)<br>
                            <strong>Total Streaming:</strong> $${d['Total Streaming']}B (${Math.floor((d['Total Streaming'] / d['Total']) * 100)}%)<br>
                            <strong>Total:</strong> $${Math.floor(d['Total'] * 10) / 10}B
                        `)
                        .style('left', `${event.pageX + 10}px`)
                        .style('top', `${event.pageY + 10}px`);
                })
                .on('mousemove', function(event) {
                    tooltip.style('left', `${event.pageX + 10}px`)
                        .style('top', `${event.pageY + 10}px`);
                })
                .on('mouseout', function() {
                    tooltip.style('visibility', 'hidden');

                    // Reset opacity of all rings
                    svg.selectAll('.intake-arc')
                        .transition().duration(200)
                        .style('opacity', 1);
                });
                
                // Update the current angle for the next arc
                currentAngle = endAngle;
                if (buttonClicked){
                    transitionDelay += 1500;
                } else {
                    // Increase the delay for the next arc transition (to stager them one category after the other)
                    transitionDelay += 1000; // 1 second for each arc to start after the previous one finishes
                }

                d['Leftover'] = oldLeftover; // Restore the leftover value
                
            });
        });

        currentChart = 'circles';
    }
    
    
    // Function to animate rings disappearing
    function ringsDisappear(selectedCategory, currChart) {
        // Reverse the arcs' animation
        svg.selectAll('.intake-arc').each(function() {
            let path = d3.select(this);
            let start = +path.attr('startAngle'); // Get the startAngle and convert to number
            let end = +path.attr('endAngle');
            let innerRadius = +path.attr('innerRadius');
            let outerRadius = +path.attr('outerRadius');

            // Reverse the arc
            path.transition()
                .duration(2500)
                .attrTween("d", function() {
                    // Interpolate from endAngle to startAngle (counterclockwise)
                    let reverseInterpolate = d3.interpolate(end, start);
                    return function(t) {
                        return createArc(start, reverseInterpolate(t), innerRadius, outerRadius);
                    };
                })
                .remove(); // Remove the arc after it finishes reversing
        });
        
        // Remove the tooltip for the circles
        tooltip.remove();
        
        // Remove the inner hole (if currChart is 'bars')
        innerHoleVisibility(currChart === 'bars' ? 0 : 1);
    }

    let barsVerticalOffset = 20; // Amount to move the bar chart down

    // Function to create the axes for the bar chart
    function createAxes(selectedCategory, barsData) {
        // Define the scales for x and y axes
        const xScale = d3.scaleLinear()
            .domain([0, d3.max(barsData, d => d.value)])
            .range([0, width]);

        const yScale = d3.scaleBand()
            .domain(barsData.map(d => d.year))
            // height - 20 because the axis will be at the bottom, and need to account for font size (~20)
            // - barsVerticalOffset because the chart will be moved down
            .range([0, (height - 20 - barsVerticalOffset)])
            .padding(0.1);

        // Remove any existing axes to avoid duplication
        svg.selectAll('.intake-x-axis').remove();
        svg.selectAll('.intake-y-axis').remove();

        // Append the x-axis to the SVG
        let xAxis = svg.append('g')
            .attr('class', 'intake-x-axis')
            .attr('transform', `translate(0,${(height - 20)})`) // Positioning the x-axis at the bottom
            .call(d3.axisBottom(xScale).ticks(10))
            .style('stroke', 'white')
            .style('color', 'white')
            .style("opacity", 0);
        
        xAxis.selectAll(".tick text")
            .style('stroke-width', '0');  

        // Append the y-axis to the SVG
        let yAxis = svg.append('g')
            .attr('class', 'intake-y-axis')
            .call(d3.axisLeft(yScale))
            .style('stroke', 'white')
            .style('color', 'white')
            .style('opacity', 0)
            .attr('transform', 'translate(0, ' + (barsVerticalOffset) + ')'); // Move y-axis down by 20
        
        yAxis.selectAll(".tick text")
            .style('stroke-width', '0');
        
        let xAxisLabel = svg.append('text')
                            .attr('class', 'intake-bars-axis-label')
                            .attr('x', width + 12) // Position at the right end
                            .attr('y', height - 15)
                            .attr('text-anchor', 'middle')
                            .style('fill', 'white')
                            .style("font-family", "Arial")
                            .style('font-size', '12px')
                            .style('font-weight', 'bold')
                            .text('$B')
                            .style("opacity", 0);

        let yAxisLabel = svg.append('text')
                            .attr('class', 'intake-bars-axis-label')
                            .attr('x', -20) // Position to the left of the axis
                            .attr('y', 15) // Position at the top of the y-axis
                            .attr('text-anchor', 'middle')
                            .style('fill', 'white')
                            .style("font-family", "Arial")
                            .style('font-size', '12px')
                            .style('font-weight', 'bold')
                            .text('Year')
                            .style("opacity", 0);

        xAxis
            .transition().duration(1000)
            .style('opacity', 1);

        yAxis
            .transition().duration(1000)
            .style('opacity', 1);

        xAxisLabel
            .transition().duration(1000)
            .style('opacity', 1);

        yAxisLabel
            .transition().duration(1000)
            .style('opacity', 1);

        return xScale;
    }

    // Function to create the stacked bars and transitions for 'all' categories
    function drawStackedBars(selectedCategory, barsData, xScale) {
        svg.selectAll('.layer').remove();
        
        // Stack the data for the 'all' category (stacked bar chart)
        const stack = d3.stack()
            .keys(['totalPhysical', 'totalDownloads', 'totalStreaming'])
            .order(d3.stackOrderNone)
            .offset(d3.stackOffsetNone);

        const stackedData = stack(barsData);

        // Create bars for stacked chart
        let layers = svg.selectAll('.layer')
            .data(stackedData)
            .enter().append('g')
            .attr('class', 'layer')
            .attr('fill', (d, i) => {
                // Get the key for each segment (based on the key of the stacked data)
                const key = d.key; // The key corresponds to the stack key like 'Total Physical', 'Total Downloads', etc.

                let category;
                if (key === 'totalPhysical') {
                    category = 'Total Physical';
                } else if (key === 'totalDownloads') {
                    category = 'Total Downloads';
                } else if (key === 'totalStreaming') {
                    category = 'Total Streaming';
                }
                return colours[category];
            });
        
        
        // Create the segments for each year, and stack them with delays
        // There's 3 layers: 'Total Physical', 'Total Downloads', and 'Total Streaming'
        layers.each(function (layerData, layerIndex) {
            const layer = d3.select(this);
            
            // Create each rect for the layer
            layer.selectAll('rect')
                .data(layerData)
                .enter().append('rect')
                .attr('class', 'bar')
                .attr('x', 0)
                .attr('y', (d, i) => (i * ((height - 20 - barsVerticalOffset) / data.length)) + barsVerticalOffset) // Position bars for each year
                .attr('width', 0) // Start with 0 width
                .attr('height', (height - 20) / data.length - 5)
                .transition()
                .duration(1000)
                .attr('x', (d, i) => xScale(d[0]))
                .attr('width', d => xScale(d[1]) - xScale(d[0]));
        });

        // Tooltip for stacked bars
        svg.selectAll('.layer rect')
            .on('mouseover', function(event, d) {
                tooltipBars.style("opacity", 1);
                tooltipBars.style('visibility', 'visible')
                    .html(`
                        <strong>Year:</strong> ${d.data.year}<br>
                        <strong>Total Physical:</strong> $${d.data.totalPhysical}B (${Math.floor((d.data.totalPhysical / d.data.total) * 100)}%)<br>
                        <strong>Total Downloads:</strong> $${d.data.totalDownloads}B (${Math.floor((d.data.totalDownloads / d.data.total) * 100)}%)<br>
                        <strong>Total Streaming:</strong> $${d.data.totalStreaming}B (${Math.floor((d.data.totalStreaming / d.data.total) * 100)}%)<br>
                        <strong>Total:</strong> $${Math.floor(d.data.total * 10) / 10}B
                    `)
                    .style('left', `${event.pageX + 10}px`)
                    .style('top', `${event.pageY + 10}px`);
            })
            .on('mousemove', function(event) {
                tooltipBars.style('left', `${event.pageX + 10}px`)
                    .style('top', `${event.pageY + 10}px`);
            })
            .on('mouseout', function() {
                tooltipBars.style('visibility', 'hidden');
            });
    }


    // Function to create the bars and bar transitions
    function drawHorizontalBars(selectedCategory) {
        svg.selectAll('.bar').remove();

        let category = selectedCategory;
        if (category === 'all') {
            category = 'Total';
        }

        let barsData = dataToUse.map(d => {
            return {
                year: d.Year,
                value: d[category], // For proportion of total, do d[selectedCategory] / d['Total']
                totalPhysical: d['Total Physical'],
                totalStreaming: d['Total Streaming'],
                totalDownloads: d['Total Downloads'],
                total: d['Total']
            };
        }).reverse();

        // Create the axes before bars are drawn
        const xScale = createAxes(selectedCategory, barsData);

        if (selectedCategory === 'all') {
            drawStackedBars(selectedCategory, barsData, xScale);
        } else {
            // Create bars for the bar chart
            let bars = svg.selectAll('.bar')
                .data(barsData)
                .enter()
                .append('rect')
                .attr('class', 'bar')
                .attr('x', 0)
                .attr('y', (d, i) => (i * ((height - 20 - barsVerticalOffset)/ barsData.length)) + barsVerticalOffset)
                .attr('width', 0)
                .attr('height', (height - 20) / barsData.length - 5);
                
            bars.transition()
                .duration(1000)
                .attr('width', d => xScale(d.value))
                .style('fill', colours[selectedCategory]);

            // Tooltip event listeners
            bars.on('mouseover', function(event, d) {
                tooltipBars.style("opacity", 1);
                tooltipBars.style('visibility', 'visible')
                    .html(`
                        <strong>Year:</strong> ${d.year}<br>
                        <strong>Total Physical:</strong> $${d.totalPhysical}B (${Math.floor((d.totalPhysical / d.total) * 100)}%)<br>
                        <strong>Total Downloads:</strong> $${d.totalDownloads}B (${Math.floor((d.totalDownloads / d.total) * 100)}%)<br>
                        <strong>Total Streaming:</strong> $${d.totalStreaming}B (${Math.floor((d.totalStreaming / d.total) * 100)}%)<br>
                        <strong>Total:</strong> $${Math.floor(d.total * 10) / 10}B
                    `)
                    .style('left', `${event.pageX + 10}px`)
                    .style('top', `${event.pageY + 10}px`);
            })
            .on('mousemove', function(event) {
                tooltipBars.style('left', `${event.pageX + 10}px`)
                    .style('top', `${event.pageY + 10}px`);
            })
            .on('mouseout', function() {
                tooltipBars.style('visibility', 'hidden');
            });
        }

        currentChart = 'bars';
    }

    function stackedBarsDisappear() {
        // Select all the layers
        let layers = svg.selectAll('.layer');

        layers.each(function (layerData, layerIndex) {
            const layer = d3.select(this);
            
            // Create each rect for the layer
            layer.selectAll('rect')
                .data(layerData)
                .transition()
                .duration(1000)
                .attr('x', 0)
                .attr('width', 0);
        });

        // Each layer will be removed at the beginning of drawStackedBars()
    }

    // Function to shrink bars and remove them and fade axes
    function barsDisappear(selectedCategory) {
        svg.selectAll('.intake-x-axis')
            .transition().duration(1000)
            .style('opacity', 0)
            .on('end', function() {
                d3.select(this).remove();
            });

        svg.selectAll('.intake-y-axis')
            .transition().duration(1000)
            .style('opacity', 0)
            .on('end', function() {
                d3.select(this).remove();
            });

        svg.selectAll('.intake-bars-axis-label')
            .transition().duration(1000)
            .style('opacity', 0)
            .on('end', function() {
                d3.select(this).remove();
            });
        
        if (prev_category_selected === 'all') {
            stackedBarsDisappear();
        } else {
            // Transition to shrink bars to zero and then remove them
            svg.selectAll('.bar')
                .transition()
                .duration(1000)
                .attr('width', 0) // Animate width of bars to zero
                .on('end', function() {
                    d3.select(this).remove();
                });
        }
    }

    // Function to update the title that describes the chart
    function updateTitle(selectedCategory, currChart) {
        let ending = {'bars' : 'Revenues ($)', 'circles' : 'Revenue Proportions'};
        if (selectedCategory === 'all') {
            selectedCategory = 'Music Consumption Methods:';
        }
        intake_title.textContent = selectedCategory + ' ' + ending[currChart];
    }

    // Function called when a button is clicked
    function buttonClickFlow(selectedCategory) {
        showOverlay();

        let extraDelay = 2000;
        let delays = 0;
        let currChart; // To pass into updateChart (currentChart is not updated in time)

        // Disable all buttons when transitions are ongoing
        // (The overlay essentially doesn't allow the user to click the buttons, but
        // keep this here for visual effect and in case overlay doesn't show)
        d3.selectAll('.method-button').attr('disabled', true).style("opacity", 0.5);
        d3.selectAll('.chart-button').attr('disabled', true).style("opacity", 0.5);

        if ((currentChart === 'bars')) {
            currChart = 'circles';
            barsDisappear(selectedCategory);
            setTimeout(function() {
                drawRings(selectedCategory, !(selectedCategory === 'all'));
            }, barsTime);
            delays += barsTime + drawRingsTime;
        } else if (currentChart === 'circles') {
            currChart = 'bars';
            ringsDisappear(selectedCategory, currChart);
            setTimeout(function() {
                drawHorizontalBars(selectedCategory);
            }, ringsDisappearTime);
            delays += ringsDisappearTime;
            extraDelay = 1000;
        } else if (currentChart === 'newChart') {
            // If the user clicks a category button that isn't the current category they're
            // looking at, draw the same type of chart for the chart they clicked
            if (barChartButton.classed('active')) {
                currChart = 'bars';
                // Redraw bars
                barsDisappear(selectedCategory);
                setTimeout(function() {
                    drawHorizontalBars(selectedCategory);
                }, barsTime + 500);
                delays += barsTime;
                extraDelay = 1500;
            } else {
                currChart = 'circles';
                // Redraw rings
                ringsDisappear(selectedCategory, currChart);
                setTimeout(function() {
                    drawRings(selectedCategory, !(selectedCategory === 'all'));
                }, ringsDisappearTime);
                delays += ringsDisappearTime + drawRingsTime;
            }
        }

        updateTitle(selectedCategory, currChart);

        // Re-enable buttons after the transitions are done
        setTimeout(function() {
            hideOverlay();
            d3.selectAll('.method-button').attr('disabled', null).style("opacity", 1);
            d3.selectAll('.chart-button').attr('disabled', null).style("opacity", 1);
        }, delays + extraDelay); // Delay based on total transition time
        
        prev_category_selected = selectedCategory;
    }

    // Initial:
    addLegend();
    drawRings('all', false);
    prev_category_selected = 'all';
    d3.select('#show-all-btn').classed('active', true);

    // Button click events:

    const radialChartButton = d3.select('#intake-radial-chart-btn');
    const barChartButton = d3.select('#intake-bar-chart-btn');

    radialChartButton.on('click', function() {
        radialChartButton.classed('active', true);
        barChartButton.classed('active', false);
        // For when current chart is already radial chart:
        if (currentChart === 'circles') {
            currentChart = 'newChart'
        }
        buttonClickFlow(prev_category_selected);
    });

    barChartButton.on('click', function() {
        barChartButton.classed('active', true);
        radialChartButton.classed('active', false);
        // For when current chart is already bar chart:
        if (currentChart === 'bars') {
            currentChart = 'newChart'
        }
        buttonClickFlow(prev_category_selected);
    });

    // Initially, radial chart is selected/active
    radialChartButton.classed('active', true);
    barChartButton.classed('active', false);

    // Function to style selected button
    function makeActiveButton(button) {
        d3.selectAll('.method-button').classed('active', false); 
        button.classed('active', true);
        currentChart = 'newChart';
    }

    d3.select('#total-physical-btn').on('click', function() {
        makeActiveButton(d3.select(this))
        buttonClickFlow('Total Physical');
    });
    d3.select('#downloads-btn').on('click', function() {  
        makeActiveButton(d3.select(this)) 
        buttonClickFlow('Total Downloads');
    });
    d3.select('#streaming-btn').on('click', function() {
        makeActiveButton(d3.select(this))
        buttonClickFlow('Total Streaming');
    });
    d3.select('#show-all-btn').on('click', function() {
        makeActiveButton(d3.select(this))
        buttonClickFlow('all');
    });
}).catch(function(error) {
    console.error('Error loading the CSV data:', error);
});
