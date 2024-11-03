# @Watch

## 基本用法

通过@Watch装饰监听函数，来实现监听状态或prop的效果，监听的目标只能是State或者Prop。

```typescript jsx
@Component('test-watch')
export default class TestWatch extends DecoElement {
  @State() state = { name: 'name' };

  @Watch(['state', 'state.name'])
  watchName(value: unknown) {
    console.log(value);
  }
  
}
```

## 参数

### @Watch参数

@Watch接收两个参数

1. 监听目标，以字符串形式传入
2. 监听选项，对象形式传入

其中监听对象支持传入以下参数
  - immediate： 是否立即执行
  - once： 是否只监听一次

```typescript jsx
@Component('test-watch')
export default class TestWatch extends DecoElement {
  @Watch(['value'])
  watchValue(val: number, oldValue: number, cleanup: () => void) {
    console.log('watch value', val, oldValue);
    cleanup();
  }

  @Watch(['value'], { once: true })
  watchValueOnce(val: number, oldValue: number, cleanup: () => void) {
    console.log('watch once value', val, oldValue);
  }

  @Watch(['value'], { immediate: true })
  watchValueImmediate(val: number, oldValue: number, cleanup: () => void) {
    console.log('watch value, immediate run', val, oldValue);
  }
}
```

### 监听器函数参数
每一个@Watch装饰的监听器函数都接收三个参数：
1. value： 新值
2. oldValue： 旧值
3. cleanup： 关闭当前监听器的回调函数

```typescript jsx
@Component('test-watch')
export default class TestWatch extends DecoElement {
  @State() state = { name: 'name' };

  @Watch(['state', 'state.name'])
  watchName(value: unknown) {
    console.log(value);
    cleaup()
    // 后续改变状态不再触发此监听器
  }
  
}
```

## 丢失监听

@Watch会将初始值和监听器进行绑定，因此对于引用值而言，如果在运行中改变的对象的指向，那么就会造成监听的丢失。

```typescript jsx
// ...
@Component('test-watch')
export default class TestWatch extends DecoElement {
  @State() state = { name: 'name' };

  @Watch(['state', 'state.name'])
  watchName(value: unknown) {
    console.log(value);
  }

  render() {
    const changeState = () => {
      this.state = { name: 'change state' };
    };
    const changeStateName = () => {
      this.state.name = 'change name';
    };

    return (
      <div>
        <button onClick={changeState}>change state</button>
        <button onClick={changeStateName}>change state name</button>
      </div>
    );
  }
}

changeStateName() // change name
changeState() // change state
changeState() // change state
changeStateName() // not print
changeStateName() // not print
```
