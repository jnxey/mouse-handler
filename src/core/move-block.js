import { printLog, openLog, deepCopy } from './utils/utils';
import MouseHandler from './mouse-handler';

openLog('move-block');

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
    /*
     * 设置需要进行排序的doms
     * 若是没有传入domlist，将会去wrap内的子元素
     * */
    if (options.domList instanceof Array) {
      this.domList = options.domList;
    } else {
      this.domList = Array.prototype.map.call(
        this.el.querySelectorAll('[name=move-block]'),
        (item) => item
      );
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
    // 长按动作
    this.scrollBody.press = (e) => {
      press = true;
      this.scrollBody.stop = true;
      this.initDomList(e); // 初始化DomList
    };
    // 移动动作
    this.scrollBody.move = (e, start, end) => {
      // 监听移动，并变更移动块位置
      if (press) {
        this.moveTimerHandler();
        this.setMovePosition(start, end);
      }
    };
    // 结束动作
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
  initDomList(e) {
    /**
     * 注意：这里的positions与domList的顺序可能不一致（根据y、x轴进行排序）
     */
    if (!this.positions) {
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
    }
    this.findElement(e.path);
    this.setDomPosition();
  }

  /*
   * 找到当前选中的移动元素
   * */
  findElement(path) {
    path.forEach((dom, key) => {
      if (dom.getAttribute && dom.getAttribute('name') === 'move-block') {
        this.currentDom = dom;
        this.currentKey = this.positions.findIndex(
          (v) => v.key === Number(dom.getAttribute('move-index'))
        );
      }
    });
  }

  /*
   * 设置滑动位置
   * */
  setMovePosition(start, end) {
    const moveX = end.x - start.x;
    const moveY = end.y - start.y;
    const currentXY = this.positions[this.currentKey];
    const translate = currentXY.moving || currentXY.translate;
    currentXY.moveX = moveX;
    currentXY.moveY = moveY;
    this.currentDom.setAttribute(
      'style',
      `
      border-color:red;
      position:absolute;
      top:0;
      left:0;
      transform:translate(${translate.x + moveX}px, ${translate.y + moveY}px);
      z-index: 100;
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

  /*
   * 设置开始移动doms位置
   * */
  setDomPosition() {
    const currentXY = this.positions[this.currentKey];
    const translate = currentXY.translate;
    this.currentDom.setAttribute(
      'style',
      `
      border-color:red;
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
      border-color:red;
      position:absolute;
      top:0;
      left:0;
      transition: all 0.5s;
      z-index: 100;
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
          // 当往前排时，替换的元素往前挪
          /** 对positions重新排序 **/
          const moveInfo = this.cacheChangePositions(currentKey, key, this.positions);
          moveInfo.forEach((move) => {
            console.log(move);
            if (move.moving) this.positions[move.from].moving = move.moving;
            this.positions[move.from].translate = move.translate;
          });
          // 排序动作
          this.resetQueneDom();
          // 重新对positions进行排序
          this.currentKey = key;
          this.resetPositions();
          console.log(this.positions);
        }
      }
    });
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
      moving: { ...positions[currentKey].translate }
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
}
