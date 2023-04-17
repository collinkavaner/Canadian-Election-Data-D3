// Collin Kavaner, 8817364

// set the dimensions and margins of the graph
const margin = {top: 30, right: 30, bottom: 100, left: 175},
  width = 700 - margin.left - margin.right,
  height = 600 - margin.top - margin.bottom;

// create the svg object
const svg = d3.select("#my_heatmap")
.append("svg")
  .attr("width", width + margin.left + margin.right)
  .attr("height", height + margin.top + margin.bottom)
.append("g")
  .attr("transform", `translate(${margin.left},${margin.top})`);

// ranges for the x and y axis
const years = ["2004", "2006", "2008", "2011", "2015", "2019", "2021"]
const ageGroup = ["18 to 24 years", "25 to 34 years", "35 to 44 years", "45 to 54 years", "55 to 64 years", "65 to 74 years", "75 years and over"]

//make the x axis
const x = d3.scaleBand()
  .range([ 0, width ])
  .domain(years)
  .padding(0.01);
svg.append("g")
  .attr("transform", `translate(0, ${height})`)
  .call(d3.axisBottom(x).ticks(20).tickPadding(15))
  .style("font", "14px times").style("font-weight", "bold")
  .style("font-family", "sans-serif")
    .attr("class", "x-axis");

//make the y axis
const y = d3.scaleBand()
  .range([ height, 0 ])
  .domain(ageGroup)
  .padding(0.01);
svg.append("g")
.call(d3.axisLeft(y).tickPadding(15))
.style("font", "14px times").style("font-weight", "bold")
.style("font-family", "sans-serif")
.attr("class", "y-axis");

// x axis label
svg.append("text")
    .attr("class", "x-label")
    .attr("text-anchor", "end")
    .attr("x", width - 240)
    .attr("y", height + 75)
    .text("Years")
    .style("font-size", "20px").style("font-weight", "bold")

// y axis label
svg.append("text")
    .attr("class", "y-label")
    .attr("text-anchor", "end")
    .attr("y", -175)
    .attr("x", -height/3)
    .attr("dy", ".75em")
    .attr("transform", "rotate(-90)")
    .text("Age Group")
    .style("font-size", "20px").style("font-weight", "bold")

// Build color scale
const heatColor = d3.scaleLinear()
  .range(["#fff8f5", "#d11a0d"])
  .domain([5850,51477])

//Read the data
d3.csv("data/turnout_by_age_gender_and_province_ge38_ge44.csv").then( function(data) {


    const provinceGroup = new Set(data.map(d => d.PROVINCE_E ))
    // add the data to the dropdown
    d3.select("#selectProvince")
      .selectAll('myOptions')
         .data(provinceGroup)
      .enter()
        .append('option')
      .text(function (d) { return d; })
      .attr("value", function (d) { return d; })


  // create a tooltip
  const tooltip = d3.select("#my_heatmap")
    .append("div")
    .style("opacity", 0)
    .attr("class", "tooltip")
    .style("background-color", "white")
    .style("border", "solid")
    .style("border-width", "2px")
    .style("border-radius", "5px")
    .style("padding", "5px").style("position", "absolute")

  // change the tooltip when the mouse moves over a square
  const mouseover = function(event,d) {
    tooltip.style("opacity", 1)
  }
  const mousemove = function(event,d) {
    tooltip
      .html(`
        <div><strong>Votes:</strong> ${Number(d.VOTES).toLocaleString("en-US")}</div>
        <div><strong>Year:</strong> ${d.YEAR}</div>
        <div><strong>Age Group:</strong> ${d.AGE_GROUP_E}</div>`)
      .style("left", (event.x)+30 + "px")
      .style("top", (event.y)+30 + "px")
  }
  const mouseleave = function(d) {
    tooltip.style("opacity", 0)
  }

  // filter the data for initial load
  const filterData = data.filter(d => d.PROVINCE_E  === "Newfoundland and Labrador" && d.GENDER_E === "All genders" && d.AGE_GROUP_E !== "All ages" && d.AGE_GROUP_E !== "First time" && d.AGE_GROUP_E !== "Not first time")

  // add the squares with rounded edges and color
  const squares = svg.selectAll()
    .data(filterData, function(d) {return d.YEAR+':'+d.AGE_GROUP_E;})
    .enter()
    .append("rect")
      .attr("x", function(d) { return x(d.YEAR) })
      .attr("y", function(d) { return y(d.AGE_GROUP_E) })
      .attr("width", x.bandwidth() )
      .attr("height", y.bandwidth() )
      .attr("rx", 5)
        .attr("ry", 5)
      .style("fill", function(d) { return heatColor(d.VOTES)} )
      .style("cursor", "pointer")
      .attr("class", "cell")
    .on("mouseover", mouseover)
    .on("mousemove", mousemove)
    .on("mouseleave", mouseleave)

// update the squares when the select dropdown is changed
  function update(selected) {
    
        // filter data based on the selected province
        const dataFilter = data.filter(function(d){return d.PROVINCE_E === selected})

        // get min and max votes for the selected province
        const minVotes = d3.min(dataFilter, function(d) { return Number(d.VOTES); })
        const maxVotes = d3.max(dataFilter, function(d) { return Number(d.VOTES); })

        // update the color scale
        heatColor.domain([minVotes*5, maxVotes/5])

        // Give these new data to update the heat map squares
        squares
        .data(dataFilter, function(d) {return d.YEAR+':'+d.AGE_GROUP_E;})
        .transition()
        .duration(1000)
        .style("fill", function(d) { return heatColor(d.VOTES)} )
  }

  d3.select("#selectProvince").on("change", function(event,d) {
    // get selected province
    const selectedOption = d3.select(this).property("value")
    // run the update function with this selected option
    update(selectedOption)
  })

})
