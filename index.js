
// Setup ThreeJS in the usual way
const renderer = new THREE.WebGLRenderer();
document.body.appendChild(renderer.domElement);

renderer.setSize(window.innerWidth, window.innerHeight);
window.addEventListener("resize", () => {
    renderer.setSize(window.innerWidth, window.innerHeight);
});

renderer.setAnimationLoop(render);

// Setup a Zappar camera instead of one of ThreeJS's cameras
const camera = new ZapparThree.Camera();

// The Zappar library needs your WebGL context, so pass it
ZapparThree.glContextSet(renderer.getContext());

// Create a ThreeJS Scene and set its background to be the camera background texture
const scene = new THREE.Scene();
scene.background = camera.backgroundTexture;

// Request the necessary permission from the user
ZapparThree.permissionRequestUI().then((granted) => {
    if (granted) camera.start();
    else ZapparThree.permissionDeniedUI();
});

// Set up our instant tracker group
const tracker = new ZapparThree.InstantWorldTracker();
const trackerGroup = new ZapparThree.InstantWorldAnchorGroup(camera, tracker);
scene.add(trackerGroup);

// Add some content
const box = new THREE.Mesh(
    new THREE.BoxBufferGeometry(),
    new THREE.MeshBasicMaterial()
);

box.position.y = 0.5;

trackerGroup.add(box);

let hasPlaced = false;
const placementUI = document.getElementById("zappar-placement-ui") || document.createElement("div");
placementUI.addEventListener("click", () => {
    placementUI.remove();
    hasPlaced = true;
})

// Set up our render loop
function render() {
    camera.updateFrame(renderer);

    if (!hasPlaced) tracker.setAnchorPoseFromCameraOffset(0, 0, -5);

    renderer.render(scene, camera);
}
