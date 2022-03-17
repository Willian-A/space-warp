import "./style.css";
import * as THREE from "three";
import * as dat from "dat.gui";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls";
import { UnrealBloomPass } from "three/examples/jsm/postprocessing/UnrealBloomPass.js";
import { EffectComposer } from "three/examples/jsm/postprocessing/EffectComposer";
import { RenderPass } from "three/examples/jsm/postprocessing/RenderPass";

// Loading
const textureLoader = new THREE.TextureLoader();
const normalTexture = textureLoader.load("/textures/lua.jpg");

// Debug
const gui = new dat.GUI();
const cameraFolder = gui.addFolder("Camera");

// Canvas
const canvas = document.querySelector("canvas.webgl");

// Scene
const scene = new THREE.Scene();
scene.fog = new THREE.FogExp2(0xefd1b5, 0.0025);

// Debug Axis
const axesHelper = new THREE.AxesHelper(5);
scene.add(axesHelper);

// Objects

// Materials

// material.normalMap = normalTexture;

// material.color = new THREE.Color("#85a1ff");

// Mesh

var boxGeo = new THREE.IcosahedronGeometry(1, 15);
const starColors = [
  "#fff5f2",
  "#ffc370",
  "#ffcc6f",
  "#ffca8a",
  "#a5b9ff",
  "#9cb2ff",
  "#a5c0ff",
  "#a1bdff",
];

let starsPopulation = 300;

function generateRandomInteger() {
  return Math.random() < 0.5 ? -1 : 1;
}

function generateRandomAxis() {
  return Math.ceil(Math.random() * 400 * generateRandomInteger());
}

function getRandomArbitrary(min, max) {
  return Math.random() * (max - min);
}

const geometry = new THREE.IcosahedronGeometry(1, 15);

let times = 1;
function createStars(ver) {
  for (var i = 0; i < starsPopulation; i++) {
    const randomStarColor =
      starColors[Math.floor(Math.random() * starColors.length)];

    const color = new THREE.Color(randomStarColor);
    const material = new THREE.MeshBasicMaterial({ color: color });
    const sphere = new THREE.Mesh(geometry, material);

    sphere.position.x = generateRandomAxis();
    sphere.position.y = generateRandomAxis();
    sphere.position.z = ver + i * 5;
    sphere.name = "sphere_" + (ver + i * 5);
    scene.add(sphere);
  }
}

createStars(1);
// Lights

// const light = new THREE.AmbientLight("#5e5e5e"); // soft white light
// scene.add(light);
// const helper = new THREE.PointLightHelper(light, 5);
// scene.add(helper);
const ambientlight = new THREE.AmbientLight(0xffffff, 0.1);
scene.add(ambientlight);

// Sizes

const sizes = {
  width: window.innerWidth,
  height: window.innerHeight,
};

window.addEventListener("resize", () => {
  // Update sizes
  sizes.width = window.innerWidth;
  sizes.height = window.innerHeight;

  // Update camera
  camera.aspect = sizes.width / sizes.height;
  camera.updateProjectionMatrix();

  // Update renderer
  renderer.setSize(sizes.width, sizes.height);
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
});

// Camera
const camera = new THREE.PerspectiveCamera(
  75,
  sizes.width / sizes.height,
  1,
  1000
);
// camera.position.x = 0;
// camera.position.y = 0;
camera.position.z = -1;
// // camera.rotation.y = 3.1;
// cameraFolder.add(camera.position, "x");
// cameraFolder.add(camera.position, "y");
// cameraFolder.add(camera.position, "z");
// cameraFolder.add(camera.rotation, "x");
// cameraFolder.add(camera.rotation, "y");
// cameraFolder.add(camera.rotation, "z");
scene.add(camera);

// Controls
const controls = new OrbitControls(camera, canvas);
controls.enablePan = false;
controls.enableRotate = false;
controls.enableZoom = false;

// Renderer

const renderer = new THREE.WebGLRenderer({
  antialias: true,
  canvas: canvas,
});
renderer.autoClear = false;
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.setPixelRatio(window.devicePixelRatio ? window.devicePixelRatio : 1);
renderer.setClearColor(0x000000, 0.0);

// Postprecessing

const params = {
  bloomStrength: 2,
  bloomThreshold: 0,
  bloomRadius: 0,
};

let renderPass = new RenderPass(scene, camera);
let composer = new EffectComposer(renderer);
renderPass.renderToScreen = true;
let unrealBloom = new UnrealBloomPass(
  new THREE.Vector2(window.innerWidth, window.innerHeight),
  1.5,
  0.4,
  0.85
);
unrealBloom.threshold = 0;
unrealBloom.strength = 2.5; //intensity of glow
unrealBloom.radius = 0;
composer.setSize(window.innerWidth, window.innerHeight);
composer.renderToScreen = true;
composer.addPass(renderPass);
composer.addPass(unrealBloom);

// Animate

var direction = new THREE.Vector3();
let speed = 2;

const clock = new THREE.Clock();

function removeEntity(min, max) {
  for (let i = min; i < max; i++) {
    const selectedObject = scene.getObjectByName("sphere_" + i);
    scene.remove(selectedObject);
  }
}

const tick = () => {
  const elapsedTime = clock.getElapsedTime();

  camera.getWorldDirection(direction);
  camera.position.addScaledVector(direction, speed);

  // console.log(camera.position);
  if (camera.position.z >= (starsPopulation / 2) * 5 * times) {
    // removeEntity(0, (starsPopulation / 2) * 5 * times);
    createStars(starsPopulation * 5 * times);
    times += 1;
  }

  // Update Orbital Controls
  // controls.update();

  // renderer.render(scene, camera);
  composer.render();

  // Render
  // Call tick again on the next frame
  window.requestAnimationFrame(tick);
};

tick();
