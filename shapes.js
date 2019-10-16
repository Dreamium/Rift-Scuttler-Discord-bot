function addRect(ctx, x, y) {
  const size = 100;

  ctx.beginPath();
  ctx.fillStyle = "#010a13";
  ctx.rect(x, y, size, size);
  ctx.fill();

  ctx.beginPath();
  ctx.strokeStyle = "#785b28";
  ctx.rect(x + 1.5, y - 1.5, size - 2 * 1.5, size + 2 * 1.5);
  ctx.rect(x - 1.5, y + 1.5, size + 2 * 1.5, size - 2 * 1.5);
  ctx.stroke();
}

module.exports = { addRect };
