import * as THREE from 'three';
import { OBJLoader } from 'three/addons/loaders/OBJLoader.js';
import { MTLLoader } from 'three/addons/loaders/MTLLoader.js';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { GUI } from 'three/addons/libs/lil-gui.module.min.js';

function resizeRendererToDisplaySize(renderer) {
    const canvas = renderer.domElement;
    const width = canvas.clientWidth;
    const height = canvas.clientHeight;
    const needResize = canvas.width !== width || canvas.height !== height;
    if (needResize) {
        renderer.setSize(width, height, false);
    }
    return needResize;
}

// Object management system
class SceneManager {
    constructor(scene) {
        this.scene = scene;
        this.objects = [];
    }

    addObject(object) {
        this.scene.add(object);
        this.objects.push(object);
        return object;
    }

    addCube(size = 1, materials, position = { x: 0, y: 0, z: 0 }, rotation = { x: 0, y: 0, z: 0 }) {
        const geometry = new THREE.BoxGeometry(size, size, size);
        const cube = new THREE.Mesh(geometry, materials);
        
        cube.position.set(position.x, position.y, position.z);
        cube.rotation.set(rotation.x, rotation.y, rotation.z);
        
        return this.addObject(cube);
    }

    addCylinder(radiusTop = 1, radiusBottom = 1, height = 1, radialSegments = 8, materials, position = { x: 0, y: 0, z: 0 }, rotation = { x: 0, y: 0, z: 0 }) {
        const geometry = new THREE.CylinderGeometry(radiusTop, radiusBottom, height, radialSegments);
        const cylinder = new THREE.Mesh(geometry, materials);
        
        cylinder.position.set(position.x, position.y, position.z);
        cylinder.rotation.set(rotation.x, rotation.y, rotation.z);
        
        return this.addObject(cylinder);
    }

    addSphere(radius = 1, widthSegments = 32, heightSegments = 32, materials, position = { x: 0, y: 0, z: 0 }, rotation = { x: 0, y: 0, z: 0 }) {
        const geometry = new THREE.SphereGeometry(radius, widthSegments, heightSegments);
        const sphere = new THREE.Mesh(geometry, materials);
        
        sphere.position.set(position.x, position.y, position.z);
        sphere.rotation.set(rotation.x, rotation.y, rotation.z);
        
        return this.addObject(sphere);
    }

    // loadOBJ(path, position = { x: 0, y: 0, z: 0 }, scale = 1, rotation = { x: 0, y: 0, z: 0 }) {
    //     const objLoader = new OBJLoader();
    //     objLoader.load(path, (object) => {
    //         object.position.set(position.x, position.y, position.z);
    //         object.scale.set(scale, scale, scale);
            
    //         // Apply rotation to make the object face the desired direction
    //         object.rotation.set(rotation.x, rotation.y, rotation.z);
            
    //         this.addObject(object);
    //     });
    // }

    update(time) {
        this.objects.forEach((object) => {
            if (object.userData.animate) {
                object.userData.animate(object, time);
            }
        });
    }
}

function createEquirectangularSkybox(texturePath, scene) {
    const loader = new THREE.TextureLoader();
    loader.load(texturePath, (texture) => {
        texture.mapping = THREE.EquirectangularReflectionMapping; 
        scene.background = texture; 
        console.log("Skybox texture loaded successfully."); 
    }, undefined, (error) => {
        console.error("An error occurred while loading the texture:", error); 
    });
}

function createGround(size = 100) {
    const groundTexture = loadColorTexture('../resources/bedrock.webp');
    groundTexture.wrapS = THREE.RepeatWrapping;
    groundTexture.wrapT = THREE.RepeatWrapping;
    groundTexture.repeat.set(100, 100);

    const groundGeometry = new THREE.PlaneGeometry(size, size);
    const groundMaterial = new THREE.MeshStandardMaterial({ 
        map: groundTexture
    });
    const ground = new THREE.Mesh(groundGeometry, groundMaterial);
    ground.rotation.x = -Math.PI / 2; 
    ground.position.y = -1; 
    ground.receiveShadow = true;
    return ground;
}

function loadColorTexture(path) {
    const loader = new THREE.TextureLoader();
    const texture = loader.load(path);
    texture.colorSpace = THREE.SRGBColorSpace;
    return texture;
}

function loadSkullWithMaterials(objPath, mtlPath, scene, rotation = { x: 0, y: 0, z: 0 }, scale = 1) {
    const mtlLoader = new MTLLoader();
    mtlLoader.load(mtlPath, (materials) => {
        materials.preload(); 

        const objLoader = new OBJLoader();
        objLoader.setMaterials(materials); 
        objLoader.load(objPath, (object) => {
            object.position.set(0, -1, -15); 
            object.rotation.set(rotation.x, rotation.y, rotation.z); 
            object.scale.set(scale, scale, scale);
            scene.add(object); 
        });
    });
}

// function handleShapeClick(event, manager) {
//     const mouse = new THREE.Vector2();
//     const raycaster = new THREE.Raycaster();

//     mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
//     mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;

//     raycaster.setFromCamera(mouse, camera);

//     // Calculate objects intersecting the picking ray
//     const intersects = raycaster.intersectObjects(manager.objects);

//     if (intersects.length > 0) {
//         const object = intersects[0].object; 
//         const originalColor = object.material.color.getHex(); 

//         // Flash white
//         object.material.color.set(0xffffff); // Set to white
//         setTimeout(() => {
//             object.material.color.set(originalColor); 
//         }, 200);
//     }
// }

function addBackgroundShapes(manager, count) {
    for (let i = 0; i < count; i++) {
        // Random position around the camera
        const x = (Math.random() - 0.5) * 50; // Random x position
        const y = (Math.random() - 0.5) * 50; // Random y position
        const z = (Math.random() - 0.5) * 50; // Random z position

        // Random size
        const size = Math.random() + 0.5; 

        // Randomly choose to create a square or a circle
        let shape;
        if (Math.random() < 0.5) {
            // Create a square
            const squareMaterial = new THREE.MeshStandardMaterial({ color: 0x800080 }); 
            shape = manager.addCube(size, squareMaterial, { x, y, z });
        } else {
            // Create a circle
            const circleMaterial = new THREE.MeshStandardMaterial({ color: 0x800080 }); 
            shape = manager.addSphere(size, 32, 32, circleMaterial, { x, y, z });
        }

        // Add click event listener to the shape
        shape.userData.clickable = true; // Mark the shape as clickable
    }
}

function main() {
    const canvas = document.querySelector('#c');
    const renderer = new THREE.WebGLRenderer({ antialias: true, canvas });
    renderer.shadowMap.enabled = true;

    const fov = 75;
    const aspect = 2;
    const near = 0.1;
    const far = 100;
    
    // Create main camera (front view)
    const frontCamera = new THREE.PerspectiveCamera(fov, aspect, near, far);
    frontCamera.position.set(0, 0, 5);
    
    // Create second camera (behind skull)
    const backCamera = new THREE.PerspectiveCamera(fov, aspect, near, far);
    backCamera.position.set(0, 0, -30) // Position behind the skull
    backCamera.rotation.y = Math.PI; // Rotate to face the front
    
    // Set initial active camera
    let activeCamera = frontCamera;
    
    // Create orbit controls for both cameras
    const frontControls = new OrbitControls(frontCamera, canvas);
    frontControls.target.set(0, 0, 0);
    frontControls.update();
    
    const backControls = new OrbitControls(backCamera, canvas);
    backControls.target.set(0, 0, -15); // Target the skull's position
    backControls.update();
    
    // Set initial active controls
    let activeControls = frontControls;

    const scene = new THREE.Scene();

    // Add fog to the scene with increased density
    scene.fog = new THREE.FogExp2(0x800080, 0.05); // Purple color, increased density

    // Create scene manager
    const manager = new SceneManager(scene);

    // Load skull model with materials and rotation to face camera
    loadSkullWithMaterials(
        '../resources/skull.obj', 
        '../resources/skull.mtl', 
        scene, 
        { x: 3 * Math.PI / 2, y: 0, z: 0 }, 
        0.5
    );

    // Add ground
    const ground = createGround();
    manager.addObject(ground);

    // Load a texture for the light sphere
    const lightSphereTexture = loadColorTexture('../resources/moon.jpg'); // Replace with your texture path

    // Create a large sphere to act as a directional light source
    const lightSphereRadius = 5; // Radius of the light sphere
    const lightSphereMaterial = new THREE.MeshStandardMaterial({ map: lightSphereTexture, transparent: false, opacity: 1 }); // Apply texture
    const lightSphere = manager.addSphere(lightSphereRadius, 32, 32, lightSphereMaterial, { x: 10, y: 5, z: -10 }); // Position it above the scene
    scene.add(lightSphere);
    // Create a directional light from the light sphere
    const directionalLight = new THREE.DirectionalLight(0xff0000, 5); 
    directionalLight.position.set(10, 5, -10); 
    directionalLight.castShadow = true; 

    // Configure shadow properties for better quality
    directionalLight.shadow.mapSize.width = 1024; // Higher resolution for shadows
    directionalLight.shadow.mapSize.height = 1024;
    directionalLight.shadow.camera.near = 0.5;
    directionalLight.shadow.camera.far = 50;
    directionalLight.shadow.camera.left = -10;
    directionalLight.shadow.camera.right = 10;
    directionalLight.shadow.camera.top = 10;
    directionalLight.shadow.camera.bottom = -10;

    scene.add(directionalLight);

    const mercTexture = loadColorTexture('../resources/merc.jfif');
    const mercMaterial = new THREE.MeshStandardMaterial({ map: mercTexture });
    const merc = manager.addSphere(1, 32, 32, mercMaterial, { x: 15, y: 5, z: 0 });
    merc.scale.set(5, 5, 5);
    scene.add(merc);

    const solarTexture = loadColorTexture('../resources/solar.jfif');
    const solarMaterial = new THREE.MeshStandardMaterial({ map: solarTexture });
    const solar = manager.addSphere(1, 32, 32, solarMaterial, { x: 10, y: 5, z: 10 });
    solar.scale.set(5, 5, 5);
    scene.add(solar);

    const themoonTexture = loadColorTexture('../resources/themoon.jfif');
    const themoonMaterial = new THREE.MeshStandardMaterial({ map: themoonTexture });
    const themoon = manager.addSphere(1, 32, 32, themoonMaterial, { x: 0, y: 5, z: 15 });
    themoon.scale.set(5, 5, 5);
    scene.add(themoon);

    const monkeyTexture = loadColorTexture('../resources/monkey.jfif');
    const monkeyMaterial = new THREE.MeshStandardMaterial({ map: monkeyTexture });
    const monkey = manager.addSphere(1, 32, 32, monkeyMaterial, { x: -10, y: 5, z: 10 });
    monkey.scale.set(5, 5, 5);
    scene.add(monkey);

    const ioTexture = loadColorTexture('../resources/io.jfif');
    const ioMaterial = new THREE.MeshStandardMaterial({ map: ioTexture });
    const io = manager.addSphere(1, 32, 32, ioMaterial, { x: -15, y: 5, z: 0 });
    io.scale.set(5, 5, 5);
    scene.add(io);
    
    
    
    


    // Light
    const color = 0xFFFFFF;
    const intensity = 3;
    const light = new THREE.DirectionalLight(color, intensity);
    light.position.set(-1, 2, 4);
    light.castShadow = true;
    scene.add(light);

    // Add ambient light
    const ambientLight = new THREE.AmbientLight(0x404040, 1);
    scene.add(ambientLight);

    // Create a white cube with ambient light
    const whiteCubeTexture = loadColorTexture('../resources/tess.jpg');
    const whiteCubeMaterial = new THREE.MeshStandardMaterial({ map: whiteCubeTexture }); // White color
    const whiteCube = manager.addCube(1, whiteCubeMaterial, { x: -10, y: 5, z: -10 }); // Position it above the ground
    whiteCube.scale.set(5, 5, 5);    
    scene.add(whiteCube);
    // Create cube materials
    const cubeMaterials = [
        new THREE.MeshStandardMaterial({map: loadColorTexture('https://threejs.org/manual/examples/resources/images/flower-1.jpg')}),
        new THREE.MeshStandardMaterial({map: loadColorTexture('https://threejs.org/manual/examples/resources/images/flower-2.jpg')}),
        new THREE.MeshStandardMaterial({map: loadColorTexture('https://threejs.org/manual/examples/resources/images/flower-3.jpg')}),
        new THREE.MeshStandardMaterial({map: loadColorTexture('https://threejs.org/manual/examples/resources/images/flower-4.jpg')}),
        new THREE.MeshStandardMaterial({map: loadColorTexture('https://threejs.org/manual/examples/resources/images/flower-5.jpg')}),
        new THREE.MeshStandardMaterial({map: loadColorTexture('https://threejs.org/manual/examples/resources/images/flower-6.jpg')}),
    ];

    const cube1 = manager.addCube(1, cubeMaterials, { x: 0, y: 0, z: 0 });
    cube1.userData.animate = (obj, time) => {
        obj.rotation.x = time;
        obj.rotation.y = time;
    };
    cube1.castShadow = true; 
    cube1.receiveShadow = true;  
    
    const cylinder = manager.addCylinder(1, 1, 2, 32, cubeMaterials[0], { x: -2, y: 0, z: 0 });
    cylinder.userData.animate = (obj, time) => {
        obj.rotation.y = time;
    };
    cylinder.castShadow = true; 
    cylinder.receiveShadow = true;  
    
    
    const sphere = manager.addSphere(1, 32, 32, cubeMaterials[1], { x: 2, y: 0, z: 0 });
    sphere.userData.animate = (obj, time) => {
        obj.rotation.x = time;
    };
    sphere.castShadow = true;  
    sphere.receiveShadow = true;  

    createEquirectangularSkybox('../resources/space1.jpg', scene); 

    const yellowMaterial = new THREE.MeshStandardMaterial({ color: 0xffff00 }); 

    const pointLight1 = new THREE.PointLight(0xffff00, 10, 10); 
    pointLight1.position.set(-2, 6, -10);
    scene.add(pointLight1);
    manager.addSphere(0.5, 32, 32, yellowMaterial, { x: -2, y: 6, z: -10 }); 

    const glowMaterial1 = new THREE.MeshBasicMaterial({ color: 0xffff00, transparent: true, opacity: 0.5 });
    manager.addSphere(0.75, 32, 32, glowMaterial1, { x: -2, y: 6, z: -10 }); 

    const pointLight2 = new THREE.PointLight(0xffff00, 10, 10); 
    pointLight2.position.set(2, 6, -10);
    scene.add(pointLight2);
    manager.addSphere(0.5, 32, 32, yellowMaterial, { x: 2, y: 6, z: -10 }); 

    const glowMaterial2 = new THREE.MeshBasicMaterial({ color: 0xffff00, transparent: true, opacity: 0.5 });
    manager.addSphere(0.75, 32, 32, glowMaterial2, { x: 2, y: 6, z: -10 }); 

    // const lightHelper1 = new THREE.DirectionalLightHelper(light, 1);
    // scene.add(lightHelper1);

    // Add background shapes
    addBackgroundShapes(manager, 100); // Add 100 squares and circles

    // Add event listener for mouse clicks
    window.addEventListener('click', (event) => handleShapeClick(event, manager));

    // Create GUI for camera switching
    const gui = new GUI();
    const cameraFolder = gui.addFolder('Camera Controls');
    
    const cameraSettings = {
        'Current View': 'Front View',
        switchCamera: function() {
            if (activeCamera === frontCamera) {
                activeCamera = backCamera;
                activeControls = backControls;
                this['Current View'] = 'Back View';
            } else {
                activeCamera = frontCamera;
                activeControls = frontControls;
                this['Current View'] = 'Front View';
            }
            // Update the GUI display
            updateGUI();
        }
    };
    
    cameraFolder.add(cameraSettings, 'Current View').listen();
    cameraFolder.add(cameraSettings, 'switchCamera').name('Switch Camera');
    cameraFolder.open();
    
    function updateGUI() {
        for (let controller of gui.controllers) {
            controller.updateDisplay();
        }
    }

    function render(time) {
        time *= 0.001;

        if (resizeRendererToDisplaySize(renderer)) {
            // Update both cameras' aspect ratios
            const canvas = renderer.domElement;
            const aspect = canvas.clientWidth / canvas.clientHeight;
            frontCamera.aspect = aspect;
            frontCamera.updateProjectionMatrix();
            backCamera.aspect = aspect;
            backCamera.updateProjectionMatrix();
        }

        // Update all objects with animation
        manager.update(time);
        
        renderer.setPixelRatio(window.devicePixelRatio);
        // Render using the active camera
        renderer.render(scene, activeCamera);
        
        requestAnimationFrame(render);
    }

    requestAnimationFrame(render);
}

main();
