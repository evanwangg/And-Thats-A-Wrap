function createTrackDisplay(coverArt, trackTitle, trackArtist, div) {
    // Append the cover art image
    let trackContainer = div.append('div')
        .attr("class", "track-container");
    
    trackContainer.append('img')
        .attr('src', coverArt)
        .attr('alt', `${trackTitle} cover art`)
        .attr('class', 'track-cover');

    // Append the track title
    trackContainer.append('p')
        .attr('class', 'track-title')
        .text(trackTitle);

    // Append the track artist
    trackContainer.append('p')
        .attr('class', 'track-artist')
        .text(trackArtist);

}

function createCircleTrackDisplay(trackId, coverArt, trackTitle, trackArtist, trackTotalStreams, trackMaxStreams, trackPeakRank, trackRank, div) {
    trackRank++;
    let trackPosition = '';
    if (parseInt(trackRank) % 10 === 1 && (parseInt(trackRank) !== 11)) {
        trackPosition = trackRank.toString() + 'st';
    } else if (parseInt(trackRank) % 10 === 2 && (parseInt(trackRank) !== 12)) {
        trackPosition = trackRank.toString() + 'nd';
    } else if (parseInt(trackRank) % 10 === 3 && (parseInt(trackRank) !== 13)) {
        trackPosition = trackRank.toString() + 'rd';
    } else {
        trackPosition = trackRank.toString() + 'th';
    }
    
    // Append the cover art image
    let trackContainer = div.append('div')
        .attr("class", "track-container-circle");
    trackContainer.append('img')
        .attr('src', coverArt)
        .attr('alt', `${trackTitle} cover art`)
        .attr('class', 'track-cover-circle');
    // Append the track title
    trackContainer.append('p')
        .attr('class', 'track-title-circle')
        .text(trackTitle)
        .style("color", "#d0d0d0");
    // Append the track artist
    trackContainer.append('p')
        .attr('class', 'track-artist-circle')
        .text(trackArtist)
        .style("color", "#1DB954");
    // Extra info
    trackContainer.append('p')
        .attr('class', 'track-extraInfo-circle')
        .text(`${trackPosition} Most Streamed in the Country`)
        .style("color", "#909090");
    trackContainer.append('p')
        .attr('class', 'track-extraInfo-circle')
        .text(`Total Streams: ${trackTotalStreams.toLocaleString()}`)
        .style("color", "#909090");
    trackContainer.append('p')
        .attr('class', 'track-extraInfo-circle')
        .text(`Most Streams in One Day: ${trackMaxStreams.toLocaleString()}`)
        .style("color", "#909090");
    trackContainer.append('p')
        .attr('class', 'track-extraInfo-circle')
        .text(`Peak Rank on Spotify Charts: ${trackPeakRank}`)
        .style("color", "#909090");
    // Spotify embed
    let trackDiv = div.append("div");
    trackDiv.append("iframe")
        .attr("src", `https://open.spotify.com/embed/track/${trackId}`)
        .attr("width", "100%")
        .attr("height", "80")
        .attr("allow", "autoplay; clipboard-write; encrypted-media; picture-in-picture")
        .attr("loading", "lazy")
}

window.createTrackDisplay = createTrackDisplay;
window.createCircleTrackDisplay = createCircleTrackDisplay;
