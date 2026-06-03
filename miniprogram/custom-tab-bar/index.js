Component({
  data: {
    selected: 0,
    list: [
      {
        pagePath: '/pages/index/index',
        text: '首页',
        icon: 'home',
      },
      {
        pagePath: '/pages/data/data',
        text: '汇总',
        icon: 'data',
      },
      {
        pagePath: '/pages/mine/mine',
        text: '我的',
        icon: 'mine',
      },
    ],
  },

  methods: {
    switchTab(event) {
      const dataset = event.currentTarget.dataset
      const index = Number(dataset.index)
      const url = dataset.path
      if (!url || index === this.data.selected) {
        return
      }
      wx.switchTab({ url })
    },
  },
})
