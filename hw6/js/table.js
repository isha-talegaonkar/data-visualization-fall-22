const T_MARGIN = {top: 20, right:10, bottom: 20, left: 10}
const TABLE_WIDTH = 466 - T_MARGIN.left - T_MARGIN.right
const GAP = 0.06 * TABLE_WIDTH
const SPACE = TABLE_WIDTH - (4*GAP)

let t_grouped
let t_categories = [];


let headerData = [
    {
        sorted: false,
        ascending: false,
        key: 'phrase', 
    },
    {
        sorted: false,
        ascending: false,
        key: 'frequency',
    },
    {
        sorted: false,
        ascending: false,
        key: 'percentage',
    },
    {
        sorted: false,
        ascending: false,
        key: 'total',
    }
]
let headersPresent = false

function generateTable(data){
    console.log("entered table")
    let svg = d3.select('#table')

    if(!headersPresent){
        svg.append('thead')
        .attr('id', 't_head')
        .style("background-color", '#e6eefa');
        
        t_head = d3.select('#t_head').append('tr')
        .attr('id', 'headerRow')

        t_head.append('th')
        .attr('id', 'phrase')
        .text('Phrase')
        .style('text-align', 'center')
        .style('padding-right', GAP+'px')
        .attr('width', SPACE*0.20)
        .attr('class', 'sortable')

        t_head.append('th')
        .attr('id', 'freq')
        .text('Frequency')
        .style('text-align', 'center')
        .style('padding-right', GAP+'px')
        .attr('width', SPACE*0.30)
        .attr('class', 'sortable')

        t_head.append('th')
        .attr('id', 'percent')
        .text('Percentage')
        .style('text-align', 'center')
        .style('padding-right', GAP+'px')
        .attr('width', SPACE*0.40)
        .attr('class', 'sortable')

        t_head.append('th')
        .attr('id', 'total')
        .text('Total')
        .style('text-align', 'center')
        .style('padding-right', GAP+'px')
        .attr('width', SPACE*0.10)
        .attr('class', 'sortable')

        let freq_scale = d3.scaleLinear()
        .domain([0,1])
        .range([0, SPACE*0.30])

        d3.select('#t_head')
        .append('tr')
        .attr('id', 'axisRow')
        

        let axis = d3.select('#axisRow')

        //phrase
        axis.append('th')
        .attr('width', SPACE*0.20)

        let freq_width = (SPACE*0.30)
        //frequency
        axis.append('th')
        .attr('width', SPACE*0.30)
        .append('svg')
        .attr('width', freq_width+1*GAP)
        .attr('height', 35)
        .append('g')
        .attr('id', 'fticks')

        let fticks = d3.axisTop(freq_scale).ticks(3)

        let freq_axis = d3.select('#fticks').call(fticks)
        .style("font-size", "12px")
        .attr("transform", "translate("+0.5*GAP+",35)")

        freq_axis.selectAll(".tick").attr("stroke-width", "2")
        freq_axis.select(".domain").attr("stroke-width", "0")

        //percent

        let perc_scale = d3.scaleLinear()
        .domain([-100,100])
        .range([0, (SPACE*0.40)]) 

        axis.append('th')
        .attr('width', SPACE*0.30)
        .append('svg')
        .attr('width', (SPACE*0.40)+GAP)
        .attr('height', 35)
        .append('g')
        .attr('id', 'pticks')

        let pticks = d3.axisTop(perc_scale).tickFormat(function(d){
            if(d<0){
                return -d
            }
            return d
        }).ticks(5)

        let perc_axis = d3.select('#pticks').call(pticks)
        .style("font-size", "12px")
        .attr("transform", "translate("+0.5*GAP+",35)")
        
        perc_axis.selectAll(".tick").attr("stroke-width", "2")
        perc_axis.select(".domain").attr("stroke-width", "0")
        
        axis.append('th')
        .attr('width', SPACE*0.10)

        svg.append('tbody')
        .attr('id', 't_body')

        headersPresent = true
        updateTable(data)
    }
}

function updateTable(data){
    t_grouped = d3.groups(data, d => d.category);
    t_grouped.map((g, i) => {
        return t_categories.push({ key: g[0], pos: i });
    });

    colorScale = d3.scaleOrdinal()
    .domain(t_categories.map(k => k.key))
    .range(d3.schemeSet2);

    let t_body = d3.select('#t_body')
    .selectAll('tr')
    .data(data)
    console.log("t_body: ",t_body)

    t_body.exit().remove()

    t_body.style('display', d => d.display ? '' : 'none')


    let row = t_body.enter().append('tr')

    console.log("tr", row)
    console.log("tabledata: ",data)
    row
    .append('td')
    .attr('width', SPACE*0.20)
    .text(function(d) {
        console.log(d['phrase'])
        return d['phrase']
    })
    .style('vertical-align', 'middle')
    .style('font-size', '14px')

    let scaleFrequency = d3.scaleLinear()
        .domain([0,1])
        .range([0, SPACE*0.30])

    row
    .append('td')
    .attr('width', SPACE*0.30)   
    .append('svg')
    .attr('height', 20)
    .attr('width', (SPACE*0.30)+GAP)
    .append('rect')
    .attr('height', 20)
    .attr('fill', d => colorScale(d.category))
    .attr('transform', 'translate('+0.5*GAP+', 0)')
    .attr('width', function(d) {
        return scaleFrequency(d['total']/50)
    })

    let scalePercentages = d3.scaleLinear()
    .domain([0,100])
    .range([0, ((SPACE*0.40)/2)]) 

    function getRectWidth(inputWidth) {
        let scaledWidth = scalePercentages(inputWidth)
        if (scaledWidth > 0) {
            return (scaledWidth -1)
        }
        else {
            return 0
        }
    }

    let svg1 = row
    .append('td')
    .attr('width', SPACE*0.40)   
    
    let svg2 = svg1.append('svg')
    .attr('height', 20)
    .attr('width', (SPACE*0.40)+GAP)

    svg2.append('rect')
    .attr('height', 20)
    .attr('fill', '#ef8277')
    .attr('transform', 'translate('+(0.5*GAP+0.5*(SPACE*0.40)+1)+', 0)')
    .attr('width', function(d) {
        return getRectWidth(d['percent_of_r_speeches'])
    }) 

    svg2.append('rect')
    .attr('height', 20)
    .attr('fill', '#699fc1')
    .attr('transform', 'translate('+(0.5*GAP+0.5*(SPACE*0.40)-1)+', 0) scale(-1, 1)')
    .attr('width', function(d) {
        return getRectWidth(d['percent_of_d_speeches'])
    })   

    row
    .append('td')
    .attr('width', SPACE*0.10)
    .text(d => d['total'])
    .style('vertical-align', 'middle')
    .style('font-size', '14px')

    let headers = d3.select('#headerRow').selectAll('th').data(headerData)
    headers.on('click', (event, d) => {
        headerData.forEach(row =>{
            row.sorted = false
        })
        d.ascending = !d.ascending
        d.sorted = true
        let sortData = (x,y) => {
            if(!d.ascending){  
                return d3.ascending(x[d.key], y[d.key])     
            }
            else{
                
                return d3.descending(x[d.key], y[d.key])             
            }
        }    
        d3.select('#t_body')
                .selectAll('tr')
                .sort(sortData) 
    })        
}

