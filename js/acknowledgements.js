const content = [
    {
        title: "Acknowledgements",
        details: [
            "Thank you to the amazing CSC316 teaching staff, who provided insightful feedback and guidance throughout the term. Special thanks to our TA, Matthew Varona!"
        ]
    },
    {
        title: "Datasets",
        sources: [
            {
                name: "Global Spotify Top 200",
                link: "https://www.kaggle.com/datasets/dhruvildave/spotify-charts/data",
                img: "../img/datasets/global-spotify-top-200.png"
            },
            {
                name: "Spotify Audio Features, Musical Key",
                link: "https://www.kaggle.com/datasets/yamaerenay/spotify-dataset-19212020-600k-tracks?select=tracks.csv",
                img: "../img/datasets/spotify-audio-attrs.png"
            },
            {
                name: "Spotify Music Genres",
                link: "https://www.kaggle.com/datasets/maharshipandya/-spotify-tracks-dataset",
                img: "../img/datasets/spotify-genres.png"
            },
            {
                name: "Music Intake Method Revenue",
                link: "https://blog.datawrapper.de/music-industry-streaming-revenue-vs-physical-sales/",
                img: "../img/datasets/music-money.png"
            },
            {
                name: "Grammy Awards",
                link: "https://www.kaggle.com/datasets/unanimad/grammy-awards",
                img: "../img/datasets/grammys.png"
            },
            {
                name: "Billboard Hot 100",
                link: "https://www.kaggle.com/datasets/dhruvildave/billboard-the-hot-100-songs",
                img: "../img/datasets/billboard-100.png"
            }
        ]
    },
    {
        title: "Other Sources",
        sources: [
            {
                name: "Spotify API",
                link: "https://developer.spotify.com/documentation/web-api/",
                img: "../img/datasets/spotify-logo.png"
            },
            {
                name: "Material Design Icons",
                link: "https://pictogrammers.com/library/mdi",
                img: "../img/datasets/material-design-icons.png"
            }
        ]
    }
];
let width = document.getElementById('acknowledgements').offsetWidth * 0.8;
let height = document.getElementById('acknowledgements').offsetHeight * 1 - 40;

let row = d3.select("#acknowledgements")
    .append("div")
    .attr("class", "row")
    .style("width", `${width}px`)
    .style("height", `${height}px`)

row.append("div").attr("class", "col-md-2");
let container = row.append("div").attr("class", "col-md-8");
row.append("div").attr("class", "col-md-2");

container.selectAll("div.section")
    .data(content)
    .enter()
    .append("div")
    .style("text-align", "left")
    //.attr("class", d => d.title.toLowerCase().replace(/\s+/g, "-"))
    .each(function(d) {
        const section = d3.select(this);

        section.append("h1").text(d.title);
        if (d.details) {
            section.append("h5").text(d.details[0]);
        }

        if (d.sources) {
            const container = section.append("div")
                .attr("id", d.title === "Datasets" ? "data-sources" : "other-sources");

            let gridItem = container.selectAll("div.source")
                .data(d.sources)
                .enter()
                .append("div")
                .attr("class", "grid-item")
                .on("mouseover", function() {
                    d3.select(this)
                        .transition()
                        .duration(100)
                        .style("background-color", "#6b6b6b")
                })
                .on("mouseout", function() {
                    d3.select(this)
                        .transition()
                        .duration(100)
                        .style("background-color", "#2f2f2f")
                })
                .on("click", function(event, s) {
                    window.open(s.link, "_blank");
                });
            gridItem.append("img")
                .attr("src", s => s.img);
            gridItem.append("a")
                // .attr("href", s => s.link)
                // .attr("target", "_blank")
                .text(s => s.name);
        }
    });
