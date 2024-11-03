# Prop

## 基本用法

@Prop用于定义组件的prop参数，可以是原始类型，对象，数组等。

```typescript jsx
@Component({
  tag: 'test-prop-reactive',
})
export class TestPropElement extends DecoElement {
  @Prop() num = 1;

  render() {
    return (
      <div>
        <div>
          <i>prop is only allowed to be changed externally</i>
        </div>
        <div>num: {this.num.toString()}</div>
      </div>
    );
  }
}
```

和状态一样，父组件修改Prop将会触发子组件的重新渲染。以上面代码为例，当父组件修改num的值时，子组件也会被重新渲染。


## 单向数据流

Decoco遵循单向数据流规则，这意味着父组件可以通过Prop向子组件传递状态，但是子组件不可以向父组件传递状态。

在开发环境下，直接修改prop是不会生效，并会触发错误提示。

```typescript jsx
@Component({
  tag: 'test-prop-reactive',
})
export class TestPropElement extends DecoElement {
  @Prop() num = 1;
  

  render() {
    return (
      <div>
        <div>
          <div>
            <i>prop is only allowed to be changed externally</i>
          </div>
          <div>num: {this.num.toString()}</div>
          <div>
            <button
              onClick={() => {
                this.num++;
              }}
            >
              changeNum
            </button>
            <button
              onClick={() => {
                this.setAttribute('num', (Number(this.getAttribute('num') || '0') + 1).toString());
              }}
            >
              attribute
            </button>
          </div>
        </div>
      </div>
    );
  }
}

// click changeNum
// warn: prop num can not be set
// click attribute
// re-render num: 2
```
上面代码中changeNum按钮模拟组件内部直接修改prop的情景，attribute按钮模拟父组件修改attribute的情景。前者会失败并触发错误提示，后者会成功且触发重新渲染。