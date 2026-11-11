<script lang="ts">
  import * as d3 from 'd3';
  import type { WeeklyPrintCount } from '../types.d';

  // The data is given as our print counts. We define the type of the props here.
  type TProps = {
    data: WeeklyPrintCount[];
    dateRange: [Date, Date] | undefined;
    visInteractivity: boolean;
  };
  // We bind the data from our props to this visualization so we update based on the data.
  let { data, dateRange = $bindable(), visInteractivity }: TProps = $props();
  // We need to change the svgElement so we can load effects to edit it.
  let svgElement: SVGSVGElement | undefined = $state();

  // d3 needs specific dimensions for chart design, so we have to define them.
  const width = 600;
  const height = 220;
  const margin = { top: 20, right: 20, bottom: 40, left: 60 };

  // We set two dates to mark the spring end and fall start in 2026.
  const semesterMarkers = [
    { label: 'Spring end', date: new Date(2026, 4, 13) },
    { label: 'Fall start', date: new Date(2026, 8, 8) }
  ];

  // An asynchronous effect is used to load the chart once all elements are created and the data loads.
  $effect(() => {
    if (!svgElement) return;
    // Selecting the element to work on.
    const svg = d3.select(svgElement);

    // Scale defintions for our x and y axes.
    // The x-axis is time based, so we use scaleTime.
    const xScale = d3
      .scaleTime()
      .domain([data[0].weekStart, d3.timeWeek.offset(data[data.length - 1].weekStart, 1)])
      .range([margin.left, width - margin.right]);
    // Our y-axis uses number of prints, so a regular numerical linear scale works.
    const yScale = d3
      .scaleLinear()
      .domain([0, d3.max(data, (week) => week.printCount) || 1])
      .range([height - margin.bottom, margin.top]);

    // We select the target SVG and add the axes as props.
    svg.select<SVGGElement>('.x-axis').call(d3.axisBottom(xScale).ticks(12));
    svg.select<SVGGElement>('.y-axis').call(d3.axisLeft(yScale).ticks(4));

    // We draw our line using our data type, setting the x and y based on fields in the data.
    const line = d3
      .line<WeeklyPrintCount>()
      .x((week) => xScale(week.weekStart))
      .y((week) => yScale(week.printCount));

    // WE add the line and specify the data to use with the following:
    svg.select('.series').datum(data).attr('d', line);

    // We draw a dashed line and label for each semester date.
    const markers = svg.select('.semester-markers');
    markers
      .selectAll('line')
      .data(semesterMarkers)
      .join('line')
      .attr('x1', (marker) => xScale(marker.date))
      .attr('x2', (marker) => xScale(marker.date))
      .attr('y1', margin.top)
      .attr('y2', height - margin.bottom)
      .attr('stroke', '#000000')
      .attr('stroke-dasharray', '5,4');

    markers
      .selectAll('text')
      .data(semesterMarkers)
      .join('text')
      .attr('x', (marker) => xScale(marker.date) + 4)
      .attr('y', margin.top - 6)
      .attr('font-size', 12)
      .text((marker) => marker.label);

    // This is the key difference!
    // We need to set a dimension for the brush, the boundaries, and and effect when the brush ends.
    // In this case we get the selection on the range (the physical SVG) and convert it to the domain (actual dates)
    // If there is no selection, we do not define a filter.
    if (visInteractivity) {
      const brush = d3
        .brushX()
        .extent([
          [margin.left, margin.top],
          [width - margin.right, height - margin.bottom]
        ])
        .on('brush end', (event) => {
          const selection = event.selection as [number, number] | null;
          dateRange = selection
            ? [xScale.invert(selection[0]), xScale.invert(selection[1])]
            : undefined;
        });

      svg.select<SVGGElement>('.brush').call(brush);
    }
  });
</script>

<!-- This is how to define the HTML element to display. We need to bind this to our svgElement reference from earlier to tell d3 to populate this. -->
<!-- Path is how SVGs draw lines. We add general groups to guide d3 in where to make changes, such as groups for the axes. -->
<svg bind:this={svgElement} {width} {height}>
  <path class="series" fill="none" stroke="#E46DAC" stroke-width="2" />
  <g class="x-axis" transform="translate(0, {height - margin.bottom})" />
  <g class="y-axis" transform="translate({margin.left}, 0)" />
  <g class="semester-markers" pointer-events="none" />
  {#if visInteractivity}
    <g class="brush" />
  {/if}
  <!-- We add text labels for axes, specifying approximately where we want them along the SVG height/width. -->
  <text x={width / 2} y={height - 5} text-anchor="middle">Week starting Sunday</text>
  <text transform="rotate(-90)" x={-height / 2} y={16} text-anchor="middle">Print jobs</text>
</svg>
