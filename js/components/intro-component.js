
function createIntroComponent(containerId, text1, text2) {
    let introContainer = d3.select(`#${containerId}`)
        .append("div")
        .attr("class", "intro-container");

    introContainer.append("p")
        .attr("class", "intro-text-1")
        .text(text1)

    introContainer.append("p")
        .attr("class", "intro-text-2")
        .text(text2)

    return introContainer;
}

window.createIntroComponent = createIntroComponent;
