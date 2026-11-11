<script lang="ts">
  import * as d3 from 'd3';
  import { onMount } from 'svelte';
  import Scatter from '#lib/Scatter.svelte';
  import Line from '#lib/Line.svelte';
  import type { PrintHistory, WeeklyPrintCount } from '../types.d';

  let prints: PrintHistory[] = $state([]);
  let weeklyCounts: WeeklyPrintCount[] = $state([]);
  let dateRange: [Date, Date] | undefined = $state();

  async function loadCsv() {
    prints = await d3.csv('./prints.csv', (row) => ({
      startTime: new Date(row.startTime),
      actualPrintTime: Number(row.actualPrintTime),
      calculatedPrintTime: Number(row.calculatedPrintTime),
      status: row.status as PrintHistory['status'],
      printer: row.printer,
      costs: Number(row.costs)
    }));

    weeklyCounts = await d3.csv('./weekly_prints.csv', (row) => ({
      weekStart: new Date(row.weekStart),
      printCount: Number(row.printCount)
    }));
  }

  onMount(async () => {
    await loadCsv();
  });
</script>

<div class="container">
  <h1>D3 fundamentals</h1>
  <p>
    This demo shows 3D printing jobs from University of Minnesota students and faculty using Prusa
    and Bambu printers. The scatter plot compares estimated and actual duration in hours, and the
    line graph shows jobs started each week.
  </p>

  {#if prints.length > 0 && weeklyCounts.length > 0}
    <!-- <h2>Scatter plot</h2> -->
    <!-- <p>Showing {visiblePrints.length} of {prints.length} print jobs.</p> -->
    <!-- <Scatter {prints} /> -->

    <h2>Line graph</h2>
    <!-- <p>Drag across the line graph to filter the scatter plot.</p> -->
    <!-- <Line data={weeklyCounts} /> -->
  {/if}
</div>

<style>
  .container {
    max-width: 640px;
    margin: 0 auto;
    padding: 16px;
    font-family: system-ui, sans-serif;
  }
  .picker {
    display: flex;
    gap: 8px;
    align-items: center;
    margin-bottom: 8px;
  }
</style>
