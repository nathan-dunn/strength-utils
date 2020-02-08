const DEFAULT_OPTIONS = {
  method: 'BASIC',
};

const PLATES_EASY = {
  45: 9,
  25: 1,
  10: 2,
  5: 1,
};

const PLATES_PRECISE = {
  ...PLATES_EASY,
  2.5: 1,
};

const LOADS_EASY = [
  45,
  55,
  65,
  75,
  85,
  95,
  105,
  115,
  125,
  135,
  145,
  155,
  165,
  175,
  185,
  195,
  205,
  215,
  225,
  235,
  245,
  255,
  265,
  275,
  285,
  295,
  305,
  315,
  325,
  335,
  345,
  355,
  365,
  375,
  385,
  395,
  405,
  415,
  425,
  435,
  445,
  455,
  465,
  475,
  485,
  495,
  505,
  515,
  525,
  535,
  545,
  555,
  565,
  575,
  585,
  595,
  605,
  615,
  625,
  635,
  645,
  655,
  665,
  675,
  685,
  695,
  705,
  715,
  725,
  735,
  745,
  755,
  765,
  775,
  785,
  795,
  805,
  815,
  825,
  835,
  845,
  855,
  865,
  875,
  885,
  895,
  905,
  915,
  925,
  935,
  945,
  955,
];

const LOADS_PRECISE = [
  45,
  50,
  55,
  60,
  65,
  70,
  75,
  80,
  85,
  90,
  95,
  100,
  105,
  110,
  115,
  120,
  125,
  130,
  135,
  140,
  145,
  150,
  155,
  160,
  165,
  170,
  175,
  180,
  185,
  190,
  195,
  200,
  205,
  210,
  215,
  220,
  225,
  230,
  235,
  240,
  245,
  250,
  255,
  260,
  265,
  270,
  275,
  280,
  285,
  290,
  295,
  300,
  305,
  310,
  315,
  320,
  325,
  330,
  335,
  340,
  345,
  350,
  355,
  360,
  365,
  370,
  375,
  380,
  385,
  390,
  395,
  400,
  405,
  410,
  415,
  420,
  425,
  430,
  435,
  440,
  445,
  450,
  455,
  460,
  465,
  470,
  475,
  480,
  485,
  490,
  495,
  500,
  505,
  510,
  515,
  520,
  525,
  530,
  535,
  540,
  545,
  550,
  555,
  560,
  565,
  570,
  575,
  580,
  585,
  590,
  595,
  600,
  605,
  610,
  615,
  620,
  625,
  630,
  635,
  640,
  645,
  650,
  655,
  660,
  665,
  670,
  675,
  680,
  685,
  690,
  695,
  700,
  705,
  710,
  715,
  720,
  725,
  730,
  735,
  740,
  745,
  750,
  755,
  760,
  765,
  770,
  775,
  780,
  785,
  790,
  795,
  800,
  805,
  810,
  815,
  820,
  825,
  830,
  835,
  840,
  845,
  850,
  855,
  860,
  865,
  870,
  875,
  880,
  885,
  890,
  895,
  900,
  905,
  910,
  915,
  920,
  925,
  930,
  935,
  940,
  945,
  950,
  955,
  960,
];

module.exports = {
  DEFAULT_OPTIONS,
  PLATES_EASY,
  PLATES_PRECISE,
  LOADS_EASY,
  LOADS_PRECISE,
};