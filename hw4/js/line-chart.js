/** Class representing the line chart view. */

const CHART_HEIGHT = 500
const CHART_WIDTH = 700
const MARGIN = {left:80, right:50, bottom:0, top:0}

class LineChart {
  /**
   * Creates a LineChart
   * @param globalApplicationState The shared global application state (has the data and map instance in it)
   */
  constructor(globalApplicationState) {
    // Set some class level variables
    this.globalApplicationState = globalApplicationState;

    let covidData = this.globalApplicationState.covidData

    covidData.forEach(row =>{
      if(row.total_cases_per_million == ""){
        row.total_cases_per_million = "0.0"
      }
    })
    let continents = covidData.filter(val => val['iso_code'].includes("OWID"))
    console.log(continents)

    let groupedData = d3.group(continents, d => d.location)
    console.log(groupedData)

    const formatDate = d3.timeFormat("%b %Y");

    let svg = d3.select("#line-chart")

    let xScale = d3.scaleTime()
    .range([0, CHART_WIDTH-MARGIN.left])
    .domain(d3.extent(covidData.map(value => {
      //console.log(parseDate(value.date))
      return new Date(value.date)
    })));

    svg.select("#x-axis")
    .append("g")
    .attr("transform", `translate(${MARGIN.left}, ${CHART_HEIGHT-MARGIN.right})`)
    .call(d3.axisBottom(xScale)
    .tickFormat(formatDate));

    let max = (Math.max.apply(Math, continents.map(function (o) { return o.total_cases_per_million; })))

    let yScale = d3.scaleLinear()
    .range([CHART_HEIGHT-MARGIN.right, 15])
    .domain([0, max])
    .nice()

    svg.select("#y-axis")
    .append("g")
    .attr("transform", `translate(${MARGIN.left}, 0)`)
    .call(d3.axisLeft(yScale));     

    svg.select('#x-axis')
    .append('text')
    .attr('x', CHART_WIDTH/2)
    .attr('y', CHART_HEIGHT)
    .text('Date')

    svg.select('#y-axis')
    .append('text')
    .attr('x', -CHART_HEIGHT/2)
    .attr('y', 15)
    .attr("transform", `rotate(-90)`)
    .text('Cases per million')

    let keys = []
    groupedData.forEach(([key, value]) => {
      keys.push(key.location)
    })
    var colorScale = d3.scaleOrdinal().domain(keys).range(d3.schemeTableau10)

    svg.select("#lines")
    .selectAll('line')
    .data(groupedData)
    .enter()
    .append("path")
    .attr("d", function ([key, value]) {
      // console.log("key: ",key)
      // console.log("value: ",value)
        return d3.line()
            .x((d) => xScale(new Date(d.date)) + MARGIN.left)
            .y((d) => yScale(d.total_cases_per_million))
            (value)
    })
    .attr("fill", "none")
    .attr("stroke", ([key, value]) => {
      return colorScale(key)
    })
    .attr("stroke-width", 2)
    .on("mousemove", (event) => {
      const border = svg.node().getBoundingClientRect().x;
      if((event.clientX - border) > MARGIN.left){
        if(svg.select("#overlay").select("line").empty()){
          svg.select("#overlay").append("line")
        }
        else{
        svg.select("#overlay").select("line")
        .attr('stroke', 'black')
        .attr('x1', event.clientX - border)
        .attr('x2', event.clientX - border)
        .attr('y1', CHART_HEIGHT - MARGIN.right)
        .attr('y2', 0);
        }
      }

      let formatTime = d3.timeFormat("%Y-%m-%d");
      let hoveredDate = formatTime(xScale.invert((event.clientX - border) - MARGIN.left));
      //console.log(hoveredDate)

      let data = [];
      covidData.forEach(row => {
        if(row.iso_code.includes("OWID") && row.date === hoveredDate){
          let obj = {};
          obj["location"] = row.location;
          obj["total_cases_per_million"] = row.total_cases_per_million
          data.push(obj)
        }
      })
      data = data.sort( function ( a, b ) { return b.total_cases_per_million - a.total_cases_per_million; } );
     // console.log("sorted: ", data)

      svg
      .select('#overlay')
      .selectAll('text')
      .data(data)
      .join('text')
      .attr('y', (d, i) => (i + 1) * 20)
      .attr('x', function(){
        if((event.clientX - border) > 400){
          return (event.clientX - border) - 160
        }
        return (event.clientX - border) + 10
      })
      .text((d) => `${d.location}, ${d3.format(".2s")(d.total_cases_per_million)}`)
      .attr('fill', (d) => colorScale(d.location));
    })

  }
  
  updateSelectedCountries () {
    // console.log("hi from line chart")

    d3
    .select('#lines')
    .html('');

    d3
    .select('#y-axis')
    .html('');

    let svg = d3.select("#line-chart")

    let covidData = this.globalApplicationState.covidData;

    console.log(this.globalApplicationState.selectedLocations)

    let selectedData = []
    this.globalApplicationState.selectedLocations.forEach(loc => {
      this.globalApplicationState.covidData.forEach(row => {
        if(loc === row.iso_code){
          selectedData.push(row)
        }
      })
    })

    let groupedData = d3.group(selectedData, d => d.location)
    console.log(groupedData)

    let max = (Math.max.apply(Math, selectedData.map(function (o) { return o.total_cases_per_million; })))

    let yScale = d3.scaleLinear()
    .range([CHART_HEIGHT-MARGIN.right, 15])
    .domain([0, max])
    .nice()

    let xScale = d3.scaleTime()
    .range([0, CHART_WIDTH-MARGIN.left])
    .domain(d3.extent(this.globalApplicationState.covidData.map(value => {
      //console.log(parseDate(value.date))
      return new Date(value.date)
    })));

    svg.select("#y-axis")
    .append("g")
    .attr("transform", `translate(${MARGIN.left}, 0)`)
    .call(d3.axisLeft(yScale));     

    svg.select("#y-axis")
    .append("g")
    .attr("transform", `translate(${MARGIN.left}, 0)`)
    .call(d3.axisLeft(yScale));     

    svg.select('#y-axis')
    .append('text')
    .attr('x', -CHART_HEIGHT/2)
    .attr('y', 15)
    .attr("transform", `rotate(-90)`)
    .text('Cases per million')

    let keys = []
    groupedData.forEach(([key, value]) => {
      keys.push(key.location)
    })

    var colorScale = d3.scaleOrdinal().domain(keys).range(d3.schemeTableau10)

    svg.select("#lines")
    .selectAll('line')
    .data(groupedData)
    .enter()
    .append("path")
    .attr("d", function ([key, value]) {
      // console.log("key: ",key)
      // console.log("value: ",value)
        return d3.line()
            .x((d) => xScale(new Date(d.date)) + MARGIN.left)
            .y((d) => yScale(d.total_cases_per_million))
            (value)
    })
    .attr("fill", "none")
    .attr("stroke", ([key, value]) => {
      return colorScale(key)
    })
    .attr("stroke-width", 2)
    .on("mousemove", (event) => {
      const border = svg.node().getBoundingClientRect().x;
      if((event.clientX - border) > MARGIN.left){
        if(svg.select("#overlay").select("line").empty()){
          svg.select("#overlay").append("line")
        }
        else{
          svg.select("#overlay").select("line")
          .attr('stroke', 'black')
          .attr('x1', event.clientX - border)
          .attr('x2', event.clientX - border)
          .attr('y1', CHART_HEIGHT - MARGIN.right)
          .attr('y2', 0);
        }
      }

      let formatTime = d3.timeFormat("%Y-%m-%d");
      let hoveredDate = formatTime(xScale.invert((event.clientX - border) - MARGIN.left));
      //console.log(hoveredDate)

      let data = [];
      covidData.forEach(row => {
        this.globalApplicationState.selectedLocations.forEach(loc => {
          if(row.date === hoveredDate && loc === row.iso_code){
            let obj = {};
            obj["location"] = row.location;
            obj["total_cases_per_million"] = row.total_cases_per_million
            data.push(obj)
          }
        })
      })
      data = data.sort( function ( a, b ) { return b.total_cases_per_million - a.total_cases_per_million; } );
      console.log("sorted: ", data)

      svg
      .select('#overlay')
      .selectAll('text')
      .data(data)
      .join('text')
      .attr('y', (d, i) => (i + 1) * 20)
      .attr('x', function(){
        if((event.clientX - border) > 200){
          return (event.clientX - border) - 300
        }
        return (event.clientX - border) + 10
      })
      .text((d) => `${d.location}, ${d3.format(".3s")(d.total_cases_per_million)}`)
      .attr('fill', (d) => colorScale(d.location));
    })

    svg
    .select('#overlay')
    .selectAll('text')
    .remove();

    svg
    .select('#overlay')
    .selectAll('line')
    .attr('stroke', 'none');


  }
}