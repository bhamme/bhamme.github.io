function getDimensions() {
  const { innerWidth, innerHeight } = window;
  return { width: innerWidth, height: innerHeight };
}

function smallerDimension() {
  const { width, height } = getDimensions();
  return width < height ? 'width' : 'height';
}

function gameDimensions() {
  const width = tileSize*(numTiles+uiWidth);
  const height = tileSize*numTiles;
  return { width, height };
}

function shouldRotate() {
  const { width, height } = getDimensions();
  return (width / height) < 1;
}

function adjustedTileSize() {
  const smallerDim = smallerDimension();
  const length = getDimensions()[smallerDim];
  const tileCapacity = Math.floor(length / 16);
  const scale = Math.floor(tileCapacity / numTiles);
  if (scale < 1) {
    throw 'Device too small';
  }
  return scale * 16;
}
