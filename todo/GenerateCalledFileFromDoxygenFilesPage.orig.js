//parseDoxygenFileList("http://localhost/code/x48-0.4.1/html/files.html")

function parseDoxygenFileList(url, callback){ 
    var dirStackArr = []
    var outputXml = $('<root></root>')
    var outputXmlCurrent = $(outputXml)

    $.get(url, function(data){
        xml = (new window.DOMParser()).parseFromString(data, "text/xml")
        xml = $(xml).find(".contents table.directory")
        
        //loop through all files directories
        xml.find("> tr").each(function(i,v){
            //parse the id
            var arr = v.id.split("_")
            arr.pop() //remove the last "_" element
            arr.splice(0, 1); //remove "row_"

            //Are we at the end of a dir
            if(dirStackArr.length + 1 != arr.length){
                //We must have hit the end of a dir to update the dir stack
                var numDirToRemove = dirStackArr.length  - arr.length +1
                for(var t=0; t< numDirToRemove; t++){
                    dirStackArr.pop()
                    outputXmlCurrent = outputXmlCurrent.parent()
                }
            }

            //if this is a sub dir load it to the stack
            if(dirStackArr.length + 1 == arr.length){
                //We're at a subdir, now figure if this is also a dir
                var as = $(v).find("> td > a")
                switch(as.length){
                    case 1:
                        //This is a dir so add it 
                        var newDirNode = $("<dir name='" + $(as[0]).text() + "'></dir>")
                        outputXmlCurrent.append(newDirNode)
                        outputXmlCurrent = newDirNode


                        dirStackArr.push([arr[length-1],$(as[0]).text()])
                        break
                    case 2:
                        //This is a file
                        var newFileNode = $("<file path='" + genPath(dirStackArr) +  $(as[1]).text() 
                                                + "' doxygen_file='" + $(as[1]).attr("href") + "'></file>")
                        outputXmlCurrent.append(newFileNode)
                        
                        break
                    default:
                        alert("other num found")
                }
            }
        })
     
        callback(outputXml)
     })
}

/*function generateTabs(){
    var output = ""
    for(var i=0; i<dirStackArr.length; i++){
        output += "\t"
    }

    return output
}*/

function genPath(dirStackArr){
    var output = ""
    for(var i=0; i<dirStackArr.length; i++){
        output += dirStackArr[i][1] + "/"
    }

    return output
}



function generateFunctionRelationsJSON(doxFileText){
    var outArr = []
    
    var doxFileNode = (new window.DOMParser()).parseFromString(doxFileText, "text/xml")
    
    $(doxFileNode)
        .find("table.memberdecls:has(*[name='func-members'])")
        .find("tr[class^='memitem']")
        .each(function(i,v){
            //Loop through the found functions
            var linkId = $(v).attr('class').split(":")[1] 
            
            //Grab svg filename
            var svgFilename = $(doxFileNode).find("#"+ linkId + " + .memitem .dyncontent iframe").attr("src")

            if(svgFilename != undefined){
                //console.log(svgFilename)
                
                if(!svgFilename.endsWith("_cgraph.svg")){
                    //We probably have the caller graph instead of the calling graph so return
                    return
                }

                outArr.push(svgFilename)  
            }    
        })

    //return all found svg files
    return outArr
}

function callGraph_findCallsFromRoot(svgDocumentNode){
    var svgConnections = []

    $(svgDocumentNode).find("svg g[class='edge']").each(function(i,v){
        var nodeConnectionArr = $(v).find("> title").text().split("->")
        
        if(nodeConnectionArr.length != 2){
            alert("problem with callGraph_findCallsFromRoot")
            return
        }

        if(nodeConnectionArr[0] == "Node1"){
            //This is a call from the root node so log it            
            connectedFilename = 
                   $(svgDocumentNode)
                        .find("svg g[id='" + nodeConnectionArr[1].toLowerCase() + "']")
                        .find('a').attr('xlink:href').split("#")[0]

            //console.log(connectedFilename)
            svgConnections[connectedFilename] = 1
        }
    })

    return svgConnections
}





//doIt("http://localhost/code/x48-0.4.1/html/files.html")
var d3JsonOutputArr
var doxIndex_GeneratedXml
function doIt(url){
    d3JsonOutputArr = []

    //Grab the file list
    parseDoxygenFileList(url, function(doxIndex_GeneratedXml){
        doxIndex_GeneratedXml = doxIndex_GeneratedXml
        
        //Loop through all dox pages
        doxIndex_GeneratedXml.find("file").each(function(i_dox, v_dox){
            //Load dox page
            var doxFilename = $(v_dox).attr("doxygen_file")
            var filePath = $(v_dox).attr("path")

            console.log(doxFilename)

            $.ajax({
                url: doxFilename,
                filePath: filePath, //Pass the source filepath
                success: function(doxFileText) {
                    var filePath = this.filePath
                    //Find the callgraph svg's
                    $.each(generateFunctionRelationsJSON(doxFileText), function(i_i_svg, v_v_svg){
                        //Loop through all svg's loading them

                        console.log(filePath + "-svg: " + v_v_svg)
                       $.ajax({
                            url: v_v_svg,
                            filePath: filePath, //Keep passing the filename
                            success: function(svgDocumentNode) {           
                                console.log(filePath)
                                                 
                                if(d3JsonOutputArr[filePath] == undefined){
                                    d3JsonOutputArr[filePath] = {imports:[]}
                                }

                                $.each(Object.keys(callGraph_findCallsFromRoot(svgDocumentNode)), function(i_i_i_call, v_v_v_call){
                                    //Convert doxygen filename to code filename
                                    v_v_v_call = doxIndex_GeneratedXml
                                                    .find("file[doxygen_file='" + v_v_v_call + "']").attr("path")
                                    
                                    //Append to D3 imports for the file
                                    d3JsonOutputArr[filePath].imports.push(v_v_v_call)

                                    //We have to make sure the called function is present as well.
                                    if(d3JsonOutputArr[v_v_v_call] == undefined){
                                        d3JsonOutputArr[v_v_v_call] = {imports:[]}
                                    }
                                })
                            }
                       })
                    })
                }
            })
        })
    })
}

function convertToD3Json(){
    var outputObjArr = []

    $.each(Object.keys(d3JsonOutputArr), function(i,v){
        var theName = v.replaceAll("/","-")
        theName = theName.replaceAll("[.]","_")
        var outObj = {name: theName 
                            , size:7000, 
                            imports:[]}

        var importsHashed = []

        $.each(d3JsonOutputArr[v].imports, function(i_i, v_v){
            importsHashed[v_v] = 1
        })

        //Basically we de-dupped it
        $.each(Object.keys(importsHashed), function(i_i, v_v){
            var theIName = v_v.replaceAll("/","-")
            theIName = theIName.replaceAll("[.]","_")
            outObj.imports.push(theIName)
        })

        outputObjArr.push(outObj)
    })

    return JSON.stringify(outputObjArr)
}

String.prototype.replaceAll = function(search, replacement) {
    var target = this;
    return target.replace(new RegExp(search, 'g'), replacement);
};
