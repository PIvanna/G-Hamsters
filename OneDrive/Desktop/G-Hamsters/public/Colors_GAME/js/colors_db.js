const COLORS_DB = [
  { name: "Red", rgb: [255, 0, 0], hsv: [0, 100, 100], cmy: [0, 255, 255] },
  { name: "Green", rgb: [0, 255, 0], hsv: [120, 100, 100] },
  { name: "Blue", rgb: [0, 0, 255], hsv: [240, 100, 100] },
  { name: "Cyan", rgb: [0, 255, 255], hsv: [180, 100, 100], cmy: [255, 0, 0] },
  { name: "Magenta", rgb: [255, 0, 255], hsv: [300, 100, 100], cmy: [0, 255, 0] },
  { name: "Yellow", rgb: [255, 255, 0], hsv: [60, 100, 100], cmy: [0, 0, 255] },
  { name: "Orange", rgb: [255, 165, 0], hsv: [30, 100, 100] },
  { name: "Purple", rgb: [128, 0, 128], hsv: [300, 100, 50] },
  { name: "Lime", rgb: [191, 255, 0] },
  { name: "Teal", rgb: [0, 128, 128] },
  { name: "Pink", rgb: [255, 192, 203] },
  { name: "Brown", rgb: [139, 69, 19] },
  { name: "Olive", rgb: [128, 128, 0] },
  { name: "Maroon", rgb: [128, 0, 0] },
  { name: "Navy", rgb: [0, 0, 128] },
  { name: "Gray", rgb: [128, 128, 128], cmy: [127, 127, 127] },
  { name: "Light Gray", rgb: [211, 211, 211], cmy: [44, 44, 44] },
  { name: "Dark Gray", rgb: [64, 64, 64], cmy: [191, 191, 191] },
  { name: "Sky Blue", rgb: [135, 206, 235] },
  { name: "Gold", rgb: [255, 215, 0] },
  { name: "Black", rgb: [0, 0, 0], hsv: [0, 0, 0], cmy: [255, 255, 255] },
  { name: "White", rgb: [255, 255, 255], hsv: [0, 0, 100], cmy: [0, 0, 0] },
  { name: "Coral", rgb: [255, 127, 80], hsv: [16, 69, 100] },
  { name: "Salmon", rgb: [250, 128, 114], hsv: [6, 54, 98] },
  { name: "Turquoise", rgb: [64, 224, 208], hsv: [174, 71, 88] },
  { name: "Violet", rgb: [238, 130, 238], hsv: [300, 45, 93] },
  { name: "Beige", rgb: [245, 245, 220], hsv: [60, 10, 96] },
  { name: "Mint", rgb: [189, 252, 201], hsv: [138, 25, 99] },
  { name: "Lavender", rgb: [230, 230, 250], hsv: [240, 8, 98] },
  { name: "Chocolate", rgb: [210, 105, 30], hsv: [25, 86, 82] },
  { name: "Crimson", rgb: [220, 20, 60], hsv: [348, 91, 86] },
  { name: "Indigo", rgb: [75, 0, 130], hsv: [274, 100, 51] },
  { name: "Ivory", rgb: [255, 255, 240], hsv: [60, 6, 100] },
  { name: "Khaki", rgb: [240, 230, 140], hsv: [54, 42, 94] },
  { name: "Lavender Blush", rgb: [255, 240, 245], hsv: [340, 6, 100] },
  { name: "Moccasin", rgb: [255, 228, 181], hsv: [38, 29, 100] },
  { name: "Orchid", rgb: [218, 112, 214], hsv: [288, 48, 84] },
  { name: "Plum", rgb: [221, 160, 221], hsv: [300, 28, 87] },
  { name: "Rosy Brown", rgb: [188, 143, 143], hsv: [0, 24, 74] },
  { name: "Sandy Brown", rgb: [244, 164, 96], hsv: [28, 61, 96] },
  { name: "Sea Green", rgb: [46, 139, 87], hsv: [146, 67, 55] },
  { name: "Sienna", rgb: [160, 82, 45], hsv: [19, 72, 63] },
  { name: "Snow", rgb: [255, 250, 250], hsv: [0, 2, 100] },
  { name: "Spring Green", rgb: [0, 255, 127], hsv: [150, 100, 100] },
  { name: "Steel Blue", rgb: [70, 130, 180], hsv: [207, 61, 71] },
  { name: "Tan", rgb: [210, 180, 140], hsv: [34, 33, 82] },
  { name: "Thistle", rgb: [216, 191, 216], hsv: [300, 12, 85] },
  { name: "Tomato", rgb: [255, 99, 71], hsv: [9, 72, 100] },
  { name: "Turquoise Blue", rgb: [0, 255, 239], hsv: [175, 100, 100] },
  { name: "Wheat", rgb: [245, 222, 179], hsv: [39, 27, 96] },
  { name: "Yellow Green", rgb: [154, 205, 50], hsv: [80, 76, 80] }
];



// const COLORS_DB = [
//   {
//     name: "Red",
//     rgb: [255, 0, 0],
//     hsv: [0, 100, 100],
//     cmy: [0, 255, 255]
//   },
//   {
//     name: "Green",
//     rgb: [0, 255, 0],
//     hsv: [120, 100, 100],
   
//   },
//   {
//     name: "Blue",
//     rgb: [0, 0, 255],
//     hsv: [240, 100, 100],
   
//   },
//   {
//     name: "Cyan",
//     rgb: [0, 255, 255],
//     hsv: [180, 100, 100],
//     cmy: [255, 0, 0]
//   },
//   {
//     name: "Magenta",
//     rgb: [255, 0, 255],
//     hsv: [300, 100, 100],
//     cmy: [0, 255, 0]
//   },
//   {
//     name: "Yellow",
//     rgb: [255, 255, 0],
//     hsv: [60, 100, 100],
//     cmy: [0, 0, 255]
//   },
//   {
//     name: "Orange",
//     rgb: [255, 165, 0],
//     hsv: [30, 100, 100],
    
//   },
//   {
//     name: "Purple",
//     rgb: [128, 0, 128],
//     hsv: [300, 100, 50],
   
//   },
//   {
//     name: "Lime",
//     rgb: [191, 255, 0],
   
//   },
//   {
//     name: "Teal",
//     rgb: [0, 128, 128],
   
//   },
//   {
//     name: "Pink",
//     rgb: [255, 192, 203],
  
//   },
//   {
//     name: "Brown",
//     rgb: [139, 69, 19],
   
//   },
//   {
//     name: "Olive",
//     rgb: [128, 128, 0],
  
//   },
//   {
//     name: "Maroon",
//     rgb: [128, 0, 0],

//   },
//   {
//     name: "Navy",
//     rgb: [0, 0, 128],
  
//   },
//   {
//     name: "Gray",
//     rgb: [128, 128, 128],
    
//     cmy: [127, 127, 127]
//   },
//   {
//     name: "Light Gray",
//     rgb: [211, 211, 211],
   
//     cmy: [44, 44, 44]
//   },
//   {
//     name: "Dark Gray",
//     rgb: [64, 64, 64],
   
//     cmy: [191, 191, 191]
//   },
//   {
//     name: "Sky Blue",
//     rgb: [135, 206, 235],
  
//   },
//   {
//     name: "Gold",
//     rgb: [255, 215, 0],

//   },
//   {
//     name: "Black",
//     rgb: [0, 0, 0],
//     hsv: [0, 0, 0],
//     cmy: [255, 255, 255]
//   },
//   {
//     name: "White",
//     rgb: [255, 255, 255],
//     hsv: [0, 0, 100],
//     cmy: [0, 0, 0]
//   }
// ];
