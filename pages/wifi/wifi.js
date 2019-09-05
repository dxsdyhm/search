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
    showwifis: false,
    bind: false,
    uid: 0,
    errormessage: '',
    wifilisttimeout:0
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
      success: res => {
        this.setCourentWifi();
      },
      fail: res => {
        console.log(res)
      }
    })
  },

  checkwifiopen(){
    wx.getNetworkType({
      success: res=>{
        if(res.networkType==='wifi'){
          this.getAllWifiOn();
        }else{
          wx.showToast({
            title: '请打开手机wifi',
            icon: "warn",
            duration: 2000
          })
        }
      },
      fail:res=>{
        //提示用户打开手机wifi
        wx.showToast({
          title: '请打开手机的wifi',
          icon: 'warn',
          duration: 2000
        })
      }
    })
  },

  getAllWifi() {
    wx.getWifiList()
    //展示转圈
    wx.showLoading({
      title: '搜索Wi-Fi',
    })
    //设置超时，超时结束后检查获取到的列表数量，如果为0 提示用户可能需要打开位置信息
    if(!app.isIos()){
      let timeid = setTimeout(() => {
        let len = this.data.wifiList.length
        if (len <= 0) {
          wx.showToast({
            title: '周围没有搜索到wifi，请打开位置信息（GPS）开关',
          })
        }
      }, 6000)
      this.setData({
        wifilisttimeout: timeid
      })
    }
  },

  getAllWifiOn() {
    wx.onGetWifiList(res => {
      //转圈消失，并将wifi列表设置到数据区
      clearTimeout(this.data.wifilisttimeout)
      wx.hideLoading()
      console.log(res.wifiList)
      this.setData({
        wifiList: res.wifiList,
        showwifis: true
      })
    })
    wx.startWifi({
      success: res => {
        //不管能不能获取到周围wifi,都需要将当前wifi设置到
        this.setCourentWifi();
        //如果是iOS，则不需要获取wifi列表
        if (app.isIos()){
          wx.showToast({
            title: '系统不可获取wifi列表',
            icon: "warn"
          })
          return;
        }
        console.log("android 获取wifi列表")
        wx.getSetting({
          success: res => {
            console.log(res)
            if (res.authSetting['scope.userLocation'] === undefined) {
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
            } else {
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
        this.checkwifi5g();
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
    clearTimeout(this.data.wifilisttimeout)
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
    if (this.data.bind) {
      //需要小程序登陆
      this.loginToServer(1)
    } else {
      wx.navigateTo({
        url: '../qrcode/qrcode'
      })
    }
  },
  loginToServer(type) {
    wx.showLoading({
      title: '获取数据',
    })
    wx.login({
      success: res => {
        if (type === 1) {
          //先查询是否存在这个用户的id，然后决定是否注册（防止踢飞）
          this.checkidfromeServer(res);
        } else {
          //已经检查过id，这里直接注册（登陆）
          this.loginfromServer(res);
        }
      },
      fail: error => {
        //登陆失败，是否重新选择仅配网
        //如果登陆失败是因为没有账号，则提示注册
        wx.hideLoading();
        this.loginfail();
      },
      complete: () => {
        wx.hideLoading()
      }
    })
  },
  select(event) {
    let ssid = event.currentTarget.dataset.wifi
    app.globalData.netconfig.s = ssid;
    this.setData({
      currenwifi: ssid,
    })
    this.checkwifi5g();
  },
  onClose() {
    this.setData({
      showwifis: false
    });
  },
  changbind() {
    this.setData({
      bind: !this.data.bind
    });
  },
  //取信息失败引导注册
  loginerror() {
    wx.showModal({
      content: '你还没有注册，是否使用当前微信号注册',
      success:res=> {
        if (res.confirm) {
          //转入注册
          //转入小程序登陆接口
          this.loginToServer(2)
        } else if (res.cancel) {
          console.log('用户点击取消')
        }
      }
    })
  },
  //取信息失败引导仅配网
  loginfail() {
    //引导注册
    wx.showModal({
      content: '请求失败，是否仅配置网络?',
      success: res => {
        if (res.confirm) {
          //修改绑定选项
          this.setData({
            bind: false
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
  checkwifi5g() {
    //预检5G，结果不一定准确
    if (this.data.currenwifi.indexOf('5G') != -1) {
      this.setData({
        errormessage: '设备不支持5G,当前选择的Wi-Fi有可能是5G'
      })
    } else {
      this.setData({
        errormessage: ''
      })
    }
  },

  // 发送 res.code 到后台换取 openId, sessionKey, unionId
  checkidfromeServer(res) {
    wx.request({
      url: 'https://api1.q-links.net:10081/app/user/getidbythirdinfo', //仅为示例，并非真实的接口地址
      method: 'POST',
      data: {
        'thirdType': 2,
        'thirdAccessCode': res.code
      },
      success: res => {
        wx.hideLoading();
        console.log(res)
        if (res.data.code==='0') {
          app.globalData.netconfig.u = res.data.data.uid + '';
          this.setData({
            uid: res.data.data.uid
          })
          wx.navigateTo({
            url: '../qrcode/qrcode'
          })
        } else if (res.data.code === '10901007'){
          //没有获取到用户id,转注册
          this.loginerror();
        } else{
          //其他错误
          this.loginfail();
        }
      },
      fail: error => {
        wx.hideLoading();
        this.loginfail();
      }
    })
  },

  loginfromServer(res) {
    //调用登陆接口获取用户id
    wx.request({
      url: 'https://api1.q-links.net:10081/app/user/thirdlogin2', //仅为示例，并非真实的接口地址
      method: 'POST',
      header:app.globalData.header,
      data: {
        'thirdType': 2,
        'thirdAccessCode': res.code,
        'option': 'getAliyunIotInfo',
        'appOs': 50,
        'appToken': '97D0E83CD2ED48b0A511590B78EA3B0AC09B6234AFCF4bfa9B73BF8199BEA302',
        'packageName': 'com.qmx.qimengxing'
      },
      success: res => {
        wx.hideLoading();
        console.log(res)
        if (res.data.code=='0') {
          app.globalData.netconfig.u = res.data.data.uid + '';
          this.setData({
            uid: res.data.data.uid
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
        this.loginfail();
      }
    })
  }
})