function attachTouchListeners() {
  canvas.addEventListener('touchstart', handleTouchStart);
  canvas.addEventListener('touchend', handleTouchEnd);
  canvas.addEventListener('touchcancel', handleTouchCancel);
}

let touchId;
let touchStartX;
let touchStartY;

function handleTouchStart({ touches }) {
  const touch = touches[0];
  if (touchId == null) {
    touchId = touch.identifier;
    touchStartX = touch.pageX;
    touchStartY = touch.pageY;
  }
}

function handleTouchEnd({ changedTouches }) {
  if (touchId != null) {
    let touch;
    for (let i = 0; i < changedTouches.length; changedTouches++) {
      if (changedTouches[i].identifier === touchId) {
        touch = changedTouches[i];
        break;
      }
    }
    if (touch) {
      touchId = null;
      angle = getDragAngle(touch);
      length = Math.sqrt(Math.pow(touch.pageX - touchStartX, 2) + Math.pow(touch.pageY - touchStartY, 2))

      if (length > tileSize) {
        const direction = getCardinalDirection(angle);
        if (direction === 'north') {
          document.dispatchEvent(new KeyboardEvent('keydown', { key: 'k'}));
        } else if (direction === 'south') {
          document.dispatchEvent(new KeyboardEvent('keydown', { key: 'j'}));
        } else if (direction === 'east') {
          document.dispatchEvent(new KeyboardEvent('keydown', { key: 'l'}));
        } else if (direction === 'west') {
          document.dispatchEvent(new KeyboardEvent('keydown', { key: 'h'}));
        }
      } else {
        // consider this a tap (useful for title/dead)
        document.dispatchEvent(new KeyboardEvent('keydown', { key: ';'}));
      }
    }
  }
}

function handleTouchCancel() {
  touchId = null;
}

function getRotatedCanvasCoords(x, y) {
  const bounding = canvas.getBoundingClientRect();
  return {
    x: y - bounding.top,
    y: bounding.right - x,
  };
}

// angle returned in non-negative degrees w/ positive x to the right, positive y upwards
function getDragAngle(touch) {
  if (touch) {
    const dx = touch.pageX - touchStartX;
    const dy = touch.pageY - touchStartY;
    const angle = Math.atan((-1 * dy) / dx) + (dx < 0 ? Math.PI : 0);

    const rawDeg = (angle * 57.29);
    return rawDeg < 0 ? rawDeg + 360 : rawDeg;
  }
}

// TODO: there's a chance this should place buffers at the breakpoints to require more decisive inputs
function getCardinalDirection(angle) {
  // rotate the xy axes clockwize 45 deg;
  const rotated = (angle + 45 + 360) % 360;
  if (rotated > 270) {
    return 'east';
  } else if (rotated > 180) {
    return 'south';
  } else if (rotated > 90) {
    return 'west';
  } else {
    return 'north';
  }
}
