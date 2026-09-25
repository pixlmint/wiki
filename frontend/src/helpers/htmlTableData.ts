function countColumns(table: HTMLTableElement): number {
    const firstRow =
        table.tBodies[0]?.querySelectorAll<HTMLTableRowElement>("tr")[0];
    return firstRow ? firstRow.cells.length : 0;
}

export class Table {
    thead: Array<string>;
    data: Array<Record<string, any>>;

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

export function readTable(htmlString: string): Table {
    const el = document.createElement("html");
    el.innerHTML = htmlString;
    const html = el.getElementsByTagName("table")[0];
    const table = new Table();

    const headRow =
        html.tHead?.querySelectorAll<HTMLTableRowElement>("tr")[0] ?? null;

    if (headRow !== null) {
        for (const cell of headRow.cells) {
            table.thead.push(cell.innerText);
        }
    } else {
        for (let i = 0; i < countColumns(html); i++) {
            table.thead.push(i + "");
        }
    }

    for (const tBody of html.tBodies) {
        for (const row of tBody.querySelectorAll<HTMLTableRowElement>("tr")) {
            const newRow: Record<string, string> = {};
            let cellIndex = 0;
            for (const cell of row.cells) {
                newRow[table.thead[cellIndex]] = cell.innerText;
                cellIndex++;
            }
            table.data.push(newRow);
        }
    }

    return table;
}
