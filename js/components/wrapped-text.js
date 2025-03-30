
function createWrappedText(page, text1, text2) {
    let wrappedTextContainer = d3.select(`.${page}`)
        .append("div")
        .attr("class", "wrapped-text-container"); // Apply CSS class

    wrappedTextContainer.append("p")
        .attr("class", "wrapped-text-1") // Apply CSS class
        .text(text1);

    wrappedTextContainer.append("p")
        .attr("class", "wrapped-text-2") // Apply CSS class
        .text(text2);

    return wrappedTextContainer;
}

window.createWrappedText = createWrappedText;
