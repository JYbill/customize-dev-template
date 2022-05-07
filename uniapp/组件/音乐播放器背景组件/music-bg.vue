<template>
	<view class="bg-continer">
		<view v-if="bgUrl" class="bg" 
		:style="{backgroundImage: `url(${bgUrl})`}"></view>
	</view>
</template>

<script>
	export default {
		props: {
			bgUrl: {
				type: String,
				default() { return null; }
			}
		}
	}
</script>

<style lang="scss" scoped>
	.bg-continer {
		position: absolute;
		top: 0;
		left: 0;
		width: 100vw;
		height: 100vh;
		z-index: -1;
		overflow: hidden;
		.bg {
			width: 100%;
			height: 100%;
			background-repeat: no-repeat;
			background-size: cover;
			background-position: center 0;
			filter: blur(10px);
			transform: scale(1.2); /* 消除滤镜白边*/
		}
	}
</style>
