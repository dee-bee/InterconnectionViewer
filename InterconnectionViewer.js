var width = 3000,
    height = 2700


var vis

var nodes = [];
var links = [];

var force

var flareImportJson
//Load the json data file
var defaultImportFilename = "data/x48-imports.json"
var importFilename

function getUrlParam(parameter, defaultvalue){
    var urlparameter = defaultvalue;
    if(window.location.href.indexOf(parameter) > -1){
        urlparameter = getUrlVars()[parameter];
        }
    return urlparameter;
}

function getUrlVars() {
    var vars = {};
    var parts = window.location.href.replace(/[?&]+([^=&]+)=([^&]*)/gi, function(m,key,value) {
        vars[key] = value;
    });
    return vars;
}


$( document ).ready(function() {
  importFilename = getUrlParam('dataFile',defaultImportFilename);

  d3.json(importFilename, parseJson )

  $("#slider").slider({
      value: 20,
      orientation: "horizontal",
      range: "min",
      animate: true,
      slide: function( event, ui ) {
      	//console.log(ui.value)
      	$('#diagramContainer > svg').css("zoom", ((ui.value - 20) * .02) + .2)
      	$('#diagramContainer > svg').css("-moz-transform", "scale(" + (((ui.value - 20) * .02) + .2) + ")")
      }
  })
});

function saveDiagram(){
	saveJson()
	saveTextAs($("#inputText").text(), "forceGraphDiagram.json");
}

function readSingleFile(e) {
	var file = e.target.files[0];

	if (!file) {
		return;
	}
	
	var reader = new FileReader();
	reader.onload = function(e) {
		var contents = e.target.result;
	
		$("#inputText").text(contents)
		loadJson()
	};
	
	reader.readAsText(file);
}

function saveJson(){
	//Need to loop through all of the classes and save the x/y/fixed info
	for (var i = 0; i < flareImportJson.length; i++) {
		flareImportJson[i].x = nodes[i].x
		flareImportJson[i].y = nodes[i].y

		if(nodes[i].fixed != undefined){
			flareImportJson[i].fixed = nodes[i].fixed
		}
	}
 
	$("#inputText").text(JSON.stringify(flareImportJson, null, 2))
}

function loadJson(){
	var jsonInput = JSON.parse($("#inputText").text())
	parseJson(jsonInput)
}

function parseJson(classes){
    flareImportJson = classes
	nodes = []
	links = []

    //Loop through all of the top level elements and create nodes
    for (var i = 0; i < classes.length; i++) {
	    var node = {
		    label : classes[i].name,
		    typeLabel : classes[i].typeLabel,
		    typeNode : classes[i].typeNode,
		    url: classes[i].url
		    , x: classes[i].x
		    , y: classes[i].y
		    , fromCalls: 0
		    , toCalls: 0
	    };
	
		//Find out if there are calls out of this file 
		for(var i2=0; i2<classes[i].imports.length; i2++){
			if(classes[i].imports[i2] == classes[i].name)
				continue //Don't include calls from itself

			node.fromCalls++
		}

		//Find out if there are calls into this file 
		for(var i3=0; i3<classes.length; i3++){
			for(var j3=0; j3<classes[i3].imports.length; j3++){
				if(i3 == i) 
					continue //Don't include it's own reference

				if(classes[i3].imports[j3] == classes[i].name)
					node.toCalls++ //Include calls from itself
			}
		}

		//If the node has no connections it will fly off the 
		// screen so set all nodes with no connections to fixed
		if(node.fromCalls == 0 && node.toCalls == 0)
			node.fixed = true

	    if(classes[i].fixed != undefined){
		    node.fixed = classes[i].fixed
	    }
	    nodes.push(node);
	};
    
    //Loop through all of the nodes and create the links
    for (var i = 0; i < nodes.length; i++) {
        //Loop through the imports adding the links
        if(classes[i].importsWeights == undefined){
        	classes[i].importsWeights = []
        }

        for (var j = 0; j < classes[i].imports.length; j++) {
            //Find the import index
            var targetIndex = findNodeIndex(classes, classes[i].imports[j])
            
            //Filter
            //if(classes[targetIndex].name.startsWith("readline/"))
              //  continue
            
			if(classes[i].importsWeights[j] == undefined){
				classes[i].importsWeights[j] = 
									findLinkWidth(classes[i], classes[i].imports[j])
			}

            links.push({
	            source : i,
	            target : targetIndex,
	            fromCount: parseInt(classes[i].importsWeights[j]),
	            toCount: 0,
	            weight : parseInt(classes[i].importsWeights[j]),
	            text : parseInt(classes[i].importsWeights[j]),
	            color: "teal",
	            display: "block"
	        });
	    }
	}
    
	//Now find all links that are duplicated and remove them
	for(var i=0; i<links.length; i++){
		var link = links[i]
		
		var sourceIndex = link.source
		var targetIndex = link.target

		if(links[i].display == "none"){ //If it is none then we already
										// handled this link and it's twin
					
			continue
		}

		//Is there a link where the source is the target and the target 
		//  is the source?
		for(var i_i=0; i_i<links.length; i_i++){
			if(targetIndex != sourceIndex &&
					targetIndex == links[i_i].source &&
					sourceIndex == links[i_i].target){
				//We found a match to copy over the fromTo and add to the weight
				links[i].toCount = links[i_i].weight
				links[i].weight += links[i_i].weight
				links[i].text = links[i].fromCount + ":" + links[i].toCount

				//Clear the toCount and fromCount so we don't show text for 
				//  second line
				links[i_i].text = ""
				
				/*//Now move all of the fromTo that pertain to this link to 
				// the original class
				var fromToArr = classes[targetIndex].fromTo
				for(var i3=0; i3 < fromToArr.length; i3++){
					var fromToItem = fromToArr[i3]

					if(fromToItem.destinationFile == classes[sourceIndex].name){
						classes[sourceIndex].fromTo.push(fromToItem)
					}
				}*/

				//Then hide it
				links[i_i].display = "none"
			}
		}
	}

	/*//Now clean up all of the deleted elements
	while(1){
		while_start:

		for(var i=0; i<links.length; i++){
			if(links[i] == undefined){
				links = links.splice(i,1); 
				continue while_start
			}
		}

		//Made it to the end without finding a deleted item
		break;
	}*/

    build()
    

    //Trigger zoom slider update
    var hs=$('#slider').slider();
	hs.slider('option','slide')
		   .call(hs,null,{ handle: $('.ui-slider-handle', hs), value: 20 });


    //svgPanZoom('#diagramContainer > svg');
}


function build(){
	$("#diagramContainer").empty()
	
	var vis = d3.select("#diagramContainer").append("svg:svg")
												.attr("width", width)
												.attr("height", height)

    force = self.force = d3.layout.force()
        .nodes(nodes)
        .links(links)
        .gravity(.05)
        .distance(300)
        .charge(-10000)
        .size([width, height])
        .start();


    var link = vis.selectAll("line.link")
        .data(links)
        .enter().append("svg:line")
        .attr("class", "link")
        .on('click', function(d,i){
        	linkClicked(d,i)
        })
        //.style("stroke", "#CCC")
        .style("stroke-width", function(d) { return d.weight; })
        //.style("stroke", function(d) { return d.color; })
        .style("stroke", function(d,i) { return "url(#grad" + i + ")" })
        
        .style("display", function(d) { return d.display; })
        .attr("id", function(d) { return d.source.index + ":" + d.target.index; })
        .attr("x1", function(d) { return d.source.x; })
        .attr("y1", function(d) { return d.source.y; })
        .attr("x2", function(d) { return d.target.x; })
        .attr("y2", function(d) { return d.target.y; });


	/*var gradients = vis.selectAll("linearGradient.gradient")
		.data(links)
        .enter().append("svg:linearGradient")
        .attr("class", "gradient")
    	.attr("id", function(d,i) { return "grad" + i; } )
    	.attr("x1", "0%")
    	.attr("y1", "0%")
    	.attr("x2", "100%")
    	.attr("y2", "0%")*/

    
	var gradients = vis.selectAll("radialGradient.gradient")
		.data(links)
        .enter().append("svg:radialGradient")
        .attr("class", "gradient")
    	.attr("id", function(d,i) { return "grad" + i; } )
    	.attr("gradientUnits", "userSpaceOnUse")
    
    var stop1 = gradients.append("svg:stop")
    	.style("stop-opacity","1")
    	.style("stop-color", function(d){
    		if(d.fromCount == 0 && d.toCount > 0){ 
	  								//they're calling us and we aren't 
	  								//calling them so push the hotspot to their side
	  			return "red"
	  		}else if(d.fromCount > 0 && d.toCount == 0){
	  								//we're calling them and they aren't 
	  								//calling us so push the hotspot to our side
				return "red"	
	  		}else{
	  			return "yellow"
	  		}
    	})
    	.attr("offset", function(d){
	  		//Set the hotspot to reflect the degree of call imbalance
	  		/*if(d.fromCount == 0 && d.toCount > 0){ 
	  			return "90%"
	  		}else if(d.fromCount > 0 && d.toCount == 0){
				return "10%"	
	  		}else */
	  		//if(d.fromCount == d.toCount){
			//	return "100%"	
	  		//}else{
	  			//find the percent of one over the other
	  			var resultPercentage = d.fromCount/(d.toCount + d.fromCount) * 100
	  			
				if(resultPercentage > 90)
					resultPercentage = 90
				
				if(resultPercentage < 10)
					resultPercentage = 10

				var output = d.fromCount + ":" + d.toCount + ":" + resultPercentage + "%"
				//console.log("resultPercentage:" + output)
	  			return resultPercentage + "%"
	  		//}
	    })
    
    /*var stop2 = gradients.append("svg:stop")
    	//.attr("offset", "50%")
    	.attr("style", "stop-color:yellow;stop-opacity:1")
		/*.attr("offset", function(d){
	  		//Set the hotspot to reflect the degree of call imbalance
	  		if(d.fromCount == 0 && d.toCount > 0){ 
	  								//they're calling us and we aren't 
	  								//calling them so push the hotspot to their side
	  			return "70%"
	  		}else if(d.fromCount > 0 && d.toCount == 0){
	  								//we're calling them and they aren't 
	  								//calling us so push the hotspot to our side
				return "0%"	
	  		}else{
	  			//find the percent of one over the other
	  			var resultPercentage = (d.fromCount/d.toCount * 35) 
	  			
				if(resultPercentage > 70)
					resultPercentage = 70

	  			return resultPercentage + "%"
	  		}
	    })*/

    var stop3 = gradients.append("svg:stop")
    	//.attr("offset", "100%")
    	.attr("style", "stop-opacity:1")
		.style("stop-color", function(d){
    		if(d.fromCount == 0 && d.toCount > 0){ 
	  								//they're calling us and we aren't 
	  								//calling them so push the hotspot to their side
	  			return "tan"
	  		}else if(d.fromCount > 0 && d.toCount == 0){
	  								//we're calling them and they aren't 
	  								//calling us so push the hotspot to our side
				return "tan"	
	  		}else{
	  			return "teal"	
	  		}
    	})

    var node_drag = d3.behavior.drag()
        .on("dragstart", dragstart)
        .on("drag", dragmove)
        .on("dragend", dragend);

    function dragstart(d, i) {
        force.stop() // stops the force auto positioning before you start dragging
    }

    function dragmove(d, i) {
    	//console.log(d.x + ":" + d.y)

    	if(d.x + d3.event.dx < 0 || d.y + d3.event.dy < 0  )
    		return

        d.px += d3.event.dx;
        d.py += d3.event.dy;
        d.x += d3.event.dx;
        d.y += d3.event.dy; 
        tick(); // this is the key to make it work together with updating both px,py,x,y on d !
    }

    function dragend(d, i) {
        d.fixed = true; // of course set the node to fixed so the force doesn't include the node in its auto positioning stuff
        tick();
        force.resume();
    }

	//Creat the link text elements
    var textNodes = vis.selectAll("text.text_node")
        .data(links)
        .enter().append("svg:text")
        .attr("class", "text_node")
        .attr("two_way", function(d) {  //Once again selectors not working
        								//So have to do this here
			if(d.text.toString().search(":") > 0){
				return true
			}else{
				return false
			}
       	})
        .text(function(d) { return d.text})



    var node = vis.selectAll("g.node")
        .data(nodes)
      .enter().append("svg:g")
        .attr("class", "node")
        .call(node_drag);

    node.append("svg:circle")
        .attr("class", function(d) { return "circle " + d.typeNode; } )
        //.attr("xlink:href", "https://github.com/favicon.ico")
        .attr("x", "-8px")
        .attr("y", "-8px")
        .attr("r", "12px")

    node.append("a")
    	.attr("xlink:href", function(d) { return d.url; } )
    	.attr("from_calls", function(d) { //Had to do this because css selector
    								   //  a:not([href]) doesn't work
    								   //  a:[href~=http] doesn't work either!
    								   //  possibly svg dom issue
    			if(d.fromCalls > 0){
    				return true
    			}else{
    				return false
    			} 
    		} )
    	.attr("target", "_blank")
    	.append("svg:text")
        .attr("class",  function(d) { return "nodetext " + d.typeLabel; } )
        .attr("dx", 12)
        //.attr("fill", function(d) { return d.type; })
        .attr("dy", ".35em")
        .text(function(d) { return d.label + " " 
        						+ d.fromCalls + ":" + d.toCalls });


    force.on("tick", tick);

    function tick() {
    	if(nodes[0].fixed == undefined){
		  nodes[0].x = width / 2;
		  nodes[0].y = height / 2;
    	}

      link.attr("x1", function(d) { return d.source.x; })
          .attr("y1", function(d) { return d.source.y; })
          .attr("x2", function(d) { return d.target.x; })
          .attr("y2", function(d) { return d.target.y; });

      node.attr("transform", function(d) { return "translate(" + d.x + "," + d.y + ")"; });
	
	  gradients.attr("cx", function(d){return d.source.x + "px"})
    	.attr("cy", function(d){return d.source.y + "px"})
    	.attr("r", function(d){
    		var x1 = d.source.x
    		var y1 = d.source.y
    		var x2 = d.target.x
    		var y2 = d.target.y
    		return Math.sqrt( (x1-x2)*(x1-x2) + (y1-y2)*(y1-y2) );
		})
    	.attr("fx", function(d){return d.source.x + "px"})
    	.attr("fy", function(d){return d.source.y + "px"})
    	.attr("gradientUnits", "userSpaceOnUse")

	  /*gradients.attr("grad_angle", function(d,i){
					//Generate an angle
					var deltaX = d.source.x - d.target.x;
					var deltaY = d.source.y - d.target.y;
					
					if(d.fromCount > d.toCount){
						//Then we want the hotspot to point toward the source
						// not the target
						deltaX = d.target.x - d.source.x;
						deltaY = d.target.y - d.source.y;
					}
					var rad = Math.atan2(deltaY, deltaX);
					var deg = rad * (180 / Math.PI)
	  				
					//Convert the angle to percentages
					d.grad_angle = []
					d.grad_angle['x1'] = 0
	  				d.grad_angle['y1'] = 0
	  				d.grad_angle['x2'] = 0
	  				d.grad_angle['y2'] = 0

					//console.log("deg:" + deg)
	  				if(deg <= 0){
	  					//quad 3 or 4
	  					if(deg <= -90){
	  						//quad 4
	  						var multiplierY2 = (180 + deg)/90 
	  						var multiplierX2 = 1 - multiplierY2
							//var multiplierX2 = 1 
	  						//var multiplierY2 = 1
							
							d.grad_angle['x2'] = 100 * multiplierX2 + "%"
							d.grad_angle['y2'] = 100 * multiplierY2 + "%"
	  					}else{
	  						//quad 3
	  						var multiplierX1 = (90 + deg)/90 
	  						var multiplierY2 = 1 - multiplierX1
							//var multiplierX1 = 1 
	  						//var multiplierY2 = 1
							
							d.grad_angle['x1'] = 100 * multiplierX1 + "%"
							d.grad_angle['y2'] = 100 * multiplierY2 + "%"
	  					}
	  				}else{
	  					//quad 1 or 2
	  					if(deg < 90){
	  						//quad 2
	  						//Not sure why this is quad 2 and not quad one
	  						var multiplierX1 = (90 - deg)/90 
	  						var multiplierY1 = 1 - multiplierX1
							//var multiplierX1 = 1 
	  						//var multiplierY1 = 1
							
							d.grad_angle['x1'] = 100 * multiplierX1 + "%"
							d.grad_angle['y1'] = 100 * multiplierY1 + "%"
	  					}else{
	  						//quad 1
	  						var multiplierX2 = (deg - 90)/90
	  						var multiplierY1 = 1 - multiplierX2
							//var multiplierX2 = 1 
	  						//var multiplierY1 = 1
							
							d.grad_angle['y1'] = 100 * multiplierY1 + "%"
							d.grad_angle['x2'] = 100 * multiplierX2 + "%"
	  					}
	  				}


	  				return JSON.stringify(d.grad_angle)
	  		})
	  		.attr("x1", function(d){return d.grad_angle['x1']})
	  		.attr("x2", function(d){return d.grad_angle['x2']})
	  		.attr("y1", function(d){return d.grad_angle['y1']})
	  		.attr("y2", function(d){return d.grad_angle['y2']})*/

	  textNodes.attr("x", function(d) { 
	  				var bigger
	  				var smaller

	  				if(d.target.x >= d.source.x){
	  					bigger = d.target.x
	  					smaller = d.source.x
	  				}else{
	  					smaller = d.target.x
	  					bigger = d.source.x
	  				}
	
					if(bigger < 0 || smaller < 0 || bigger == smaller)
						return  				

					//console.log("x:"+ bigger + ":" + smaller)
	  				return (bigger - smaller)/2 + smaller
	  			})
				.attr("y", function(d) { 
	  				var bigger
	  				var smaller

	  				if(d.target.y >= d.source.y){
	  					bigger = d.target.y
	  					smaller = d.source.y
	  				}else{
	  					smaller = d.target.y
	  					bigger = d.source.y
	  				}

					if(bigger < 0 || smaller < 0 || bigger == smaller)
						return

					//console.log("y:" + bigger + ":" + smaller)
	  				return (bigger - smaller)/2 + smaller
				})
				

    };

	//$("#diagramContainer").scrollTop( $("#diagramContainer").height() * .5)
    //$("#diagramContainer").scrollLeft( $("#diagramContainer").width() * .5)

	//Add in the gradients
	/*var jDefs = $("svg > defs")
	for(var i=0; i<links.length; i++){
		var jGradSnip = $($("#snippets #linearGradient_snippet")
						.html().replaceAll("lineargradient","linearGradient"))
		jGradSnip.attr('id',"grad" + i)
		jGradSnip.attr("xmlns", 'http://www.w3.org/2000/svg')

		jDefs.append(jGradSnip)
	}*/
}

String.prototype.replaceAll = function(search, replacement) {
    var target = this;
    return target.replace(new RegExp(search, 'g'), replacement);
};

/*function manualUpdate(){
	$.each(f_nodes, function(i,v){
		updateNode(f_nodes[i])
	})

	$.each(f_links, function(i,v){
		updateNode(f_links[i])
	})
}*/

function findNodeIndex(classes, name){
    for(var i=0; i< classes.length; i++){
        if(classes[i].name == name){
            return i
        }

        if(classes[i].label == name){
            return i
        }
    }
    
    return -1
}

function findLinkWidth(jsonElement, importName){
    var hitTally = 0
    
    for(var i=0; i< jsonElement.fromTo.length; i++){
        if(jsonElement.fromTo[i].destinationFile == importName){
            hitTally++
        }
    }
    
    return hitTally
}

function linkClicked(d,i){
	$("#infoPanel").html("")

	$("#infoPanel").append("<h2>" + d.source.label + " to " +  d.target.label + "</h2>")
				

	for(var i = 0; i < flareImportJson.length; i++){
		//Find the json class from the source label
		if(flareImportJson[i].name == d.source.label){
			
			//Loop through the fromTo arr and find all references to the destination file
			for( var i_i = 0; i_i < flareImportJson[i].fromTo.length; i_i++){
				if(flareImportJson[i].fromTo[i_i].destinationFile
													== d.target.label){
							 
					$("#infoPanel").append("<div class='functionItem'>"
						+"<a href='"+flareImportJson[i].fromTo[i_i].sourceFuncUrl+"' target='_blank'><div class='" 
							+ flareImportJson[i].fromTo[i_i].sourceFuncType  
							+ "'>" + flareImportJson[i].fromTo[i_i].sourceFuncName 
							+ "</div></a> : <a href='"+flareImportJson[i].fromTo[i_i].destinationFuncUrl+"' target='_blank'><div class='" 
								+ flareImportJson[i].fromTo[i_i].destinationFuncType  + "'>" 
									+ flareImportJson[i].fromTo[i_i].destinationFuncName + "</div></a></div>")
				}
			}
		}
	}

	$("#infoPanel").append("<h2>" + d.target.label + " to " +  d.source.label + "</h2>")
				

	for(var i = 0; i < flareImportJson.length; i++){
		//Find the json class from the destination label
		if(flareImportJson[i].name == d.target.label){
			
			//Loop through the fromTo arr and find all references to the source file
			for( var i_i = 0; i_i < flareImportJson[i].fromTo.length; i_i++){
				if(flareImportJson[i].fromTo[i_i].destinationFile
													== d.source.label){
							 
					$("#infoPanel").append("<div class='functionItem'>"
						+ "<a href='"+ flareImportJson[i].fromTo[i_i].sourceFuncUrl +"' target='_blank'><div class='"  
							+ flareImportJson[i].fromTo[i_i].sourceFuncType  
							+ "'>" + flareImportJson[i].fromTo[i_i].sourceFuncName 
							+ "</div></a> : <a href='"+flareImportJson[i].fromTo[i_i].destinationFuncUrl+"' target='_blank'><div class='" 
								+ flareImportJson[i].fromTo[i_i].destinationFuncType  + "'>" 
									+ flareImportJson[i].fromTo[i_i].destinationFuncName + "</div></a></div>")
				}
			}
		}
	}
}

var tally = 0
var svgDragging = false
var svgStartX, svgStartY
var diagramContainerMouseX, diagramContainerMouseY

function svgMouseOut(){
	//svgDragging = false
	//$("body").attr("svg_dragging", "false")
}

function svgMouseDown(event){
	svgDragging = true
	$("body").attr("svg_dragging", "true")
	svgStartY = event.clientY
	svgStartX = event.clientX

	//svgStartY = $("#diagramContainer").scrollTop()
	//svgStartX = $("#diagramContainer").scrollLeft()

	//tally++
	//console.log("down:" + tally)
	//console.log("down:" + event.clientX + ":" + event.clientY)
}


function svgMouseMove(event){
	diagramContainerMouseX = event.clientX
	diagramContainerMouseY = event.clientY

	if(svgDragging){
		if(event.clientY != svgStartY){
			var relativeY = event.clientY - svgStartY
			
			//if(relativeY < 30 && relativeY > -30){
				 						//Getto debounce :)

				$("#diagramContainer").scrollTop(
					$("#diagramContainer").scrollTop() + (2*relativeY)
				)

				svgStartY = event.clientY 
			//}
		} 
 
		if(event.clientX != svgStartX){
			var relativeX = event.clientX - svgStartX
			
			//if(relativeX < 30 && relativeX > -30){
											//Getto debounce :)
				$("#diagramContainer").scrollLeft(
					$("#diagramContainer").scrollLeft() + (2*relativeX)
				)

				svgStartX = event.clientX 
			//}
		}

		//console.log("move:" + event.clientX + ":" + event.clientY)
	}

	tally++
	//console.log("move:" + tally)

}

function svgMouseUp(event){
	svgDragging = false
	$("body").attr("svg_dragging", "false")

	tally++
	//console.log("up:" + tally)
}

function svgWheel(event){
	var currentSliderValue = $('#slider').slider('option','value')
	var newSliderValue = currentSliderValue + event.wheelDelta/120
	
	/*var origZoom = $("svg").css('zoom')
	var svgHeight = $("svg").height()
	var realSvgHeight = origZoom * svgHeight
	var currentRealSvgY = $("#diagramContainer").scrollTop()*/


	var hs=$('#slider').slider();
	hs.slider('option', 'value',newSliderValue);
	hs.slider('option','slide')
		   .call(hs,null,{ handle: $('.ui-slider-handle', hs), value: newSliderValue });

	var newZoom = $("svg").css('zoom')

	//We've handled the zoom, now we want to set the scroll offset 
	// to be centered where the cursor is currently pointing
	
	//Figure out where the cursor is pointing on the svg
	/*var svgX = diagramContainerMouseX + $("#diagramContainer").scrollLeft()
	var svgY = diagramContainerMouseY + $("#diagramContainer").scrollTop()
	
	$("#diagramContainer").scrollLeft($("#diagramContainer").scrollLeft() + 10)
	$("#diagramContainer").scrollTop($("#diagramContainer").scrollTop() - 0)

		
	console.log("wheel" + event.wheelDelta)*/
}