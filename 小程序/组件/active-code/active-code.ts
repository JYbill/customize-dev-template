
Component({
	/**
	 * 组件的属性列表
	 */
	properties: {

	},

	/**
	 * 组件的初始数据
	 */
	data: {
    inputLength: 6, // input长度、input个数
    activeVal: '', // 验证码
    isFocus: false, // 是否自动聚焦输入框
	},

	/**
	 * 组件的方法列表
	 */
	methods: {

    /**
     * 点击输入验证码input
     * @param e 
     */
    tapInput(e: any): void {
      console.log(e.detail);
      this.setData({ isFocus: true });
    },

    /**
     * 输入input
     */
    inputing(): void {}
	}
})
