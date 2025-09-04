const myapp: IAppOption = getApp<IAppOption>();

Component({
	/**
	 * 组件的属性列表
	 */
	properties: {
    articleId: String,
    title: String,
    viewCounts: Number,
    author: String,
    imageUrl: String
	},

	/**
	 * 组件的初始数据
	 */
	data: {
    config: '123'
	},

	/**
	 * 组件的方法列表
	 */
	methods: {
    tapNavToArticle(): void {
      wx.navigateTo({ 
        url: `/pages/article/article?id=${this.properties.articleId}` 
      })
    }
	},

  lifetimes: {
    attached(): void {
      this.setData({
        config: myapp.globalData.config
      })
    }
  }
})
