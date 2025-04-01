class Vinyl {
    constructor(parentElement, vinyl_index, data_len, coverArt, numberVinyls, year, artist, nominee, popularity) {
        this.parentElement = parentElement;
        this.vinyl_index = vinyl_index;
        this.coverArt = coverArt;
        this.data_len = data_len;
        this.z_index = data_len - this.vinyl_index;
        this.isFlipped = false;
        this.year = year;
        this.artist = artist;
        this.nominee = nominee;
        this.popularity = popularity;

        this.initVis();
    }

    initVis() {
        let vis = this;
        vis.parentDiv = d3.select("#" + vis.parentElement);
        vis.height = document.getElementById(vis.parentElement).getBoundingClientRect().height;
        vis.width = document.getElementById(vis.parentElement).getBoundingClientRect().width;

        // create vinyl container
        vis.scaleFactor = 32
        vis.baseWidth = vis.height / vis.data_len
        vis.childWidth = vis.width / 90
        vis.openShift = vis.height / vis.scaleFactor * 2
        vis.tiltDegreeY = 60
        vis.vinylBook = d3.select("#" + vis.parentElement)
            .append("div")
            .attr("id", "vinyl-child-" + vis.vinyl_index)
            .attr("class", "vinyl-children")
            .attr("data-index", vis.vinyl_index)
            .style("width", vis.childWidth + "px")
            .style("height", vis.height + "px")
            .style("position", "relative")
            // .style("z-index", vis.z_index)
            // .style("perspective", "6000px")
        ;

        // create the front side of the vinyl
        vis.frontSide = d3.select("#vinyl-child-" + vis.vinyl_index)
            .append("div")
            .attr("class", "vinyl-children-art")
            .style("width", "100%")
            .style("height", "100%")
            .style("position", "relative")
            .style("left", "0px")
            .style("transform-origin", "right center")
            // .style('transform', `rotateY(${-vis.tiltDegreeY}deg) `)
            .style("box-shadow", "0 0 20px rgba(0, 0, 0, 0.5)");

        vis.frontSide.append("img")
            .attr("src", "img/cd-case.png")
            .attr("alt", "Vinyl Cover")
            .style("width", "100%")
            .style("height", "100%")
            .style("position", "absolute")
            .style("left", "0px")
            .style("top", "0");

        vis.yearOnCD = vis.frontSide.append("div")
            .attr("class", "vinyl-year")
            .style("top", "50%")
            .style("left", "50%")
            .append("ul")
            .style("list-style-type", "none")
            .append("li")
            .style("display", "none")
            .text(vis.year, vis);

        vis.artistOnCD = vis.frontSide.select(".vinyl-year ul")
            .append("li")
            .style("font-size", "12px")
            .style("display", "none")
            .text("Artist: " + vis.artist);

        vis.nomineeOnCD = vis.frontSide.select(".vinyl-year ul")
            .append("li")
            .style("font-size", "12px")
            .style("display", "none")
            .text("Song: "+ vis.nominee);

        vis.popularityOnCD = vis.frontSide.select(".vinyl-year ul")
            .append("li")
            .style("font-size", "12px")
            .style("display", "none")
            .text("Popularity: "+ vis.popularity);

        vis.frontSide.append("div")
            .style("position", "absolute")
            .style("top", "0")
            .style("left", "0")
            .style("width", "100%")
            .style("height", "100%")
            .style("background-color", "white")
            .style("opacity", "0.2");

        if (vis.coverArt) {
            vis.frontSide.style("background-image", `radial-gradient(circle, rgba(0, 0, 0, 0.6), transparent), url(${vis.coverArt})`);
        }

        // Click handler for flipping the vinyl
        vis.frontSide.on('mouseover', function() {
            vis.flipVinyl();
        });
        vis.frontSide.on('mouseout', function() {
            vis.resetVinyl();
        });
    }

    flipVinyl() {
        let vis = this;

        vis.isFlipped = !vis.isFlipped;

        if (vis.isFlipped) {
            vis.stackVinylsBelow();
        }
        else {
            vis.resetVinyl();
        }
    }

    resetVinyl() {
        let vis = this;
        vis.isFlipped = false;


        // reset all vinyls to the right
        vis.parentDiv
            .style("perspective", "2000px")

        d3.selectAll(".vinyl-children")
            .filter(function() {
                return +this.dataset.index >= vis.vinyl_index; // compare stored index
            })
            .select("div")
            .transition()
            .duration(300)
            .style("width", vis.childWidth + "px")
            .style("transform", `rotateY(${vis.tiltDegreeY}) translate(40px)`)
            .style("left", "0px")
            .style("transform-origin", "right center")
            .style("transform", function(d, i) {
                // return `rotateY(0deg) translateX(${vis.height}px) translateZ(40px)`;
            });

        vis.yearOnCD.style("display", "none");
        vis.artistOnCD.style("display", "none");
        vis.nomineeOnCD.style("display", "none");
        vis.popularityOnCD.style("display", "none");
    }
    stackVinylsBelow() {
        let vis = this;
        let expandedWidth = vis.height; // Box expands to be a square

        d3.selectAll(".vinyl-children")
            .filter(function() {
                return +this.dataset.index >= vis.vinyl_index;
            })
            .select("div")

            .transition()
            .duration(300)
            .style("transform", `translateX(${(expandedWidth)}px)`)

        d3.selectAll(".vinyl-children")
            .filter(function() {
                return +this.dataset.index < vis.vinyl_index;
            })
            .select("div")

        d3.select("#vinyl-child-" + vis.vinyl_index)
            .select("div")
            .transition()
            .duration(300)
            .style("width", expandedWidth + "px") // expand in place

        vis.yearOnCD.style("display", "block");
        vis.artistOnCD.style("display", "block");
        vis.nomineeOnCD.style("display", "block");
        vis.popularityOnCD.style("display", "block");
    }
}
