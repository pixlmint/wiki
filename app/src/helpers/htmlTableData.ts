function countColumns(table: HTMLTableElement): number {
    if (table.tBodies.length === 0 || table.tBodies[0].rows.length === 0 || table.tBodies[0].rows[0].cells.length === 0) {
        return 0;
    } else {
       return table.tBodies[0].rows[0].cells.length; 
    }
}

export class Table {
    thead: Array<string>;
    data: Array<Object>;

    constructor () {
        this.thead = [];
        this.data = [];
    }

    width(): number {
        return this.thead.length;
    }

    length(): number {
        return this.data.length;
    }

    spliceRows (start: number, end: number | null = null): Table {
        let deleteCount;
        if (end !== null) {
            deleteCount = end - start;
        } else {
            deleteCount = this.length() - start;
        }

        return this;
    }

    spliceColumns (start: number, end: number | null = null): Table {
        let deleteCount;

        if (end !== null) {
            deleteCount = end - start;
        } else {
            deleteCount = this.width() - start;
        }

        this.thead.splice(start, deleteCount);
        const self = this;

        this.data = this.data.map(row => {
            const ret = {};
            for (const th of self.thead) {
                if (row[th]) {
                    ret[th] = row[th];
                }
            }
            return ret;
        })

        return this;
    }
}

export const readTable = function (htmlString: string): Table {
    const el = document.createElement('html');
    el.innerHTML = htmlString;
    const html = el.getElementsByTagName('table')[0];
    const table = new Table();
    if (html.tHead !== null && html.tHead.rows.length > 0) {
        for (const cell of html.tHead.rows[0].cells) {
            table.thead.push(cell.innerText);
        }
    } else {
        for (let i = 0; i < countColumns(html); i++) {
            table.thead.push(i + "");
        }
    }

    for (const tBody of html.tBodies) {
        for (const row of tBody.rows) {
            const newRow =  {};
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
