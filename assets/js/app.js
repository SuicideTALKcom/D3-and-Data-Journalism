var svgWidth = 900;
var svgHeight = 500;
var svgRatio = svgWidth / svgHeight;

var margin = {
  top: 20,
  right: 40,
  bottom: 80,
  left: 230
  };

var width = svgWidth - margin.left - margin.right;
var height = svgHeight - margin.top - margin.bottom;

// Create an SVG wrapper, append an SVG group that will hold
// and shift chart by left and top margin
var svg = d3.select("#scatter")
  .append("svg")
  .attr("width", svgWidth)
  .attr("height", svgHeight);

// Append an SVG group
var chartGroup = svg.append("g")
  .attr("transform", `translate(${margin.left}, ${margin.top})`);

// Initial Params
var chosenXAxis = "poverty";
var chosenYAxis = "healthcare";

// Update x-scale var upon click on axis label
function xScale(allData, chosenXAxis) {
  // create scales
  var xLinearScale = d3.scaleLinear()
    .domain([d3.min(allData, d => d[chosenXAxis]) * 0.8,
      d3.max(allData, d => d[chosenXAxis]) * 1.2
    ])
    .range([0, width]);
  return xLinearScale;
}

// Update y-scale var upon click on axis label
function yScale(allData, chosenYAxis) {
  // Create scales
  var yLinearScale = d3.scaleLinear()
    .domain([d3.min(allData, d => d[chosenYAxis]) * 0.8,
      d3.max(allData, d => d[chosenYAxis]) * 1.2
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

//  Update circles group with a transition to new circles
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
      break;
    case "income":
      var xlabel = "Income: ";
      var xformat = d3.format("$,");
      var xsuffix = "";
  }

  switch (chosenYAxis) {
    case "healthcare":
      var ylabel = "Healthcare: ";
      break;
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
    // Onmouseout event
    .on("mouseout", function(data, index) {
      toolTip.hide(data);
    });
  return circlesText;
}

// Retrieve data from the CSV file and execute everything below
d3.csv("assets/data/data.csv").then(function(allData) {
  allData.forEach(function(data) {
      data.id = +data.id;
      data.state = data.state;
      data.abbr = data.abbr;
      data.poverty = +data.poverty;
      data.age = +data.age;
      data.ageMoe = +data.ageMoe;
      data.income = +data.income;
      data.incomeMoe = +data.incomeMoe;
      data.healthcare = +data.healthcare;
      data.healthcareLow = +data.healthcareLow;
      data.healthcareHigh = +data.healthcareHigh;
      data.obesity = +data.obesity;
      data.obesityLow = +data.obesityLow;
      data.obesityHigh = +data.obesityHigh;
      data.smoking = +data.smokes;
      data.smokesLow = +data.smokesLow;
      data.smokesHigh = +data.smokesHigh;
});

// xLinearScale function above csv import
  var xLinearScale = xScale(allData, chosenXAxis);

  // Create y scale function
  var yLinearScale = yScale(allData, chosenYAxis);
    
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
    //.attr("transform", `translate(0, 0)`)  
    .call(leftAxis);

  // Append initial circles
  var circlesGroup = chartGroup.selectAll("circle")
    .data(allData)
    .enter()
    .append("circle")
    .attr("cx", d => xLinearScale(d[chosenXAxis]))
    .attr("cy", d => yLinearScale(d[chosenYAxis]))
    .attr("r", 15)
    .attr("fill", "cadetBlue")
    .attr("opacity", ".6");

  // Append initial circle text
  var circlesText = chartGroup.selectAll("circlesGroup")
    .data(allData)
    .enter()
    .append("text")
    .text(function(data) {return data.abbr})
    .attr("x", d => xLinearScale(d[chosenXAxis]))
    .attr("y", d => yLinearScale(d[chosenYAxis]))
    .attr("dy", ".35em")
    .attr("font-size", "10px")
    .attr("text-anchor", "middle")
    .attr("class", "stateText");
    
  // Create group for 3 x-axis labels
  var xLabelsGroup = chartGroup.append("g")
    .attr("transform", `translate(${width / 2}, ${height + 20})`);

  var povertyLabel = xLabelsGroup.append("text")
    .attr("x", 0)
    .attr("y", 20)
    .attr("value", "poverty")
    .classed("active", true)
    .text("In Poverty (%)");

  var ageLabel = xLabelsGroup.append("text")
    .attr("x", 0)
    .attr("y", 40)
    .attr("value", "age")
    .classed("inactive", true)
    .text("Age (Median)");

  var incomeLabel = xLabelsGroup.append("text")
    .attr("x", 0)
    .attr("y", 60)
    .attr("value", "income")
    .classed("inactive", true)
    .text("Household Income (Median)");

  // Create group for 3 y-axis labels
  var yLabelsGroup = chartGroup.append("g")
    .attr("transform", `translate(${0}, ${(height / 2) - 20})`);

  var healthcareLabel = yLabelsGroup.append("text")
    .attr("transform", "rotate(-90)")
    .attr("y", -30)
    .attr("x", 0)
    .attr("value", "healthcare")
    .classed("active", true)
    .text("Lacks Healthcare (%)");

  var smokesLabel = yLabelsGroup.append("text")
    .attr("transform", "rotate(-90)")  
    .attr("y", -50)
    .attr("x", 0)
    .attr("value", "smoking")
    .classed("inactive", true)
    .text("Smokes (%)");

  var obesityLabel = yLabelsGroup.append("text")
    .attr("transform", "rotate(-90)")  
    .attr("y", -70)
    .attr("x", 0)
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

        // Replace chosenXAxis with value
        chosenXAxis = value;

        // CSV import to update x scale for new data
        xLinearScale = xScale(allData, chosenXAxis);

        // Update x axis with transition
        xAxis = renderXAxes(xLinearScale, xAxis);

        // Update circles with new x values
        circlesGroup = renderCircles(circlesGroup, xLinearScale, chosenXAxis, yLinearScale, chosenYAxis);

        // Update circle text with new x values
        circlesText = renderCircleText(circlesText, xLinearScale, chosenXAxis, yLinearScale, chosenYAxis);

        // Update tooltips with new info
        circlesGroup = updateToolTip(chosenXAxis, chosenYAxis, circlesGroup);  
        
        // Update classes to change bold text
        switch (chosenXAxis) {
          case "poverty":
            povertyLabel
              .classed("active", true)
              .classed("inactive", false);
            ageLabel
              .classed("active", false)
              .classed("inactive", true);
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
            incomeLabel
              .classed("active", false)
              .classed("inactive", true);
              break;
          case "income":
            povertyLabel
              .classed("active", false)
              .classed("inactive", true);
            ageLabel
              .classed("active", false)
              .classed("inactive", true);
            incomeLabel
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
        yLinearScale = yScale(allData, chosenYAxis);

        // Update y axis with transition
        yAxis = renderYAxes(yLinearScale, yAxis);

        // Update circles with new y values
        circlesGroup = renderCircles(circlesGroup, xLinearScale, chosenXAxis, yLinearScale, chosenYAxis);

        // Update circle text with new y values
        circlesText = renderCircleText(circlesText, xLinearScale, chosenXAxis, yLinearScale, chosenYAxis);

        // Update tooltips with new info
        circlesGroup = updateToolTip(chosenXAxis, chosenYAxis, circlesGroup);
        
        // Update classes to change bold text
        switch (chosenYAxis) {
          case "healthcare":
            healthcareLabel
              .classed("active", true)
              .classed("inactive", false);
            smokesLabel
              .classed("active", false)
              .classed("inactive", true);
            obesityLabel
              .classed("active", false)
              .classed("inactive", true);
              break;
          case "smoking":
            healthcareLabel
              .classed("active", false)
              .classed("inactive", true);
            smokesLabel
              .classed("active", true)
              .classed("inactive", false);
            obesityLabel
              .classed("active", false)
              .classed("inactive", true);
              break;
          case "obesity":
            healthcareLabel
              .classed("active", false)
              .classed("inactive", true);
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
