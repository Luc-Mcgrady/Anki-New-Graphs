<script lang="ts">
    import { FSRS } from "ts-fsrs"

    import { other } from "./stores"
    import type { CardData, CardExtraData } from "./search"

    import Heatmap from "./Heatmap.svelte"
    import type { HeatmapData } from "./heatmap"
    import NoGraph from "./NoGraph.svelte"

    interface Props {
        cardData: CardData[] | null

        rBins?: number
        sBins?: number
    }

    const {
        cardData,

        rBins = 20,
        sBins = 20,
    }: Props = $props()

    interface CardState {
        r: number
        s: number
    }

    interface CardStateBounds {
        min_r: number
        max_r: number

        min_s: number
        max_s: number
    }

    const heatmap_data: HeatmapData | null = $derived.by(() => {
        if (cardData === null) {
            // We have not been given any card data
            return null
        }

        const total_bins = rBins * sBins
        const raw_data = new Array(total_bins)

        let card_state_bounds: CardStateBounds | null = null
        const data_points: CardState[] = []
        for (const card_data_entry of cardData) {
            if (card_data_entry.type !== 2) {
                // We don't care about new / [re]learning cards
                continue
            }

            const extra_data: CardExtraData = JSON.parse(card_data_entry.data)

            if (extra_data.s === undefined) {
                // We don't care about non-FSRS cards
                continue
            }

            // N.B. This is a bit of a fudge. Manual rescheduling can make this wrong.
            //      It is how native Anki does it too though.
            const last_review_timestamp = card_data_entry.due - card_data_entry.ivl
            const elapsed_days = $other.days_elapsed - last_review_timestamp

            const s = extra_data.s
            const r = FSRS.prototype.forgetting_curve(elapsed_days, s)

            if (card_state_bounds === null) {
                card_state_bounds = {
                    min_r: r,
                    max_r: r,

                    min_s: s,
                    max_s: s,
                }
            } else {
                card_state_bounds.min_r = Math.min(card_state_bounds.min_r, r)
                card_state_bounds.max_r = Math.max(card_state_bounds.max_r, r)

                card_state_bounds.min_s = Math.min(card_state_bounds.min_s, s)
                card_state_bounds.max_s = Math.max(card_state_bounds.max_s, s)
            }

            data_points.push({ r, s })
        }

        if (card_state_bounds === null) {
            // We have no valid cards
            return null
        }

        const r_bin_width = (card_state_bounds.max_r - card_state_bounds.min_r) / rBins
        const s_bin_width = (card_state_bounds.max_s - card_state_bounds.min_s) / sBins

        // Put counts in bins
        for (const data_point of data_points) {
            const raw_r_idx = (data_point.r - card_state_bounds.min_r) / r_bin_width
            const raw_s_idx = (data_point.s - card_state_bounds.min_s) / s_bin_width

            console.log(card_state_bounds)
            console.log(`S: ${data_point.s} R: ${data_point.r} idx: (${raw_r_idx}, ${raw_s_idx})`)

            const clean_r_idx = Math.min(rBins - 1, Math.max(0, Math.round(raw_r_idx)))
            const clean_s_idx = Math.min(sBins - 1, Math.max(0, Math.round(raw_s_idx)))

            const raw_data_idx = clean_r_idx + clean_s_idx * rBins

            if (raw_data[raw_data_idx] === undefined) {
                raw_data[raw_data_idx] = 1
            } else {
                raw_data[raw_data_idx] += 1
            }
        }

        return {
            x_start: card_state_bounds.min_r,
            x_end: card_state_bounds.max_r,
            x_bins: rBins,

            y_start: card_state_bounds.min_s,
            y_end: card_state_bounds.max_s,
            y_bins: sBins,

            raw_data,
        }
    })
</script>

{#if heatmap_data !== null}
    <Heatmap
        xAxisLabel="Retrievability"
        xAxisTickFormat=".0%"
        yAxisLabel="Stability(days)"
        data={heatmap_data}
    />
{:else}
    <NoGraph />
{/if}
