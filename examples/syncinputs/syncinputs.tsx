import { RedactioComponent } from "../../jsx-runtime";

class Synchronizer extends RedactioComponent {
    inputs: HTMLInputElement[];

    constructor() {
        super(
            <>
                <input ref="input1" oninput={ ev => this.synchronize(ev) } />
                <input ref="input2" oninput={ ev => this.synchronize(ev) } />
                <input ref="input3" oninput={ ev => this.synchronize(ev) } />
                <p>But they're always the same!</p>
            </>
        );

        this.inputs = [
            this.refs.input1, 
            this.refs.input2, 
            this.refs.input3
        ] as HTMLInputElement[];
    }

    synchronize(ev: Event) {
        const newValue = (ev.target as HTMLInputElement).value;
        for (const input of this.inputs) input.value = newValue;
    }
}

var app = new Synchronizer;
document.getElementById("root")!.appendChild(app.root);
