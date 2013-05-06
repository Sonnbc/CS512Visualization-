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
	
var	myWindow;

var tree = d3.layout.tree().size([miniH, miniW]);

var	lastDrag;

var autoCompleteTags = [];
	
$(document).ready(function(){

//configure the main menu and the search form
$('#query-input').hide();
$('#search-btn').on("click", function() {$('#query-input').show();});
$('#browse-btn').on("click", function() {
	$('#query-input').hide();
	render("dataGen/browse.json");
});
$('#query-text')
	.bind("keydown", function(event) {
		if (event.keyCode === $.ui.keyCode.TAB &&
			$(this).data("ui-autocomplete").menu.active) {
			event.preventDefault();
		}
	})
	.autocomplete({
		minLength: 2,
		source: function(request, response) {
			var key = request.term.split(/,\s*/).pop();
			// delegate back to autocomplete, but extract the last term
			response($.ui.autocomplete.filter(autoCompleteTags, key));
		},
		focus: function() {
			// prevent value inserted on focus
			return false;
		},
		select: function(event, ui) {
			var terms = this.value.split(/,\s*/);
			// remove the current input
			terms.pop();
			// add the selected item
			terms.push(ui.item.value);
			// add placeholder to get the comma-and-space at the end
			terms.push("");
			this.value = terms.join(", ");
			return false;
		}
	});
	
//Mock querying

$("#query-btn").on("click", function() {
	var query = $("#query-text").val();
	if (query.indexOf("christos faloutsos") >= 0) {
		render("dataGen/queryFalloutsos.json");
	}
	else if (query.indexOf("jiawei han") >= 0) {
		render("dataGen/queryHan.json");
	}
	else if (query.indexOf("sigir") >= 0) {
		render("dataGen/querySigir.json");
	}
	else if (query.indexOf("feature") >= 0) {
		render("dataGen/freetextFeatureSelection.peer-to-peer.json");
	}
});
	
//create one big SVG and one mini SVG
var dsvg = [{w:miniW, h:miniH, id:"mini"}, {w:bigW, h:bigH, id:"big"}];
d3.select("#visualization").selectAll("svg")
	.data(dsvg).enter().append("svg:svg")
	.attr("width", function(d) {return d.w;})
	.attr("height", function(d) {return d.h;})
	.attr("id", function(d) {return d.id;});
	
var mini = d3.select("#mini");
var big = d3.select("#big");


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

//enable dragging around the big view	
$("#big").mousemove(
	function(e) {
		e.preventDefault();
		if (e.which === 0 || lastDrag === undefined) {
			lastDrag = {x:e.pageX, y:e.pageY}; return;
		}
		var drag = {x:e.pageX, y:e.pageY};
		
		var dx = (drag.x - lastDrag.x) / zoomFactor;
		var dy = (drag.y - lastDrag.y) / zoomFactor;

		//if (Math.abs(dx) < 1 && Math.abs(dy) < 2) return;
		lastDrag = drag;
		zoom(lastZoom.x - dx, lastZoom.y - dy);
	});

render("dataGen/browse.json");

function render(jsonPath) {
	
	//clear the content of the two SVGs
	mini.selectAll('*').remove();
	big.selectAll('*').remove();
	
	//create the zoom window in mini SVG
	myWindow = mini.append("svg:rect").attr("id", "window");
	
	d3.json(jsonPath, function(data) {
		var diagonal = d3.svg.diagonal().projection(function(d) { return [d.y, d.x]; });
		var layoutData = tree.nodes(data).reverse();
		
		//recalculate the depth to fit with the width of mini panel
		var maxDepth = 0;
		layoutData.forEach(function (d) { if (d.depth > maxDepth) maxDepth = d.depth;});
		layoutData.forEach(function (d) { d.y = 10 + d.depth * (miniW - 20)/maxDepth; });
		
		//append id to data
		var i = 0;
		layoutData.forEach(function (d) { d._id = i++; });
		
		//scale score
		if (typeof(data.score) !== 'undefined') {
			var min = 1, max = 0;
			layoutData.forEach(function(d) { 
				max = Math.max(d.score, max);
				min = Math.min(d.score, min);
			});
			layoutData.forEach(function(d) { d.score = (d.score - min)/(max - min); });
		}
		
		mini.selectAll("path").data(tree.links(layoutData)).enter()
			.append("svg:path").attr("d", diagonal);
			
		mini.selectAll("circle").data(layoutData).enter()
			.append("svg:circle")
			.attr("transform", function(d) {return "translate(" + d.y + "," + d.x + ")";})
			.attr("r", miniRadius)
			.attr("class", "node")
			.attr("data-id", function(d) {return d._id;})
			.style("fill", function(d) {return calculateColor(d.score);})
			
		big.selectAll("path").data(tree.links(layoutData)).enter()
			.append("svg:path").attr("d", diagonal);

		var g = big.selectAll("g").data(layoutData).enter()
			.append("svg:g")
			.attr("transform", function(d) {return "translate(" + d.y + "," + d.x + ")";});
		
		//populate the detail view when a circle is clicked
		g.append("svg:circle")
			.attr("r", bigRadius)
			.attr("class", "node")
			.attr("data-id", function(d) {return d._id;})
			.style("fill", function(d) {return calculateColor(d.score);})
			.on("click", function(d) {
				d3.select("#phrases").text(d.phrases.split(",").join(", "));
				d3.select("#authors").text(d.authors.split(",").join(", "));
				d3.select("#conferences").text(d.conferences.split(",").join(", "));
				
				d3.selectAll(".selectedNode").attr("class", "node")
				.style("fill", function(d) {return calculateColor(d.score);})
				
				d3.selectAll("[data-id=\"" + d._id + "\"]").attr("class", "selectedNode")
				.style("fill", "steelblue");
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
		
		//build the auto complete list
		layoutData.forEach(function (d) { 
			d.conferences.split(",").forEach(function(d) {autoCompleteTags[d] = true;});
			d.authors.split(",").forEach(function(d) {autoCompleteTags[d] = true;});
			d.phrases.split(",").forEach(function(d) {autoCompleteTags[d] = true;});
			//Object.keys(d.years).forEach(function(d) {autoCompleteTags[d] = true;});
		});
		autoCompleteTags = Object.keys(autoCompleteTags);
	});
}

function changeZoomWindow(factor) {
	zoomFactor = factor;
	zoomWindow = {w: bigW / zoomFactor, h: bigH / zoomFactor};
	myWindow.attr("width", zoomWindow.w).attr("height", zoomWindow.h);
}
		
function zoom(px, py) {
	if (px < 0 || px > miniW || py < 0 || py > miniH) return;
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

function calculateColor(score) {
	if (typeof(score) === 'undefined') return 'white';
	var red = 255;
	var green = Math.floor((1 - score)*255);
	var blue = Math.floor((1 - score)*255);
	return 'rgb('+ red +',' + green + ',' + blue + ')';
}


});