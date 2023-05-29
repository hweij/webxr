import * as wfdb from "./wfdb/wfdb";

export var wfdbData: wfdb.WFDBDataSet | null;

// const graphLine = createGraphLine();
async function loadWfdbData() {
    wfdbData = await wfdb.loadVitals(`/wfdb/bidmc01.hea`);
    if (!wfdbData) {
        return;
    }
}

export async function init() {
    await loadWfdbData();
}