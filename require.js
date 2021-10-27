let define, require;

{
    function normalize(name) {
        return name.replace(/^\.\//, '');
    }

    const modules = { };

    modules.require = require = function (name) {
        return modules[normalize(name)];
    };

    modules.define = define = function (name, depNames, fn) {
        let exports = {};
        const deps = depNames.map(name => name === "exports" ? exports : require(name));
        modules[name] = fn.apply(null, deps) ?? exports;
    }
}
