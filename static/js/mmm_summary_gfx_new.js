class mmm_summary_gfx {
    constructor(id, colorScale, headings = ["min", "med", "max"], index='pair') {
        this.index=index;
        this.colorScale = colorScale;
        this.headings = headings;
        this.margin = {top: 30, right: 10, bottom: 10, left: 100};
        this.width = 400;
        this.height = 300;

        this.svg = d3.select("#" + id).append("svg")
            .attr("width", this.width + this.margin.left + this.margin.right)
            .attr("height", this.height + this.margin.bottom + this.margin.top);

        this.g = this.svg.append("g")
            .attr("transform", "translate(" + this.margin.left + "," + this.margin.top + ")");

        this.g.append("g").attr("class", "xAxis");
        this.g.append("g").attr("class", "yAxis");

        this.xScale = d3.scaleBand().range([0, this.width]);
        this.yScale = d3.scaleBand().range([this.height, 0]);
    }

    build_summary(json) {
        this.xScale.domain(this.headings);
        this.yScale.domain(d3.set(json.map(d => d[this.index])).values());

        let data_set = [];
        for (let idx in json) {
            let d = json[idx];
            for (let h in this.headings) {
                let hdr = this.headings[h];
                data_set.push({idx: d[this.index], key: hdr, val: d[hdr]});
            }
        }

        let card_size = {
            width: this.xScale.bandwidth(),
            height: this.yScale.bandwidth(),
            padding: 0.5
        };

        let cards = this.g.selectAll(".card")
            .data(data_set);

        let card = cards.enter()
            .append('g')
            .attr('class', 'card')
            .attr("transform",
                d => "translate(" + (this.xScale(d.key) + card_size.padding) + "," + (this.yScale(d.idx) + card_size.padding) + ")");

        if ("on_click" in this) {
            card.on("click", this.on_click);
        }

        card.append('rect')
            .attr('width', card_size.width - 2 * card_size.padding)
            .attr('height', card_size.height - 2 * card_size.padding)
            .attr('fill', d => this.colorScale(d.val));

        card.append('text')
            .attr("class", "below")
            .attr("x", card_size.width / 2 + card_size.padding)
            .attr("dy", "1.2em")
            .attr("font-size", 10)
            .attr("text-anchor", "middle")
            .text(function (d) {
                return d.val.toFixed(2);
            })
            .style("fill", "white");

        let xAxis = d3.axisTop(this.xScale);
        this.g.select(".xAxis")
            .call(xAxis);

        let yAxis = d3.axisLeft(this.yScale);
        this.g.select(".yAxis")
            .call(yAxis);

    }

}
