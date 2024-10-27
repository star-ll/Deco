import clsx from 'clsx';
import Heading from '@theme/Heading';
import styles from './styles.module.css';

type FeatureItem = {
	title: string;
	Svg: React.ComponentType<React.ComponentProps<'svg'>>;
	description: JSX.Element;
};

const FeatureList: FeatureItem[] = [
	{
		title: '高效装饰器驱动开发',
		Svg: require('@site/static/img/undraw_docusaurus_mountain.svg').default,
		description: <>简化组件开发，提升效率与可读性，自动化底层逻辑处理。</>,
	},
	{
		title: '响应式状态管理',
		Svg: require('@site/static/img/undraw_docusaurus_tree.svg').default,
		description: <>自动状态跟踪，最小化重渲染，简化数据管理，支持自定义监听。</>,
	},
	{
		title: '一体化可构造样式表',
		Svg: require('@site/static/img/undraw_docusaurus_react.svg').default,
		description: <>Shadow DOM支持，样式隔离与全局管理，提高复用性与维护性。</>,
	},
];

function Feature({ title, Svg, description }: FeatureItem) {
	return (
		<div className={clsx('col col--4')}>
			<div className="text--center">
				<Svg className={styles.featureSvg} role="img" />
			</div>
			<div className="text--center padding-horiz--md">
				<Heading as="h3">{title}</Heading>
				<p>{description}</p>
			</div>
		</div>
	);
}

export default function HomepageFeatures(): JSX.Element {
	return (
		<section className={styles.features}>
			<div className="container">
				<div className="row">
					{FeatureList.map((props, idx) => (
						<Feature key={idx} {...props} />
					))}
				</div>
			</div>
		</section>
	);
}
