/** @jsxImportSource . */

import { jsx, SimpleComponent, SimpleComponentProps } from "./jsx-runtime";

export class BackedArray<T extends SimpleComponent> extends SimpleComponent {
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
}
