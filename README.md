*The DOM is the Truth, and the Truth shall set you free.*

# Redactio

Wanna make a web app?  Wanna use JSX?  Don't want all the react drama? Well, that's what we're doing here.  Honestly though, you'd probably be better off with react.  It's better documented, tested, more widely used, and has (significantly) non-zero usage.

But if you like to live dangerously, maybe you'll like this little number right here.

 * Redactio components are thin wrappers around DOM elements.
 * Most state is kept *in* the DOM.
 * No diffing or reconciliation is needed or possible.
 * The whole library is so small it barely exists.  The heavy lifting of TSX/JSX transformation is handled by the typescript compiler.

## Example

### index.html
```html
<!DOCTYPE html>
<html>
    <head>
        <title>Greeter</title>
    </head>
    <body>
        <div id="root"></div>
        <script src="bundle.js"></script> <!-- bundler output -->
    </body>
</html>
```

### greeter.tsx
```tsx
/** @jsxImportSource redactio */

import { RedactioComponent } from "redactio";

class Greeter extends RedactioComponent {
    constructor() {
        super(
            <div>
                <label>First Name: 
                    <input ref="firstName" oninput={ev => this.updateName()} />
                </label>
                <label>Last Name: 
                    <input ref="lastName" oninput={ev => this.updateName()} />
                </label>
                <p>Hello, <span ref="fullName" /></p>
            </div>);
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
```

### tsconfig.json

```json
{
  "compilerOptions": {
    "target": "ES6",
    "jsx": "react",
    "module": "ES6",
    "moduleResolution": "node",
    "strict": true
  }
}
```

### Build

```
npx tsc
npx esbuild --bundle --outfile=bundle.js greeter.js
```
