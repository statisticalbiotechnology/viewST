var width = 1000,
    height = 1000,
    radius = (Math.min(width, height) / 2.1) - 10;

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
    .container('#sequence').wrapWidth(width * 2/3)


var img= document.createElement("img");

d3.select("body").append("input").attr("id", "searchid").attr("value", "HomoSapiens");



//main fuction start
d3.select("#json_sources").on('change', draw)
function draw() {
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
           //.on('mouseover', mouseover)
        .append("title")
          .text(function(d) { return "pathway name:  " + d.data.source + "\n" + "q:  " + parseFloat(d.data.explained_ratios) +
          "\n" + "description:  " + d.data.description })

        document.getElementById("searchbutton").addEventListener("click",highlight);
        function highlight(){
          d3.selectAll("path")
              .style("stroke", "white")
              .style("stroke-width", 3)
              .style("stroke-opacity", .4);
        var highlight = d3.selectAll("path")
         .filter(function(d) { return d.data.source === document.getElementById("searchid").value });
         highlight.transition()
         .duration(700)
         .style("stroke", "red")
         .style("stroke-width", 7);};

         document.getElementById("Reset").addEventListener("click", reset);
         function reset(){svg.transition()
         .duration(1000)
         .tween("scale", function() {
             var xd = d3.interpolate(x.domain(), [0, 0.31* Math.PI]),
                 yd = d3.interpolate(y.domain(), [0, 0.31* Math.PI]),
                 yr = d3.interpolate(y.range(), [0, radius]);
             return function(t) { x.domain(xd(t)); y.domain(yd(t)).range(yr(t)); };
         })
         .selectAll("path")
         .attrTween("d", function(d) { return function() { return arc(d); }; });
         };
         });

    function click(d) {
            svg.transition()
            .duration(1000)
            .tween("scale", function() {
    						var xd = d3.interpolate(x.domain(), [d.x0, d.x1]),
    								yd = d3.interpolate(y.domain(), [d.y0, 1]),
    								yr = d3.interpolate(y.range(), [d.y0 ? 20 : 0, radius]);
    						return function(t) { x.domain(xd(t)); y.domain(yd(t)).range(yr(t)); };
    				})
    				.selectAll("path")
    				.attrTween("d", function(d) { return function() { return arc(d); }; });
            return datapick(d)};



    d3.select("#container").on("mouseleave", mouseleave)
    d3.select(self.frameElement).style("height", height + "px")
};

// Fade all but the current sequence, and show it in the breadcrumb trail.
function mouseover(d) {
   var sequenceArray = d.ancestors().reverse();
   sequenceArray.forEach(function(a) {
     a.text = a.data.source;
     a.fill = '#73b0af';})
   breadcrumb.show(sequenceArray);
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

  // Deactivate all segments during transition.
  d3.selectAll("path").on("mouseover", null);

  // Transition each segment to full opacity and then reactivate it.
  d3.selectAll("path")
      .transition()
      .style("opacity", 1)
      .on("end", function() {
              d3.select(this).on("mouseover", mouseover);
            });
};
