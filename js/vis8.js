/* ********************************************
* GRAMMY TIMELINE
***********************************************/
let data;
let artistTimeline = [];

// d3.csv("data/mock_data.csv", (row) => {
d3.csv("data/the_grammy_awards_cleaned.csv", (row) => {
    row.artist = row.artist
    return row;
}).then((loadedData) => {
    data = loadedData
    let filteredData = data.filter(d => !(d.nominee === "" && d.artist === ""));

    filteredData.forEach(d => {
        if (d.artist === "" && d.nominee !== "") {
            d.artist = d.nominee;  // replace artist with nominee value
        }
    });

    filteredData = filteredData.filter(d => (d.artist !== d.nominee) && (d.artist !== "(Various Artists)"));



    let groupedByCategory = Array.from(
        d3.rollup(
            filteredData,
            v => ({
                artists: Array.from(new Set(v.map(d => d.artist)))  // Get unique artists in each category
            }),
            d => d.category // Group by category
        ),
        ([category, values]) => ({
            category: category,
            artists: values.artists // List of unique artists per category
        })
    );



    let groupedData = Array.from(
        d3.rollup(
            filteredData,
            v => ({
                count: v.length,
                nominations: v.map(d => ({
                    nominee: d.nominee,
                    category: d.category,
                    year: d.year
                })),
                nominationsByYear: d3.rollup(
                    v,
                    nominations => ({
                        count: nominations.length,
                        nominations: nominations.map(d => ({
                            nominee: d.nominee,
                            category: d.category,
                            winner: d.winner
                        }))
                    }),
                    d => d.year  // Group nominations by year
                ),
                years: Array.from(new Set(v.map(d => +d.year))).sort((a, b) => a - b),
                category: Array.from(new Set(v.map(d => d.category))),
            }),
            d => d.artist // key
        ),
        ([artist, values]) => ({
            artist: artist,
            count: values.count,
            nominations: values.nominations,
            years: values.years,
            category: values.category,
            nominationsByYear: values.nominationsByYear,  // Now grouped by year

        })
    );

    // let filteredGroupedData = groupedData.filter(d => d.count >= 5);

    const vis8 = d3.select("#vis8");

    const layout = vis8.append("div")
        .attr("id", "timeline-area")
        .style("width", "100%")
        .style("height", "100%")  // occupy the prefixed vis height across project
        .style("overflow-y", "auto");

    let topInfoBox = layout.append("div")
        .attr("class", "top-info-box info-box")
        .style("width", "100%")
        .style("height", "20%");

    const artistWrapper = layout.append("div")
        .attr("id", "artist-wrapper")
        .style("width", "100%")
        .style("height", "75%")
        .style("overflow", "hidden")
        .style("display", "flex")
        .style("justify-content", "center")
        .style("align-items", "center")
        .style("overflow-y", "auto");

    let artistBox = artistWrapper.append("div")
        .attr("id", "artist-timeline-area")
        .style("width", "100%")
        .style("height", "100%")
        .style("overflow-y", "auto");


    // let artistBox = layout.append("div")
    //     .attr("id", "artist-timeline-area")
    //     .style("width", "100%")
    //     .style("height", "70%");

    let bottomInfoBox = layout.append("div")
        .attr("class", "bottom-info-box info-box")
        .attr("id", "bottom-info-box")
        .style("width", "100%")
        .style("height", "5%");
    //     .style("background-color", "pink");

    bottomInfoBox.artistName = bottomInfoBox.append("div")
        .attr("id", "collapse-all")
        .style("width", "23%")
        .style("height", "100%")
        .style("display", "flex")
        .style("justify-content", "center")
        .style("align-items", "flex-start")
        .style("display", "none") // initially hidden - hide toggle here
        .append("p")
        .style("text-align", "center")

    bottomInfoBox.artistName
        .append("div")
        .attr("id", "collapse-all-child")
        .style("align-items", "left")
        .style("display", "none") // initially hidden - hide toggle here
        .text("Collapse All!")

    bottomInfoBox.timelineWrapper = bottomInfoBox.append("div")
        .attr("id", "bottom-right-info")
        .style("display", "flex")
        .style("width", "75%")
        .style("height", "100%")
        .style("justify-content", "center")
        .style("align-items", "flex-start")
        .append("p")
        .style("text-align", "center")
        .text("Click on a circle to explore the artist's nomination for that year. Click on expanded artist name to collapse each artist.");

    let visTitle = topInfoBox.append("div")
        .attr("id", "vis-title")
        .style("flex", "3");

    visTitle.append("h4")
        .text("Each Grammy Winning Artist's History");

    const sortFilter = topInfoBox.append("div")
        .attr("id", "sort-filter")
        .style("width", "100%")
        .style("height", "100%")
        .style("flex", "4");

    const categoryWrapper = sortFilter.append("div")
        .attr("id", "category-artists-wrapper")
        .style("width", "100%")
        .style("height", "50%")
        .style("display", "flex")
        .style("flex", "2")  // 2 blocks
        .style("align-items", "center")
        .style("gap", "10px");

    const topArtistsWrapper = sortFilter.append("div")
        .attr("id", "top-artists-wrapper")
        .style("width", "100%")
        .style("height", "50%")
        .style("display", "flex")
        .style("flex", "2")  // 2 blocks
        .style("align-items", "center")
        .style("gap", "10px");

    categoryWrapper.append("label")
        .attr("for", "category-dropdown")
        .style("flex", "1")
        .style("color", "whitesmoke")
        .style("text-align", "right")
        .style("align-items", "center")
        .text("Category");

    const defaultCategory = groupedByCategory[0]; // default category

    // sort filter option 1 - for category
    const categoryDropdownWrapper = categoryWrapper.append("div")
        .style("flex", "2")  // 2 blocks within sortFilter
        .append("select")
        // .attr("id", "category-dropdown")
        .attr("class", "form-select category-dropdown")
        .style("cursor", "pointer");

    let substringLen = 55;
    categoryDropdownWrapper.selectAll("option")
        .data(groupedByCategory)
        .enter()
        .append("option")
        .attr("value", d => d.category)
        .text(d => {
            // Check if the category name is longer than 20 characters
            const categoryName = d.category;
            if (categoryName.length > substringLen) {
                return categoryName.substring(0, substringLen) + "...";
            } else {
                return categoryName;
            }
        })        .property("selected", d => d.category === defaultCategory.artists.length);

        let filteredGroupedData = groupedData.filter(d => d.category.includes(defaultCategory.category));
        categoryDropdownWrapper.on("change", function() {
        const selectedCategory = this.value;
        filteredGroupedData = groupedData.filter(d => d.category.includes(selectedCategory));
        updateVisualization(filteredGroupedData);
    });

    // sort filter option 2 - Top Artists Filter
    const topArtistsFilter = topArtistsWrapper.append("div")
        .style("flex", "1")  // 1 blocks within sortFilter
        .style("display", "flex")
        .style("align-items", "center")
        .style("gap", "10px");

    topArtistsFilter.append("p")
        .style("color", "whitesmoke")
        .style("flex", "1")
        .style("text-align", "right")
        .style("align-items", "center")
        .text("Top artists")

    let buttonDiv = topArtistsFilter.append("div")
        .attr("id", "btn-div")
        .style("display", "flex")
        .style("width", "100%")
        .style("flex", "2")
        .style("gap", "5px")
        .style("align-items", "center");

// Decrement Button
    const decrementButton = buttonDiv.append("button")
        .text("−")
        .attr("id", "decrement-btn")
        .attr("class", "btn btn-filter")
        .style("padding", "5px 10px")
        .style("font-size", "16px");

    // Input Field (Fixed)
    const topArtistsValue = buttonDiv.append("input")
        .attr("id", "top-artists-value")
        // .attr("type", "number")
        // .attr("readonly", true)  // Prevent manual input
        .style("width", "5rem")
        .style("text-align", "center")
        .style("font-size", "16px")
        .style("pointer-events", "none");

    topArtistsValue.property("value", defaultCategory.artists.length);

    topArtistsValue.on("input", function() {
        let value = this.value;

        // Prevent going beyond min/max
        // if (value <= 1) value = 1;
        // if (value >= defaultCategory.artists.length) value = defaultCategory.artists.length;

        this.value = value;  // Enforce limits
        updateArtists();
    });

// Increment Button
    const incrementButton = buttonDiv.append("button")
        .text("+")
        .attr("id", "increment-btn")
        .attr("class", "btn btn-filter")
        .style("padding", "5px 10px")
        .style("font-size", "16px");

    decrementButton.on("click", function() {
        let currentValue = +topArtistsValue.property("value") ;
        if (currentValue > 1) {
            topArtistsValue.text(currentValue - 1);
            updateArtists();
        }
    });

    // button for top N artists
    incrementButton.on("click", function() {
        let currentValue = +topArtistsValue.property("value") ;
        if (currentValue < groupedData.length) {
            topArtistsValue.text(currentValue + 1);
            updateArtists();
        }

        // if (currentValue => groupedData.length) {
        //     incrementButton.attr("disabled", true).style("opacity", "0.5");
        // }

    });


    // update visualization
    function updateArtists() {
        const topN = +topArtistsValue.text();
        const selectedCategory = categoryDropdownWrapper.property("value");

        const filteredByCategory = groupedData.filter(d => d.category.includes(selectedCategory));
        const sortedGroupedData = filteredByCategory
            .sort((a, b) => b.count - a.count)
            .slice(0, topN);

        updateVisualization(sortedGroupedData);
    }

    // function to update the visualization with the filtered data
    function updateVisualization(filteredGroupedData) {
        const artistBox = d3.select("#artist-timeline-area");
        artistBox.html("");

        filteredGroupedData
            .sort((a, b) => b.count - a.count)
            .forEach((artistData, artist_index) => {
            const artistDiv = artistBox.append("div")
                .attr("class", "artist-timeline-area-between")
                .attr("id", "timeline-area-" + artist_index);
            artistTimeline.push(new ArtistTimeline("timeline-area-" + artist_index, artistData, artist_index));
        });
        const currentVisibleArtists = d3.selectAll(".artist-timeline-area-between")
        let currentValue = +topArtistsValue.property("value");
        topArtistsValue.property("value", filteredGroupedData.length);

        // if (currentValue + 1 >= filteredGroupedData.length) {
        //     incrementButton.attr("disabled", true).style("background-colour", "grey");
        // }
        // else{
        //     incrementButton.attr("disabled", false).style("background-colour", "red");
        // }
    }


    // each artist would get its own parentdiv, for example: timeline-area-billie-eilish
    filteredGroupedData
        .sort((a, b) => b.count - a.count)
        .forEach((artistData, artist_index) => {
        artistBox.append("div")
            .attr("class", "artist-timeline-area-between")
            .attr("id", "timeline-area-"+artist_index)
        artistTimeline.push(new ArtistTimeline("timeline-area-"+artist_index, artistData, artist_index));
    });
});

