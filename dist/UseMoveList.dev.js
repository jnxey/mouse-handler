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

  function _toConsumableArray(arr) {
    return _arrayWithoutHoles(arr) || _iterableToArray(arr) || _unsupportedIterableToArray(arr) || _nonIterableSpread();
  }

  function _arrayWithoutHoles(arr) {
    if (Array.isArray(arr)) return _arrayLikeToArray(arr);
  }

  function _iterableToArray(iter) {
    if (typeof Symbol !== "undefined" && Symbol.iterator in Object(iter)) return Array.from(iter);
  }

  function _unsupportedIterableToArray(o, minLen) {
    if (!o) return;
    if (typeof o === "string") return _arrayLikeToArray(o, minLen);
    var n = Object.prototype.toString.call(o).slice(8, -1);
    if (n === "Object" && o.constructor) n = o.constructor.name;
    if (n === "Map" || n === "Set") return Array.from(o);
    if (n === "Arguments" || /^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(n)) return _arrayLikeToArray(o, minLen);
  }

  function _arrayLikeToArray(arr, len) {
    if (len == null || len > arr.length) len = arr.length;

    for (var i = 0, arr2 = new Array(len); i < len; i++) arr2[i] = arr[i];

    return arr2;
  }

  function _nonIterableSpread() {
    throw new TypeError("Invalid attempt to spread non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method.");
  }

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

      this.el.addEventListener('mousedown', this.mousedown.bind(this));
      this.el.addEventListener('mousemove', this.mousemove.bind(this)); // this.el.addEventListener('mouseup', this.mouseup.bind(this));

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
          console.log('action------------------------' + _this.action);

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
        console.log('---------------------' + scene);
        this.scene = scene;
      } // 设置当前动作

    }, {
      key: "setAction",
      value: function setAction(action) {
        console.log('---------------------' + action);
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

      this.moveTimer = null; // 移动排序后调整鼠标移动值

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
        this.domList = Array.prototype.map.call(this.el.children, function (item) {
          return item;
        });
      }

      delete options.domList;
      /*
       * 实例化鼠标事件
       * */

      this.initMouse(options);
    }

    _createClass(UseMoveList, [{
      key: "initMouse",
      value: function initMouse(options) {
        var _this = this;

        var press = false;
        this.scrollBody = new MouseHandler(options);

        this.scrollBody.press = function (e) {
          console.log(e);
          press = true;
          _this.scrollBody.stop = true;

          _this.findElement(e.path);

          _this.initDomList(); // 初始化DomList

        };

        this.scrollBody.move = function (e, start, end) {
          // 监听移动，并变更移动块位置
          if (press) {
            _this.moveTimerHandler();

            _this.setMovePosition(start, end);
          }
        };

        this.scrollBody.over = function (e) {
          if (press) {
            // 当鼠标松开时执行的方法
            _this.setFreeElement();
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
      value: function initDomList() {
        this.positions = this.domList.map(function (dom, key) {
          var top = dom.offsetTop;
          var left = dom.offsetLeft;
          var width = dom.clientWidth;
          var height = dom.clientHeight;
          return {
            key: key,
            top: top,
            left: left,
            width: width,
            height: height,
            scopeX: [left, left + width],
            scopeY: [top, top + height]
          };
        });
        this.positionsCopy = _toConsumableArray(this.positions);
        var position = this.positions[this.currentKey];
        this.startELP = {
          top: position.top,
          left: position.left
        };
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
            _this2.currentKey = Number(dom.getAttribute('move-index'));
          }
        });
      }
      /*
       * 设置doms位置
       * */

    }, {
      key: "setDomPosition",
      value: function setDomPosition() {
        var _this3 = this;

        var currentKey = this.currentKey;
        setTimeout(function () {
          _this3.domList.forEach(function (dom, key) {
            var postion = _this3.positions[key];
            dom.style = "\n          ".concat(currentKey === key ? 'border-color:red;' : '', "\n          position:absolute;\n          top:").concat(postion.top, "px;\n          left:").concat(postion.left, "px;\n          transform:translate(0, 0);\n          z-index:100;\n        ");
          });
        }, 0);
      }
      /*
       * 设置滑动位置
       * */

    }, {
      key: "setMovePosition",
      value: function setMovePosition(start, end) {
        var moveX = end.x - start.x + this.fixMouseX;
        var moveY = end.y - start.y + this.fixMouseY;
        var currentXY = this.positions[this.currentKey];
        currentXY.moveX = moveX;
        currentXY.moveY = moveY;
        this.currentDom.style = "\n      border-color:red;\n      position:absolute;\n      top:".concat(currentXY.top, "px;\n      left:").concat(currentXY.left, "px;\n      transform:translate(").concat(moveX, "px, ").concat(moveY, "px);\n      z-index:200;\n    ");
      }
      /**
       * 设置松开事件
       */

    }, {
      key: "setFreeElement",
      value: function setFreeElement() {
        var _this4 = this;

        var currentXY = this.positions[this.currentKey];
        var style = "\n      position:absolute;\n      top:".concat(currentXY.top, "px;\n      left:").concat(currentXY.left, "px;\n      transform:translate(0, 0);\n      z-index:100;\n    ");
        this.currentDom.style = "\n      ".concat(style, "\n      transition: all 0.5s;\n    ");
        setTimeout(function () {
          _this4.currentDom.style = style;
        }, 500);
      }
      /**
       * 记录移动过程中的信息，并设置定时器，处理排序任务
       */

    }, {
      key: "moveTimerHandler",
      value: function moveTimerHandler(position) {
        var _this5 = this;

        if (this.moveTimer) clearTimeout(this.moveTimer);
        this.moveTimer = setTimeout(function () {
          _this5.resetQuene();
        }, 500);
      }
      /**
       * 当鼠标停下超过500毫秒，将会判断是否触发排序
       */

    }, {
      key: "resetQuene",
      value: function resetQuene() {
        var _this6 = this;

        var currentXY = this.positions[this.currentKey];
        var currentX = currentXY.left + currentXY.moveX;
        var currentY = currentXY.top + currentXY.moveY;
        var currentKey = this.currentKey;
        this.positions.forEach(function (position, key) {
          if (currentKey !== key) {
            var _x = Math.abs(position.left - currentX);

            var _y = Math.abs(position.top - currentY);

            if (_x <= 30 && _y <= 30) {
              console.log('重新排序：' + _this6.currentKey + '---to---' + key);
              delete currentXY.moveX;
              delete currentXY.moveY;
              var next = _this6.positions[key]; // 当往前排时，替换的元素往前挪

              /** 对positions重新排序 **/

              if (currentKey < key) {
                for (var i = currentKey + 1; i <= key; i++) {
                  _this6.positions[i] = _this6.positionsCopy[i - 1];
                }
              } else {
                // 当往后排时，替换的元素往后挪
                for (var _i = key; _i < currentKey; _i++) {
                  _this6.positions[_i] = _this6.positionsCopy[_i + 1];
                }
              }

              _this6.positions[currentKey] = _objectSpread2(_objectSpread2({}, next), {
                moveX: currentX - next.left,
                moveY: currentY - next.top
              }); // 重置鼠标移动位置，
              // 若是再次改变位置，移动位置出现

              _this6.fixMouseX = _this6.startELP.left - next.left;
              _this6.fixMouseY = _this6.startELP.top - next.top;

              _this6.resetQueneDom();
            }
          }
        });
      }
      /**
       * 针对重新排的position设置位置
       * 注：dom顺序不变，绝对定位变了
       */

    }, {
      key: "resetQueneDom",
      value: function resetQueneDom() {
        var _this7 = this;

        var currentKey = this.currentKey;
        this.positions.forEach(function (position, key) {
          var dom = _this7.domList[key];
          var style = "\n        ".concat(currentKey === key ? 'border-color:red;' : '', "\n        position:absolute;\n        top:").concat(position.top, "px;\n        left:").concat(position.left, "px;\n        transform:translate(").concat(position.moveX, "px, ").concat(position.moveY, "px);\n        z-index:").concat(currentKey === key ? '200' : '100', ";\n      ");
          dom.style = "".concat(style, "transition: all 0.5s;");
          setTimeout(function () {
            dom.style = style;
          }, 500);
        });
      }
    }]);

    return UseMoveList;
  }();

  return UseMoveList;

})));
//# sourceMappingURL=UseMoveList.dev.js.map
