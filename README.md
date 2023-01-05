# Chart 学习

## 计算 label 的最大宽度

[MND](https://developer.mozilla.org/zh-CN/docs/Web/API/CanvasRenderingContext2D/measureText)

测量文本 TextMetrics 对象包含的信息,宽度信息

```js
const canvas = document.getElementById('canvas');
const ctx = canvas.getContext('2d');
const text = ctx.measureText('foo'); // TextMetrics object
text.width; // 16;
```

![image-20230105154614264](./assets/image-20230105154614264.png)

获取 label 最大宽度

```js
var barChartData = {
  labels: ['January', 'February', 'March', 'April', 'May', 'June', 'July'],
  datasets: [
    {
      fillColor: 'rgba(220,220,220,0.5)',
      strokeColor: 'rgba(220,220,220,1)',
      data: [65, 59, 90, 81, 56, 55, 40],
    },
    {
      fillColor: 'rgba(151,187,205,0.5)',
      strokeColor: 'rgba(151,187,205,1)',
      data: [28, 48, 40, 19, 96, 27, 100],
    },
  ],
};
```

计算最大宽度

```js
// 最大宽度
widestXLabel = 1;

/**
 * 获取文本最大宽度
 * 依次遍历labels所有文本，计算最大的宽度
 */
for (var i = 0; i < data.labels.length; i++) {
  var textLength = ctx.measureText(data.labels[i]).width;
  widestXLabel = textLength > widestXLabel ? textLength : widestXLabel;
}
```

## 计算画布最大高度

当一行不足以放下 label 时需要将 label 倾斜，倾斜后图标高度要重新计算

![image-20230105163708925](./assets/image-20230105163708925.png)

数据集

```js
var barChartData = {
  labels: [
    'January========',
    'February',
    'March',
    'April',
    'May',
    'June',
    'July',
  ],
  datasets: [
    {
      fillColor: 'rgba(220,220,220,0.5)',
      strokeColor: 'rgba(220,220,220,1)',
      data: [65, 59, 90, 81, 56, 55, 40],
    },
    {
      fillColor: 'rgba(151,187,205,0.5)',
      strokeColor: 'rgba(151,187,205,1)',
      data: [28, 48, 40, 19, 96, 27, 100],
    },
  ],
};
```

实现代码

```js
/**
 * rotateLabels 旋转角度
 */

// 如果所有文字总宽度大于最大宽度就倾斜 45度
if (width / data.labels.length < widestXLabel) {
  // 倾斜45度
  rotateLabels = 45;
  // 如果所有文字倾斜后的总宽度大于最大宽度就倾斜 90度
  if (width / data.labels.length < Math.cos(rotateLabels) * widestXLabel) {
    rotateLabels = 90;
    // 图表高度 = 等于总画布高度 - 文字高度
    maxSize -= widestXLabel;
  } else {
    // 图表高度 = 等于总画布高度 - 文字高度
    maxSize -= Math.sin(rotateLabels) * widestXLabel;
  }
} else {
  // 图表高度 = 等于总画布高度 - 文字高度
  maxSize -= config.scaleFontSize;
}
// 文字和图标之间添加一些边距
maxSize -= 5;
// label高度
labelHeight = config.scaleFontSize;
// 减去label高度
maxSize -= labelHeight;
// 高度
scaleHeight = maxSize;
```

## 最大最小值计算

数据集

```js
var barChartData = {
  labels: ['January', 'February', 'March', 'April', 'May', 'June', 'July'],
  datasets: [
    {
      fillColor: 'rgba(220,220,220,0.5)',
      strokeColor: 'rgba(220,220,220,1)',
      data: [65, 59, 90, 81, 56, 55, 40],
    },
    {
      fillColor: 'rgba(151,187,205,0.5)',
      strokeColor: 'rgba(151,187,205,1)',
      data: [28, 48, 40, 19, 96, 27, 100],
    },
  ],
};
```

实现

```js
// 最大值
var upperValue = Number.MIN_VALUE;
// 最小值
var lowerValue = Number.MAX_VALUE;
for (var i = 0; i < data.datasets.length; i++) {
  for (var j = 0; j < data.datasets[i].data.length; j++) {
    if (data.datasets[i].data[j] > upperValue) {
      upperValue = data.datasets[i].data[j];
    }
    if (data.datasets[i].data[j] < lowerValue) {
      lowerValue = data.datasets[i].data[j];
    }
  }
}

console.log('upperValue', upperValue); // 100
console.log('lowerValue', lowerValue); // 19
```
