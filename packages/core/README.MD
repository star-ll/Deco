
# 特点
- 自动深度响应
- 基于装饰器模式
- 完善的组件API设计
- 支持JSX and TypeScript

# roadmap
- [x] auto deep reactivity
- [x] JSX and TypeScript
- [x] @Component
- [x] @Prop
- [x] @State
- [X] @Event and @Listen
- [ ] @useRaw
- [x] @Ref
- [x] @Watch
- [x] Scheduler
- [ ] lifecycle
- [ ] test
- [ ] docs and demo
- [ ] performance optimization
- [ ] more...


# API

## @Prop

### Example
```tsx
export class MButton extends HTMLElement {
	@Prop() color: 'primary' | 'warn' | 'success' | 'danger' = 'primary';
	@Prop() disabled: boolean = false;
	@Prop() loading: boolean = false;
	@Prop() icon?: string = undefined;
	@Prop() type: 'primary' | 'dashed' | 'hollow' | 'text' | 'flat' = 'primary';

	render() {
		return (
			<button disabled={this.disabled}> 
				<slot></slot>
			</button>
		);
	}
}
```

## State
### 备忘

1. 可选链（自动深度绑定）
```tsx
// ...
{
	// ...
	@State() person: any = { };
	render() {
		const onClick = () => {
			if (this.person.jeck) {
				this.person.jeck.age++; // re-render
			} else {
				this.person.jeck = { age: 1 }; // re-render, because this jeck object is automatically bind deep reactivity
			}
		};

		return (
			<button onClick={onClick}>
				{this.person?.jeck?.age}
			</button>
		)
	}
}
```

2. 三目运算符（切换绑定状态）
```tsx
// ...
{
	// ...
	@State() isGood: boolean = false;
	@State() person: any = { zhangsan: { age: 10 }, jeck: { age: 1 } };
	render() {
		let age = this.isGood ? this.person.zhangsan.age : this.person.jeck.age;

		const onClick = () => {
			this.isGood = true;
		};

		return <button onClick={onClick}>{age}</button>;
	}
}
```

### Example
```tsx
export class MButton extends HTMLElement {
	@State() isLoading: boolean = false;

    render() {
		const onClick = () => {
			this.isLoading = !this.isLoading; // re-render
		};

		return (
			<button isLoading={this.isLoading} onClick={onClick}>
				<slot></slot>
			</button>
		);
	}
}
```

## @Watch

### Example
```tsx
export class MButton extends HTMLElement {
	@State() isLoading: boolean = false;

	@Watch(['isLoading'])
	onIsLoadingChange(value: boolean, oldValue: boolean, clear: Function) {
		console.log('onIsLoadingChange', value, oldValue, clear);
		clear(); // clear watch
	}

	render() {
		const onClick = () => {
			this.isLoading = !this.isLoading;
		};

		return (
			<button onClick={onClick}>
				<slot></slot>
			</button>
		);
	}
}
```