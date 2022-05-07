<template>
	<view class="status-bar" :style="{height: marginTop + 'px'}"></view>
</template>

<script>
	export default {
		data() {
			return {
				marginTop: 0
			}
		},
		created() {
			// 获取胶囊离顶端的高度
			const {top} = uni.getMenuButtonBoundingClientRect()
			this.marginTop = top;
		}
	}
</script>

<style lang="scss">
	.status-bar {
		width: 100%;
	}
</style>
