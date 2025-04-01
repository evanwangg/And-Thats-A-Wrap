// This file is responsible for loading the data from the CSV file
// and exporting it for use in other modules.
let spotifyDataPromise = d3.csv('data/spotify600k.csv');

export default spotifyDataPromise;