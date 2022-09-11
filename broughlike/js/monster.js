class Monster {
  constructor(tile, sprite, hp) {
    this.move(tile);
    this.sprite = sprite;
    this.hp = hp;
    this.teleportCounter = 2;
    this.offsetX = 0;
    this.offsetY = 0;
  }

  update() {
    if (this.teleportCounter > 0) this.teleportCounter--;
    if (this.stunned || this.teleportCounter > 0) {
      this.stunned = false;
      return;
    }
    this.doStuff();
  }

  doStuff() {
    const neighbors = this.tile.getAdjacentPassableNeighbors().
      filter((t) => !t.monster || t.monster.isPlayer);
    
    if (neighbors.length) {
      neighbors.sort((a, b) => a.dist(player.tile) - b.dist(player.tile));
      const newTile = neighbors[0];
      this.tryMove(newTile.x - this.tile.x, newTile.y - this.tile.y);
    }
  }

  getDisplayX() {
    return this.tile.x + this.offsetX;
  }

  getDisplayY() {
    return this.tile.y + this.offsetY;
  }

  draw() {
    if (this.teleportCounter > 0) {
      drawSprite(10, this.getDisplayX(), this.getDisplayY());
    } else {
      drawSprite(this.sprite, this.getDisplayX(), this.getDisplayY());
      this.drawHp()
    }

    this.offsetX -= Math.sign(this.offsetX) * (1/8);
    this.offsetY -= Math.sign(this.offsetY) * (1/8);
  }

  drawHp() {
    for (let i = 0; i < this.hp; i++) {
      drawSprite(
        9,
        this.getDisplayX() + (i % 3) * (5/16),
        this.getDisplayY() - Math.floor(i / 3) * (5/16),
      )
    }
  }

  tryMove(dx, dy) {
    const newTile = this.tile.getNeighbor(dx, dy);
    if (newTile.passable) {
      if (!newTile.monster) {
        this.move(newTile);
      } else {
        if (this.isPlayer != newTile.monster.isPlayer) {
          newTile.monster.stunned = true;
          newTile.monster.hit(1);

          shakeAmount = 5;

          this.offsetX = (newTile.x - this.tile.x) / 2;
          this.offsetY = (newTile.y - this.tile.y) / 2;
        }
      }
      return true;
    }
  }

  hit(damage) {
    this.hp -= damage;
    if (this.hp <= 0) {
      this.die();
    }
  }

  die() {
    this.dead = true;
    this.tile.monster = null;
    this.sprite = 1;
  }

  move(tile) {
    if (this.tile) {
      this.tile.monster = null;
      this.offsetX = this.tile.x - tile.x;
      this.offsetY = this.tile.y - tile.y;
    }
    this.tile = tile;
    tile.monster = this;
    tile.stepOn(this);
  }
}

class Player extends Monster {
  constructor(tile) {
    super(tile, 0, 3);
    this.isPlayer = true;
    this.teleportCounter = 0;
  }

  tryMove(dx, dy) {
    if (super.tryMove(dx, dy)) {
      tick();
    }
  }
}

// basic
class Stinger extends Monster {
  constructor(tile) {
    super(tile, 4, 2);
  }
}

// moves twice as fast left/right
class Scuttler extends Monster {
  constructor(tile) {
    super(tile, 5, 3);
  }

  doStuff() {
    const neighbors = this.tile.getAdjacentPassableNeighbors().
      filter((t) => !t.monster || t.monster.isPlayer);
    
    if (neighbors.length) {
      neighbors.sort((a, b) => a.dist(player.tile) - b.dist(player.tile));
      const newTile = neighbors[0];
      const dx = newTile.x - this.tile.x;
      const dy = newTile.y - this.tile.y;
      this.tryMove(dx, dy);
      if (dy === 0) {
        this.tryMove(dx, dy);
      }
    }
  }
}

// stays within 4 initial squares (will attack with gas)
class Powder extends Monster {
  constructor(tile) {
    super(tile, 6, 1);
    this.realm = [tile];
    let check = [tile];
    while (this.realm.length < 4 && check.length > 0) {
      const neighbors = check.pop().getAdjacentPassableNeighbors().slice(0, 4 - this.realm.length);
      this.realm = this.realm.concat(neighbors);
      check = check.concat(neighbors);
    }
  }

  doStuff() {
    const neighbors = this.realm.
      filter((t) => !t.monster || t.monster.isPlayer);
    
    if (neighbors.length) {
      this.tile.getAdjacentPassableNeighbors().
        filter((t) => neighbors.includes(t)).
        sort((a, b) => a.dist(player.tile) - b.dist(player.tile));
      const newTile = neighbors[0];
      this.tryMove(newTile.x - this.tile.x, newTile.y - this.tile.y);
    }
  }
}

// doesn't move, shoots bullets
class MtGun extends Monster {
  constructor(tile) {
    super(tile, 7, 1);
  }

  doStuff() {
    // no move
  }
}

// doesn't get closer than 2 from the player, shoots
class Spiner extends Monster {
  constructor(tile) {
    super(tile, 8, 1);
  }

  doStuff() {
    const neighbors = this.tile.getAdjacentPassableNeighbors().
      filter((t) => !t.monster || t.monster.isPlayer).
      filter((t) => t.dist(player.tile) >= 2);
    
    if (neighbors.length) {
      neighbors.sort((a, b) => a.dist(player.tile) - b.dist(player.tile));
      const newTile = neighbors[0];
      const dx = newTile.x - this.tile.x;
      const dy = newTile.y - this.tile.y;
      this.tryMove(dx, dy);
    }
  }
}
