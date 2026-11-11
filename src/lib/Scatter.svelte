<script lang="ts">
  import * as d3 from 'd3';
  import type { PrintHistory } from '../types.d';

  type TProps = {
    prints: PrintHistory[];
    visiblePrints: PrintHistory[];
    visInteractivity: boolean;
  };
  const { prints, visiblePrints, visInteractivity }: TProps = $props();
  let svgElement: SVGSVGElement | undefined = $state();

  // We keep track of the hovered print and where to show its details.
  let tooltip: { print: PrintHistory; x: number; y: number } | undefined = $state();

  // Define the width and height of the scatter plot, as well as margins for axes and labels.
  const width = 600;
  const height = 350;
  const margin = { top: 45, right: 20, bottom: 50, left: 60 };
  // Define colors and labels for the legend. We should be able to place this manually.
  const colors = { printed: 'steelblue', aborted: 'darkorange' };
  const legendItems = [
    { label: 'Completed', color: colors.printed },
    { label: 'Aborted', color: colors.aborted }
  ];

  $effect(() => {
    if (!svgElement) return;
    const svg = d3.select(svgElement);

    // Linear scale to estimated print time, a number.
    const xScale = d3
      .scaleLinear()
      .domain([0, d3.max(prints, (print) => print.calculatedPrintTime) || 1])
      .range([margin.left, width - margin.right]);
    // Linear scale for actual print time, a number.
    const yScale = d3
      .scaleLinear()
      .domain([0, d3.max(prints, (print) => print.actualPrintTime) || 1])
      .range([height - margin.bottom, margin.top]);

    // This actually adds the axes to the scatter. It also defines what ticks to show.
    svg.select<SVGGElement>('.x-axis').call(d3.axisBottom(xScale).ticks(6));
    svg.select<SVGGElement>('.y-axis').call(d3.axisLeft(yScale).ticks(6));

    // We select the points group and all circle marks in the scatter plot. We load in the data, and specify how to get x and y coords.
    // We also specify styling!
    // The join here allows us to update the scatter plot when the visiblePrints changes, which is important for filtering when we implement the brush!
    svg
      .select('.points')
      .selectAll('circle')
      .data(visiblePrints)
      .join('circle')
      .attr('cx', (print) => xScale(print.calculatedPrintTime))
      .attr('cy', (print) => yScale(print.actualPrintTime))
      .attr('r', 4)
      .attr('fill', (print) => colors[print.status])
      .attr('opacity', 0.5)

      // We show the details on hover and hide them when the pointer leaves.
      .on('pointerenter', (event, print) => {
        if (!visInteractivity) return;
        const [x, y] = d3.pointer(event, svgElement);
        tooltip = { print, x: x + 10, y: y + 10 };
      })
      .on('pointerleave', () => {
        tooltip = undefined;
      });

    // The legend uses index within an array to get colors and text labels so we can plot the items based on position together.
    const legend = svg.select('.legend');
    legend
      .selectAll('circle')
      .data(legendItems)
      .join('circle')
      .attr('cx', (_item, index) => index * 120)
      .attr('r', 4)
      .attr('fill', (item) => item.color)
      .attr('opacity', 0.5);

    legend
      .selectAll('text')
      .data(legendItems)
      .join('text')
      .attr('x', (_item, index) => index * 120 + 10)
      .attr('y', 4)
      .attr('font-size', 12)
      .text((item) => item.label);
  });
</script>

<!-- We define an SVG container with preset groups for the scatter plot, making sure to bind it to svgElement so d3 can manipulate it -->
<div class="scatter">
  <svg bind:this={svgElement} {width} {height}>
    <g class="points" />
    <g class="x-axis" transform="translate(0, {height - margin.bottom})" />
    <g class="y-axis" transform="translate({margin.left}, 0)" />
    <g class="legend" transform="translate({width - margin.right - 200}, {margin.top + 16})">
      <rect x="-12" y="-12" width="195" height="23" fill="white" stroke="#000000" />
    </g>
    <text x={width / 2} y={height - 8} text-anchor="middle">Estimated duration (hours)</text>
    <text transform="rotate(-90)" x={-height / 2} y={16} text-anchor="middle"
      >Actual duration (hours)</text
    >
  </svg>

  <!-- We display the loaded values for the point we are hovering over. -->
  {#if visInteractivity && tooltip && visiblePrints.includes(tooltip.print)}
    <div class="tooltip" style="left: {tooltip.x}px; top: {tooltip.y}px;">
      <div><strong>Started:</strong> {tooltip.print.startTime}</div>
      <div><strong>Printer:</strong> {tooltip.print.printer}</div>
      <div><strong>Estimated (hours):</strong> {tooltip.print.calculatedPrintTime}</div>
      <div><strong>Actual (hours):</strong> {tooltip.print.actualPrintTime}</div>
      <div><strong>Status:</strong> {tooltip.print.status}</div>
      <div><strong>Recorded cost:</strong> {tooltip.print.costs}</div>
    </div>
  {/if}
</div>

<style>
  .scatter {
    position: relative;
  }
  .tooltip {
    position: absolute;
    width: 220px;
    padding: 6px;
    border: 1px solid #000000;
    background: white;
    font-size: 12px;
    z-index: 1;
  }
</style>
