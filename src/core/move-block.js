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
    // 移动中排序定时器
    this.moveTimer = null;
    // 移动排序后调整鼠标移动值
    this.startELP = null;
    this.fixMouseX = 0;
    this.fixMouseY = 0;
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
      press = true;
      this.scrollBody.stop = true;
      this.findElement(e.path);
      this.initDomList(); // 初始化DomList
    };
    this.scrollBody.move = (e, start, end) => {
      // 监听移动，并变更移动块位置
      if (press) {
        this.moveTimerHandler();
        this.setMovePosition(start, end);
      }
    };
    this.scrollBody.over = (e) => {
      if (press) {
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
  initDomList() {
    this.positions = this.domList.map((dom, key) => {
      const top = dom.offsetTop;
      const left = dom.offsetLeft;
      const width = dom.clientWidth;
      const height = dom.clientHeight;
      return {
        key,
        top,
        left,
        width,
        height,
        scopeX: [left, left + width],
        scopeY: [top, top + height]
      };
    });
    this.positionsCopy = [...this.positions];
    const position = this.positions[this.currentKey];
    this.startELP = {
      top: position.top,
      left: position.left
    };
    this.setDomPosition();
  }

  /*
   * 找到当前选中的移动元素
   * */
  findElement(path) {
    path.forEach((dom, key) => {
      if (dom.getAttribute && dom.getAttribute('name') === 'move-block') {
        this.currentDom = dom;
        this.currentKey = Number(dom.getAttribute('move-index'));
      }
    });
  }

  /*
   * 设置doms位置
   * */
  setDomPosition() {
    const currentKey = this.currentKey;
    setTimeout(() => {
      this.domList.forEach((dom, key) => {
        const postion = this.positions[key];
        dom.setAttribute(
          'style',
          `
          ${currentKey === key ? 'border:1px solid red;' : ''}
          position:absolute;
          top:${postion.top}px;
          left:${postion.left}px;
          transform:translate(0, 0);
          z-index:100;
        `
        );
      });
    }, 0);
  }

  /*
   * 设置滑动位置
   * */
  setMovePosition(start, end) {
    const moveX = end.x - start.x + this.fixMouseX;
    const moveY = end.y - start.y + this.fixMouseY;
    const currentXY = this.positions[this.currentKey];
    currentXY.moveX = moveX;
    currentXY.moveY = moveY;
    this.currentDom.setAttribute(
      'style',
      `
      border-color:red;
      position:absolute;
      top:${currentXY.top}px;
      left:${currentXY.left}px;
      transform:translate(${moveX}px, ${moveY}px);
      z-index:200;
    `
    );
  }

  /**
   * 设置松开事件
   */
  moveOver() {
    if (this.moveTimer) clearTimeout(this.moveTimer);
    this.setFreeElement();
  }

  /**
   * 解放元素
   */
  setFreeElement() {
    const currentXY = this.positions[this.currentKey];
    const style = `
      position:absolute;
      top:${currentXY.top}px;
      left:${currentXY.left}px;
      transform:translate(0, 0);
      z-index:100;
    `;
    this.currentDom.setAttribute(
      'style',
      `
      ${style}
      transition: all 0.5s;
    `
    );
    setTimeout(() => {
      this.currentDom.setAttribute('style', style);
    }, 500);
  }

  /**
   * 记录移动过程中的信息，并设置定时器，处理排序任务
   */
  moveTimerHandler(position) {
    if (this.moveTimer) clearTimeout(this.moveTimer);
    this.moveTimer = setTimeout(() => {
      this.resetQuene();
    }, 500);
  }

  /**
   * 当鼠标停下超过500毫秒，将会判断是否触发排序
   */
  resetQuene() {
    const currentXY = this.positions[this.currentKey];
    const currentX = currentXY.left + currentXY.moveX;
    const currentY = currentXY.top + currentXY.moveY;
    const currentKey = this.currentKey;
    this.positionsCopy.forEach((position, key) => {
      if (currentKey !== key) {
        const _x = Math.abs(position.left - currentX);
        const _y = Math.abs(position.top - currentY);
        if (_x <= 30 && _y <= 30) {
          console.log('重新排序：' + this.currentKey + '---to---' + key);
          delete currentXY.moveX;
          delete currentXY.moveY;
          const next = this.positionsCopy[key];
          // 当往前排时，替换的元素往前挪
          /** 对positions重新排序 **/
          if (currentKey < key) {
            for (let i = currentKey + 1; i <= key; i++) {
              this.positions[i] = this.positionsCopy[i - 1];
            }
          } else {
            // 当往后排时，替换的元素往后挪
            for (let i = key; i < currentKey; i++) {
              this.positions[i] = this.positionsCopy[i + 1];
            }
          }
          this.positions[currentKey] = {
            ...next,
            ...{
              moveX: currentX - next.left,
              moveY: currentY - next.top
            }
          };
          // 重置鼠标移动位置，
          // 若是再次改变位置，移动位置出现
          this.fixMouseX = this.startELP.left - next.left;
          this.fixMouseY = this.startELP.top - next.top;
          this.resetQueneDom();
        }
      }
    });
  }

  /**
   * 针对重新排的position设置位置
   * 注：dom顺序不变，绝对定位变了
   */
  resetQueneDom() {
    const currentKey = this.currentKey;
    this.positions.forEach((position, key) => {
      const dom = this.domList[key];
      const style = `
        ${currentKey === key ? 'border-color:red;' : ''}
        position:absolute;
        top:${position.top}px;
        left:${position.left}px;
        transform:translate(${position.moveX}px, ${position.moveY}px);
        z-index:${currentKey === key ? '200' : '100'};
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
}
