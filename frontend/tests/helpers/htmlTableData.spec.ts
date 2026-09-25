import { it, expect } from "vitest";
import { readTable } from "@/helpers/htmlTableData";

it("properly parses basic table", () => {
    const tableHtml = `<table><thead><tr><th>hello</th><th>world</th></tr></thead><tbody><tr><td></td><td></td></tr></tbody></table>`;
    const table = readTable(tableHtml);

    expect(table.width()).toBe(2);
    expect(table.length()).toBe(1);
});

it("parses table without header", () => {
    const tableHtml = `<table><tbody><tr><td></td><td></td></tr></tbody></table>`;
    const table = readTable(tableHtml);

    expect(table.width()).toBe(2);
    expect(table.length()).toBe(1);
});

it("parses empty table", () => {
    const tableHtml = `<table></table>`;
    const table = readTable(tableHtml);

    expect(table.width()).toBe(0);
    expect(table.length()).toBe(0);
});

it("correctly splices rows", () => {
    const tableHtml = `<table><thead><tr><th>hello</th><th>world</th></tr></thead><tbody><tr><td></td><td></td></tr></tbody></table>`;
    const table = readTable(tableHtml);

    table.spliceRows(0, 1);

    expect(table.width()).toBe(2);
    expect(table.length()).toBe(0);
});

it("correctly splices columns", () => {
    const tableHtml = `<table><thead><tr><th>hello</th><th>world</th></tr></thead><tbody><tr><td></td><td></td></tr></tbody></table>`;
    const table = readTable(tableHtml);

    table.spliceColumns(0, 1);

    expect(table.width()).toBe(1);
    expect(table.length()).toBe(1);
});
