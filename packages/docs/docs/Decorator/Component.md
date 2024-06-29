---
sidebar_position: 1
---

## 介绍

Component是用于定义Web组件的装饰器，简单来说，一个最简单的Web组件是通过一个包含render方法且被Component装饰器装饰的类来定义的。

```tsx
@Component({
    tag: 'my-element',
})
export class TestPropElement extends HTMLElement {
    render() {
        return (
            <div></div>
        );
    }
}
```

需要注意的是`@Component`装饰器接收一个对象作为参数，该对象必须包含`tag`属性，该属性的值将作为组件的标签名。以上面的代码为例，在使用时HTML如下所示。

```html
<my-element></my-element>
```

## 参数

Component装饰器接收一个参数，该参数是一个对象，该对象包含以下属性：

```ts
export type ComponentOptions = {
	// tag name
	tag?: string;

	// style string or style sheet object
	style?: string | StyleSheet;
};
```

### tag

tag属性用于指定组件的标签名，该属性是可选的，如果不指定，则默认使用类名作为标签名。
