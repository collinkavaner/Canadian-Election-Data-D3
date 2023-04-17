
var svg = d3
    .select("#mydataviz")
    .append("svg")
    .attr("width", 1000)
    .attr("height", 800);

    let format = d3.format(",");
    // Map and projection

    let projection = d3
    .geoMercator()
    .scale(500)
    .translate([500, 200])
    .center([-100, 70]);

    let geoGenerator = d3.geoPath().projection(projection);

    // Data and color scale
    var data = d3.map();
    var colorScale = d3
    .scaleThreshold()
    .domain([10000, 40000, 100000, 500000, 700000, 900000, 1000000, 3000000, 5000000, 10000000])
    .range(d3.schemeReds[9]);

    // Load external data and boot
    d3.queue()
    .defer(d3.json, "./data/CAProvinces.geojson")
    .defer(d3.csv, "./data/table_tableau03.csv", function (d) {
        data.set(d.prename, +d.Population);
        data.set(`${d.prename}turnout`, +d.turnout);
        data.set(`${d.prename}valid`, +d.PercentageValid);
        data.set(`${d.prename}cast`, +d.TotalCast);
    })
    .await(ready);

    function ready(error, topo) {
    if (error) {
        console.log(error);
    }

    // create a tooltip
    let tooltip = d3
        .select("#mydataviz")
        .append("div")
        .style("position", "absolute")
        .style("opacity", 0)
        .attr("class", "tooltip")
        .style("background-color", "white")
        .style("border", "solid")
        .style("border-width", "2px")
        .style("border-radius", "5px")
        .style("padding", "5px");

    // Three function that change the tooltip when user hover / move / leave a cell
    let mouseover = function (d) {
        tooltip.style("opacity", 1);
        d3.select(this).style("stroke", "black").style("opacity", .8);
    };
    let mousemove = function (d) {
        tooltip.html(
        `The voter population for 
            <strong>${d.properties.PRENAME}</strong>
            is: 
            ${format(d.total)}<br/>
            Turnout: ${data.get(`${d.properties.PRENAME}turnout`)}% <br/>
            Percentage of valid votes: ${data.get(`${d.properties.PRENAME}valid`)}% <br/>
            With ${format(data.get(`${d.properties.PRENAME}cast`))} ballots cast`
        )
        .style("left", (d3.mouse(this)[0]+70) + "px")
        .style("top", d3.mouse(this)[1] + "px");
    };
    let mouseleave = function (d) {
        tooltip.style("opacity", 0);
        d3.select(this).style("stroke", "white").style("opacity", 0.8);
    };

    // Draw the map
    svg
        .append("g")
        .selectAll("path")
        .data(topo.features)
        .enter()
        .append("path")
        // draw each province
        .attr("d", d3.geoPath().projection(projection))
        // set the color of each province
        .attr("fill", function (d) {
        d.total = data.get(d.properties.PRENAME) || 0;
        return colorScale(d.total);
        })
        .style("stroke", "white")
        .attr("class", function (d) {
        return "Province";
        })
        .style("opacity", 0.8)
        .on("mouseover", mouseover)
        .on("mousemove", mousemove)
        .on("mouseleave", mouseleave);
    }