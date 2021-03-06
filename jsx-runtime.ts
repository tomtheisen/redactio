export namespace JSX {
    interface StandardElement {
        ref?: string;   // used to assign this element to the component's
        class?: string; // who needs className?  we also use setAttribute, which takes "class"
    }

    export type IntrinsicElements = {
        [key in keyof HTMLElementTagNameMap]: StandardElement & Partial<HTMLElementTagNameMap[key]>;
    }
}

export interface SimpleComponentProps {
    ref?: string;
    [key: string]: any;
}

export type ElementRefs = {[key: string]: HTMLElement | RedactioComponent};
export type RenderOutput = { root: HTMLElement | DocumentFragment, refs: ElementRefs };
export type SimpleComponentConstructor = new (props?: SimpleComponentProps) => RedactioComponent;

type Child = RenderOutput | DocumentFragment | HTMLElement | string;

function isRenderOutput(arg: any): arg is RenderOutput {
    return typeof arg.root === "object" && typeof arg.refs === "object";
}

export abstract class RedactioComponent {
    readonly root : HTMLElement | DocumentFragment;
    readonly element: HTMLElement;
    readonly refs: ElementRefs;

    constructor(arg: RenderOutput) {
        this.root = arg.root;
        this.element = arg.root instanceof HTMLElement 
            ? arg.root 
            : arg.root.querySelector("*") ?? document.createElement("p");
        this.refs = arg.refs;
    }

    get classList() { return this.element.classList; }

    get id() { return this.element.id; }
    set id(value: string) { this.element.id = value; }

    get hidden() { return this.element.hidden; }
    set hidden(value: boolean) { this.element.hidden = value; }

    get innerText() { return this.element.innerText; }
    set innerText(value: string) { this.element.innerText = value; }

    get contenteditable() { return this.element.contentEditable; }
    set contenteditable(value: string) { this.element.contentEditable = value; }

    get spellcheck() { return this.element.spellcheck; }
    set spellcheck(value: boolean) { this.element.spellcheck = value; }

    get tabIndex() { return this.element.tabIndex; }
    set tabIndex(value: number) { this.element.tabIndex = value; }

    get title() { return this.element.title; }
    set title(value: string) { this.element.title = value; }

    addEventListener(name: string, handler: (ev: Event) => void) {
        this.element.addEventListener(name, handler);
    }

    querySelector(selectors: string) {
        return this.element.querySelector(selectors);
    }

    querySelectorAll(selectors: string) {
        return this.element.querySelectorAll(selectors);
    }

    focus(options?: FocusOptions) {
        this.element.focus(options)
    }

    blur() {
        this.element.blur();
    }
}

export function jsx(tag: SimpleComponentConstructor | string, attrs?: {[key: string]: any}): RenderOutput {
    let refs = {}, root: HTMLElement | DocumentFragment;
    let component: RedactioComponent | undefined; 
    if (typeof tag === 'function') root = (component = new tag(attrs)).root;
    else root = document.createElement(tag);

    if (attrs?.children) {
        let children: Child | Child[] = attrs?.children ?? [];
        delete attrs.children;
        if (!Array.isArray(children)) children = [children];
        for (let child of children) {
            if (isRenderOutput(child)) {
                Object.assign(refs, child.refs);
                root.append(child.root);
            }
            else root.append(child);
        }
    }

    if (root instanceof HTMLElement) for (let attr in attrs) {
        if (attr === "ref") (refs as any)[attrs[attr]] = component ?? root;
        else if (attr in root) (root as any)[attr] = attrs[attr];
        else root.setAttribute(attr, attrs[attr]);
    }
    return { root, refs };
}
export const jsxs = jsx;

export class Fragment extends RedactioComponent {
    constructor(attrs: { children: Child | Child[] }) {
        const root = document.createDocumentFragment();
        let refs = {};
        let children = Array.isArray(attrs.children) ? attrs.children : [attrs.children];
        for (let child of children) {
            if (isRenderOutput(child)) {
                Object.assign(refs, child.refs);
                root.appendChild(child.root);
            }
            else if (typeof child === "string") {
                root.appendChild(document.createTextNode(child));
            }
            else {
                root.appendChild(child);
            }
        }

        super({ root, refs });
    }
}

export class BackedArray<T extends RedactioComponent> extends RedactioComponent {
    private items: T[] = [];
    constructor(props: SimpleComponentProps) {
        super(jsx(props.tag ?? "ul"));
    }
    
    *[Symbol.iterator](): Iterator<T> {
        for (let i = 0; i < this.length; i++) yield this.get(i);
    }

    get length() { return this.items.length; }

    push(t: T): void {
        this.items.push(t);
        this.element.appendChild(t.element);
    }

    removeAt(i: number): T {
        let removed = this.items.splice(i, 1);
        this.element.removeChild(this.element.children[i]);
        return removed[0];
    }

    insertAt(i: number, value: T): void {
        this.items.splice(i, 0, value);
        this.element.insertBefore(value.element, this.element.children[i])
    }

    get(i: number): T { return this.items[i]; }

    set(i: number, value: T): void {
        this.items[i] = value;
        this.element.children[i].replaceWith(value.element);
    }

    map<U>(project: (t: T, idx: number, arr: BackedArray<T>) => U) {
        const result: U[] = [];
        for (let i = 0; i < this.length; i++) {
            result.push(project(this.get(i), i, this))
        }
        return result;
    }

    filter(predicate: (t: T) => boolean) {
        const result: T[] = [];
        for (let i = 0; i < this.length; i++) {
            const current = this.get(i);
            if (predicate(current)) result.push(current);
        }
        return result;
    }

    toArray() { return this.map(e => e); }
}
