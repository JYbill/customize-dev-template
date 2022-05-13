import http from '../http.js';

const label = {
	label_list() { return http({ name: 'get_label-list' }) }
}

export default {
	label
}