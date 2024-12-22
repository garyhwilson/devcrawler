/******/ (() => { // webpackBootstrap
/******/ 	var __webpack_modules__ = ({

/***/ "./src/extension.js":
/*!**************************!*\
  !*** ./src/extension.js ***!
  \**************************/
/***/ ((module, __unused_webpack_exports, __webpack_require__) => {

var vscode = __webpack_require__(/*! vscode */ "vscode");
var path = __webpack_require__(/*! path */ "path");
function activate(context) {
  var currentPanel = undefined;
  var disposable = vscode.commands.registerCommand('devcrawler.start', function () {
    if (currentPanel) {
      currentPanel.reveal(vscode.ViewColumn.One);
      return;
    }
    currentPanel = vscode.window.createWebviewPanel('devcrawler', 'DevCrawler', vscode.ViewColumn.One, {
      enableScripts: true,
      retainContextWhenHidden: true
    });
    var scriptPathOnDisk = vscode.Uri.file(path.join(context.extensionPath, 'dist', 'game.js'));
    var scriptUri = currentPanel.webview.asWebviewUri(scriptPathOnDisk);
    currentPanel.webview.html = "<!DOCTYPE html>\n        <html lang=\"en\">\n        <head>\n            <meta charset=\"UTF-8\">\n            <meta name=\"viewport\" content=\"width=device-width, initial-scale=1.0\">\n            <title>DevCrawler</title>\n            <style>\n                body {\n                    margin: 0;\n                    padding: 0;\n                    width: 100vw;\n                    height: 100vh;\n                    overflow: hidden;\n                    background-color: #1e1e1e;\n                }\n                #gameContainer {\n                    position: relative;\n                    width: 100%;\n                    height: 100%;\n                    display: flex;\n                    justify-content: center;\n                    align-items: center;\n                }\n                #gameCanvas {\n                    background-color: #000;\n                }\n                #loadingScreen {\n                    position: absolute;\n                    top: 0;\n                    left: 0;\n                    width: 100%;\n                    height: 100%;\n                    background-color: #1e1e1e;\n                    display: flex;\n                    justify-content: center;\n                    align-items: center;\n                    color: #fff;\n                    font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;\n                    font-size: 24px;\n                }\n                .hidden {\n                    display: none !important;\n                }\n            </style>\n        </head>\n        <body>\n            <div id=\"gameContainer\">\n                <canvas id=\"gameCanvas\" width=\"800\" height=\"600\"></canvas>\n                <div id=\"loadingScreen\">Loading DevCrawler...</div>\n            </div>\n            <script>\n                // Initialize before loading game script\n                console.log('Initializing game environment...');\n            </script>\n            <script src=\"".concat(scriptUri, "\"></script>\n        </body>\n        </html>");
    currentPanel.onDidDispose(function () {
      currentPanel = undefined;
    }, null, context.subscriptions);
  });
  context.subscriptions.push(disposable);
}
function deactivate() {}
module.exports = {
  activate: activate,
  deactivate: deactivate
};

/***/ }),

/***/ "vscode":
/*!*************************!*\
  !*** external "vscode" ***!
  \*************************/
/***/ ((module) => {

"use strict";
module.exports = require("vscode");

/***/ }),

/***/ "path":
/*!***********************!*\
  !*** external "path" ***!
  \***********************/
/***/ ((module) => {

"use strict";
module.exports = require("path");

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
/******/ 	
/******/ 	// startup
/******/ 	// Load entry module and return exports
/******/ 	// This entry module is referenced by other modules so it can't be inlined
/******/ 	var __webpack_exports__ = __webpack_require__("./src/extension.js");
/******/ 	module.exports = __webpack_exports__;
/******/ 	
/******/ })()
;
//# sourceMappingURL=extension.js.map