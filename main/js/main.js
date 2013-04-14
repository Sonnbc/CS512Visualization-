var dataset = 
	[{x:25, y:25, r:22, color:"blue"}, {x:75, y:25, r:22, color:"red"},
	{x:90, y:290, r:34, color:"grey"}, {x:100, y:300, r:5, color:"black"},
	{x:190, y:290, r:34, color:"yellow"}, {x:170, y:500, r:15, color:"steelblue"},
	{x:50, y:400, r:34, color:"orange"}, {x:160, y:360, r:60, color:"brown"},
	];
var miniW = 200,
	bigW = 1000,
	miniH = 850,
	bigH = 850;

var zoomFactor = 10,
	zoomWindow = {w: bigW / zoomFactor, h: bigH / zoomFactor},
	scaleX = d3.scale.linear().range([0, bigW]),
	scaleY = d3.scale.linear().range([0, bigH]);

$(document).ready(function(){

//create one big SVG and one mini SVG
var dsvg = [{w:miniW, h:miniH, id:"mini"}, {w:bigW, h:bigH, id:"big"}];
d3.select("#mainview").selectAll("svg")
	.data(dsvg).enter().append("svg:svg")
	.attr("width", function(d) {return d.w;})
	.attr("height", function(d) {return d.h;})
	.attr("id", function(d) {return d.id;});
	
var mini = d3.select("#mini");
var big = d3.select("#big");

//add data to mini SVG
d3.select("#mini").selectAll("circle")
	.data(dataset)
	.enter()
	.append("svg:circle")
	.attr("cx", function(d) {return d.x;})
	.attr("cy", function(d) {return d.y;})
	.attr("r", function(d) {return d.r;})
	.attr("style", function(d) {return "stroke:grey;stroke-width:2;fill:"+d.color+";";});

//add data to big SVG
d3.select("#big").selectAll("circle")
	.data(dataset)
	.enter()
	.append("svg:circle")
	.attr("r", function(d) {return d.r*zoomFactor;})
	.attr("style", function(d) {return "stroke:grey;stroke-width:2;fill:"+d.color+";";});

//create the zoom window in mini SVG
var myWindow = mini.append("svg:rect").attr("id", "window")
	.attr("width", zoomWindow.w).attr("height", zoomWindow.h)

//listen to mouse click on mini SVG
mini.on("click", 
	function() {
		var x=d3.svg.mouse(this)[0];
		var y=d3.svg.mouse(this)[1]; 
		myWindow.attr("x", x - zoomWindow.w/2).attr("y", y - zoomWindow.h/2);
		zoom(x, y);
	});

function render() {
	var diagonal = d3.svg.diagonal().projection(function(d) { return [d.y, d.x]; });
	var tree = d3.layout.tree().size([miniH, miniW]);
	d3.json("dataGen/data.json", function(data) {
		var layoutData = tree.nodes(data).reverse();
		layoutData.forEach(function (d) { d.y = d.depth * 40; });
		mini.selectAll("circle").data(layoutData).enter()
			.append("svg:circle")
			.attr("transform", function(d) {return "translate(" + d.y + "," + d.x + ")";})
			.attr("r", function(d) {return 5;});
		console.log(tree.links(layoutData));
		mini.selectAll("path").data(tree.links(layoutData)).enter()
			.append("svg:path").attr("d", diagonal);
	});
	
}
render();
		
	
function zoom(px, py) {
	var big = d3.select("#big");
	scaleX.domain([px - zoomWindow.w/2, px + zoomWindow.w/2]);
	scaleY.domain([py - zoomWindow.h/2, py + zoomWindow.h/2]);
	big.selectAll("circle")
		.attr("cx", function(d) {return scaleX(d.x);})
		.attr("cy", function(d) {return scaleY(d.y);})
}

});