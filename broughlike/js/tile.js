class Tile {
  constructor(x, y, sprite, passable) {
    this.x = x;
    this.y = y;
    this.sprite = sprite;
    this.passable = passable;
  }

  draw() {
    drawSprite(this.sprite, this.x, this.y);

    if (this.treasure) {
      drawSprite(12, this.x, this.y);
    }
  }

  dist(other) {
    // manhattan distance
    return Math.abs(this.x - other.x) + Math.abs(this.y - other.y);
  }

  getNeighbor(dx, dy) {
    return getTile(this.x + dx, this.y + dy);
  }

  getAdjacentNeighbors() {
    return shuffle([
      this.getNeighbor(0, -1),
      this.getNeighbor(0, 1),
      this.getNeighbor(-1, 0),
      this.getNeighbor(1, 0),
    ]);
  }

  getAdjacentPassableNeighbors() {
    return this.getAdjacentNeighbors().filter((t) => t.passable);
  }

  getConnectedTiles() {
    let connectedTiles = [this];
    let frontier = [this];
    while (frontier.length) {
      const neighbors =
        frontier.pop()
          .getAdjacentPassableNeighbors()
          .filter((t) => !connectedTiles.includes(t));
        connectedTiles = connectedTiles.concat(neighbors);
        frontier = frontier.concat(neighbors);
    }
    return connectedTiles;
  }

  replace(newTileType) {
    tiles[this.x][this.y] = new newTileType(this.x, this.y);
    return tiles[this.x][this.y];
  }
}

class Floor extends Tile {
  constructor(x, y) {
    super(x, y, 2, true);
  }

  stepOn(monster) {
    if (monster.isPlayer && this.treasure) {
      score ++;
      this.treasure = false;
      spawnMonster();
    }
  }
}

class Wall extends Tile {
  constructor(x, y) {
    super(x, y, 3, false);
  }
}

class Exit extends Tile {
  constructor(x, y) {
    super(x, y, 11, true);
    this.floor = new Floor(x, y);
  }

  stepOn(monster) {
    if (monster.isPlayer) {
      if (level === numLevels) {
        addScore(score, true);
        showTitle();
      } else {
        level ++;
        startLevel(Math.min(maxHp, player.hp + 1));
      }
    }
  }

  draw() {
    this.floor.draw();
    super.draw();
  }
}
