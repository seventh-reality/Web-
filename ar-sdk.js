class ARSDK {
    static initialize() {
        this.setupWebXR();
    }

    static setupWebXR() {
        if (navigator.xr) {
            navigator.xr.requestSession('immersive-ar').then((session) => {
                // Your AR session setup code here
            }).catch((err) => {
                console.error('Failed to start AR session', err);
            });
        } else {
            console.error('WebXR not supported');
        }
    }
}

class ARSDK {
    constructor() {
        this.scene = null;
        this.camera = null;
        this.renderer = null;
        this.arSession = null;
        this.hitTestSource = null;
        this.models = {};
        this.currentScene = null;
        this.sceneButtons = {};
    }

    initialize(container) {
        this.setupThreeJS(container);
        this.setupWebXR();
        this.loadScenes();
        this.setupEventListeners();
    }

    setupThreeJS(container) {
        this.scene = new THREE.Scene();
        this.camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
        this.renderer = new THREE.WebGLRenderer({ alpha: true });
        this.renderer.setSize(window.innerWidth, window.innerHeight);
        container.appendChild(this.renderer.domElement);
    }

    setupWebXR() {
        if (navigator.xr) {
            navigator.xr.requestSession('immersive-ar', {
                requiredFeatures: ['hit-test']
            }).then(session => {
                this.arSession = session;
                this.setupHitTestSource();
                this.renderer.xr.enabled = true;
                this.renderer.xr.setSession(session);
                this.renderer.setAnimationLoop(() => this.render());
            });
        } else {
            console.error('WebXR not supported');
        }
    }

    setupHitTestSource() {
        this.arSession.requestReferenceSpace('viewer').then(referenceSpace => {
            this.arSession.requestHitTestSource({ space: referenceSpace }).then(source => {
                this.hitTestSource = source;
            });
        });
    }

    loadScenes() {
        // Example scenes setup
        this.loadScene('scene1', 'Steerad.glb', 'Scene 1');
        this.loadScene('scene2', 'Steerad.glb', 'Scene 2');
    }

    loadScene(id, modelUrl, buttonText) {
        const scene = new THREE.Scene();
        const loader = new THREE.GLTFLoader();
        loader.load(modelUrl, gltf => {
            const model = gltf.scene;
            model.scale.set(1, 1, 1);
            scene.add(model);
            this.models[id] = model;
            this.createSceneButton(id, buttonText);
        }, undefined, error => {
            console.error('An error occurred while loading the model', error);
        });
    }

    createSceneButton(id, text) {
        const button = document.createElement('button');
        button.textContent = text;
        button.onclick = () => this.switchScene(id);
        document.body.appendChild(button);
        this.sceneButtons[id] = button;
    }

    switchScene(id) {
        if (this.currentScene) {
            this.scene.remove(this.currentScene);
        }
        this.currentScene = this.models[id];
        this.scene.add(this.currentScene);
    }

    setupEventListeners() {
        window.addEventListener('resize', () => {
            this.renderer.setSize(window.innerWidth, window.innerHeight);
            this.camera.aspect = window.innerWidth / window.innerHeight;
            this.camera.updateProjectionMatrix();
        });
    }

    render() {
        if (this.hitTestSource) {
            this.arSession.requestHitTestResults(this.hitTestSource).then(results => {
                if (results.length > 0) {
                    const hit = results[0];
                    if (this.currentScene) {
                        this.currentScene.position.set(hit.pose.transform.position.x, hit.pose.transform.position.y, hit.pose.transform.position.z);
                    }
                }
            });
        }
        this.renderer.render(this.scene, this.camera);
    }
}
