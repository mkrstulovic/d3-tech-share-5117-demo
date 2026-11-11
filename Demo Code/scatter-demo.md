# Scatter plot demo

## Opening

> Tayler started with a pile of print logs from the makerspace. The line chart helped us see when jobs were coming in. I want to ask one more thing about those same jobs. If a print was estimated to take two hours, how long did it actually take? Let’s give each job a dot so we can see the estimate and the actual time together.

## 1. Start with an empty SVG

**_Paste into the blank `Scatter.svelte` file._**

```ts
<script lang="ts">
  import * as d3 from 'd3';
  import type { PrintHistory } from '../types.d';

  type TProps = {
    prints: PrintHistory[];
    visiblePrints: PrintHistory[];
    visInteractivity: boolean;
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
</script>
```

> We’ll start with a little setup. The page already loaded the CSV and passes the print records into this component. Each record has the `PrintHistory` shape we saw earlier. The three fields we’ll use are `calculatedPrintTime` for the estimate, `actualPrintTime` for what happened, and `status` for how the job ended.

**_Paste below `</script>`._**

```ts
<svg bind:this={svgElement} {width} {height}>
</svg>
```

> This part should look familiar from the line chart. We start with an empty SVG to draw in and `bind:this` gives us a reference to it so D3 knows which SVG to work with.

**_Save and show the browser._**

> You’ll see blank space below the scatter heading. That’s our empty SVG.

## 2. Give the axes a place, then draw them

> Now as in the line chart, let's set up our axes.

**_Paste inside `<svg>`._**

```ts
  <g class="x-axis" transform="translate(0, {height - margin.bottom})" />
  <g class="y-axis" transform="translate({margin.left}, 0)" />
  <text x={width / 2} y={height - 8} text-anchor="middle">Estimated duration (hours)</text>
  <text transform="rotate(-90)" x={-height / 2} y={16} text-anchor="middle">Actual duration (hours)</text>
```

> First, let’s give each axis a place to go. These two `<g>` elements are SVG groups. We position one at the bottom and one on the left. The `<text>` elements tell us what each axis measures. Now let’s give D3 the scales it needs to draw the axes.

**_Paste above `</script>`._**

```ts
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

  svg.select<SVGGElement>(".x-axis").call(d3.axisBottom(xScale).ticks(6));
  svg.select<SVGGElement>(".y-axis").call(d3.axisLeft(yScale).ticks(6));
});
```

> We start by selecting our SVG, just like we did for the line chart. That chart had dates across the bottom, so we used a time scale there. Now we have estimated hours across the bottom and actual hours up the side. We’ll use `scaleLinear()` for both.
>
> Here’s the x scale. Its `domain` is the input, from zero up to the largest estimate that `d3.max()` finds. Its `range` is the output, from the left edge of the plot to the right. In SVG, y gets bigger as you go down, so we give the y scale a range from bottom to top. That way, a longer actual duration puts a dot higher up.
>
> Now we hand those scales to `axisBottom` and `axisLeft`. Each `.call()` draws an axis in the group we just added. `.ticks(6)` gives D3 a rough idea of how many ticks we want.

**_Save and show the browser._**

> There are our two axes. We’re comparing hours with hours.

## 3. Add a group for points, then join the records

> Our scatter plot wouldn’t really be much of a scatter plot without any points, so let’s add those now. I’ll give the circles their own group, the same way we gave each axis a group.

**_Paste as the first child of `<svg>`, before the axis groups._**

```ts
  <g class="points" />
```

> Now we can tell D3 what goes in that group.

**_Paste inside `$effect`, after the axis calls and before the closing `});`._**

```ts
svg
  .select(".points")
  .selectAll("circle")
  .data(visiblePrints)
  .join("circle")
  .attr("cx", (print) => xScale(print.calculatedPrintTime))
  .attr("cy", (print) => yScale(print.actualPrintTime))
  .attr("r", 4)
  .attr("fill", "steelblue")
  .attr("opacity", 0.5);
```

> Here’s where it starts to feel like a different chart. For the line, we gave the whole list of weekly counts to one path with `.datum()`. Here we want one circle per job. `selectAll("circle")` looks for circles inside `.points`. The first time through, there aren’t any. `.data(visiblePrints)` tells D3 what to bind, and `.join("circle")` makes the missing circles. Now each circle has one job attached to it.
>
> Now we can say where each circle goes. `cx` and `cy` are the x and y coordinates of its center. D3 passes the job into each function. We run its estimated hours through `xScale` and its actual hours through `yScale`. Every dot gets the same radius.
>
> One thing to keep in mind for Marko’s part. The scales use all the jobs in `prints`. The circles come from `visiblePrints`. When that list changes, the join can add, reuse, or remove circles, and the axes keep the same scale.

**_Save and show the browser. Pick a dot you can easily point to._**

> Now we’ve got a blue dot for each job we’re showing. For this one, look straight down to read the estimate and straight left to read the actual time.

## 4. Color points by status

> So far every job is blue. What if we want to see whether completed and aborted jobs show up in different parts of the plot? Let’s give each status a color.

**_Paste above `$effect`._**

```ts
const colors = { printed: "steelblue", aborted: "darkorange" };
```

> We already used a function to get each job’s x and y positions. We can do the same for `fill`. This function reads the job’s status and looks up the color we just picked.

**_Replace `.attr("fill", "steelblue")` in the points chain._**

```ts
  .attr("fill", (print) => colors[print.status])
```

**_Save and show the browser._**

> There we go. Completed jobs are blue and aborted jobs are orange. The dots are still in the same places.

## 5. Add the legend group, then draw its symbols and labels

> We know what blue and orange mean because we just wrote the code. Someone looking at the chart for the first time needs a legend. Let’s start with a group for it.

**_Paste after the y-axis group and before the axis labels._**

```ts
  <g class="legend" transform="translate({width - margin.right - 200}, {margin.top + 16})">
    <rect x="-12" y="-12" width="195" height="23" fill="white" stroke="#000000" />
  </g>
```

> The rectangle gives the legend a background and a border. Now let’s give it the two entries we want to show.

**_Paste below `colors` and above `$effect`._**

```ts
const legendItems = [
  { label: "Completed", color: colors.printed },
  { label: "Aborted", color: colors.aborted },
];
```

> We’ve got a label for each status, and we’re using the same colors as the jobs. Now we can draw the symbols and labels.

**_Paste inside `$effect`, after the points chain and before the closing `});`._**

```ts
const legend = svg.select(".legend");
legend
  .selectAll("circle")
  .data(legendItems)
  .join("circle")
  .attr("cx", (_item, index) => index * 120)
  .attr("r", 4)
  .attr("fill", (item) => item.color)
  .attr("opacity", 0.5);

legend
  .selectAll("text")
  .data(legendItems)
  .join("text")
  .attr("x", (_item, index) => index * 120 + 10)
  .attr("y", 4)
  .attr("font-size", 12)
  .text((item) => item.label);
```

> This is the same join we used for the scatter plot. We pass in `legendItems` once to make a circle for each entry and again to make a text element for each entry.
>
> See how we start from `.legend` here? That keeps these circles and labels in their own group. The second argument, `index`, tells us whether we’re placing the first or second entry. We use it to space them out, and `.text()` writes the label.

**_Save and show the browser. Point to the legend in the upper right._**

> There’s our scatter plot. Now we can compare the estimate and actual time for individual jobs and see how they ended. Say Tayler wants to look at just the jobs from one busy week we saw earlier. We already have a chart that shows us where that week is. I’ll hand it over to Marko to show how we can select that week on the line chart and take a closer look at individual jobs.
