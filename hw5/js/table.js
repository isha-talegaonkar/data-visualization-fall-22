/** Class implementing the table. */
class Table {
    /**
     * Creates a Table Object
     */
    constructor(forecastData, pollData) {
        this.forecastData = forecastData;
        this.tableData = [...forecastData];
        // console.log(this.forecastData)
        // console.log(this.tableData)
        // add useful attributes
        for (let forecast of this.tableData)
        {
            forecast.isForecast = true;
            forecast.isExpanded = false;
        }
        this.pollData = pollData;
        //console.log(this.pollData)
        this.headerData = [
            {
                sorted: false,
                ascending: false,
                key: 'state'
            },
            {
                sorted: false,
                ascending: false,
                key: 'mean_netpartymargin',
                alterFunc: d => Math.abs(+d)
            },
            {
                sorted: false,
                ascending: false,
                key: 'winner_Rparty',
                alterFunc: d => +d
            },
        ]

        this.vizWidth = 300;
        this.vizHeight = 30;
        this.smallVizHeight = 20;

        this.scaleX = d3.scaleLinear()
            .domain([-100, 100])
            .range([0, this.vizWidth]);

        this.attachSortHandlers();
        this.drawLegend();
    }

    drawLegend() {
        ////////////
        // PART 2 //
        ////////////
        /**
         * Draw the legend for the bar chart.
         */
         let svg = d3.select('#marginAxis')
         .attr('width', this.vizWidth)
         .attr('height', this.vizHeight); 
 
        svg.selectAll('text')
        .data([-75, -50, -25, 0, 25, 50, 75])
        .join('text')
        .classed('label', true)
        .attr('x', d => this.scaleX(d))
        .attr('y', this.vizHeight - 5)
        .text(d => `+${d}`)
        .attr('class', function(d) {
            return d < 0 ? 'biden' : 'trump'
        })                 
    }

    drawTable() {
        this.updateHeaders();
        let rowSelection = d3.select('#predictionTableBody')
            .selectAll('tr')
            .data(this.tableData)
            .join('tr');

        rowSelection.on('click', (event, d) => 
            {
                if (d.isForecast)
                {
                    this.toggleRow(d, this.tableData.indexOf(d));
                }
            });

        let forecastSelection = rowSelection.selectAll('td')
            .data(this.rowToCellDataTransform)
            .join('td')
            .attr('class', function(d) {return d.class})
        
        ////////////
        // PART 1 // 
        ////////////
        /**
         * with the forecastSelection you need to set the text based on the dat value as long as the type is 'text'
         */

        forecastSelection.text(function(d){
            //console.log(d)
            if(d.type == 'text'){
                return d.value
            }
        })

        let vizSelection = forecastSelection.filter(d => d.type === 'viz');

        let svgSelect = vizSelection.selectAll('svg')
            .data(d => [d])
            .join('svg')
            .attr('width', this.vizWidth)
            .attr('height', d => d.isForecast ? this.vizHeight : this.smallVizHeight);

        let grouperSelect = svgSelect.selectAll('g')
            .data(d => [d, d, d])
            .join('g');

        this.addGridlines(grouperSelect.filter((d,i) => i === 0), [-75, -50, -25, 0, 25, 50, 75]);
        this.addRectangles(grouperSelect.filter((d,i) => i === 1));
        this.addCircles(grouperSelect.filter((d,i) => i === 2));
    }

    rowToCellDataTransform(d) {
        let stateInfo = {
            type: 'text',
            class: d.isForecast ? 'state-name' : 'poll-name',
            value: d.isForecast ? d.state : d.name
        };

        let marginInfo = {
            type: 'viz',
            value: {
                marginLow: -d.p90_netpartymargin,
                margin: d.isForecast ? -(+d.mean_netpartymargin) : d.margin,
                marginHigh: -d.p10_netpartymargin,
            }
        };

        let winChance;
        if (d.isForecast)
        {
            const trumpWinChance = +d.winner_Rparty;
            const bidenWinChance = +d.winner_Dparty;

            const trumpWin = trumpWinChance > bidenWinChance;
            const winOddsValue = 100 * Math.max(trumpWinChance, bidenWinChance);
            let winOddsMessage = `${Math.floor(winOddsValue)} of 100`
            if (winOddsValue > 99.5 && winOddsValue !== 100)
            {
                winOddsMessage = '> ' + winOddsMessage
            }
            winChance = {
                type: 'text',
                class: trumpWin ? 'trump' : 'biden',
                value: winOddsMessage
            }
        }
        else
        {
            winChance = {type: 'text', class: '', value: ''}
        }

        let dataList = [stateInfo, marginInfo, winChance];
        for (let point of dataList)
        {
            point.isForecast = d.isForecast;
        }
        return dataList;
    }

    updateHeaders() {
        ////////////
        // PART 7 // 
        ////////////
        /**
         * update the column headers based on the sort state
         */

        const cols = d3.select('#columnHeaders');

        cols.selectAll('th')
             .data(this.headerData)
             .classed('sorting', d => d.sorted)
 
         cols.selectAll('i')
             .data(this.headerData)
             .classed('no-display', function(d) { 
                return !d.sorted
            })
             .classed('fa-sort-up', function(d) { 
                return d.ascending
            })
             .classed('fa-sort-down', function(d) { 
                return !d.ascending
            })     
    }

    addGridlines(containerSelect, ticks) {
        ////////////
        // PART 3 // 
        ////////////
        /**
         * add gridlines to the vizualization
         */
         containerSelect.selectAll('line')
         .data(ticks)
         .join('line')
         .attr('x1', d => this.scaleX(d))
         .attr('x2', d => this.scaleX(d))
         .attr('y1', 0)
         .attr('y2', this.vizHeight) 
         .attr('stroke', d => d === 0 ? 'black' : '#cccccc');

    }

    addRectangles(containerSelect) {
        ////////////
        // PART 4 // 
        ////////////
        /**
         * add rectangles for the bar charts
         */
 
        containerSelect
        .filter(d => d.isForecast)
        .selectAll('rect')
        .data(function(d) {
        if(d.isForecast){
            //console.log(d)
            if (Math.sign(d.value.marginLow) === Math.sign(d.value.marginHigh))
            {
                return [[d.value.marginLow, d.value.marginHigh]];
            }
            return [[d.value.marginLow, 0], [0, d.value.marginHigh]]
            }
        })
        .join('rect')
        .attr('x', d => this.scaleX(d[0]))
        .attr('y', this.vizHeight * 0.167)
        .attr('width', d => this.scaleX(d[1]) - this.scaleX(d[0]))
        .attr('height', this.vizHeight)
        .classed('biden', function(d) {
            //console.log(d[0])
            return d[0] < 0
        })
        .classed('trump',function(d) {
            //console.log(d[0])
            return d[1] > 0
        })
        .classed('margin-bar', true);       
    }

    addCircles(containerSelect) {
        ////////////
        // PART 5 // 
        ////////////
        /**
         * add circles to the vizualizations
         */

        containerSelect.selectAll('circle')
            .data(d => [d])
            .join('circle')
            .attr('cx', d => this.scaleX(d.value.margin))
            .attr('cy', d => d.isForecast ? this.vizHeight / 1.7 : this.smallVizHeight / 1.7)
            .attr( 'r', d => d.isForecast ? this.vizHeight / 6 : this.vizHeight / 9 )
            .classed('biden', function(d) {
                //console.log(d[0])
                return d.value.margin <= 0
                })
                .classed('trump',function(d) {
                //console.log(d[0])
                return d.value.margin > 0
                })
            .classed('margin-circle', true);
    }

    attachSortHandlers() 
    {
        ////////////
        // PART 6 // 
        ////////////
        /**
         * Attach click handlers to all the th elements inside the columnHeaders row.
         * The handler should sort based on that column and alternate between ascending/descending.
         */

        //console.log("header data: ",this.headerData)
        let th = d3.select('#columnHeaders')

        th
        .selectAll('th')
        .data(this.headerData)
        .on("click", (event, d) => {
            //console.log(d)
            //this.collapseAll()
            this.headerData.forEach(h => {
                h.sorted = false
            })
            if(d.key === 'state'){
                d.sorted = true
                if(!d.ascending){
                    this.tableData.sort((a,b) => {
                        let fa = a.state.toLowerCase(),
                            fb = b.state.toLowerCase();
                    
                        if (fa < fb) {
                            return -1;
                        }
                        else if (fa > fb) {
                            return 1;
                        }
                        else if (fa === fb){
                            if (a.hasOwnProperty('name') && b.hasOwnProperty('name')){
                                let name1 = a.name.toLowerCase();
                                let name2 = b.name.toLowerCase();
                                if (name1 < name2) {
                                    return -1;
                                }
                                else if (name1 > name2) {
                                    return 1;
                                }                               
                            }
                        }
                        return 0;
                    });
                    //console.log(this.tableData)
                    d.ascending = true
                    this.drawTable()
                }
                else{
                    this.tableData.sort((a,b) => {
                        let fa = a.state.toLowerCase(),
                            fb = b.state.toLowerCase();
                    
                        if (fa < fb) {
                            return 1;
                        }
                        else if (fa > fb) {
                            return -1;
                        }
                        else if (fa === fb){
                            if (a.hasOwnProperty('name') && b.hasOwnProperty('name')){
                                let name1 = a.name.toLowerCase();
                                let name2 = b.name.toLowerCase();
                                if (name1 < name2) {
                                    return 1;
                                }
                                else if (name1 > name2) {
                                    return -1;
                                }                               
                            }
                        }
                        return 0;
                    });         
                    //console.log(this.tableData)
                    d.ascending = false    
                    this.drawTable();       
                }
            }
            else if(d.key === 'mean_netpartymargin'){
                d.sorted = true
                
                //console.log(this.tableData)
                if(!d.ascending){
                    this.tableData.sort((a,b) => {
                        let fa = Math.abs(a.mean_netpartymargin),
                            fb = Math.abs(b.mean_netpartymargin)

                        if (fa < fb) {
                            return -1;
                        }
                        if (fa > fb) {
                            return 1;
                        }
                        return 0;
                    });
                    //console.log(this.tableData)
                    d.ascending = true
                    this.drawTable();
                }
                else{
                    this.tableData.sort((a,b) => {
                        let fa = Math.abs(a.mean_netpartymargin),
                            fb = Math.abs(b.mean_netpartymargin)

                        if (fa < fb) {
                            return 1;
                        }
                        if (fa > fb) {
                            return -1;
                        }
                        return 0;
                    });  
                    //console.log(this.tableData)
                    d.ascending = false
                    this.drawTable();            
                }
            }
        })
    }

    toggleRow(rowData, index) {
        ////////////
        // PART 8 // 
        ////////////
        /**
         * Update table data with the poll data and redraw the table.
         */
        console.log(rowData)
        if(!rowData.isExpanded){
            console.log(this.pollData)
            if(this.pollData.get(rowData.state)){
                console.log(this.pollData.get(rowData.state))
                this.tableData.splice(index + 1, 0, ...this.pollData.get(rowData.state));
            }
            console.log(this.tableData)
            rowData.isExpanded = !rowData.isExpanded
        }
        else{
            this.tableData = this.tableData.filter(d => d.isForecast)
            rowData.isExpanded = !rowData.isExpanded
            console.log(this.tableData)
        }
        this.drawTable()
     
    }

    collapseAll() {
        this.tableData = this.tableData.filter(d => d.isForecast)
    }

}
