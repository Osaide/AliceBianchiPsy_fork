// Original code from: https://codepen.io/cjgammon/pen/ExoZNwe by CJ Gammon

const colors = ["#225ee1", "#28d7bf", "#ac53cf", "#e7a39c"];
const backgroundColor = "#31AFD4"; // This might not be visible if canvas is transparent or fully covered by shader
const width = window.innerWidth;
const height = window.innerHeight;
const totalFrames = 1000;
let frameCount = 0;
let recording = false; // These recording variables might not be used based on the current setup
let recordingStarted = false;
let frameDelta = 0;

let s;
let p5Canvas; // Variable to hold the canvas element

function setup() {
  p5Canvas = createCanvas(width, height, WEBGL);
  p5Canvas.parent('serenity-animation-background'); // Attach canvas to the specific div

  // Adjust canvas style to ensure it stays in the background correctly
  p5Canvas.style('display', 'block'); // Standard display for canvas
  p5Canvas.style('position', 'fixed');
  p5Canvas.style('top', '0');
  p5Canvas.style('left', '0');
  p5Canvas.style('z-index', '-1'); // Ensure canvas is behind all other content including the serenity text

  noiseSeed(20);
  rectMode(CENTER);
  noStroke();

  let vert = document.getElementById('vertShader').innerText;
  let frag = document.getElementById('fragShader').innerText;
  s = createShader(vert, frag);
}

function draw() {
  // It's important that the p5.js background() function is not called,
  // or is called with a transparent color if the shader is meant to be the sole visual.
  // background(backgroundColor); // If called, this will draw over the shader unless transparent.
  // For a fullscreen shader effect, typically you don't draw a p5.js background.

  shader(s);

  s.setUniform('uResolution',[width,height]);
  // Note: p5.js frameCount is used internally by p5, so using a custom frameCount for shader time is good.
  // Using millis() for uTime is common.
  s.setUniform('uTime', millis() / 250.0); // Increased speed; original was 1000.0, codepen was 100.0
  // s.setUniform('uTime',millis()/100); // Original speed from codepen

  // These uniforms seem specific to the original Codepen's controls, may not be needed
  s.setUniform('uLowGpu',false);
  s.setUniform('uVeryLowGpu',false);
  s.setUniform('uSpeedColor',20.0);

  s.setUniform('uColor1',hex2rgb(colors[0]));
  s.setUniform('uColor2',hex2rgb(colors[1]));
  s.setUniform('uColor3',hex2rgb(colors[2]));
  s.setUniform('uColor4',hex2rgb(colors[3]));
  // uColor5 was in the frag shader but not set here, if it's used, it would default to black.

  // The rect covers the whole canvas, and the shader is applied to this rect.
  rect(0,0,width,height);
}

function windowResized() {
  // Update width and height, then resize canvas
  // width = window.innerWidth; // width is const, cannot reassign
  // height = window.innerHeight; // height is const, cannot reassign
  resizeCanvas(window.innerWidth, window.innerHeight);
}

const hex2rgb = (hex) => {
    const r = parseInt(hex.slice(1, 3), 16)
    const g = parseInt(hex.slice(3, 5), 16)
    const b = parseInt(hex.slice(5, 7), 16)

    // CSS colors are 0-255, shader colors are 0.0-1.0
    return [ r / 255, g / 255, b / 255 ];
}

// frameCount for shader animation (from original code, if needed for specific timing)
// function draw() {
//   frameCount += 1; // Custom frameCount
//   frameDelta = (2 * Math.PI * (frameCount % totalFrames)) / totalFrames;
// ...
// }
