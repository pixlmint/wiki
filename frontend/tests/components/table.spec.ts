import { mount } from "@vue/test-utils";
import { it, expect } from "vitest";
import { readTable } from "@/helpers/htmlTableData";
import Table from "@/components/admin/Editor/tables/Table.vue";
import { render, screen } from "@testing-library/vue";
import { marked } from "marked";
// import EN from "element-plus/lib/locale/lang/en.js";
// import ElementPlus from "element-plus";

// type InferArgs<T> = T extends (...t: [...infer Arg]) => any ? Arg : never;
// type InferReturn<T> = T extends (...t: [...infer Arg]) => infer Res
//     ? Res
//     : never;
//
// function getWrapper<TFunc extends (...args: any[]) => any>(
//     func: TFunc,
// ): (...args: InferArgs<TFunc>) => InferReturn<TFunc> {
//     return (...args: InferArgs<TFunc>) => {
//         // something before
//
//         try {
//             return func(...args);
//         } finally {
//             // something after;
//         }
//     };
// }

// const customRender = getWrapper(render);

// function customRender(ui, overrides) {
//     return render(ui, {
//         global: {
//             plugins: [[ElementPlus]],
//         },
//         ...overrides,
//     });
// }

it("returns the input markdown table when no changes are made", async () => {
    const tbl = "| a | b |\n|---|---|\n| 1 | 2 |";
    console.log(await marked.parse(tbl));
    const wrapper = mount(Table, {
        props: {
            table: await marked.parse(tbl),
            hash: 1,
        },
    });

    // const wrapper = customRender(Table, {
    //     props: {
    //         table: tbl,
    //         hash: 1,
    //     }
    // });

    // const btn = await screen.findByText('Save');
    // btn.click();

    await wrapper.find("button[name='save']").trigger("click");

    const { save } = wrapper.emitted();

    expect(save).toHaveLength(1);
    expect(save[0]).toHaveLength(1);

    const exported = save[0]![0]!;

    console.log(exported);

    expect(exported.md).toBe(tbl);
});
