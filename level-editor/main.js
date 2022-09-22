const output = document.getElementById("output");
const canvas = document.querySelector("canvas");
const ctx = canvas.getContext("2d");

let points = [];

let isMouseDown = false;
output.value = "";
const distance = (a, b) => ((a.x - b.x) ** 2 + (a.y - b.y) ** 2) ** 0.5;
const magnitude = (a) => (a.x ** 2 + a.y ** 2) ** 0.5;
const segmentLength = 25;

const getSegmentAngles = (points) => {
  let angles = [];

  points.forEach((p, i) => {
    const next = points[i + 1];
    if (!next) return;
    const diffX = next.x - p.x;
    const diffY = next.y - p.y;
    const angle = Math.atan(diffY / diffX);
    angles.push(angle);
  });
  return angles;
};

const endMouseDown = () => {
  isMouseDown = false;
};

const handleMouseDown = (e) => {
  isMouseDown = true;
  if (points.length === 0) {
    points.push({
      x: e.pageX,
      y: e.pageY,
    });
    renderPoints(points);
  }
};

const renderPoints = (points) => {
  points.forEach((p) => {
    ctx.fillRect(p.x, p.y, 2, 2);
  });
  ctx.beginPath();
  points.forEach(({ x, y }, i) => {
    if (i === 0) {
      ctx.moveTo(x, y);
    } else {
      ctx.lineTo(x, y);
    }
  });
  ctx.stroke();

  const angles = getSegmentAngles(points);
  output.value = JSON.stringify(angles);
};

const handleMouseMove = (e) => {
  const previousPoint = points[points.length - 1];
  if (!previousPoint || !isMouseDown) return;

  const currentPoint = {
    x: e.pageX,
    y: e.pageY,
  };

  const isUphill = currentPoint.y < previousPoint.y;
  const isBackwards = currentPoint.x < previousPoint.x;

  if (isUphill || isBackwards) return;

  const pointsDistance = distance(currentPoint, previousPoint);

  if (pointsDistance < segmentLength) return;

  const fromPreviousVector = {
    x: currentPoint.x - previousPoint.x,
    y: currentPoint.y - previousPoint.y,
  };
  const mag = magnitude(fromPreviousVector);

  const fromPreviousVectorNormalized = {
    x: fromPreviousVector.x / mag,
    y: fromPreviousVector.y / mag,
  };
  const toNewPoint = {
    x: fromPreviousVectorNormalized.x * segmentLength,
    y: fromPreviousVectorNormalized.y * segmentLength,
  };
  points.push({
    x: previousPoint.x + toNewPoint.x,
    y: previousPoint.y + toNewPoint.y,
  });
  renderPoints(points);
};

canvas.addEventListener("mousedown", handleMouseDown);
canvas.addEventListener("mouseup", endMouseDown);
canvas.addEventListener("mouseleave", endMouseDown);
canvas.addEventListener("mousemove", handleMouseMove);
