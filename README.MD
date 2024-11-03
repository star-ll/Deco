# Decoco

## Introduce

Decoco is an efficient Web Component framework based on decorator-driven development. It provides a new way to build reusable components and simplifies common programming tasks such as event listening and state management through decorators.

## Packages

- packages/core: core module(include decorator api, runtime and reactive api...).
- packages/renderer: render module(jsx to dom).
- packages/docs: document module(todo)
- packages/examples: for test and demo.
- packages/cli: cli module(dveloping).
- packages/devtools: browser develop devtools (dveloping).

## Start

create a decoco project

```bash
npm create decoco@latest
```

create a web component

```typescript jsx
import {Component,DecoElement,Event,Prop,Ref,RefType,State,Watch,EventEmitter,} from "@decoco/core";

@Component("hello-world")
export class HelloWorld extends DecoElement {
  @State() count = 0;
  @Prop() message = "Hello World!";
  @Event() emitter!: EventEmitter;
  @Ref() hostElement!: RefType<HTMLDivElement>;

  @Watch(["count"])
  onCountUpdate(value: number, oldValue: number, cleanup: () => void) {
    console.log("count update", value, oldValue);
    cleanup();
  }

  componentWillMount(): void {
    console.log(this.hostElement.current);
  }

  componentDidMount(): void {
    console.log(this.hostElement.current);
  }

  shouldComponentUpdate(): boolean {
    return true;
  }
  componentDidUpdate(): void {
    console.log(this.count);
  }

  render() {
    const onClick = () => {
      this.count++;
      this.emitter!.emit("click", this.count);
    };
    return (
      <div ref={this.hostElement}>
        <h1>{this.message}</h1>
        <div>
          <section>count: {this.count}</section>
          <button onClick={onClick}>+1</button>
        </div>
      </div>
    );
  }
}

```

## Document

[documents (developing)](https://star-ll.github.io/Deco/)

## Contributing

```shell
pnpm install
pnpm run --filter <package, e.g. core> dev
```
