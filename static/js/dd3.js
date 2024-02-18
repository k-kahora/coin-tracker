// set the dimensions and margins of the graph
var margin = {top: 30, right: 10, bottom: 10, left: 0},
  width = 1000 - margin.left - margin.right,
  height = 400 - margin.top - margin.bottom;

// append the svg object to the body of the page
// var wow = d3.keys()
var svg = d3.select("#my_dataviz")
.append("svg")
  .attr("width", width + margin.left + margin.right)
  .attr("height", height + margin.top + margin.bottom)
.append("g")
  .attr("transform",
        "translate(" + margin.left + "," + margin.top + ")");


d3.json('/clean-data').then(function(data) {
    // Use D3 to visualize the data
    // Example: Create a simple visualization based on the data
    // This is where you'd use D3.js methods to bind data to DOM elements, create SVGs, etc.
    dimensions = d3.keys(data[0]).filter(function(d) { return d != "name" && d != "logo" })
    var y = {}
    for (i in dimensions) {
	name = dimensions[i]
	y[name] = d3.scaleLinear()
	    .domain( d3.extent(data, function(d) { return parseFloat(d[name]); }) ) // TODO make sure the numbers are returend in the valide format
	    .range([height, 0])
    }
    x = d3.scalePoint()
	.range([0, width])
	.padding(1)
	.domain(dimensions);
 function path(d) {
      return d3.line()(dimensions.map(function(p) { return [x(p), y[p](d[p])]; }));
  }
  svg
    .selectAll("myPath")
    .data(data)
    .enter().append("path")
    .attr("d",  path)
    .style("fill", "none")
    .style("stroke", "#69b3a2")
    .style("opacity", 1)
var axis = svg.selectAll("myAxis")
    // For each dimension of the dataset I add a 'g' element:
    .data(dimensions).enter()
    .append("g")
    // I translate this element to its right position on the x axis
    .attr("transform", function(d) { return "translate(" + x(d) + ")"; })
    // And I build the axis with the call function
    .each(function(d) { d3.select(this).call(d3.axisLeft().scale(y[d])); })
    // Add axis title
    .append("text")
      .style("text-anchor", "middle")
      .attr("y", -9)
      .text(function(d) { return d; })
      .style("fill", "black")
    
dimensions.forEach(function(dimension) {
        var brush = d3.brushY()
            .extent([[-10, 0], [10, height]])
            .on("brush", brushed)
            .on("end", brushEnded);

        svg.append("g")
            .attr("class", "brush")
            .attr("transform", "translate(" + x(dimension) + ",0)")
            .call(brush);

        var brush = d3.brushY()
            .extent([[-10, 0], [10, height]])
            .on("brush", brushed)
            .on("end", brushEnded);

        svg.append("g")
            .attr("class", "brush")
            .attr("transform", "translate(" + x(dimension) + ",0)")
            .call(brush);

        function brushed(event) {
            var selection = event.selection;
	    if (selection == null) return;
	    var [y0, y1] = selection.map(y[dimension].invert, y[dimension]);
	    var filteredData = data.filter(function(d) {

		return parseFloat(d[dimension]) >= y1 && parseFloat(d[dimension]) <= y0;
	    });
svg.selectAll("path")
        .style("opacity", 0.1); // Dim all paths
    svg.selectAll("path")
        .filter(function(d) {
            return filteredData.includes(d);
        })
        .style("opacity", 1); // Highlight selected paths

		updateTable(filteredData)
            // Implement logic to handle the brush selection for 'dimension'
            // This might involve filtering the dataset based on the selection and updating the visualization
        }


        function brushEnded(event) {
            var selection = event.selection;
            // Implement logic to handle the brush selection for 'dimension'
            // This might involve filtering the dataset based on the selection and updating the visualization
        }

})
    
function createTable(data) {
var table = d3.select("#data-table").selectAll("table").data([null]);
    table = table.enter().append("table").merge(table);

    // Create the table header
    var thead = table.selectAll("thead").data([null]);
    thead = thead.enter().append("thead").merge(thead);

    var headers = thead.selectAll("th").data(d3.keys(data[0]));
    headers.enter().append("th").merge(headers).text(d => d);
    headers.exit().remove();

    // Create rows for each object in the data
    // var rows = table.selectAll("tbody tr").data(data);
    // rows = rows.enter().append("tr").merge(rows);

    // // Create cells for each row
    // var cells = rows.selectAll("td").data(function(row) {
    //     return d3.keys(row).map(function(column) {
    //         return { value: row[column] };
    //     });
    // });

    // cells.enter().append("td").merge(cells).text(d => d.value);
    // cells.exit().remove();

    // Remove any excess rows
    // rows.exit().remove();
}
    createTable(data)

function updateTable(selectedData) {
  if (selectedData == null) {
      return

}
    console.log(selectedData)
    var table = d3.select("#data-table")
    var para = table.selectAll("p").data(selectedData)
    para.enter().append("p").text(function(d) { return d["name"]; })
    para.exit().remove()


}


});
