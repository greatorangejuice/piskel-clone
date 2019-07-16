/* eslint-disable no-param-reassign */
/* eslint-disable prefer-destructuring */
export default class Tools {
  constructor() {
    // const canvas = document.querySelector('.paint-field');
    // this.currentPaintFieldWidth = canvas.width;
    this.currentToolsListeners = {};
    this.canvasTools = document.querySelector('.canvas-tools');
    this.canvas = document.querySelector('.paint-field');
    this.context = this.canvas.getContext('2d');
    this.primaryColor = document.querySelector('.primary');
    this.color = this.primaryColor.value;
    this.secondColor = document.querySelector('.primary').value;

    this.frame = document.querySelector('.active-frame');
    this.frameContext = this.frame.getContext('2d');
    this.image = document.querySelector('.paint-field');
    this.imageContext = this.image.getContext('2d');

    const sizeButton = document.querySelector('.line-size-tool');
    const pixelWidthInput = document.querySelector('.pixel-size');
    this.pixelWidth = 4;
    pixelWidthInput.addEventListener('input', () => {
      this.pixelWidth = pixelWidthInput.value;
      sizeButton.innerText = `${this.pixelWidth}`;
    });

    // const inputRange = document.querySelector('.pixel-size');
    // sizeButton.addEventListener('click', () => {
    //   inputRange.classList.toggle('hide');
    //   sizeButton.innerText = 'Pen size';
    // });
  }

  setToolsbar() {
    const canvasTools = document.querySelector('.canvas-tools');
    const getActionButtons = (e) => {
      const target = e.target;
      while (target !== this) {
        if (target.tagName === 'BUTTON' || target.tagName === 'IMG') {
          const action = e.target.dataset.action;
          switch (action) {
            case 'pen-tool':
              this.clearCurrentState();
              this.pen();
              break;
            case 'eraser':
              this.clearCurrentState();
              this.pen(1);
              break;
            case 'mirror-pen-tool':
              this.clearCurrentState();
              this.mirrorPen();
              break;
            case 'circle':
              this.clearCurrentState();
              this.circle();
              break;
            case 'bucket-tool':
              this.clearCurrentState();
              this.paintBucket();
              // this.paintBucketTwo();
              break;
            case 'rectangle-tool':
              this.clearCurrentState();
              this.rectangle();
              break;
            case 'second-rectangle-tool':
              this.clearCurrentState();
              this.emptyRectangle();
              break;
            case 'trash-tool':
              this.clearCurrentState();
              this.clearField();
              break;
            case 'swap-color':
              this.swapColor();
              break;
            case 'move':
              this.clearCurrentState();
              this.move();
              break;
            case 'pipette':
              this.clearCurrentState();
              this.colorPicker();
              break;
            case 'bright':
              this.clearCurrentState();
              this.bright(1);
              break;
            case 'shape':
              this.clearCurrentState();
              this.shape();
              break;
            case 'rotate':
              this.clearCurrentState();
              this.rotateImage();
              break;
            case 'dithering':
              this.clearCurrentState();
              this.dithering();
              break;
            default:
              return;
          }
          return;
        }
        return;
      }
    };
    canvasTools.addEventListener('click', getActionButtons);
  }

  drawPixel(x, y, eraser = 0, color = 0) {
    if (color === 0) {
      const primaryColor = document.querySelector('.primary');
      this.context.fillStyle = primaryColor.value;
    } else {
      this.context.fillStyle = color;
    }
    if (eraser === 0) {
      this.context.fillRect(Math.ceil(x / this.pixelWidth) * this.pixelWidth,
        Math.ceil(y / this.pixelWidth) * this.pixelWidth, this.pixelWidth, this.pixelWidth);
    } else if (eraser === 1) {
      const activeFrame = document.querySelector('.active-frame');
      const activeFrameContext = activeFrame.getContext('2d');
      activeFrameContext.clearRect(0, 0, 128, 128);
      this.context.clearRect(Math.ceil(x / this.pixelWidth) * this.pixelWidth,
        Math.ceil(y / this.pixelWidth) * this.pixelWidth, this.pixelWidth, this.pixelWidth);
    }
  }

  pen(eraser = 0, mirror = 0) {
    let x1 = 0;
    let y1 = 0;
    let x2 = 0;
    let y2 = 0;
    let deltaX = 0;
    let deltaY = 0;
    let isMouseDown = false;

    const startDrawing = (e) => {
      isMouseDown = true;
      if (mirror) {
        [x1, y1] = [Math.abs(this.canvas.width - e.offsetX), e.offsetY];
      } else {
        [x1, y1] = [e.offsetX, e.offsetY];
      }
    };

    const stopDrawing = () => {
      isMouseDown = false;
    };

    const drawLine = (e) => {
      if (!isMouseDown) return;
      if (mirror) {
        [x2, y2] = [Math.abs(this.canvas.width - e.offsetX), e.offsetY];
      } else {
        [x2, y2] = [e.offsetX, e.offsetY];
      }
      deltaX = Math.abs(x2 - x1);
      deltaY = Math.abs(y2 - y1);
      const signX = x1 < x2 ? 1 : -1;
      const signY = y1 < y2 ? 1 : -1;
      let error = deltaX - deltaY;
      this.drawPixel(x2, y2, eraser);

      while (x1 !== x2 || y1 !== y2) {
        this.drawPixel(x1, y1, eraser);
        const error2 = error * 2;

        if (error2 > -deltaY) {
          error -= deltaY;
          x1 += signX;
        }

        if (error2 < deltaX) {
          error += deltaX;
          y1 += signY;
        }
      }
    };
    this.canvas.addEventListener('mousedown', startDrawing);
    this.canvas.addEventListener('mousemove', drawLine);
    this.canvas.addEventListener('mouseup', stopDrawing);
    this.canvas.addEventListener('mouseout', stopDrawing);

    this.addFunctionsInState('mousedown', startDrawing);
    this.addFunctionsInState('mousemove', drawLine);
    this.addFunctionsInState('mouseup', stopDrawing);
    this.addFunctionsInState('mouseout', stopDrawing);
  }

  mirrorPen() {
    this.clearCurrentState();
    this.pen();
    this.pen(0, 1);
  }

  swapColor() {
    this.clearCurrentState();
    const primaryColor = document.querySelector('.primary');
    const secondaryColor = document.querySelector('.secondary');
    const temp = primaryColor.value;
    primaryColor.value = secondaryColor.value;
    secondaryColor.value = temp;
  }

  clearField() {
    this.clearCurrentState();
    const activeFrame = document.querySelector('.active-frame');
    const frameContext = activeFrame.getContext('2d');
    this.context.clearRect(0, 0, this.canvas.width, this.canvas.height);
    frameContext.clearRect(0, 0, activeFrame.width, activeFrame.height);
  }

  addFunctionsInState(event, func) {
    Tools.currentToolsListeners[event] = func;
  }

  clearCurrentState() {
    Object.keys(Tools.currentToolsListeners).forEach((key) => {
      this.canvas.removeEventListener(key, Tools.currentToolsListeners[key]);
      Object.keys(Tools.currentToolsListeners).forEach((value) => {
        delete Tools.currentToolsListeners[value];
      });
    });
    // Добавить удаление класса active или что-нибудь подобного.
  }

  circle() {
    this.clearCurrentState();
    let isMouseDown = false;
    let x;
    let y;
    const startDrawing = (e) => {
      isMouseDown = true;
      [x, y] = [e.offsetX, e.offsetY];
    };

    const stopDrawing = () => {
      isMouseDown = false;
    };

    const drawCircle = (e) => {
      if (!isMouseDown) return;
      const [x0, y0] = [e.offsetX, e.offsetY];
      const radius = Math.sqrt(((x0 - x) ** 2) + ((y0 - y) ** 2));
      let x1 = 0;
      let y1 = radius;
      let gap = 0;
      let delta = (1 - 2 * radius);
      this.context.clearRect(0, 0, 128, 128);
      const frame = document.querySelector('.active-frame');
      this.context.drawImage(frame, 0, 0, this.canvas.width, this.canvas.width, 0, 0, frame.width, frame.height);

      while (y1 >= 0) {
        this.drawPixel(x + x1, y - y1);
        this.drawPixel(x - x1, y - y1);
        this.drawPixel(x - x1, y + y1);
        this.drawPixel(x + x1, y + y1);
        gap = 2 * (delta + y1) - 1;
        if (delta < 0 && gap <= 0) {
          x1 += 1;
          delta += 2 * x1 + 1;
        } else if (delta > 0 && gap > 0) {
          y1 -= 1;
          delta -= 2 * y1 + 1;
        } else {
          x1 += 1;
          delta += 2 * (x1 - y1);
          y1 -= 1;
        }
      }
    };
    this.canvas.addEventListener('mousedown', startDrawing);
    this.canvas.addEventListener('mousemove', drawCircle);
    this.canvas.addEventListener('mouseup', stopDrawing);
    this.canvas.addEventListener('mouseout', stopDrawing);

    this.addFunctionsInState('mousedown', startDrawing);
    this.addFunctionsInState('mousemove', drawCircle);
    this.addFunctionsInState('mouseup', stopDrawing);
    this.addFunctionsInState('mouseout', stopDrawing);
  }

  rectangle() {
    this.clearCurrentState();
    let x = 0;
    let y = 0;
    let width = 0;
    let height = 0;
    let isMouseDown = false;
    const primaryColor = document.querySelector('.primary');
    this.context.fillStyle = primaryColor;

    const startDrawing = (e) => {
      isMouseDown = true;
      [x, y] = [e.offsetX, e.offsetY];
    };

    const stopDrawing = () => {
      isMouseDown = false;
    };

    const drawLine = (e) => {
      if (isMouseDown) {
        const frame = document.querySelector('.active-frame');
        this.context.drawImage(frame, 0, 0, this.canvas.width, this.canvas.width, 0, 0, frame.width, frame.height);
        this.context.clearRect(x, y, width, height);
        this.context.beginPath();
        width = e.offsetX - x;
        height = e.offsetY - y;
        this.context.fillStyle = this.primaryColor.value;
        this.context.fillRect(x, y, width, height);
      }
    };

    this.canvas.addEventListener('mousedown', startDrawing);
    this.canvas.addEventListener('mousemove', drawLine);
    this.canvas.addEventListener('mouseup', stopDrawing);
    this.canvas.addEventListener('mouseout', stopDrawing);

    this.addFunctionsInState('mousedown', startDrawing);
    this.addFunctionsInState('mousemove', drawLine);
    this.addFunctionsInState('mouseup', stopDrawing);
    this.addFunctionsInState('mouseout', stopDrawing);
  }

  emptyRectangle() {
    this.clearCurrentState();
    let x = 0;
    let y = 0;
    let lastX = 0;
    let lastY = 0;
    let width = 0;
    let height = 0;
    let isMouseDown = false;


    const startDrawing = (e) => {
      isMouseDown = true;
      [lastX, lastY] = [e.offsetX, e.offsetY];
    };

    const stopDrawing = () => {
      isMouseDown = false;
    };

    const drawLine = (e) => {
      [x, y] = [e.offsetX, e.offsetY];
      if (isMouseDown) {
        const frame = document.querySelector('.active-frame');
        this.context.drawImage(frame, 0, 0, this.canvas.width, this.canvas.width, 0, 0, frame.width, frame.height);
        this.context.clearRect(0, 0, this.canvas.width, this.canvas.height);
        this.context.drawImage(frame, 0, 0, this.canvas.width, this.canvas.width, 0, 0, frame.width, frame.height);
        this.context.beginPath();
        width = x - lastX;
        height = y - lastY;
        this.context.rect(lastX, lastY, width, height);
        this.context.strokeStyle = this.primaryColor.value;
        this.context.lineWidth = this.pixelWidth;
        this.context.stroke();
      }
    };

    this.canvas.addEventListener('mousedown', startDrawing);
    this.canvas.addEventListener('mousemove', drawLine);
    this.canvas.addEventListener('mouseup', stopDrawing);
    this.canvas.addEventListener('mouseout', stopDrawing);

    this.addFunctionsInState('mousedown', startDrawing);
    this.addFunctionsInState('mousemove', drawLine);
    this.addFunctionsInState('mouseup', stopDrawing);
    this.addFunctionsInState('mouseout', stopDrawing);
  }

  move() {
    this.clearCurrentState();
    let isMouseDown = false;
    let x = 0;
    let y = 0;
    let deltaX = 0;
    let deltaY = 0;
    let imageData = null;

    const startDrawing = (e) => {
      isMouseDown = true;
      [x, y] = [e.offsetX, e.offsetY];
      imageData = this.context.getImageData(0, 0, this.canvas.width, this.canvas.height);
    };

    const stopDrawing = () => {
      isMouseDown = false;
    };

    const drawLine = (e) => {
      if (isMouseDown) {
        this.clearField();
        [deltaX, deltaY] = [e.offsetX - x, e.offsetY - y];
        this.context.putImageData(imageData, deltaX, deltaY);
      }
    };

    this.canvas.addEventListener('mousedown', startDrawing);
    this.canvas.addEventListener('mousemove', drawLine);
    this.canvas.addEventListener('mouseup', stopDrawing);
    this.canvas.addEventListener('mouseout', stopDrawing);

    this.addFunctionsInState('mousedown', startDrawing);
    this.addFunctionsInState('mousemove', drawLine);
    this.addFunctionsInState('mouseup', stopDrawing);
    this.addFunctionsInState('mouseout', stopDrawing);
  }

  bright(light = 1) {
    this.clearCurrentState();
    let x1;
    let y1;
    let startX;
    let startY;
    let coordX1;
    let coordY1;

    const changeBright = (e) => {
      let color = null;
      const widthPixel = this.canvas.width / 16;
      x1 = e.offsetX;
      y1 = e.offsetY;
      coordX1 = Math.floor(x1 / widthPixel);
      coordY1 = Math.floor(y1 / widthPixel);
      startX = coordX1 * widthPixel;
      startY = coordY1 * widthPixel;
      const imgData = this.context.getImageData(startX, startY, 1, 1);
      const arrColor = [];
      if ((imgData.data[0] !== 0 && imgData.data[1] !== 0
          && imgData.data[2] !== 0 && imgData.data[3] !== 0)
        || (imgData.data[0] === 0 && imgData.data[1] === 0
          && imgData.data[2] === 0 && imgData.data[3] !== 0)) {
        for (let i = 0; i < 4; i += 1) {
          if (imgData.data[i] === 0) imgData.data[i] = 10;
          arrColor.push(imgData.data[i]);
          if (light) {
            color = `rgb(${imgData.data[0] * 2}, ${imgData.data[1] * 2}, ${imgData.data[2] * 2})`;
          } else if (light === 0) {
            color = `rgb(${imgData.data[0] * 0.8}, ${imgData.data[1] * 0.8}, ${imgData.data[2] * 0.8})`;
          }
          this.context.fillStyle = color;
          this.context.fillRect(startX, startY, widthPixel, widthPixel);
        }
      }
    };
    this.canvas.addEventListener('click', changeBright);
    this.addFunctionsInState('click', changeBright);
  }

  shape() {
    this.clearCurrentState();
    const paintAll = (e) => {
      let color;
      const widthPixel = this.canvas.width / this.canvas.width;
      const [x0, y0] = [e.offsetX, e.offsetY];
      const startX = Math.floor(x0 / widthPixel) * widthPixel;
      const startY = Math.floor(y0 / widthPixel) * widthPixel;
      if (e.which === 1) {
        color = document.querySelector('.primary').value;
      }
      if (e.which === 3) {
        color = document.querySelector('.secondary').value;
      }
      const imgData = this.context.getImageData(startX, startY, 1, 1);
      const red = imgData.data[0];
      const green = imgData.data[1];
      const blue = imgData.data[2];
      for (let x = 0; x < this.canvas.width; x += widthPixel) {
        for (let y = 0; y < this.canvas.height; y += widthPixel) {
          const imgDataPx = this.context.getImageData(x, y, 1, 1);
          if (imgDataPx.data[0] === red && imgDataPx.data[1] === green
            && imgDataPx.data[2] === blue) {
            this.frameContext.fillStyle = color;
            this.context.fillStyle = color;
            this.context.fillRect(x, y, widthPixel, widthPixel);
            this.frameContext.fillRect(x, y, widthPixel, widthPixel);
          }
        }
      }
    };
    this.canvas.addEventListener('click', paintAll);
    this.addFunctionsInState('click', paintAll);
  }

  dithering() {
    this.clearCurrentState();
    let isMouseDown = false;
    const colorPrimary = document.querySelector('.primary');
    const colorSecondary = document.querySelector('.secondary');
    let colorFirst = colorPrimary.value;
    let colorSecond = colorSecondary.value;

    const startDrawing = (event) => {
      isMouseDown = true;
      colorFirst = event.which === 1 ? colorPrimary.value : colorSecondary.value;
      colorSecond = event.which === 1 ? colorSecondary.value : colorPrimary.value;
    };

    const drawLine = (event) => {
      if (!isMouseDown) return;
      const [x, y] = [event.offsetX, event.offsetY];
      if ((x + y) % 2 === 0) {
        this.drawPixel(x, y, 0, colorFirst);
      } else {
        this.drawPixel(x, y, 0, colorSecond);
      }
    };

    const stopDrawing = () => {
      isMouseDown = false;
    };

    const contextMenuHandler = (event) => {
      event.preventDefault();
    };

    this.canvas.addEventListener('mousedown', startDrawing);
    this.canvas.addEventListener('mousemove', drawLine);
    this.canvas.addEventListener('mouseup', stopDrawing);
    this.canvas.addEventListener('mousedown', contextMenuHandler);

    this.addFunctionsInState('mousedown', startDrawing);
    this.addFunctionsInState('mousemove', drawLine);
    this.addFunctionsInState('mouseup', stopDrawing);
    this.addFunctionsInState('mousedown', contextMenuHandler);
  }

  rgbToHex(arr) {
    const arrHex = arr.map((x) => {
      const num = parseInt(x, 10).toString(16);
      return (num.length === 1) ? `0${num}` : num;
    });
    return `#${arrHex.join('')}`;
  }

  colorPicker() {
    const componentToHex = (c) => {
      const hex = c.toString(16);
      return hex.length === 1 ? `0${hex}` : hex;
    };

    const work = (r, g, b) => `#${componentToHex(r)}${componentToHex(g)}${componentToHex(b)}`;

    const picker = (e) => {
      let color;
      if (e.which === 1) {
        color = document.querySelector('.primary');
      }
      if (e.which === 3) {
        color = document.querySelector('.secondary');
      }
      const imgData = this.context.getImageData(e.offsetX, e.offsetY, 1, 1);
      const red = imgData.data[0];
      const green = imgData.data[1];
      const blue = imgData.data[2];
      const newColor = work(red, green, blue);
      if (newColor !== '#000000') color.value = newColor;
    };

    this.canvas.addEventListener('click', picker);
    this.addFunctionsInState('click', picker);
  }

  paintBucket() {
    const isMatchStartColor = (x, y, color) => {
      const {
        data,
      } = this.context.getImageData(x, y, 1, 1);
      return data[0] === color[0] && data[1] === color[1] && data[2] === color[2]
        && data[3] === color[3];
    };

    const fill = (startX, startY, startColor, fillColor) => {
      const color = this.rgbToHex([...startColor].slice(0, -1));
      if (color === fillColor && startColor[3] === 255) return;
      let reachLeft;
      let reachRight;

      const pixelStack = [
        [startX, startY],
      ];
      const canvasWidth = this.canvas.width;
      const canvasHeight = this.canvas.height;
      while (pixelStack.length) {
        const newPos = pixelStack.pop();
        const [x] = newPos;
        let [, y] = newPos;

        while (y >= 0 && isMatchStartColor(x, y, startColor)) {
          y -= this.pixelWidth;
        }
        y += this.pixelWidth;
        while (y < canvasHeight && isMatchStartColor(x, y, startColor)) {
          this.drawPixel(x, y);

          if (x > 0) {
            if (isMatchStartColor(x - this.pixelWidth, y, startColor)) {
              if (!reachLeft) {
                pixelStack.push([x - this.pixelWidth, y]);
                reachLeft = true;
              }
            }
            reachLeft = false;
          }

          if (x < canvasWidth) {
            if (isMatchStartColor(x + this.pixelWidth, y, startColor)) {
              if (!reachRight) {
                pixelStack.push([x + this.pixelWidth, y]);
                reachRight = true;
              }
            }
            reachRight = false;
          }

          y += this.pixelWidth;
        }
      }
    };

    const mouseDownHandler = (event) => {
      const [x1, y1] = [event.offsetX, event.offsetY];
      const {
        data,
      } = this.context.getImageData(x1, y1, 1, 1);
      const primColor = document.querySelector('.primary');
      fill(x1, y1, data, primColor.value);
    };

    this.canvas.addEventListener('click', mouseDownHandler);
    this.addFunctionsInState('click', mouseDownHandler);
  }

  rotateImage() {
    const image = document.querySelector('.paint-field');
    const context = image.getContext('2d');
    const frame = document.querySelector('.active-frame');
    const frameContext = frame.getContext('2d');

    context.save();
    context.clearRect(0, 0, image.width, image.height);
    context.translate(image.width / 2, image.height / 2);
    context.rotate(90 * Math.PI / 180);
    frameContext.drawImage(image, 0, 0);
    context.clearRect(0, 0, image.width, image.height);
    context.drawImage(frame, image.width, image.height);
    context.restore();

    context.save();
    context.clearRect(0, 0, image.width, image.width);
    context.translate(image.width / 2, image.width / 2);
    context.rotate((Math.PI / 180) * 90);
    context.drawImage(frame, -image.width / 2, -image.width / 2);
    frameContext.clearRect(0, 0, frame.width, frame.width);
    frameContext.drawImage(image, 0, 0);
    context.restore();
  }
}
Tools.currentToolsListeners = {};
