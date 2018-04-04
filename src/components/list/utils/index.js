import dot from 'dot-object';

export const getUrlParams = (search) => {
	let hashes = search.slice(search.indexOf('?') + 1).split('&');
	hashes = hashes.reduce((params, hash) => {
		let [key, val] = hash.split('=');
		return Object.assign(params, {[key]: decodeURIComponent(val)});
	}, {});
	return dot.object(hashes);
};