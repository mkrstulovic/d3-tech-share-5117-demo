<script lang="ts">
  import * as d3 from 'd3';
  import type { PrintHistory } from '../types.d';

  type TProps = {
    prints: PrintHistory[];
  };

  // export type PrintHistory = {
  //   startTime: Date;
  //   actualPrintTime: number;
  //   calculatedPrintTime: number;
  //   status: 'printed' | 'aborted';
  //   printer: string;
  //   costs: number;
  // };

  const { prints }: TProps = $props();
  let svgElement: SVGSVGElement | undefined = $state();

  const width = 600;
  const height = 350;
  const margin = { top: 45, right: 20, bottom: 50, left: 60 };
</script>

<svg bind:this={svgElement} {width} {height}> </svg>
