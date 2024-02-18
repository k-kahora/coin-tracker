// set the dimensions and margins of the graph
var margin = {top: 30, right: 10, bottom: 10, left: 0},
  width = 1000 - margin.left - margin.right,
  height = 400 - margin.top - margin.bottom;
let globalSelections = {};


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
    var columns_col = ["name", "logo"].concat(d3.keys(data[0]).filter(key => !["name", "logo"].includes(key)));
    dimensions = d3.keys(data[0]).filter(function(d) { return d != "name" && d != "logo" })
dimensions.forEach(dim => globalSelections[dim] = null); // Assuming 'dimensions' is your array of axes names
    var y = {}
    var x
    
     function updateGraph(new_data) {
// Assuming 'dimensions', 'new_data', 'svg', 'height', and 'width' are defined elsewhere in your code

// Update scale domains with new data
dimensions.forEach(function(name) {
    y[name] = d3.scaleLinear()
        .domain(d3.extent(new_data, function(d) { return parseFloat(d[name]); }))
        .range([height, 0]);
});

x = d3.scalePoint()
    .range([0, width])
    .padding(1)
    .domain(dimensions);

function path(d) {
    return d3.line()(dimensions.map(function(p) { return [x(p), y[p](d[p])]; }));
}

// Update paths
var paths = svg.selectAll("path")
    .data(new_data);

// Remove old paths
paths.exit().remove();

// Add new paths
paths.enter().append("path")
    .merge(paths) // Merge enter and update selection
    .attr("d", path)
    .style("fill", "none")
    .style("stroke", "#69b3a2")
    .style("opacity", 1);

// Update axes
var axes = svg.selectAll("g.myAxis")
    .data(dimensions, function(d) { return d; });

// Remove old axes
axes.exit().remove();

// Add new axes
var newAxes = axes.enter().append("g")
    .attr("class", "myAxis");

// Update the positions and call the axes
newAxes.merge(axes)
    .attr("transform", function(d) { return "translate(" + x(d) + ")"; })
    .each(function(d) { d3.select(this).call(d3.axisLeft().scale(y[d])); });

// Update axis titles
newAxes.append("text")
    .merge(axes.selectAll("text")) // Select and merge axis titles
    .style("text-anchor", "middle")
    .attr("y", -9)
    .text(function(d) { return d; })
    .style("fill", "black");
     }
    updateGraph(data)

    
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
    // Determine the selection extent for the current brush
    var selection = event.selection;
    if (selection) {
        var [y0, y1] = selection.map(y[dimension].invert, y[dimension]);
        globalSelections[dimension] = [y0, y1]; // Update the selection for the current axis
    } else {
        globalSelections[dimension] = null; // Clear the selection if the brush is cleared
    }

    // Filter data based on global selections
    var filteredData = data.filter(d => {
        return dimensions.every(dim => {
            // If no selection for an axis, or the item is within the selection, return true
            if (!globalSelections[dim]) return true;
            var val = d[dim];
            var [max, min] = globalSelections[dim];
            return val >= min && val <= max;
        });
    });

    // Now update your visualization with filteredData
    // For example, you might call a function to update the table or other visual elements
svg.selectAll("path")
        .style("opacity", 0.1); // Dim all paths
    svg.selectAll("path")
        .filter(function(d) {
            return filteredData.includes(d);
        })
        .style("opacity", 1); // Highlight selected paths

		updateTableBody(filteredData, columns_col)
            // Implement logic to handle the brush selection for 'dimension'
            // This might involve filtering the dataset based on the selection and updating the visualization
        }


        function brushEnded(event) {
            var selection = event.selection;
            // Implement logic to handle the brush selection for 'dimension'
            // This might involve filtering the dataset based on the selection and updating the visualization
        }

})
function createTableHeader(columns) {
var table = d3.select("#data-table").selectAll("table").data([null]);
    table = table.enter().append("table").merge(table);

    // Create the table header
    var thead = table.selectAll("thead").data([null]);
    thead = thead.enter().append("thead").merge(thead);
    
    // get the order right
    var columns = ["name", "logo"].concat(d3.keys(data[0]).filter(key => !["name", "logo"].includes(key)));

    var headers = thead.selectAll("th").data(columns);
    headers.enter().append("th").merge(headers).text(d => d);
    headers.exit().remove();
}
    createTableHeader(data)
function updateTableBody(data, columns) {
    var table = d3.select("#data-table").select("table");
    if (table.empty()) return; // Ensure the table exists

    var tbody = table.selectAll("tbody").data([null]);
    tbody = tbody.enter().append("tbody").merge(tbody);

    var rows = tbody.selectAll("tr").data(data);
    var rowsEnter = rows.enter().append("tr");
    rows.exit().remove();
    rows = rowsEnter.merge(rows);

    var cells = rows.selectAll("td").data(function(row) {
        return columns.map(column => ({ key: column, value: row[column] }));
    });

    cells.enter().append("td").merge(cells)
        .each(function(d) {
            var cell = d3.select(this);
            cell.selectAll("*").remove(); // Clear existing content
            if (d.key === "logo" && d.value) {
                cell.append("img")
                    .attr("src", d.value)
                    .attr("height", "50px")
                    .attr("width", "50px");
            } else {
                cell.text(d.value);
            }
        });

    cells.exit().remove();
}
d3.select('#search-button').on('click', function() {
  var searchString = d3.select('#search-input').property('value');

  // Use the Fetch API with D3.js v5+
  d3.json("http://127.0.0.1:5000/dimensions?query=" + encodeURIComponent(searchString))
    // d is the searched data
    // data is the trending data
    .then(function(d) {
      console.log(d)
      console.log(data)
      data.push(d[0])
      console.log(data)
	
      updateGraph(data)
    })
    .catch(function(error) {
      console.error("Error fetching the data: ", error);
    });
});



});
