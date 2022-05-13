<template>
	<button class="list-share" open-type="share" :style="{width: width}">
		<text class="iconfont icon-fenxiang" v-if="isShowIcon"></text>
		<text class="share">{{title}}</text>
	</button>
</template>

<script>
	export default {
		props: {
			title: {
				type: String,
				default() { return '分享给微信好友'; }
			},
			isShowIcon: {
				type: Boolean,
				default() { return true }
			},
			width: {
				type: String,
				default() { return '480rpx'; }
			}
		}
	}
</script>

<style lang="scss" scoped>
	.list-share {
		margin-top: 40rpx;
		color: $list-font-color;
		text-align: center;
		width: 480rpx;
		height: 100rpx;
		background-color: rgba(0, 0, 0, 0.2);
		border-radius: 50rpx;
		line-height: 100rpx;
		font-size: 36rpx;
		margin-bottom: 50rpx;
		
		.icon-fenxiang {margin-right: 20rpx; font-size: 38rpx;}
	}
</style>
