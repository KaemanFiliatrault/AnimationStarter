//gets the mean grade of an entry
var getMeanGrade = function(entries)
{
    return d3.mean(entries,function(entry)
        {
            return entry.grade;
        })
}
var getMaxGrade = function(students,prop)
{
    return d3.max(students,function(student)
            {
                return d3.max(student[prop], function(entry){return entry.grade;})
            })
}

// draws the actual circles for the graph itself  based on the specific dataset of values and scales given to the method
var drawScatter = function(students,target,
              xProp,yProp,lengths)
{
    var scales = recalculateScales(students,xProp,yProp,lengths);
    var xScale = scales.xScale;
    var yScale = scales.yScale;
    
    updateAxes(target,xScale, yScale)
    //Join
    setBanner(xProp.toUpperCase() +" vs "+ yProp.toUpperCase());
    
    var circles = d3.select(target).select(".graph")
    .selectAll("circle")
    .data(students)
    .enter()
    .append("circle")
    .attr("cx",function(student)
    {
        return xScale(getMeanGrade(student[xProp]));    
    })
    .attr("cy",function(student)
    {
        return yScale(getMeanGrade(student[yProp]));    
    })
    .attr("r",4);
    //Enter
    circles.enter()
        .append("circle")
    //Exit
    circles.exit()
        .remove();
    //Update
    d3.select(target).select(".graph")
        .selectAll("circle")
        .transition()
        .duration(1000)
        .attr("cx",function(student)
        {
            return xScale(getMeanGrade(student[xProp]));    
        })
        .attr("cy",function(student)
        {
            return yScale(getMeanGrade(student[yProp]));    
        })
        .attr("r",4)
   
}
var recalculateScales = function(students,xProp,yProp,lengths)
{
    
    var xScale = d3.scaleLinear()
        .domain([0,getMaxGrade(students,xProp)])
        .range([0,lengths.graph.width])
           
    var yScale = d3.scaleLinear()
        .domain([0,getMaxGrade(students,yProp)])
        .range([lengths.graph.height,0])
    return {xScale:xScale, yScale:yScale};
    
}
//removes the data stored in d3 associated with the circles. Will remove the visual elements as well if they are still there.
var clearScatter = function(target)
{
    d3.select(target)
        .select(".graph")
        .selectAll("circle")
        .remove();
}

//creates Axes values usings scales and then moves them to their proper position on the screen based on margins.
var createAxes = function(screen,margins,graph,
                           target,xScale,yScale)
{
    

    var axes = d3.select(target)
        .append("g")
    axes.append("g")
        .attr("transform","translate("+margins.left+","
             +(margins.top+graph.height)+")")
        .attr("id","xAxis")
    axes.append("g")
        .attr("transform","translate("+margins.left+","
             +(margins.top)+")")
        .attr("id", "yAxis")
}

var updateAxes = function(target,xScale, yScale)
{
    var yAxis = d3.axisLeft(yScale);

    var xAxis = d3.axisBottom(xScale);
    
    d3.select("#yAxis")
        .transition()
        .duration(1000)
        .call(yAxis)
    d3.select("#xAxis")
        .transition()
        .duration(1000)
        .call(xAxis)
}

//creates the initial scales and the dimensions of the graph. Then calls methods that create buttons axes and a banner.
var initGraph = function(target,students)
{
    //the size of the screen
    var screen = {width:500, height:400};
    
    //how much space will be on each side of the graph
    var margins = {top:15,bottom:40,left:70,right:15};
    
    //generated how much space the graph will take up
    var graph = 
    {
        width:screen.width-margins.left-margins.right,
        height:screen.height-margins.top-margins.bottom,
    }
    var lengths = {
        screen:screen,
        margins:margins,
        graph:graph
    }

    //set the screen size
    d3.select(target)
        .attr("width",screen.width)
        .attr("height",screen.height)
    
    //create a group for the graph
    var g = d3.select(target)
        .append("g")
        .classed("graph",true)
        .attr("transform","translate("+margins.left+","+
             margins.top+")");
    
    
  
    
    createAxes(screen,margins,graph,target);
    
    initButtons(students,target, lengths);
    
    setBanner("Click buttons to graphs");
    
    

}
// makes the buttons that allow you to switch between graphs
var initButtons = function(students,target,lengths)
{
    
    d3.select("#fvh")
    .on("click",function()
    {
        //clearScatter(target);
        drawScatter(students,target,
              "final","homework",lengths);
    })
    
    d3.select("#hvq")
    .on("click",function()
    {
        //clearScatter(target);
        drawScatter(students,target,
              "homework","test",lengths);
    })
    
    d3.select("#tvf")
    .on("click",function()
    {
        //clearScatter(target);
        drawScatter(students,target,
              "test","final",lengths);
    })
    
    d3.select("#tvq")
    .on("click",function()
    {
        //clearScatter(target);
        drawScatter(students,target,
              "test","quizes",lengths);
    })
    
    
    
}
// sets the banner of your graph based on a certain text argument
var setBanner = function(msg)
{
    d3.select("#banner")
        .text(msg);
    
}

//promise that loads the penguin data into the d3 and calls initGraph. Handles if there is an error during this process

var penguinPromise = d3.json("/classData.json");

penguinPromise.then(function(penguins)
{
    console.log("class data",penguins);
   initGraph("#scatter",penguins);
   
},
function(err)
{
   console.log("Error Loading data:",err);
});