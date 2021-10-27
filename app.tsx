/** @jsxImportSource . */
import { selectAllAndCopy } from './clipboard';
import { SimpleComponent } from './jsx-runtime';
import { Arrayish,  DomArray,  } from './simcom';

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

    get name() { return this.refs.nameSpan.innerText; }
    set name(value: string) { this.refs.nameSpan.innerText = value; }

    get done() { return this.classList.contains("done"); }
    set done(value: boolean) { this.classList.toggle("done", this.refs.finish.hidden = value); }
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
document.getElementById("app")!.append(app.element);
