export function createTemplateNode(body: string, style = ''): HTMLTemplateElement {
	const template = document.createElement('template');
	template.innerHTML = `
        <style>
            ${style}
        </style>
        ${body}
        `;
	return template;
}
