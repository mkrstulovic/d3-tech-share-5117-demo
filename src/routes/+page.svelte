<script lang="ts">
  import * as d3 from 'd3';
  import { onMount } from 'svelte';
  import Scatter from '#lib/Scatter.svelte';
  import Line from '#lib/Line.svelte';
  import { DatePicker } from '@svelte-plugins/datepicker';
  import { format } from 'date-fns';

  import type { PrintHistory, WeeklyPrintCount } from '../types.d';

  let prints: PrintHistory[] = $state([]);
  let weeklyCounts: WeeklyPrintCount[] = $state([]);
  let dateRange: [Date, Date] | undefined = $state();

  const visiblePrints = $derived.by(() => {
    if (!dateRange) return prints;
    const [start, end] = dateRange;
    return prints.filter((print) => print.startTime >= start && print.startTime <= end);
  });

  // ----------------- Temporary date picker code! -----------------
  let pickerStart = $state<Date | number | undefined>();
  let pickerEnd = $state<Date | number | undefined>();
  let isPickerOpen = $state(false);

  function toDate(value: Date | number | string | null | undefined): Date | undefined {
    if (value == null) return undefined;
    const d = new Date(value);
    return Number.isNaN(d.getTime()) || d.getTime() <= 0 ? undefined : d;
  }

  $effect(() => {
    if (!dateRange) return;
    pickerStart = dateRange[0];
    pickerEnd = dateRange[1];
  });

  $effect(() => {
    const start = toDate(pickerStart);
    const end = toDate(pickerEnd);
    if (!start || !end) return;
    if (dateRange && +dateRange[0] === +start && +dateRange[1] === +end) return;
    dateRange = start <= end ? [start, end] : [end, start];
  });

  const dataExtent = $derived(d3.extent(prints, (p) => p.startTime) as [Date, Date]);

  function clearRange() {
    dateRange = dataExtent;
  }
  // ---------------------------------------------------------------

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

  <!-- ----------------- Temporary date picker code! ----------------- -->
  <div class="picker">
    <DatePicker
      bind:isOpen={isPickerOpen}
      bind:startDate={pickerStart}
      bind:endDate={pickerEnd}
      isRange
      alignRight
    >
      <button type="button" onclick={() => (isPickerOpen = !isPickerOpen)}>
        {#if dateRange}
          {format(dateRange[0], 'MMM d, yyyy')} – {format(dateRange[1], 'MMM d, yyyy')}
        {:else}
          Select date range
        {/if}
      </button>
    </DatePicker>

    {#if dateRange}
      <button type="button" onclick={clearRange}>Clear</button>
    {/if}
  </div>
  <!-- --------------------------------------------------------------- -->

  {#if prints.length > 0 && weeklyCounts.length > 0}
    <!-- <h2>Scatter plot</h2> -->
    <!-- <p>Showing {visiblePrints.length} of {prints.length} print jobs.</p> -->
    <!-- <Scatter {prints} {visiblePrints} /> -->

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
