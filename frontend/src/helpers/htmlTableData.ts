import { TableData } from "@/contracts/Table";
import { marked } from "marked";

function countColumns(table: HTMLTableElement): number {
    const firstRow =
        table.tBodies[0]?.querySelectorAll<HTMLTableRowElement>("tr")[0];
    return firstRow ? firstRow.cells.length : 0;
}

function padString(string: string, targetLength: number, padCharacter = " ") {
    if (targetLength === undefined) {
        return string;
    }
    let padding = "";
    for (let i = string.length; i < targetLength; i++) {
        padding += padCharacter;
    }
    return string + padding;
}

export async function markdownTableToTableData(
    mdString: string,
): Promise<TableData> {
    return htmlTableToTableData(await marked(mdString));
}

export function htmlTableToTableData(htmlString: string): TableData {
    const el = document.createElement("html");
    el.innerHTML = htmlString;
    const html = el.getElementsByTagName("table")[0];
    const table: TableData = { thead: [], data: [], hasHeading: true };

    const headRow =
        html.tHead?.querySelectorAll<HTMLTableRowElement>("tr")[0] ?? null;

    if (headRow !== null) {
        for (const cell of headRow.cells) {
            table.thead.push(cell.innerText);
        }
    } else {
        table.hasHeading = false;
        for (let i = 0; i < countColumns(html); i++) {
            table.thead.push(i + "");
        }
    }

    for (const tBody of html.tBodies) {
        for (const row of tBody.querySelectorAll<HTMLTableRowElement>("tr")) {
            const newRow: string[] = [];
            for (const cell of row.cells) {
                newRow.push(cell.innerText);
            }
            table.data.push(newRow);
        }
    }

    return table;
}

export function tableDataToMarkdown(tbl: TableData): string {
    let md = "";
    const biggestColumns: Record<number, number> = {};
    if (tbl.hasHeading) {
        for (let i = 0; i < tbl.thead.length; i++) {
            biggestColumns[i] = tbl.thead[i].length;
        }
        for (let i = 0; i < tbl.data.length; i++) {
            const row = tbl.data[i];
            for (let j = 0; j < row.length; j++) {
                const cell = row[j];
                const cellSize = cell.length;

                if (biggestColumns[j] < cellSize) {
                    biggestColumns[j] = cellSize;
                }
            }
        }
    }
    if (tbl.hasHeading) {
        md += "| ";
        let headingSep = "| ";

        for (let i = 0; i < tbl.thead.length; i++) {
            const heading = tbl.thead[i];
            if (i !== 0) {
                md += " | ";
                headingSep += " | ";
            }
            md += padString(heading, biggestColumns[i]);
            headingSep += padString("", biggestColumns[i], "-");
        }

        md += " |\n";
        md += headingSep + " |\n";
    }
    for (let i = 0; i < tbl.data.length; i++) {
        const row = tbl.data[i];
        md += "| ";
        for (let j = 0; j < row.length; j++) {
            if (j !== 0) {
                md += " | ";
            }
            md += padString(row[j], biggestColumns[j]);
        }
        md += " |\n";
    }

    return md;
}

class Table {
    thead: string[];
    data: Record<string, any>[];

    constructor() {
        this.thead = [];
        this.data = [];
    }

    width(): number {
        return this.thead.length;
    }

    length(): number {
        return this.data.length;
    }

    spliceRows(start: number, end: number | null = null): Table {
        let deleteCount;
        if (end !== null) {
            deleteCount = end - start;
        } else {
            deleteCount = this.length() - start;
        }

        this.data.splice(start, deleteCount);

        return this;
    }

    spliceColumns(start: number, end: number | null = null): Table {
        let deleteCount;

        if (end !== null) {
            deleteCount = end - start;
        } else {
            deleteCount = this.width() - start;
        }

        this.thead.splice(start, deleteCount);
        const self = this;

        this.data = this.data.map((row) => {
            const ret: Record<string, any> = {};
            for (const th of self.thead) {
                if (row[th]) {
                    ret[th] = row[th];
                }
            }
            return ret;
        });

        return this;
    }
}
