import '../style.sass';

const width = '100%',
      height = '100%',
      url = 'https://d3js.org/world-50m.v1.json',
      url2 = 'https://raw.githubusercontent.com/FreeCodeCamp/ProjectReferenceData/master/meteorite-strike-data.json';

const zoom = d3.zoom()
        .scaleExtent([1, 9])
        .on("zoom", zoomed);

const projection = d3.geoMercator()
    .translate([400,400])
    .scale(300);
const path = d3.geoPath()
    .projection(projection);

const svg = d3.select('body').append("svg")
    .attr("width", width)
    .attr("height", height)
    .call(zoom);

const map = svg.append('g');
const meteorites = svg.append('g');

const tip = d3.tip()
  .attr('class', 'd3-tip')
  .offset([150, 110])
  .html((d, st) => {
    return `
    <ul>
        <li>fall: <strong>${d.properties.fall}</strong></li>
        <li>mass: <strong>${d.properties.mass}</strong></li>
        <li>name: <strong>${d.properties.name}</strong></li>
        <li>nametype: <strong>${d.properties.nametype}</strong></li>
        <li>recclass: <strong>${d.properties.recclass}</strong></li>
        <li>year: <strong>${new Date(d.properties.year).getFullYear()}</strong></li>
    </ul>
  `});

svg.call(tip);
d3.json(url, (error, data) => {
  map.selectAll('path')
      .data(topojson.feature(data, data.objects.countries).features)
      .enter()
      .append('path')
      .attr('fill', 'lightgreen')
      .attr('stroke', 'steelblue')
      .attr('d', path)
});

d3.json(url2, (error, data) => {
  let color = d3.scaleOrdinal(d3.schemeCategory20c),
      max = d3.max(data.features, (d) => Number(d.properties.mass)),
      min = d3.min(data.features, (d) => Number(d.properties.mass));
  
  let radius = d3.scaleLinear()
    .domain([min, max])
    .range([1.8, 40]);
  
  let opacity = d3.scaleLinear()
    .domain([min, max])
    .range([0.9, 0.5]);
  
  meteorites.selectAll('path')
    .data(data.features)
    .enter()
    .append('circle')
    .attr('class', 'punkt')
    .attr('cx', (d) => projection([d.properties.reclong,d.properties.reclat])[0])
    .attr('cy', (d) => projection([d.properties.reclong,d.properties.reclat])[1])
    .attr('r', (d) => radius(d.properties.mass))
    .attr('fill', (d) => color(d.properties.reclong))
    .attr('fill-opacity', (d) => opacity(d.properties.mass))
    .attr('stroke-width', 1)
    .attr('stroke', 'green') 
    .on('mouseover', (d) => tip.show(d))
    .on('mouseout', (d) => tip.hide(d));
})

function zoomed() {
  map.attr("transform", d3.event.transform);
  meteorites.attr("transform", d3.event.transform);
}