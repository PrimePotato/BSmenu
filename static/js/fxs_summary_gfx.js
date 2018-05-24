class fxs_summary_gfx {
    constructor(id) {
        this.margin = {top: 50, right: 10, bottom: 10, left: 75};
        this.width = 400;
        this.height = 300;

        let hgt = this.height + this.margin.bottom + this.margin.top;
        let wdt = this.width + this.margin.left + this.margin.right;

        this.svg = d3.select("#"+id).append("svg")
            .attr("width", "100%")
            .attr("height", "100%")
            .attr('viewBox', "0 0 " + wdt + " " + hgt)
            .attr('preserveAspectRatio', "xMidYMid meet");

        this.g = this.svg.append("g")
            .attr("transform", "translate(" + this.margin.left + "," + this.margin.top + ")");

        this.g.append("g").attr("class", "xAxis");
        this.g.append("g").attr("class", "yAxis");

        this.xScale = d3.scaleBand().range([0, this.width]);
        this.yScale = d3.scaleBand().range([this.height, 0]);
    }

    build_fxs_summary(json) {
        this.xScale.domain(["min", "med", "max"]);
        this.yScale.domain(d3.set(json.map(d => d.pair)).values());

        let data_set = [];
        for (let idx in json) {
            let d = json[idx];
            data_set.push({pair: d.pair, key: 'min', val: d['min']});
            data_set.push({pair: d.pair, key: 'max', val: d['max']});
            data_set.push({pair: d.pair, key: 'med', val: d['med']});
        }

        let qntScale = d3.scaleQuantile()
            .domain([3, 15])
            .range(d3.schemeRdYlGn[10]);

        let colourScale = function (d) {
            if (d < 0) {
                return "grey"
            }
            else {
                return qntScale(d)
            }
        };

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
                d => "translate(" + (this.xScale(d.key) + card_size.padding) + "," + (this.yScale(d.pair) + card_size.padding) + ")");

        if ("on_click" in this) {
            card.on("click", this.on_click);
        }

        card.append('rect')
            .attr('width', card_size.width - 2 * card_size.padding)
            .attr('height', card_size.height - 2 * card_size.padding)
            .attr('fill', d => colourScale(d.val));

        card.append('text')
            .attr("class", "below")
            .attr("x", card_size.width / 2 + card_size.padding)
            .attr("dy", "1.2em")
            .attr("font-size", 10)
            .attr("text-anchor", "middle")
            .text(function (d) {
                return d.val;
            })
            .style("fill", "white");

        let xAxis = d3.axisTop(this.xScale);
        this.g.select(".xAxis")
            .call(xAxis);

        let yAxis = d3.axisLeft(this.yScale);
        this.g.select(".yAxis")
            .call(yAxis);

        this.g.append("text")
            .attr("class", "title")
            .attr("x", this.width / 2)
            .attr("y", 0 - (this.margin.top / 2))
            .attr("text-anchor", "middle")
            .text("Spot Submission Summary");
    }


}
