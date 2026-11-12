<script lang="ts">
  import * as d3 from 'd3';
  import type { WeeklyPrintCount } from '../types.d';

  type TProps = {
    data: WeeklyPrintCount[];
    dateRange: [Date, Date] | undefined;
  };

  let { data, dateRange = $bindable() }: TProps = $props();

  let svgElement: SVGSVGElement | undefined = $state();

  const width = 600;
  const height = 220;
  const margin = { top: 20, right: 20, bottom: 40, left: 60 };

  // An asynchronous effect is used to load the chart once all elements are created and the data loads.
  $effect(() => {
    if (!svgElement) return;

    // Selecting the svg element
    const svg = d3.select(svgElement);
  });
</script>

<svg bind:this={svgElement} {width} {height}> </svg>
