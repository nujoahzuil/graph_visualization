class ForceDirectedGraph {

    /**
     * Class constructor with basic chart configuration
     * @param {Object}
     * @param {Array}
     */
    constructor(_config, _data) {
      this.config = {
        parentElement: _config.parentElement,
        containerWidth: 800,
        containerHeight: 800,
        margin: {top: 25, right: 20, bottom: 20, left: 35}
      }
      this.data = _data;
      this.initVis();
    }
  
    /**
     * We initialize scales/axes and append static elements, such as axis titles.
     */
    initVis() {
      let vis = this;
      // Calculate inner chart size. Margin specifies the space around the actual chart.
      vis.config.width_l = vis.config.containerWidth - vis.config.margin.left - vis.config.margin.right;
      vis.config.height_l = vis.config.containerHeight - vis.config.margin.top - vis.config.margin.bottom;
  
      vis.colorScale = d3.scaleOrdinal(d3.schemeTableau10);

      // Define size of SVG drawing area
      vis.local = d3.select(vis.config.parentElement).append('svg')
          .attr('width', vis.config.containerWidth)
          .attr('height', vis.config.containerHeight)
          .attr('id','local');  
      // Append group element that will contain our actual chart 
      // and position it according to the given margin config
      //text
      vis.tooltip = vis.local
      .selectAll("div")
      .data(vis.data.nodes)
      .enter()
      .append("text")
      .text(d => d.id)
      .attr("font-size", 10)
      //.append("div")
  
      vis.link = vis.local
      .selectAll("line")
      .data(vis.data.links)
      .enter()
      .append("line")

      vis.link
        .style("stroke", "#black")
        .style("stroke-width", d => d.value/5)

      vis.node = vis.local
      .selectAll("circle")
      .data(vis.data.nodes)
      .enter()
      .append("circle")
      
      vis.node
        .attr("r", 6)
        .attr("stroke", "black")
        .attr('fill', d => vis.colorScale(d.group));
  
      vis.node.on("mouseover", fadeover)
        .on("mouseout", fadeout)

        function fadeover(e, node0) {
            // To DO
            vis.pos = d3.pointer(e);
            vis.tooltip.attr("opacity", function (d) { return (vis.isConnected(node0.id, d.id) || node0.id == d.id) ? 1 : 0; })
            vis.node.attr("opacity", function (d) { return (vis.isConnected(node0.id, d.id) || node0.id == d.id) ? 1 : 0.3; })
            vis.link.attr("opacity", function (d) { return ((d.source.id == node0.id) || (d.target.id == node0.id)) ? 1 : 0.3; })
        }
        function fadeout(e) {
            // To DO
            vis.pos = d3.pointer(e);
            vis.node.attr("opacity", 1)
            vis.tooltip.attr("opacity", 0)
            vis.link.attr("opacity", 1)
        }

      // define force simulation
  
      // To DO
      vis.simulation = d3.forceSimulation(vis.data.nodes)                 // Force algorithm is applied to data.nodes
      .force("link", d3.forceLink()                               // This force provides links between nodes
        .id(function(d) { return d.id; })                     // This provide  the id of a node
        .links(vis.data.links)                                    // and this the list of links
      )
      .force("charge", d3.forceManyBody())         // This adds repulsion between nodes. Play with the -400 for the repulsion strength
      .force("center", d3.forceCenter(vis.config.width_l / 2, vis.config.height_l / 2))     // This force attracts nodes to the center of the svg area
      //.force("center",  d3.forceCenter())
      .on("tick", ticked);
  
      // This function is run at each iteration of the force algorithm, updating the nodes position.
      function ticked() {
        vis.link
          .attr("x1", function(d) { return d.source.x; })
          .attr("y1", function(d) { return d.source.y; })
          .attr("x2", function(d) { return d.target.x; })
          .attr("y2", function(d) { return d.target.y; });
  
        vis.node
           .attr("cx", function(d) { return d.x; })
           .attr("cy", function(d) { return d.y; });

        vis.tooltip
           .attr("x", d => d.x+5)
           .attr("y", d => d.y-7)
           .attr("opacity", 0)
      }
      vis.linkedByIndex = {};

      // Build a dictionary (i.e., linkedByIndex) which will be used in isConnected function
  
      // To DO
  
  
      for (var i = 0; i < 254; i++) {
        if (vis.linkedByIndex[vis.data.links[i].target.id] == undefined) {
          vis.linkedByIndex[vis.data.links[i].target.id] = [vis.data.links[i].source.id]
        }
        else {
          vis.linkedByIndex[vis.data.links[i].target.id].push(vis.data.links[i].source.id)
        }
        if (vis.linkedByIndex[vis.data.links[i].source.id] == undefined) {
          vis.linkedByIndex[vis.data.links[i].source.id] = [vis.data.links[i].target.id]
        }
        else {
          vis.linkedByIndex[vis.data.links[i].source.id].push(vis.data.links[i].target.id)
        }
      }
  
    }
  
    /**
     * Prepare the data and scales before we render it.
     */
    isConnected(a, b) {
      let vis = this;
      return vis.linkedByIndex[a].indexOf(b) != -1
    }
}
