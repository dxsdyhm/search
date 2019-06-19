// pages/search/search.js
Page({

  /**
   * 页面的初始数据
   */
  data: {
    searchResult:[],
    value:""
  },
  showImage(event){
    var imgurl=event.currentTarget.dataset.url;
    wx.previewImage({
      current: imgurl, // 当前显示图片的http链接
      urls: [imgurl] // 需要预览的图片http链接列表
    })
  },
  searchByCode:function(){
    wx.scanCode({
      success: res=> {
        this.setData({
          value: res.result
        })
        this.searchByKey(res.result)
      }
    })
  },
  searchByKey:function(keyword){
    wx.showLoading({
      title: '加载中',
    })
    wx.request({
      url: 'https://dev.oss.qmorn.com/qmorn/oss/app/res/book/search', //仅为示例，并非真实的接口地址
      method:'POST',
      data: {
        'key': keyword,
      },
      header: {
        'content-type': 'application/json', // 默认值
        'token':'C5D9921FD458477CBEF5F6484DBBEC6D'
      },
      success:res=> {
        wx.hideLoading();
        if (res.statusCode == 200){
          this.setData({
            searchResult: res.data.bookList
          })
          if (res.data.bookList.length<=0){
            wx.showToast({
              title: '没有查询到数据',
              icon:'none'
            })
          }
        }else{
            wx.showToast({
              title: '网络请求失败',
              icon: 'none'
            })
        }
      },
      fail:error => {
        wx.hideLoading();
      }
    })
  },

  onSearch:function(key){
    this.setData({
      value: key.detail
    })
    this.searchByKey(key.detail)
  },
  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    // this.searchByKey(this.data.value)
    wx.showToast({
      title: '输入书名或者ISBN查询',
      icon: 'none'
    })
  },

  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady: function () {
    
  },

  /**
   * 生命周期函数--监听页面显示
   */
  onShow: function () {

  },

  /**
   * 生命周期函数--监听页面隐藏
   */
  onHide: function () {

  },

  /**
   * 生命周期函数--监听页面卸载
   */
  onUnload: function () {

  },

  /**
   * 页面相关事件处理函数--监听用户下拉动作
   */
  onPullDownRefresh: function () {

  },

  /**
   * 页面上拉触底事件的处理函数
   */
  onReachBottom: function () {

  },

  /**
   * 用户点击右上角分享
   */
  onShareAppMessage: function () {

  }
})