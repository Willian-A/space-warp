import "./style.css";
import * as THREE from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls";
import { UnrealBloomPass } from "three/examples/jsm/postprocessing/UnrealBloomPass.js";
import { EffectComposer } from "three/examples/jsm/postprocessing/EffectComposer";
import { RenderPass } from "three/examples/jsm/postprocessing/RenderPass";

const canvas = document.querySelector("canvas.webgl");

var scene, camera, renderer;
const starColors = [
  "#9bb0ff",
  "#aabfff",
  "#cad7ff",
  "#f8f7ff",
  "#fff4ea",
  "#ffd2a1",
  "#ffcc6f",
];

let LINE_COUNT = 3000;
let geom = new THREE.BufferGeometry();
geom.setAttribute(
  "position",
  new THREE.BufferAttribute(new Float32Array(8000), 3)
);
geom.setAttribute(
  "velocity",
  new THREE.BufferAttribute(new Float32Array(2 * LINE_COUNT), 1)
);
let pos = geom.getAttribute("position");
let pa = pos.array;
let vel = geom.getAttribute("velocity");
let va = vel.array;

// Init

scene = new THREE.Scene();
// scene.fog = new THREE.Fog("#000", 1, 450);
// const axesHelper = new THREE.AxesHelper(5);
// scene.add(axesHelper);

camera = new THREE.PerspectiveCamera(
  75,
  window.innerWidth / window.innerHeight,
  1,
  1000
);
camera.position.z = 50;

const colors = [];
for (let line_index = 0; line_index < LINE_COUNT; line_index++) {
  var x = Math.random() * 400 - 200;
  var y = Math.random() * 200 - 100;
  var z = Math.random() * 100;
  var xx = x;
  var yy = y;
  var zz = z;
  //line start
  pa[6 * line_index] = x;
  pa[6 * line_index + 1] = y;
  pa[6 * line_index + 2] = z;
  //line end
  pa[6 * line_index + 3] = xx;
  pa[6 * line_index + 4] = yy;
  pa[6 * line_index + 5] = zz;

  va[2 * line_index] = va[2 * line_index + 1] = 0;
  const randomStarColor =
    starColors[Math.floor(Math.random() * starColors.length)];
  const color = new THREE.Color(randomStarColor);
  colors.push(color.r, color.g, color.b);
}
geom.setAttribute("color", new THREE.Float32BufferAttribute(colors, 3));

//debugger;
let mat = new THREE.LineBasicMaterial({ vertexColors: true });
let lines = new THREE.LineSegments(geom, mat);
scene.add(lines);

// Controls

// const controls = new OrbitControls(camera, canvas);

window.addEventListener("resize", onWindowResize, false);

function onWindowResize() {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
}

renderer = new THREE.WebGLRenderer({
  antialias: true,
  canvas: canvas,
  alpha: true,
});
renderer.autoClear = false;
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.setPixelRatio(window.devicePixelRatio ? window.devicePixelRatio : 1);
// renderer.setClearColor(0x000000, 0.0);

document.body.appendChild(renderer.domElement);

// Postprocessing effects

let renderPass = new RenderPass(scene, camera);
renderPass.renderToScreen = true;
let composer = new EffectComposer(renderer);
let unrealBloom = new UnrealBloomPass(
  new THREE.Vector2(window.innerWidth, window.innerHeight),
  1.5,
  0.4,
  0.85
);

unrealBloom.threshold = 0;
unrealBloom.strength = 5; //intensity of glow
unrealBloom.radius = 1;

composer.setSize(window.innerWidth, window.innerHeight);
composer.renderToScreen = true;
composer.addPass(renderPass);
composer.addPass(unrealBloom);

let velocity = 0.01;
let acceleration = 0.0101;
let nebulaAcc = 0.2;

function speedUp() {
  velocity = 0.15;
  acceleration = 0.16;
  nebulaAcc = 1;
}
function speedDown() {
  velocity = 0.01;
  acceleration = 0.0101;
  nebulaAcc = 0.2;
}

const button_speedUp = document.getElementById("speed_up");
const button_speedDown = document.getElementById("speed_down");
button_speedUp.addEventListener("click", speedUp);
button_speedDown.addEventListener("click", speedDown);

// Cloud
const cloudParticles = [];
let loader = new THREE.TextureLoader();
loader.load("textures/smoke.png", function (texture) {
  //texture is loaded
  const cloudGeo = new THREE.PlaneBufferGeometry(500, 500);
  const cloudMaterial = new THREE.MeshLambertMaterial({
    map: texture,
    transparent: true,
    opacity: 0.05,
  });

  for (let i = 0; i < 70; i++) {
    let cloud = new THREE.Mesh(cloudGeo, cloudMaterial);
    cloud.position.set(
      Math.random() * 400 - 250,
      Math.random() * 200 - 100,
      Math.random() * 200 - 450
    );
    // cloud.rotation.x = 0.1;
    // cloud.rotation.y = -0.12;
    cloud.rotation.z = Math.random() * 2 * Math.PI;
    cloudParticles.push(cloud);
    scene.add(cloud);
  }
});

// Lights
let light1 = new THREE.PointLight("#cc6600", 25, 450, 1.7);
light1.position.set(0, 0, 1);
// const helper = new THREE.PointLightHelper(light1, 5);
// scene.add(helper);
scene.add(light1);
let light2 = new THREE.PointLight("#cf0a3f", 40, 450, 1.7);
light2.position.set(-400, 300, 70);
// const helper2 = new THREE.PointLightHelper(light2, 5);
// scene.add(helper2);
scene.add(light2);
let light3 = new THREE.PointLight("#3677ac", 50, 450, 1.7);
light3.position.set(300, 300, 50);
// const helper3 = new THREE.PointLightHelper(light3, 5);
// scene.add(helper3);
scene.add(light3);

function animate() {
  for (let line_index = 0; line_index < LINE_COUNT; line_index++) {
    va[2 * line_index] += velocity; //bump up the velocity by the acceleration amount
    va[2 * line_index + 1] += acceleration;

    //pa[6*line_index]++;                       //x Start
    //pa[6*line_index+1]++;                     //y
    pa[6 * line_index + 2] += va[2 * line_index]; //z
    //pa[6*line_index+3]++;                     //x End
    //pa[6*line_index+4]                        //y
    pa[6 * line_index + 5] += va[2 * line_index + 1]; //z

    if (pa[6 * line_index + 5] > 25) {
      var z = Math.random() * 500 * -1;
      pa[6 * line_index + 2] = z;
      pa[6 * line_index + 5] = z;
      va[2 * line_index] = 0;
      va[2 * line_index + 1] = 0;
    }
  }

  cloudParticles.forEach((p) => {
    p.position.z += nebulaAcc;
    p.rotation.z += 0.0005;
    if (p.position.z > 30) {
      p.position.z = Math.random() * 200 - 600;
    }
    // console.log(p.rotation.z);
  });
  pos.needsUpdate = true;
  // renderer.render(scene, camera);
  composer.render();
  window.requestAnimationFrame(animate);
}

animate();
