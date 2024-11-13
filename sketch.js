
// paper describing map projection math: https://marksmath.org/classes/common/MapProjection.pdf
// helpful stack overflow answer about Mercator, not sure what R is: https://stackoverflow.com/a/14457180

const screenX = 2000;
const screenY = 1000;
const yOffset = 115;

let americasUnprojectedStrs;
let californiaUnprojectedStrs;

// read in .csv files of unprojected pts with the columns: longitude,latitude,vertical
function preload() {
  americasUnprojectedStrs   = loadStrings('americas-unprojected.csv');
  californiaUnprojectedStrs = loadStrings('california-unprojected.csv');
}

// returns an array of pts, each represented as [longitude: Number, latitude: Number, vertical: Number]
function parseUnprojectedStrs(strs) {
  return strs.map( latLongVert =>
    latLongVert.split(',').map( number => parseFloat(number) )
  );
}

function longLatToEquiRectangular(long, lat) {
  return [long, lat]; // :P
}

function translateToScreen(x,y) {

  const maxX = 360;
  const maxY = 180;

  x += maxX / 2; // x now ranges from 0 to 360 (maxX)
  y += maxY / 2; // y now ranges from 0 to 180 (maxY)

  y = maxY - y; // (0,0) is top left of screen, flip y

  const ptToScreenScalarX = screenX / maxX;
  const ptToScreenScalarY = screenY / maxY;

  x *= ptToScreenScalarX;
  y *= ptToScreenScalarY;

  return [x, y];
}

function latLongToMercator(lat, long) {
  
  let latRadians = lat * Math.PI / 180;
  let sum = Math.PI / 4 + latRadians / 2
  let y = Math.log( Math.tan(sum) );

  return [long, 55*y];
}

let americasERScreenPts;
let californiaERScreenPts;

let americasMercatorScreenPts;
let californiaMercatorScreenPts;

function setup() {
  createCanvas(screenX - 300, screenY).parent('sketch-holder');
  frameRate(0);

  const parsedAmericas = parseUnprojectedStrs(americasUnprojectedStrs);
  const parsedCalifornia = parseUnprojectedStrs(californiaUnprojectedStrs);

  // EQUI RECTANGULAR
  americasERScreenPts = parsedAmericas
    .map( pt => longLatToEquiRectangular(pt[0], pt[1]))
    .map( pt => translateToScreen(pt[0], pt[1]))
    .map( pt => [pt[0], pt[1] + yOffset]);

  californiaERScreenPts = parsedCalifornia
    .map( pt => longLatToEquiRectangular(pt[0], pt[1]))
    .map( pt => translateToScreen(pt[0], pt[1]))
    .map( pt => [pt[0], pt[1] + yOffset]);

 
  // MERCATOR
  americasMercatorScreenPts = parsedAmericas
    .map( pt => latLongToMercator(pt[1], pt[0]))
    .map( pt => translateToScreen(pt[0], pt[1]))
    .map( pt => [pt[0] + 800, pt[1] + yOffset]);

  californiaMercatorScreenPts = parsedCalifornia
    .map( pt => latLongToMercator(pt[1], pt[0]))
    .map( pt => translateToScreen(pt[0], pt[1]))
    .map( pt => [pt[0] + 800, pt[1] + yOffset]);

  draw();
}

function drawPolygonFromPts(pts) {
  beginShape();
  pts.forEach( pt => vertex(pt[0], pt[1]) );
  endShape(CLOSE);
}

function draw() {
  background(220);

  strokeWeight(4);
  stroke(0, 0, 139);
  fill(173, 216, 230);
  drawPolygonFromPts(americasERScreenPts);

  strokeWeight(2);
  stroke(180, 0, 0);
  fill(255,204,204);
  drawPolygonFromPts(californiaERScreenPts);

  strokeWeight(4);
  stroke(180, 0, 0);
  fill(255,204,204);
  drawPolygonFromPts(americasMercatorScreenPts);

  strokeWeight(2);
  stroke(0, 0, 139);
  fill(173, 216, 230);
  drawPolygonFromPts(californiaMercatorScreenPts);

  // Equator line
  strokeWeight(3);
  stroke('rgba(20, 20, 20, 0.4)');
  const equatorY = screenY / 2 + yOffset / 2;
  line(0, equatorY, screenX, equatorY);

  textSize(50);
  noStroke();
  fill(0, 0, 139);
  text('Equirectangular', 100, 140);
  textSize(55);
  fill(180, 0, 0);
  text('Mercator', 1100, 750);
}
