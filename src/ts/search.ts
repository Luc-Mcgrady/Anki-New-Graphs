import { realFetch } from "./root"

export function catchErrors<Return>(func: () => Return): Return {
    try {
        return func()
    } catch (e: any) {
        alert(`Search Stats Extended has encountered an error.

--- *** If you have recently updated the addon please ensure you have restarted Anki. *** ---

JS:
${e?.stack ? e.stack : e}`)
        throw e
    }
}

async function endpoint(endpoint: string, body?: string) {
    const resp = await realFetch(`/_anki/${endpoint}`, {
        method: "POST",
        body,
        headers: { "Content-Type": "application/binary" },
    })

    if (!resp.ok) {
        alert(`Search Stats Extended has encountered an error.

--- *** If you have recently updated the addon please ensure you have restarted Anki. *** ---




If the problem persists copy the following information into a github issue (https://github.com/Luc-Mcgrady/Anki-Search-Stats-Extended/issues/new) with a description of what you were doing at the time:

Fetch Response: ${resp.status}
${await resp.text()}`)
        throw resp.status
    }

    const blob = await resp.text()
    return JSON.parse(blob)
}

export async function search(search: string) {
    return (await endpoint("cardSearch", search)) as number[]
}

export interface CardData {
    id: number
    nid: number
    did: number
    ord: number
    mod: number
    usn: number
    type: number
    queue: number
    due: number
    ivl: number
    factor: number
    reps: number
    lapses: number
    left: number
    odue: number
    odid: number
    flags: number
    data: string
}

export interface CardExtraData {
    d?: number
    dr?: number
    pos?: number
    s?: number
}

export interface Revlog {
    id: number
    cid: number
    //usn: number
    ease: 0 | 1 | 2 | 3 | 4
    ivl: number
    lastIvl: number
    factor: number
    time: number
    type: number
}

export async function getCardData(cids: number[]) {
    return (await endpoint("cardData", JSON.stringify(cids))) as CardData[]
}

export async function getRevlogs(cids: number[], day_range: number) {
    return (await endpoint("revlogs", JSON.stringify({ cids, day_range }))) as Revlog[]
}
