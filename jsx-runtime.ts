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
export type RenderOutput = { element: HTMLElement, refs: ElementRefs };
export type SimpleComponentConstructor = new (props?: SimpleComponentProps) => RedactioComponent;

function isRenderOutput(arg: any): arg is RenderOutput {
    return arg.element instanceof HTMLElement && typeof arg.refs === "object";
}

export abstract class RedactioComponent {
    readonly element: HTMLElement;
    readonly refs: ElementRefs;

    constructor(arg: RenderOutput) {
        this.element = arg.element;
        this.refs = arg.refs;
    }

    get hidden() { return this.element.hidden; }
    set hidden(value: boolean) { this.element.hidden = value; }

    get innerText() { return this.element.innerText; }
    set innerText(value: string) { this.element.innerText = value; }

    get classList() { return this.element.classList; }

    addEventListener(name: string, handler: (ev: Event) => void) {
        this.element.addEventListener(name, handler);
    }
}

export function jsx(tag: SimpleComponentConstructor | string, attrs?: {[key: string]: any}): RenderOutput {
    let refs = {}, element: HTMLElement, component: RedactioComponent | undefined; 
    if (typeof tag === 'function') element = (component = new tag(attrs)).element;
    else element = document.createElement(tag);

    if (attrs?.children) {
        let children: (RenderOutput | HTMLElement | string)[] = attrs?.children ?? [];
        delete attrs.children;
        if (!Array.isArray(children)) children = [children];
        for (let child of children) {
            if (isRenderOutput(child)) {
                Object.assign(refs, child.refs);
                element.append(child.element);
            }
            else element.append(child);
        }
    }

    for (let attr in attrs) {
        if (attr === "ref") (refs as any)[attrs[attr]] = component ?? element;
        else if (attr in element) (element as any)[attr] = attrs[attr];
        else element.setAttribute(attr, attrs[attr]);
    }
    return { element, refs };
}
export const jsxs = jsx;

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
