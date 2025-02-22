<script lang="ts">
    import * as _ from "lodash"
    import { SetDateInfinite } from "./bar"
    import GraphContainer from "./GraphContainer.svelte"
    import LineOrCandlestick from "./LineOrCandlestick.svelte"
    import { getMemorisedDays } from "./MemorisedBar"
    import NoGraph from "./NoGraph.svelte"
    import { catchErrors } from "./search"
    import { binSize, card_data, fatigueLoss, revlogs, searchLimit } from "./stores"
    import type { TrendInfo, TrendLine } from "./trend"
    import TrendValue from "./TrendValue.svelte"
    import { matrix } from "./matrix"

    let show = false
    let retrievabilityDays: number[] | undefined = undefined
    let bw_matrix: Record<string, (number | undefined)[]> | undefined = undefined

    $: if ($revlogs && $card_data && show) {
        let data = catchErrors(() =>
            getMemorisedDays($revlogs, $card_data, SSEother.deck_configs, SSEother.deck_config_ids)
        )

        retrievabilityDays = Array.from(data.retrievabilityDays)
        $fatigueLoss = data.fatigueRMSE
        bw_matrix = data.bw_matrix
    }

    $: truncated = $searchLimit !== 0
    $: label = (trend_data?.slope || 0) > 0 ? "memorised" : "forgotten"

    let trend_info: TrendInfo
    $: trend_info = {
        y: label,
        y_s: label,
        x: "day",
        x_s: "days",
        absolute: true,
    }

    let trend_data: TrendLine
    let svg: SVGElement | undefined = undefined

    $: if (svg && bw_matrix) {
        matrix({ grid: bw_matrix }, svg)
    }
</script>

{#if retrievabilityDays}
    <LineOrCandlestick data={retrievabilityDays} label="Cards" bind:trend_data />
    <TrendValue info={trend_info} trend={trend_data} n={$binSize} />
{:else if !show}
    <NoGraph faded={false}>
        {#if !truncated}
            <button class="big" on:click={() => (show = true)}>Show?</button>
        {:else}
            <button class="big" on:click={SetDateInfinite}>Increase date range</button>
            <button on:click={() => (show = true)}>Show?</button>
        {/if}
    </NoGraph>
{:else}
    <NoGraph>Loading</NoGraph>
{/if}

{#if bw_matrix}
    <GraphContainer>
        <svg bind:this={svg}></svg>
    </GraphContainer>
{/if}

<style>
    .big {
        width: 100%;
        height: 100%;
    }

    .grid {
        display: grid;
        grid-template-columns: repeat(12, auto);
    }
</style>
