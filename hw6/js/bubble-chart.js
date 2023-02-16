const MARGIN = {top: 30, right: 20, bottom: 20, left: 10}
const TOTAL_HEIGHT = 1200
const TOTAL_WIDTH = 1500 * 2/3

const CHART_WIDTH = TOTAL_WIDTH - MARGIN.left - MARGIN.right 
const CHART_HEIGHT = TOTAL_HEIGHT - MARGIN.top - MARGIN.bottom - 40

let object;
let grouped
let categories = [];

let toggleOn;

let brushes = []
let brushGroups = []
let arraysCompleted = false

function generateBubbleChart(data) { 
    let instance = this;

    grouped = d3.groups(data, d => d.category);
    grouped.map((g, i) => {
        return categories.push({ key: g[0], pos: i });
    });
    // console.log(data)

    object = data
    

    for (let entry of object) {
        entry['display'] = true
    }

    // d3.select('#bubble-chart')
    // .attr('width', TOTAL_WIDTH)
    // .attr('height', TOTAL_HEIGHT)
    //adding labels
    let svg = d3.select('#bubble-chart')
        .append('svg')
        .attr('width', TOTAL_WIDTH)
        .attr('height', TOTAL_HEIGHT)

    svg.append('text')
    .text('Democratic Leaning')
    .attr('text-anchor', 'start')
    .attr('class', 'labels')
    .attr('x', MARGIN.left)
    .attr('y', MARGIN.top)

    svg.append('text')
    .text('Republican Leaning')
    .attr('text-anchor', 'end')
    .attr('class', 'labels')
    .attr('x', CHART_WIDTH-MARGIN.right)
    .attr('y', MARGIN.top)

    let scale = d3.scaleLinear().domain([d3.min(object.map(d => d['sourceX'])), d3.max(object.map(d => d['sourceX']))])
    .range([d3.min(object.map(d => d['position'])), d3.max(object.map(d => d['position']))])


    //adding axis
    let xScale = d3.scaleLinear()
    .domain([scale(d3.min(object.map(d => d.sourceX))), scale(d3.max(object.map(d => d.sourceX)))])
    .range([10, CHART_WIDTH - 10])

    let scaleBrush = d3.scaleLinear()
    .domain([d3.min(object.map(d => d['sourceX'])), d3.max(object.map(d => d['sourceX']))])
    .range([10, (CHART_WIDTH - 10)])
    
    //drawing the initial swarm
    let swarmPlot = svg.append('g')
    .attr('id', 'initialPlot')
    .attr("transform", "translate("+(MARGIN.left)+","+(MARGIN.top+40+15)+")")
    //adding scales for circles
    let circleScale = d3.scaleSqrt()
    .domain([d3.min(object.map(d => +d['total'])), d3.max(object.map(d => +d['total']))])
    .range([2.5, 12]) 



    for (let i = 0; i < (categories.length); i++) {
        console.log('in loop')
        let brushGroup = swarmPlot.append('g').classed('brush', true)
    
        let brush = d3.brushX()
            .extent(i === 0 ? [ [0,(i*130)],[CHART_WIDTH, ((i+1)*130)]] : [[0,0], [0,0]])
            // .on("brush", () =>{
            //     const selectionThis = this;
            //     d3.selectAll('circle').classed('brush-on', true)
            //     const brushSelection = d3.brushSelection(selectionThis);
            //     const [leftX, rightX] = brushSelection;
            //     d3.selectAll('circle')
            //     .filter(function(d) {
            //         if(toggleOn) {
            //             return d.x >= leftX && d.x <= rightX
            //         }
            //         else{
            //             console.log()
            //             return d.sourceX >= leftX && d.sourceX <= rightX
            //         }
            //     })
            //     .classed('brush-on', false)

            // })
            .on('start', (event) => {
                for (let key of categories) {
                    brushGroups[key.pos].call(d3.brush().move, [[0,(key.pos*130)],[0,(key.pos*130)]])

                }
                
            })
            .on('end', function () {
                d3.selectAll('circle').classed('brush-on', false)
                let selection = d3.brushSelection(this)
                if (!selection) {
                    for (let entry of object) {
                        entry['display'] = true
                    }
                    let newData = [];
                    object.forEach(e=>{
                        if(e.display){
                            newData.push(e)
                        }
                    })                     
                    updateTable(object)
                    return
                }
                for (let entry of object) {
                    entry['display'] = false
                }

                let [leftPixels, rightPixels] = selection
                let leftX = scaleBrush.invert(leftPixels)
                let rightX = scaleBrush.invert(rightPixels)
                let filteredData=[]
                if (toggleOn) {
                    console.log(categories[i].key)
                    for (let entry of object) {
                        
                        if (entry['category'].includes(categories[i].key) && entry['sourceX'] > leftX && entry['sourceX'] < rightX) {
                            console.log("hi")
                            entry['display'] = true

                            filteredData = d3.selectAll('circle').filter(d=>{
                                d.x >= leftX && d.x < rightX
                            })
                        }
                    }
                    
                }
                else {
                    for (let entry of object) {
                        
                        if (entry['sourceX'] >= leftX && entry['sourceX'] <= rightX) {
                            console.log("hello")
                            entry['display'] = true

                            filteredData.push(d3.select('circle'+entry['phrase']))
                        }
                    }
                }
                // object.forEach(e=>{
                //     console.log(e.display)
                // })
                console.log(filteredData)
                let newData = [];
                object.forEach(e=>{
                    if(e.display){
                        newData.push(e)
                    }
                })               
                updateTable(object)


            })
        brushGroup.call(brush)
        if (!arraysCompleted) {
            brushes.push(brush)
            brushGroups.push(brushGroup)
        }
        if (i === (categories.length)){
            //console.log(brushes)
            arraysCompleted = true
        }
    }

    svg.append('g')
    .attr('id', 'xAxis')
    .attr("transform", "translate("+(MARGIN.left)+","+(MARGIN.top+40)+")")

    d3.select("#xAxis")
    .call(d3.axisTop(xScale)
    .ticks(11)
    .tickFormat(function(d) {
        return Math.abs(d)
    }))
    .style('font-weight', 'bold')
    .style("font-size", "14px")
    .select(".domain").attr("stroke-width", "0") //to remove the axis horizontal line
    .selectAll(".tick").attr("stroke-width", "2") 

    //color scale

    colorScale = d3.scaleOrdinal()
    .domain(categories.map(k => k.key))
    .range(d3.schemeSet2);



    swarmPlot.append('line') 
    .attr('id', 'centerLine')
    .attr('x1', xScale(0))
    .attr('x2', xScale(0))
    .attr('y1', 0)
    .attr('y2', 130)
    .style('stroke-width', 1)
    .style('stroke', 'black')

    let infoBox =  d3.select("#tooltip")
    .attr('class', '.tooltip')
    

    swarmPlot.selectAll('circle')
    .data(object)
    .join('circle')
    .attr('cx', d => scaleBrush(d['sourceX']))
    .attr('cy', d => d['sourceY'] +65) 
    .attr('r', d => circleScale(+d['total']))
    .style("fill", d => colorScale(d.category))
    .attr('opacity', 0.75)
    .attr('stroke', 'black')
    .attr('id', function(d,i) {return "circle"+d['phrase']})
    .on('mouseover', (event, d) => {
        d3.select("#tooltip")
        .transition()
        .duration(200)
        .style("opacity", 0.9);

        let f = d3.format(".2f");

        let position;
        if(+d.position < 0){
            position = `D+ ${f(+Math.abs(d.position))}`
        }
        else{
            position = `R+ ${f(+d.position)}`;
        }
        let text = `<h4>${d.phrase.charAt(0).toUpperCase() + d.phrase.slice(1)}</h4> <h5>${position}%</h5> <h5> In ${Math.round((d.total / 50) * 100)}% of speeches</h5>`;
  
        d3.select("#tooltip")
        .html(text + "<br/>")
        .attr('class', 'tooltip')
        .style("left", event.pageX + 5 + "px")
        .style("top", event.pageY - 28 + "px");

        d3.select('#circle'+d['phrase']).style('stroke-width', 3)
    })
    .on('mouseout', (event, d) => {
        d3.select("#tooltip")
        .transition()
        .duration(500)
        .style("opacity", 0);      

        d3.select('#circle'+d['phrase']).style('stroke-width', 1)
    })

    let textElements = swarmPlot.selectAll('text')
    .data(categories.map(k => k.key[0].toUpperCase() + k.key.substring(1)))
    .join('text')
    .attr("transform", (d, i) => "translate("+(MARGIN.left/4)+","+(i*130+10)+")")
    .text(d => d)
    .attr('opacity', 0)
    .style('fill', '#878787')
    .style('font-weight', 'bold')
    .style('font-size', '20')
    
}


function groupElements(checked){
    toggleOn = checked
    let circleElements = d3.selectAll('circle')
        .transition()
        .duration(500)

    let centerLine = d3.select('#centerLine')
        .transition()
        .duration(500)

    if (checked) {
        circleElements 
            .attr('cy', function(d){
                let value = -1;
                categories.forEach(c => {
                    if(d.category == c.key){
                        value = c.pos * 130 + 65 + d['sourceY']
                        // console.log(c.pos * 130 + 65 + d['sourceY'])
                    }
                })
                return value
            }) 

        centerLine.attr('y2', (130*(categories.length)))
        console.log(brushGroups)
        enableBrushes()
        brushGroups[0].call(d3.brush().move, [[0,0],[0,0]])
        d3.select('#initialPlot').selectAll('text')
            .transition()
            .duration(500)
            .attr('opacity', 1)
        
    }
    else {
        circleElements.attr('cy', d => d['sourceY'] +65)
        centerLine.attr('y2', 130)
        disableBrushes()
        brushGroups[0].call(d3.brush().move, [[0,0],[0,0]])
        d3.select('#initialPlot').selectAll('text').attr('opacity', 0)
    }
    for (let entry of object) {
        entry['display'] = true
    }
    updateTable(object)
}


function disableBrushes() {
    for (let i = 1; i < brushes.length; i++) {
        brushes[i].extent([ [0,0],[0,0]])
        brushGroups[i].call(brushes[i])
        brushGroups[i].call(d3.brush().move, [[0,(i*130)],[0,(i*130)]])
    }
}

function enableBrushes() {
    for (let i = 0; i < brushes.length; i++) {
        brushes[i].extent([[0,(i*130)],[CHART_WIDTH, ((i+1)*130)]])
        brushGroups[i].call(brushes[i])
    }
}



