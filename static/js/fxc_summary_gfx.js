class fxc_summary_gfx {
    constructor() {
        this.margin = {top: 75, right: 75, bottom: 75, left: 75};
        this.width = 600 - this.margin.left - this.margin.right;
        this.height = 400 - this.margin.top - this.margin.bottom;

        let hgt = this.height + this.margin.bottom + this.margin.top;
        let wdt = this.width + this.margin.left + this.margin.right;

        this.svg = d3.select("#fxc_summary_chart").append("svg")
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

    build_fxc_dp_summary(json) {
        this.xScale.domain(d3.set(json.map(d => d.TENOR_PT)).values());
        this.yScale.domain(d3.set(json.map(d => d.PAIR)).values());

        let qntScale = d3.scaleQuantile()
            .domain([4, 10])
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

        let trans = d3.transition()
            .duration(750);

        let cards = this.g.selectAll(".lch_card")
            .data(json);

        cards.transition(trans)
            .attr('x', d => this.xScale(d.TENOR_PT) + card_size.padding)
            .attr('y', d => this.yScale(d.PAIR) + card_size.padding)
            .attr('width', card_size.width - 2 * card_size.padding)
            .attr('height', card_size.height - 2 * card_size.padding)
            .attr('fill', d => colourScale(d.MIN_SUBS));

        let card = cards.enter()
            .append('rect')
            .attr('class', 'lch_card')
            .attr('x', d => this.xScale(d.TENOR_PT) + card_size.padding)
            .attr('y', d => this.yScale(d.PAIR) + card_size.padding)
            .attr('width', card_size.width - 2 * card_size.padding)
            .attr('height', card_size.height - 2 * card_size.padding)
            .attr('fill', d => colourScale(d.MIN_SUBS))

        if ("on_click" in this) {
            card.on("click", this.on_click);
        }

        cards.exit()
            .transition(trans)
            .remove();

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
            .text("Minimum Number of Submissions");
    }
}


