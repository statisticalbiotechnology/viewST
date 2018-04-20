var width = 960,
    height = 700,
    radius = (Math.min(width, height) / 2) - 10;

var formatNumber = d3.format(",d");

var x = d3.scale.linear()
    .range([0, 2 * Math.PI]);

var y = d3.scale.sqrt()
    .range([0, radius]);

var color = ['#00ffff','#1bf7f7','#30f0ef','#3fe8e7','#4be0df',
    '#55d8d7','#5dd0cf','#64c7c7','#69c0bf','#6eb7b7','#73b0af',
    '#76a8a7','#79a09f','#7c9797','#7d908f','#7f8787','#808080'];

var colorScale = d3.scale.quantize()
    .domain([0.05,0.25])
    .range(color);



var partition = d3.layout.partition()
   .value(function(d) {return d3.nest(d.children ? 0 : d.ngenes)});

var arc = d3.svg.arc()
    .startAngle(function(d) { return Math.max(0, Math.min(2 * Math.PI, x(d.x))); })
    .endAngle(function(d) { return Math.max(0, Math.min(2 * Math.PI, x(d.x + d.dx))); })
    .innerRadius(function(d) { return Math.max(0, y(d.y)); })
    .outerRadius(function(d) { return Math.max(0, y(d.y + d.dy)); });


var svgs = d3.select("body").append("svg")
    .attr("width", width)
    .attr("height", height)
  .append("g")
    .attr("transform", "translate(" + width / 2 + "," + (height / 2) + ")");

var breadcrumb = d3.breadcrumb()
    .container('svg').wrapWidth(width * 2/3)


d3.select("#json_sources").on('change', draw)
function draw() {
    source = d3.select("#json_sources").property('value')
d3.json(source, function(error, root) {
    if (error) throw error;
    svgs.selectAll("path")
       .data(partition.nodes(root))
       .enter().append("path")
       .attr("d", arc)
       .style("fill", function(d) { return colorScale((d.children ? d : d.parent).explained_ratios); })
       .on("click", click)
    .append("title")
      .text(function(d) { return d.description + "\n" + formatNumber(d.explained_ratios); });
});

function click(d) {
      svgs.transition()
      .duration(750)
    .selectAll("path")
      .attrTween("d", arcTween(d));
};

function arcTween(d) {
  var xd = d3.interpolate( x.domain(), [d.x, d.x + d.dx] ),
      yd = d3.interpolate( y.domain(), [d.y, 1] ),
      yr = d3.interpolate( y.range(), [d.y ? 20 : 0,radius]);

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

};


d3.select(self.frameElement).style("height", height + "px");
