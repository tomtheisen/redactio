function h (tag: Function | string, attrs?: {[key: string]: any}, ...children: (HTMLElement | string)[]): HTMLElement {
    if (typeof tag === 'function') throw 'function tags not supported';

    let result = document.createElement(tag);
    for (let attr in attrs) result.setAttribute(attr, attrs[attr]);
    result.append(...children);
    return result;
}

interface SimpleComponent {
    readonly element: HTMLElement;
}

interface Arrayish<T> {
    readonly length: number;
    push(t: T): void;
    removeAt(i: number): void;
    insertAt(i: number, value: T): void;

    get(i: number): T;
    set(i: number, value: T): void;
}

interface ITodoItem {
    name: string;
    done: boolean;
}

interface ITodoList {
    readonly items: Arrayish<ITodoItem>;
}

class TodoItem implements ITodoItem, SimpleComponent {
    readonly element: HTMLElement;
    private nameSpan: HTMLElement;
    private nameInput: HTMLInputElement;

    constructor(name: string, done = false) {
        let finishButton, editButton;
        this.element = <li>
            {this.nameSpan = <span />}
            {this.nameInput = <input hidden />}
            {editButton = <button>edit</button>}            
            {finishButton = <button>finish</button>}
        </li>;

        this.name = name;
        this.done = done;

        finishButton.addEventListener("click", ev => {
            this.done = true;
            finishButton.hidden = true;
        });
        editButton.addEventListener("click", ev => {
            if (!this.isEditing()) {
                this.nameInput.value = this.nameSpan.textContent ?? '';
                this.setEditing(true);
            }
            else {
                this.nameSpan.textContent = this.nameInput.value;
                this.setEditing(false);
            }
        });
    }

    isEditing(): boolean {
        return this.nameSpan.hidden;
    }

    setEditing(state: boolean) {
        this.nameSpan.hidden = state;
        this.nameInput.hidden = !state;
    }

    get name() {
        return this.nameSpan.innerText;
    }
    set name(value: string) {
        this.nameSpan.innerText = value;
    }

    get done() {
        return this.element.classList.contains("done");
    }
    set done(value: boolean) {
        this.element.classList.toggle("done", value);
    }
}

class DomArray<T extends SimpleComponent> implements Arrayish<T>, SimpleComponent {
    readonly element = <ul />;
    private items: T[] = [];
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

class TodoList implements ITodoList, SimpleComponent {
    readonly element: HTMLElement;;
    readonly items = new DomArray<TodoItem>();
    private nameInput = <input />;
    private addButton = <button>Add</button>;

    constructor() {
        this.element = <div>{this.items.element}{this.nameInput}{this.addButton}</div>;

        this.addButton.addEventListener("click", ev => {
            let item = new TodoItem(this.nameInput.value);
            this.nameInput.value = "";
            this.items.push(item);
        });
    }
}

var app = new TodoList;
document.querySelector("#app")?.append(app.element);

