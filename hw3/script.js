// Constants for the charts, that would be useful.
const CHART_WIDTH = 500;
const CHART_HEIGHT = 250;
const MARGIN = { left: 50, bottom: 20, top: 20, right: 20 };
const ANIMATION_DURATION = 300;

setup();

function setup () {

  let bar = d3.selectAll('.bar-chart')

  bar.append("g").attr('id','bar-yaxis')
  bar.append('g').attr('id', 'bar-xaxis');

  let line = d3.selectAll(".line-chart")

  line.append('g').attr('id', 'line-yaxis');
  line.append('g').attr('id', 'line-xaxis');
  line.append('path').attr('id', 'line-path')

  let area = d3.selectAll(".area-chart")

  area.append('g').attr('id', 'area-yaxis');
  area.append('g').attr('id', 'area-xaxis');
  area.append('path').attr('id', 'area-path');

  let scatter = d3.selectAll(".scatter-plot")

  scatter.append('g').attr('id', 'scatter-yaxis');
  scatter.append('g').attr('id', 'scatter-xaxis');

  changeData();

  d3.select("#dataset").on("change", function (event) {
    changeData();
  });
  d3.select("#metric").on("change", function (event) {
    changeData();
  });
  d3.select("#random").on("change", function (event) {
    changeData();
  });

}

/**
 * Render the visualizations
 * @param data
 */
function update (data) {
  
  var value = d3.select("#metric").node().value;
  updateBarChart(data, value);
  updateLineChart(data, value);
  updateAreaChart(data, value);
  updateScatterPlot(data);
}

/**
 * Update the bar chart
 */

function updateBarChart (data, value) {
  //console.log(value)
  var height = CHART_HEIGHT - MARGIN.top - MARGIN.bottom;

  var xScale = d3.scaleBand().domain(data.map(d => d.date)).range([MARGIN.left, CHART_WIDTH - MARGIN.right]).padding(0.2);
  var yScale = d3.scaleLinear().domain([0, d3.max(data, function(d) { return d[value]; })]).range([CHART_HEIGHT - MARGIN.bottom - MARGIN.top, 0]).nice();

  svg = d3.selectAll(".bar-chart")

  d3.selectAll("#bar-yaxis")
  .style("stroke", "black")
  .style("stroke-width", "0.5")
  .call(d3.axisLeft(yScale))
  .attr('transform', `translate(${MARGIN.left}, ${MARGIN.top})`);

  d3.selectAll("#bar-xaxis")
  .style("stroke", "black")
  .style("stroke-width", "0.5")
  .attr('transform', `translate(0,${CHART_HEIGHT - MARGIN.bottom})`)
  .call(d3.axisBottom(xScale));

  svg.selectAll("rect")
  .data(data)
  .join("rect")
  .attr("x", function(d,i) { 
    return xScale(d.date) ; 
  })
  .attr("y", function(d) { 
    return yScale(d[value]) + MARGIN.top; 
  })
  .attr("width", function(d){ 
    return xScale.bandwidth();
  })
  .attr("height", function(d) { return height - yScale(d[value]); })
  .on("mouseover",function (event) {
    d3.select(event.currentTarget).classed("hovered", true);
  })
  .on("mouseout",function (event) {
    d3.select(event.currentTarget).classed("hovered", false);
  });

  svg.selectAll(".bar-chart")
  .data(data)
  .transition()
  .duration(ANIMATION_DURATION)
  .attr("y", function(d) { return yScale(d.date); })
  .attr("height", function(d) { return height - yScale(d.Value); })
  .delay(function(d,i){console.log(i) ; return(i*100)})
  
}

/**
 * Update the line chart
 */
function updateLineChart (data, value) {

  var xScale = d3.scalePoint().domain(data.map(d => d.date)).range([MARGIN.left, CHART_WIDTH - MARGIN.right]);
  var yScale = d3.scaleLinear().domain([0, d3.max(data, function(d) { return d[value]; })]).range([CHART_HEIGHT - MARGIN.bottom - MARGIN.top, 0]).nice();

  const lineGenerator = d3.line()
    .x((d,i) => (xScale(d.date)))
    .y(d => yScale(d[value]) + MARGIN.top)

  let svg = d3.selectAll(".line-chart")

  d3.selectAll('#line-yaxis')
  .style("stroke", "black")
  .style("stroke-width", "0.5")
  .call(d3.axisLeft(yScale))
  .attr('transform', `translate(${MARGIN.left}, ${MARGIN.top})`);
  
  d3.selectAll('#line-xaxis')
  .style("stroke", "black")
  .style("stroke-width", "0.5")
  .attr('transform', `translate(0,${CHART_HEIGHT - MARGIN.bottom})`)
  .call(d3.axisBottom(xScale));

  svg.select("#line-path")
  .datum(data)
  .attr("d", lineGenerator)
}

/**
 * Update the area chart 
 */
function updateAreaChart (data, value) {

  var xScale = d3.scalePoint().domain(data.map(d => d.date)).range([MARGIN.left, CHART_WIDTH - MARGIN.right]);
  var yScale = d3.scaleLinear().domain([0, d3.max(data, function(d) { return d[value]; })]).range([CHART_HEIGHT - MARGIN.bottom - MARGIN.top, 0]).nice();

  const areaGenerator = d3.area()
    .x((d,i) => (xScale(d.date)))
    .y1(d => yScale(d[value]) + MARGIN.top)
    .y0(d => CHART_HEIGHT - MARGIN.bottom);

  let svg = d3.selectAll(".area-chart")

  d3.select("#area-yaxis")
  .call(d3.axisLeft(yScale))
  .style("stroke", "black")
  .style("stroke-width", "0.5")
  .attr('transform', `translate(${MARGIN.left}, ${MARGIN.top})`)
  .exit().remove();

  d3.select('#area-xaxis')
  .style("stroke", "black")
  .style("stroke-width", "0.5")
  .attr('transform', `translate(0,${CHART_HEIGHT - MARGIN.bottom})`)
  .call(d3.axisBottom(xScale));

  svg.select("#area-path")
  .datum(data)
  .attr("d", areaGenerator)
}

/**
 * update the scatter plot.
 */

function updateScatterPlot (data) {

  let xScale = d3
    .scaleLinear()
    .domain([0, d3.max(data, d => d.cases)])
    .range([MARGIN.left, CHART_WIDTH - MARGIN.right])
    .nice();

    // https://github.com/d3/d3-scale
  let yScale = d3
    .scaleLinear()
    .domain([0, d3.max(data, d => d.deaths)])
    .range([CHART_HEIGHT - MARGIN.bottom - MARGIN.top, 0])
    .nice();

  let svg = d3.selectAll(".scatter-plot");

  d3.select("#scatter-yaxis")
  .style("stroke", "black")
  .style("stroke-width", "0.5")
  .call(d3.axisLeft(yScale))
  .attr('transform', `translate(${MARGIN.left}, ${MARGIN.top})`);

  svg.select("#scatter-xaxis")
  .style("stroke", "black")
  .style("stroke-width", "0.5")
  .attr('transform', `translate(0,${CHART_HEIGHT - MARGIN.bottom})`)
  .call(d3.axisBottom(xScale));

  svg.selectAll("circle")
  .data(data)
  .join("circle")
  .attr("cx", function (d) { return xScale(d.cases); })
  .attr("cy", function (d) { return yScale(d.deaths) + MARGIN.top; })
  .attr("r", 5)
  .on("mouseover",function (event) {
    d3.select(event.currentTarget).classed("hovered", true);
  })
  .on("mouseout",function (event) {
    d3.select(event.currentTarget).classed("hovered", false);
  })
  .on("click",function (event) {
    console.log("cx: ", d3.select(event.currentTarget).attr('cx'));
    console.log("cy: ", d3.select(event.currentTarget).attr('cy'));
  })

}


/**
 * Update the data according to document settings
 */
function changeData () {
  //  Load the file indicated by the select menu
  const dataFile = d3.select('#dataset').property('value');

  d3.csv(`data/${dataFile}.csv`)
    .then(dataOutput => {

      /**
       * D3 loads all CSV data as strings. While Javascript is pretty smart
       * about interpreting strings as numbers when you do things like
       * multiplication, it will still treat them as strings where it makes
       * sense (e.g. adding strings will concatenate them, not add the values
       * together, or comparing strings will do string comparison, not numeric
       * comparison).
       *
       * We need to explicitly convert values to numbers so that comparisons work
       * when we call d3.max()
       **/
      
      const dataResult = dataOutput.map((d) => ({
        cases: parseInt(d.cases),
        deaths: parseInt(d.deaths),
        date: d3.timeFormat("%m/%d")(d3.timeParse("%d-%b")(d.date))
      }));
      if (document.getElementById('random').checked) {
        // if random subset is selected
        update(randomSubset(dataResult));
      } else {
        update(dataResult);
      }

      console.log(dataResult);
    }).catch(e => {
      //console.log(e);
      alert('Error!');
    });
    
}

/**
 *  Slice out a random chunk of the provided in data
 *  @param data
 */
function randomSubset (data) {
  return data.filter((d) => Math.random() > 0.5);
}
