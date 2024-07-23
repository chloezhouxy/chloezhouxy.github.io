// Parameters
const params = { currentScene: 0 };
const width = 800;
const height = 400;
const margin = { top: 20, right: 30, bottom: 50, left: 60 };

// Create the SVG container
const svg = d3.select("#visualization").append("svg")
    .attr("width", width + margin.left + margin.right)
    .attr("height", height + margin.top + margin.bottom)
    .append("g")
    .attr("transform", `translate(${margin.left},${margin.top})`);

// Load the data
d3.csv("us-states.csv").then(data => {
    data.forEach(d => {
        d.date = new Date(d.date);
        d.cases = +d.cases;
    });

    // Set up scales
    const x = d3.scaleTime()
        .domain(d3.extent(data, d => d.date))
        .range([0, width]);

    const y = d3.scaleLinear()
        .domain([0, d3.max(data, d => d.cases)])
        .nice()
        .range([height, 0]);

    // Add axes
    const xAxis = svg.append("g")
        .attr("transform", `translate(0,${height})`)
        .call(d3.axisBottom(x));

    const yAxis = svg.append("g")
        .call(d3.axisLeft(y));

    // Add axis labels
    svg.append("text")
        .attr("class", "axis-label")
        .attr("x", width / 2)
        .attr("y", height + margin.bottom - 10)
        .style("text-anchor", "middle")
        .text("Date");

    svg.append("text")
        .attr("class", "axis-label")
        .attr("transform", "rotate(-90)")
        .attr("x", -height / 2)
        .attr("y", -margin.left + 15)
        .style("text-anchor", "middle")
        .text("Daily Cases");

    // Define scenes
    function updateScene() {
        svg.selectAll(".scene").remove();

        if (params.currentScene === 0) {
            scene1();
        } else if (params.currentScene === 1) {
            scene2();
        } else if (params.currentScene === 2) {
            scene3();
        } else if (params.currentScene === 3) {
            scene4();
        }
    }

    function scene1() {
        const scene = svg.append("g").attr("class", "scene");
        
        const cases2020 = data.filter(d => d.date.getFullYear() === 2020);
        scene.append("path")
            .datum(cases2020)
            .attr("fill", "none")
            .attr("stroke", "steelblue")
            .attr("stroke-width", 1.5)
            .attr("d", d3.line()
                .x(d => x(d.date))
                .y(d => y(d.cases))
            );

        // Add annotation
        scene.append("text")
            .attr("class", "annotation")
            .attr("x", x(new Date("2020-04-01")))
            .attr("y", y(d3.max(cases2020, d => d.cases)) - 10000) // Adjusted height
            .attr("fill", "black")
            .attr("font-size", "12px")
            .text("Spike in cases in April 2020");
    }

    function scene2() {
        const scene = svg.append("g").attr("class", "scene");

        const cases2021 = data.filter(d => d.date.getFullYear() === 2021);
        scene.append("path")
            .datum(cases2021)
            .attr("fill", "none")
            .attr("stroke", "steelblue")
            .attr("stroke-width", 1.5)
            .attr("d", d3.line()
                .x(d => x(d.date))
                .y(d => y(d.cases))
            );

        // Add annotation
        scene.append("text")
            .attr("class", "annotation")
            .attr("x", x(new Date("2021-01-01")))
            .attr("y", y(d3.max(cases2021, d => d.cases)) - 10000) // Adjusted height
            .attr("fill", "black")
            .attr("font-size", "12px")
            .text("Surge in January 2021");
    }

    function scene3() {
        const scene = svg.append("g").attr("class", "scene");

        const cases2022 = data.filter(d => d.date.getFullYear() === 2022);
        scene.append("path")
            .datum(cases2022)
            .attr("fill", "none")
            .attr("stroke", "steelblue")
            .attr("stroke-width", 1.5)
            .attr("d", d3.line()
                .x(d => x(d.date))
                .y(d => y(d.cases))
            );

        // Add annotation
        scene.append("text")
            .attr("class", "annotation")
            .attr("x", x(new Date("2022-07-01")))
            .attr("y", y(d3.max(cases2022, d => d.cases)) - 10000) // Adjusted height
            .attr("fill", "black")
            .attr("font-size", "12px")
            .text("Increase in mid-2022");
    }

    function scene4() {
        const scene = svg.append("g").attr("class", "scene");

        // Create a dropdown for state selection
        const states = Array.from(new Set(data.map(d => d.state)));
        const dropdown = d3.select("body").append("select")
            .attr("id", "stateDropdown")
            .on("change", () => {
                const selectedState = dropdown.node().value;
                updateStateTrend(selectedState);
            });

        dropdown.selectAll("option")
            .data(states)
            .enter()
            .append("option")
            .text(d => d);

        // Initial trend for the first state
        updateStateTrend(states[0]);

        function updateStateTrend(state) {
            const stateData = data.filter(d => d.state === state);

            // Update y-axis scale based on selected state data
            y.domain([0, d3.max(stateData, d => d.cases)]).nice();
            yAxis.transition().duration(1000).call(d3.axisLeft(y));

            // Remove previous path if any
            svg.selectAll(".state-trend").remove();

            // Draw the trend for the selected state
            scene.append("path")
                .datum(stateData)
                .attr("class", "state-trend")
                .attr("fill", "none")
                .attr("stroke", "steelblue")
                .attr("stroke-width", 1.5)
                .attr("d", d3.line()
                    .x(d => x(d.date))
                    .y(d => y(d.cases))
                );

            // Add annotation
            svg.selectAll(".annotation").remove();
            svg.append("text")
                .attr("class", "annotation")
                .attr("x", x(stateData[Math.floor(stateData.length / 2)].date))
                .attr("y", y(stateData[Math.floor(stateData.length / 2)].cases) - 1000)
                .attr("fill", "black")
                .attr("font-size", "12px")
                .text(`Trend for ${state}`);
        }
    }

    // Add navigation buttons
    d3.select("#prevButton")
        .on("click", () => {
            params.currentScene = (params.currentScene - 1 + 4) % 4;
            updateScene();
        });

    d3.select("#nextButton")
        .on("click", () => {
            params.currentScene = (params.currentScene + 1) % 4;
            updateScene();
        });

    // Initialize the first scene
    updateScene();
});
