// Kwinnie Fianza, 8798871

d3.csv("./data/table_tableau04.csv").then(function (data) {
    // Set up pie chart dimensions
    const width = 600;
    const height = 600;
    const radius = Math.min(width, height) / 3;

    // Define an array of colors
    const color = d3.scaleOrdinal().range(d3.schemeTableau10);

    // Create SVG element
    const svg = d3
      .select("#chart")
      .append("svg")
      .attr("width", "100%") // set width to 100% of container
      .attr("height", "100%") // set height to 100% of container
      .attr("viewBox", `0 0 ${width + 100} ${height + 100}`) // set viewBox to maintain aspect ratio
      .append("g")
      .attr("transform", `translate(${width / 2}, ${height / 2})`); // center the pie chart within the SVG container

    // Set up pie layout
    const pie = d3.pie().value((d) => d["Electors/Électeurs 2019"]).sort(null);

    // Set up arc
    const arc = d3.arc().innerRadius(0).outerRadius(radius);

    // Create pie slices
    const slices = svg.selectAll(".slice").data(pie(data)).enter().append("g").attr("class", "slice");

    // Add slices to pie chart
    slices
      .append("path")
      .attr("d", arc)
      .attr("fill", (d, i) => color(i))
      .on("mouseover", function (event, d) {
        d3.select(this)
          .transition()
          .duration(200)
          .attr("d", d3.arc().innerRadius(0).outerRadius(radius + 20));
      })
      .on("mouseout", function (event, d) {
        d3.select(this).transition().duration(200).attr("d", arc);
      });

    // // Add text labels to slices
    // slices
    //   .append("text")
    //   .text((d) => d.data.Province)
    //   .attr("transform", (d) => `translate(${arc.centroid(d)})`)
    //   .attr("text-anchor", "middle")
    //   .attr("font-size", "10px")
    //   .attr("dy", ".35em")
    //   .attr("textLength", 40) // Set max width for text
    //   .attr("lengthAdjust", "spacingAndGlyphs");

    // Add tooltip on mouseover
    slices
      .on("mouseover", function (event, d) {
        d3.select(this).attr("opacity", 0.5);
        const tooltip = svg.append("g").attr("id", "tooltip");
        tooltip
          .append("rect")
          .attr("width", 250)
          .attr("height", 30)
          .attr("fill", "white")
          .attr("stroke", "black");
        tooltip.append("text").text(`${d.data["Province"]}: ${d.data["Electors/Électeurs 2019"]}`).attr("x", 10).attr("y", 20);
      })
      .on("mouseout", function (event, d) {
        d3.select(this).attr("opacity", 1);
        d3.select("#tooltip").remove();
      });

    // Create legend
    const legend = svg
      .selectAll(".legend")
      .data(color.domain())
      .enter()
      .append("g")
      .attr("class", "legend")
      .attr("transform", (d, i) => `translate(${radius + 20}, ${(i - (color.domain().length - 1) / 1.5) * 20})`);
    //.attr("transform", (d, i) => `translate(-${radius - 30}, ${(i - (color.domain().length - 1) / 1.5) * 20})`);

    // Add colored squares to legend
    legend
      .append("rect")
      .attr("x", 0)
      .attr("width", 10)
      .attr("height", 10)
      .attr("fill", color);

    // Add text labels to legend
    legend
      .append("text")
      .text((d, i) => {
        const provinces = ['Newfoundland and Labrador', 'Prince Edward Island', 'Nova Scotia', 'New Brunswick',
          'Quebec', 'Ontario', 'Manitoba', 'Saskatchewan', 'Alberta', 'British Columbia', 'Yukon'
          , 'Northwest Territories', 'Nunavut'];
        return provinces[i];
      })
      .attr("x", 15)
      .attr("y", 5)
      .attr("font-size", "10px")
      .attr("alignment-baseline", "middle");

  });