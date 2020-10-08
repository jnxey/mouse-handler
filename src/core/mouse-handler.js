// 事件
const EVENT_TYPE = {
  click: 'click', // 点击事件
  press: 'press', // 长按事件
  pressEnd: 'pressEnd', // 长按结束
  move: 'move' // 拖拽
  // 放入插件去判断
  // toTop: 'toTop', // 上滑
  // toBottom: 'toBottom', // 下滑
  // leftToRight: 'leftToRight', // 左->右
  // rightToleft: 'rightToleft', // 右->左
  // topEdge: 'topEdge', // 顶部边缘下滑
  // bottomEdge: 'bottomEdge', // 底部边缘上滑
  // leftEdge: 'leftEdge', // 左边缘右滑
  // rightEdge: 'rightEdge', // 右边缘左滑
};

const ASSERT_MOVE = 20; // 断言长按与移动,px
const ASSERT_PRESS = 300; // 断言点击长按,ms

// 监听一个元素内的鼠标事件
export default class MouseHandler {
  constructor(options) {
    if (options.el instanceof Node) this.el = options.el;
    else throw Error('el must be a Element');
    this.$options = options; // 内含一系列钩子
    this.initData();
    /*
     * 每次鼠标动作都有3个状态
     * 按下、移动、抬起（down，move，up）
     * 通过分析动作，确定鼠标操作的场景，并抛出一系列的钩子
     * --------------------
     * 场景包括:
     * 点击 * 长按 * 移动 * 上滑 * 下滑 * 左->右 * 右->左 * 顶部边缘下滑 * 底部边缘上滑 * 左边缘右滑 * 右边缘左滑
     * --------------------
     * 钩子包括:
     * click * press * pressEnd * toTop * toBottom * leftToRight * rightToleft * topEdge * bottomEdge * leftEdge * rightEdge
     * --------------------
     * 现在先分析 长按->拖拽 场景
     * */
    this.el.addEventListener('mousedown', this.mousedown.bind(this));
    this.el.addEventListener('mousemove', this.mousemove.bind(this));
    // this.el.addEventListener('mouseup', this.mouseup.bind(this));
    document.addEventListener('mouseup', this.mouseup.bind(this));
  }

  // 初始化值
  initData() {
    this.scene = null; // 当前动作场景
    this.action = null; // 动作状态
    this.downtime = 0; // 按下时的时间
    this.uptime = 0; //抬起的时间
    this.startCoor = { x: 0, y: 0 }; // 按下时鼠标位置
    this.moveCoor = { x: 0, y: 0 }; // 移动时鼠标位置
    this.endCoor = { x: 0, y: 0 }; // 放开时时鼠标位置
    this.stop = false;
  }

  // 鼠标按下
  mousedown(e) {
    if (this.stop) e.stopPropagation();
    this.setAction('down'); // 鼠标按下
    this.downtime = new Date().getTime();
    this.startCoor = { x: e.x, y: e.y };
    setTimeout(() => {
      // 当超过断言值时
      console.log('action------------------------' + this.action);
      if (this.action && this.action !== 'up' && this.assertPressOrMove().isPress) {
        this.setScene('press');
        if (typeof this.press === 'function') this.press(e);
      }
    }, this.$options.pressDelay || ASSERT_PRESS);
  }

  // 鼠标移动
  mousemove(e) {
    if (this.stop) e.stopPropagation();
    this.moveCoor = { x: e.x, y: e.y };
    // this.setAction('move'); // 鼠标按下
    if (typeof this.move === 'function') this.move(e, this.startCoor, this.moveCoor);
  }

  // 鼠标抬起
  mouseup(e) {
    if (this.stop) e.stopPropagation();
    this.setAction('up'); // 鼠标按下
    this.uptime = new Date().getTime();
    const during = this.uptime - this.downtime;
    this.endCoor = { x: e.x, y: e.y };
    // 断言是点击还是长按：scene未被设置，且点击间隔少于 ASSERT_PRESS
    if (during <= (this.$options.pressDelay || ASSERT_PRESS)) {
      this.setScene('click');
      if (typeof this.click === 'function') this.click(e);
    } else if (this.assertPressOrMove().isPress) {
      this.setScene('pressEnd');
      if (typeof this.pressEnd === 'function') this.pressEnd(e);
    }
    this.eventOver();
  }

  // 断言当前是长按还是移动，
  assertPressOrMove() {
    const _x = Math.abs(this.startCoor.x - this.moveCoor.x);
    const _y = Math.abs(this.startCoor.x - this.moveCoor.x);
    let isPress = false;
    if (_x <= ASSERT_MOVE && _y <= ASSERT_MOVE) {
      isPress = true;
    }
    return { isPress, isMove: !isPress };
  }

  // 设置当前场景
  setScene(scene) {
    console.log('---------------------' + scene);
    this.scene = scene;
  }

  // 设置当前动作
  setAction(action) {
    console.log('---------------------' + action);
    this.action = action;
  }

  // 一个事件的结束
  eventOver(e) {
    if (typeof this.over === 'function') this.over(e);
    this.initData();
  }
}
