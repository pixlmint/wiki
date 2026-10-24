export interface MdTable {
    original: string;
    parsed: string;
    hash: number;
    updated?: string;
}

export type TableData = {
    thead: string[];
    data: string[][];
    hasHeading: boolean;
};
