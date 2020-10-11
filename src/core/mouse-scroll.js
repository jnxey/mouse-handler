import { printLog, openLog, deepCopy } from './log';
import MouseHandler from './mouse-handler';

openLog('move-block');

export default class UseScroll {
  /*
   * options只需要传入 id, wrapHeight: 480, domWidth: 480, domHeight: Y, direction: 'y',
   * id元素布局必需是非static，内部项的style尽量为null
   * 所有移动块上需设置name="move-block" :move-index="key"
   * 当进行布局时，将会是一个非常耗费性能的操作
   * */
  constructor(options) {
    /*
     * 这里仅获取当前调用组件内的元素
     * 若是其他地方有重复组件（如首屏滑块），需要将排序数据存入store
     * */
    if (options.el instanceof Node) this.el = options.el;
    else throw Error('el must be a Element');
    /*
     * 实例化鼠标事件
     * */
    this.initMouse(options);
  }

  initMouse(options) {
    this.scrollBody = new MouseHandler(options);
    let isScroll = null;
    let startY = 0;
    // 移动动作
    this.scrollBody.move = (e, start, end) => {
      // 监听移动，并变更移动块位置
      // 当纵向 / 横向 移动比例超过3，且纵向长度超过30px，即认定开始滚动
      const x = end.x - start.x;
      const y = end.y - start.y;-
      if (isScroll === null) {
        const ratio = Math.abs(y) / Math.abs(x);
        if (ratio > 3 && y > 30) {
          isScroll = true;
          startY = y;
        }
      }
      if (isScroll) {
        this.setDomScroll(y - startY);
      }
    };
  }

  /*
   * 设置元素的位置信息
   * */
  setDomScroll(y) {
    this.el.setAttribute('style', `transform:translate(0, ${y}px)`);
  }
}
