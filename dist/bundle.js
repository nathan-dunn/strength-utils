!function(e){var r={};function t(n){if(r[n])return r[n].exports;var o=r[n]={i:n,l:!1,exports:{}};return e[n].call(o.exports,o,o.exports,t),o.l=!0,o.exports}t.m=e,t.c=r,t.d=function(e,r,n){t.o(e,r)||Object.defineProperty(e,r,{enumerable:!0,get:n})},t.r=function(e){"undefined"!=typeof Symbol&&Symbol.toStringTag&&Object.defineProperty(e,Symbol.toStringTag,{value:"Module"}),Object.defineProperty(e,"__esModule",{value:!0})},t.t=function(e,r){if(1&r&&(e=t(e)),8&r)return e;if(4&r&&"object"==typeof e&&e&&e.__esModule)return e;var n=Object.create(null);if(t.r(n),Object.defineProperty(n,"default",{enumerable:!0,value:e}),2&r&&"string"!=typeof e)for(var o in e)t.d(n,o,function(r){return e[r]}.bind(null,o));return n},t.n=function(e){var r=e&&e.__esModule?function(){return e.default}:function(){return e};return t.d(r,"a",r),r},t.o=function(e,r){return Object.prototype.hasOwnProperty.call(e,r)},t.p="/dist/",t(t.s=0)}([function(e,r,t){function n(e,r){var t=Object.keys(e);if(Object.getOwnPropertySymbols){var n=Object.getOwnPropertySymbols(e);r&&(n=n.filter((function(r){return Object.getOwnPropertyDescriptor(e,r).enumerable}))),t.push.apply(t,n)}return t}function o(e){for(var r=1;r<arguments.length;r++){var t=null!=arguments[r]?arguments[r]:{};r%2?n(Object(t),!0).forEach((function(r){u(e,r,t[r])})):Object.getOwnPropertyDescriptors?Object.defineProperties(e,Object.getOwnPropertyDescriptors(t)):n(Object(t)).forEach((function(r){Object.defineProperty(e,r,Object.getOwnPropertyDescriptor(t,r))}))}return e}function u(e,r,t){return r in e?Object.defineProperty(e,r,{value:t,enumerable:!0,configurable:!0,writable:!0}):e[r]=t,e}function c(e,r){return function(e){if(Array.isArray(e))return e}(e)||function(e,r){if(!(Symbol.iterator in Object(e)||"[object Arguments]"===Object.prototype.toString.call(e)))return;var t=[],n=!0,o=!1,u=void 0;try{for(var c,i=e[Symbol.iterator]();!(n=(c=i.next()).done)&&(t.push(c.value),!r||t.length!==r);n=!0);}catch(e){o=!0,u=e}finally{try{n||null==i.return||i.return()}finally{if(o)throw u}}return t}(e,r)||function(){throw new TypeError("Invalid attempt to destructure non-iterable instance")}()}var i=t(1),a=i.DEFAULT_OPTIONS,f=(i.PLATES_EASY,i.LOADS_EASY);i.LOADS_PRECISE;function l(e){var r=arguments.length>1&&void 0!==arguments[1]?arguments[1]:2;return Number(e.toPrecision(r))}function p(e){var r=arguments.length>1&&void 0!==arguments[1]?arguments[1]:1,t=arguments.length>2&&void 0!==arguments[2]?arguments[2]:"round",n="up"===t?"ceil":"down"===t?"floor":"round";return Number(Math[n](e/r)*r)}function b(e){var r=Object.entries(e).map((function(e){var r=c(e,2),t=r[0],n=r[1];return t=t.toUpperCase(),"string"==typeof n&&(n=n.toUpperCase()),"TRUE"===n&&(n=!0),"FALSE"===n&&(n=!1),n==Number(n)&&(n=Number(n)),[t,n]}));return Object.fromEntries(r)}function s(e,r){var t=function(e){var r=45;return e<90&&(r=25),r}(e),n=t;if(["DL","DEADLIFT"].includes(String(r).toUpperCase())){var o=90;(t+o)/e>.5&&(o=50),(t+o)/e>.5&&(o=20),n=t+o}return n}function O(e,r){for(var t=[r,r],n=e-r,o=4,u=n/o;u>90;)u=n/++o;for(var c=1;c<o;c++){var i=p(t[t.length-1]+u,1);t.push(i)}return t}function v(e,r){for(var t=null,n=null,o=0;o<r.length;o++){var u=r[o];if(u>e){n=u,o>0&&(t=r[o-1]);break}}return[t,n]}function y(e,r){arguments.length>2&&void 0!==arguments[2]&&arguments[2];var t=e,n=v(e,f),o=c(n,2),u=o[0],i=o[1];t=i-e<e-u?i:u;return t}e.exports={findWarmups:function(e){var r=arguments.length>1&&void 0!==arguments[1]?arguments[1]:"",t=arguments.length>2&&void 0!==arguments[2]?arguments[2]:{};t=b(o({},a,{},t,{workWeight:e,liftName:r}));var n=s(e,r),u=O(e,n),c=u.map((function(r){return l(r/e)})),i=[5,5,5,3,2,1],f=u.map((function(r,t,n){var o=t===n.length-1;return y(r,e,o)})),p=f.map((function(r){return l(r/e)})),v=f.map((function(e,r){return{weight:e,reps:i[r]||1,percentage:p[r],exactWeight:u[r],exactPercentage:c[r]}})),d="".concat(r," ").concat(v.map((function(e){return"".concat(e.weight,"x").concat(e.reps)})).concat(["".concat(e,"xRX")]).join(","));return{warmups:v,text:d}},calculateWeightNeeded:function(e,r){return e=Number(e),r=Number(r),e&&r?p(r/(.033*e+1),2.5,"ceil"):""},calculateRepsNeeded:function(e,r){if(e=Number(e),r=Number(r),!e||!r)return"";if(e>r)return 1;var t=p((r-e)/(.033*e),1,"ceil");return t<=0?"1*":t},calculateMax:function(e,r){return e=Number(e),r=Number(r),e&&r?p(e*r*.033+e,5,"floor"):""}}},function(e,r){function t(e,r){var t=Object.keys(e);if(Object.getOwnPropertySymbols){var n=Object.getOwnPropertySymbols(e);r&&(n=n.filter((function(r){return Object.getOwnPropertyDescriptor(e,r).enumerable}))),t.push.apply(t,n)}return t}function n(e,r,t){return r in e?Object.defineProperty(e,r,{value:t,enumerable:!0,configurable:!0,writable:!0}):e[r]=t,e}var o={45:9,25:1,10:2,5:1},u=function(e){for(var r=1;r<arguments.length;r++){var o=null!=arguments[r]?arguments[r]:{};r%2?t(Object(o),!0).forEach((function(r){n(e,r,o[r])})):Object.getOwnPropertyDescriptors?Object.defineProperties(e,Object.getOwnPropertyDescriptors(o)):t(Object(o)).forEach((function(r){Object.defineProperty(e,r,Object.getOwnPropertyDescriptor(o,r))}))}return e}({},o,{2.5:1});e.exports={DEFAULT_OPTIONS:{method:"BASIC"},PLATES_EASY:o,PLATES_PRECISE:u,LOADS_EASY:[45,55,65,75,85,95,105,115,125,135,145,155,165,175,185,195,205,215,225,235,245,255,265,275,285,295,305,315,325,335,345,355,365,375,385,395,405,415,425,435,445,455,465,475,485,495,505,515,525,535,545,555,565,575,585,595,605,615,625,635,645,655,665,675,685,695,705,715,725,735,745,755,765,775,785,795,805,815,825,835,845,855,865,875,885,895,905,915,925,935,945,955],LOADS_PRECISE:[45,50,55,60,65,70,75,80,85,90,95,100,105,110,115,120,125,130,135,140,145,150,155,160,165,170,175,180,185,190,195,200,205,210,215,220,225,230,235,240,245,250,255,260,265,270,275,280,285,290,295,300,305,310,315,320,325,330,335,340,345,350,355,360,365,370,375,380,385,390,395,400,405,410,415,420,425,430,435,440,445,450,455,460,465,470,475,480,485,490,495,500,505,510,515,520,525,530,535,540,545,550,555,560,565,570,575,580,585,590,595,600,605,610,615,620,625,630,635,640,645,650,655,660,665,670,675,680,685,690,695,700,705,710,715,720,725,730,735,740,745,750,755,760,765,770,775,780,785,790,795,800,805,810,815,820,825,830,835,840,845,850,855,860,865,870,875,880,885,890,895,900,905,910,915,920,925,930,935,940,945,950,955,960]}}]);