
var svg = d3
    .select("#mydataviz")
    .append("svg")
    .attr("width", 1500)
    .attr("height", 900)
    .append("g")
    .attr("transform", "translate(100,50)");

    // Initialize the X axis
    var x = d3.scaleBand().range([0, 1300]).padding(1);
    var xAxis = svg
    .append("g")
    .attr("transform", "translate(0," + 600 + ")");

    // Initialize the Y axis
    var y = d3.scaleLinear().range([600, 0]);
    var yAxis = svg.append("g").attr("class", "myYaxis");

    // Parse the Data
    d3.csv("./data/table_tableau03.csv", function (data) {
    // List of groups (here I have one group per column)
    var parameters = d3.keys(data[0]).filter(function (el) {
        return el != "prename" && el != "prov_name_fr";
    });

    // add the options to the button
    d3.select("#dropdown")
        .selectAll("myOptions")
        .data(parameters)
        .enter()
        .append("option")
        .text(function (d) {
        return d;
        }) // text showed in the menu
        .attr("value", function (d) {
        return d;
        }); // corresponding value returned by the button

    // A function that create / update the plot for a given variable:
    function update(selectedVar) {
        // X axis
        x.domain(
        data.map(function (d) {
            return d.prename;
        })
        );
        xAxis.transition().duration(1000).call(d3.axisBottom(x)).attr("font-size", "8px");

        // Add Y axis
        y.domain([
        0,
        d3.max(data, function (d) {
            return +d[selectedVar];
        }),
        ]);
        yAxis.transition().duration(1000).call(d3.axisLeft(y));

        // variable u: map data to existing circle
        var j = svg.selectAll(".myLine").data(data);
        // update lines
        j.enter()
        .append("line")
        .attr("class", "myLine")
        .merge(j)
        .transition()
        .duration(1000)
        .attr("x1", function (d) {
            return x(d.prename);
        })
        .attr("x2", function (d) {
            return x(d.prename);
        })
        .attr("y1", y(0))
        .attr("y2", function (d) {
            return y(d[selectedVar]);
        })
        .attr("stroke", "grey");

        // variable u: map data to existing circle
        var u = svg.selectAll("circle").data(data);
        // update bars
        u.enter()
        .append("circle")
        .merge(u)
        .transition()
        .duration(1000)
        .attr("cx", function (d) {
            return x(d.prename);
        })
        .attr("cy", function (d) {
            return y(d[selectedVar]);
        })
        .attr("r", 10)
        .attr("fill", "red");

        // Listen to the dropdown
        d3.select("#dropdown").on("change", function (d) {
        selectedVar = this.value;
        update(selectedVar);
        });
    }

    // Initialize plot
    update("Population");
    });