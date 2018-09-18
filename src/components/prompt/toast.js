// 默认2秒消失
let Toast = {}
Toast.show = (msg, duration = 2000) => {
  let m = document.createElement('div')
  let s = document.createElement('span')
  m.style.cssText = 'width:190px;height:38px;position:absolute;left:0;right:0;bottom:0;top:0;margin:auto;z-index:1000;'
  s.innerHTML = msg
  s.style.cssText = `font-size:14px;min-width:170px;opacity:0.8;display:inline-block;padding:5px;color:rgb(255, 255, 255);text-align:center;border-radius:5px;z-index:999999;font-weight:bold;margin:0 auto;background-color:black;`
  m.appendChild(s)
  document.body.appendChild(m)
  setTimeout(() => {
    let d = 0.5
    m.style.webkitTransition = `-webkit-transform ${d}s ease-in, opacity ${d}s ease-in`
    m.style.opacity = '0'
    setTimeout(() => {
      document.body.removeChild(m)
    }, d * 1000)
  }, duration)
}

export default Toast