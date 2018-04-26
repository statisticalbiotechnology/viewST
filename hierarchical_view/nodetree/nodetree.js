window.current_nodes = []

update = (source) ->
  # Compute the new tree layout.
  nodes = tree.nodes(root).reverse()
  links = tree.links(nodes)

  # Normalize for fixed-depth.
  nodes.forEach (d) ->
    d.y = d.depth * 80
  # Update the nodes…
  node = svg.selectAll("g.node").data(nodes, (d) ->
    d.id or (d.id = ++i)
  )

  # Enter any new nodes at the parent's previous position.
  nodeEnter = node.enter().append("g").attr("class", "node").attr("transform", (d) ->
  {}, "translate(" + source.y0 + "," + source.x0 + ")").on("mouseover", (d) ->

  ).on("click", (d) ->
    clicked_same_node = false
    if window.current_nodes.length > 0
      if d.id == window.current_nodes[window.current_nodes.length - 1][0].id
        clicked_same_node = true
        d3.event.stopPropagation()

    store_and_update(d) unless clicked_same_node

  )

  nodeEnter.append("circle").attr("r", 1e-6).style "fill", (d) ->
    (if d._children then "lightsteelblue" else "#fff")

  nodeEnter.append("text").attr("dy", ".31em").attr("text-anchor", (d) ->
    (if d.x < 180 then "start" else "end")
  ).attr("transform", (d) ->
    (if d.x < 180 then "translate(8)" else "rotate(180)translate(-8)")
  ).text (d) ->
    d.name

  # Transition nodes to their new position.
  nodeUpdate = node.transition().duration(duration).attr("transform", (d) ->
    "rotate(" + (d.x - 90) + ")translate(" + d.y + ")"
  )


  nodeUpdate.select("circle").attr("r", 10).style "fill", (d) ->
    (if d._children then "black" else "black")

  nodeUpdate.select("text").style("fill-opacity", 1).attr("dy", ".31em").attr("text-anchor", (d) ->
    (if d.x < 180 then "start" else "end")
  ).attr("transform", (d) ->
    (if d.x < 180 then "translate(8)" else "rotate(180)translate(-8)")
  )

  # Transition exiting nodes to the parent's new position.
  nodeExit = node.exit().transition().duration(duration).attr("transform", (d) ->
    "translate(" + source.y + "," + source.x + ")"
  ).remove()
  nodeExit.select("circle").attr "r", 1e-6
  nodeExit.select("text").style "fill-opacity", 1e-6

  # Update the links…
  link = svg.selectAll("path.link").data(links, (d) ->
    d.target.id
  )

  # Enter any new links at the parent's previous position.
  link.enter().insert("path", "g").attr("class", "link").attr "d", (d) ->
    o =
      x: source.x0
      y: source.y0

    diagonal
      source: o
      target: o

  # Transition links to their new position.
  link.transition().duration(duration).attr "d", diagonal

  # Transition exiting nodes to the parent's new position.
  link.exit().transition().duration(duration).attr("d", (d) ->
    o =
      x: source.x
      y: source.y

    diagonal
      source: o
      target: o

  ).remove()

  # Stash the old positions for transition.
  nodes.forEach (d) ->
    d.x0 = d.x
    d.y0 = d.y


construct_generations = (d) ->
  c = d             # make a clone of d.
  generations = []  # Array for each ancestors children. Will reconstruct later on body click
  while c.parent
    generations.push  c.parent.children
    c = c.parent
  generations


reform_focus = () ->
  if window.current_nodes.length > 0
    set = window.current_nodes.pop()
    d = set[0]
    count = 0
    d.parent._children = set[1]
    if d.parent._children
      while d.parent
        d.parent.children = set[1][count]
        count++
        d = d.parent
      update d




store_and_update = (d) ->
  window.current_nodes.push [d, construct_generations(d)]
  while d.parent
    # Back up original tree
    d.parent._children = d.parent.children
    # Filter out non line of site children
    d.parent.children =  [(_.find d.parent.children, (e) ->
      e.name == d.name
    )]
    d = d.parent
  d3.event.stopPropagation()
  update d

reconstruct_ancestors = (n, generations) ->
  count = generations.length - 1
  while n.parent
    n.parent.children = generations[count]
    count-=1
    n = n.parent
  n


$("body").click ->
  reform_focus()

diameter = 720
height   = diameter - 150
radius = diameter / 2
root = undefined
tree = d3.layout.tree().size([
  360
  radius - 120
])


i = 0
duration = 2000
diagonal = d3.svg.diagonal.radial().projection((d) ->
  [
    d.y
    d.x / 180 * Math.PI
  ]
)

zoom = ->
  svg.attr "transform", "translate(" + d3.event.translate + ")scale(" + d3.event.scale + ")"

div = d3.select("#focus")

svg = div.insert("svg").attr("viewbox", "0 0 " + diameter / 2 + "," + diameter / 2).attr("width", "900px").attr("height", "100%").append("g").attr("transform", "translate(" + diameter / 2 + "," + diameter / 2 + ")").append("g").call(d3.behavior.zoom().scaleExtent([
  1
  8
]).on("zoom", zoom))

root = treeData[0]
root.x0 = height / 2
root.y0 = 0
update root
