var h = 1000
var w = 1000

//colors panel
var colors = d3.schemeRdBu[11];
legendElementWidth = 70;
var buckets = 9;
var circles = d3.select("#diagram").selectAll('circle');
var svgside = d3.select("body")
  .attr('height', h)
  .attr('width',  w)
  .append("id", "diagram")

var tooltip = d3.select("body").append("div")
  .attr("class", "tooltip")
  .style("opacity", 0);

var formatDecimalComma = d3.format(",.2f");

function datapick(d){
var datasets= ["/Databases/trans_matrix/Layer1_BC/" + d.data.identify]
var data = d3.csv(datasets,
    function(d) {
      return {
        "horizon": +d.x,
        "vertical": +d.y,
        "pcomp" : +d.pcomp};
      },

      function plot(data) {

      var circles = d3.select("#diagram").selectAll('circle')
      .data(data, function(d) {return d.horizon +':'+ d.vertical});
      var colorScale = d3.scaleQuantile()
          .domain([d3.min(data, function (d) { return d.pcomp;}), buckets , d3.max(data, function (d) { return d.pcomp;})])
          .range(colors);


      circles.enter()
      .append('circle')
      .attr('cx',function (d) { return ((1000/9272) * d.vertical)})
      .attr('cy',function (d) { return ((1000/9272) * d.horizon) })
      .attr('r','10')
      .attr('fill', function (d) { return colorScale(d.pcomp) })
      .attr( "fill-opacity", "0.8")
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
          .style("opacity", 0);})
      circles.exit().remove()
      circles.transition()
      .duration(500)
      .attr('cx',function (d) { return ((1000/9272) * d.vertical)})
      .attr('cy',function (d) { return ((1000/9272) * d.horizon) })
      .attr('r','10')
      .attr('fill', function (d) { return colorScale(d.pcomp) })
      .attr( "fill-opacity", "0.8");
      });
    };

var legend = d3.select("#diagram").selectAll(".legend")
            .data(colors);
    legend.enter()
          .append("rect")
          .attr("x", function(d, i) { return legendElementWidth * i; })
          .attr("y", h-20 )
          .attr("width", legendElementWidth)
          .attr("height", 20)
          .style("fill", function(d, i) { return colors[i]; });
