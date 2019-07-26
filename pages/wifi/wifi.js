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
    uid:0,
    errormessage:''
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
    this.checkwifi5g();
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
        wx.request({
          url: 'https://api1.q-links.net:10081/app/user/getidbythirdinfo', //仅为示例，并非真实的接口地址
          method: 'POST',
          data: {
            'thirdType': 2,
            'thirdAccessCode': res.code
          },
          success: res => {
            wx.hideLoading();
            if (res.statusCode == 200) {
              console.log(res)
              app.globalData.netconfig.u = res.data.data.uid+'';
              this.setData({
                uid: res.data.uid
              })
              wx.navigateTo({
                url: '../qrcode/qrcode'
              })
            } else {
              this.loginfail();
            }
          },
          fail: error => {
            wx.hideLoading();
          }
        })
      },
      fail:error=>{
        //登陆失败，是否重新选择仅配网
        //如果登陆失败是因为没有账号，则提示注册
        wx.hideLoading();
        this.loginfail();
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
    })
    this.checkwifi5g();
  },
  onClose() {
    this.setData({ showwifis: false });
  },
  changbind(){
    this.setData({ bind: !this.data.bind });
  },
  //取信息失败引导注册
  loginerror(){
    wx.showModal({
      content: '你还没有注册，是否使用此微信号注册',
      success(res) {
        if (res.confirm) {
          //转入注册
          //转入小程序登陆接口
        } else if (res.cancel) {
          console.log('用户点击取消')
        }
      }
    })
  },
  //取信息失败引导仅配网
  loginfail() {
    wx.showModal({
      content: '你还没有注册，是否仅配置网络?',
      success:res=> {
        if (res.confirm) {
          //修改绑定选项
          this.setData({
            bind:false
          })
          wx.navigateTo({
            url: '../qrcode/qrcode'
          })
        } else if (res.cancel) {
          console.log('用户点击取消')
        }
      }
    })
  },
  checkwifi5g(){
    //预检5G，结果不一定准确
    if (this.data.currenwifi.indexOf('5G')!=-1) {
      this.setData({
        errormessage: '设备不支持5G,当前选择的Wi-Fi有可能是5G'
      })
    } else {
      this.setData({
        errormessage: ''
      })
    }
  }
})