var svgWidth = 900;
var svgHeight = 600;
var svgRatio = svgWidth / svgHeight;

var margin = {top: 20, right: 40, bottom: 80, left: 100};

var width = svgWidth - margin.left - margin.right;
var height = svgHeight - margin.top - margin.bottom;

// Create an SVG wrapper, append an SVG group that will hold our chart,
// and shift the latter by left and top margin
var svg = d3.select("#scatter")
  .append("svg")
  .attr("width", svgWidth)
  .attr("height", svgHeight);

// Append an SVG group
var chartGroup = svg.append("g")
  .attr("transform", `translate(${margin.left}, ${margin.top})`);

// Initial Params
var chosenXAxis = "poverty";
var chosenYAxis = "smokes";

// Title case function
function titleCase(str) {
  str = str.toLowerCase().split(' ');
  for (var i = 0; i < str.length; i++) {
    str[i] = str[i].charAt(0).toUpperCase() + str[i].slice(1); 
  }
  return str.join(' ');
};

subTitle = titleCase(`${chosenXAxis}`) + " and " + titleCase(`${chosenYAxis}`);
d3.select("#subTitle").html(subTitle);

// Update x-scale var upon click on axis label
function xScale(behavioralData, chosenXAxis) {
  // create scales
  var xLinearScale = d3.scaleLinear()
    .domain([d3.min(behavioralData, d => d[chosenXAxis]) * 0.8,
      d3.max(behavioralData, d => d[chosenXAxis]) * 1.2
    ])
    .range([0, width]);
  return xLinearScale;
}

// Update y-scale var upon click on axis label
function yScale(behavioralData, chosenYAxis) {
  // create scales
  var yLinearScale = d3.scaleLinear()
    .domain([d3.min(behavioralData, d => d[chosenYAxis]) * 0.8,
      d3.max(behavioralData, d => d[chosenYAxis]) * 1.2
    ])
    .range([height, 0]);
  return yLinearScale;
}

// Update xAxis var upon click on axis label
function renderXAxes(newXScale, xAxis) {
  var bottomAxis = d3.axisBottom(newXScale);
  xAxis.transition()
    .duration(1000)
    .call(bottomAxis);
  return xAxis;
}

// Update yAxis var upon click on axis label
function renderYAxes(newYScale, yAxis) {
  var leftAxis = d3.axisLeft(newYScale);
  yAxis.transition()
    .duration(1000)
    .call(leftAxis);
  return yAxis;
}

// Update circles group with a transition to new circles
function renderCircles(circlesGroup, newXScale, chosenXAxis, newYScale, chosenYAxis) {
  circlesGroup.transition()
    .duration(1000)
    .attr("cx", d => newXScale(d[chosenXAxis]))
    .attr("cy", d => newYScale(d[chosenYAxis]));
  return circlesGroup;
}

// Track state abbreviation with circles
function renderCircleText(circlesText, newXScale, chosenXAxis, newYScale, chosenYAxis) {
  circlesText.transition()
    .duration(1000)
    .attr("x", d => newXScale(d[chosenXAxis]))
    .attr("y", d => newYScale(d[chosenYAxis]));
  return circlesText;
}

// Update circles group with new tooltip
function updateToolTip(chosenXAxis, chosenYAxis, circlesText) {
  switch (chosenXAxis) {
    case "poverty":
      var xlabel = "Poverty: ";
      var xformat = d3.format("");
      var xsuffix = "%";
      break;
    case "age":
      var xlabel = "Age (Median): ";
      var xformat = d3.format("");
      var xsuffix = "";
  }

  switch (chosenYAxis) {
    case "smokes":
      var ylabel = "Smokes: ";
      break;
    case "obesity":
      var ylabel = "Obese: ";
  }
  
  var toolTip = d3.tip()
    .attr("class", "tooltip")
    .offset([80, -60])
    .html(function(d) {
      return (`${d.state}<br>${xlabel} ${xformat(d[chosenXAxis])}${xsuffix}<br>${ylabel} ${d[chosenYAxis]}%`);
    });

  circlesText.call(toolTip);

  circlesText.on("mouseover", function(data) {
    toolTip.show(data);
  })
    // onmouseout event
    .on("mouseout", function(data, index) {
      toolTip.hide(data);
    });
  return circlesText;
}

// Retrieve data from the CSV file and execute data
d3.csv("assets/data/data.csv").then(function(behavioralData) {
    behavioralData.forEach(function(data) {
      data.id = +data.id;
      data.state = data.state;
      data.abbr = data.abbr;
      data.poverty = +data.poverty;
      data.age = +data.age;
      data.ageMoe = +data.ageMoe;
      data.incomeMoe = +data.incomeMoe;
      data.obesity = +data.obesity;
      data.obesityLow = +data.obesityLow;
      data.obesityHigh = +data.obesityHigh;
      data.smoking = +data.smokes;
      data.smokesLow = +data.smokesLow;
      data.smokesHigh = +data.smokesHigh;   
});

// xLinearScale function above csv import
  var xLinearScale = xScale(behavioralData, chosenXAxis);

  // Create y scale function
  var yLinearScale = yScale(behavioralData, chosenYAxis);
    
  // Create initial axis functions
  var bottomAxis = d3.axisBottom(xLinearScale);
  var leftAxis = d3.axisLeft(yLinearScale);

  // Append x axis
  var xAxis = chartGroup.append("g")
    .classed("x-axis", true)
    .attr("transform", `translate(0, ${height})`)
    .call(bottomAxis);

  // Append y axis
  var yAxis = chartGroup.append("g")
    .classed("y-axis", true)  
    .call(leftAxis);

  // Append initial circles
  var circlesGroup = chartGroup.selectAll("circle")
    .data(behavioralData)
    .enter()
    .append("circle")
    .attr("cx", d => xLinearScale(d[chosenXAxis]))
    .attr("cy", d => yLinearScale(d[chosenYAxis]))
    .attr("r", 15)
    .attr("fill", "lightslategray")
    .attr("opacity", ".6");

  // Append initial circle text
  var circlesText = chartGroup.selectAll("circlesGroup")
    .data(behavioralData)
    .enter()
    .append("text")
    .text(function(data) {return data.abbr})
    .attr("x", d => xLinearScale(d[chosenXAxis]))
    .attr("y", d => yLinearScale(d[chosenYAxis]))
    .attr("dy", ".35em")
    // .attr("dz", "1")
    .attr("font-size", "10px")
    .attr("text-anchor", "middle")
    .attr("class", "stateText");
    
  // Create group for 2 x-axis labels
  var xLabelsGroup = chartGroup.append("g")
    .attr("transform", `translate(${width / 2}, ${height + 20})`);

  var povertyLabel = xLabelsGroup.append("text")
    .attr("x", 0)
    .attr("y", 20)

    // Value to get for event listener
    .attr("value", "poverty") 
    .classed("active", true)
    .text("In Poverty (%)");

  var ageLabel = xLabelsGroup.append("text")
    .attr("x", 0)
    .attr("y", 40)
    // Value to get for event listener
    .attr("value", "age")
    .classed("inactive", true)
    .text("Age (Median)");

    // Create group for 2 y-axis labels
  var yLabelsGroup = chartGroup.append("g")
    .attr("transform", `translate(${0}, ${(height / 2) - 20})`);

  var smokesLabel = yLabelsGroup.append("text")
    .attr("transform", "rotate(-90)")  
    .attr("y", -30)
    .attr("x", 0)
    // Value to get for event listener
    .attr("value", "smoking")
    .classed("inactive", true)
    .text("Smokes (%)");

  var obesityLabel = yLabelsGroup.append("text")
    .attr("transform", "rotate(-90)")  
    .attr("y", -50)
    .attr("x", 0)
    // Value to get for event listener
    .attr("value", "obesity")
    .classed("inactive", true)
    .text("Obese (%)");

  // UpdateToolTip from csv import
  var circlesGroup = updateToolTip(chosenXAxis, chosenYAxis, circlesGroup);

  // X axis labels event listener
  xLabelsGroup.selectAll("text")
    .on("click", function() {
      // Get value of selection
      var value = d3.select(this).attr("value");
      if (value !== chosenXAxis) {

        // Replaces chosenXAxis with value
        chosenXAxis = value;

        // CSV import to update x scale for new data
        xLinearScale = xScale(behavioralData, chosenXAxis);

        // Update x axis with transition
        xAxis = renderXAxes(xLinearScale, xAxis);

        // Update circles with new x values
        circlesGroup = renderCircles(circlesGroup, xLinearScale, chosenXAxis, yLinearScale, chosenYAxis);

        // Update circle text with new x values
        circlesText = renderCircleText(circlesText, xLinearScale, chosenXAxis, yLinearScale, chosenYAxis);      //bookmark//

        // Update tooltips with new info
        circlesGroup = updateToolTip(chosenXAxis, chosenYAxis, circlesGroup);

     subTitle = titleCase(`${chosenXAxis}`) + " and " + titleCase(`${chosenYAxis}`);
        d3.select("#subTitle").html(subTitle);   
        
        // Updates classes to change bold text
        switch (chosenXAxis) {
          case "poverty":
            povertyLabel
              .classed("active", true)
              .classed("inactive", false);
            incomeLabel
              .classed("active", false)
              .classed("inactive", true);
              break;
          case "age":
            povertyLabel
              .classed("active", false)
              .classed("inactive", true);
            ageLabel
              .classed("active", true)
              .classed("inactive", false);
        }
      }
    });

  yLabelsGroup.selectAll("text")
    .on("click", function() {
    // Get value of selection
      var value = d3.select(this).attr("value");
      if (value !== chosenYAxis) {

        // Replace chosenXAxis with value
        chosenYAxis = value;

        // CSV import to update y scale for new data
        yLinearScale = yScale(behavioralData, chosenYAxis);

        // updates y axis with transition
        yAxis = renderYAxes(yLinearScale, yAxis);

        // updates circles with new y values
        circlesGroup = renderCircles(circlesGroup, xLinearScale, chosenXAxis, yLinearScale, chosenYAxis);

        // updates circle text with new y values
        circlesText = renderCircleText(circlesText, xLinearScale, chosenXAxis, yLinearScale, chosenYAxis);

        // updates tooltips with new info
        circlesGroup = updateToolTip(chosenXAxis, chosenYAxis, circlesGroup);

        subTitle = titleCase(`${chosenXAxis}`) + " and " + titleCase(`${chosenYAxis}`)
        d3.select("#subTitle").html(subTitle);

        // Updates classes to change bold text
        switch (chosenYAxis) {
          case "smoking":
            smokesLabel
              .classed("active", true)
              .classed("inactive", false);
            obesityLabel
              .classed("active", false)
              .classed("inactive", true);
              break;
          case "obesity":
            smokesLabel
              .classed("active", false)
              .classed("inactive", true);
            obesityLabel
              .classed("active", true)
              .classed("inactive", false);
        }
      }
    });
});
