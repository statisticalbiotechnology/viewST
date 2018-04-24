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

----
#### 2018-3-22

Continue debugging the  overlaid image's python code (STviewer.py)

Suspect the memory error problem may due to two factors:

* python 32bit instead of 64bit. Solution: reintalling python

* may caused problem by package scipy griddata. solition: looking into package tutorial.

STviewer.py successfully run, still need to adapt into multiple * tissue sections* and multiple pathways (up to 2000).

----
#### 2018-3-23

Set up desktop due to the lacking of RAM and desk storage of my laptop.

----
#### 2018-3-26

The gene express map has successfully yield last week.

Will try to add probe point according to Lukas suggestion.

And will try to plot the map in d3.(2 days limit, if not possible then give up)

----
#### 2018 -3-28

d3 plots of gene expression seems good: <plot.html>, the script has been successfully shows the csv table has transform into svg in HTML

Two job remaining at the moment:
git config --global user.email "you@example.com"
* figure out the scale of colorScale

 overlay the tissue image.

 And ask Lukas about the detail demands of interface.

----
#### 2018-3-29

Found out the scaling function of d3 is not really suitable for overlapping svg to jpg, since it will resize the x,y coordinates.

Use the original size (svg:10000*10000) to match with the tissue jpg file,  the overlapping is just adjust by html(css).  However, unknown error conduct the lapping has deviation.

Now the primary job is to resize the html size to a reasonable range. Then try to fit in multiple svg data into the webpage.

The shift of multiple svg data remaining undone.

----
#### 2018-4-03

Trying to continue figuring out the shift between to svg data.

----
#### 2018-4-04

The transition(shift) in the d3 webpage for two sets of pathway data has been finished.

Now the job comes to adapt the whole databases into the diagram.

----
#### 2018-4-05

Fixed an error call on the console due to the misplace of .on strings.

----
#### 2018-4-09

Set up desktop, ready to run large datasets in the codes.

Conclusions after the meeting:

* add tool tip in the svg layer to indicate the pcomp.

* tell the scale about color

* two views (subburst; node trees) combination.

----
#### 2018-4-10

Desktop crashed during uninstall python2.

----
#### 2018-4-11
Due to the repair of desktop, the treatment of large datasets need to be delay.

Instead, I start to look into the code of sunburst and node-tree plot first.
I am also trying to separate the .css, .js and .html in order to make the script easy readable.

Found out I need to build up the json data, which shows the hierarchical relationship as well as q value of pathways. Thus, will find a way to build up this data, either use d3.hierarchy or python code.

----
#### 2018-4-12 to 2018-4-16

Spend several days to treat series of datasets in order to creat the json matrix of sunburst diagram.

The final version of json matrix contains of three columns: Pathways; Ngenes; explained_ratios. The explained_ratios will be erplaced be other factors when any quality value is avaliable. However, it seems a description of each pathway can be good to include into the matrix. Moreover, there should some tags in the matrix that can link the sunburst diagram to double layer plots.

----
#### 2018-4-17

Trying to build up the js code for sunburst diagram. The partition of each arc is based on  the number of genes size, and the color scale is base on the explained_ratios, the reatio number of each pathway did not really indicate desired info, so the color distriburion of diagram did not really shows the expression level of each pathway in the tissue.

Another question is the zoomable view is not functioned in the html view for some reason.

----
#### 2018-4-18

Stuck in the zoomable view of sunburst diagram.

the desktop has finished repairement, setting up and transfer the files from laptop to desktop.

----
#### 2018-4-19

figure out the zoomable problem, bug happens at the
    var partition
part, due to unknown reason,there is .size string in the function which should not happen.

Now I meet another problem is the sunburst diagram has some logical problem itself, detailly say: when children has some overlap part of genes, thier sum up of ngenes will larger than the parent's ngenes. In order to figure out this bug in javascript, I think I need to try d3.v4 and adapt rest part of code into this version as well.

----
#### 2018-4-20

Figured out the unarrange of nodes problem by switch the code format from d3v3 to d3v4, and also the lengend has been added to the plot.

Created a fade away function, so when mouse point over certain arc position, other arcs will fade away.

----
#### 2018 -4-23

Shows the sunburst diagram in the meeting, however Lukas was more concerning about the "data update" part of my project.

Although  how this data update function will avhieve still remine unclear in detail, but generally I will create large frame of codes that can calls Gus' codes, combine with my part of code and then execute to generate the both plots.

----
#### 2018 -4-23

Still think to build up a node tree vision of hierarchy data, but modified codes will take time

Then apart from this, the major task for now is
 * combine sunburst with double layer plots.
 * Data update.
