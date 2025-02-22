import * as d3 from "d3"
import * as _ from "lodash"
import { createAxis } from "./bar"
import { defaultGraphBounds } from "./graph"

export type Matrix = {
    grid: Record<number, (number | undefined)[]>
    column_totals?: Record<number, number>
    row_totals?: number[]
}

export function matrix({ grid, column_totals, row_totals }: Matrix, svg: SVGElement) {
    let bounds = defaultGraphBounds()

    const rows = Object.entries(grid).sort((a, b) => +b[0] - +a[0])
    // Hard coded for now
    const x_groups = _.range(1, 11).map((a) => a.toString())

    const box_size = bounds.width / 10
    bounds.height = rows.length * box_size
    // Build X scales and axis:
    const x = d3.scaleBand().range([0, bounds.width]).domain(x_groups).padding(0.01)
    const y = d3
        .scaleBand()
        .range([bounds.height, 0])
        .domain(rows.map((row) => row[0]))
        .padding(0.01)

    const axis = createAxis(svg, 1, x, y, bounds)
    const data = rows
        .flatMap(([row, cols]) => cols.map((val, col) => ({ row, col, val })))
        .filter((d) => d.val !== undefined)

    const values = data.map((datum) => datum.val)

    console.log({ x_groups, rows, data })

    const color = d3
        .scaleLinear<string>()
        // Hard coded range
        .domain([-0.2, 0, 0.2])
        .interpolate(d3.interpolateRgb)
        .range(["red", "white", "blue"])

    const margin = 3

    axis.selectAll("rect")
        .data<{ row: string; col: number; val: number | undefined }>(data)
        .enter()
        .append("rect")
        .attr("xr", margin)
        .attr("yr", margin)
        .attr("x", (d) => x(d.col.toString())! + margin)
        .attr("y", (d) => y(d.row.toString())! + margin)
        .attr("width", x.bandwidth() - margin * 2)
        .attr("height", y.bandwidth() - margin * 2)
        .style("fill", (d) => (d.val !== undefined ? color(d.val) : "purple"))
        .style("stroke", "black")

    axis.selectAll("text")
        .data<{ row: string; col: number; val: number | undefined }>(data)
        .enter()
        .append("text")
        .attr("x", (d) => x(d.col.toString())! + x.bandwidth() / 2)
        .attr("y", (d) => y(d.row.toString())! + y.bandwidth() / 2)
        .attr("dy", "0.35em") // Vertical alignment
        .attr("text-anchor", "middle")
        .style("fill", "black")
        .style("font-size", "12px")
        .text((d) => (d.val !== undefined ? `${(d.val * 100).toFixed(1)}%` : ""))
}
