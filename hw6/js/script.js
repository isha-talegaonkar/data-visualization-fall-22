
function fetchJSONFile (path, callback) {
    const httpRequest = new XMLHttpRequest();
    httpRequest.onreadystatechange = function () {
      if (httpRequest.readyState === 4) {
        if (httpRequest.status === 200) {
          const data = JSON.parse(httpRequest.responseText);
          if (callback) callback(data);
        }
      }
    };
    httpRequest.open('GET', path);
    httpRequest.send();
  }
  
  fetchJSONFile('./data/words.json', function (data) {
    for (let entry of data) {
      entry['frequency'] = (entry['d_speeches'] + entry['r_speeches'])/50
      entry['percentage'] = Math.abs(entry['percent_of_r_speeches'] - entry['percent_of_d_speeches']) // Name the difference 'percentage' for sorting purposes
  }

    generateBubbleChart(data)
    generateTable(data)

    let storybutton = d3.select('#storybutton')
    
    storybutton.on('click', function(event){
      return storytelling(data)
    });
  });

 

