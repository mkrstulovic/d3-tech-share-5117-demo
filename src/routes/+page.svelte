<script lang="ts">
  import * as d3 from 'd3';
  import { onMount } from 'svelte';
  import Scatter from '#lib/Scatter.svelte';
  import Line from '#lib/Line.svelte';
  import type { PrintHistory, WeeklyPrintCount } from '../types.d';

  // We set key state values here so we can render dynamically and keep track.
  let prints: PrintHistory[] = $state([]);
  let weeklyCounts: WeeklyPrintCount[] = $state([]);
  let dateRange: [Date, Date] | undefined = $state();

  // We use the brush and tooltips when enabled, or the date picker when disabled.
  let visInteractivity = $state(true);

  // This is an important step for brushing.
  // We define a dervied state dependent on a date range (our filter).
  // If we have a defined date range, we filter prints and since the scatter relies on this, it is forced to rerender the updates.
  const visiblePrints = $derived.by(() => {
    if (!dateRange) return prints;
    const [start, end] = dateRange;
    return prints.filter((print) => print.startTime >= start && print.startTime <= end);
  });

  // We load the CSV data from our file and define data types for each of the columns. We load this when the page mounts.
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

  // Everything needed to support DatePickers (which themselves are another component).
  import { DatePicker } from '@svelte-plugins/datepicker';
  import { format } from 'date-fns';

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
    // The hidden date picker should not overwrite the brush selection.
    if (visInteractivity) return;
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

  onMount(async () => {
    await loadCsv();
    const [earliest, latest] = d3.extent(prints, (p) => p.startTime);
    console.log(
      'extent',
      d3.extent(prints, (p) => p.startTime)
    );
    if (earliest && latest) dateRange = [earliest, latest];
  });
</script>

<div class="container">
  <h1>D3 fundamentals</h1>
  <p>
    This demo shows 3D printing jobs from University of Minnesota students and faculty using Prusa
    and Bambu printers. The scatter plot compares estimated and actual duration in hours, and the
    line graph shows jobs started each week.
  </p>

  <!-- We only display charts once the data has loaded in. The charts are defined as assets and imported as components that we can use and define properties for. -->
  {#if prints.length > 0 && weeklyCounts.length > 0}
    <h2>Scatter plot</h2>
    <p>Showing {visiblePrints.length} of {prints.length} print jobs.</p>
    <Scatter {prints} {visiblePrints} {visInteractivity} />

    <h2>Line graph</h2>
    {#if visInteractivity}
      <p>Drag across the line graph to filter the scatter plot.</p>
    {:else}
      <p>Use the date picker to filter the scatter plot.</p>
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
    {/if}
    <Line data={weeklyCounts} bind:dateRange {visInteractivity} />
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
