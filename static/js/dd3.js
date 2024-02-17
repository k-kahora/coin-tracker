// set the dimensions and margins of the graph
var margin = {top: 30, right: 10, bottom: 10, left: 0},
  width = 500 - margin.left - margin.right,
  height = 400 - margin.top - margin.bottom;


// append the svg object to the body of the page
var svg = d3.select("#my_dataviz")
.append("svg")
  .attr("width", width + margin.left + margin.right)
  .attr("height", height + margin.top + margin.bottom)
.append("g")
  .attr("transform",
        "translate(" + margin.left + "," + margin.top + ")");


d3.json('/fetch-coins').then(function(data) {
    // Use D3 to visualize the data
    console.log(data); // For debugging purposes
    // Example: Create a simple visualization based on the data
    // This is where you'd use D3.js methods to bind data to DOM elements, create SVGs, etc.
});
