<script lang="ts">
  import * as d3 from 'd3';
  import type { PrintHistory } from '../types.d';

  type TProps = {
    prints: PrintHistory[];
    visiblePrints: PrintHistory[];
  };

  // export type PrintHistory = {
  //   startTime: Date;
  //   actualPrintTime: number;
  //   calculatedPrintTime: number;
  //   status: 'printed' | 'aborted';
  //   printer: string;
  //   costs: number;
  // };

  const { prints, visiblePrints }: TProps = $props();
  let svgElement: SVGSVGElement | undefined = $state();

  const width = 600;
  const height = 350;
  const margin = { top: 45, right: 20, bottom: 50, left: 60 };

  const colors = { printed: 'steelblue', aborted: 'darkorange' };

  const legendItems = [
    { label: 'Completed', color: colors.printed },
    { label: 'Aborted', color: colors.aborted }
  ];

  $effect(() => {
    if (!svgElement) return;
    const svg = d3.select(svgElement);

    const xScale = d3
      .scaleLinear()
      .domain([0, d3.max(prints, (print) => print.calculatedPrintTime) || 1])
      .range([margin.left, width - margin.right]);

    const yScale = d3
      .scaleLinear()
      .domain([0, d3.max(prints, (print) => print.actualPrintTime) || 1])
      .range([height - margin.bottom, margin.top]);

    svg.select<SVGGElement>('.x-axis').call(d3.axisBottom(xScale).ticks(6));
    svg.select<SVGGElement>('.y-axis').call(d3.axisLeft(yScale).ticks(6));
  });
</script>

<svg bind:this={svgElement} {width} {height}>
  <g class="points" />

  <g class="x-axis" transform="translate(0, {height - margin.bottom})" />
  <g class="y-axis" transform="translate({margin.left}, 0)" />
  <text x={width / 2} y={height - 8} text-anchor="middle">Estimated duration (hours)</text>
  <text transform="rotate(-90)" x={-height / 2} y={16} text-anchor="middle"
    >Actual duration (hours)</text
  >

  <g class="legend" transform="translate({width - margin.right - 200}, {margin.top + 16})">
    <rect x="-12" y="-12" width="195" height="23" fill="white" stroke="#000000" />
  </g>
</svg>
