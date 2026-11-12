# Interactivity demo

## Opening

> We've talked a lot about making these visualizations, but we haven't discussed where d3 really shines: interactivity! D3 offers a wide variety of tools to help different visualizations communicate with other HTML elements or with each other. Say we want to add a filter to the scatter plot to only show certain times/dates. We have this long DatePicker code and the state management, so let's quickly see how we have to add that interactivty to the Scatter plot without d3.

> We derive visible prints to be those filtered by the dateRange (we define these as state variables). When dateRange changes, we pull the start and end dates, filtering prints based on these. With no dateRange defined, we just return all of the prints. When dateRange updates in the visualization, it'll update our state, updating prints and the scatter as a result.

> This works well enough, but it's clunky. The DatePicker is clunky, has to constantly manage several state variables and overall is not as easy to use. Wouldn't it be nice if we could just select a range of dates with a single brush?

> Well, guess what? D3 lets you do just that. Let's give the Line chart some power to filter our scatter plot by just selecting a range of dates. We'll bind the dateRange state to the Line so we can change it.



## 1. Add Brush to Line.svelte

> We have dateRange bound to the Line component already.

> Then, we need to add the brush effect, as many times before, into the SVG as its own group.

**_Paste into the `Line.svelte` file._**

```html
<g class="brush" />
```

> Similar to how we did lines, we will define a brush effect on the x-axis (which is our dates).

```ts
const brush = d3
  .brushX()
  .extent([
    [margin.left, margin.top],
    [width - margin.right, height - margin.bottom]
  ])
  .on('brush end', (event) => {
    const selection = event.selection as [number, number] | null;
    dateRange = selection ? [xScale.invert(selection[0]), xScale.invert(selection[1])] : undefined;
  });
```

> Then, we need to define the extent of the brush, or where it can highlight. We want this to cover the entirety of the visualization, covering the same dimensions as specified by the axes (see our range definitions).

> This is effectively 2 points that create a rectangular overlay for the visualization area (not the ticks or axes marks). We then need to define what will happen when the brush ends (when we make our selection).

> We get the selection made from the event, which is returned as a series of physical coordinates from the range. We need to invert these to swap them from the physical coordinates to the data values, another function offered by d3. If we have no selection, we keep the dateRange undefined. Otherwise, we load what the event returned.

> Finally, we set the brush to target the brush group and call it on the SVG.

```ts
svg.select<SVGGElement>('.brush').call(brush);
```

> At this point, the dateRange is back in Svelte and not line's problem. But, we also now directly update dateRange, which means... WE DON'T NEED ANY OF THE DATEPICKER code. Get this annoying stuff outta here.

**_Delete all DatePicker code from `+page.svelte` file._**

## 3. Adding a Tooltip

**_Move to `Scatter.svelte` file._**

> All this is good, but it's kinda hard to read any of the data from our Scatter plot. Let's add some interactivity to the Scatter, and it would be really nice to actually be able to see what data is held in each dot. The best way to do this is by adding a Tooltip!

> First, let's just define the tooltip as a dynamically updating state variable. We want it to change and force rerenders after all. It'll store a specific print's data and a physical location on the page (an x and y coordinate).

```ts
let tooltip: { print: PrintHistory; x: number; y: number } | undefined = $state();
```

> Then let's actually give the tooltip a location and some styling. It pretty much should float near the mouse cursor and pulls the fields out of the data point we hover over, displaying it (offset a bit so we don't cover everything). When we access actual data, we look at the print object that we stored in the state. When we want to put down the tooltip's location, we want the x and y coordinates. Note that if we don't have the tooltip defined (as in we aren't hovering a point), the tooltip is hidden entirely.

```svelte
{#if tooltip && visiblePrints.includes(tooltip.print)}
  <div class="tooltip" style="left: {tooltip.x}px; top: {tooltip.y}px;">
    <div><strong>Started:</strong> {tooltip.print.startTime}</div>
    <div><strong>Printer:</strong> {tooltip.print.printer}</div>
    <div><strong>Estimated (hours):</strong> {tooltip.print.calculatedPrintTime}</div>
    <div><strong>Actual (hours):</strong> {tooltip.print.actualPrintTime}</div>
    <div><strong>Status:</strong> {tooltip.print.status}</div>
    <div><strong>Recorded cost:</strong> {tooltip.print.costs}</div>
  </div>
{/if}
```

```css
.tooltip {
  position: absolute;
  width: 220px;
  padding: 6px;
  border: 1px solid #000000;
  background: white;
  font-size: 12px;
  z-index: 1;
}
```

> Now let's actually get the tooltip showing.

**_Add to svg.select(points):_**

```ts
.on('pointerenter', (event, print) => {
  const [x, y] = d3.pointer(event, svgElement);
  tooltip = { print, x: x + 10, y: y + 10 };
  })
```

> All we really need to do is give each circle that we created a hover that shows some data. So, we can define a new event for when we hover over the point (or pointerenter). We get the x and y coordinates for that point so that we can create a div at that location (slightly offset), and we can easily pull these from d3’s pointer method for this event in our svg. Then we can define a custom object dynamically updating with the location to display a tooltip and the data that should be displayed.

```ts
.on('pointerleave', () => {
  tooltip = undefined;
});
```

> When we leave the dot, we just clear the object.

> And voila! Now, when we hover a point, we can see the actual data stored inside!

> D3 allows so much interaction and minute detail and it really doesn't stop here. It goes so much further in terms of what you can do. Interaction, customization, complexity. All of that and more. That said...

> TRANSITION TO FINAL PROJECTS
