export namespace JSX {
    interface StandardElement {
        ref?: string;
        class?: string;
        onclick?: (ev: Event) => void;
        hidden?: boolean;
    }
    export interface IntrinsicElements {
        // todo: better
        p: StandardElement;
        ul: StandardElement;
        ol: StandardElement
        li: StandardElement;
        div: StandardElement;
        span: StandardElement;
        form: StandardElement;
        button: StandardElement;
        input: StandardElement;
        h1: StandardElement;
        h2: StandardElement;
        h3: StandardElement;
        h4: StandardElement;
        h5: StandardElement;
        h6: StandardElement;
        pre: StandardElement;
        img: StandardElement & { src: string; }
    }
}
