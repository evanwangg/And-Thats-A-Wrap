document.addEventListener("DOMContentLoaded", function () {
    const page19 = document.querySelector(".page-19");
    if (page19) {
        const observer = new IntersectionObserver(entries => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    sessionStorage.setItem("endTime", Date.now());
                    d3.select(".page-19").selectAll(".summary-div").remove();

                    let globeTrackSelectedImg = sessionStorage.getItem("globeTrackSelectedImg");
                    let audioAttrsArtistSelectedImg = sessionStorage.getItem("audioAttrsArtistSelectedImg");
                    let radialTrackSelectedImg = sessionStorage.getItem("radialTrackSelectedImg");

                    let genreSelected = sessionStorage.getItem("selectedGenre") || 'Not Available';
                    let lastSearchedArtist = sessionStorage.getItem("lastSearchedArtist") || 'Not Available';
                    let keySelected = sessionStorage.getItem("keySelected") || 'Not Available';

                    let globeTrackSelected = sessionStorage.getItem("globeTrackSelected") || 'Not Available';
                    let audioAttrsArtistSelected = sessionStorage.getItem("audioAttrsArtistSelected") || 'Not Available';
                    let radialTrackSelected = sessionStorage.getItem("radialTrackSelected") || 'Not Available';
                    let countrySelected = sessionStorage.getItem("countrySelected") || 'Not Available';

                    let startTime = sessionStorage.getItem("startTime") || 0;
                    let endTime = sessionStorage.getItem("endTime") || 0;
                    startTime = parseInt(startTime);
                    endTime = parseInt(endTime);
                    let timeSpent = (endTime - startTime) / 60000;

                    let wrappedData = [
                        { title: 'Top Artists', data: [lastSearchedArtist, audioAttrsArtistSelected] },
                        { title: 'Top Songs', data: [globeTrackSelected, radialTrackSelected] },
                        { title: 'Top Genre', data: [genreSelected] },
                        { title: 'Top Key', data: [keySelected] },
                        { title: 'Minutes Spent Visualizing', data: [timeSpent.toFixed(2)] },
                        { title: 'Top Country', data: [countrySelected] },
                    ];

                    // hold img and text
                    let summaryDiv = d3.select(".page-19")
                        .append("div")
                        .attr("class", "summary-div");
                    
                    // hold img
                    let img = '../img/album-placeholder.png';
                    if (!audioAttrsArtistSelectedImg) {
                        if (!globeTrackSelectedImg) {
                            if (!radialTrackSelectedImg) {
                                img = '../img/album-placeholder.png';
                            } else {
                                img = radialTrackSelectedImg;
                            }
                        } else {
                            img = globeTrackSelectedImg;
                        }
                    } else {
                        img = audioAttrsArtistSelectedImg;
                    }
                    let wrappedImg = summaryDiv
                        .append("img")
                        .attr("class", "wrapped-img-div")
                        .attr("src", img);
                    
                    // hold text
                    let wrappedTextDiv = summaryDiv
                        .append("div")
                        .attr("class", "wrapped-text-div");
                    wrappedData.forEach(item => {
                        // hold text for each category
                        let itemDiv = wrappedTextDiv
                            .append("div")
                            .attr("class", "item-div");
                        // text for title
                        let titleDiv = itemDiv
                            .append("div")
                            .attr("class", "title-div")
                            .text(item.title);
                        // hold text for all songs/artists (and also genre, time, key,)
                        let dataDiv = itemDiv
                            .append("div")
                            .attr("class", "data-div");
                        item.data.forEach((dataItem, i) => {
                            // hold text for each song/artist (and also genre, time, key,)
                            let dataItemDiv = dataDiv
                                .append("div")
                                .attr("class", "data-item-div")
                                .text(() => {
                                    return item.title === 'Top Artists' || item.title === 'Top Songs'
                                    ? `${i + 1}   ${dataItem}` : `${dataItem}`
                                })
                                .style("font-size", () => {
                                    return item.title === 'Top Artists' || item.title === 'Top Songs'
                                    ? '1.2rem' : '1.7rem'
                                });
                        })
                    })
                }
            });
        }, { threshold: 0.01 });
        observer.observe(page19);
    }
});

d3.select(".page-19")
    .append("div")
    .attr("class", "wrapped-summary");
d3.select(".page-19")
    .append("div")
    .attr("class", "extra-info-text")
    .text("Info is based on most your recent interactions on the website");
