/// <reference types="vite/client" />

declare module "*.vue" {
    import { defineComponent } from "vue";
    const Component: ReturnType<typeof defineComponent>;
    export default Component;
}

declare const MathJax: {
    typeset(...elements: unknown[]): void;
    typesetPromise(...elements: unknown[]): Promise<unknown>;
    startup: {
        promise: Promise<unknown>;
        ready: Promise<unknown>;
    };
};
