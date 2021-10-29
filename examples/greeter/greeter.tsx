/** @jsxImportSource ../.. */

import { RedactioComponent } from "../../jsx-runtime";

class Greeter extends RedactioComponent {
    constructor() {
        super(
            <div>
                <label>First Name: <input ref="firstName" oninput={() => this.updateName()} /></label>
                <label>Last Name: <input ref="lastName" oninput={() => this.updateName()} /></label>
                <p>Hello, <span ref="fullName" /></p>
            </div>
        );
    }

    get firstName() { return this.refs.firstName as HTMLInputElement; }
    get lastName() { return this.refs.lastName as HTMLInputElement; }

    updateName() {
        const fullName = this.firstName.value + ' ' + this.lastName.value;
        this.refs.fullName.innerText = fullName;
    }
}

var app = new Greeter;
document.getElementById("root")!.append(app.element);
