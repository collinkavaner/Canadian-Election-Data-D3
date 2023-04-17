// Collin Kavaner, 8817364

// set the dimensions and margins of the graph
const margin = {top: 10, right: 30, bottom: 75, left: 120},
    width = 800 - margin.left - margin.right,
    height = 500 - margin.top - margin.bottom;

// append the svg object to the body of the page
const svg = d3.select("#my_linechart")
  .append("svg")
    .attr("width", width + margin.left + margin.right)
    .attr("height", height + margin.top + margin.bottom)
    .attr("class", "svg-container")
  .append("g")
    .attr("transform", `translate(${margin.left}, ${margin.top})`);

//Read the data from the csv file
d3.csv("data/turnout_by_age_gender_and_province_ge38_ge44.csv").then( function(data) {

    let province = "Newfoundland and Labrador"
    let age = "First time"
    let gender = "All genders"

    // Province Group for selection
    const provinceGroup = new Set(data.map(d => d.PROVINCE_E ))
    // add the data to the dropdown
    d3.select("#selectProvince")
      .selectAll('myOptions')
     	.data(provinceGroup)
      .enter()
    	.append('option')
      .text(function (d) { return d; })
      .attr("value", function (d) { return d; })

    // Age Group for selection
    const ageGroup = new Set(data.map(d => d.AGE_GROUP_E ))
    // add the data to the dropdown
    d3.select("#selectAge")
      .selectAll('myOptions')
     	.data(ageGroup)
      .enter()
    	.append('option')
      .text(function (d) { return d; })
      .attr("value", function (d) { return d; }) 


    const genderData = data.filter(d => d.GENDER_E !== 'Women+' && d.GENDER_E !== 'Men+')
    // Gender Group for selection
    const genderGroup = new Set(genderData.map(d => d.GENDER_E ))
    // add the data to the dropdown
    d3.select("#selectGender")
      .selectAll('myOptions')
     	.data(genderGroup)
      .enter()
    	.append('option')
      .text(function (d) { return d; }) 
      .attr("value", function (d) { return d; }) 

    const filteredData = data.filter(d => d.PROVINCE_E==province && d.AGE_GROUP_E==age && d.GENDER_E==gender)

    // Add X axis 
    let x = d3.scaleTime()
      .domain(d3.extent(filteredData , function(d) { return d3.timeParse("%Y")(d.YEAR); }))
      .range([ 0, width ]);
    svg.append("g")
      .attr("transform", `translate(0, ${height})`)
      .call(d3.axisBottom(x).ticks(20).tickSize(-height).tickPadding(15))
      .style("font", "14px times").style("font-weight", "bold")
      .style("font-family", "sans-serif")
        .attr("class", "x-axis");

    // Add Y axis
    let y = d3.scaleLinear()
      .domain([0, d3.max(filteredData , function(d) { return +d.VOTES; })])
      .range([ height, 0 ]);
    svg.append("g")
      .call(d3.axisLeft(y).tickSize(-width).tickPadding(15))
      .style("font", "14px times").style("font-weight", "bold")
      .style("font-family", "sans-serif")
      .attr("class", "y-axis");

    // x axis label
    svg.append("text")
    .attr("class", "x-label")
    .attr("text-anchor", "end")
    .attr("x", width - 300)
    .attr("y", height + 60)
    .text("Years")
    .style("font-size", "20px").style("font-weight", "bold")

    // y axis label
    svg.append("text")
    .attr("class", "y-label")
    .attr("text-anchor", "end")
    .attr("y", -100)
    .attr("x", -140)
    .attr("dy", ".75em")
    .attr("transform", "rotate(-90)")
    .text("Number of Votes")
    .style("font-size", "20px").style("font-weight", "bold")

    // Initialize line with first selections from the dropdown
    const line = svg
      .append('g')
      .append("path")
        .datum(filteredData )
        .attr("d", d3.line()
            .curve(d3.curveMonotoneX)
          .x(function(d) { return x(d3.timeParse("%Y")(d.YEAR)) })
          .y(function(d) { return y(+d.VOTES) })
        )
        .attr("stroke", "steelblue")
        .style("stroke-width", 4)
        .style("fill", "none")

    
    // A function that update the chart
    function update(selectedGroup, type) {
        console.log(type)
        if (type === 'province') {
            province = selectedGroup
        }
        if (type === 'age') {
            age = selectedGroup
        }
        if (type === 'gender') {
            gender = selectedGroup
        }

      // Create new filtered data based on selections
      let dataFilter = data
      dataFilter = dataFilter.filter(function(d){return d.PROVINCE_E==province && d.AGE_GROUP_E==age && d.GENDER_E==gender})

      // Update the X axis
      x = d3.scaleTime()
        .domain(d3.extent(dataFilter, function(d) { return d3.timeParse("%Y")(d.YEAR); }))
        .range([ 0, width ]);
        svg.select(".x-axis")
            .transition()
            .duration(500)
            .call(d3.axisBottom(x).ticks(20).tickSize(-height).tickPadding(15));

      // Update the Y axis
      y = d3.scaleLinear()
        .domain([0, d3.max(dataFilter, function(d) { return +d.VOTES; })])
        .range([ height, 0 ]);
        svg.select(".y-axis")
            .transition()
            .duration(500)
            .call(d3.axisLeft(y).tickSize(-width).tickPadding(15));
    
      // update the line with the new data
      line
          .datum(dataFilter)
          .transition()
          .duration(500)
          .attr("d", d3.line()
            .curve(d3.curveMonotoneX)
            .x(function(d) { return x(d3.timeParse("%Y")(d.YEAR)) })
            .y(function(d) { return y(+d.VOTES) })
          )
          .attr("stroke", "steelblue") 
    }

    // When the province selection changes, run the update function
    d3.select("#selectProvince").on("change", function(event,d) {
        // get the option that has been chosen
        const selectedOption = d3.select(this).property("value")
        // run the update function passing the selected option and the type of selection
        update(selectedOption, 'province')
    })

    // When the age selection changes, run the update function
    d3.select("#selectAge").on("change", function(event,d) {
        // get the option that has been chosen
        const selectedOption = d3.select(this).property("value")
        // run the update function passing the selected option and the type of selection
        update(selectedOption, 'age')
    })

    // when the gender selection changes, run the update function
    d3.select("#selectGender").on("change", function(event,d) {
        // get the option that has been chosen
        const selectedOption = d3.select(this).property("value")
        // run the update function passing the selected option and the type of selection
        update(selectedOption, 'gender')
    })

})