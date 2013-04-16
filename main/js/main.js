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
	miniRadius = function(d) {return 5.25 - d.depth;};
	bigRadius = function(d) {return (5.25 - d.depth)*zoomFactor;};
	
var zoomFactor = 10,
	zoomWindow = {},
	lastZoom = {};
	scaleX = d3.scale.linear().range([0, bigH]),
	scaleY = d3.scale.linear().range([0, bigW]);
	
var tree = d3.layout.tree().size([miniH, miniW]);

	
$(document).ready(function(){

//create one big SVG and one mini SVG
var dsvg = [{w:miniW, h:miniH, id:"mini"}, {w:bigW, h:bigH, id:"big"}];
d3.select("#visualization").selectAll("svg")
	.data(dsvg).enter().append("svg:svg")
	.attr("width", function(d) {return d.w;})
	.attr("height", function(d) {return d.h;})
	.attr("id", function(d) {return d.id;});
	
var mini = d3.select("#mini");
var big = d3.select("#big");

//create the zoom window in mini SVG
var myWindow = mini.append("svg:rect").attr("id", "window");
		

//listen to mouse click on mini SVG
mini.on("click", 
	function() {
		var x=d3.svg.mouse(this)[0];
		var y=d3.svg.mouse(this)[1]; 
		zoom(x, y);
	});
	
//listen to mousewheel on big SVG
big.on("mousewheel",
	function() {
		d3.event.preventDefault();
		factor = d3.event.wheelDelta > 0 ? 
			Math.min(20, zoomFactor + 2) : Math.max(6, zoomFactor - 2);
		changeZoomWindow(factor);
		zoom(lastZoom.x, lastZoom.y);
	});
		

render();

function render() {

	d3.json("dataGen/data.json", function(data) {
		var diagonal = d3.svg.diagonal().projection(function(d) { return [d.y, d.x]; });
		var layoutData = tree.nodes(data).reverse();
		
		//fixed depth. TODO: change to fit different datasets
		layoutData.forEach(function (d) { d.y = 10 + d.depth * 40; });
		//append id to data
		var i = 0;
		layoutData.forEach(function (d) { d._id = i++; });
		
		mini.selectAll("path").data(tree.links(layoutData)).enter()
			.append("svg:path").attr("d", diagonal);
			
		mini.selectAll("circle").data(layoutData).enter()
			.append("svg:circle")
			.attr("transform", function(d) {return "translate(" + d.y + "," + d.x + ")";})
			.attr("r", miniRadius)
			.attr("class", "node")
			.attr("data-id", function(d) {return d._id;});
			
		big.selectAll("path").data(tree.links(layoutData)).enter()
			.append("svg:path").attr("d", diagonal);
		/*big.selectAll("circle").data(layoutData).enter()
			.append("svg:circle")
			.attr("transform", function(d) {return "translate(" + d.y + "," + d.x + ")";})
			.attr("r", function(d) {return (5.25-d.depth)*zoomFactor;});*/
		var g = big.selectAll("g").data(layoutData).enter()
			.append("svg:g")
			.attr("transform", function(d) {return "translate(" + d.y + "," + d.x + ")";});
		
		//populate the detail view when a circle is clicked
		g.append("svg:circle")
			.attr("r", bigRadius)
			.attr("class", "node")
			.attr("data-id", function(d) {return d._id;})
			.on("click", function(d) {
				d3.select("#phrases").text(d.phrases.split(",").join(", "));
				d3.select("#authors").text(d.authors.split(",").join(", "));
				d3.select("#conferences").text(d.conferences.split(",").join(", "));
				
				d3.selectAll(".selectedNode").attr("class", "node");
				d3.selectAll("[data-id=\"" + d._id + "\"]").attr("class", "selectedNode");
			});
				
		g.append("svg:text")
			.attr("text-anchor", function(d) {return d.children? "middle" : "start"; })
			.text(function(d) {
				var a = d.phrases.split(',');
				if (a.length === 1) return d.phrases;
				return a.slice(0, 4).join(", ");
			});
			
		changeZoomWindow(zoomFactor);
		zoom(miniW/2, miniH/2);	
		
	});
}

function changeZoomWindow(factor) {
	zoomFactor = factor;
	zoomWindow = {w: bigW / zoomFactor, h: bigH / zoomFactor};
	myWindow.attr("width", zoomWindow.w).attr("height", zoomWindow.h);
}
		
function zoom(px, py) {
	lastZoom.x = px;
	lastZoom.y = py;
	
	myWindow.attr("x", px - zoomWindow.w/2).attr("y", py - zoomWindow.h/2);
	
	var big = d3.select("#big");
	scaleX.domain([py - zoomWindow.h/2, py + zoomWindow.h/2]);
	scaleY.domain([px - zoomWindow.w/2, px + zoomWindow.w/2]);
	var diagonal = d3.svg.diagonal().projection(function(d) { return [scaleY(d.y), scaleX(d.x)]; });

	big.selectAll("g")
		.attr("transform", 
			function(d) {return "translate(" + scaleY(d.y) + "," + scaleX(d.x) + ")";});
	big.selectAll("text")
		.attr("x", function(d) {return d.children? 0 : bigRadius(d) + 4;})
		.attr("y", function(d) {return d.children? - bigRadius(d) - 4 : 4;});
		
	big.selectAll("circle")
		.attr("r", bigRadius);
	big.selectAll("path").attr("d", diagonal);
}




});