# Ref

## 基本用法

通过@Ref可以获取DOM节点，@Ref装饰的变量将被自动绑定为一个只包含current的对象。

通过RefType为TypeScript类型系统提供支持。

```typescript jsx
import { Component, Ref, RefType } from '@decoco/core';

@Component({ tag: 'test-ref' })
export class TestRef extends DecoElement {
  @Ref() containerRef!: RefType<HTMLElement>
  
  componentDidMount() {
    console.log(this.containerRef.current)
    // {current: HTMLDivElement}
  }

  render() {
    return (
      <>
        <div ref={this.containerRef}></div>
      </>
    );
  }
}
```

DOM挂载前，@Ref的current值为undefined。

```typescript jsx
@Component({ tag: 'test-ref' })
export class TestRef extends DecoElement {
  @Ref() containerRef!: RefType<HTMLElement>
  
  componentWillMount() {
    console.log(this.containerRef.current)
    // {current: undefined}
  }

  render() {
    return (
      <>
        <div ref={this.containerRef}></div>
      </>
    );
  }
}
```