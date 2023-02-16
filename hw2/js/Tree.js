/** Class representing a Tree. */
class Tree {
  /**
   * Creates a Tree Object
   * Populates a single attribute that contains a list (array) of Node objects to be used by the other functions in this class
   * @param {json[]} json - array of json objects with name and parent fields
   */
  constructor(json) {
    this.nodes = [];

    let node = null;
    for(var i=0; i<json.length; i++){
      node = new Node(json[i].name, json[i].parent);  
      this.nodes.push(node);
    }
  }

  /**
   * Assign other required attributes for the nodes.
   */
  buildTree () {
    // note: in this function you will assign positions and levels by making calls to assignPosition() and assignLevel()
    for(var i=0; i<this.nodes.length; i++){
      for(var j=0; j<this.nodes.length; j++){
        if(this.nodes[i].parentName == this.nodes[j].name){
          this.nodes[i].parentNode = this.nodes[j];
          this.nodes[j].addChild(this.nodes[i]);
        }
      }
    }
    this.assignLevel(this.nodes[0], 0);
    this.assignPosition(this.nodes[0], 0);
    
    //console.log(this.nodes);
  }

  /**
   * Recursive function that assign levels to each node
   */
  assignLevel (node, level) {
    node.level = level;
    if(node.children.length == 0){
      return;
    }

    for(var i=0; i<node.children.length; i++){
      this.assignLevel(node.children[i], level+1);
    }
  }

  /**
   * Recursive function that assign positions to each node
   */
  assignPosition (node, position) {
    node.position = position;

    var queue = [];
    var parentDict = [];
    
    node.children.forEach(child =>{
      queue.push(child);
    })
    while(queue.length > 0){
      var child = queue.shift();

      if(parentDict.includes(child.parentName)){
        position++;
      }
      parentDict.push(child.parentName);
      position = this.assignPosition(child, position);
        
    }
    return position;
  }

  /**
   * Function that renders the tree
   */
  renderTree () {
 
	  let svg = d3.select("svg");
		
		for(var i = 0; i < this.nodes.length; i++)
		{	
			var parent = this.nodes[i];
			var children = parent.children;
			
      console.log(parent.level);
			for(var j = 0; j < children.length; j++)
			{
        //console.log(children[i]);
        let points = [
					{x1: (parent.level*125+50), y1: (parent.position*125+50)},
					{x2: (children[j].level*125+50), y2: (children[j].position*125+50)}
				];
				
				var lines = svg.append("line")
							.attr("x1", points[0].x1)
							.attr("y1", points[0].y1)
							.attr("x2", points[1].x2)
							.attr("y2", points[1].y2);
				
              lines.exit()
				points = [];
			}
		}

    // svg.selectAll("line")
    // .data(this.nodes)
    // .join("line")
    // .attr("x1", function (d) { return (d.level*125 + 50); })
    // .attr("y1", function (d) { return (d.position*125 + 50); })
    // .attr("x2", function (d,i) { return (d.children[i].level*125 + 50) })
    // .attr("y2", function (d,i) { return (d.children[i].position*125 + 50) });  

    let group = svg.selectAll("g")
    .data(this.nodes)
    .join("g")
    .attr("class", "nodeGroup")
    .attr("transform", function (d, i) {                 
      return "translate("+ (d.position) +","+ (d.position) + ")";
    });
    
    group.append("circle")
    .attr("cx", function (d) { return (d.level*125 + 50); })
    .attr("cy", function (d) { return (d.position*125 + 50); })
    .attr("r", 40)
    .join("circle")

    group.append("text")
    .attr("x", function (d) { return (d.level*125 + 50); })
    .attr("y", function (d) { return (d.position*125 + 50); })
    .text(function(d){ return d.name})
    .attr("class", "label")
    .join("text")
  }

}