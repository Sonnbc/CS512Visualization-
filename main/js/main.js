var dataset = 
	[{x:25, y:25, r:22, color:"blue"}, {x:75, y:25, r:22, color:"red"},
	{x:90, y:290, r:34, color:"grey"}, {x:100, y:300, r:5, color:"black"},
	{x:190, y:290, r:34, color:"yellow"}, {x:170, y:500, r:15, color:"steelblue"},
	{x:50, y:400, r:34, color:"orange"}, {x:160, y:360, r:60, color:"brown"},
	];
var miniW = 200,
	bigW = 800,
	miniH = 600,
	bigH = 600;
	
var zoomFactor = 5,
	myWindow = {w: bigW / zoomFactor, h: bigH / zoomFactor},
	scaleX = d3.scale.linear().range([0, bigW]),
	scaleY = d3.scale.linear().range([0, bigH]);

$(document).ready(function(){

//create the one big SVG and one small SVG
var dsvg = [{w:miniW, h:miniH, id:"mini"}, {w:bigW, h:bigH, id:"big"}];
d3.select("#mainview").selectAll("svg")
	.data(dsvg).enter().append("svg:svg")
	.attr("width", function(d) {return d.w;})
	.attr("height", function(d) {return d.h;})
	.attr("id", function(d) {return d.id;})
	
var mini = d3.select("#mini");
var big = d3.select("#big");

console.log(mini);
mini.on("click", 
	function() {
		console.log("go here");
		console.log(this);
		var x=d3.svg.mouse(this)[0];
		var y=d3.svg.mouse(this)[1]; 
		console.log(x,y);
		zoom(x, y);
	});
d3.select("#mini").selectAll("circle")
	.data(dataset)
	.enter()
	.append("svg:circle")
	.attr("cx", function(d) {return d.x;})
	.attr("cy", function(d) {return d.y;})
	.attr("r", function(d) {return d.r;})
	.attr("style", function(d) {return "stroke:grey;stroke-width:2;fill:"+d.color+";";});

d3.select("#big").selectAll("circle")
	.data(dataset)
	.enter()
	.append("svg:circle")
	.attr("r", function(d) {return d.r*zoomFactor;})
	.attr("style", function(d) {return "stroke:grey;stroke-width:2;fill:"+d.color+";";});
	
function zoom(px, py) {
	var big = d3.select("#big");
	x = d3.scale.linear().range([0, 800]);
	y = d3.scale.linear().range([0, 600]);
	console.log([px - myWindow.w/2, px + myWindow.w/2]);
	console.log([py - myWindow.h/2, py + myWindow.h/2]);
	x.domain([px - myWindow.w/2, px + myWindow.w/2]);
	y.domain([py - myWindow.h/2, py + myWindow.h/2]);
	console.log(x(100));
	console.log(x(0));
	console.log(x(60));
	big.selectAll("circle")
		.attr("cx", function(d) {return x(d.x);})
		.attr("cy", function(d) {return y(d.y);})
}

});