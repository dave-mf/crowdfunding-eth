"use strict";
/*
 * ATTENTION: An "eval-source-map" devtool has been used.
 * This devtool is neither made for production nor for readable output files.
 * It uses "eval()" calls to create a separate source file with attached SourceMaps in the browser devtools.
 * If you are trying to read the output file, select a different devtool (https://webpack.js.org/configuration/devtool/)
 * or disable the default devtool with "devtool: false".
 * If you are looking for production-ready output files, see mode: "production" (https://webpack.js.org/configuration/mode/).
 */
(() => {
var exports = {};
exports.id = "pages/api/eth-price";
exports.ids = ["pages/api/eth-price"];
exports.modules = {

/***/ "(api)/./pages/api/eth-price.js":
/*!********************************!*\
  !*** ./pages/api/eth-price.js ***!
  \********************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

eval("__webpack_require__.r(__webpack_exports__);\n/* harmony export */ __webpack_require__.d(__webpack_exports__, {\n/* harmony export */   \"default\": () => (/* binding */ handler)\n/* harmony export */ });\nasync function handler(req, res) {\n    try {\n        const response = await fetch(\"https://api.coingecko.com/api/v3/simple/price?ids=ethereum&vs_currencies=usd\");\n        const data = await response.json();\n        res.status(200).json(data);\n    } catch (error) {\n        console.error(\"Error fetching ETH price:\", error);\n        // Return a fallback price if the API call fails\n        res.status(200).json({\n            ethereum: {\n                usd: 2500\n            }\n        });\n    }\n}\n//# sourceURL=[module]\n//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiKGFwaSkvLi9wYWdlcy9hcGkvZXRoLXByaWNlLmpzLmpzIiwibWFwcGluZ3MiOiI7Ozs7QUFBZSxlQUFlQSxRQUFRQyxHQUFHLEVBQUVDLEdBQUcsRUFBRTtJQUM5QyxJQUFJO1FBQ0YsTUFBTUMsV0FBVyxNQUFNQyxNQUFNO1FBQzdCLE1BQU1DLE9BQU8sTUFBTUYsU0FBU0csSUFBSTtRQUNoQ0osSUFBSUssTUFBTSxDQUFDLEtBQUtELElBQUksQ0FBQ0Q7SUFDdkIsRUFBRSxPQUFPRyxPQUFPO1FBQ2RDLFFBQVFELEtBQUssQ0FBQyw2QkFBNkJBO1FBQzNDLGdEQUFnRDtRQUNoRE4sSUFBSUssTUFBTSxDQUFDLEtBQUtELElBQUksQ0FBQztZQUFFSSxVQUFVO2dCQUFFQyxLQUFLO1lBQUs7UUFBRTtJQUNqRDtBQUNGLENBQUMiLCJzb3VyY2VzIjpbIndlYnBhY2s6Ly9jcm93ZGZ1bmRpbmcvLi9wYWdlcy9hcGkvZXRoLXByaWNlLmpzP2ViM2IiXSwic291cmNlc0NvbnRlbnQiOlsiZXhwb3J0IGRlZmF1bHQgYXN5bmMgZnVuY3Rpb24gaGFuZGxlcihyZXEsIHJlcykge1xuICB0cnkge1xuICAgIGNvbnN0IHJlc3BvbnNlID0gYXdhaXQgZmV0Y2goJ2h0dHBzOi8vYXBpLmNvaW5nZWNrby5jb20vYXBpL3YzL3NpbXBsZS9wcmljZT9pZHM9ZXRoZXJldW0mdnNfY3VycmVuY2llcz11c2QnKTtcbiAgICBjb25zdCBkYXRhID0gYXdhaXQgcmVzcG9uc2UuanNvbigpO1xuICAgIHJlcy5zdGF0dXMoMjAwKS5qc29uKGRhdGEpO1xuICB9IGNhdGNoIChlcnJvcikge1xuICAgIGNvbnNvbGUuZXJyb3IoJ0Vycm9yIGZldGNoaW5nIEVUSCBwcmljZTonLCBlcnJvcik7XG4gICAgLy8gUmV0dXJuIGEgZmFsbGJhY2sgcHJpY2UgaWYgdGhlIEFQSSBjYWxsIGZhaWxzXG4gICAgcmVzLnN0YXR1cygyMDApLmpzb24oeyBldGhlcmV1bTogeyB1c2Q6IDI1MDAgfSB9KTtcbiAgfVxufSAiXSwibmFtZXMiOlsiaGFuZGxlciIsInJlcSIsInJlcyIsInJlc3BvbnNlIiwiZmV0Y2giLCJkYXRhIiwianNvbiIsInN0YXR1cyIsImVycm9yIiwiY29uc29sZSIsImV0aGVyZXVtIiwidXNkIl0sInNvdXJjZVJvb3QiOiIifQ==\n//# sourceURL=webpack-internal:///(api)/./pages/api/eth-price.js\n");

/***/ })

};
;

// load runtime
var __webpack_require__ = require("../../webpack-api-runtime.js");
__webpack_require__.C(exports);
var __webpack_exec__ = (moduleId) => (__webpack_require__(__webpack_require__.s = moduleId))
var __webpack_exports__ = (__webpack_exec__("(api)/./pages/api/eth-price.js"));
module.exports = __webpack_exports__;

})();