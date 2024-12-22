/******/ (() => { // webpackBootstrap
/******/ 	"use strict";
/******/ 	var __webpack_modules__ = ({

/***/ "./src/game/grid/GridCell.js":
/*!***********************************!*\
  !*** ./src/game/grid/GridCell.js ***!
  \***********************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   GridCell: () => (/* binding */ GridCell)
/* harmony export */ });
function _typeof(o) { "@babel/helpers - typeof"; return _typeof = "function" == typeof Symbol && "symbol" == typeof Symbol.iterator ? function (o) { return typeof o; } : function (o) { return o && "function" == typeof Symbol && o.constructor === Symbol && o !== Symbol.prototype ? "symbol" : typeof o; }, _typeof(o); }
function _classCallCheck(a, n) { if (!(a instanceof n)) throw new TypeError("Cannot call a class as a function"); }
function _defineProperties(e, r) { for (var t = 0; t < r.length; t++) { var o = r[t]; o.enumerable = o.enumerable || !1, o.configurable = !0, "value" in o && (o.writable = !0), Object.defineProperty(e, _toPropertyKey(o.key), o); } }
function _createClass(e, r, t) { return r && _defineProperties(e.prototype, r), t && _defineProperties(e, t), Object.defineProperty(e, "prototype", { writable: !1 }), e; }
function _toPropertyKey(t) { var i = _toPrimitive(t, "string"); return "symbol" == _typeof(i) ? i : i + ""; }
function _toPrimitive(t, r) { if ("object" != _typeof(t) || !t) return t; var e = t[Symbol.toPrimitive]; if (void 0 !== e) { var i = e.call(t, r || "default"); if ("object" != _typeof(i)) return i; throw new TypeError("@@toPrimitive must return a primitive value."); } return ("string" === r ? String : Number)(t); }
// src/game/grid/GridCell.js
var GridCell = /*#__PURE__*/function () {
  function GridCell(x, y) {
    _classCallCheck(this, GridCell);
    // Position
    this.x = x;
    this.y = y;

    // Basic properties
    this.type = 'floor'; // floor, wall, door, stairs-up, stairs-down
    this.walkable = true;
    this.transparent = true; // For line of sight calculations

    // Visibility properties
    this.visible = false; // Currently in field of view
    this.explored = false; // Has been seen before

    // Gameplay properties
    this.entities = new Set(); // Entities in this cell (monsters, items, etc.)

    // Special properties
    this.properties = new Map(); // For doors: locked, requires_key, etc.
  }

  // Entity management
  return _createClass(GridCell, [{
    key: "addEntity",
    value: function addEntity(entity) {
      this.entities.add(entity);
      return this;
    }
  }, {
    key: "removeEntity",
    value: function removeEntity(entity) {
      this.entities["delete"](entity);
      return this;
    }
  }, {
    key: "hasBlockingEntity",
    value: function hasBlockingEntity() {
      return Array.from(this.entities).some(function (entity) {
        return entity.blocking;
      });
    }

    // Property management
  }, {
    key: "setProperty",
    value: function setProperty(key, value) {
      this.properties.set(key, value);
      return this;
    }
  }, {
    key: "getProperty",
    value: function getProperty(key) {
      return this.properties.get(key);
    }
  }, {
    key: "hasProperty",
    value: function hasProperty(key) {
      return this.properties.has(key);
    }

    // Cell type management
  }, {
    key: "setType",
    value: function setType(type) {
      this.type = type;
      // Update walkable and transparent based on type
      switch (type) {
        case 'wall':
          this.walkable = false;
          this.transparent = false;
          break;
        case 'door':
          this.walkable = this.getProperty('open') || false;
          this.transparent = this.getProperty('open') || false;
          break;
        case 'floor':
        case 'stairs-up':
        case 'stairs-down':
          this.walkable = true;
          this.transparent = true;
          break;
        default:
          console.warn("Unknown cell type: ".concat(type));
      }
      return this;
    }
  }]);
}();

/***/ }),

/***/ "./src/game/grid/GridManager.js":
/*!**************************************!*\
  !*** ./src/game/grid/GridManager.js ***!
  \**************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   GridManager: () => (/* binding */ GridManager)
/* harmony export */ });
/* harmony import */ var _GridCell_js__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ./GridCell.js */ "./src/game/grid/GridCell.js");
function _typeof(o) { "@babel/helpers - typeof"; return _typeof = "function" == typeof Symbol && "symbol" == typeof Symbol.iterator ? function (o) { return typeof o; } : function (o) { return o && "function" == typeof Symbol && o.constructor === Symbol && o !== Symbol.prototype ? "symbol" : typeof o; }, _typeof(o); }
function _classCallCheck(a, n) { if (!(a instanceof n)) throw new TypeError("Cannot call a class as a function"); }
function _defineProperties(e, r) { for (var t = 0; t < r.length; t++) { var o = r[t]; o.enumerable = o.enumerable || !1, o.configurable = !0, "value" in o && (o.writable = !0), Object.defineProperty(e, _toPropertyKey(o.key), o); } }
function _createClass(e, r, t) { return r && _defineProperties(e.prototype, r), t && _defineProperties(e, t), Object.defineProperty(e, "prototype", { writable: !1 }), e; }
function _toPropertyKey(t) { var i = _toPrimitive(t, "string"); return "symbol" == _typeof(i) ? i : i + ""; }
function _toPrimitive(t, r) { if ("object" != _typeof(t) || !t) return t; var e = t[Symbol.toPrimitive]; if (void 0 !== e) { var i = e.call(t, r || "default"); if ("object" != _typeof(i)) return i; throw new TypeError("@@toPrimitive must return a primitive value."); } return ("string" === r ? String : Number)(t); }
// src/game/grid/GridManager.js

var GridManager = /*#__PURE__*/function () {
  function GridManager(width, height) {
    var tileSize = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : 32;
    _classCallCheck(this, GridManager);
    this.width = width;
    this.height = height;
    this.tileSize = tileSize;
    this.grid = this.createGrid();
  }
  return _createClass(GridManager, [{
    key: "createGrid",
    value: function createGrid() {
      var grid = new Array(this.height);
      for (var y = 0; y < this.height; y++) {
        grid[y] = new Array(this.width);
        for (var x = 0; x < this.width; x++) {
          grid[y][x] = new _GridCell_js__WEBPACK_IMPORTED_MODULE_0__.GridCell(x, y);
        }
      }
      return grid;
    }
  }, {
    key: "isInBounds",
    value: function isInBounds(x, y) {
      return x >= 0 && x < this.width && y >= 0 && y < this.height;
    }
  }, {
    key: "getCell",
    value: function getCell(x, y) {
      if (!this.isInBounds(x, y)) return null;
      return this.grid[y][x];
    }

    // Movement validation
  }, {
    key: "canMoveTo",
    value: function canMoveTo(x, y) {
      var cell = this.getCell(x, y);
      if (!cell) return false;
      return cell.walkable && !cell.hasBlockingEntity();
    }

    // Coordinate conversion
  }, {
    key: "gridToScreen",
    value: function gridToScreen(gridX, gridY) {
      return {
        x: gridX * this.tileSize,
        y: gridY * this.tileSize
      };
    }
  }, {
    key: "screenToGrid",
    value: function screenToGrid(screenX, screenY) {
      return {
        x: Math.floor(screenX / this.tileSize),
        y: Math.floor(screenY / this.tileSize)
      };
    }

    // Get all neighbors of a cell
  }, {
    key: "getNeighbors",
    value: function getNeighbors(x, y) {
      var includeDiagonals = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : false;
      var neighbors = [];
      var directions = [{
        x: 0,
        y: -1
      },
      // Up
      {
        x: 1,
        y: 0
      },
      // Right
      {
        x: 0,
        y: 1
      },
      // Down
      {
        x: -1,
        y: 0
      } // Left
      ];
      if (includeDiagonals) {
        directions.push({
          x: 1,
          y: -1
        },
        // Up-Right
        {
          x: 1,
          y: 1
        },
        // Down-Right
        {
          x: -1,
          y: 1
        },
        // Down-Left
        {
          x: -1,
          y: -1
        } // Up-Left
        );
      }
      for (var _i = 0, _directions = directions; _i < _directions.length; _i++) {
        var dir = _directions[_i];
        var newX = x + dir.x;
        var newY = y + dir.y;
        var cell = this.getCell(newX, newY);
        if (cell) neighbors.push(cell);
      }
      return neighbors;
    }

    // Get walkable neighbors (for pathfinding)
  }, {
    key: "getWalkableNeighbors",
    value: function getWalkableNeighbors(x, y) {
      var _this = this;
      var includeDiagonals = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : false;
      return this.getNeighbors(x, y, includeDiagonals).filter(function (cell) {
        return _this.canMoveTo(cell.x, cell.y);
      });
    }

    // Line of sight check
  }, {
    key: "hasLineOfSight",
    value: function hasLineOfSight(x1, y1, x2, y2) {
      // Bresenham's line algorithm
      var dx = Math.abs(x2 - x1);
      var dy = Math.abs(y2 - y1);
      var sx = x1 < x2 ? 1 : -1;
      var sy = y1 < y2 ? 1 : -1;
      var err = dx - dy;
      var x = x1;
      var y = y1;
      while (true) {
        if (x === x2 && y === y2) return true;
        var cell = this.getCell(x, y);
        if (!cell || !cell.transparent) return false;
        var e2 = 2 * err;
        if (e2 > -dy) {
          err -= dy;
          x += sx;
        }
        if (e2 < dx) {
          err += dx;
          y += sy;
        }
      }
    }

    // Get all cells within a certain range
  }, {
    key: "getCellsInRange",
    value: function getCellsInRange(centerX, centerY, range) {
      var cells = [];
      for (var y = centerY - range; y <= centerY + range; y++) {
        for (var x = centerX - range; x <= centerX + range; x++) {
          var cell = this.getCell(x, y);
          if (cell) {
            var distance = Math.sqrt(Math.pow(x - centerX, 2) + Math.pow(y - centerY, 2));
            if (distance <= range) {
              cells.push(cell);
            }
          }
        }
      }
      return cells;
    }
  }, {
    key: "resetVisibility",
    value: function resetVisibility() {
      for (var y = 0; y < this.height; y++) {
        for (var x = 0; x < this.width; x++) {
          this.grid[y][x].visible = false;
        }
      }
    }
  }, {
    key: "clear",
    value: function clear() {
      this.grid = this.createGrid();
    }
  }]);
}();

/***/ })

/******/ 	});
/************************************************************************/
/******/ 	// The module cache
/******/ 	var __webpack_module_cache__ = {};
/******/ 	
/******/ 	// The require function
/******/ 	function __webpack_require__(moduleId) {
/******/ 		// Check if module is in cache
/******/ 		var cachedModule = __webpack_module_cache__[moduleId];
/******/ 		if (cachedModule !== undefined) {
/******/ 			return cachedModule.exports;
/******/ 		}
/******/ 		// Create a new module (and put it into the cache)
/******/ 		var module = __webpack_module_cache__[moduleId] = {
/******/ 			// no module.id needed
/******/ 			// no module.loaded needed
/******/ 			exports: {}
/******/ 		};
/******/ 	
/******/ 		// Execute the module function
/******/ 		__webpack_modules__[moduleId](module, module.exports, __webpack_require__);
/******/ 	
/******/ 		// Return the exports of the module
/******/ 		return module.exports;
/******/ 	}
/******/ 	
/************************************************************************/
/******/ 	/* webpack/runtime/define property getters */
/******/ 	(() => {
/******/ 		// define getter functions for harmony exports
/******/ 		__webpack_require__.d = (exports, definition) => {
/******/ 			for(var key in definition) {
/******/ 				if(__webpack_require__.o(definition, key) && !__webpack_require__.o(exports, key)) {
/******/ 					Object.defineProperty(exports, key, { enumerable: true, get: definition[key] });
/******/ 				}
/******/ 			}
/******/ 		};
/******/ 	})();
/******/ 	
/******/ 	/* webpack/runtime/hasOwnProperty shorthand */
/******/ 	(() => {
/******/ 		__webpack_require__.o = (obj, prop) => (Object.prototype.hasOwnProperty.call(obj, prop))
/******/ 	})();
/******/ 	
/******/ 	/* webpack/runtime/make namespace object */
/******/ 	(() => {
/******/ 		// define __esModule on exports
/******/ 		__webpack_require__.r = (exports) => {
/******/ 			if(typeof Symbol !== 'undefined' && Symbol.toStringTag) {
/******/ 				Object.defineProperty(exports, Symbol.toStringTag, { value: 'Module' });
/******/ 			}
/******/ 			Object.defineProperty(exports, '__esModule', { value: true });
/******/ 		};
/******/ 	})();
/******/ 	
/************************************************************************/
var __webpack_exports__ = {};
// This entry needs to be wrapped in an IIFE because it needs to be isolated against other modules in the chunk.
(() => {
/*!***************************!*\
  !*** ./src/game/index.js ***!
  \***************************/
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "default": () => (__WEBPACK_DEFAULT_EXPORT__)
/* harmony export */ });
/* harmony import */ var _grid_GridManager_js__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ./grid/GridManager.js */ "./src/game/grid/GridManager.js");
function _typeof(o) { "@babel/helpers - typeof"; return _typeof = "function" == typeof Symbol && "symbol" == typeof Symbol.iterator ? function (o) { return typeof o; } : function (o) { return o && "function" == typeof Symbol && o.constructor === Symbol && o !== Symbol.prototype ? "symbol" : typeof o; }, _typeof(o); }
function _createForOfIteratorHelper(r, e) { var t = "undefined" != typeof Symbol && r[Symbol.iterator] || r["@@iterator"]; if (!t) { if (Array.isArray(r) || (t = _unsupportedIterableToArray(r)) || e && r && "number" == typeof r.length) { t && (r = t); var _n = 0, F = function F() {}; return { s: F, n: function n() { return _n >= r.length ? { done: !0 } : { done: !1, value: r[_n++] }; }, e: function e(r) { throw r; }, f: F }; } throw new TypeError("Invalid attempt to iterate non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method."); } var o, a = !0, u = !1; return { s: function s() { t = t.call(r); }, n: function n() { var r = t.next(); return a = r.done, r; }, e: function e(r) { u = !0, o = r; }, f: function f() { try { a || null == t["return"] || t["return"](); } finally { if (u) throw o; } } }; }
function _unsupportedIterableToArray(r, a) { if (r) { if ("string" == typeof r) return _arrayLikeToArray(r, a); var t = {}.toString.call(r).slice(8, -1); return "Object" === t && r.constructor && (t = r.constructor.name), "Map" === t || "Set" === t ? Array.from(r) : "Arguments" === t || /^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(t) ? _arrayLikeToArray(r, a) : void 0; } }
function _arrayLikeToArray(r, a) { (null == a || a > r.length) && (a = r.length); for (var e = 0, n = Array(a); e < a; e++) n[e] = r[e]; return n; }
function _classCallCheck(a, n) { if (!(a instanceof n)) throw new TypeError("Cannot call a class as a function"); }
function _defineProperties(e, r) { for (var t = 0; t < r.length; t++) { var o = r[t]; o.enumerable = o.enumerable || !1, o.configurable = !0, "value" in o && (o.writable = !0), Object.defineProperty(e, _toPropertyKey(o.key), o); } }
function _createClass(e, r, t) { return r && _defineProperties(e.prototype, r), t && _defineProperties(e, t), Object.defineProperty(e, "prototype", { writable: !1 }), e; }
function _toPropertyKey(t) { var i = _toPrimitive(t, "string"); return "symbol" == _typeof(i) ? i : i + ""; }
function _toPrimitive(t, r) { if ("object" != _typeof(t) || !t) return t; var e = t[Symbol.toPrimitive]; if (void 0 !== e) { var i = e.call(t, r || "default"); if ("object" != _typeof(i)) return i; throw new TypeError("@@toPrimitive must return a primitive value."); } return ("string" === r ? String : Number)(t); }
// src/game/index.js

var GameManager = /*#__PURE__*/function () {
  function GameManager() {
    _classCallCheck(this, GameManager);
    console.log('GameManager initializing...');
    try {
      // Initialize canvas
      this.canvas = document.getElementById('gameCanvas');
      if (!this.canvas) {
        throw new Error('Canvas element not found');
      }
      this.ctx = this.canvas.getContext('2d');
      if (!this.ctx) {
        throw new Error('Could not get 2D context');
      }

      // Set canvas size to match grid
      var GRID_WIDTH = 20;
      var GRID_HEIGHT = 15;
      var TILE_SIZE = 32;
      this.canvas.width = GRID_WIDTH * TILE_SIZE;
      this.canvas.height = GRID_HEIGHT * TILE_SIZE;

      // Initial canvas setup
      this.ctx.imageSmoothingEnabled = false;

      // Create grid system
      this.gridManager = new _grid_GridManager_js__WEBPACK_IMPORTED_MODULE_0__.GridManager(GRID_WIDTH, GRID_HEIGHT, TILE_SIZE);

      // Set up game state
      this.lastFrameTime = 0;
      this.frameCount = 0;

      // Create test dungeon
      this.createTestDungeon();

      // Player position
      this.playerPos = {
        x: 2,
        y: 2
      };

      // Bind event handlers
      this.handleKeyDown = this.handleKeyDown.bind(this);
      window.addEventListener('keydown', this.handleKeyDown);

      // Start game loop
      console.log('Starting game loop...');
      this.gameLoop(0);

      // Hide loading screen
      var loadingScreen = document.getElementById('loadingScreen');
      if (loadingScreen) {
        loadingScreen.classList.add('hidden');
      }
    } catch (error) {
      console.error('Game initialization error:', error);
      throw error;
    }
  }
  return _createClass(GameManager, [{
    key: "createTestDungeon",
    value: function createTestDungeon() {
      // Create some test walls
      for (var x = 5; x < 10; x++) {
        this.gridManager.getCell(x, 5).setType('wall');
      }
      for (var y = 5; y < 8; y++) {
        this.gridManager.getCell(10, y).setType('wall');
      }

      // Add a test door
      var doorCell = this.gridManager.getCell(7, 5);
      doorCell.setType('door');
      doorCell.setProperty('locked', true);
      doorCell.setProperty('key_id', 'test_key');
    }
  }, {
    key: "handleKeyDown",
    value: function handleKeyDown(event) {
      var newX = this.playerPos.x;
      var newY = this.playerPos.y;
      switch (event.code) {
        case 'ArrowUp':
          newY--;
          break;
        case 'ArrowDown':
          newY++;
          break;
        case 'ArrowLeft':
          newX--;
          break;
        case 'ArrowRight':
          newX++;
          break;
      }

      // Check if the new position is walkable
      if (this.gridManager.canMoveTo(newX, newY)) {
        this.playerPos.x = newX;
        this.playerPos.y = newY;
      }

      // Calculate visibility from new position
      this.gridManager.resetVisibility();
      var visibleCells = this.gridManager.getCellsInRange(this.playerPos.x, this.playerPos.y, 5);
      var _iterator = _createForOfIteratorHelper(visibleCells),
        _step;
      try {
        for (_iterator.s(); !(_step = _iterator.n()).done;) {
          var cell = _step.value;
          if (this.gridManager.hasLineOfSight(this.playerPos.x, this.playerPos.y, cell.x, cell.y)) {
            cell.visible = true;
            cell.explored = true;
          }
        }
      } catch (err) {
        _iterator.e(err);
      } finally {
        _iterator.f();
      }
    }
  }, {
    key: "renderGrid",
    value: function renderGrid() {
      var _this$gridManager = this.gridManager,
        width = _this$gridManager.width,
        height = _this$gridManager.height,
        tileSize = _this$gridManager.tileSize;

      // Draw each cell
      for (var y = 0; y < height; y++) {
        for (var x = 0; x < width; x++) {
          var cell = this.gridManager.getCell(x, y);
          var _this$gridManager$gri = this.gridManager.gridToScreen(x, y),
            screenX = _this$gridManager$gri.x,
            screenY = _this$gridManager$gri.y;
          if (!cell.explored) {
            continue; // Don't render unexplored cells
          }

          // Determine cell color based on type and visibility
          var fillColor = '#333'; // Default floor color
          if (!cell.visible) {
            fillColor = '#1a1a1a'; // Darker for explored but not visible
          }
          switch (cell.type) {
            case 'wall':
              fillColor = cell.visible ? '#666' : '#333';
              break;
            case 'door':
              fillColor = cell.visible ? '#8b4513' : '#3b2613'; // Brown for doors
              break;
          }

          // Draw cell
          this.ctx.fillStyle = fillColor;
          this.ctx.fillRect(screenX, screenY, tileSize, tileSize);

          // Draw grid lines
          this.ctx.strokeStyle = '#444';
          this.ctx.strokeRect(screenX, screenY, tileSize, tileSize);
        }
      }
    }
  }, {
    key: "renderPlayer",
    value: function renderPlayer() {
      var _this$gridManager$gri2 = this.gridManager.gridToScreen(this.playerPos.x, this.playerPos.y),
        screenX = _this$gridManager$gri2.x,
        screenY = _this$gridManager$gri2.y;
      var tileSize = this.gridManager.tileSize;

      // Draw player (yellow square)
      this.ctx.fillStyle = '#ff0';
      this.ctx.fillRect(screenX + 4, screenY + 4, tileSize - 8, tileSize - 8);
    }
  }, {
    key: "gameLoop",
    value: function gameLoop(timestamp) {
      try {
        // Calculate delta time
        var deltaTime = timestamp - this.lastFrameTime;
        this.lastFrameTime = timestamp;

        // Clear canvas
        this.ctx.fillStyle = '#000';
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);

        // Render game elements
        this.renderGrid();
        this.renderPlayer();

        // Draw FPS counter
        this.ctx.fillStyle = '#fff';
        this.ctx.font = '14px monospace';
        this.ctx.fillText("FPS: ".concat(Math.round(1000 / deltaTime)), 10, 20);
        this.frameCount++;
        requestAnimationFrame(this.gameLoop.bind(this));
      } catch (error) {
        console.error('Game loop error:', error);
        throw error;
      }
    }
  }]);
}();
console.log('Game script loaded, waiting for window load');
window.addEventListener('load', function () {
  console.log('Window loaded, initializing game');
  try {
    window.game = new GameManager();
  } catch (error) {
    console.error('Failed to initialize game:', error);
  }
});
/* harmony default export */ const __WEBPACK_DEFAULT_EXPORT__ = (GameManager);
})();

/******/ })()
;
//# sourceMappingURL=game.js.map