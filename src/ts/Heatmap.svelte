<script lang="ts">
    import * as d3 from "d3"
    import type { HeatmapData } from "./heatmap"

    interface Props {
        xAxisLabel?: string
        yAxisLabel?: string

        xAxisTickFormat?: string
        yAxisTickFormat?: string

        data: HeatmapData
    }

    const {
        xAxisLabel,
        yAxisLabel,

        xAxisTickFormat,
        yAxisTickFormat,

        data,
    }: Props = $props()

    const width = 640
    const height = 640

    const marginTop = 20
    const marginRight = 20
    const marginBottom = 50
    const marginLeft = 50

    let gx: SVGGElement | undefined = $state(undefined)
    let gy: SVGGElement | undefined = $state(undefined)

    const x_scale = $derived(
        d3.scaleLinear([data.x_start, data.x_end], [marginLeft, width - marginRight])
    )
    const y_scale = $derived(
        d3.scaleLinear([data.y_start, data.y_end], [height - marginBottom, marginTop])
    )

    const col_width = $derived((data.x_end - data.x_start) / data.x_bins)
    const row_height = $derived((data.y_end - data.y_start) / data.y_bins)

    const scaled_col_width = $derived(
        Math.abs(x_scale(data.x_start + col_width) - x_scale(data.x_start))
    )
    const scaled_row_height = $derived(
        Math.abs(y_scale(data.y_start + row_height) - y_scale(data.y_start))
    )

    const color = $derived.by(() => {
        const non_null_data = data.raw_data.filter((x) => x !== undefined)

        let min = Math.min(...non_null_data)
        let max = Math.max(...non_null_data)

        if (min === Infinity) {
            min = Number.MIN_VALUE
        }

        if (max === -Infinity) {
            max = Number.MAX_VALUE
        }

        return d3.scaleLinear(
            [Math.min(...non_null_data), Math.max(...non_null_data)],
            ["cornflowerblue", "red"]
        )
    })

    $effect(() => {
        let xAxisGenerator = d3.axisBottom(x_scale)
        let yAxisGenerator = d3.axisLeft(y_scale)

        if (xAxisTickFormat) {
            xAxisGenerator = xAxisGenerator.tickFormat(d3.format(xAxisTickFormat))
        }

        if (yAxisTickFormat) {
            yAxisGenerator = yAxisGenerator.tickFormat(d3.format(yAxisTickFormat))
        }

        // @ts-ignore: @types/d3 seems to be wrong
        d3.select(gx).call(xAxisGenerator)
        // @ts-ignore: @types/d3 seems to be wrong
        d3.select(gy).call(yAxisGenerator)
    })

    // A helper for creating ranges from `start` (inclusive) to `end` (exclusive)
    function* range(start: number, end: number): Generator<number> {
        for (let i = start; i < end; i++) {
            yield i
        }
    }
</script>

<svg viewBox="0, 0, {width}, {height}" preserveAspectRatio="meet">
    <!-- Axes -->
    <g font-family="sans-serif">
        <!-- X Axis -->
        <g>
            <g bind:this={gx} transform="translate(0,{height - marginBottom})" />

            {#if xAxisLabel}
                <text
                    transform="translate({marginLeft +
                        (width - (marginLeft + marginRight)) / 2},{height - 12})"
                    text-anchor="middle"
                    fill="currentColor"
                >
                    {xAxisLabel}
                </text>
            {/if}
        </g>

        <!-- Y Axis -->
        <g>
            <g bind:this={gy} transform="translate({marginLeft},0)" />

            {#if yAxisLabel}
                <text
                    transform="translate(12, {marginTop +
                        (height - (marginTop + marginBottom)) / 2}) rotate(-90)"
                    text-anchor="middle"
                    fill="currentColor"
                >
                    {yAxisLabel}
                </text>
            {/if}
        </g>
    </g>

    <!-- Data Points -->
    <g stroke="currentColor" stroke-width="1px">
        {#each range(0, data.y_bins) as y_idx (y_idx)}
            {#each range(0, data.x_bins) as x_idx (x_idx)}
                {@const value = data.raw_data[x_idx + y_idx * data.x_bins]}

                {#if value !== undefined}
                    <rect
                        x={x_scale(data.x_start + x_idx * col_width)}
                        y={y_scale(data.y_start + (y_idx + 1) * row_height)}
                        width={scaled_col_width}
                        height={scaled_row_height}
                        fill={color(value)}
                        aria-label="value: {value}"
                    />
                {/if}
            {/each}
        {/each}
    </g>
</svg>
