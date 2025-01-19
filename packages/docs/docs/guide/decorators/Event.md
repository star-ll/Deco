# Event

## 基本用法

通过@Event绑定EventEmitter对象，并通过该对象的emit方法发送事件。发送的事件可以被web组件的addEventLister监听。

```typescript jsx
@Component("emit-event")
export class EmitEvent extends DecoElement {
  @Event() emitter!: EventEmitter;

  render() {
    const onClick = () => {
      this.count++;
      this.emitter!.emit("custom-event", this.count);
    };
    return (
      <div>
        <button onClick={onClick}>+1</button>
      </div>
    );
  }
}
```

## 参数

@Event接受一个EventInit对象作为参数，具体如下：
  
  ```typescript
  interface EventInit {
    bubbles?: boolean;
    cancelable?: boolean;
    composed?: boolean;
  }
  ```

`emitter.emit`接受两个参数

| 参数名       | 类型 | 说明 |
|-----------| ------ | ------ |
| eventName | string | 事件名 |
| data      | any | 事件数据 |

## 事件冒泡

默认情况下，composed和bubbles会被设置为true以便事件可以向上冒泡，这意味着子孙组件一旦发送事件，其父组件以及所有祖先节点都会收到事件，除非事件冒泡过程中通过`e.stopPropagation()`阻止事件冒泡。这一行为与传统框架不同，需要特别注意不要重复发送事件。


# Listen

## 基本用法

通过@Listen绑定事件，监听事件发生后会调用对应的函数。

```typescript jsx
@Component({
	tag: 'hello-world',
})
export class HelloWorld extends DecoElement {
	@Listen('test-event')
	listenTestEvent(e: Event) {
		console.log('listen test event', e);
	}

	render() {
		return (
			<div>
				<emit-event />
			</div>
		);
	}
}
```

## 参数

```typescript jsx
declare function Listen(eventName: string, listenOptions?: ListenOptions): (target: any, methodKey: string) => void;

interface ListenOptions extends AddEventListenerOptions {
  target?: 'body' | 'document' | 'window';
}

interface AddEventListenerOptions extends EventListenerOptions {
  once?: boolean;
  passive?: boolean;
  signal?: AbortSignal;
}

interface EventListenerOptions {
  capture?: boolean;
}
```

默认情况下事件监听器会绑定在组件自身，但是可以通过传入`target`字段来指定监听器绑定的目标。