/** @jsxImportSource . */

import { SimpleComponent } from "./jsx-runtime";

export interface Arrayish<T> extends Iterable<T> {
    readonly length: number;
    push(t: T): void;
    removeAt(i: number): void;
    insertAt(i: number, value: T): void;
    map<U>(project: (t: T, i: number, arr: Arrayish<T>) => U): U[];

    get(i: number): T;
    set(i: number, value: T): void;
}

export class DomArray<T extends SimpleComponent> extends SimpleComponent implements Arrayish<T> {
    // todo: make the dom the truth
    private items: T[] = [];
    constructor() {
        super(<ul />);
    }
    
    *[Symbol.iterator](): Iterator<T> {
        for (let i = 0; i < this.length; i++) {
            yield this.get(i);
        }
    }

    get length() {
        return this.items.length;
    }
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
    get(i: number): T {
        return this.items[i];
    }
    set(i: number, value: T): void {
        this.items[i] = value;
        this.element.children[i].replaceWith(value.element);
    }

    map<U>(project: (t: T, idx: number, arr: Arrayish<T>) => U) {
        const result: U[] = [];
        for (let i = 0; i < this.length; i++) {
            result.push(project(this.get(i), i, this))
        }
        return result;
    }
}
