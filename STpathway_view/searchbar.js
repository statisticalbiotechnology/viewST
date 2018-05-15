d3.select("#main").append("input").attr("id", "searchid").attr("value", "HomoSapiens");
d3.select("#main").append("button").attr("id", "searchbutton")
    .attr("type", "button")
    .text("search")
    .on('click', function () {
        if (d3.selectALL("path").data()[0].pathway_name == document.getElementById("searchid").value) {
            d3.selectALL("path").style("opacity", 1);

        } else {
            d3.selectALL("path").style("opacity", 0.4);
        }
    });
