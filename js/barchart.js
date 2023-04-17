// Kwinnie Fianza, 8798871

fetch("./data/table_tableau10.csv")
.then((response) => response.text())
.then((data) => {
// Parse the CSV data
const parsedData = d3.csvParse(data);

// Do something with the parsed data
const svg = d3
    .select("#chart")
    .append("svg")
    .attr("width", 800)
    .attr("height", 700);

const margin = { top: 100, right: 100, bottom: 200, left: 100 };
const width = +svg.attr("width") - margin.left - margin.right;
const height = +svg.attr("height") - margin.top - margin.bottom;
const g = svg.append("g").attr("transform", `translate(${margin.left},${margin.top})`);

// set up the scales
const x = d3.scaleBand().rangeRound([0, width]).paddingInner(0.2);
const y = d3.scaleLinear().rangeRound([height, 3]);

// set the domain of the scales
x.domain(parsedData.map((d) => d["Political affiliation/Appartenance politique"]));
y.domain([0, d3.max(parsedData, (d) => +d.Total)]);

// add the x-axis
const oldXLabels = g.append("g")
    .attr("transform", `translate(0, ${height})`)
    .call(d3.axisBottom(x))
    .selectAll("text")
    .attr("transform", "rotate(45)")
    .attr("text-anchor", "start")
    .style("font-size", "10px")
    .nodes()
    .map((label) => label.textContent); // save old x-axis labels to array


// add the y-axis
g.append("g").attr("class", "axis axis--y").call(d3.axisLeft(y).ticks(10));

// add the bars
const bars = g
    .selectAll(".bar")
    .data(parsedData)
    .enter()
    .append("rect")
    .attr("class", "bar")
    .attr("x", (d) => x(d["Political affiliation/Appartenance politique"]))
    .attr("y", (d) => y(+d.Total))
    .attr("width", x.bandwidth())
    .attr("height", (d) => height - y(+d.Total))
    .on("mouseover", function (event, d) {
    // change the color of the bar on mouseover
    d3.select(this).attr("fill", "orange");
    // display a tooltip with more information about the bar
    const tooltip = d3.select(".tooltip");
    tooltip.style("display", "block");
    tooltip.html(`<strong>${d["Political affiliation/Appartenance politique"]}</strong><br>Total: ${d.Total}`);
    // position the tooltip near the bar
    const xPos = event.pageX + 10;
    const yPos = event.pageY - 10;
    tooltip.style("left", xPos + "px").style("top", yPos + "px");
    })
    .on("mouseout", function () {
    // change the color of the bar back to its original color on mouseout
    d3.select(this).attr("fill", "steelblue");

    // hide the tooltip
    const tooltip = d3.select(".tooltip");
    tooltip.style("display", "none");
    });

// add the event listeners for the radio buttons
const sortRadios = document.querySelectorAll('input[name="sort"]');
sortRadios.forEach(radio => {
    radio.addEventListener('click', () => {
    updateChart();
    });
});

function updateChart() {
    const sortValue = document.querySelector('input[name="sort"]:checked').value;

    let sortedData;
    if (sortValue === 'asc') {
    sortedData = parsedData.sort((a, b) => +a.Total - +b.Total);
    } 

    // update the domain of the scales
    x.domain(sortedData.map(d => d['Political affiliation/Appartenance politique']));
    y.domain([0, d3.max(sortedData, d => +d.Total)]);

    // update the bars
    bars.transition()
    .duration(1000)
    .attr('x', d => x(d['Political affiliation/Appartenance politique']))
    .attr('y', d => y(+d.Total))
    .attr('width', x.bandwidth())
    .attr('height', d => height - y(+d.Total))
    .attr('fill', '#69b3a2')
    .on('start', function () { // hide the existing x-axis labels
        g.select('g')
        .selectAll('.tick text')
        .style('opacity', 0);
    })

    bars.exit()
    .transition()
    .duration(1000)
    .attr('y', height)
    .attr('height', 0)
    .remove();

    // add the x-axis
    g.append("g")
    .attr("transform", `translate(0, ${height})`)
    .attr("class", "axis axis--x") // add the axis--x class
    .call(d3.axisBottom(x))
    .selectAll("text")
    .attr("transform", "rotate(45)")
    .attr("text-anchor", "start")
    .style("font-size", "10px")
    .attr("opacity", 0)
    .transition()
    .duration(1000)
    .delay(1000) // add
    .style("opacity", 1)
    d3.event.stopPropagation();

}



});