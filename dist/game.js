/******/ (() => { // webpackBootstrap
/******/ 	"use strict";
/******/ 	var __webpack_modules__ = ({

/***/ "./src/game/Camera.js":
/*!****************************!*\
  !*** ./src/game/Camera.js ***!
  \****************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   Camera: () => (/* binding */ Camera)
/* harmony export */ });
function _typeof(o) { "@babel/helpers - typeof"; return _typeof = "function" == typeof Symbol && "symbol" == typeof Symbol.iterator ? function (o) { return typeof o; } : function (o) { return o && "function" == typeof Symbol && o.constructor === Symbol && o !== Symbol.prototype ? "symbol" : typeof o; }, _typeof(o); }
function _classCallCheck(a, n) { if (!(a instanceof n)) throw new TypeError("Cannot call a class as a function"); }
function _defineProperties(e, r) { for (var t = 0; t < r.length; t++) { var o = r[t]; o.enumerable = o.enumerable || !1, o.configurable = !0, "value" in o && (o.writable = !0), Object.defineProperty(e, _toPropertyKey(o.key), o); } }
function _createClass(e, r, t) { return r && _defineProperties(e.prototype, r), t && _defineProperties(e, t), Object.defineProperty(e, "prototype", { writable: !1 }), e; }
function _toPropertyKey(t) { var i = _toPrimitive(t, "string"); return "symbol" == _typeof(i) ? i : i + ""; }
function _toPrimitive(t, r) { if ("object" != _typeof(t) || !t) return t; var e = t[Symbol.toPrimitive]; if (void 0 !== e) { var i = e.call(t, r || "default"); if ("object" != _typeof(i)) return i; throw new TypeError("@@toPrimitive must return a primitive value."); } return ("string" === r ? String : Number)(t); }
var Camera = /*#__PURE__*/function () {
  function Camera(width, height, worldWidth, worldHeight, tileSize) {
    _classCallCheck(this, Camera);
    this.width = width;
    this.height = height;
    this.worldWidth = worldWidth;
    this.worldHeight = worldHeight;
    this.tileSize = tileSize;
    this.x = 0;
    this.y = 0;

    // Calculate the number of tiles that can be displayed
    this.tilesX = Math.floor(width / tileSize);
    this.tilesY = Math.floor(height / tileSize);

    // Scroll threshold in tiles (5 tiles from edge)
    this.scrollThreshold = 5;
  }

  // Update camera position based on target (player) position
  return _createClass(Camera, [{
    key: "follow",
    value: function follow(targetX, targetY) {
      // Convert target position to screen space
      var screenX = targetX * this.tileSize - this.x;
      var screenY = targetY * this.tileSize - this.y;

      // Check if target is too close to screen edges
      if (screenX < this.scrollThreshold * this.tileSize) {
        this.x = targetX * this.tileSize - this.scrollThreshold * this.tileSize;
      }
      if (screenX > this.width - this.scrollThreshold * this.tileSize) {
        this.x = targetX * this.tileSize - this.width + this.scrollThreshold * this.tileSize;
      }
      if (screenY < this.scrollThreshold * this.tileSize) {
        this.y = targetY * this.tileSize - this.scrollThreshold * this.tileSize;
      }
      if (screenY > this.height - this.scrollThreshold * this.tileSize) {
        this.y = targetY * this.tileSize - this.height + this.scrollThreshold * this.tileSize;
      }

      // Clamp camera position to world bounds
      this.x = Math.max(0, Math.min(this.x, this.worldWidth * this.tileSize - this.width));
      this.y = Math.max(0, Math.min(this.y, this.worldHeight * this.tileSize - this.height));
    }

    // Convert world coordinates to screen coordinates
  }, {
    key: "worldToScreen",
    value: function worldToScreen(worldX, worldY) {
      return {
        x: worldX * this.tileSize - this.x,
        y: worldY * this.tileSize - this.y
      };
    }

    // Check if a tile is visible on screen
  }, {
    key: "isVisible",
    value: function isVisible(worldX, worldY) {
      var screenPos = this.worldToScreen(worldX, worldY);
      return screenPos.x >= -this.tileSize && screenPos.x <= this.width && screenPos.y >= -this.tileSize && screenPos.y <= this.height;
    }
  }]);
}();

/***/ }),

/***/ "./src/game/dungeon/Corridor.js":
/*!**************************************!*\
  !*** ./src/game/dungeon/Corridor.js ***!
  \**************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   Corridor: () => (/* binding */ Corridor)
/* harmony export */ });
function _typeof(o) { "@babel/helpers - typeof"; return _typeof = "function" == typeof Symbol && "symbol" == typeof Symbol.iterator ? function (o) { return typeof o; } : function (o) { return o && "function" == typeof Symbol && o.constructor === Symbol && o !== Symbol.prototype ? "symbol" : typeof o; }, _typeof(o); }
function _classCallCheck(a, n) { if (!(a instanceof n)) throw new TypeError("Cannot call a class as a function"); }
function _defineProperties(e, r) { for (var t = 0; t < r.length; t++) { var o = r[t]; o.enumerable = o.enumerable || !1, o.configurable = !0, "value" in o && (o.writable = !0), Object.defineProperty(e, _toPropertyKey(o.key), o); } }
function _createClass(e, r, t) { return r && _defineProperties(e.prototype, r), t && _defineProperties(e, t), Object.defineProperty(e, "prototype", { writable: !1 }), e; }
function _toPropertyKey(t) { var i = _toPrimitive(t, "string"); return "symbol" == _typeof(i) ? i : i + ""; }
function _toPrimitive(t, r) { if ("object" != _typeof(t) || !t) return t; var e = t[Symbol.toPrimitive]; if (void 0 !== e) { var i = e.call(t, r || "default"); if ("object" != _typeof(i)) return i; throw new TypeError("@@toPrimitive must return a primitive value."); } return ("string" === r ? String : Number)(t); }
// src/game/dungeon/Corridor.js
var Corridor = /*#__PURE__*/function () {
  function Corridor(startX, startY, endX, endY) {
    _classCallCheck(this, Corridor);
    this.startX = startX;
    this.startY = startY;
    this.endX = endX;
    this.endY = endY;
    this.type = 'corridor';
    this.path = [];
    this.generatePath();
  }
  return _createClass(Corridor, [{
    key: "generatePath",
    value: function generatePath() {
      this.path = [];
      var currentX = this.startX;
      var currentY = this.startY;

      // Add starting point
      this.path.push({
        x: currentX,
        y: currentY
      });
      var horizontalFirst = Math.random() < 0.5;
      if (horizontalFirst) {
        // Go horizontal first
        while (currentX !== this.endX) {
          currentX += currentX < this.endX ? 1 : -1;
          this.path.push({
            x: currentX,
            y: currentY
          });
        }
        // Then vertical
        while (currentY !== this.endY) {
          currentY += currentY < this.endY ? 1 : -1;
          this.path.push({
            x: currentX,
            y: currentY
          });
        }
      } else {
        // Go vertical first
        while (currentY !== this.endY) {
          currentY += currentY < this.endY ? 1 : -1;
          this.path.push({
            x: currentX,
            y: currentY
          });
        }
        // Then horizontal
        while (currentX !== this.endX) {
          currentX += currentX < this.endX ? 1 : -1;
          this.path.push({
            x: currentX,
            y: currentY
          });
        }
      }
    }
  }]);
}();

/***/ }),

/***/ "./src/game/dungeon/DungeonGenerator.js":
/*!**********************************************!*\
  !*** ./src/game/dungeon/DungeonGenerator.js ***!
  \**********************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   DungeonGenerator: () => (/* binding */ DungeonGenerator)
/* harmony export */ });
/* harmony import */ var _Room_js__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ./Room.js */ "./src/game/dungeon/Room.js");
/* harmony import */ var _Corridor_js__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ./Corridor.js */ "./src/game/dungeon/Corridor.js");
function _typeof(o) { "@babel/helpers - typeof"; return _typeof = "function" == typeof Symbol && "symbol" == typeof Symbol.iterator ? function (o) { return typeof o; } : function (o) { return o && "function" == typeof Symbol && o.constructor === Symbol && o !== Symbol.prototype ? "symbol" : typeof o; }, _typeof(o); }
function _slicedToArray(r, e) { return _arrayWithHoles(r) || _iterableToArrayLimit(r, e) || _unsupportedIterableToArray(r, e) || _nonIterableRest(); }
function _nonIterableRest() { throw new TypeError("Invalid attempt to destructure non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method."); }
function _iterableToArrayLimit(r, l) { var t = null == r ? null : "undefined" != typeof Symbol && r[Symbol.iterator] || r["@@iterator"]; if (null != t) { var e, n, i, u, a = [], f = !0, o = !1; try { if (i = (t = t.call(r)).next, 0 === l) { if (Object(t) !== t) return; f = !1; } else for (; !(f = (e = i.call(t)).done) && (a.push(e.value), a.length !== l); f = !0); } catch (r) { o = !0, n = r; } finally { try { if (!f && null != t["return"] && (u = t["return"](), Object(u) !== u)) return; } finally { if (o) throw n; } } return a; } }
function _arrayWithHoles(r) { if (Array.isArray(r)) return r; }
function _toConsumableArray(r) { return _arrayWithoutHoles(r) || _iterableToArray(r) || _unsupportedIterableToArray(r) || _nonIterableSpread(); }
function _nonIterableSpread() { throw new TypeError("Invalid attempt to spread non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method."); }
function _iterableToArray(r) { if ("undefined" != typeof Symbol && null != r[Symbol.iterator] || null != r["@@iterator"]) return Array.from(r); }
function _arrayWithoutHoles(r) { if (Array.isArray(r)) return _arrayLikeToArray(r); }
function _createForOfIteratorHelper(r, e) { var t = "undefined" != typeof Symbol && r[Symbol.iterator] || r["@@iterator"]; if (!t) { if (Array.isArray(r) || (t = _unsupportedIterableToArray(r)) || e && r && "number" == typeof r.length) { t && (r = t); var _n = 0, F = function F() {}; return { s: F, n: function n() { return _n >= r.length ? { done: !0 } : { done: !1, value: r[_n++] }; }, e: function e(r) { throw r; }, f: F }; } throw new TypeError("Invalid attempt to iterate non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method."); } var o, a = !0, u = !1; return { s: function s() { t = t.call(r); }, n: function n() { var r = t.next(); return a = r.done, r; }, e: function e(r) { u = !0, o = r; }, f: function f() { try { a || null == t["return"] || t["return"](); } finally { if (u) throw o; } } }; }
function _unsupportedIterableToArray(r, a) { if (r) { if ("string" == typeof r) return _arrayLikeToArray(r, a); var t = {}.toString.call(r).slice(8, -1); return "Object" === t && r.constructor && (t = r.constructor.name), "Map" === t || "Set" === t ? Array.from(r) : "Arguments" === t || /^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(t) ? _arrayLikeToArray(r, a) : void 0; } }
function _arrayLikeToArray(r, a) { (null == a || a > r.length) && (a = r.length); for (var e = 0, n = Array(a); e < a; e++) n[e] = r[e]; return n; }
function _classCallCheck(a, n) { if (!(a instanceof n)) throw new TypeError("Cannot call a class as a function"); }
function _defineProperties(e, r) { for (var t = 0; t < r.length; t++) { var o = r[t]; o.enumerable = o.enumerable || !1, o.configurable = !0, "value" in o && (o.writable = !0), Object.defineProperty(e, _toPropertyKey(o.key), o); } }
function _createClass(e, r, t) { return r && _defineProperties(e.prototype, r), t && _defineProperties(e, t), Object.defineProperty(e, "prototype", { writable: !1 }), e; }
function _toPropertyKey(t) { var i = _toPrimitive(t, "string"); return "symbol" == _typeof(i) ? i : i + ""; }
function _toPrimitive(t, r) { if ("object" != _typeof(t) || !t) return t; var e = t[Symbol.toPrimitive]; if (void 0 !== e) { var i = e.call(t, r || "default"); if ("object" != _typeof(i)) return i; throw new TypeError("@@toPrimitive must return a primitive value."); } return ("string" === r ? String : Number)(t); }
// src/game/dungeon/DungeonGenerator.js



var DungeonGenerator = /*#__PURE__*/function () {
  function DungeonGenerator(width, height) {
    _classCallCheck(this, DungeonGenerator);
    this.width = width;
    this.height = height;
    this.rooms = [];
    this.corridors = [];
    this.grid = Array(height).fill().map(function () {
      return Array(width).fill(0);
    });
  }
  return _createClass(DungeonGenerator, [{
    key: "generate",
    value: function generate() {
      var _this = this;
      this.rooms = [];
      this.corridors = [];
      this.grid = Array(this.height).fill().map(function () {
        return Array(_this.width).fill(0);
      });
      this.generateRooms();
      this.connectRooms();
      this.applyToGrid();
      return {
        grid: this.grid,
        rooms: this.rooms,
        corridors: this.corridors
      };
    }
  }, {
    key: "generateRooms",
    value: function generateRooms() {
      var attempts = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : 50;
      for (var i = 0; i < attempts; i++) {
        var minSize = 5;
        var maxSize = 10;
        var width = minSize + Math.floor(Math.random() * (maxSize - minSize));
        var height = minSize + Math.floor(Math.random() * (maxSize - minSize));
        var x = Math.floor(Math.random() * (this.width - width - 2)) + 1;
        var y = Math.floor(Math.random() * (this.height - height - 2)) + 1;
        var newRoom = new _Room_js__WEBPACK_IMPORTED_MODULE_0__.Room(x, y, width, height);
        var overlaps = false;
        var _iterator = _createForOfIteratorHelper(this.rooms),
          _step;
        try {
          for (_iterator.s(); !(_step = _iterator.n()).done;) {
            var room = _step.value;
            if (newRoom.intersects(room, 2)) {
              overlaps = true;
              break;
            }
          }
        } catch (err) {
          _iterator.e(err);
        } finally {
          _iterator.f();
        }
        if (!overlaps) {
          this.rooms.push(newRoom);
        }
      }
    }
  }, {
    key: "connectRooms",
    value: function connectRooms() {
      var _this2 = this;
      var sortedRooms = _toConsumableArray(this.rooms).sort(function (a, b) {
        return a.x - b.x;
      });
      for (var i = 0; i < sortedRooms.length - 1; i++) {
        var roomA = sortedRooms[i];
        var roomB = sortedRooms[i + 1];
        var connection = this.findBestConnection(roomA, roomB);
        if (!connection) continue;
        var corridor = connection.corridor,
          doorPoints = connection.doorPoints;

        // Add corridor and doors
        this.corridors.push(corridor);
        doorPoints.forEach(function (point) {
          _this2.grid[point.y][point.x] = 2; // door
        });
      }
    }
  }, {
    key: "findBestConnection",
    value: function findBestConnection(roomA, roomB) {
      var _this3 = this;
      // Try different connection strategies
      var strategies = [{
        dx: 0,
        dy: 0
      },
      // Direct
      {
        dx: 0,
        dy: 1
      },
      // Offset up
      {
        dx: 0,
        dy: -1
      },
      // Offset down
      {
        dx: 1,
        dy: 0
      },
      // Offset right
      {
        dx: -1,
        dy: 0
      } // Offset left
      ];
      for (var _i = 0, _strategies = strategies; _i < _strategies.length; _i++) {
        var _strategies$_i = _strategies[_i],
          dx = _strategies$_i.dx,
          dy = _strategies$_i.dy;
        // Find potential connection points
        var startPoint = this.findConnectionPoint(roomA, roomB, dx, dy);
        var endPoint = this.findConnectionPoint(roomB, roomA, -dx, -dy);

        // Create and validate corridor
        var corridor = new _Corridor_js__WEBPACK_IMPORTED_MODULE_1__.Corridor(startPoint.x, startPoint.y, endPoint.x, endPoint.y);

        // Remove room intersections
        corridor.path = corridor.path.filter(function (point) {
          return !_this3.isPointInAnyRoom(point.x, point.y);
        });

        // Validate corridor
        if (corridor.path.length >= 4 && this.isValidCorridor(corridor)) {
          // Find door placement points
          var doorPoints = this.getDoorPoints(corridor, roomA, roomB);
          if (doorPoints.length === 2) {
            // Ensure exactly two doors
            return {
              corridor: corridor,
              doorPoints: doorPoints
            };
          }
        }
      }
      return null;
    }
  }, {
    key: "findConnectionPoint",
    value: function findConnectionPoint(room, targetRoom, offsetX, offsetY) {
      var roomCenter = room.getCenter();
      var targetCenter = targetRoom.getCenter();

      // Determine which edge to use based on relative position
      var x, y;
      if (roomCenter.x < targetCenter.x) {
        x = room.x + room.width - 1; // Right edge
      } else {
        x = room.x; // Left edge
      }
      if (roomCenter.y < targetCenter.y) {
        y = room.y + room.height - 1; // Bottom edge
      } else {
        y = room.y; // Top edge
      }

      // Apply offset
      x += offsetX;
      y += offsetY;
      return {
        x: x,
        y: y
      };
    }
  }, {
    key: "isValidCorridor",
    value: function isValidCorridor(corridor) {
      // Check minimum length
      if (corridor.path.length < 4) return false;

      // Check for nearby doors or other corridors
      var _iterator2 = _createForOfIteratorHelper(corridor.path),
        _step2;
      try {
        for (_iterator2.s(); !(_step2 = _iterator2.n()).done;) {
          var point = _step2.value;
          var neighbors = this.getAdjacentPoints(point);
          var _iterator3 = _createForOfIteratorHelper(neighbors),
            _step3;
          try {
            for (_iterator3.s(); !(_step3 = _iterator3.n()).done;) {
              var neighbor = _step3.value;
              // Check if neighbor is a door or part of another corridor
              if (this.grid[neighbor.y][neighbor.x] === 2) return false;
            }
          } catch (err) {
            _iterator3.e(err);
          } finally {
            _iterator3.f();
          }
        }
      } catch (err) {
        _iterator2.e(err);
      } finally {
        _iterator2.f();
      }
      return true;
    }
  }, {
    key: "findDoorPlacementPoints",
    value: function findDoorPlacementPoints(corridor) {
      var doorPoints = [];

      // Check start of corridor
      var startSegment = corridor.path.slice(0, 3);
      var validStart = this.isValidDoorPlacement(startSegment[1], corridor);
      if (validStart) {
        doorPoints.push(startSegment[1]);
      }

      // Check end of corridor
      var endSegment = corridor.path.slice(-3);
      var validEnd = this.isValidDoorPlacement(endSegment[1], corridor);
      if (validEnd) {
        doorPoints.push(endSegment[1]);
      }
      return doorPoints;
    }
  }, {
    key: "findClosestDoorPoint",
    value: function findClosestDoorPoint(roomA, roomB) {
      // Find the edge of roomA that's closest to roomB
      var centerA = roomA.getCenter();
      var centerB = roomB.getCenter();
      var x, y;
      if (centerA.x < centerB.x) {
        x = roomA.x + roomA.width - 1; // Right edge
      } else {
        x = roomA.x; // Left edge
      }
      if (centerA.y < centerB.y) {
        y = roomA.y + roomA.height - 1; // Bottom edge
      } else {
        y = roomA.y; // Top edge
      }
      return {
        x: x,
        y: y
      };
    }
  }, {
    key: "isPointInAnyRoom",
    value: function isPointInAnyRoom(x, y) {
      return this.rooms.some(function (room) {
        return x >= room.x && x < room.x + room.width && y >= room.y && y < room.y + room.height;
      });
    }
  }, {
    key: "getAdjacentPoints",
    value: function getAdjacentPoints(point) {
      var neighbors = [];
      var deltas = [[-1, 0], [1, 0], [0, -1], [0, 1]];
      for (var _i2 = 0, _deltas = deltas; _i2 < _deltas.length; _i2++) {
        var _deltas$_i = _slicedToArray(_deltas[_i2], 2),
          dx = _deltas$_i[0],
          dy = _deltas$_i[1];
        var x = point.x + dx;
        var y = point.y + dy;
        if (this.isInBounds(x, y)) {
          neighbors.push({
            x: x,
            y: y
          });
        }
      }
      return neighbors;
    }
  }, {
    key: "getDoorPoints",
    value: function getDoorPoints(corridor, roomA, roomB) {
      var doorPoints = [];

      // Check first and last points of corridor
      var start = corridor.path[0];
      var end = corridor.path[corridor.path.length - 1];

      // Only add door points that are actually connecting to rooms
      if (this.isAdjacentToRoom(start, roomA)) doorPoints.push(start);
      if (this.isAdjacentToRoom(end, roomB)) doorPoints.push(end);
      return doorPoints;
    }
  }, {
    key: "isAdjacentToRoom",
    value: function isAdjacentToRoom(point, room) {
      return point.x >= room.x - 1 && point.x <= room.x + room.width && point.y >= room.y - 1 && point.y <= room.y + room.height;
    }
  }, {
    key: "isValidDoorPlacement",
    value: function isValidDoorPlacement(point, corridor) {
      // Check if there's enough space around the door
      var neighboringCells = [{
        x: point.x - 1,
        y: point.y
      }, {
        x: point.x + 1,
        y: point.y
      }, {
        x: point.x,
        y: point.y - 1
      }, {
        x: point.x,
        y: point.y + 1
      }];

      // Count how many corridor cells are adjacent
      var corridorNeighbors = neighboringCells.filter(function (cell) {
        return corridor.path.some(function (p) {
          return p.x === cell.x && p.y === cell.y;
        });
      });

      // Only place door if it connects exactly two spaces
      // (one corridor side and one room side)
      return corridorNeighbors.length === 1;
    }
  }, {
    key: "assignRoomTypes",
    value: function assignRoomTypes() {
      // Sort rooms by size
      var sortedRooms = _toConsumableArray(this.rooms).sort(function (a, b) {
        return b.width * b.height - a.width * a.height;
      });

      // Assign types based on size and position
      sortedRooms[0].setType(RoomType.LARGE_HALL);

      // Find the room closest to top-left for entrance
      var topLeftRoom = this.rooms.reduce(function (closest, room) {
        var distance = Math.sqrt(room.x * room.x + room.y * room.y);
        if (!closest || distance < Math.sqrt(closest.x * closest.x + closest.y * closest.y)) {
          return room;
        }
        return closest;
      });
      topLeftRoom.setType(RoomType.ENTRANCE);

      // Find the room farthest from entrance for boss
      var farthestRoom = this.rooms.reduce(function (farthest, room) {
        var distance = Math.sqrt(Math.pow(room.x - topLeftRoom.x, 2) + Math.pow(room.y - topLeftRoom.y, 2));
        if (!farthest || distance > Math.sqrt(Math.pow(farthest.x - topLeftRoom.x, 2) + Math.pow(farthest.y - topLeftRoom.y, 2))) {
          return room;
        }
        return farthest;
      });
      farthestRoom.setType(RoomType.BOSS);

      // Assign remaining rooms randomly
      var remainingTypes = [RoomType.STORAGE, RoomType.TREASURE, RoomType.STANDARD];
      this.rooms.forEach(function (room) {
        if (!room.type || room.type === RoomType.STANDARD) {
          var randomType = remainingTypes[Math.floor(Math.random() * remainingTypes.length)];
          room.setType(randomType);
        }
      });
    }
  }, {
    key: "applyToGrid",
    value: function applyToGrid() {
      // First pass: Apply rooms
      var _iterator4 = _createForOfIteratorHelper(this.rooms),
        _step4;
      try {
        for (_iterator4.s(); !(_step4 = _iterator4.n()).done;) {
          var room = _step4.value;
          for (var _y = room.y; _y < room.y + room.height; _y++) {
            for (var _x = room.x; _x < room.x + room.width; _x++) {
              if (this.isInBounds(_x, _y)) {
                this.grid[_y][_x] = 1; // floor
              }
            }
          }
        }

        // Second pass: Apply corridors
      } catch (err) {
        _iterator4.e(err);
      } finally {
        _iterator4.f();
      }
      var _iterator5 = _createForOfIteratorHelper(this.corridors),
        _step5;
      try {
        for (_iterator5.s(); !(_step5 = _iterator5.n()).done;) {
          var corridor = _step5.value;
          var _iterator6 = _createForOfIteratorHelper(corridor.path),
            _step6;
          try {
            for (_iterator6.s(); !(_step6 = _iterator6.n()).done;) {
              var point = _step6.value;
              if (this.isInBounds(point.x, point.y)) {
                this.grid[point.y][point.x] = 1; // floor
              }
            }
          } catch (err) {
            _iterator6.e(err);
          } finally {
            _iterator6.f();
          }
        }

        // Third pass: Add walls
      } catch (err) {
        _iterator5.e(err);
      } finally {
        _iterator5.f();
      }
      var tempGrid = this.grid.map(function (row) {
        return _toConsumableArray(row);
      });
      for (var y = 0; y < this.height; y++) {
        for (var x = 0; x < this.width; x++) {
          if (tempGrid[y][x] === 0) {
            // Empty space
            if (this.hasAdjacentFloor(x, y)) {
              this.grid[y][x] = 3; // wall
            }
          }
        }
      }

      // Fourth pass: Place doors
      console.log('Attempting to place doors...');
      this.placeDoors();
    }
  }, {
    key: "placeDoors",
    value: function placeDoors() {
      var _iterator7 = _createForOfIteratorHelper(this.corridors),
        _step7;
      try {
        for (_iterator7.s(); !(_step7 = _iterator7.n()).done;) {
          var corridor = _step7.value;
          var startSection = corridor.path.slice(1, 4);
          var endSection = corridor.path.slice(-4, -1);
          for (var _i3 = 0, _arr = [].concat(_toConsumableArray(startSection), _toConsumableArray(endSection)); _i3 < _arr.length; _i3++) {
            var point = _arr[_i3];
            if (this.shouldPlaceDoor(point.x, point.y)) {
              this.grid[point.y][point.x] = 2; // door tile value
            }
          }
        }
      } catch (err) {
        _iterator7.e(err);
      } finally {
        _iterator7.f();
      }
    }
  }, {
    key: "shouldPlaceDoor",
    value: function shouldPlaceDoor(x, y) {
      if (!this.isInBounds(x, y)) return false;

      // The point itself must be a floor tile
      if (this.grid[y][x] !== 1) return false;

      // Check horizontal door possibility (walls on north and south)
      var horizontalDoor = this.isInBounds(x, y - 1) && this.grid[y - 1][x] === 3 &&
      // Wall above
      this.isInBounds(x, y + 1) && this.grid[y + 1][x] === 3 &&
      // Wall below
      this.isInBounds(x - 1, y) && this.grid[y][x - 1] === 1 &&
      // Floor left
      this.isInBounds(x + 1, y) && this.grid[y][x + 1] === 1; // Floor right

      // Check vertical door possibility (walls on east and west)
      var verticalDoor = this.isInBounds(x - 1, y) && this.grid[y][x - 1] === 3 &&
      // Wall left
      this.isInBounds(x + 1, y) && this.grid[y][x + 1] === 3 &&
      // Wall right
      this.isInBounds(x, y - 1) && this.grid[y - 1][x] === 1 &&
      // Floor above
      this.isInBounds(x, y + 1) && this.grid[y + 1][x] === 1; // Floor below

      return horizontalDoor || verticalDoor;
    }
  }, {
    key: "hasAdjacentFloor",
    value: function hasAdjacentFloor(x, y) {
      for (var dy = -1; dy <= 1; dy++) {
        for (var dx = -1; dx <= 1; dx++) {
          if (dx === 0 && dy === 0) continue;
          var ny = y + dy;
          var nx = x + dx;
          if (this.isInBounds(nx, ny) && this.grid[ny][nx] === 1) {
            return true;
          }
        }
      }
      return false;
    }
  }, {
    key: "isInBounds",
    value: function isInBounds(x, y) {
      return x >= 0 && x < this.width && y >= 0 && y < this.height;
    }
  }]);
}();

/***/ }),

/***/ "./src/game/dungeon/Room.js":
/*!**********************************!*\
  !*** ./src/game/dungeon/Room.js ***!
  \**********************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   Room: () => (/* binding */ Room),
/* harmony export */   RoomType: () => (/* binding */ RoomType)
/* harmony export */ });
function _typeof(o) { "@babel/helpers - typeof"; return _typeof = "function" == typeof Symbol && "symbol" == typeof Symbol.iterator ? function (o) { return typeof o; } : function (o) { return o && "function" == typeof Symbol && o.constructor === Symbol && o !== Symbol.prototype ? "symbol" : typeof o; }, _typeof(o); }
function _classCallCheck(a, n) { if (!(a instanceof n)) throw new TypeError("Cannot call a class as a function"); }
function _defineProperties(e, r) { for (var t = 0; t < r.length; t++) { var o = r[t]; o.enumerable = o.enumerable || !1, o.configurable = !0, "value" in o && (o.writable = !0), Object.defineProperty(e, _toPropertyKey(o.key), o); } }
function _createClass(e, r, t) { return r && _defineProperties(e.prototype, r), t && _defineProperties(e, t), Object.defineProperty(e, "prototype", { writable: !1 }), e; }
function _toPropertyKey(t) { var i = _toPrimitive(t, "string"); return "symbol" == _typeof(i) ? i : i + ""; }
function _toPrimitive(t, r) { if ("object" != _typeof(t) || !t) return t; var e = t[Symbol.toPrimitive]; if (void 0 !== e) { var i = e.call(t, r || "default"); if ("object" != _typeof(i)) return i; throw new TypeError("@@toPrimitive must return a primitive value."); } return ("string" === r ? String : Number)(t); }
// src/game/dungeon/Room.js

var RoomType = {
  STANDARD: 'standard',
  ENTRANCE: 'entrance',
  LARGE_HALL: 'largeHall',
  BOSS: 'boss',
  STORAGE: 'storage',
  TREASURE: 'treasure'
};
var Room = /*#__PURE__*/function () {
  function Room(x, y, width, height) {
    _classCallCheck(this, Room);
    this.x = x;
    this.y = y;
    this.width = width;
    this.height = height;
    this.doors = [];
    this.type = RoomType.STANDARD;
    this.features = new Map();

    // Additional properties for special rooms
    this.isLocked = false;
    this.requiredKey = null;
    this.contents = new Set(); // For items, monsters, etc.
  }
  return _createClass(Room, [{
    key: "intersects",
    value: function intersects(other) {
      var padding = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : 0;
      return !(this.x + this.width + padding < other.x || other.x + other.width + padding < this.x || this.y + this.height + padding < other.y || other.y + other.height + padding < this.y);
    }
  }, {
    key: "getCenter",
    value: function getCenter() {
      return {
        x: Math.floor(this.x + this.width / 2),
        y: Math.floor(this.y + this.height / 2)
      };
    }
  }, {
    key: "getBounds",
    value: function getBounds() {
      return {
        left: this.x,
        right: this.x + this.width,
        top: this.y,
        bottom: this.y + this.height
      };
    }
  }, {
    key: "addDoor",
    value: function addDoor(x, y) {
      var type = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : 'normal';
      this.doors.push({
        x: x,
        y: y,
        type: type
      });
    }

    // Get minimum size requirements for each room type
  }, {
    key: "setType",
    value: function setType(type) {
      this.type = type;
      // Apply type-specific properties
      switch (type) {
        case RoomType.TREASURE:
          this.isLocked = true;
          this.requiredKey = 'treasure_key';
          break;
        case RoomType.BOSS:
          this.isLocked = true;
          break;
        case RoomType.ENTRANCE:
          // Entrance should always be accessible
          this.isLocked = false;
          break;
      }
      return this;
    }

    // Generate a room of specific type
  }], [{
    key: "getMinSize",
    value: function getMinSize(type) {
      switch (type) {
        case RoomType.LARGE_HALL:
          return {
            width: 12,
            height: 12
          };
        case RoomType.BOSS:
          return {
            width: 15,
            height: 15
          };
        case RoomType.STORAGE:
          return {
            width: 5,
            height: 5
          };
        case RoomType.TREASURE:
          return {
            width: 7,
            height: 7
          };
        case RoomType.ENTRANCE:
          return {
            width: 8,
            height: 8
          };
        default:
          return {
            width: 6,
            height: 6
          };
      }
    }
  }, {
    key: "generate",
    value: function generate(type, availableWidth, availableHeight) {
      var padding = arguments.length > 3 && arguments[3] !== undefined ? arguments[3] : 2;
      var minSize = Room.getMinSize(type);
      var width, height;
      switch (type) {
        case RoomType.LARGE_HALL:
          width = minSize.width + Math.floor(Math.random() * 4);
          height = minSize.height + Math.floor(Math.random() * 4);
          break;
        case RoomType.BOSS:
          width = minSize.width + Math.floor(Math.random() * 5);
          height = minSize.height + Math.floor(Math.random() * 5);
          break;
        case RoomType.STORAGE:
          width = minSize.width + Math.floor(Math.random() * 2);
          height = minSize.height + Math.floor(Math.random() * 2);
          break;
        case RoomType.TREASURE:
          width = minSize.width + Math.floor(Math.random() * 3);
          height = minSize.height + Math.floor(Math.random() * 3);
          break;
        case RoomType.ENTRANCE:
          width = minSize.width;
          height = minSize.height;
          break;
        default:
          // STANDARD
          width = minSize.width + Math.floor(Math.random() * 4);
          height = minSize.height + Math.floor(Math.random() * 4);
      }

      // Ensure room fits in available space
      width = Math.min(width, availableWidth - padding * 2);
      height = Math.min(height, availableHeight - padding * 2);

      // Position room
      var x = padding + Math.floor(Math.random() * (availableWidth - width - padding * 2));
      var y = padding + Math.floor(Math.random() * (availableHeight - height - padding * 2));
      var room = new Room(x, y, width, height);
      room.setType(type);
      return room;
    }
  }]);
}();

/***/ }),

/***/ "./src/game/dungeon/RoomColors.js":
/*!****************************************!*\
  !*** ./src/game/dungeon/RoomColors.js ***!
  \****************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   RoomColors: () => (/* binding */ RoomColors)
/* harmony export */ });
/* harmony import */ var _Room_js__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ./Room.js */ "./src/game/dungeon/Room.js");
function _typeof(o) { "@babel/helpers - typeof"; return _typeof = "function" == typeof Symbol && "symbol" == typeof Symbol.iterator ? function (o) { return typeof o; } : function (o) { return o && "function" == typeof Symbol && o.constructor === Symbol && o !== Symbol.prototype ? "symbol" : typeof o; }, _typeof(o); }
function _defineProperty(e, r, t) { return (r = _toPropertyKey(r)) in e ? Object.defineProperty(e, r, { value: t, enumerable: !0, configurable: !0, writable: !0 }) : e[r] = t, e; }
function _toPropertyKey(t) { var i = _toPrimitive(t, "string"); return "symbol" == _typeof(i) ? i : i + ""; }
function _toPrimitive(t, r) { if ("object" != _typeof(t) || !t) return t; var e = t[Symbol.toPrimitive]; if (void 0 !== e) { var i = e.call(t, r || "default"); if ("object" != _typeof(i)) return i; throw new TypeError("@@toPrimitive must return a primitive value."); } return ("string" === r ? String : Number)(t); }
// src/game/dungeon/RoomColors.js


var RoomColors = _defineProperty(_defineProperty(_defineProperty(_defineProperty(_defineProperty(_defineProperty(_defineProperty(_defineProperty(_defineProperty({}, _Room_js__WEBPACK_IMPORTED_MODULE_0__.RoomType.STANDARD, '#444'), _Room_js__WEBPACK_IMPORTED_MODULE_0__.RoomType.ENTRANCE, '#4a9'), _Room_js__WEBPACK_IMPORTED_MODULE_0__.RoomType.LARGE_HALL, '#66a'), _Room_js__WEBPACK_IMPORTED_MODULE_0__.RoomType.BOSS, '#a44'), _Room_js__WEBPACK_IMPORTED_MODULE_0__.RoomType.STORAGE, '#974'), _Room_js__WEBPACK_IMPORTED_MODULE_0__.RoomType.TREASURE, '#aa4'), 'corridor', '#335'), 'wall', '#666'), 'door', {
  'open': '#4a2',
  // Green
  'closed': '#8b4513' // Brown
});

/***/ }),

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
    this.x = x;
    this.y = y;
    this.type = 'floor';
    this.walkable = true;
    this.transparent = true;
    this.visible = false;
    this.explored = false;
    this.entities = new Set();
    this.properties = new Map();
    this.isDoor = false;
    this.isOpen = false;
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
      switch (type) {
        case 'wall':
          this.walkable = false;
          this.transparent = false;
          this.isDoor = false;
          break;
        case 'door':
          this.isDoor = true;
          this.isOpen = Math.random() < 0.2; // 20% chance to start open
          this.walkable = this.isOpen;
          this.transparent = this.isOpen;
          break;
        case 'floor':
          this.walkable = true;
          this.transparent = true;
          this.isDoor = false;
          break;
        default:
          console.warn("Unknown cell type: ".concat(type));
      }
    }
  }, {
    key: "toggleDoor",
    value: function toggleDoor() {
      if (!this.isDoor) return false;
      this.isOpen = !this.isOpen;
      this.walkable = this.isOpen;
      this.transparent = this.isOpen;
      return true;
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

      // Check if it's a door and it's closed
      if (cell.isDoor && !cell.isOpen) {
        return false;
      }
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
/* harmony import */ var _dungeon_DungeonGenerator_js__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ./dungeon/DungeonGenerator.js */ "./src/game/dungeon/DungeonGenerator.js");
/* harmony import */ var _Camera_js__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! ./Camera.js */ "./src/game/Camera.js");
/* harmony import */ var _dungeon_Room_js__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! ./dungeon/Room.js */ "./src/game/dungeon/Room.js");
/* harmony import */ var _dungeon_RoomColors_js__WEBPACK_IMPORTED_MODULE_4__ = __webpack_require__(/*! ./dungeon/RoomColors.js */ "./src/game/dungeon/RoomColors.js");
function _typeof(o) { "@babel/helpers - typeof"; return _typeof = "function" == typeof Symbol && "symbol" == typeof Symbol.iterator ? function (o) { return typeof o; } : function (o) { return o && "function" == typeof Symbol && o.constructor === Symbol && o !== Symbol.prototype ? "symbol" : typeof o; }, _typeof(o); }
function _createForOfIteratorHelper(r, e) { var t = "undefined" != typeof Symbol && r[Symbol.iterator] || r["@@iterator"]; if (!t) { if (Array.isArray(r) || (t = _unsupportedIterableToArray(r)) || e && r && "number" == typeof r.length) { t && (r = t); var _n = 0, F = function F() {}; return { s: F, n: function n() { return _n >= r.length ? { done: !0 } : { done: !1, value: r[_n++] }; }, e: function e(r) { throw r; }, f: F }; } throw new TypeError("Invalid attempt to iterate non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method."); } var o, a = !0, u = !1; return { s: function s() { t = t.call(r); }, n: function n() { var r = t.next(); return a = r.done, r; }, e: function e(r) { u = !0, o = r; }, f: function f() { try { a || null == t["return"] || t["return"](); } finally { if (u) throw o; } } }; }
function _slicedToArray(r, e) { return _arrayWithHoles(r) || _iterableToArrayLimit(r, e) || _unsupportedIterableToArray(r, e) || _nonIterableRest(); }
function _nonIterableRest() { throw new TypeError("Invalid attempt to destructure non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method."); }
function _unsupportedIterableToArray(r, a) { if (r) { if ("string" == typeof r) return _arrayLikeToArray(r, a); var t = {}.toString.call(r).slice(8, -1); return "Object" === t && r.constructor && (t = r.constructor.name), "Map" === t || "Set" === t ? Array.from(r) : "Arguments" === t || /^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(t) ? _arrayLikeToArray(r, a) : void 0; } }
function _arrayLikeToArray(r, a) { (null == a || a > r.length) && (a = r.length); for (var e = 0, n = Array(a); e < a; e++) n[e] = r[e]; return n; }
function _iterableToArrayLimit(r, l) { var t = null == r ? null : "undefined" != typeof Symbol && r[Symbol.iterator] || r["@@iterator"]; if (null != t) { var e, n, i, u, a = [], f = !0, o = !1; try { if (i = (t = t.call(r)).next, 0 === l) { if (Object(t) !== t) return; f = !1; } else for (; !(f = (e = i.call(t)).done) && (a.push(e.value), a.length !== l); f = !0); } catch (r) { o = !0, n = r; } finally { try { if (!f && null != t["return"] && (u = t["return"](), Object(u) !== u)) return; } finally { if (o) throw n; } } return a; } }
function _arrayWithHoles(r) { if (Array.isArray(r)) return r; }
function _classCallCheck(a, n) { if (!(a instanceof n)) throw new TypeError("Cannot call a class as a function"); }
function _defineProperties(e, r) { for (var t = 0; t < r.length; t++) { var o = r[t]; o.enumerable = o.enumerable || !1, o.configurable = !0, "value" in o && (o.writable = !0), Object.defineProperty(e, _toPropertyKey(o.key), o); } }
function _createClass(e, r, t) { return r && _defineProperties(e.prototype, r), t && _defineProperties(e, t), Object.defineProperty(e, "prototype", { writable: !1 }), e; }
function _toPropertyKey(t) { var i = _toPrimitive(t, "string"); return "symbol" == _typeof(i) ? i : i + ""; }
function _toPrimitive(t, r) { if ("object" != _typeof(t) || !t) return t; var e = t[Symbol.toPrimitive]; if (void 0 !== e) { var i = e.call(t, r || "default"); if ("object" != _typeof(i)) return i; throw new TypeError("@@toPrimitive must return a primitive value."); } return ("string" === r ? String : Number)(t); }
// src/game/index.js






var GameManager = /*#__PURE__*/function () {
  function GameManager() {
    var _this = this;
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

      // Constants
      var GRID_WIDTH = 50; // World size
      var GRID_HEIGHT = 50;
      var TILE_SIZE = 16;

      // Set fixed canvas size (won't scale with window)
      this.canvas.width = 800; // Show 50 tiles at 16px each
      this.canvas.height = 600; // Show 37.5 tiles vertically

      // Initialize camera
      this.camera = new _Camera_js__WEBPACK_IMPORTED_MODULE_2__.Camera(this.canvas.width, this.canvas.height, GRID_WIDTH, GRID_HEIGHT, TILE_SIZE);

      // Initial canvas setup
      this.ctx.imageSmoothingEnabled = false;

      // Create grid system
      this.gridManager = new _grid_GridManager_js__WEBPACK_IMPORTED_MODULE_0__.GridManager(GRID_WIDTH, GRID_HEIGHT, TILE_SIZE);

      // Create dungeon generator
      this.dungeonGenerator = new _dungeon_DungeonGenerator_js__WEBPACK_IMPORTED_MODULE_1__.DungeonGenerator(GRID_WIDTH, GRID_HEIGHT);

      // Initialize room type tracking
      this.roomTypes = new Map(); // Stores coordinates -> room type

      // Set up game state
      this.lastFrameTime = 0;
      this.frameCount = 0;

      // Player state
      this.playerPos = {
        x: 0,
        y: 0
      };
      this.playerFacing = {
        x: 0,
        y: -1
      }; // Initially facing north

      // Generate initial dungeon and place player
      this.generateNewDungeon();

      // Bind event handlers
      this.handleKeyDown = this.handleKeyDown.bind(this);

      // Add key event listeners
      window.addEventListener('keydown', function (event) {
        if (event.code === 'Space') {
          _this.generateNewDungeon();
          event.preventDefault();
        } else {
          _this.handleKeyDown(event);
        }
      });

      // Add legend
      this.addLegend();

      // Start game loop
      console.log('Starting game loop...');
      this.gameLoop(0);

      // Hide loading screen
      var loadingScreen = document.getElementById('loadingScreen');
      if (loadingScreen) {
        loadingScreen.classList.add('hidden');
      }

      // Add instructions
      this.addInstructions();
    } catch (error) {
      console.error('Game initialization error:', error);
      throw error;
    }
  }
  return _createClass(GameManager, [{
    key: "addLegend",
    value: function addLegend() {
      var legend = document.createElement('div');
      legend.style.position = 'absolute';
      legend.style.top = '10px';
      legend.style.right = '10px';
      legend.style.color = 'white';
      legend.style.fontFamily = 'monospace';
      legend.style.fontSize = '14px';
      legend.style.backgroundColor = 'rgba(0, 0, 0, 0.7)';
      legend.style.padding = '10px';
      legend.style.borderRadius = '5px';
      var legendHTML = '<div style="text-align: left; font-weight: bold;">Room Types:</div>';

      // Add each room type to the legend
      Object.entries(_dungeon_Room_js__WEBPACK_IMPORTED_MODULE_3__.RoomType).forEach(function (_ref) {
        var _ref2 = _slicedToArray(_ref, 2),
          key = _ref2[0],
          value = _ref2[1];
        var color = _dungeon_RoomColors_js__WEBPACK_IMPORTED_MODULE_4__.RoomColors[value];
        legendHTML += "\n          <div style=\"display: flex; align-items: center; margin: 5px 0;\">\n              <div style=\"width: 20px; height: 20px; background-color: ".concat(color, "; margin-right: 10px; border: 1px solid #666;\"></div>\n              <span>").concat(key.charAt(0) + key.slice(1).toLowerCase().replace('_', ' '), "</span>\n          </div>");
      });

      // Add corridor
      legendHTML += "\n      <div style=\"display: flex; align-items: center; margin: 5px 0;\">\n          <div style=\"width: 20px; height: 20px; background-color: ".concat(_dungeon_RoomColors_js__WEBPACK_IMPORTED_MODULE_4__.RoomColors.corridor, "; margin-right: 10px; border: 1px solid #666;\"></div>\n          <span>Corridor</span>\n      </div>");

      // Add doors
      legendHTML += "\n      <div style=\"display: flex; align-items: center; margin: 5px 0;\">\n          <div style=\"width: 20px; height: 20px; background-color: ".concat(_dungeon_RoomColors_js__WEBPACK_IMPORTED_MODULE_4__.RoomColors.door.closed, "; margin-right: 10px; border: 1px solid #666;\"></div>\n          <span>Door (Closed)</span>\n      </div>\n      <div style=\"display: flex; align-items: center; margin: 5px 0;\">\n          <div style=\"width: 20px; height: 20px; background-color: ").concat(_dungeon_RoomColors_js__WEBPACK_IMPORTED_MODULE_4__.RoomColors.door.open, "; margin-right: 10px; border: 1px solid #666;\"></div>\n          <span>Door (Open)</span>\n      </div>");
      legend.innerHTML = legendHTML;
      document.getElementById('gameContainer').appendChild(legend);
    }
  }, {
    key: "generateNewDungeon",
    value: function generateNewDungeon() {
      /// Clear existing room type tracking
      this.roomTypes.clear();

      // Generate new dungeon layout
      var dungeon = this.dungeonGenerator.generate();

      // Store room types for each cell
      var _iterator = _createForOfIteratorHelper(dungeon.rooms),
        _step;
      try {
        for (_iterator.s(); !(_step = _iterator.n()).done;) {
          var room = _step.value;
          for (var _y = room.y; _y < room.y + room.height; _y++) {
            for (var _x = room.x; _x < room.x + room.width; _x++) {
              this.roomTypes.set("".concat(_x, ",").concat(_y), room.type);
            }
          }
        }

        // Store corridor locations
      } catch (err) {
        _iterator.e(err);
      } finally {
        _iterator.f();
      }
      var _iterator2 = _createForOfIteratorHelper(dungeon.corridors),
        _step2;
      try {
        for (_iterator2.s(); !(_step2 = _iterator2.n()).done;) {
          var corridor = _step2.value;
          var _iterator3 = _createForOfIteratorHelper(corridor.path),
            _step3;
          try {
            for (_iterator3.s(); !(_step3 = _iterator3.n()).done;) {
              var point = _step3.value;
              this.roomTypes.set("".concat(point.x, ",").concat(point.y), 'corridor');
            }
          } catch (err) {
            _iterator3.e(err);
          } finally {
            _iterator3.f();
          }
        }

        // Clear existing grid
      } catch (err) {
        _iterator2.e(err);
      } finally {
        _iterator2.f();
      }
      this.gridManager.clear();

      // Apply dungeon to grid
      for (var y = 0; y < dungeon.grid.length; y++) {
        for (var x = 0; x < dungeon.grid[y].length; x++) {
          var cell = this.gridManager.getCell(x, y);
          switch (dungeon.grid[y][x]) {
            case 0:
              // Empty
              cell.setType('wall');
              cell.walkable = false;
              cell.transparent = false;
              break;
            case 1:
              // Floor
              cell.setType('floor');
              cell.walkable = true;
              cell.transparent = true;
              break;
            case 2:
              // Door
              cell.setType('door');
              cell.walkable = true;
              cell.transparent = false;
              break;
            case 3:
              // Wall
              cell.setType('wall');
              cell.walkable = false;
              cell.transparent = false;
              break;
          }
        }
      }

      // Place player in a valid position
      this.placePlayerInDungeon();

      // Reset camera to follow player
      this.camera.follow(this.playerPos.x, this.playerPos.y);

      // Update initial visibility
      this.updateVisibility();
    }
  }, {
    key: "placePlayerInDungeon",
    value: function placePlayerInDungeon() {
      // Find first walkable cell
      for (var y = 0; y < this.gridManager.height; y++) {
        for (var x = 0; x < this.gridManager.width; x++) {
          if (this.gridManager.canMoveTo(x, y)) {
            this.playerPos = {
              x: x,
              y: y
            };
            return;
          }
        }
      }
    }
  }, {
    key: "updateVisibility",
    value: function updateVisibility() {
      this.gridManager.resetVisibility();
      var visibleCells = this.gridManager.getCellsInRange(this.playerPos.x, this.playerPos.y, 5);
      var _iterator4 = _createForOfIteratorHelper(visibleCells),
        _step4;
      try {
        for (_iterator4.s(); !(_step4 = _iterator4.n()).done;) {
          var cell = _step4.value;
          if (this.gridManager.hasLineOfSight(this.playerPos.x, this.playerPos.y, cell.x, cell.y)) {
            cell.visible = true;
            cell.explored = true;
          }
        }
      } catch (err) {
        _iterator4.e(err);
      } finally {
        _iterator4.f();
      }
    }
  }, {
    key: "addInstructions",
    value: function addInstructions() {
      var instructions = document.createElement('div');
      instructions.style.position = 'absolute';
      instructions.style.top = '10px';
      instructions.style.left = '10px';
      instructions.style.color = 'white';
      instructions.style.fontFamily = 'monospace';
      instructions.style.fontSize = '14px';
      instructions.style.backgroundColor = 'rgba(0, 0, 0, 0.7)';
      instructions.style.padding = '10px';
      instructions.style.borderRadius = '5px';
      instructions.innerHTML = 'Arrow Keys: Move<br>E: Open/Close Door<br>Space: Generate New Dungeon';
      document.getElementById('gameContainer').appendChild(instructions);
    }
  }, {
    key: "handleKeyDown",
    value: function handleKeyDown(event) {
      if (event.code === 'KeyE') {
        this.tryToggleDoorInFacingDirection();
        event.preventDefault();
        return;
      }
      var newX = this.playerPos.x;
      var newY = this.playerPos.y;
      var newFacingX = 0;
      var newFacingY = 0;

      // Determine facing direction based on key
      switch (event.code) {
        case 'ArrowUp':
          newY--;
          newFacingX = 0;
          newFacingY = -1;
          break;
        case 'ArrowDown':
          newY++;
          newFacingX = 0;
          newFacingY = 1;
          break;
        case 'ArrowLeft':
          newX--;
          newFacingX = -1;
          newFacingY = 0;
          break;
        case 'ArrowRight':
          newX++;
          newFacingX = 1;
          newFacingY = 0;
          break;
        default:
          return;
      }

      // Always update facing direction
      this.playerFacing.x = newFacingX;
      this.playerFacing.y = newFacingY;

      // Attempt movement if possible
      if (this.gridManager.canMoveTo(newX, newY)) {
        this.playerPos.x = newX;
        this.playerPos.y = newY;
        this.camera.follow(this.playerPos.x, this.playerPos.y);
        this.updateVisibility();
      }
      event.preventDefault();
    }
  }, {
    key: "tryToggleDoorInFacingDirection",
    value: function tryToggleDoorInFacingDirection() {
      var facingX = this.playerPos.x + this.playerFacing.x;
      var facingY = this.playerPos.y + this.playerFacing.y;
      var facingCell = this.gridManager.getCell(facingX, facingY);
      if (facingCell && facingCell.isDoor) {
        if (facingCell.toggleDoor()) {
          this.updateVisibility();
          return true;
        }
      }
      return false;
    }
  }, {
    key: "renderGrid",
    value: function renderGrid() {
      var _this$gridManager = this.gridManager,
        width = _this$gridManager.width,
        height = _this$gridManager.height,
        tileSize = _this$gridManager.tileSize;
      for (var y = 0; y < height; y++) {
        for (var x = 0; x < width; x++) {
          if (!this.camera.isVisible(x, y)) continue;
          var cell = this.gridManager.getCell(x, y);
          if (!cell.explored) continue;
          var screenPos = this.camera.worldToScreen(x, y);
          var fillColor = '#333';
          if (!cell.visible) {
            fillColor = '#1a1a1a';
          } else {
            var roomType = this.roomTypes.get("".concat(x, ",").concat(y));
            switch (cell.type) {
              case 'wall':
                fillColor = _dungeon_RoomColors_js__WEBPACK_IMPORTED_MODULE_4__.RoomColors.wall;
                break;
              case 'door':
                fillColor = cell.isOpen ? _dungeon_RoomColors_js__WEBPACK_IMPORTED_MODULE_4__.RoomColors.door.open : _dungeon_RoomColors_js__WEBPACK_IMPORTED_MODULE_4__.RoomColors.door.closed;
                break;
              case 'floor':
                if (roomType === 'corridor') {
                  fillColor = _dungeon_RoomColors_js__WEBPACK_IMPORTED_MODULE_4__.RoomColors.corridor;
                } else {
                  fillColor = _dungeon_RoomColors_js__WEBPACK_IMPORTED_MODULE_4__.RoomColors[roomType] || _dungeon_RoomColors_js__WEBPACK_IMPORTED_MODULE_4__.RoomColors[_dungeon_Room_js__WEBPACK_IMPORTED_MODULE_3__.RoomType.STANDARD];
                }
                break;
            }
          }
          this.ctx.fillStyle = fillColor;
          this.ctx.fillRect(screenPos.x, screenPos.y, tileSize, tileSize);
          if (cell.visible) {
            this.ctx.strokeStyle = '#222';
            this.ctx.strokeRect(screenPos.x, screenPos.y, tileSize, tileSize);
          }
        }
      }
    }
  }, {
    key: "renderPlayer",
    value: function renderPlayer() {
      var screenPos = this.camera.worldToScreen(this.playerPos.x, this.playerPos.y);
      var tileSize = this.gridManager.tileSize;

      // Draw player base
      this.ctx.fillStyle = '#ff0';
      this.ctx.fillRect(screenPos.x + 2, screenPos.y + 2, tileSize - 4, tileSize - 4);

      // Draw direction indicator
      this.ctx.fillStyle = '#f00';
      var indicatorSize = tileSize / 3;
      var centerX = screenPos.x + tileSize / 2;
      var centerY = screenPos.y + tileSize / 2;
      var indicatorX = centerX + this.playerFacing.x * (tileSize / 4);
      var indicatorY = centerY + this.playerFacing.y * (tileSize / 4);
      this.ctx.beginPath();
      this.ctx.arc(indicatorX, indicatorY, indicatorSize / 2, 0, Math.PI * 2);
      this.ctx.fill();
    }
  }, {
    key: "gameLoop",
    value: function gameLoop(timestamp) {
      try {
        var deltaTime = timestamp - this.lastFrameTime;
        this.lastFrameTime = timestamp;
        this.ctx.fillStyle = '#000';
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
        this.renderGrid();
        this.renderPlayer();
        this.ctx.fillStyle = '#fff';
        this.ctx.font = '12px monospace';
        this.ctx.fillText("FPS: ".concat(Math.round(1000 / deltaTime)), 10, this.canvas.height - 20);
        this.ctx.fillText("Pos: (".concat(this.playerPos.x, ", ").concat(this.playerPos.y, ")"), 10, this.canvas.height - 8);
        this.frameCount++;
        requestAnimationFrame(this.gameLoop.bind(this));
      } catch (error) {
        console.error('Game loop error:', error);
        throw error;
      }
    }
  }]);
}(); // Initialize game when the window loads
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