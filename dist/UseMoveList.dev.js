(function (global, factory) {
  typeof exports === 'object' && typeof module !== 'undefined' ? module.exports = factory() :
  typeof define === 'function' && define.amd ? define(factory) :
  (global = typeof globalThis !== 'undefined' ? globalThis : global || self, global.UseMoveList = factory());
}(this, (function () { 'use strict';

  function _classCallCheck(instance, Constructor) {
    if (!(instance instanceof Constructor)) {
      throw new TypeError("Cannot call a class as a function");
    }
  }

  function _defineProperties(target, props) {
    for (var i = 0; i < props.length; i++) {
      var descriptor = props[i];
      descriptor.enumerable = descriptor.enumerable || false;
      descriptor.configurable = true;
      if ("value" in descriptor) descriptor.writable = true;
      Object.defineProperty(target, descriptor.key, descriptor);
    }
  }

  function _createClass(Constructor, protoProps, staticProps) {
    if (protoProps) _defineProperties(Constructor.prototype, protoProps);
    if (staticProps) _defineProperties(Constructor, staticProps);
    return Constructor;
  }

  function _defineProperty(obj, key, value) {
    if (key in obj) {
      Object.defineProperty(obj, key, {
        value: value,
        enumerable: true,
        configurable: true,
        writable: true
      });
    } else {
      obj[key] = value;
    }

    return obj;
  }

  function ownKeys(object, enumerableOnly) {
    var keys = Object.keys(object);

    if (Object.getOwnPropertySymbols) {
      var symbols = Object.getOwnPropertySymbols(object);
      if (enumerableOnly) symbols = symbols.filter(function (sym) {
        return Object.getOwnPropertyDescriptor(object, sym).enumerable;
      });
      keys.push.apply(keys, symbols);
    }

    return keys;
  }

  function _objectSpread2(target) {
    for (var i = 1; i < arguments.length; i++) {
      var source = arguments[i] != null ? arguments[i] : {};

      if (i % 2) {
        ownKeys(Object(source), true).forEach(function (key) {
          _defineProperty(target, key, source[key]);
        });
      } else if (Object.getOwnPropertyDescriptors) {
        Object.defineProperties(target, Object.getOwnPropertyDescriptors(source));
      } else {
        ownKeys(Object(source)).forEach(function (key) {
          Object.defineProperty(target, key, Object.getOwnPropertyDescriptor(source, key));
        });
      }
    }

    return target;
  }

  var types = {};
  var openLog = function openLog(type) {
    types[type] = true;
  };
  var printLog = function printLog(message, type) {
    if (types[type] || type === undefined) {
      console.log(message);
    }
  };

  openLog('mouse-handler'); // 事件
  var ASSERT_MOVE = 20; // 断言长按与移动,px

  var ASSERT_PRESS = 300; // 断言点击长按,ms
  // 监听一个元素内的鼠标事件

  var MouseHandler = /*#__PURE__*/function () {
    function MouseHandler(options) {
      _classCallCheck(this, MouseHandler);

      if (options.el instanceof Node) this.el = options.el;else throw Error('el must be a Element');
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

      document.addEventListener('mousedown', this.mousedown.bind(this));
      document.addEventListener('mousemove', this.mousemove.bind(this)); // this.el.addEventListener('mouseup', this.mouseup.bind(this));

      document.addEventListener('mouseup', this.mouseup.bind(this));
    } // 初始化值


    _createClass(MouseHandler, [{
      key: "initData",
      value: function initData() {
        this.scene = null; // 当前动作场景

        this.action = null; // 动作状态

        this.downtime = 0; // 按下时的时间

        this.uptime = 0; //抬起的时间

        this.startCoor = {
          x: 0,
          y: 0
        }; // 按下时鼠标位置

        this.moveCoor = {
          x: 0,
          y: 0
        }; // 移动时鼠标位置

        this.endCoor = {
          x: 0,
          y: 0
        }; // 放开时时鼠标位置

        this.stop = false;
      } // 鼠标按下

    }, {
      key: "mousedown",
      value: function mousedown(e) {
        var _this = this;

        if (this.stop) e.stopPropagation();
        this.setAction('down'); // 鼠标按下

        this.downtime = new Date().getTime();
        this.startCoor = {
          x: e.x,
          y: e.y
        };
        setTimeout(function () {
          // 当超过断言值时
          printLog('action------------------------' + _this.action, 'mouse-handler');

          if (_this.action && _this.action !== 'up' && _this.assertPressOrMove().isPress) {
            _this.setScene('press');

            if (typeof _this.press === 'function') _this.press(e);
          }
        }, this.$options.pressDelay || ASSERT_PRESS);
      } // 鼠标移动

    }, {
      key: "mousemove",
      value: function mousemove(e) {
        if (this.stop) e.stopPropagation();
        this.moveCoor = {
          x: e.x,
          y: e.y
        }; // this.setAction('move'); // 鼠标按下

        if (typeof this.move === 'function') this.move(e, this.startCoor, this.moveCoor);
      } // 鼠标抬起

    }, {
      key: "mouseup",
      value: function mouseup(e) {
        if (this.stop) e.stopPropagation();
        this.setAction('up'); // 鼠标按下

        this.uptime = new Date().getTime();
        var during = this.uptime - this.downtime;
        this.endCoor = {
          x: e.x,
          y: e.y
        }; // 断言是点击还是长按：scene未被设置，且点击间隔少于 ASSERT_PRESS

        if (during <= (this.$options.pressDelay || ASSERT_PRESS)) {
          this.setScene('click');
          if (typeof this.click === 'function') this.click(e);
        } else if (this.assertPressOrMove().isPress) {
          this.setScene('pressEnd');
          if (typeof this.pressEnd === 'function') this.pressEnd(e);
        }

        this.eventOver();
      } // 断言当前是长按还是移动，

    }, {
      key: "assertPressOrMove",
      value: function assertPressOrMove() {
        var _x = Math.abs(this.startCoor.x - this.moveCoor.x);

        var _y = Math.abs(this.startCoor.y - this.moveCoor.y);

        var isPress = false;

        if (_x <= ASSERT_MOVE && _y <= ASSERT_MOVE) {
          isPress = true;
        }

        return {
          isPress: isPress,
          isMove: !isPress
        };
      } // 设置当前场景

    }, {
      key: "setScene",
      value: function setScene(scene) {
        printLog('---------------------' + scene, 'mouse-handler');
        this.scene = scene;
      } // 设置当前动作

    }, {
      key: "setAction",
      value: function setAction(action) {
        printLog('---------------------' + action, 'mouse-handler');
        this.action = action;
      } // 一个事件的结束

    }, {
      key: "eventOver",
      value: function eventOver(e) {
        if (typeof this.over === 'function') this.over(e);
        this.initData();
      }
    }]);

    return MouseHandler;
  }();

  openLog('move-block');

  var UseMoveList = /*#__PURE__*/function () {
    /*
     * options只需要传入 id, wrapHeight: 480, domWidth: 480, domHeight: Y, direction: 'y',
     * id元素布局必需是非static，内部项的style尽量为null
     * 所有移动块上需设置name="move-block" :move-index="key"
     * 当进行布局时，将会是一个非常耗费性能的操作
     * */
    function UseMoveList(options) {
      _classCallCheck(this, UseMoveList);

      /*
       * 这里仅获取当前调用组件内的元素
       * 若是其他地方有重复组件（如首屏滑块），需要将排序数据存入store
       * */
      if (options.el instanceof Node) this.el = options.el;else throw Error('el must be a Element');
      this.currentDom = null; // 当前变动位置的元素

      this.currentKey = null; // 当前变动位置的元素索引
      // 移动中排序定时器

      this.moveTimer = null;
      /*
       * 实例化鼠标事件
       * */

      this.initMouse(options); // 获取与重置数据源

      this.getList = options.getList;
      this.resetList = options.resetList; // 移动中的样式

      this.activeClass = options.activeClass || '';
      this.currentBaseClass = '';
    }

    _createClass(UseMoveList, [{
      key: "initMouse",
      value: function initMouse(options) {
        var _this = this;

        var press = false;
        this.scrollBody = new MouseHandler(options); // 长按动作

        this.scrollBody.press = function (e) {
          press = true;
          _this.scrollBody.stop = true;

          _this.initDomList(e); // 初始化DomList

        }; // 移动动作


        this.scrollBody.move = function (e, start, end) {
          // 监听移动，并变更移动块位置
          if (press && _this.currentKey !== null) {
            _this.moveTimerHandler();

            _this.setMovePosition(start, end);
          }
        }; // 结束动作


        this.scrollBody.over = function (e) {
          if (press && _this.currentKey !== null) {
            // 当鼠标松开时执行的方法
            _this.moveOver();
          }

          press = false;
          _this.scrollBody.stop = false;
        };
      }
      /*
       * 初始化元素的位置信息
       * */

    }, {
      key: "initDomList",
      value: function initDomList(e) {
        /*
         * 设置需要进行排序的doms
         * */
        this.domList = Array.prototype.map.call(this.el.querySelectorAll('[name=move-block]'), function (item) {
          return item;
        });
        /**
         * 注意：这里的positions与domList的顺序可能不一致（根据y、x轴进行排序）
         */

        this.positions = this.domList.map(function (dom, key) {
          var parent = dom.parentElement;
          var top = parent.offsetTop;
          var left = parent.offsetLeft;
          var width = dom.clientWidth;
          var height = dom.clientHeight;
          var unid = dom.getAttribute('unid');
          return {
            unid: unid,
            key: key,
            top: top,
            left: left,
            width: width,
            height: height,
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

    }, {
      key: "findElement",
      value: function findElement(path) {
        var _this2 = this;

        path.forEach(function (dom, key) {
          if (dom.getAttribute && dom.getAttribute('name') === 'move-block') {
            _this2.currentDom = dom;
            _this2.currentBaseClass = dom.getAttribute('class');
            _this2.currentKey = _this2.positions.findIndex(function (v) {
              return v.key === Number(dom.getAttribute('move-index'));
            });

            _this2.currentDom.setAttribute('class', _this2.currentBaseClass + ' ' + _this2.activeClass);
          }
        });
      }
      /*
       * 设置滑动位置
       * */

    }, {
      key: "setMovePosition",
      value: function setMovePosition(start, end) {
        var moveX = end.x - start.x;
        var moveY = end.y - start.y;
        var currentXY = this.positions[this.currentKey];
        var translate = currentXY.moving || currentXY.translate;
        currentXY.moveX = moveX;
        currentXY.moveY = moveY;
        this.currentDom.setAttribute('style', "\n      position:absolute;\n      top:0;\n      left:0;\n      transform:translate(".concat(translate.x + moveX, "px, ").concat(translate.y + moveY, "px);\n      z-index: 100;\n    "));
      }
      /*
       * 设置开始移动doms位置
       * */

    }, {
      key: "setDomPosition",
      value: function setDomPosition() {
        if (this.currentKey === null) return;
        var currentXY = this.positions[this.currentKey];
        var translate = currentXY.translate;
        this.currentDom.setAttribute('style', "\n      position:absolute;\n      top:0;\n      left:0;\n      transform:translate(".concat(translate.x, "px, ").concat(translate.y, "px);\n      z-index: 100;\n    "));
      }
      /**
       * 解放元素
       */

    }, {
      key: "setFreeElement",
      value: function setFreeElement() {
        var _this3 = this;

        var currentXY = this.positions[this.currentKey];
        var translate = currentXY.translate;
        delete currentXY.moving;
        var style = "\n      transform:translate(".concat(translate.x, "px, ").concat(translate.y, "px);\n    ");
        this.currentDom.setAttribute('style', "\n      ".concat(style, "\n      position:absolute;\n      top:0;\n      left:0;\n      transition: all 0.5s;\n      z-index: 100;\n    "));
        setTimeout(function () {
          _this3.currentDom.setAttribute('class', _this3.currentBaseClass);

          _this3.currentDom.setAttribute('style', style);
        }, 500);
      }
      /**
       * 记录移动过程中的信息，并设置定时器，处理排序任务
       */

    }, {
      key: "moveTimerHandler",
      value: function moveTimerHandler(position) {
        var _this4 = this;

        if (this.moveTimer) clearTimeout(this.moveTimer);
        this.moveTimer = setTimeout(function () {
          _this4.resetQuene();
        }, 300);
      }
      /**
       * 当鼠标停下超过500毫秒，将会判断是否触发排序
       */

    }, {
      key: "resetQuene",
      value: function resetQuene() {
        var _this5 = this;

        var currentXY = this.positions[this.currentKey];
        var currentTranslate = currentXY.moving || currentXY.translate;
        var currentX = currentXY.left + currentXY.moveX + currentTranslate.x;
        var currentY = currentXY.top + currentXY.moveY + currentTranslate.y;
        var currentKey = this.currentKey;
        this.positions.forEach(function (position, key) {
          if (currentKey !== key) {
            var translate = position.translate;

            var _x = Math.abs(position.left + translate.x - currentX);

            var _y = Math.abs(position.top + translate.y - currentY);

            if (_x <= 30 && _y <= 30) {
              printLog('重新排序：' + _this5.currentKey + '---to---' + key, 'move-block'); // 当往前排时，替换的元素往前挪

              /** 对positions重新排序 **/

              var moveInfo = _this5.cacheChangePositions(currentKey, key, _this5.positions);

              moveInfo.forEach(function (move) {
                console.log(move);
                if (move.moving) _this5.positions[move.from].moving = move.moving;
                _this5.positions[move.from].translate = move.translate;
              }); // 排序动作

              _this5.resetQueneDom(); // 重新对positions进行排序


              _this5.currentKey = key;

              _this5.resetPositions();

              console.log(_this5.positions);
            }
          }
        });
      }
      /**
       * 缓存位置变更信息
       */

    }, {
      key: "cacheChangePositions",
      value: function cacheChangePositions(currentKey, key, positions) {
        var moveInfo = [];
        moveInfo.push({
          from: currentKey,
          to: key,
          translate: _objectSpread2({}, this.domToPosition(positions[currentKey], positions[key])),
          moving: _objectSpread2({}, positions[currentKey].moving || positions[currentKey].translate)
        });

        if (currentKey < key) {
          // 当往前排时，currentKey - key 的元素往前挪
          for (var i = currentKey + 1; i <= key; i++) {
            moveInfo.push({
              from: i,
              to: i - 1,
              translate: _objectSpread2({}, this.domToPosition(positions[i], positions[i - 1]))
            });
          }
        } else {
          // 当往后排时，key - currentKey 的元素往后挪
          for (var _i = key; _i < currentKey; _i++) {
            moveInfo.push({
              from: _i,
              to: _i - 1,
              translate: _objectSpread2({}, this.domToPosition(positions[_i], positions[_i + 1]))
            });
          }
        }

        return moveInfo;
      }
      /**
       * 移动一个元素到后一个的位置
       */

    }, {
      key: "domToPosition",
      value: function domToPosition(p1, p2) {
        var x = p2.left + p2.translate.x - p1.left;
        var y = p2.top + p2.translate.y - p1.top;
        return {
          x: x,
          y: y
        };
      }
      /**
       * 针对重新排的position设置位置
       * 注：dom顺序不变，绝对定位变了
       */

    }, {
      key: "resetQueneDom",
      value: function resetQueneDom() {
        var _this6 = this;

        var currentKey = this.currentKey;
        this.positions.forEach(function (position, key) {
          if (currentKey === key) return;
          var dom = _this6.domList[position.key];
          var translate = position.translate;
          var style = "\n        transform:translate(".concat(translate.x, "px, ").concat(translate.y, "px);\n      ");
          dom.setAttribute('style', "".concat(style, "\n        transition: all 0.5s;\n      "));
          setTimeout(function () {
            dom.setAttribute('style', style);
          }, 500);
        });
      }
      /**
       * 重新对positions进行排序
       * 首先根据纵坐标排序，再进行横坐标排序
       * 排序方式，从小到大
       */

    }, {
      key: "resetPositions",
      value: function resetPositions() {
        this.positions = this.positions.sort(function (a, b) {
          var ayx = ('0000000000' + (a.top + a.translate.y)).slice(-10) + ('0000000000' + (a.left + a.translate.x)).slice(-10);
          var byx = ('0000000000' + (b.top + b.translate.y)).slice(-10) + ('0000000000' + (b.left + b.translate.x)).slice(-10);
          return ayx > byx ? 1 : -1;
        });
      }
      /**
       * 设置松开事件
       */

    }, {
      key: "moveOver",
      value: function moveOver() {
        var _this7 = this;

        this.setFreeElement();
        setTimeout(function () {
          _this7.resortdom(); // 对数据进行清空


          _this7.resetData();
        }, 500);
      }
      /**
       * 对dom进行重写排序
       */

    }, {
      key: "resortdom",
      value: function resortdom() {
        var result = [];
        var list = this.getList();
        this.positions.forEach(function (position, key) {
          result[key] = list[position.key];
        });
        this.domList.forEach(function (dom) {
          dom.setAttribute('style', '');
        });
        this.resetList(result);
      }
      /**
       * 清空数据
       */

    }, {
      key: "resetData",
      value: function resetData() {
        clearTimeout(this.moveTimer);
        this.moveTimer = null;
        this.positions = null;
        this.currentKey = null;
        this.currentDom = null;
        this.domList = [];
      }
    }]);

    return UseMoveList;
  }();

  /*
   * 为mixpad的鼠标事件添加获取path的方法
   * */

  MouseEvent.prototype.getPath = function () {
    if (this.path) {
      return this.path;
    } else {
      var target = this.target;
      var path = [target];

      if (target instanceof Node) {
        var parent = target.parentElement;

        while (parent) {
          path.push(parent);
          parent = parent.parentElement;
        }

        return path;
      } else {
        return path;
      }
    }
  };

  return UseMoveList;

})));
//# sourceMappingURL=UseMoveList.dev.js.map
