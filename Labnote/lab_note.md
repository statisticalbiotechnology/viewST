# DD200x Master thesis Course
# Project notebook
## A visualization interface for spatial pathway regulation data
#### Yang Zhang (TIMBM)

---
#### 2018-3-15
The initial introduction of D3, Javascript and SVG has more or less finished, and now I need to go for advanced level of D3 those days.
The recent work highlight:

* Check the time scedule with Lukas
* Upload the project plan by monday  
* Figure out the Chart bar code of svg in d3.

Problem: .selectAll("rect") null

Solution: src="https://d3js.org/d3.v3.min.js" or cannot .attr all together

* circle use cx, cy. Rect use "x", "y".
* rbg need to be math.round
  "rgb(" + Math.round(d * 10) + ", 7, 26)";

*SVG element*
  "circle"- cx, cy, r ; "rect"- x,y,w,h

Scale function for x
  var xScale = d3.scale.linear()                     
                .domain([0, d3.max(dataset, function(d) { return d[0]; })])                     .range([0, w]);

for y
    var yScale = d3.scale.linear()                     
                .domain([0, d3.max(dataset, function(d) { return d[1]; })])                     .range([0, h]);

----
#### 2018-3-18

Revise the project plan, need to hand up Monday.

Start reading the Charpter 8 of Interactive book. Realize that for the expression data image, python will be needed.

----
#### 2018-3-19

New d3 function: .call()

The differences from .enter

    D3’s call() function takes the incoming selection , as received from the prior link in the chain, and hands that selection off to any function.

 So either:
  var xAxis = d3.svg.axis()
      .scale(xscale)
      .orient("bottom");
    svg.append("g")
    .call(xAxis);

Or
    svg.append("g")
    .call(d3.svg.axis()
    .scale(xScale)
    .orient("bottom")
    )

The differences between SVG code and CSS code

CSS:
    p {    color: olive; }

SVG
    text {    fill: olive; }

Set up Github Respiratory and join the Github group
----
#### 2018-3-20

Talked with Gustavo about his codes in Guthub.

As the conclusion: three major tasks can list as their difficulties:

* Connect the python plot with Json data in Javascript. (Or alternatively, just create plot in D3 geomapping)
* plot
* Pathway diagram.

Two things need to be settled as priority:  Look into spaital plot python file; Download data from reactome and ST website.

Questions due to the py file:

* gene_name_start = "ENSG0"
* Hugo2Ensembl2Reactome_All_Levels.txt

Try to intalling anaconda

----
#### 2018-3-21  

Running Gustavo's overlaid image's python code (modified to only access one tissue section).

Unknown error result in no image output. Trying to find solution by adapting the code.

Thinking to use ST view in spatialTranscriptmic website as well.
