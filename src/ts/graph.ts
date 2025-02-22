export function defaultGraphBounds() {
    return {
        width: SSEconfig.barWidth ?? 600,
        height: SSEconfig.barHeight ?? 250,
        marginLeft: 70,
        marginRight: 70,
        marginTop: 20,
        marginBottom: 25,
    }
}

export const MATURE_COLOUR = "#31a354"
export const YOUNG_COLOUR = "#74c476"
