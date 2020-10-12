import { printLog, openLog, deepCopy } from './utils';
import MouseHandler from './mouse-handler';

var rAF = window.requestAnimationFrame	||
	window.webkitRequestAnimationFrame	||
	window.mozRequestAnimationFrame		||
	window.oRequestAnimationFrame		||
	window.msRequestAnimationFrame		||
	function (callback) { window.setTimeout(callback, 1000 / 60); };

openLog('move-block');

export default class UseScrollY {
  /*
   * */
  constructor(options) {
    /*
     * 这里仅获取当前调用组件内的元素
     * 若是其他地方有重复组件（如首屏滑块），需要将排序数据存入store
     * */
    if (options.wrap instanceof Node) this.wrap = options.wrap;
    else throw Error('wrap must be a Element');
    if (options.el instanceof Node) this.el = options.el;
    else throw Error('el must be a Element');
    this.scrollY = 0;
    this.lastScrollY = 0;
    this.maxScrollHeight = this.el.clientHeight - this.wrap.clientHeight;
    /*
     * 实例化鼠标事件
     * */
    if(this.maxScrollHeight > 0) {
      this.initMouse(options);
    }
    this.timer = null;
    this.wrapHeight = this.wrap.clientHeight;
    this.elHeight = this.el.clientHeight;

    this.maxScrollHeight = this.elHeight - this.wrapHeight;
  }

  initMouse(options) {
    this.scrollBody = new MouseHandler(options);
    let isScroll = null;
    let isdown = false;
    let startY = 0;
    let endY = 0;
    let startTime = 0;
    let endTime = 0;
    this.scrollBody.down = (e) => {
      isdown = true;
    };
    // 移动动作
    this.scrollBody.move = (e, start, end) => {
      if(!isdown) return;
      // 监听移动，并变更移动块位置
      // 当纵向 / 横向 移动比例超过3，且纵向长度超过30px，即认定开始滚动
      const x = end.x - start.x;
      const y = end.y - start.y;
      if (isScroll === null) {
        const ratio = Math.abs(y) / (Math.abs(x) + 1);
        if (ratio >= 3 && Math.abs(y) >= 30) {
          startTime = new Date().getTime();
          isScroll = true;
          startY = y;
        }
      }
      if (isScroll) {
        endY = y;
        this.scrollBody.stop = true;
        this.setScrollY(y - startY);
      }
    };

    this.scrollBody.over = (e) => {
      this.scrollBody.stop = false;
      this.lastScrollY = this.scrollY;
      // 检查滑动速度，设置缓冲距离
      endTime = new Date().getTime();
      let moveTime = endTime - startTime;
      let moveDistance = endY - startY;
      let speedRate = moveDistance / moveTime;
      if(Math.abs(speedRate) > 0.5) {
        // 进行缓冲
        speedRate = speedRate > 0 ? -1 : 1;
        this.setDomScrollBuffer(speedRate * 100);
      }
      isScroll = null;
      isdown = false;
      startY = 0;
    };
  }

  /**
   * 设置scrolly
   */
  setScrollY(y) {
    // y表示当前鼠标按下动作过程滚动距离
    let result = true;
    let next = this.lastScrollY - y;
    if(next < 0) {
      next = 0;
      result = false;
    } else if(next >= this.maxScrollHeight) {
      next = this.maxScrollHeight;
      result = false;
    }
    this.scrollY = next;
    this.setDomScroll(next);
    return result;
  }

  /**
   * scroll to top
   */
  startToTop(callback) {
    this.timer = setInterval(() => {
      const result = this.setScrollY(1);
      this.lastScrollY = this.scrollY;
      if(callback && result) callback(1);
    }, 16);
  }

  /**
   * scroll to bottom
   */
  startToBottom(callback) {
    this.timer = setInterval(() => {
      const result = this.setScrollY(-1);
      this.lastScrollY = this.scrollY;
      if(callback && result) callback(-1);
    }, 16);
  }
  
  /**
   * stop scroll to bottom
   */
  stopScrolly() {
    if(this.timer) clearInterval(this.timer);
  }

  /*
   * 设置元素的位置信息
   * */
  setDomScroll(scrolly) {
    rAF(() => {
      this.el.setAttribute('style', `transform:translate(0, -${scrolly}px)`);
    });
  }

  /*
   * 设置缓冲
   * */
  setDomScrollBuffer(sy) {
    let next = this.lastScrollY + sy;
    if(next < 0) {
      next = 0;
    } else if(next >= this.maxScrollHeight) {
      next = this.maxScrollHeight;
    }
    const distance = Math.abs(next - this.lastScrollY);
    let slideTime = distance / 800;
    this.lastScrollY = next;
    // rAF(() => {

    // })
    this.el.setAttribute('style', `transform:translate(0, -${next}px);transition: all ${slideTime}s;`);
    setTimeout(() => {
      this.el.setAttribute('style', `transform:translate(0, -${next}px);`);
    }, 500);
  }

  /**
   * 销毁实例缓存
   */
  destroy() {
    this.wrap = null;
    this.el = null;
  }
}
