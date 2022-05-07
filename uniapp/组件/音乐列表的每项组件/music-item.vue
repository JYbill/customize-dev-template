<template>
	<view>
		<view class="music-item">
			<view class="music-item__index" v-if="isShowIndex">{{index + 1}}</view>
			<view class="music-item__image" v-if="isShowImage">
				<image :src="imageUrl" mode="widthFix"></image>
			</view>
			<view class="music-item__continer">
				<view class="title" :style="{color: mainFontColor}">{{musicTitle}}</view>
				<view class="title-icon">
					<text v-if="privilege.flag >= 68 && privilege.flag <= 74" class="t-icon t-icon-dujia"></text>
					<text v-if="privilege.playMaxbr === 999000" class="t-icon t-icon-sq"></text>
					<text class="desc" :style="{color: secondFontColor}">
						{{singers | formatSingers}}-{{musicTitle}}
					</text>
				</view>
			</view>
			<view class="music-item__icon">
				<text class="iconfont" 
				:class="fontImageClass" 
				:style="{color: iconFontColor}">
				</text>
			</view>
		</view>
	</view>
</template>

<script>
	export default {
		props: {
			musicTitle: String, // 歌曲标题
			singers: Array, // 歌手
			imageUrl: String, // 歌曲图片
			privilege: Object, // 歌曲权限
			// 索引
			index: {
				type: Number,
				default() { return 0; }
			},
			// 是否展示索引
			isShowIndex: {
				type: Boolean,
				default() { return true; }
			},
			// 是否显示图片
			isShowImage: {
				type: Boolean,
				default() { return false; }
			},
			// 一级标题颜色
			mainFontColor: {
				type: String,
				default() { return '#000'; }
			},
			// 次级标题颜色
			secondFontColor: {
				type: String,
				default() { return '#999'; }
			},
			// 字体图标类
			fontImageClass: {
				type: String,
				default() { return 'icon-bofang2'; }
			},
			iconFontColor: {
				type: String,
				default() { return '#999' }
			}
		},
		filters: {
			formatSingers(val) {
				let singer = '';
				val.forEach((item, index) => {
					if (index === val.length - 1) return singer += item.name;
					singer += item.name + '/';
				})
				return singer;
			}
		}
	}
</script>

<style lang="scss" scoped>	
		.music-item {
			display: flex;
			justify-content: space-around;
			font-size: 36rpx;
			height: 100rpx;
			margin-bottom: 30rpx;
			
			.music-item__index { 
				flex: 1;
				color: #999; 
				align-self: center;
			}
			.music-item__image {
				image {
					$img-h-w: 100rpx;
					width: $img-h-w;
					height: $img-h-w;	
					border-radius: 16rpx;
					margin-right: 30rpx;
				}
			}
			.music-item__icon { 
				flex: 1;
				align-self: center;
				
				text {
					color: #999;
					font-size: 54rpx;
				}
			}
			.music-item__continer {
				
				flex: 8;
				display: flex;
				flex-direction: column;
				align-items: flex-start;
				flex-wrap: nowrap;
				height: 100rpx;
				
				.title {
					font-size: 40rpx;
					
					overflow : hidden;
					text-overflow: ellipsis;
					display: -webkit-box;
					-webkit-box-orient: vertical;
					-webkit-line-clamp: 1; 
					word-wrap:break-word;
					word-break:break-all;
				}
				.title-icon {
					color: 30rpx;
					color: #999;
					height: 20rpx;
					line-height: 20rpx;
					display: flex;
					flex-direction: row;
					flex-shrink: 0;
					/* background-color: red; */
					
					
					.t-icon {
						$icon-w-h: 50rpx;
						background-repeat: no-repeat;
						width: $icon-w-h;
						height: $icon-w-h;
						margin: 4rpx;
					}
					.t-icon-sq {
						margin-top: -100px;
						margin-top: -5rpx;
					}
					.desc {
						line-height: 56rpx;
						height: 56rpx;
						font-size: 28rpx;
						width: 60vw;
						
						overflow : hidden;
						text-overflow: ellipsis;
						display: -webkit-box;
						-webkit-box-orient: vertical;
						-webkit-line-clamp: 1; 
						word-wrap:break-word;
						word-break:break-all;
						
						

					}
				}
			}
		}
</style>
