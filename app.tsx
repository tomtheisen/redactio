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
            refs[attrs[attr]] = component ?? element;
        } 
        else {
            element.setAttribute(attr, attrs[attr]);
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

interface Arrayish<T> {
    readonly length: number;
    push(t: T): void;
    removeAt(i: number): void;
    insertAt(i: number, value: T): void;

    get(i: number): T;
    set(i: number, value: T): void;
}

class DomArray<T extends SimpleComponent> extends SimpleComponent implements Arrayish<T> {
    // todo: make the dom the truth
    private items: T[] = [];
    constructor() {
        super(<ul />);
    }

    get length() {
        return this.items.length;
    }
    push(t: T): void {
        this.items.push(t);
        this.element.appendChild(t.element);
    }
    removeAt(i: number): void {
        this.items.splice(i, 1);
        this.element.removeChild(this.element.children[i]);
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
}

/* App code */

interface ITodoItem {
    name: string;
    done: boolean;
}

interface ITodoList {
    readonly items: Arrayish<ITodoItem>;
}

class TodoItem extends SimpleComponent implements ITodoItem {
    constructor(name: string, done = false) {
        super(<li>
            <span ref="nameSpan">{name}</span>
            <input hidden ref="nameInput" />
            <button ref="edit">edit</button>         
            <button ref="finish">finish</button>
        </li>);

        this.done = done;

        this.refs.finish.addEventListener("click", ev => this.finish());
        this.refs.edit.addEventListener("click", ev => this.edit());
    }

    finish() {
        this.done = true;
        this.refs.finish.hidden = true;
    }

    edit() {
        const nameInput = this.refs.nameInput as HTMLInputElement;
        if (!this.editing) {
            nameInput.value = this.refs.nameSpan.innerText ?? '';
            this.editing = true;
        }
        else {
            this.refs.nameSpan.innerText = nameInput.value;
            this.editing = false;
        }
    }

    get editing() {
        return this.refs.nameSpan.hidden;
    }
    set editing(state: boolean) {
        this.refs.nameSpan.hidden = state;
        this.refs.nameInput.hidden = !state;
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
        this.classList.toggle("done", value);
    }
}

class TodoList extends SimpleComponent implements ITodoList {
    readonly items: DomArray<TodoItem>;

    constructor() {
        super(<div>
            <DomArray ref="items" />
            <input ref="name" />
            <button ref="add">Add</button>
        </div>);

        this.items = this.refs.items as any;

        this.refs.add.addEventListener("click", ev => {
            let nameInput = this.refs.name as HTMLInputElement;
            let item = new TodoItem(nameInput.value);
            nameInput.value = "";
            this.items.push(item);
        });
    }
}

var app = new TodoList;
const appDiv = document.getElementById("app")!;
appDiv.append(app.element);
