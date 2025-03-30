/*
* ARTIST TIMELINE
* Each artist has a timeline for their grammy history
*/

class ArtistTimeline {

    constructor(parentElement, artistData, artist_index) {
        this.parentElement = parentElement;
        this.artistData = artistData;
        this.artist_index = artist_index;

        this.initVis();

    }
    initVis() {
        let vis = this;
        vis.margin = {top: 0, right: 80, bottom: 0, left: 80};
        vis.yearMargin = 25

        vis.width = document.getElementById(vis.parentElement).getBoundingClientRect().width ;
        // vis.height = document.getElementById(vis.parentElement).getBoundingClientRect().height;
        vis.height = 100;

        // SVG drawing area - this is for each timeline
        // splitting this into div for the name and svg for the timeline
        vis.mainDrawingArea = d3.select("#" + vis.parentElement)
            .append("div")
            .attr("class", "main-drawing-area")


        vis.artistName = vis.mainDrawingArea.append("div")
            .attr("class", "child-timeline-artist-name")
            .attr("id", "child-timeline-artist-name"+vis.artist_index)
            .style("width", (vis.width * 0.25) + "px")
            .style("height", vis.height + "px")  // set artist height
            .on("click", function () {
                d3.select("#hidden-info-" + vis.artist_index).style("display", "none");
                let artistName = d3.select("#child-timeline-artist-name"+vis.artist_index);
                artistName.transition().duration(300)
                    .style("height", (vis.height) + "px")
                    .style("cursor", "auto");
            })

        let timelineWrapper = vis.mainDrawingArea.append("div") // Wrapper for timeline & hidden-info
            .attr("class", "timeline-wrapper")
            .style("display", "flex")
            .style("flex-direction", "column") // Stack SVG & hidden-info vertically
            .style("width", vis.width * 0.75 + "px")
            .attr("height", 3*(vis.height - vis.margin.top - vis.margin.bottom) + "px");

        vis.svg = timelineWrapper.append("svg")
            .attr("class", "child-timeline")
            .attr("width", vis.width * 0.75)
            .attr("height", vis.height - vis.margin.top - vis.margin.bottom)
            .append("g");

        vis.hiddenInfo = timelineWrapper.append("div")
            .attr("class", "hidden-info")
            .attr("id", "hidden-info-"+vis.artist_index)
            .style("width", (vis.width * 0.75) + "px")
            .style("height", 2*(vis.height - vis.margin.top - vis.margin.bottom) + "px")
            .style("display", "none"); // initially hidden - hide toggle here
            // .style("background-color", "pink");

        vis.svg.append("rect")
            .attr("width", (vis.width * 0.75))
            .attr("height", vis.height - vis.margin.top - vis.margin.bottom)
            .attr("stroke", "grey")
            .attr("stroke-width", 2);

        // Set up the x-scale (years scale)
        vis.xScale = d3.scaleLinear()
            .domain([d3.min(vis.artistData.years), d3.max(vis.artistData.years)])
            .range([vis.margin.left, (vis.width*0.75) - vis.margin.right]);

        // Create a bottom axis based on the x-scale
        vis.xAxis = d3.axisBottom(vis.xScale)
            .ticks(vis.artistData.years.length)  // no of years for ticks
            .tickFormat(d3.format("d"));

        // Add the axis to the SVG - axis & circle position
        vis.svg.append("g")
            .attr("id", "circle-grammys-x-axis")
            .attr("cy", vis.height / 3)
            .attr("transform", "translate(0," + vis.height / 3 + ")")  // axis middle of rectangle
            .call(vis.xAxis)
            .selectAll("text")
            .attr("dy", vis.height / 4 + vis.yearMargin + "px");  // year label position

        vis.artistName.append("h3")
            .attr("class", "artist-name-label")
            .text(vis.artistData.artist);

        this.wrangleData()
    }
    wrangleData() {
        this.updateVis()
    }
    updateVis() {
        let vis = this
        let hiddenInfo = d3.select("#hidden-info-" + vis.artist_index);

        vis.svg.selectAll("circle")
            .data(vis.artistData.years)
            .enter()
            .append("circle")
            .attr("class", "nomination-circle")
            .attr("cx", d => vis.xScale(d))
            .attr("cy", vis.height / 3)  // axis & circle position
            .attr("r", d => vis.get_radius(vis.artistData["nominationsByYear"].get(d.toString())))
            // .attr("fill", "red")
            .on("click", function(event, d) {
                vis.getArtistInformation(d, vis.artistData, vis.artist_index);
            });

        d3.selectAll("circle")
            .style("cursor", "pointer");

    }
    getArtistInformation(d, info, index) {
        let vis = this
        let nominations = []
        let nominations_box = d3.select("#hidden-info-" + index);

        // unhide box first
        let hiddenInfo = document.getElementById("hidden-info-" + index);
        // hide toggle

        d3.select("#hidden-info-" + index)
            .style("display", "block")

        d3.select("#collapse-all")
            .style("cursor", "pointer")
            .style("display", "block")
            .on("click", function () {
                d3.selectAll(".hidden-info").style("display", "none")
                let artistName = d3.selectAll(".child-timeline-artist-name");
                artistName.transition().duration(300)
                    .style("height", (vis.height) + "px")
                    .style("cursor", "auto");

            });
        d3.select("#collapse-all-child")
            .style("display", "block")
            .style("cursor", "pointer");

        let artistName = d3.select("#child-timeline-artist-name"+vis.artist_index);
        artistName.transition().duration(300)
            .style("height", (vis.height * 3) + "px")
            .style("cursor", "pointer");  // set artist height on expansion

        nominations_box.selectAll(".nominations-parent-vis8").remove();


        // nominations div to create children
        const layout = nominations_box.append("div")
            .attr("class", "nominations-parent-vis8") // todo
            .attr("id", "nominations-parent-"+vis.artist_index);


        let noms = info["nominationsByYear"].get(d.toString()).nominations

        noms.forEach((nomination_data, nom_index) => {
            let nomination_id = "nominations-child-" + vis.artist_index+ "-"+ nom_index
            layout.append("div")
                .attr("id", nomination_id) // todo
                .attr("class", "each-nomination-vis8") // todo
                .style("flex-shrink", "0")
                .style("height", vis.height * 2 + "px")
                .style("aspect-ratio", "2/1")
                .style("width", "auto")

            nominations.push(new NominationInfo(nomination_id, vis.artistData.artist,// todo
                nomination_data, d, nom_index))
        });

    }
    get_radius(d) {
        // radius is calculated here
        let pixel_size = 5
        return d.count * pixel_size
    }
}

