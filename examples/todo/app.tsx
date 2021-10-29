/** @jsxImportSource ../.. */
import { selectAllAndCopy } from './clipboard';
import { RedactioComponent, BackedArray } from '../../jsx-runtime';

class TodoItem extends RedactioComponent {
    private list: TodoList;

    constructor(list: TodoList, name: string, done = false) {
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
                    <button onclick={ ev => this.showEditControls(false) }>✖</button>
                </span>
            </li>);

        this.done = done;
        this.list = list;
    }

    startEdit() {
        this.nameEditing = this.name ?? '';
        this.showEditControls(true);
    }

    finishEdit() {
        this.name = this.nameEditing;
        this.showEditControls(false);
    }

    showEditControls(val: boolean) {
        this.refs.defaultControls.hidden = val;
        this.refs.editControls.hidden = !val;
    }

    finish() {
        this.done = true;
        this.refs.finish.hidden = true;
    }

    get name() { return this.refs.nameSpan.innerText; }
    set name(value: string) { this.refs.nameSpan.innerText = value; }

    get nameInput() { return this.refs.nameInput as HTMLInputElement; }
    get nameEditing() { return this.nameInput.value; }
    set nameEditing(value: string) { this.nameInput.value = value; }

    get done() { return this.classList.contains("done"); }
    set done(value: boolean) { this.classList.toggle("done", this.refs.finish.hidden = value); }
}

class TodoList extends RedactioComponent {
    constructor() {
        super(
            <div>
                <h1>Todo</h1>
                <BackedArray ref="items" tag="ol" />
                <div>
                    <input ref="nameInput" />
                    <button onclick={ ev => this.add() }>Add</button>
                </div>
                <h2>Export</h2>
                <button onclick={ ev => this.export() }>export</button>
                <pre ref="outputArea" />
            </div>);
    }
    
    get items() { return this.refs.items as BackedArray<TodoItem>; }
    get nameInput() { return this.refs.nameInput as HTMLInputElement; }

    export() {
        const result = this.items.map(item => ({ 
            name: item.name, 
            done: item.done,
         }));

         this.refs.outputArea.innerText = JSON.stringify(result, undefined, 4);
         selectAllAndCopy(this.refs.outputArea as any);
    }

    remove(item: TodoItem): void {
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
