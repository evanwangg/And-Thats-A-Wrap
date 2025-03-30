/*
* NOMINATION INFORMATION
* Each nomination
*/

class NominationInfo {
    constructor(parentElement, name, artistData, year) {
        this.parentElement = parentElement;
        this.name = name;
        this.artistData = artistData;
        this.year = year;

        this.initVis();
    }
    initVis() {
        let vis = this;

        vis.spotifyColours = {
            1: ["orange", "blue"],
            2: ["hotpink", "yellow"],
            3: ["yellow", "darkgreen"],
            4: ["blue", "white"],
        }

        vis.masks = {
            1: "url('img/masks/mask-4.svg')",
            2: "url('img/masks/mask-3.svg')",
            3: "url('img/masks/mask-3.svg')",
            4: "url('img/masks/mask-4.svg')",
        }


        vis.margin = {top: 5, bottom: 0, right: 5, left: 5};
        vis.width = document.getElementById(vis.parentElement).getBoundingClientRect().width * 2 / 3 ;
        vis.height = document.getElementById(vis.parentElement).getBoundingClientRect().height  ;

        // container -> 2 children overlayed
        //            |-> image
        //            |-> text

        let chosenColour = vis.spotifyColours[vis.randomInt()]

        let container = d3.select("#" + vis.parentElement)
            .append("div")
            .attr("class", "nomination-information")
            .style("display", "flex")
            .style("width", "100%")
            .style("background-color", chosenColour[0])
            .style("align-items", "stretch");

        vis.nominationDiv = container.append("div")
            .attr("class", "each-nomination")
            .style("flex", "2") ;

        vis.imageDiv = container.append("div")
            .attr("class", "nomination-image")
            // .style("flex", "1")
            .style("position", "absolute")
            .style("top", "0")
            .style("right", -vis.height / 2 + "px")
            .style("height", "200%")
            .style("background-size", "auto 50%")
            .style("background-size", "cover")
            .style("background-position", "right center");


        vis.displayArtistAndWorkImages(vis.name, vis.artistData.nominee).then(chosenImage => {
            if (chosenImage) {
                let randomIndex = vis.randomInt()
                let imgElement = vis.imageDiv.append("img")
                    .attr("src", chosenImage)
                    .style("mask-image", vis.masks[randomIndex])
                    .style("-webkit-mask-image", vis.masks[randomIndex])
                    .style("width", "100%")
                    .style("height", "100%")
                    .style("background-size", "auto 100%");

                imgElement
                    .style("mask-size", "100% 100%")
                    .style("-webkit-mask-size", "100% 100%");

            } else {
                console.error("No artist image found.");
            }
        });
        vis.nominationDiv.append("div")
            .attr("class", "nominee-text")
            .append("p")
            .text(vis.artistData.nominee)
            .style("color", chosenColour[1]);

        vis.nominationDiv.append("div")
            .attr("class", "category-text")
            // .attr("x", 0)
            .append("p")
            .text(vis.artistData.category)
            .style("color", chosenColour[1]);

    }

    randomInt() {
        let min = 1
        let max = 4
        return Math.floor(Math.random() * (max - min + 1)) + min;
    }

    async getArtistImageFromWikidata(artist, work) {
        const url = `https://en.wikipedia.org/w/api.php?action=query&format=json&origin=*&titles=${encodeURIComponent(artist)}&prop=pageimages&pithumbsize=500`;

        try {
            const response = await fetch(url);
            const data = await response.json();
            const pages = data.query.pages;

            for (let key in pages) {
                if (pages[key].thumbnail) {
                    return pages[key].thumbnail.source; // Get Wikipedia image URL
                }
            }

            return null;
        } catch (error) {
            console.error("Error fetching artist image:", error);
            return null;
        }
    }

    async getWorkImageFromWikipedia(artist, work) {
        const query = `${work} ${artist}`; // Example: "Billie Eilish Happier Than Ever"
        const url = `https://en.wikipedia.org/w/api.php?action=query&format=json&origin=*&titles=${encodeURIComponent(query)}&prop=pageimages&pithumbsize=500`;

        try {
            const response = await fetch(url);
            const data = await response.json();
            const pages = data.query.pages;

            for (let key in pages) {
                if (pages[key].thumbnail) {
                    return pages[key].thumbnail.source; // Get the work's image
                }
            }

            return null;
        } catch (error) {
            console.error("Error fetching work image:", error);
            return null;
        }
    }

    async  displayArtistAndWorkImages(artist, work) {
        let vis = this
        let workImage = await vis.getWorkImageFromWikipedia(artist, work);

        if (!workImage) {
            workImage = await vis.getArtistImageFromWikidata(artist); // use artist image as fallback
        }

        return workImage || "img/grammy_placeholder.jpg"; // final fallback if both fail
    }

}