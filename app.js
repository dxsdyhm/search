//app.js
App({
  onLaunch: function () {
    wx.getSystemInfo({
      success: res => {
        console.log(res);
        this.globalData.systemInfo=res;
      }
    })
  },
  globalData: {
    header:{
      apiV: '1',
      appV: '16777228',
      appID: 'D2FCF180E43044859F3AD196F3E1F0EC',
      Lan: 'zh',
      uid: '0',
      sid: '0'
    },
    userInfo: null,
    netconfig:{
      s:'',
      p:'',
      u:''
    },
    systemInfo: {}
  },
  isIos(){
    return this.globalData.systemInfo.platform == "ios";
  }
})