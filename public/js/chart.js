import * as d3 from "https://cdn.jsdelivr.net/npm/d3@7/+esm";

export function renderCongestionChart(trend) {
  const svg = d3.select("#congestion-chart");
  svg.selectAll("*").remove();

  const width = svg.node().clientWidth;
  const height = svg.node().clientHeight;
  const margin = { top: 20, right: 20, bottom: 30, left: 40 };

  const x = d3
    .scalePoint()
    .domain(trend.map((d) => d.time))
    .range([margin.left, width - margin.right]);

  const y = d3
    .scaleLinear()
    .domain([0, 100])
    .range([height - margin.bottom, margin.top]);

  const line = d3
    .line()
    .x((d) => x(d.time))
    .y((d) => y(d.value));

  svg
    .append("path")
    .datum(trend)
    .attr("fill", "none")
    .attr("stroke", "black")
    .attr("stroke-width", 2)
    .attr("d", line);

  svg
    .append("g")
    .attr("transform", `translate(0, ${height - margin.bottom})`)
    .call(d3.axisBottom(x));

  svg
    .append("g")
    .attr("transform", `translate(${margin.left}, 0)`)
    .call(d3.axisLeft(y));
}