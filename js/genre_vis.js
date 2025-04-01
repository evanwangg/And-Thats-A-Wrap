import spotifyDataPromise from "./dataloading.js";

let genre_container = document.getElementById("genre-vis");

Promise.all([
    d3.csv('data/spotify_genres.csv'),
    spotifyDataPromise
]).then(function([genreData, fullData]) {

    // create a map for fast genre lookup
    const genreMap = new Map();
    genreData.forEach(g => genreMap.set(g.track_id, g.track_genre));

    // clean and filter the data
    const mergedData = fullData.map(song => {
        const genre = genreMap.get(song.id) || 'Unknown'; // 'Unknown' if no genre found
        const releaseDate = new Date(song.release_date);

        // filter out songs with invalid release dates or unknown genres
        if (releaseDate.getFullYear() >= 1900 && genre !== 'Unknown') {
            return {
                id: song.id,
                name: song.name,
                popularity: +song.popularity,
                release_date: releaseDate,
                genre: genre,
            };
        }
        return null; // ignore invalid entries
    }).filter(d => d !== null); // remove null entries

    // get unique genres for dropdown
    const genres = [...new Set(mergedData.map(d => d.genre))];

    // sort genres alphabetically
    genres.sort((a, b) => {
        return a.localeCompare(b);
    });

    // populate the genre dropdown
    const genreSelect = d3.select("#genre-select");
    genreSelect.selectAll("option")
        .data(genres)
        .enter().append("option")
        .attr("value", d => d)
        .text(d => d);

    genreSelect.on("keydown", function(event) {
        if (event.key === "ArrowLeft" || event.key === "ArrowRight") {
            event.preventDefault();
        }
    });

    function updateChart(selectedGenre) {
        const filteredData = mergedData.filter(d => !selectedGenre || d.genre === selectedGenre);

        // group by year and calculate average popularity
        const yearData = Array.from(
            d3.group(filteredData, d => d.release_date.getFullYear()), // group by year
            ([year, values]) => ({
                year: year,
                avgPopularity: d3.mean(values, d => d.popularity),
                genre: values[0].genre // songs in the same group share the same genre
            })
        );

        // sort by year
        yearData.sort((a, b) => a.year - b.year);

        // set chart dimensions
        const margin = { top: 0, right: 20, bottom: 0, left: 60 };
        const width = genre_container.offsetWidth * 0.8;
        const height = genre_container.offsetHeight * 0.3;

        // normal svg creation
        const svg = d3.select("#genre-chart").html("")
            .append("svg")
            .attr("width", width + margin.left + margin.right)
            .attr("height", height + margin.top + margin.bottom)
            .append("g")
            .attr("transform", `translate(${margin.left},${margin.top})`);

        // create scales
        const x = d3.scaleBand()
            .domain(yearData.map(d => d.year))
            .range([0, width])
            .padding(0.1);

        const y = d3.scaleLinear()
            .domain([d3.max(yearData, d => d.avgPopularity), 0])
            .nice()
            .range([0, height]);

        // create the bars for the first svg
        const bars = svg.append("g")
            .selectAll(".genre-bar")
            .data(yearData)
            .enter().append("rect")
            .attr("class", "genre-bar")
            .attr("x", d => x(d.year))
            .attr("y", d => y(d.avgPopularity))
            .attr("width", x.bandwidth())
            .attr("height", d => height - y(d.avgPopularity));

        // flipped svg creation
        const svgFlipped = d3.select("#genre-chart-flipped").html("")
            .append("svg")
            .attr("width", width + margin.left + margin.right)
            .attr("height", height + margin.top + margin.bottom)
            .append("g")
            .attr("transform", `translate(${margin.left},${margin.top})`);

        // create the bars for the flipped svg
        const flippedBars = svgFlipped.append("g")
            .selectAll(".genre-bar-flipped")
            .data(yearData)
            .enter().append("rect")
            .attr("class", "genre-bar-flipped")
            .attr("x", d => x(d.year))
            .attr("width", x.bandwidth())
            .attr("height", d => height - y(d.avgPopularity));

        // axis label
        svgFlipped.append("text")
            .attr("x", width / 2)
            .attr("y", height)
            .attr("class", "axis-label")
            .style("fill", "white")
            .style("text-anchor", "middle")
            .text("Release Year");

        const yAxisLabel_flipped = svgFlipped.append("text")
            .attr("x", - height / 2.4)
            .attr("y", -40)
            .attr("transform", "rotate(-90)")
            .attr("class", "axis-label")
            .style("fill", "white")
            .style("text-anchor", "right");

        // update the label based on selected genre
        if (selectedGenre === "") {
            yAxisLabel_flipped.text("Most");
        } else {
            yAxisLabel_flipped.text("Average");
        }

        const yAxisLabel_regular = svg.append("text")
            .attr("x", -height)
            .attr("y", -40)
            .attr("transform", "rotate(-90)")
            .attr("class", "axis-label")
            .style("fill", "white")
            .style("text-anchor", "left");

        // update the label based on selected genre
        if (selectedGenre === "") {
            yAxisLabel_regular.text("Popular Genre");
        } else {
            yAxisLabel_regular.text("Popularity");
        }

        // tooltip creation
        const tooltip = d3.select(".page-9").append("div")
            .attr("class", "genre-tooltip");

        // add click event listener to bars
        bars.on("mouseenter", function(event, d) {
            // tooltip displays genre, year, and average popularity
            tooltip.style("visibility", "visible")
                .html(`
                    <strong>Year:</strong> ${d.year} <br>
                    <strong>Average Popularity:</strong> ${d.avgPopularity.toFixed(2)} <br>
                    <strong>Genre:</strong> ${d.genre}
                `)
                .style("top", (event.pageY + 10) + "px")
                .style("left", (event.pageX + 10) + "px");
        });

        // hide tooltip when mouse moves away
        bars.on("mouseout", function() {
            tooltip.style("visibility", "hidden");
        });

        // add click event listener to flipped bars
        flippedBars.on("mouseenter", function(event, d) {
            // tooltip displays genre, year, and average popularity
            tooltip.style("visibility", "visible")
                .html(`
                    <strong>Year:</strong> ${d.year} <br>
                    <strong>Average Popularity:</strong> ${d.avgPopularity.toFixed(2)} <br>
                    <strong>Genre:</strong> ${d.genre}
                `)
                .style("top", (event.pageY + 10) + "px")
                .style("left", (event.pageX + 10) + "px");
        });

        // hide tooltip when mouse moves away
        flippedBars.on("mouseout", function() {
            tooltip.style("visibility", "hidden");
        });
    }

    // initial chart render with no genre filter
    updateChart("");

    // event listener for genre change
    genreSelect.on("change", function() {
        const selectedGenre = this.value;
        sessionStorage.setItem("selectedGenre", selectedGenre);
        updateChart(selectedGenre);
    });

});
