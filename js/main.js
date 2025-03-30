document.addEventListener("DOMContentLoaded", function () {
    const sections = document.querySelectorAll(".vis");
    const dotsContainer = document.getElementsByClassName("dots-container")[0];
    const controlsContainer = document.getElementsByClassName("audio-controls")[0];

    sessionStorage.setItem("startTime", Date.now());

    let currentIndex = 0; // current visualization
    let autoplayInterval;
    let isAutoplaying = false;
    let isBorderAnimating = false; // Track if the border animation is running

    // Create Left Button
    const leftButton = document.createElement("button");
    leftButton.innerHTML = '<i class="mdi mdi-skip-previous"></i>';
    leftButton.classList.add("control-button", "left-button");
    leftButton.addEventListener("click", moveLeft);
    controlsContainer.appendChild(leftButton);

    // Create Middle Button (Play Button)
    const playButton = document.createElement("button");
    playButton.innerHTML = '<i class="mdi mdi-play"></i>';
    playButton.classList.add("control-button", "play-button");
    playButton.addEventListener("click", toggleAutoplay);
    controlsContainer.appendChild(playButton);

    // Create Right Button
    const rightButton = document.createElement("button");
    rightButton.innerHTML = '<i class="mdi mdi-skip-next"></i>';
    rightButton.classList.add("control-button", "right-button");
    rightButton.addEventListener("click", moveRight);
    controlsContainer.appendChild(rightButton);

    // Create dots dynamically
    sections.forEach((section, index) => {
        const dot = document.createElement("div");
        dot.classList.add("dot");
        if (index === 0) dot.classList.add("active"); // First dot is active by default

        // add a tooltip with the page name, otherwise the page number
        const tooltip = document.createElement("div");
        tooltip.classList.add("circle-tooltip");
        tooltip.textContent = section.getAttribute("data-page-name") || `Page ${index + 1}`;

        // show tooltip on hover
        dot.addEventListener("mouseover", function () {
            document.body.appendChild(tooltip);
            const dotRect = dot.getBoundingClientRect();
            tooltip.style.position = "absolute";
            tooltip.style.left = `${dotRect.left + dotRect.width / 2 - tooltip.offsetWidth / 2}px`; // Center the tooltip above the dot
            tooltip.style.top = `${dotRect.top - tooltip.offsetHeight - 5}px`; // Position the tooltip just above the dot
            tooltip.style.opacity = 1;
        });

        // hide tooltip on mouseout
        dot.addEventListener("mouseout", function () {
            tooltip.style.opacity = 0;
            document.body.removeChild(tooltip);
        });

        dot.addEventListener("click", () => changeSlide(index));
        dotsContainer.appendChild(dot);
    });

    const dots = document.querySelectorAll(".dot");

    document.addEventListener("keydown", function (event) {
        if (event.key === "ArrowRight") {
            moveRight();
        } else if (event.key === "ArrowLeft") {
            moveLeft();
        }
    });

    function moveRight() {
        if (currentIndex < sections.length - 1) {
            currentIndex++; // Move to the next slide
        } else {
            currentIndex = 0; // Loop back to the first slide
        }
        updateSlide();
    }

    function moveLeft() {
        if (currentIndex > 0) {
            currentIndex--; // Move to the previous slide
        } else {
            currentIndex = sections.length - 1; // Loop to the last slide
        }
        updateSlide();
    }

    function changeSlide(index) {
        currentIndex = index;
        updateSlide();
    }

    function updateSlide() {
        sections.forEach((section, index) => {
            if (index === currentIndex) {
                section.classList.add("in-view");

                const elements = section.querySelectorAll("*");
                elements.forEach((el) => {
                    el.style.animation = "none"; // Reset animation
                    void el.offsetWidth; // Force reflow
                    el.style.animation = ""; // Restart animation
                });
            } else {
                section.classList.remove("in-view");
            }
            section.style.transform = `translateX(${(index - currentIndex) * 100}%)`;
        });

        // Update active dot
        dots.forEach((dot) => dot.classList.remove("active"));
        dots[currentIndex].classList.add("active");

        // Reset and re-trigger the autoplay button border animation
        if (isAutoplaying) {
            resetAutoplayButton();
            fillPlayButtonBorder();
        }
    }

    // autoplay toggle function
    function toggleAutoplay() {
        if (isAutoplaying) {
            clearInterval(autoplayInterval); // stop autoplay
            isAutoplaying = false;
            playButton.innerHTML = '<i class="mdi mdi-play"></i>'; // update button to play icon
            resetAutoplayButton(); // reset the border animation
        } else {
            isAutoplaying = true;
            playButton.innerHTML = '<i class="mdi mdi-pause"></i>'; // update button to pause icon
            startAutoplay();
        }
    }

    // start autoplay with timer
    function startAutoplay() {
        autoplayInterval = setInterval(() => {
            moveRight(); // next slide
            resetAutoplayButton(); // reset border
            fillPlayButtonBorder(); // start timer animation
        }, 5000); // change slide every 5 seconds
        resetAutoplayButton(); // reset border
        fillPlayButtonBorder(); // initial fill before the first slide change
    }

    // function to animate the filling of the border in the play button
    function fillPlayButtonBorder() {
        isBorderAnimating = true; // set animation state
        playButton.classList.add("autoplaying");
        playButton.style.transition = "border 5s linear";
        playButton.style.border = "5px solid #1db954";

        // listen for the end of the transition
        playButton.addEventListener("transitionend", () => {
            isBorderAnimating = false; // set animation state to finished
        }, { once: true });
    }

    // reset the autoplay button border animation
    function resetAutoplayButton() {
        if (isBorderAnimating) {
            playButton.style.transition = "none"; // disable transition for instant reset
            playButton.style.border = "5px solid transparent"; // reset border to transparent
            void playButton.offsetWidth; // force reflow
            playButton.style.transition = ""; // re-enable transition
        }
        playButton.classList.remove("autoplaying");
        isBorderAnimating = false; // reset animation state
    }
});