//Define the global Chart Variable as a class.
var Chart = function (context) {
  var chart = this;

  //Easing functions adapted from Robert Penner's easing equations
  //http://www.robertpenner.com/easing/

  var animationOptions = {
    easeOutQuart: function (t) {
      return -1 * ((t = t / 1 - 1) * t * t * t - 1);
    },
  };

  //Variables global to the chart
  var width = context.canvas.width;
  var height = context.canvas.height;

  this.Bar = function (data, options) {
    console.log('========bar==1==========');
    console.log('data', data);
    console.log('options', options);
    chart.Bar.defaults = {
      scaleOverlay: false,
      scaleOverride: false,
      scaleSteps: null,
      scaleStepWidth: null,
      scaleStartValue: null,
      scaleLineColor: 'rgba(0,0,0,.1)',
      scaleLineWidth: 1,
      scaleShowLabels: true,
      scaleLabel: '<%=value%>',
      scaleFontFamily: "'Arial'",
      scaleFontSize: 12,
      scaleFontStyle: 'normal',
      scaleFontColor: '#666',
      scaleShowGridLines: true,
      scaleGridLineColor: 'rgba(0,0,0,.05)',
      scaleGridLineWidth: 1,
      barShowStroke: true,
      barStrokeWidth: 2,
      barValueSpacing: 5,
      barDatasetSpacing: 1,
      animation: true,
      animationSteps: 60,
      animationEasing: 'easeOutQuart',
      onAnimationComplete: null,
    };
    var config = options
      ? mergeChartConfig(chart.Bar.defaults, options)
      : chart.Bar.defaults;
    console.log('config', config);
    console.log('context', context);
    console.log('========bar==1==========');
    return new Bar(data, config, context);
  };

  var clear = function (c) {
    c.clearRect(0, 0, width, height);
  };

  var Bar = function (data, config, ctx) {
    var maxSize,
      scaleHop,
      calculatedScale,
      labelHeight,
      scaleHeight,
      valueBounds,
      labelTemplateString,
      valueHop,
      widestXLabel,
      xAxisLength,
      yAxisPosX,
      xAxisPosY,
      barWidth,
      rotateLabels = 0;

    calculateDrawingSizes();

    valueBounds = getValueBounds();
    //Check and set the scale
    labelTemplateString = config.scaleShowLabels ? config.scaleLabel : '';
    if (!config.scaleOverride) {
      calculatedScale = calculateScale(
        scaleHeight,
        valueBounds.maxSteps,
        valueBounds.minSteps,
        valueBounds.maxValue,
        valueBounds.minValue,
        labelTemplateString
      );
    } else {
      calculatedScale = {
        steps: config.scaleSteps,
        stepValue: config.scaleStepWidth,
        graphMin: config.scaleStartValue,
        labels: [],
      };
      for (var i = 0; i < calculatedScale.steps; i++) {
        if (labelTemplateString) {
          calculatedScale.labels.push(
            tmpl(labelTemplateString, {
              value: (
                config.scaleStartValue +
                config.scaleStepWidth * i
              ).toFixed(getDecimalPlaces(config.scaleStepWidth)),
            })
          );
        }
      }
    }

    scaleHop = Math.floor(scaleHeight / calculatedScale.steps);
    calculateXAxisSize();
    // drawScale();
    animationLoop(config, drawScale, drawBars, ctx);
    // drawBars(1);
    function drawBars(animPc) {
      console.log('animPc', animPc);
      ctx.lineWidth = config.barStrokeWidth;
      for (var i = 0; i < data.datasets.length; i++) {
        ctx.fillStyle = data.datasets[i].fillColor;
        ctx.strokeStyle = data.datasets[i].strokeColor;
        for (var j = 0; j < data.datasets[i].data.length; j++) {
          var barOffset =
            yAxisPosX +
            config.barValueSpacing +
            valueHop * j +
            barWidth * i +
            config.barDatasetSpacing * i +
            config.barStrokeWidth * i;

          ctx.beginPath();
          ctx.moveTo(barOffset, xAxisPosY);
          ctx.lineTo(
            barOffset,
            xAxisPosY -
              animPc *
                calculateOffset(
                  data.datasets[i].data[j],
                  calculatedScale,
                  scaleHop
                ) +
              config.barStrokeWidth / 2
          );
          ctx.lineTo(
            barOffset + barWidth,
            xAxisPosY -
              animPc *
                calculateOffset(
                  data.datasets[i].data[j],
                  calculatedScale,
                  scaleHop
                ) +
              config.barStrokeWidth / 2
          );
          ctx.lineTo(barOffset + barWidth, xAxisPosY);
          if (config.barShowStroke) {
            ctx.stroke();
          }
          ctx.closePath();
          ctx.fill();
        }
      }
    }
    function drawScale() {
      //X axis line
      ctx.lineWidth = config.scaleLineWidth;
      ctx.strokeStyle = config.scaleLineColor;
      ctx.beginPath();
      ctx.moveTo(width - widestXLabel / 2 + 5, xAxisPosY);
      ctx.lineTo(width - widestXLabel / 2 - xAxisLength - 5, xAxisPosY);
      ctx.stroke();

      if (rotateLabels > 0) {
        ctx.save();
        ctx.textAlign = 'right';
      } else {
        ctx.textAlign = 'center';
      }
      ctx.fillStyle = config.scaleFontColor;
      for (var i = 0; i < data.labels.length; i++) {
        ctx.save();
        if (rotateLabels > 0) {
          ctx.translate(
            yAxisPosX + i * valueHop,
            xAxisPosY + config.scaleFontSize
          );
          ctx.rotate(-(rotateLabels * (Math.PI / 180)));
          ctx.fillText(data.labels[i], 0, 0);
          ctx.restore();
        } else {
          ctx.fillText(
            data.labels[i],
            yAxisPosX + i * valueHop + valueHop / 2,
            xAxisPosY + config.scaleFontSize + 3
          );
        }

        ctx.beginPath();
        ctx.moveTo(yAxisPosX + (i + 1) * valueHop, xAxisPosY + 3);

        //Check i isnt 0, so we dont go over the Y axis twice.
        ctx.lineWidth = config.scaleGridLineWidth;
        ctx.strokeStyle = config.scaleGridLineColor;
        ctx.lineTo(yAxisPosX + (i + 1) * valueHop, 5);
        ctx.stroke();
      }

      //Y axis
      ctx.lineWidth = config.scaleLineWidth;
      ctx.strokeStyle = config.scaleLineColor;
      ctx.beginPath();
      ctx.moveTo(yAxisPosX, xAxisPosY + 5);
      ctx.lineTo(yAxisPosX, 5);
      ctx.stroke();

      ctx.textAlign = 'right';
      ctx.textBaseline = 'middle';
      for (var j = 0; j < calculatedScale.steps; j++) {
        ctx.beginPath();
        ctx.moveTo(yAxisPosX - 3, xAxisPosY - (j + 1) * scaleHop);
        if (config.scaleShowGridLines) {
          ctx.lineWidth = config.scaleGridLineWidth;
          ctx.strokeStyle = config.scaleGridLineColor;
          ctx.lineTo(
            yAxisPosX + xAxisLength + 5,
            xAxisPosY - (j + 1) * scaleHop
          );
        } else {
          ctx.lineTo(yAxisPosX - 0.5, xAxisPosY - (j + 1) * scaleHop);
        }

        ctx.stroke();
        if (config.scaleShowLabels) {
          ctx.fillText(
            calculatedScale.labels[j],
            yAxisPosX - 8,
            xAxisPosY - (j + 1) * scaleHop
          );
        }
      }
    }
    function calculateXAxisSize() {
      var longestText = 1;
      //if we are showing the labels
      if (config.scaleShowLabels) {
        ctx.font =
          config.scaleFontStyle +
          ' ' +
          config.scaleFontSize +
          'px ' +
          config.scaleFontFamily;
        for (var i = 0; i < calculatedScale.labels.length; i++) {
          var measuredText = ctx.measureText(calculatedScale.labels[i]).width;
          longestText = measuredText > longestText ? measuredText : longestText;
        }
        //Add a little extra padding from the y axis
        longestText += 10;
      }
      xAxisLength = width - longestText - widestXLabel;
      valueHop = Math.floor(xAxisLength / data.labels.length);

      barWidth =
        (valueHop -
          config.scaleGridLineWidth * 2 -
          config.barValueSpacing * 2 -
          (config.barDatasetSpacing * data.datasets.length - 1) -
          ((config.barStrokeWidth / 2) * data.datasets.length - 1)) /
        data.datasets.length;

      yAxisPosX = width - widestXLabel / 2 - xAxisLength;
      xAxisPosY = scaleHeight + config.scaleFontSize / 2;
    }
    function calculateDrawingSizes() {
      maxSize = height;

      //Need to check the X axis first - measure the length of each text metric, and figure out if we need to rotate by 45 degrees.
      ctx.font =
        config.scaleFontStyle +
        ' ' +
        config.scaleFontSize +
        'px ' +
        config.scaleFontFamily;
      widestXLabel = 1;
      for (var i = 0; i < data.labels.length; i++) {
        var textLength = ctx.measureText(data.labels[i]).width;
        //If the text length is longer - make that equal to longest text!
        widestXLabel = textLength > widestXLabel ? textLength : widestXLabel;
      }
      if (width / data.labels.length < widestXLabel) {
        rotateLabels = 45;
        if (
          width / data.labels.length <
          Math.cos(rotateLabels) * widestXLabel
        ) {
          rotateLabels = 90;
          maxSize -= widestXLabel;
        } else {
          maxSize -= Math.sin(rotateLabels) * widestXLabel;
        }
      } else {
        maxSize -= config.scaleFontSize;
      }

      //Add a little padding between the x line and the text
      maxSize -= 5;

      labelHeight = config.scaleFontSize;

      maxSize -= labelHeight;
      //Set 5 pixels greater than the font size to allow for a little padding from the X axis.

      scaleHeight = maxSize;

      //Then get the area above we can safely draw on.
    }
    function getValueBounds() {
      var upperValue = Number.MIN_VALUE;
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

      var maxSteps = Math.floor(scaleHeight / (labelHeight * 0.66));
      var minSteps = Math.floor((scaleHeight / labelHeight) * 0.5);

      return {
        maxValue: upperValue,
        minValue: lowerValue,
        maxSteps: maxSteps,
        minSteps: minSteps,
      };
    }
  };

  function calculateOffset(val, calculatedScale, scaleHop) {
    var outerValue = calculatedScale.steps * calculatedScale.stepValue;
    var adjustedValue = val - calculatedScale.graphMin;
    var scalingFactor = CapValue(adjustedValue / outerValue, 1, 0);
    return scaleHop * calculatedScale.steps * scalingFactor;
  }

  function animationLoop(config, drawScale, drawData, ctx) {
    // config.animation true时，有动画，false时无动画
    // animationSteps 步骤，多少步达到1
    // animationEasing 动画名称
    // percentAnimComplete 0
    // 假定config.animationSteps 60,animFrameAmount = 1/60
    var animFrameAmount = config.animation
      ? 1 / CapValue(config.animationSteps, Number.MAX_VALUE, 1)
      : 1;
    // 动画函数
    var easingFunction = animationOptions[config.animationEasing];
    // 动画完成百分比
    var percentAnimComplete = config.animation ? 0 : 1;

    if (typeof drawScale !== 'function') drawScale = function () {};

    window.requestAnimationFrame(animLoop);

    function animateFrame() {
      var easeAdjustedAnimationPercent = config.animation
        ? CapValue(easingFunction(percentAnimComplete), null, 0)
        : 1;
      clear(ctx);
      if (config.scaleOverlay) {
        drawData(easeAdjustedAnimationPercent);
        // 绘制刻度条
        drawScale();
      } else {
        // 绘制刻度条
        drawScale();
        // 绘制图像传入小数值
        drawData(easeAdjustedAnimationPercent);
      }
    }
    function animLoop() {
      // 加1/60
      percentAnimComplete += animFrameAmount;
      animateFrame();
      //循环调用
      if (percentAnimComplete <= 1) {
        window.requestAnimationFrame(animLoop);
      } else {
        if (typeof config.onAnimationComplete == 'function')
          config.onAnimationComplete();
      }
    }
  }

  //Declare global functions to be called within this namespace here.

  // shim layer with setTimeout fallback
  var requestAnimFrame = (function () {
    return (
      window.requestAnimationFrame ||
      window.webkitRequestAnimationFrame ||
      window.mozRequestAnimationFrame ||
      window.oRequestAnimationFrame ||
      window.msRequestAnimationFrame ||
      function (callback) {
        window.setTimeout(callback, 1000 / 60);
      }
    );
  })();

  function calculateScale(
    drawingHeight,
    maxSteps,
    minSteps,
    maxValue,
    minValue,
    labelTemplateString
  ) {
    var graphMin,
      graphMax,
      graphRange,
      stepValue,
      numberOfSteps,
      valueRange,
      rangeOrderOfMagnitude,
      decimalNum;

    valueRange = maxValue - minValue;

    rangeOrderOfMagnitude = calculateOrderOfMagnitude(valueRange);

    graphMin =
      Math.floor(minValue / (1 * Math.pow(10, rangeOrderOfMagnitude))) *
      Math.pow(10, rangeOrderOfMagnitude);

    graphMax =
      Math.ceil(maxValue / (1 * Math.pow(10, rangeOrderOfMagnitude))) *
      Math.pow(10, rangeOrderOfMagnitude);

    graphRange = graphMax - graphMin;

    stepValue = Math.pow(10, rangeOrderOfMagnitude);

    numberOfSteps = Math.round(graphRange / stepValue);

    //Compare number of steps to the max and min for that size graph, and add in half steps if need be.
    while (numberOfSteps < minSteps || numberOfSteps > maxSteps) {
      if (numberOfSteps < minSteps) {
        stepValue /= 2;
        numberOfSteps = Math.round(graphRange / stepValue);
      } else {
        stepValue *= 2;
        numberOfSteps = Math.round(graphRange / stepValue);
      }
    }

    //Create an array of all the labels by interpolating the string.

    var labels = [];

    if (labelTemplateString) {
      //Fix floating point errors by setting to fixed the on the same decimal as the stepValue.
      for (var i = 1; i < numberOfSteps + 1; i++) {
        labels.push(
          tmpl(labelTemplateString, {
            value: (graphMin + stepValue * i).toFixed(
              getDecimalPlaces(stepValue)
            ),
          })
        );
      }
    }

    return {
      steps: numberOfSteps,
      stepValue: stepValue,
      graphMin: graphMin,
      labels: labels,
    };

    function calculateOrderOfMagnitude(val) {
      return Math.floor(Math.log(val) / Math.LN10);
    }
  }

  //Is a number function
  function isNumber(n) {
    return !isNaN(parseFloat(n)) && isFinite(n);
  }
  //Apply cap a value at a high or low number
  function CapValue(valueToCap, maxValue, minValue) {
    if (isNumber(maxValue)) {
      if (valueToCap > maxValue) {
        return maxValue;
      }
    }
    if (isNumber(minValue)) {
      if (valueToCap < minValue) {
        return minValue;
      }
    }
    return valueToCap;
  }
  function getDecimalPlaces(num) {
    var numberOfDecimalPlaces;
    if (num % 1 != 0) {
      return num.toString().split('.')[1].length;
    } else {
      return 0;
    }
  }

  function mergeChartConfig(defaults, userDefined) {
    var returnObj = {};
    for (var attrname in defaults) {
      returnObj[attrname] = defaults[attrname];
    }
    for (var attrname in userDefined) {
      returnObj[attrname] = userDefined[attrname];
    }
    return returnObj;
  }

  //Javascript micro templating by John Resig - source at http://ejohn.org/blog/javascript-micro-templating/
  var cache = {};

  function tmpl(str, data) {
    // Figure out if we're getting a template, or if we need to
    // load the template - and be sure to cache the result.
    var fn = !/\W/.test(str)
      ? (cache[str] =
          cache[str] || tmpl(document.getElementById(str).innerHTML))
      : // Generate a reusable function that will serve as a template
        // generator (and which will be cached).
        new Function(
          'obj',
          'var p=[],print=function(){p.push.apply(p,arguments);};' +
            // Introduce the data as local variables using with(){}
            "with(obj){p.push('" +
            // Convert the template into pure JavaScript
            str
              .replace(/[\r\t\n]/g, ' ')
              .split('<%')
              .join('\t')
              .replace(/((^|%>)[^\t]*)'/g, '$1\r')
              .replace(/\t=(.*?)%>/g, "',$1,'")
              .split('\t')
              .join("');")
              .split('%>')
              .join("p.push('")
              .split('\r')
              .join("\\'") +
            "');}return p.join('');"
        );

    // Provide some basic currying to the user
    return data ? fn(data) : fn;
  }
};
