import { Component, DecoElement } from "@decoco/core";

@Component()
export class HelloWorld extends DecoElement {
  render() {
    return <h1>Hello World!</h1>;
  }
}
