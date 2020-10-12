import { printLog, openLog, deepCopy } from './log';
import MouseHandler from './mouse-handler';

openLog('move-block');

export default class UseDragSort {
  /*
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
    // 移动中排序定时器
    this.moveTimer = null;
    /*
     * 实例化鼠标事件
     * */
    this.initMouse(options);
    // 获取与重置数据源
    this.getList = options.getList;
    this.resetList = options.resetList;
    // 移动中的样式
    this.activeClass = options.activeClass || '';
    this.currentBaseClass = '';
    this.scroll = options.scroll;
    this.fixScrollY = 0;
    this.cacheMove = null;
  }

  // 查找滚动元素
  getScrollEle() {
    // 找到父级是否有需要滚动的元素
    let result = null;
    const parents = findParents(this.el);
    parents.forEach((ele) => {
      if(ele.getAttribute('scroll') === 'y') {
        result = {
          dom: ele,
          x: ele.clientWidth,
          y: ele.clientHeight
        };
      }
    });
    return result;
  }

  // 初始化鼠标事件
  initMouse(options) {
    let press = false;
    this.scrollBody = new MouseHandler(options);
    // 长按动作
    this.scrollBody.press = (e) => {
      press = true;
      this.scrollBody.stop = true;
      this.initDomList(e); // 初始化DomList
    };
    // 移动动作
    this.scrollBody.move = (e, start, end) => {
      // 监听移动，并变更移动块位置
      if(this.scroll) this.scroll.stopScrolly();
      if (press && this.currentKey !== null) {
        this.moveTimerHandler();
        this.setMovePosition(start, end);
      }
    };
    // 结束动作
    this.scrollBody.over = (e) => {
      if (press && this.currentKey !== null) {
        // 当鼠标松开时执行的方法
        this.moveOver();
      }
      press = false;
      this.scrollBody.stop = false;
    };
  }

  /*
   * 初始化元素的位置信息
   * */
  initDomList(e) {
    this.scrollEle = this.getScrollEle();
    /*
     * 设置需要进行排序的doms
     * */
    this.domList = Array.prototype.map.call(
      this.el.querySelectorAll('[name=move-block]'),
      (item) => item
    );
    /**
     * 注意：这里的positions与domList的顺序可能不一致（根据y、x轴进行排序）
     */
    this.positions = this.domList.map((dom, key) => {
      const parent = dom.parentElement;
      const top = parent.offsetTop;
      const left = parent.offsetLeft;
      const width = dom.clientWidth;
      const height = dom.clientHeight;
      const unid = dom.getAttribute('unid');
      return {
        unid,
        key,
        top,
        left,
        width,
        height,
        scopeX: [left, left + width],
        scopeY: [top, top + height],
        translate: {
          x: 0,
          y: 0
        }
      };
    });
    this.resetPositions();
    this.findElement(e.getPath());
    this.setDomPosition();
  }

  /*
   * 找到当前选中的移动元素
   * */
  findElement(path) {
    path.forEach((dom, key) => {
      if (dom.getAttribute && dom.getAttribute('name') === 'move-block') {
        this.currentDom = dom;
        this.currentBaseClass = dom.getAttribute('class');
        this.currentKey = this.positions.findIndex(
          (v) => v.key === Number(dom.getAttribute('move-index'))
        );
        this.currentDom.setAttribute('class', this.currentBaseClass + ' ' + this.activeClass);
      }
    });
  }

  /*
   * 设置滑动位置
   * */
  setMovePosition(start, end) {
    this.cacheMove = { start, end };
    const moveX = end.x - start.x;
    const moveY = end.y - start.y + this.fixScrollY;
    const currentXY = this.positions[this.currentKey];
    const translate = currentXY.moving || currentXY.translate;
    currentXY.moveX = moveX;
    currentXY.moveY = moveY;
    this.currentDom.setAttribute(
      'style',
      `
      position:absolute;
      top:0;
      left:0;
      transform:translate(${translate.x + moveX}px, ${translate.y + moveY}px);
      z-index: 100;
    `
    );
  }

  /*
   * 向上滚动 -1
   * */
  scrollTop() {
    if(!this.cacheMove) return;
    this.fixScrollY -= 1;
    this.setMovePosition(this.cacheMove.start, this.cacheMove.end);
  }

  /*
   * 向下滚动 +1
   * */
  scrollBottom() {
    if(!this.cacheMove) return;
    this.fixScrollY += 1;
    this.setMovePosition(this.cacheMove.start, this.cacheMove.end);
  }

  /*
   * 设置开始移动doms位置
   * */
  setDomPosition() {
    if (this.currentKey === null) return;
    const currentXY = this.positions[this.currentKey];
    const translate = currentXY.translate;
    this.currentDom.setAttribute(
      'style',
      `
      position:absolute;
      top:0;
      left:0;
      transform:translate(${translate.x}px, ${translate.y}px);
      z-index: 100;
    `
    );
  }

  /**
   * 解放元素
   */
  setFreeElement() {
    const currentXY = this.positions[this.currentKey];
    const translate = currentXY.translate;
    delete currentXY.moving;
    const style = `
      transform:translate(${translate.x}px, ${translate.y}px);
    `;
    this.currentDom.setAttribute(
      'style',
      `
      ${style}
      position:absolute;
      top:0;
      left:0;
      transition: all 0.5s;
      z-index: 100;
    `
    );
    setTimeout(() => {
      this.currentDom.setAttribute('class', this.currentBaseClass);
      this.currentDom.setAttribute('style', style);
    }, 500);
  }

  /**
   * 记录移动过程中的信息，并设置定时器，处理排序任务
   */
  moveTimerHandler(position) {
    if (this.moveTimer) clearTimeout(this.moveTimer);
    this.moveTimer = setTimeout(() => {
      const status = this.resetQuene();
      if(status === 'none') {
        // 判断是否处于需要上下滚动的内容中
        if(this.scrollEle && this.scroll) {
          const scrollDOM = this.scrollEle.dom;
          const currentDOM = this.currentDom;
          const scrollRECT = this.scrollEle;
          const currentXY = this.positions[this.currentKey];
          const translate = { x: currentXY.moveX, y: currentXY.moveY};
          const offset = getOffsetDOM(this.currentDom, scrollDOM, translate);
          console.log('scrollRECT' + JSON.stringify(scrollRECT));
          console.log('offset' + JSON.stringify(offset));
          console.log('currentDOM' + JSON.stringify(currentDOM.clientHeight));
          const status = judgeScroll(scrollRECT, offset, currentDOM.clientHeight, this.fixScrollY, this.scroll.scrollY);
          if(status === 'top') {
            this.scroll.startToTop(() => {
              this.scrollTop();
            });
          } else if(status === 'bottom') {
            this.scroll.startToBottom(() => {
              this.scrollBottom();
            });
          }
        }
      }
    }, 300);
  }

  /**
   * 当鼠标停下超过300毫秒，将会判断是否触发排序
   */
  resetQuene() {
    let result = 'none';
    const currentXY = this.positions[this.currentKey];
    const currentTranslate = currentXY.moving || currentXY.translate;
    const currentX = currentXY.left + currentXY.moveX + currentTranslate.x;
    const currentY = currentXY.top + currentXY.moveY + currentTranslate.y;
    const currentKey = this.currentKey;
    this.positions.forEach((position, key) => {
      if (currentKey !== key) {
        const translate = position.translate;
        const _x = Math.abs(position.left + translate.x - currentX);
        const _y = Math.abs(position.top + translate.y - currentY);
        if (_x <= 30 && _y <= 30) {
          printLog('重新排序：' + this.currentKey + '---to---' + key, 'move-block');
          result = 'resort';
          // 当往前排时，替换的元素往前挪
          /** 对positions重新排序 **/
          const moveInfo = this.cacheChangePositions(currentKey, key, this.positions);
          moveInfo.forEach((move) => {
            printLog(move, 'move-block');
            if (move.moving) this.positions[move.from].moving = move.moving;
            this.positions[move.from].translate = move.translate;
          });
          // 排序动作
          this.resetQueneDom();
          // 重新对positions进行排序
          this.currentKey = key;
          this.resetPositions();
        }
      }
    });
    return result;
  }

  /**
   * 缓存位置变更信息
   */
  cacheChangePositions(currentKey, key, positions) {
    let moveInfo = [];
    moveInfo.push({
      from: currentKey,
      to: key,
      translate: { ...this.domToPosition(positions[currentKey], positions[key]) },
      moving: { ...(positions[currentKey].moving || positions[currentKey].translate) }
    });
    if (currentKey < key) {
      // 当往前排时，currentKey - key 的元素往前挪
      for (let i = currentKey + 1; i <= key; i++) {
        moveInfo.push({
          from: i,
          to: i - 1,
          translate: { ...this.domToPosition(positions[i], positions[i - 1]) }
        });
      }
    } else {
      // 当往后排时，key - currentKey 的元素往后挪
      for (let i = key; i < currentKey; i++) {
        moveInfo.push({
          from: i,
          to: i - 1,
          translate: { ...this.domToPosition(positions[i], positions[i + 1]) }
        });
      }
    }
    return moveInfo;
  }

  /**
   * 移动一个元素到后一个的位置
   */
  domToPosition(p1, p2) {
    const x = p2.left + p2.translate.x - p1.left;
    const y = p2.top + p2.translate.y - p1.top;
    return { x, y };
  }

  /**
   * 针对重新排的position设置位置
   * 注：dom顺序不变，绝对定位变了
   */
  resetQueneDom() {
    const currentKey = this.currentKey;
    this.positions.forEach((position, key) => {
      if (currentKey === key) return;
      const dom = this.domList[position.key];
      const translate = position.translate;
      const style = `
        transform:translate(${translate.x}px, ${translate.y}px);
      `;
      dom.setAttribute(
        'style',
        `${style}
        transition: all 0.5s;
      `
      );
      setTimeout(() => {
        dom.setAttribute('style', style);
      }, 500);
    });
  }

  /**
   * 重新对positions进行排序
   * 首先根据纵坐标排序，再进行横坐标排序
   * 排序方式，从小到大
   */
  resetPositions() {
    this.positions = this.positions.sort(function (a, b) {
      const ayx =
        ('0000000000' + (a.top + a.translate.y)).slice(-10) +
        ('0000000000' + (a.left + a.translate.x)).slice(-10);
      const byx =
        ('0000000000' + (b.top + b.translate.y)).slice(-10) +
        ('0000000000' + (b.left + b.translate.x)).slice(-10);
      return ayx > byx ? 1 : -1;
    });
  }

  /**
   * 设置松开事件
   */
  moveOver() {
    this.setFreeElement();
    setTimeout(() => {
      this.resortdom();
      // 对数据进行清空
      this.resetData();
    }, 500);
  }

  /**
   * 对dom进行重写排序
   */
  resortdom() {
    let result = [];
    let list = this.getList();
    this.positions.forEach((position, key) => {
      result[key] = list[position.key];
    });
    this.domList.forEach((dom) => {
      dom.setAttribute('style', '');
    });
    this.resetList(result);
  }

  /**
   * 清空数据
   */
  resetData() {
    clearTimeout(this.moveTimer);
    this.moveTimer = null;
    this.positions = null;
    this.currentKey = null;
    this.currentDom = null;
    this.domList = [];
    this.scrollEle = null;
    this.cacheMove = null;
    this.fixScrollY = 0;
  }

  /**
   * 销毁实例缓存
   */
  destory() {
    clearTimeout(this.moveTimer);
    this.moveTimer = null;
    this.positions = null;
    this.currentKey = null;
    this.currentDom = null;
    this.domList = [];
    this.scrollEle = null;
    this.cacheMove = null;
    this.fixScrollY = 0;
    // 全部清除
    this.el = null;
    this.scroll = null;
    
  }
}

/**
 * 查找某一个元素的父级
 */
function findParents(Node) {
  let result = [Node];
  const target = Node;
  let parent = target.parentElement;
  while (parent) {
    result.push(parent);
    parent = parent.parentElement;
  }
  return result;
}

// 判定是在底部或是在顶部
function judgeScroll(p1, p2, fixBottom, fix, scrollY) {
  const value = p1.y - (p2.y - fix - scrollY);
  const topValue = p1.y - 60;
  const bottomValue = 60 + fixBottom;
  if(value >=  topValue) {
    return 'top';
  } else if (value <= bottomValue) {
    return 'bottom';
  } else {
    return 'middle';
  }
}
// 找到当前元素与滚动元素之间所有doms
function findInDOM(start, end) {
  let result = [];
  let parent = start;
  while(parent && parent !== end) {
    parent = parent.parentElement;
    result.push(parent);
  }
  return result;
}
// 获取dom之间的相对位置
function getOffsetDOM(start, end, translate) {
  const parents = findInDOM(start, end);
  let result = { x: translate.x, y: translate.y };
  function getOffset(node) {
    result = {
      x: node.offsetLeft + result.x,
      y: node.offsetTop + result.y
    };
  }
  getOffset(start);
  parents.forEach((dom) => {
    getOffset(dom);
  });
  return result;
}
