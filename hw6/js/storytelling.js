function storytelling(data){
    let result;
    let window = d3.select('body').append('div').attr('class', 'pane')
    let svg = window.append('svg')

    svg.append('rect')
    .classed('pane', true)
    .attr('opacity', 0)
    .transition()
    .delay(500).attr('opacity', 0.5);

    let circles = d3.selectAll('circle')
    
    result = calculatePos(svg, circles, 'Democratic', data)
    tellStory(result[1], result[0], 'Democratic', data)

    result = calculatePos(svg, circles, 'Republican', data)
    tellStory(result[1], result[0], 'Republican', data)
    
    svg.on('click', function(){
        window.remove();
    });

}

function calculatePos(svg, circles, party, data){

    let value;
    let pos, group;

    if(party === 'Democratic'){
        value = d3.min(data.map(d=> d.position));
    }
    else{
        value = d3.max(data.map(d=> d.position))
    }

    pos = [circles.filter(d => d.position === value).node().getBoundingClientRect().x + 5, 
        circles.filter(d => d.position === value).node().getBoundingClientRect().y + 5];

    group = svg.selectAll('g.'+party)
    .data(circles.filter(d => d.position === value).data()).join('g')
    .classed(party, true);

    return [pos, group]
}

function tellStory(group, pos, party, data){

    let circleScale = d3.scaleSqrt()
    .domain([d3.min(data.map(d => +d['total'])), d3.max(data.map(d => +d['total']))])
    .range([2.5, 12]) 

    group.append('line')
    .attr('opacity', 0)
    .attr('x1', pos[0])
    .attr('x2', pos[0])
    .attr('y1', pos[1] - 150)
    .attr('y2', pos[1])
    .attr('stroke', 'black')
    .attr('stroke-width', 2)
    .transition()
    .delay(200)
    .attr('opacity', 1);

    group.append('rect')
    .attr('width', 210)
    .attr('height', 100)
    .attr('opacity', 0)
    .attr('x', pos[0])
    .attr('y', pos[1] - 150)
    .attr('stroke', 'black')
    .attr('stroke-width', 2)
    .transition()
    .delay(200)
    .attr('fill', '#fff')
    .attr('opacity', 1);

    group.selectAll('circle').data(d=> [d]).join('circle')
    .attr('opacity', 0)
    .attr('cx', pos[0])
    .attr('cy', pos[1])
    .attr('r', d=> circleScale(d.total))
    .attr('stroke-width', 2)
    .transition()
    .delay(200)
    .attr('opacity', 1);

    //let p_Group = writeText(party, group, pos);

    let p_Group = group.append('g');

    p_Group.append('text').text(`${party} speeches`).attr('x', pos[0] + 10).attr('y', pos[1] - 120);
    p_Group.append('text').text(d=> ` mentioned ${d.phrase}`).classed('highlight', true).attr('x', pos[0] + 10).attr('y', pos[1] - 100);
    p_Group.append('text').text(d=> `${Math.abs(d.position)}% more`).attr('x', d=> pos[0] + 10).attr('y', d=> pos[1] - 80);
    
    p_Group.attr('opacity', 0)
    .attr('x', d=> d.moveX + 100)
    .attr('y', d=> d.moveY + 200)
    .transition()
    .delay(200)
    .attr('opacity', 1);
}