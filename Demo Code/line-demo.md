# Line demo

## Opening

> As stated, d3 is tough, so we'll walk through the the basic steps of setting up a line plot visualization. So we have our data in out custom datatype array, great. Now how can we make the graph visualizing the weekly prints?

> Go to Line.svelte

## 1. SVGs

> This is our basic setup: we have our data as a $prop, height, width, marigins for the graph, and an effect function that currently does nothing.

> You'll notice that for what we actually display, we have an svg tag. For those who don't know, an svg is a type of image that uses mathematical formulas rather than a rastered set of pixels. D3 is primarily designed with svg in mind, html canvases are possible, but many functions format directly into svg formats. The actual formats of svgs are similar to html in their grouping, so lets take a look 

**_Paste inside `<svg>`._**

```ts
<path class="series" fill="none" stroke="#E46DAC" stroke-width="2" />
  <g class="x-axis" transform="translate(0, {height - margin.bottom})" />
  <g class="y-axis" transform="translate({margin.left}, 0)" />

  <!-- Text labels for axes -->
  <text x={width / 2} y={height - 5} text-anchor="middle">Week starting Sunday</text>
  <text transform="rotate(-90)" x={-height / 2} y={16} text-anchor="middle">Print jobs</text>
```

> We have an empty path element which is where our line will go, empty g elements for the axis. g elements are groups are used to group items in the svg, and are analogus to div elements in html. We also have text elements for labeling the axes. The g and path elements will be filled in later with d3. If we need to add more to the svg, we can just add an extra element within the scg.

> Worth noting if you decide to use d3, this structure  makes graphs incredibly easy to save and export.

## 2. Filling in the chart 

> Now moving back into the effect, this is where we construct our graph. We just need the two axes and the actual line. 

> D3 has their own axis definitions. They need 3 things: scale, domain, and range. We make our x axis:

**_Paste below `const svg = d3.select(svgElement);`._**

```ts
const xScale = d3
      .scaleTime()
      .domain([data[0].weekStart, d3.timeWeek.offset(data[data.length - 1].weekStart, 1)])
      .range([margin.left, width - margin.right]);
```

> Scale, domain, and range. Scale is the specific type of value associated with the axis. We use scaleTime() here since the X axis is made up of dates. There are many other types: ScaleLinear for straightforward number values, ScaleLog for logarithmic scales, and ScaleBand for strings to name a few. Domain specifies the values that the axis covers. For example there were actually more dates before January this year, but we don't want to show them, we just want the dates in our actual data. Range just specifies the axis's extend within the svg, which we just define as the dimension minus the margins

> So if we want to add our y axis we need scale, domain, and ___?

```ts
const yScale = d3
      .scaleLinear()
      .domain([0, d3.max(data, (week) => week.printCount) || 1])
      .range([height - margin.bottom, margin.top]);
```

> I'm so proud of all of you, notice that we use ScaleLinear. 0 to the maximum prints

> The scales are made, we just need to add them into the svg with d3

```ts
svg.select<SVGGElement>('.x-axis').call(d3.axisBottom(xScale).ticks(12));
    svg.select<SVGGElement>('.y-axis').call(d3.axisLeft(yScale).ticks(4));
```

> We select the svg elements, and use d3 to actually display the axis (axisbottom & left because x axis goes on the bottom and y axis goes to the left). The ticks just signify an approximation how many labels will be on the axis

(Reload page if time allows)

> We've made our axes, so now all thats left is actual data in the form of a line. Let's look at the code for this:

```ts
const line = d3
      .line<WeeklyPrintCount>()
      .x((week) => xScale(week.weekStart))
      .y((week) => yScale(week.printCount));

    svg.select('.series').datum(data).attr('d', line);
```

> This passes our WeeklyPrintCount data into d3's line function, so we just need to map each array entry's x and y values (domain) into their range values. Then we just add this data into the attribute d of path which stores the actual values. And our chart should be done!

## 3. Presenting Story / Markers

> Now Tayler, as our expert in the field when do you think the most prints happen?

**_Save and show the browser._**

> It's funny that you say that because our data shows just that!

(Inspect element and show off d and alter value if time allows)

> And with out axes defined, we can add lines to our heart's content!

> But what if we want to know exactly when the semester ended? I can't rememeber off the top of my head and it's hard to identify over this vast time range. 

**_paste below const margin = { top: 20, right: 20, bottom: 40, left: 60 }._**

```ts
const semesterMarkers = [
    { label: 'Spring end', date: new Date(2026, 4, 13) },
    { label: 'Fall start', date: new Date(2026, 8, 8) }
  ];
```

> Well luckily I stumbled upon this relevant info which has the dates for the spring semester end and fall start

**_paste inside svg._**

```ts
<g class="semester-markers" pointer-events="none" />
```

> As we're working with an svg we simply add a new element for storing our markers

**_paste below svg.select('.series').datum(data).attr('d', line);._**

```ts
const markers = svg.select('.semester-markers');
    markers
      .selectAll('line')
      .data(semesterMarkers)
      .join('line')
      .attr('x1', (marker) => xScale(marker.date))
      .attr('x2', (marker) => xScale(marker.date))
      .attr('y1', margin.top)
      .attr('y2', height - margin.bottom)
      .attr('stroke', '#000000')
      .attr('stroke-dasharray', '5,4');

    markers
      .selectAll('text')
      .data(semesterMarkers)
      .join('text')
      .attr('x', (marker) => xScale(marker.date) + 4)
      .attr('y', margin.top - 6)
      .attr('font-size', 12)
      .text((marker) => marker.label);
```

> We make lines and lables from this data, and upon reloading:

**_Save and show the browser._**

> It's a lot of code and I didn't get to explain everything in depth but hopefully it gives you a good understanding of how d3 operates at a basic level. Our code is posted and there are plenty of great tutorials online. d3 allows you to do so much and we'll see another good way to utilize this so with that I'll pass it over to Nicholas Hinds.