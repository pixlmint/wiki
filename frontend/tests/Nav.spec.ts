import { expect, test } from "vitest";
import { render } from "vitest-browser-vue";
import Nav from "../src/components/pw/nav/nav.vue";

test("renders the nav correctly", async () => {
    const { getByText, getByRole } = render(Nav);
});
