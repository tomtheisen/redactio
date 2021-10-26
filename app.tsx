namespace JSX {
    interface StandardElement {
        ref?: string;
        class?: string;
        onclick?: (ev: Event) => void;
        hidden?: boolean;
    }
    export interface IntrinsicElements {
        ul: StandardElement;
        li: StandardElement;
        span: StandardElement;
        button: StandardElement;
        input: StandardElement;
        div: StandardElement;
        h1: StandardElement;
        h2: StandardElement;
        pre: StandardElement;
    }
}

type ElementRefs = {[key: string]: HTMLElement | SimpleComponent};
type RenderOutput = { element: HTMLElement, refs: ElementRefs };

function createSimple(
    tag: (new () => SimpleComponent) | string, 
    attrs?: {[key: string]: any}, 
    ...children: (RenderOutput | HTMLElement | string)[]
): RenderOutput {
    let refs = {}, element: HTMLElement, component: SimpleComponent | undefined; 
    if (typeof tag === 'function'){
        component = new tag();
        element = component.element;
    }
    else {
        element = document.createElement(tag);
    }

    for (let child of children) {
        if (typeof child === "string" || child instanceof HTMLElement) {
            element.append(child);
        }
        else if (typeof child === "object") {
            Object.assign(refs, child.refs);
            element.append(child.element);
        }
    }

    for (let attr in attrs) {
        if (attr === "ref") {
            (refs as any)[attrs[attr]] = component ?? element;
        } 
        else {
            if (attr in element) {
                (element as any)[attr] = attrs[attr];
            }
            else {
                element.setAttribute(attr, attrs[attr]);
            }
        }
    }
    return { element, refs };
}

abstract class SimpleComponent {
    readonly element: HTMLElement;
    readonly refs: ElementRefs;

    constructor(arg: RenderOutput) {
        this.element = arg.element;
        this.refs = arg.refs;
    }

    get hidden() {
        return this.element.hidden;
    }
    set hidden(value: boolean) {
        this.element.hidden = value;
    }

    get innerText() {
        return this.element.innerText;
    }
    set innerText(value: string) {
        this.element.innerText = value;
    }

    get classList() {
        return this.element.classList;
    }

    addEventListener(name: string, handler: (ev: Event) => void) {
        this.element.addEventListener(name, handler);
    }
}

interface Arrayish<T> extends Iterable<T> {
    readonly length: number;
    push(t: T): void;
    removeAt(i: number): void;
    insertAt(i: number, value: T): void;
    map<U>(project: (t: T, i: number, arr: Arrayish<T>) => U): U[];

    get(i: number): T;
    set(i: number, value: T): void;
}

class DomArray<T extends SimpleComponent> extends SimpleComponent implements Arrayish<T> {
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

/* App code */

interface ITodoItem {
    name: string;
    done: boolean;
}

interface ITodoList {
    readonly items: Arrayish<ITodoItem>;
    remove(item: ITodoItem): void;
}

class TodoItem extends SimpleComponent implements ITodoItem {
    private list: ITodoList;

    constructor(list: ITodoList, name: string, done = false) {
        super(
            <li class="todo-item">
                <span ref="defaultControls">
                    <span ref="nameSpan" onclick={ ev => !this.done && this.startEdit() }>{name}</span>
                    <button ref="finish" onclick={ ev => this.finish() }>finish</button>
                    <button onclick={ ev => this.list.remove(this) }>remove</button>
                </span>
                <span hidden ref="editControls">
                    <input ref="nameInput" />
                    <button onclick={ ev => this.finishEdit() }>✔</button>
                    <button onclick={ ev => this.cancelEdit() }>✖</button>
                </span>
            </li>);

        this.done = done;
        this.list = list;
    }

    startEdit() {
        const nameInput = this.refs.nameInput as HTMLInputElement;
        nameInput.value = this.refs.nameSpan.innerText ?? '';

        this.refs.defaultControls.hidden = true;
        this.refs.editControls.hidden = false;
    }

    finishEdit() {
        const nameInput = this.refs.nameInput as HTMLInputElement;
        this.refs.nameSpan.innerText = nameInput.value;

        this.refs.defaultControls.hidden = false;
        this.refs.editControls.hidden = true;
    }

    cancelEdit() {
        this.refs.defaultControls.hidden = false;
        this.refs.editControls.hidden = true;
    }

    finish() {
        this.done = true;
        this.refs.finish.hidden = true;
    }

    get name() {
        return this.refs.nameSpan.innerText;
    }
    set name(value: string) {
        this.refs.nameSpan.innerText = value;
    }

    get done() {
        return this.classList.contains("done");
    }
    set done(value: boolean) {
        this.refs.finish.hidden = value;
        this.classList.toggle("done", value);
    }
}

function selectAllAndCopy(el: HTMLElement) {
    const range = document.createRange();
    range.selectNodeContents(el);
    let selection = getSelection();
    if (selection) {
        selection.removeAllRanges();
        selection.addRange(range);
        document.execCommand("copy")
    }    
}

class TodoList extends SimpleComponent implements ITodoList {
    constructor() {
        super(
            <div>
                <h1>Todo</h1>
                <DomArray ref="items" />
                <div>
                    <input ref="nameInput" />
                    <button onclick={ ev => this.add() }>Add</button>
                </div>
                <h2>Export</h2>
                <button onclick={ ev => this.export() }>export</button>
                <pre ref="outputArea" />
            </div>);
    }
    
    get items() { return this.refs.items as DomArray<TodoItem>; }
    get nameInput() { return this.refs.nameInput as HTMLInputElement; }

    export() {
        const result = this.items.map(item => ({ 
            name: item.name, 
            done: item.done,
         }));

         this.refs.outputArea.innerText = JSON.stringify(result, undefined, 4);
         selectAllAndCopy(this.refs.outputArea as any);
    }

    remove(item: ITodoItem): void {
        for (let i = this.items.length - 1; i >= 0; i--) {
            if (this.items.get(i) === item) this.items.removeAt(i);
        }
    }

    add() {
        this.items.push(new TodoItem(this, this.nameInput.value));
        this.nameInput.value = "";
    }
}

var app = new TodoList;
const appDiv = document.getElementById("app")!;
appDiv.append(app.element);
