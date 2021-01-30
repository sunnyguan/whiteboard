import Base from '../svelte/Base.svelte';

const app = new Base({
	target: document.body,
	props: {}
});

window.app = app;

export default app;