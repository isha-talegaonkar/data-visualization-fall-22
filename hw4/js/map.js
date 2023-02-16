/** Class representing the map view. */

class MapVis {
  /**
   * Creates a Map Visuzation
   * @param globalApplicationState The shared global application state (has the data and the line chart instance in it)
   */
  
  constructor(globalApplicationState) {

    this.globalApplicationState = globalApplicationState;
    //console.log(globalApplicationState.mapData)

    let geoJSON = topojson.feature(globalApplicationState.mapData,globalApplicationState.mapData.objects.countries);
    //console.log(geoJSON)

    // Set up the map projection
    const projection = d3.geoWinkel3()
      .scale(150) // This set the size of the map
      .translate([400, 250]); // This moves the map to the center of the SVG
  
    let svg = d3.select("#map")

    let path = d3.geoPath()
            .projection(projection);

    let colorScale = d3.scaleSequential(d3.interpolateReds);

    let covidData = globalApplicationState.covidData;

    let dataLookup = [];

    covidData.forEach(function (row) {
      let object = {};
      object["iso_code"] = row.iso_code
      object["total_cases_per_million"] = parseFloat(row.total_cases_per_million);
      dataLookup.push(object);
    });

    var result = Object.entries(dataLookup.reduce((c, {iso_code,total_cases_per_million}) => {
      (c[iso_code] = c[iso_code] || []).push(total_cases_per_million);
      return c;
    }, {})).map(([iso_code, total_cases_per_million]) => ({iso_code,total_cases_per_million: Math.max(...total_cases_per_million)}))

    result.forEach(d =>{
      if(isNaN(d["total_cases_per_million"])){
        d["total_cases_per_million"] = 0
      }
    })

    geoJSON.features.forEach(function (feature) {
      result.forEach(element =>{
        if (feature.id == element.iso_code){
          feature.maxValue = element.total_cases_per_million;
        }
      })
    });

    colorScale.domain([d3.min(result, function (d) {
      return d.total_cases_per_million
    }),
      d3.max(result, function (d) {
        return d.total_cases_per_million
      })
    ]);

    let graticule = d3.geoGraticule();

    svg.select("#graticules").append('path')
    .datum(graticule).attr('d', path).attr('fill', 'none')
    .style("stroke-width", "1")
    .style("stroke", "lightgrey")
    .style("opacity", 0.5);

    svg.select("#graticules").append('path')
    .datum(graticule.outline()).attr('d', path).attr('fill', 'none')
    .style("stroke-width", "1")
    .style("stroke", "#222")
    .style("opacity", 0.5);

    svg
    .select('#countries')
    .selectAll('path')
    .data(geoJSON.features)
    .enter()
    .append('path')
    .attr('d', path)
    .attr("fill", function (d) {
      if(d.maxValue == undefined){
        return colorScale(0);
      }
      return colorScale(d.maxValue);
    })
    .attr('stroke', 'lightgrey')
    .on('click', (d) => {
      console.log(d)
      this.updateSelectedCountries(d)
    })
    console.log(globalApplicationState)

    let min = d3.min(result, function (d) {
      return d.total_cases_per_million
    })

    let max = d3.max(result, function (d) {
      return d.total_cases_per_million
    })

    let mid = (max-min)/2

    var linearGradient = svg.append("defs")
    .append("linearGradient")
    .attr("id", "linear-gradient");

    linearGradient.append("stop")
    .attr("offset", "0%")
    .attr("stop-color", colorScale(min));

    linearGradient.append("stop")
    .attr("offset", "50%")
    .attr("stop-color", colorScale(mid)); 

    linearGradient.append("stop")
    .attr("offset", "100%")
    .attr("stop-color", colorScale(max));

    svg.append("g").attr("id","legend");

    d3.select("#legend")
    .append("rect")
    .attr("width", 200)
    .attr("height", 15)
    .attr('y', 0)
    .style("fill", "url(#linear-gradient)")
    .attr('transform', 'translate(0,490)');

    d3.select("#legend")
    .append("text")
    .attr("transform", "translate(0 480)")
    .text(d3.format(",.1s")(min));
    d3.select("#legend")
    .append("text")
    .attr("transform", "translate(170 480)")
    .text(d3.format(".2s")(max));

  }

  updateSelectedCountries (d) {
    
    if(this.globalApplicationState.selectedLocations.includes(d.currentTarget.__data__.id)){
      for( var i = 0; i < this.globalApplicationState.selectedLocations.length; i++){                                  
        if ( this.globalApplicationState.selectedLocations[i] === d.currentTarget.__data__.id) { 
          this.globalApplicationState.selectedLocations.splice(i, 1); 
            i--; 
        }
      }
      d.currentTarget.setAttribute("class", "country");
    }
    else{
      this.globalApplicationState.selectedLocations.push(d.currentTarget.__data__.id)
      d.currentTarget.setAttribute("class", "country selected");
    }
    //console.log(this.globalApplicationState.selectedLocations)
   
    this.globalApplicationState.lineChart.updateSelectedCountries();
  }
}
