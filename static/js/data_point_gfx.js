class data_point_gfx {
    constructor(id) {
        this.margin = {top: 35, right: 35, bottom: 35, left: 35};
        this.width = 550 - this.margin.left - this.margin.right;
        this.height = 350 - this.margin.top - this.margin.bottom;
        this.chart_title = id;

        this.svg = d3.select("#" + id).append("svg")
            .attr("width", this.width + this.margin.left + this.margin.right)
            .attr("height", this.height + this.margin.top + this.margin.bottom);

        this.g = this.svg.append("g")
            .attr("transform", "translate(" + this.margin.left + "," + this.margin.top + ")");

        this.g.append("g").attr("class", "xAxis");
        this.g.append("g").attr("class", "yAxis");

        this.date_parser = d3.timeParse("%Q")
        this.xScale = d3.scaleTime().range([0, this.width]);
        this.yScale = d3.scaleLinear().range([this.height, 0]);

        this.tooltip = d3.select("body").append("div")
            .attr("class", "tooltip")
            .style("opacity", 0);
    }


    data_pt_sub_chart(json) {

        console.log(json);

        let time_series = json;
        let data_set = [];

        for (let idx in time_series) {
            let ts_pt = time_series[idx];
            for (let v in ts_pt.subs) {
                data_set.push({
                    time_stamp: this.date_parser(ts_pt.time_stamp),
                    bid: ts_pt.subs[v].bid,
                    mbr: ts_pt.subs[v].mbr,
                    ask: ts_pt.subs[v].ask,
                    bid_zcs: ts_pt.subs[v].bid_zcs,
                    ask_zcs: ts_pt.subs[v].ask_zcs
                })
            }
        }
        let data = data_set;

        let x_rng = d3.extent(data, d => d.time_stamp);
        let bid_rng = d3.extent(data, d => d.bid);
        let ask_rng = d3.extent(data, d => d.ask);
        let y_rng = d3.extent(bid_rng.concat(ask_rng));

        this.xScale.domain(x_rng);
        this.yScale.domain(y_rng);

        let xAxis = d3.axisBottom(this.xScale);
        let yAxis = d3.axisLeft(this.yScale);

        let trans = d3.transition()
            .duration(750);

        // ----------- dumbbells ---------

        let dumbbells = this.g.selectAll(".dumbbell")
            .data(data);

        dumbbells.exit()
            .transition(trans)
            .remove();

        dumbbells.select(".dumbAsk")
            .transition(trans)
            .attr("cx", (d, i, dd) => this.xScale(d.time_stamp))
            .attr("cy", d => this.yScale(d.ask));

        dumbbells.select(".dumbBid")
            .transition(trans)
            .attr("cx", d => this.xScale(d.time_stamp))
            .attr("cy", d => this.yScale(d.bid));

        dumbbells.select(".dumbBo")
            .transition(trans)
            .attr("x1", d => this.xScale(d.time_stamp))
            .attr("y1", d => this.yScale(d.ask))
            .attr("x2", d => this.xScale(d.time_stamp))
            .attr("y2", d => this.yScale(d.bid));

        let g_dumb = dumbbells.enter()
            .append("g")
            .attr("class", "dumbbell");

        g_dumb.append("circle")
            .attr("class", 'dumbAsk')
            .attr("cx", d => this.xScale(d.time_stamp))
            .attr("cy", d => this.yScale(d.ask))
            .attr("r", 2);

        g_dumb.append("circle")
            .attr("class", 'dumbBid')
            .attr("cx", d => this.xScale(d.time_stamp))
            .attr("cy", d => this.yScale(d.bid))
            .attr("r", 2);

        g_dumb.append('line')
            .attr("class", 'dumbBo')
            .attr('x1', d => this.xScale(d.time_stamp))
            .attr('x2', d => this.xScale(d.time_stamp))
            .attr('y1', d => this.yScale(d.ask))
            .attr('y2', d => this.yScale(d.bid));

        let tooltip = d3.select("body").append("div")
            .attr("class", "tooltip")
            .style("opacity", 0);

        g_dumb.on("mouseover", function (d) {
            tooltip.transition()
                .duration(200)
                .style("opacity", .9);
            tooltip.html("<b>Member: </b>" + d.mbr + "<br/><b>Bid: </b>" + d.bid + "<br/><b>Ask: </b>" + d.ask)
                .style("left", (d3.event.pageX) + "px")
                .style("top", (d3.event.pageY - 50) + "px");
        });
        g_dumb.on("mouseout", function () {
            tooltip.transition()
                .duration(500)
                .style("opacity", 0);
        });

        // ------ Line path ------

        let area = d3.area()
            .x0(d => this.xScale(d.time_stamp))
            .y0(d => this.yScale(d.bid_lch))
            .x1(d => this.xScale(d.time_stamp))
            .y1(d => this.yScale(d.ask_lch))
            .curve(d3.curveNatural);

        let lch_line = this.g.selectAll(".bidline")
            .data([time_series], d => d);

        lch_line.exit()
            .transition(trans)
            .remove();

        lch_line.transition(trans)
            .attr("d", area);

        lch_line.enter()
            .append("path")
            .attr("class", "bidline")
            .attr("d", area);   //d => bid_interp(d));

        // ------------------------

        this.g.select(".xAxis")
            .attr("transform", "translate(0," + this.height + ")")
            .call(xAxis);

        this.g.select(".yAxis")
            .call(yAxis);

        this.g.append("text")
            .attr("class", "title")
            .attr("x", this.width / 2)
            .attr("y", 0 - (this.margin.top / 2))
            .attr("text-anchor", "middle")
            .text(this.chart_title);

    }

}
