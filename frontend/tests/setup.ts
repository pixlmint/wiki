import { config } from "@vue/test-utils";

config.global.components = {
    ...config.global.components,
    ElTable: { template: "<div><slot /></div>" },
    ElTableColumn: { template: "<div />" },
    ElInput: { template: "<input />" },
    ElButtonGroup: { template: "<div><slot /></div>" },
    ElButton: { template: "<button type='button'><slot /></button>" },
};
