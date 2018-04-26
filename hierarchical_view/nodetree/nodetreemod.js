var height   = 1200,
  width = 1080;

var formatNumber = d3.format(",d");

var color = ['#00ffff','#1bf7f7','#30f0ef','#3fe8e7','#4be0df',
    '#55d8d7','#5dd0cf','#64c7c7','#69c0bf','#6eb7b7','#73b0af',
    '#76a8a7','#79a09f','#7c9797','#7d908f','#7f8787','#808080'];

var colorScale = d3.scaleQuantize()
    .domain([0.05,0.25])
    .range(color);

var tree = d3.cluster()
    .size([2 * Math.PI, 500])
    .separation(function(a, b) { return (a.parent == b.parent ? 1 : 2) / a.depth; });

var stratify = d3.stratify()
    .parentId(function(d) { return d.id.substring(0, d.id.lastIndexOf(".")); });

var svg = d3.select("body").append("svg")
    .attr("width", width)
    .attr("height", height)
  .append("g")
    .attr("transform", "translate(" + (width / 2 + 40) + "," + (height / 2 + 90) + ")");

// Define the zoom function for the zoomable tree
function zoom() {
          svg.attr("transform", "translate(" + d3.event.translate + ")scale(" + d3.event.scale + ")");
      }
// define the zoomListener which calls the zoom function on the "zoom" event constrained within the scaleExtents
  var zoomListener = d3.behavior.zoom().scaleExtent([0.1, 3]).on("zoom", zoom);



d3.select("#json_sources").on('change', draw)
function draw() {
    source = d3.select("#json_sources").property('value')

d3.json(source, function(error, data) {
    if (error) throw error;
    var root = d3.hierarchy(data)
    tree(root);
    var link = svg.selectAll(".link")
   .data(root.links())
   .enter().append("path")
     .attr("class", "link")
     .attr("d", d3.linkRadial()
         .angle(function(d) { return d.x; })
         .radius(function(d) { return d.y; }))
    .call(zoomListener)


    var node = svg.selectAll(".node")
        .data(root.descendants())
        .enter().append("g")
        .attr("class", function(d) { return "node" + (d.children ? " node--internal" : " node--leaf"); })
        .attr("transform", function(d) { return "translate(" + radialPoint(d.x, d.y) + ")"; });

        node.append("circle")
            .attr("r", 2.5)
            .style("fill", function(d) {
              return colorScale((d.children ? d : d.parent).data.explained_ratios);
              })

        node.append("text")
            .attr("dy", "0.31em")
            .attr("x", function(d) { return d.x < Math.PI === !d.children ? 6 : -6; })
            .attr("text-anchor", function(d) { return d.x < Math.PI === !d.children ? "start" : "end"; })
            .attr("transform", function(d) { return "rotate(" + (d.x < Math.PI ? d.x - Math.PI / 2 : d.x + Math.PI / 2) * 180 / Math.PI + ")"; })
            .text(function(d) { return d.data.source; });
});

function radialPoint(x, y) {
    return [(y = +y) * Math.cos(x -= Math.PI / 2), y * Math.sin(x)];}
}
