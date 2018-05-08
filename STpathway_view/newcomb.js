var h = 1000
var w = 1000

var colors = ["#ffffd9","#edf8b1","#c7e9b4","#7fcdbb","#41b6c4","#1d91c0","#225ea8","#253494","#081d58"]
legendElementWidth = 70;
var buckets = 9;
var svgside = d3.select("body")
  .attr('height', h)
  .attr('width',  w)
  .append("id", "diagram")

var tooltip = d3.select("body").append("div")
  .attr("class", "tooltip")
  .style("opacity", 0);

var formatDecimalComma = d3.format(",.2f");

var legend = d3.select("#diagram").selectAll(".legend")
            .data(colors);
    legend.enter()
          .append("rect")
          .attr("x", function(d, i) { return legendElementWidth * i; })
          .attr("y", h-20 )
          .attr("width", legendElementWidth)
          .attr("height", 20)
          .style("fill", function(d, i) { return colors[i]; });


var width = 960,Humlegården
    height = 700,
    radius = (Math.min(width, height) / 2) - 10;


var formatNumber = d3.format(",d");

var x = d3.scaleLinear()
    .range([0, 2 * Math.PI]);

var y = d3.scaleSqrt()
    .range([0, radius]);

var b = {w: 115, h: 30, s: 3, t: 10};

var color = ['#00ffff','#1bf7f7','#30f0ef','#3fe8e7','#4be0df',
    '#55d8d7','#5dd0cf','#64c7c7','#69c0bf','#6eb7b7','#73b0af',
    '#76a8a7','#79a09f','#7c9797','#7d908f','#7f8787','#808080'];

var colorScale = d3.scaleQuantize()
    .domain([0,0.2,0.3,1])
    .range(color);

var partition = d3.partition();

var arc = d3.arc()
    .startAngle(function(d) { return Math.max(0, Math.min(2 * Math.PI, x(d.x0))); })
    .endAngle(function(d) { return Math.max(0, Math.min(2 * Math.PI, x(d.x1))); })
    .innerRadius(function(d) { return Math.max(0, y(d.y0)); })
    .outerRadius(function(d) { return Math.max(0, y(d.y1)); });

var svg = d3.select("body").append("svg")
    .attr("width", width)
    .attr("height", height)
  .append("g")
    .attr("id", "container")
    .attr("transform", "translate(" + width / 2 + "," + (height / 2) + ")");

var breadcrumb = d3.breadcrumb()
    .container('svg').wrapWidth(width * 2/3)

var img= document.createElement("img");


//main fuction start
d3.select("#json_sources").on('change', draw)
function draw() {
    initializeBreadcrumbTrail();
    var d = document.getElementById("json_sources");
    svg.selectAll('path').remove();
    svg.selectAll("img").remove();
    var source = d.options[d.selectedIndex].dataset["value"];

    //insert histological image by DOM
    img.src = d.options[d.selectedIndex].dataset["div"];
    src = document.getElementById("image");
    img.width=1000;
    src.append(img);


    d3.json(source, function(error, root) {
        if (error) throw error;

        roots = d3.hierarchy(root)
        roots.sum(function(d) { return d.children ? 0 : d.ngenes; });

        svg.selectAll("path")
           .data(partition(roots).descendants())
           .enter().append("path")
           .attr("d", arc)
           .style("fill", function(d) { return colorScale((d.children ? d : d.parent).data.explained_ratios); })
           .on("click", click)
           .on('mouseover', mouseover)
        .append("title")
          .text(function(d) { return "pathway name:  " + d.data.source + "\n" + "q:  " + parseFloat(d.data.explained_ratios) +
          "\n" + "description:  " + d.data.description });
    });

    function click(d) {
            svg.transition()
            .duration(750)
          .selectAll("path")
            .attrTween("d", arcTween(d))
            return datapick(d)};


    function arcTween(d) {
      var xd = d3.interpolate(x.domain(), [d.x0, d.x1]),
          yd = d3.interpolate(y.domain(), [d.y0, 1]),
          yr = d3.interpolate(y.range(), [d.y0 ? 20 : 0, radius]);
        return function(d, i) {
          return i
              ? function(t) { return arc(d); }
              : function(t) {
                  x.domain( xd(t) );
                  y.domain( yd(t) ).range( yr(t) );
                  return arc(d);
              };
        };
    };
    d3.select("#container").on("mouseleave", mouseleave)


function getAncestors(node) {
  var path = [];
  var current = node;
  while (current.parent) {
    path.unshift(current);
    current = current.parent;
  }
  return path;
};

// Fade all but the current sequence, and show it in the breadcrumb trail.
function mouseover(d) {
   var sequenceArray = getAncestors(d);
   updateBreadcrumbs(sequenceArray);
  d3.selectAll("path")
      .style("opacity", 0.4);
  // Then highlight only those that are an ancestor of the current segment.
  svg.selectAll("path")
      .filter(function(node) {
                return (sequenceArray.indexOf(node) >= 0);
              })
      .style("opacity", 1);
}

function mouseleave(d) {

  // Hide the breadcrumb trail
  d3.select("#trail")
      .style("visibility", "hidden");

  // Deactivate all segments during transition.
  d3.selectAll("path").on("mouseover", null);

  // Transition each segment to full opacity and then reactivate it.
  d3.selectAll("path")
      .transition()
      .duration(200)
      .style("opacity", 1)
      .on("end", function() {
              d3.select(this).on("mouseover", mouseover);
            });
};

//breadcrumb functions
function initializeBreadcrumbTrail() {
  // Add the svg area.
  var trail = d3.select("#sequence").append("svg:svg")
      .attr("width", width)
      .attr("height", 50)
      .attr("id", "trail");
  // Add the label at the end, for the percentage.
  trail.append("svg:text")
    .attr("id", "endlabel")
    .style("fill", "#000");
}

function initializeBreadcrumbTrail() {
  // Add the svg area.
  var trail = d3.select("#sequence").append("svg:svg")
      .attr("width", width)
      .attr("height", 50)
      .attr("id", "trail");
  // Add the label at the end, for the percentage.
  trail.append("svg:text")
    .attr("id", "endlabel")
    .style("fill", "#000");
}
// Generate a string that describes the points of a breadcrumb polygon.
function breadcrumbPoints(d, i) {
  var points = [];
  points.push("0,0");
  points.push(b.w + ",0");
  points.push(b.w + b.t + "," + (b.h / 2));
  points.push(b.w + "," + b.h);
  points.push("0," + b.h);
  if (i > 0) { // Leftmost breadcrumb; don't include 6th vertex.
    points.push(b.t + "," + (b.h / 2));
  }
  return points.join(" ");
}

// Update the breadcrumb trail to show the current sequence and percentage.
function updateBreadcrumbs(nodeArray) {
  // Data join; key function combines name and depth (= position in sequence).
  var g = d3.select("#trail")
      .selectAll("g")
      .data(nodeArray, function(d) { return d.data.source + d.depth; });
  // Add breadcrumb and label for entering nodes.
  var entering = g.enter().append("svg:g");
  entering.append("svg:polygon")
      .attr("points", breadcrumbPoints)
      .style("fill", function(d) { return colorScale((d.children ? d : d.parent).data.explained_ratios); });

  entering.append("svg:text")
      .attr("x", (b.w + b.t) / 2)
      .attr("y", b.h / 2)
      .attr("dy", "0.35em")
      .attr("text-anchor", "middle")
      .text(function(d) { return d.data.source; });

  // Set position for entering and updating nodes.
  g.attr("transform", function(d, i) {
    return "translate(" + i * (b.w + b.s) + ", 0)";
  });

  // Remove exiting nodes.
  g.exit().remove();

  // Make the breadcrumb trail visible, if it's hidden.
  d3.select("#trail")
      .style("visibility", "");
    }
};

d3.select(self.frameElement).style("height", height + "px");

function datapick(d){
var datasets= ["/Databases/trans_matrix/Layer1_BC/" + d.data.identify]
var datab = d3.csv(datasets,
    function(d) {
      return {
        "horizon": +d.x,
        "vertical": +d.y,
        "pcomp" : +d.pcomp};
      },

      function plot(datab) {

      var circles = d3.select("#diagram").selectAll('circle')
      .data(datab, function(d) {return d.horizon +':'+ d.vertical});
      var colorScale = d3.scaleQuantile()
          .domain([0, buckets , d3.max(datab, function (d) { return d.pcomp;})])
          .range(colors);
      circles.exit().remove();
      circles.enter()
      .append('circle')
      .on('mouseover', function (d) {
        d3.select(this)
          .transition()
          .duration(300)
          .attr('r',20)
          .attr('stroke-width',3);
        tooltip.transition()
          .duration(200)
          .style("opacity", .9);
        tooltip.html("principal component: " + "<br/>"  + formatDecimalComma(d.pcomp))
          .style("left", (d3.event.pageX) + "px")
          .style("top", (d3.event.pageY - 28) + "px");
      })
      .on('mouseout', function () {
        d3.select(this)
          .transition()
          .duration(300)
          .attr('r',10)
          .attr('stroke-width',1)
        tooltip.transition()
          .duration(500)
          .style("opacity", 0);
      })
      circles.transition().duration(1000)
      .attr('cx',function (d) { return ((1000/9272) * d.vertical)})
      .attr('cy',function (d) { return ((1000/9272) * d.horizon) })
      .attr('r','10')
      .attr('fill', function (d) { return colorScale(d.pcomp) })
      .attr( "fill-opacity", "0.8");
      });
    };
