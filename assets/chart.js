// Set the dimensions and margins of the graph
const margin = { top: 20, right: 30, bottom: 50, left: 50 };
const width = 800 - margin.left - margin.right;
const height = 400 - margin.top - margin.bottom;

// Append the svg object to the body of the page
const svg1 = d3.select("#chart")
  .append("svg")
  .attr("width", width + margin.left + margin.right)
  .attr("height", height + margin.top + margin.bottom)
  .append("g")
  .attr("transform", `translate(${margin.left},${margin.top})`);

const svg2 = d3.select("#chart2")
  .append("svg")
  .attr("width", width + margin.left + margin.right)
  .attr("height", height + margin.top + margin.bottom)
  .append("g")
  .attr("transform", `translate(${margin.left},${margin.top})`);

// Parse the date / time
const parseTime = d3.timeParse("%Y-%m-%d");

function d3Chart(data, svg) {
  // Format the data
  data.forEach(d => {
    d.date = parseTime(d.date);
    d.count = +d.count;
  });

  // Set the ranges
  const x = d3.scaleTime().range([0, width]);
  const y = d3.scaleLinear().range([height, 0]);

  // Scale the range of the data
  x.domain(d3.extent(data, d => d.date));
  y.domain([0, d3.max(data, d => d.count)]);

  // Define the line
  const line = d3.line()
    .x(d => x(d.date))
    .y(d => y(d.count));

  // Add the line path
  svg.append("path")
    .data([data])
    .attr("class", "line")
    .attr("d", line);

  // Add the X Axis
  svg.append("g")
    .attr("transform", `translate(0,${height})`)
    .call(d3.axisBottom(x).tickFormat(d3.timeFormat("%b %y")));

  // Add the Y Axis
  svg.append("g")
    .call(d3.axisLeft(y));

  // Tooltip
  const tooltip = d3.select("body").append("div")
    .attr("class", "tooltip")
    .style("opacity", 0)
    .style("position", "absolute")
    .style("background", "#f9f9f9")
    .style("border", "1px solid #d3d3d3")
    .style("padding", "8px")
    .style("border-radius", "4px")
    .style("pointer-events", "none");

  // Add circles for tooltip functionality
  svg.selectAll("dot")
    .data(data)
    .enter().append("circle")
    .attr("r", 3)
    .attr("cx", d => x(d.date))
    .attr("cy", d => y(d.count))
    .attr("fill", "steelblue")
    .on("mouseover", function(event, d) {
      tooltip.transition()
        .duration(200)
        .style("opacity", .9);
      tooltip.html(`Date: ${d3.timeFormat("%b %d, %Y")(d.date)}<br>Count: ${d.count}`)
        .style("left", (event.pageX + 5) + "px")
        .style("top", (event.pageY - 28) + "px");
    })
    .on("mouseout", function(d) {
      tooltip.transition()
        .duration(500)
        .style("opacity", 0);
    });
}

d3.csv("location-count.csv").then(data =>{
  d3Chart(data, svg1)
});

d3.csv("powerbank-count.csv").then(data =>{
  d3Chart(data, svg2)
});