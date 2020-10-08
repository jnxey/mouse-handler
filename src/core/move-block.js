import MouseHandler from './mouse-handler';

export default class UseMoveList {
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
    this.currentDom = null; // 当前变动位置的元素
    this.currentKey = null; // 当前变动位置的元素索引
    /*
     * 设置需要进行排序的doms
     * 若是没有传入domlist，将会去wrap内的子元素
     * */
    if (options.domList instanceof Array) {
      this.domList = options.domList;
    } else {
      this.domList = Array.prototype.map.call(this.el.children, (item) => item);
    }
    delete options.domList;
    /*
     * 实例化鼠标事件
     * */
    this.initMouse(options);
  }

  initMouse(options) {
    let press = false;
    this.scrollBody = new MouseHandler(options);
    this.scrollBody.press = (e) => {
      console.log(e);
      press = true;
      this.scrollBody.stop = true;
      this.initDomList(); // 初始化DomList
      this.findElement(e.path);
    };
    this.scrollBody.move = (e, start, end) => {
      // 监听移动，并变更移动块位置
      if (press) {
        console.log(this.currentDom);
        this.setMovePosition(start, end);
      }
    };
    this.scrollBody.over = (e) => {
      press = false;
      this.scrollBody.stop = false;
    };
    // 当前滑动位置
    this.moveStyle = { top: 0, left: 0 };
  }

  /*
   * 初始化元素的位置信息
   * */
  initDomList() {
    this.positions = this.domList.map((dom, key) => {
      return {
        initKey: key,
        top: dom.offsetTop,
        left: dom.offsetLeft
      };
    });
    this.setDomPosition();
  }

  /*
   * 找到当前选中的移动元素
   * */
  findElement(path) {
    path.forEach((dom, key) => {
      if (dom.getAttribute && dom.getAttribute('name') === 'move-block') {
        this.currentDom = dom;
        this.currentKey = dom.getAttribute('move-index');
      }
    });
  }

  /*
   * 设置doms位置
   * */
  setDomPosition() {
    setTimeout(() => {
      this.domList.forEach((dom, key) => {
        const postion = this.positions[key];
        dom.style = `position:absolute;top:${postion.top}px;left:${postion.left}px;`;
      });
    }, 0);
  }

  /*
   * 设置滑动位置
   * */
  setMovePosition(start, end) {
    const moveX = end.x - start.x;
    const moveY = end.y - start.y;
    const currentXY = this.positions[this.currentKey];
    this.currentDom.style = `position:absolute;top:${currentXY.top + moveY}px;left:${currentXY.left + moveX}px;z-index: 100;`;
  }
}
