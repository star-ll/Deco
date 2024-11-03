# State

## 介绍

在Decoco中，通过`@State()`创建一个状态，每当state改变时，组件都将重新渲染。

```typescript jsx
@Component('test-reactive')
export class TestReactiveElement extends DecoElement {
  @State() data: any = 1;
  @State() age = 1;
  @State() person = {
    age: 1,
    zhangsan: {
      age: 1,
    },
  };
}
```

## 特性

### 异步批量更新和$nextTick

和绝大多数框架一样，Decoco中的状态是异步的，改变状态并不会立即触发重新渲染，而是会在下一次更新循环中批量更新。

```typescript jsx
@Component('test-reactive')
export class TestReactiveElement extends DecoElement {
  @State() age = 1;
  
  render(){
    console.log('render')
    return <div>
      <div>
        <button
          onClick={() => {
            this.age++;
            this.age++;
            this.age++;
          }}
        >
          this.age++
        </button>
      </div>
    </div>
  }
}

// render
// click button
// render
```

这一设计是出于性能考虑，如果需要立刻获取更新后的DOM，可以通过this.$nextTick实现。
```typescript jsx
@Component('test-reactive')
export class TestReactiveElement extends DecoElement {
  @State() age = 1;
  
  render(){
    console.log('render')
    return <div>
      <div>
        <button
          onClick={() => {
            this.age++;
            this.age++;
            this.age++;
            
            this.$nextTick(() => {
              // ...
            })
          }}
        >
          this.age++
        </button>
      </div>
    </div>
  }
}
```

### 深度绑定响应

State是深度绑定响应的，这意味着每次改变State，都会将新值重新绑定为响应式。

```typescript jsx
@Component('test-reactive')
export class TestReactiveElement extends DecoElement {
  @State() data: any = 1;
  @State() age = 1;
  @State() person = {
    age: 1,
    zhangsan: {
      age: 1,
    },
  };
  
  componentDidMount(){
    this.person = { name: 'zhangsan' }
    // 之后改变this.person.name仍会触发重新渲染
  }
}
```

**强烈建议避免将海量数据存放到State中，这将极大地影响性能。**