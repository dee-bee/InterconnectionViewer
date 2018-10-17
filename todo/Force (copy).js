var w = 960, h = 800;

var labelDistance = 0;

var vis = d3.select("body").append("svg:svg").attr("width", w).attr(
		"height", h);

var nodes = [];
//var labelAnchors = [];
//var labelAnchorLinks = [];
var links = [];

var force
//var force2
var forceOn = true



//Load the json data file
d3.json("flare-imports.json", function(classes) {
    //Loop through all of the top level elements and create nodes
    for (var i = 0; i < classes.length; i++) {
	    var node = {
		    label : classes[i].name
	    };
	    nodes.push(node);
	    /*labelAnchors.push({
		    node : node
	    });
	    labelAnchors.push({
		    node : node
	    });*/
	};
    
    //Loop through all of the nodes and and create the links
    for (var i = 0; i < nodes.length; i++) {
        //Loop through the imports adding the links
        for (var j = 0; j < classes[i].imports.length; j++) {
            //Find the import index
            var targetIndex = findNodeIndex(classes, classes[i].imports[j])
            
            if(classes[targetIndex].name == "readline-editline_h")
                continue
            
            links.push({
	            source : i,
	            target : targetIndex,
	            weight : 1
	        });
	    }
	    
	    
	    /*labelAnchorLinks.push({
		    source : i * 2,
		    target : i * 2 + 1,
		    weight : 1
	    });*/
    }
    
    build()
})

function build(){
    /*for (var i = 0; i < 30; i++) {
	    var node = {
		    label : "node " + i
	    };
	    nodes.push(node);
	    labelAnchors.push({
		    node : node
	    });
	    labelAnchors.push({
		    node : node
	    });
    };

    for (var i = 0; i < nodes.length; i++) {
	    for (var j = 0; j < i; j++) {
		    if (Math.random() > .95)
			    links.push({
				    source : i,
				    target : j,
				    weight : Math.random()
			    });
	    }
	
	    labelAnchorLinks.push({
		    source : i * 2,
		    target : i * 2 + 1,
		    weight : 1
	    });
    };*/

            

    force = d3.layout.force().size([ w, h ]).nodes(nodes).links(links)
		    .gravity(1).linkDistance(100).charge(-3000).linkStrength(
				    function(x) {
					    return x.weight * 10
				    });

    force.start();

    /*force2 = d3.layout.force().nodes(labelAnchors).links(
		    labelAnchorLinks).gravity(0).linkDistance(0).linkStrength(8)
		    .charge(-100).size([ w, h ]);
    force2.start();*/

    var link = vis.selectAll("line.link").data(links).enter().append(
		    "svg:line").attr("class", "link").style("stroke", "#CCC");

    var node = vis.selectAll("g.node").data(force.nodes()).enter().append(
		    "svg:g").attr("class", "node");
    node.append("svg:circle").attr("r", 5).style("fill", "#555").style(
		    "stroke", "#FFF").style("stroke-width", 3);
    node.append("svg:text").text(function(d, i) {
	    return  d.label
    }).style("fill", "#555").style("font-family", "Arial").style(
		    "font-size", 12);
    
    node.call(force.drag);

    /*var anchorLink = vis.selectAll("line.anchorLink")
    		.data(labelAnchorLinks)//.enter().append("svg:line").attr("class", "anchorLink").style("stroke", "#999");

    var anchorNode = vis.selectAll("g.anchorNode").data(force2.nodes())
		    .enter().append("svg:g").attr("class", "anchorNode");
    anchorNode.append("svg:circle").attr("r", 0).style("fill", "#FFF");
    anchorNode.append("svg:text").text(function(d, i) {
	    return i % 2 == 0 ? "" : d.node.label
    }).style("fill", "#555").style("font-family", "Arial").style(
		    "font-size", 12);*/

    var updateLink = function() {
	    this.attr("x1", function(d) {
		    return d.source.x;
	    }).attr("y1", function(d) {
		    return d.source.y;
	    }).attr("x2", function(d) {
		    return d.target.x;
	    }).attr("y2", function(d) {
		    return d.target.y;
	    });

    }

    var updateNode = function() {
	    this.attr("transform", function(d) {
	    	if(!isFloat(d.x) || !isFloat(d.y)){
	    		
	    		//console.log(d.x + ":" + d.y)
	    		return
	    	}

	    	//console.log(d.x + ":" + d.y)
		    return "translate(" + d.x + "," + d.y + ")";
	    });

    }



    force.on("tick", function() {
		link.call(updateLink);
		
	    node.call(updateNode);
	  	return

	    //force2.start();

	    if(forceOn)
	    	node.call(updateNode);

	    /*anchorNode.each(function(d, i) {
		    if (i % 2 == 0) {
			    d.x = d.node.x;
			    d.y = d.node.y;
		    } else {
			    var b = this.childNodes[1].getBBox();

			    var diffX = d.x - d.node.x;
			    var diffY = d.y - d.node.y;

			    var dist = Math.sqrt(diffX * diffX + diffY * diffY);

			    var shiftX = b.width * (diffX - dist) / (dist * 2);
			    shiftX = Math.max(-b.width, Math.min(0, shiftX));
			    var shiftY = 5;
			    this.childNodes[1].setAttribute("transform", "translate("
					    + shiftX + "," + shiftY + ")");
		    }
	    });

	    anchorNode.call(updateNode);*/

	    //anchorLink.call(updateLink);

    });
}

function findNodeIndex(classes, name){
    for(var i=0; i< classes.length; i++){
        if(classes[i].name == name){
            return i
        }
    }
    
    return -1
}

function isFloat(n){
    return Number(n) === n && n % 1 !== 0;
}