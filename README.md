# And That’s a Wrap! - Music Trends

## Project Abstract ##
After a lot of discussion, our team discovered that music is a data category that we are all interested in learning more about. We did more research and found that there is a lot of interesting data online about song/artist/etc. trends that we wanted to investigate more. Our goals are to delve into several aspects of music (such as top artists/genres over time, number of artists/songs per genre, music streaming competitor data, etc) and gather key insights to share with our classmates, in a fun data visualization that takes inspiration from Spotify’s UI.

We plan to use datasets that contain necessary data such as song name, artist, genres, year released, etc., as well as some more fun data encoded as continuous data from 0 to 1, such as danceability, instrumentalness, acousticness, and etc. The datasets that we have looked into are all available on the internet, so that is where we will be getting most of our data from.

## Main Insights ##
Main Message: Music is evolving with society, including how we intake music, popular culture events/rankings such as the Grammys and Billboard 100, as well as overall trends in the collective music the world is creating through the years. 

There are so many insights we can gain from looking at musical trends through a social lens. With this main message, we aim to guide our viewers to see just how much prevalence music has through time, and how music trends have been shaped by society.


## Project URLs and Videos ##
- Website: https://evanwangg.github.io/And-Thats-A-Wrap/
- Screencast Video:


## Data ##
Below are links to some of the datasets we use in the making of this project:

-   https://www.kaggle.com/datasets/dhruvildave/billboard-the-hot-100-songs
-   https://www.kaggle.com/datasets/yamaerenay/spotify-dataset-19212020-600k-tracks?select=tracks.csv
-   https://www.kaggle.com/datasets/dhruvildave/spotify-charts/data
-   https://www.kaggle.com/datasets/unanimad/grammy-awards
-   https://blog.datawrapper.de/music-industry-streaming-revenue-vs-physical-sales/
-   https://www.kaggle.com/datasets/maharshipandya/-spotify-tracks-dataset 


## File Structure ##

The repo is structured as:

-   `dataDownloadInstructions.md` contains instructions on how to download the required data files from Kaggle.
-   `data/download_data.py` contains code to locally install the data files required.
-   `index.html` contains HTML code for each page and JavaScript code for the text pages in between visualizations.
-   `img` contains images/icons used for the visualizations.
-   `css` contains the CSS code files for each page/visualization.
-   `js` contains the JavaScript code files for each page/visualization.

## Features and Code Files For Each Page (In Order of Appearance) ##

### For Multiple/General Pages:
-   Click the play button to have the slides play automatically (and click it again to pause the autoplay).
-   Click the left or right side buttons to go through the slides manually. 
-   Hover over the dots on the bottom to view a brief description of what each slide contains.
-   Code files:
    -   `js/main.js`: code for the play (autoplay slides), and left/right side buttons.
    -   `css/audio-controls.css`: CSS code for the play, and left/right side buttons.
    -   `css/style.css`: CSS code for all pages.
    -   `js/components/wrapped-text.js`: code for creating the text containers for the text in between visualizations (wrapped text).
    -   `css/wrapped-text.css`: CSS code for the wrapped text.
    -   `css/start-screen.css`: CSS code for the first page (Welcome).

### Globe Visualization:
-   Click on any country and any year (2017-2021) to view that country's most streamed songs from that year.
-   Click on the many circles surrounding the globe to view each of the most streamed songs and their details.
-   For each song, click the play button to play a short snippet of the song.
-   Code files:
    -   `js/vis1.js`: code for the Globe visualization.
    -   `js/components/intro-component.js`: code for creating the text container introducing the Globe visualization.
    -   `js/components/track-display.js`: code for displaying a song's details for the Globe visualization and Song Attributes visualization.
    -   `css/vis1.css`
    -   `css/intro-component.css`
    -   `css/track-display.css`

### Audio Attributes Visualization:
-   Search an artist name and view the audio attributes (popularity, acousticness, energy, etc.) of their music over the years.
-   Click on the information icons on the top left of each attribute card to learn more about what that attribute means.
-   Code files:
    -   `js/vis2.js`: code for the Audio Attributes visualization.
    -   `css/vis2.css`

### Song Attributes Visualization:
-   Search a song name to view the audio attributes for that song in a radial format.
-   View songs that have a similar distribution of audio attributes on the left side.
-   For each song, click the play button to play a short snippet of the song.
-   Code files:
    -   `js/song-attr-spider-vis.js`: code for the Song Attributes visualization.
    -   `js/components/track-display.js`: code for displaying a song's details for the Globe visualization and Song Attributes visualization.
    -   `css/track-display.css`

### Musical Key Visualization:
-   Click on any of the notes to view the number of songs in that key over the years.
-   Switch between major and minor keys.
-   View three random songs in that key and for each song, click the play button to play a short snippet of the song.
-   Code files:
    -   `js/key_vis.js`: code for the Musical Key visualization.
    -   `css/key_vis.css`

### Genre Visualization:
-   Select a genre from the dropdown list to view the average popularity of that genre over time.
-   Hover over the bars for more information.
-   Code files:
    -   `js/genre_vis.js`: code for the Genre visualization.
    -   `css/genre_vis.css`

### Intake Method Visualization:
-   Hover over the rings to view more information about the different music consumption methods in that year.
-   Click the buttons on the right side to view the revenues/proportions for the different consumption methods.
-   Switch between a radial (revenue proportions) or bar chart (revenues ($)) representation of the data.
-   Code files:
    -   `js/intake_vis.js`: code for the Intake Method visualization.
    -   `css/intake_vis.css`

### Grammy Nominations Visualization:
-   Click on a circle to view the nominations that artist received that year.
-   Scroll to view more artists.
-   Select a specific category from the dropdown list.
-   Increase/decrease the top N number of artists shown.
-   To collapse the details for an artist, click on the green box the artist name is contained in.
-   Code files:
    -   `js/vis8.js`: code for the Grammy Nominations visualization.
    -   `js/artist-timeline.js`: code for an artist's Grammy nominations timeline for the Grammy Nominations visualization.
    -   `js/nomination-info.js`: code for the nomination information used in the Grammy Nominations visualization.
    -   `css/vis8.css`

### Grammy + Popularity Visualization:
-   Adjust the slider to be shown the Grammy nominated songs within that popularity score range.
-   Click on a CD to view the song details and hover-out to close.
-   Hover over the bars of the histogram to view the years with that popularity score.
-   Click the button to hide the histogram and only view the slider and CDs.
-   Code files:
    -   `js/flipping-vis.js`: code for the Grammy + Popularity visualization.
    -   `js/vinyl.js`: code for a vinyl/CD object used in the Grammy + Popularity visualization.
    -   `css/flipping-vis.css`

### Billboard 100 Visualization:
-   Search an artist to view their Billboard charting data (their ranking + number of weeks they spent at that rank) over the years.
-   Select specific years to view with the brushing tool.
-   Click the Start Autoplay button to autoplay the brushing over the years.
-   Code files:
    -   `js/billboard_100.js`: code for the Billboard 100 visualization.
    -   `css/billboard_100.css`

### Your Wrapped Page:
-   View a summary of your activity across visualizations (the top artists, songs, genre, key, and country you selected and the minutes you spent on the website).
-   Code files:
    -   `js/wrapped_summary.js`: code for creating Your Wrapped page.
    -   `css/wrapped-summary.css`

### Our Team Page:
-   Click on a member's profile picture to view that team member's cute avatar!
-   Click through the Now Playing songs for each member.
-   Code files:
    -   `js/team.js`: code for Our Team page

### Acknowledgements and Datasets Page:
-   Click on the provided links to be taken to external sites of the datasets and APIs used in this project.
-   Code files:
    -   `js/acknowledgements.js`: code for the Acknowledgements and Datasets page.
    -   `css/acknowledgements.css`