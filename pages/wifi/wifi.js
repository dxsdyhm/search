// pages/wifi/wifi.js
const app = getApp()
Page({

  /**
   * 页面的初始数据
   */
  data: {
    currenwifi: '',
    pwd: '',
    wifiList: [],
    showwifis:false,
    bind:false,
    code:''
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function(options) {

  },

  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady: function() {

  },

  /**
   * 生命周期函数--监听页面显示
   */
  onShow: function() {
    wx.startWifi({
      success:res=>{
        this.setCourentWifi();
      }
    })
  },

  getAllWifi() {
    wx.getWifiList()
    //展示转圈
    wx.showLoading({
      title: '搜索Wi-Fi',
    })
  },

  getAllWifiOn(){
    wx.onGetWifiList((res) => {
      //转圈消失，并将wifi列表设置到数据区
      wx.hideLoading()
      console.log(res.wifiList)
      this.setData({
        wifiList: res.wifiList,
        showwifis:true
      })
    })
    wx.startWifi({
      success: res => {
        //不管能不能获取到周围wifi,都需要将当前wifi设置到
        this.setCourentWifi();
        wx.getSetting({
          success: res => {
            console.log(res)
            if (res.authSetting['scope.userLocation']===undefined){
              wx.authorize({
                scope: "scope.userLocation",
                success: () => {
                  this.getAllWifi();
                },
                fail: () => {
                  //没有位置权限，弹窗提示
                  wx.showToast({
                    title: '无法获取周围的wifi',
                    icon: 'none',
                    duration: 1000
                  })
                }
              })
            }else{
              if (!res.authSetting['scope.userLocation']) {
                //被拒绝过，需要打开设置，让用户重新授权
                wx.showModal({
                  title: '定位授权',
                  content: '由于获取周围的wifi,系统需要被授予定位权限',
                  success(res) {
                    if (res.confirm) {
                      wx.openSetting()
                    } else if (res.cancel) {
                      wx.showToast({
                        title: '无法获取周围的wifi',
                        icon: 'none',
                        duration: 1000
                      })
                    }
                  }
                })
              } else {
                this.getAllWifi();
              }
            }
          }
        })
      }
    })
  },
  setCourentWifi() {
    wx.getConnectedWifi({
      success: res => {
        console.log(res.wifi.SSID)
        app.globalData.netconfig.s = res.wifi.SSID;
        this.setData({
          currenwifi: res.wifi.SSID
        })
      }
    })
  },

  /**
   * 生命周期函数--监听页面隐藏
   */
  onHide: function() {

  },

  /**
   * 生命周期函数--监听页面卸载
   */
  onUnload: function() {

  },

  /**
   * 页面相关事件处理函数--监听用户下拉动作
   */
  onPullDownRefresh: function() {

  },

  /**
   * 页面上拉触底事件的处理函数
   */
  onReachBottom: function() {

  },

  /**
   * 用户点击右上角分享
   */
  onShareAppMessage: function() {

  },
  onSSIDChange(event) {
    console.log(event.detail)
    app.globalData.netconfig.s = event.detail;
    this.setData({
      currenwifi: event.detail,
    })
  },
  onPwdChange(event) {
    console.log(event.detail)
    app.globalData.netconfig.p = event.detail;
    this.setData({
      pwd: event.detail,
    })
  },
  toQrcode() {
    if(this.data.bind){
      //需要小程序登陆
      this.loginToServer()
    }else{
      wx.navigateTo({
        url: '../qrcode/qrcode'
      })
    }
  },
  loginToServer() {
    wx.showLoading({
      title: '获取数据',
    })
    wx.login({
      success: res => {
        // 发送 res.code 到后台换取 openId, sessionKey, unionId
        console.log(res)
        this.setData({
          code:res.code
        })
      },
      complete:()=>{
        wx.hideLoading()
      }
    })
  },
  select(event){
    let ssid = event.currentTarget.dataset.wifi
    app.globalData.netconfig.s = ssid;
    this.setData({
      currenwifi: ssid,
      showwifis:false
    })
  },
  onClose() {
    this.setData({ showwifis: false });
  },
  changbind(){
    this.setData({ bind: !this.data.bind });
  }
})