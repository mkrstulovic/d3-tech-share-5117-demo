<script lang="ts">
  import * as d3 from 'd3';
  import type { WeeklyPrintCount } from '../types.d';

  type TProps = {
    data: WeeklyPrintCount[];
  };

  let { data }: TProps = $props();
  let svgElement: SVGSVGElement | undefined = $state();

  const width = 600;
  const height = 220;
  const margin = { top: 20, right: 20, bottom: 40, left: 60 };
</script>

<svg bind:this={svgElement} {width} {height}> </svg>
