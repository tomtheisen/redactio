export { JSX } from './jsx-types';

export abstract class SimpleComponent {
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

export type ElementRefs = {[key: string]: HTMLElement | SimpleComponent};
export type RenderOutput = { element: HTMLElement, refs: ElementRefs };

export function jsx(tag: (new () => SimpleComponent) | string, attrs?: {[key: string]: any}): RenderOutput {
    let refs = {}, element: HTMLElement, component: SimpleComponent | undefined; 
    if (typeof tag === 'function'){
        component = new tag();
        element = component.element;
    }
    else element = document.createElement(tag);

    if (attrs?.children) {
        const children: (RenderOutput | HTMLElement | string)[] = attrs?.children ?? [];
        delete attrs.children;
        for (let child of children) {
            if (typeof child === "string" || child instanceof HTMLElement) {
                element.append(child);
            }
            else if (typeof child === "object") {
                Object.assign(refs, child.refs);
                element.append(child.element);
            }
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
