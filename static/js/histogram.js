class Histogram {
    constructor(id) {
        this.frame = {width: 500, height: 300, margin: 50};
        let wdt= this.frame.width + 2 * this.frame.margin;
        let hgt = this.frame.height + 2 * this.frame.margin;

        this.svg = d3.select("#"+id)
            .append("svg")
            .attr("width", "100%")
            .attr("height", "100%")
            .attr('viewBox', "0 0 " + wdt + " " + hgt)
            .attr("version", "1.1")
            .attr("transform", "translate(" + this.frame.margin + "," + this.frame.margin + ")");
        this.svg.append("g").attr("class", "xAxis");
        this.svg.append("g").attr("class", "yAxis");
    }

    build_histogram(json) {
        function sortNumber(a, b) {
            return a - b;
        }

        let data_set = [];
        for (let scen in json) {
            data_set.push(+json[scen])
        }
        data_set.sort(sortNumber);

        let contributors = data_set.slice(0, 7);
        let im_est = d3.mean(contributors);

        let max_val = d3.max(data_set);
        let min_val = d3.min(data_set);
        let abs_max = d3.max([Math.abs(max_val), Math.abs(min_val)]);

        let histoChart = d3.histogram();
        let numBins = 50;

        let bins = histoChart
            .domain([-abs_max, abs_max])
            .thresholds(numBins)(data_set);

        let max_bin = d3.max(bins.map(x => x.length));

        let xScale = d3.scaleLinear()
            .domain([-abs_max, abs_max])
            .range([0, this.frame.width]);
        let yScale = d3.scaleLinear()
            .domain([max_bin, 0])
            .range([0, this.frame.height]);
        let colourScale = d3.scaleLinear()
            .domain([0, abs_max])
            .interpolate(d3.interpolateHcl)
            .range([d3.rgb("lightgreen"), d3.rgb("red")]);

        this.svg.selectAll("g.bar").remove();

        let line_data = [];
        for (var idx in bins) {
            let bin = bins[idx];
            line_data.push({x0: bin.x0, x1: bin.x1, len: bin.length})
        }

        let trend_interp = d3.line()
            .x(d => xScale((d.x0 + d.x1) * 0.5))
            .y(d => yScale(d.len))
            .curve(d3.curveCatmullRomOpen);

        let trend_line = this.svg.selectAll("g.line")
            .remove()
            .data([line_data])
            .enter()
            .append("g")
            .attr("class", "line");

        trend_line.append("path")
            .style("stroke", "black")
            .style("stroke-width", 1)
            .style("stroke-opacity", 0.5)
            .style("fill", "none")
            .style("fill-opacity", 0.5)
            .attr("d", trend_interp);

        trend_line.exit().remove();

        let bar = this.svg.selectAll("g.bar")
            .data(bins, d => d)
            .enter()
            .append("g")
            .attr("class", "bar")
            .attr("transform", function (d) {
                return "translate(" + xScale(d.x0) + "," + yScale(d.length) + ")";
            });

        bar.append("rect")
            .attr("x", 0)
            .attr("width", d => xScale(d.x1) - xScale(d.x0))
            .attr("height", d => this.frame.height - yScale(d.length))
            .style("fill", d => colourScale(Math.abs(d.x0)))
            .style("fill-opacity", 0.75);

        bar.exit().remove();

        this.svg.select(".yAxis")
            .attr("transform", "translate(" + this.frame.width + ",0)")
            .call(d3.axisRight(yScale));

        this.svg.select(".xAxis")
            .attr("transform", "translate(0," + this.frame.height + " )")
            .call(d3.axisBottom(xScale))
            .selectAll("text")
            .style("text-anchor", "end")
            .attr("dx", "-.8em")
            .attr("dy", ".15em")
            .attr("transform", "rotate(-65)");
    }

}
