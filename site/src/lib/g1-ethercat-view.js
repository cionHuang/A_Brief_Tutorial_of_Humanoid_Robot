import { JOINTS } from './ethercat-demo-model.js';

const DEG = Math.PI / 180;

/**
 * The lesson's angles are travel from the relaxed starting pose, not URDF
 * coordinates. G1's shoulder pitch and elbow both rotate around local +Y.
 * Its zero-pose forearm points forward: elbow +90° makes it hang downward.
 * Values and limits below come from the bundled official g1_29dof.urdf.
 */
export const G1_JOINT_POSE = Object.freeze([
  { name: 'left_shoulder_pitch_joint', offset: 0, sign: -1, lower: -3.0892, upper: 2.6704 },
  { name: 'left_elbow_joint', offset: 90, sign: -1, lower: -1.0472, upper: 2.0944 },
  { name: 'right_shoulder_pitch_joint', offset: 0, sign: -1, lower: -3.0892, upper: 2.6704 },
  { name: 'right_elbow_joint', offset: 90, sign: -1, lower: -1.0472, upper: 2.0944 },
].map(Object.freeze));

export function toG1JointValues(sample) {
  return Object.fromEntries([
    ...G1_JOINT_POSE.map((joint, index) => [joint.name, (joint.offset + joint.sign * sample.joints[index].angle) * DEG]),
    ['left_shoulder_roll_joint', 12 * DEG],
    ['right_shoulder_roll_joint', -12 * DEG],
  ]);
}

/**
 * Owns the G1 scene, not an animation loop. The component's visibility-aware
 * scheduler calls render(); user orbit/resize/theme changes only invalidate it.
 * Geometry is loaded once; the target arms share geometry with the full robot.
 */
export async function createG1EthercatView(viewport, { urdfUrl, onInvalidate = () => {}, onError } = {}) {
  const [THREE, { OrbitControls }, { default: URDFLoader }] = await Promise.all([
    import('three'),
    import('three/examples/jsm/controls/OrbitControls.js'),
    import('urdf-loader'),
  ]);

  let renderer;
  let controls;
  let resizeObserver;
  let themeObserver;
  let robot;
  let disposed = false;
  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(36, 1, 0.01, 30);
  const modelGroup = new THREE.Group();
  const labels = G1_JOINT_POSE.map((_, index) => viewport.querySelector(`[data-joint="${index}"]`));
  const worldPoint = new THREE.Vector3();
  const projectedPoint = new THREE.Vector3();
  const cameraPoint = new THREE.Vector3();
  const cameraTarget = new THREE.Vector3();
  const modelSize = new THREE.Vector3();
  const ownedMaterials = new Set();
  let ghost;
  let floor;
  let ambient;
  let fitDistance = 2.6;

  function invalidate() {
    if (!disposed) onInvalidate();
  }

  function dispose() {
    if (disposed) return;
    disposed = true;
    resizeObserver?.disconnect();
    themeObserver?.disconnect();
    controls?.removeEventListener('change', invalidate);
    controls?.dispose();
    const geometries = new Set();
    const textures = new Set();
    scene.traverse((object) => {
      if (object.geometry) geometries.add(object.geometry);
      const materials = Array.isArray(object.material) ? object.material : [object.material];
      for (const material of materials) if (material) ownedMaterials.add(material);
    });
    for (const material of ownedMaterials) {
      for (const value of Object.values(material)) if (value?.isTexture) textures.add(value);
      material.dispose();
    }
    for (const texture of textures) texture.dispose();
    for (const geometry of geometries) geometry.dispose();
    scene.clear();
    renderer?.dispose();
    renderer?.domElement.remove();
    labels.forEach((label) => { if (label) label.style.visibility = 'hidden'; });
  }

  function applyPose(model, sample) {
    for (const [name, value] of Object.entries(toG1JointValues(sample))) model.setJointValue(name, value);
  }

  function render() {
    if (disposed || !renderer || !robot) return;
    controls.update();
    scene.updateMatrixWorld(true);
    camera.updateMatrixWorld();
    renderer.render(scene, camera);
    G1_JOINT_POSE.forEach((joint, index) => {
      const label = labels[index];
      if (!label) return;
      robot.joints[joint.name].getWorldPosition(worldPoint);
      cameraPoint.copy(worldPoint).applyMatrix4(camera.matrixWorldInverse);
      projectedPoint.copy(worldPoint).project(camera);
      const visible = cameraPoint.z < 0 && Math.abs(projectedPoint.x) < 0.96
        && Math.abs(projectedPoint.y) < 0.96 && Math.abs(projectedPoint.z) <= 1;
      label.style.visibility = visible ? 'visible' : 'hidden';
      if (visible) {
        label.style.left = `${((projectedPoint.x + 1) * 50).toFixed(2)}%`;
        label.style.top = `${((1 - projectedPoint.y) * 50).toFixed(2)}%`;
      }
    });
    viewport.dataset.rendered = 'true';
    viewport.dataset.renderedTriangles = String(renderer.info.render.triangles);
  }

  function update(sample, station = -1) {
    if (disposed || !robot) return;
    applyPose(robot, sample);
    // The target stays fixed while the actual G1 arms follow the bus timeline.
    ghost.visible = !sample.motionComplete;
    labels.forEach((label, index) => {
      if (!label) return;
      label.dataset.active = String(index === station);
      label.dataset.moving = String(sample.joints[index].active);
      label.dataset.received = String(sample.joints[index].received);
    });
  }

  function resetCamera() {
    if (disposed || !controls) return;
    // +X is G1's forward direction. A modest side view makes the forearms'
    // forward travel legible while keeping both shoulders in view.
    const direction = new THREE.Vector3(1, 0.2, 0.5).normalize();
    camera.position.copy(cameraTarget).addScaledVector(direction, fitDistance);
    controls.target.copy(cameraTarget);
    controls.update();
    invalidate();
  }

  function resize() {
    if (disposed || !renderer) return;
    const width = Math.max(viewport.clientWidth, 1);
    const height = Math.max(viewport.clientHeight, 1);
    camera.aspect = width / height;
    camera.updateProjectionMatrix();
    renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
    renderer.setSize(width, height, false);
    // Full-body framing must survive the narrow single-column mobile layout.
    const verticalFit = modelSize.y / (2 * Math.tan(camera.fov * DEG / 2));
    const horizontalFit = Math.max(modelSize.x, modelSize.z) / (2 * Math.tan(camera.fov * DEG / 2) * camera.aspect);
    const nextFit = Math.max(verticalFit, horizontalFit) * 1.18;
    const oldFit = fitDistance;
    fitDistance = nextFit;
    if (oldFit > 0 && Math.abs(nextFit - oldFit) > 0.001) {
      camera.position.sub(controls.target).multiplyScalar(nextFit / oldFit).add(controls.target);
    }
    invalidate();
  }

  function updateTheme() {
    if (disposed) return;
    const dark = document.documentElement.dataset.theme === 'dark';
    floor.material.color.set(dark ? 0x344957 : 0xd6e5e8);
    floor.material.opacity = dark ? 0.46 : 0.58;
    ambient.intensity = dark ? 2.6 : 2.3;
    invalidate();
  }

  try {
    renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.outputColorSpace = THREE.SRGBColorSpace;
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.setClearColor(0x000000, 0);
    renderer.domElement.setAttribute('aria-hidden', 'true');
    renderer.domElement.style.display = 'block';
    renderer.domElement.style.width = '100%';
    renderer.domElement.style.height = '100%';
    renderer.domElement.style.touchAction = 'pan-y';
    viewport.prepend(renderer.domElement);
    scene.add(modelGroup);

    ambient = new THREE.HemisphereLight(0xffffff, 0x536575, 2.3);
    const key = new THREE.DirectionalLight(0xffffff, 2.7);
    const fill = new THREE.DirectionalLight(0xb9e4ff, 1.25);
    key.position.set(3, 5, 2);
    fill.position.set(-2, 2, -3);
    scene.add(ambient, key, fill);
    floor = new THREE.Mesh(new THREE.CircleGeometry(0.65, 64), new THREE.MeshBasicMaterial({
      color: 0xd6e5e8, transparent: true, opacity: 0.58, depthWrite: false,
    }));
    floor.rotation.x = -Math.PI / 2;
    floor.position.y = -0.002;
    scene.add(floor);

    controls = new OrbitControls(camera, renderer.domElement);
    controls.enablePan = false;
    controls.enableDamping = false;
    controls.enableZoom = false;
    controls.minPolarAngle = Math.PI * 0.2;
    controls.maxPolarAngle = Math.PI * 0.55;
    controls.addEventListener('change', invalidate);
    // OrbitControls sets touch-action:none during connect; restore native
    // vertical page scrolling while keeping horizontal touch rotation.
    renderer.domElement.style.touchAction = 'pan-y';
    renderer.domElement.style.cursor = 'grab';

    const failures = new Set();
    const manager = new THREE.LoadingManager();
    let completeResources;
    const resourcesLoaded = new Promise((resolve) => { completeResources = resolve; });
    manager.onLoad = () => completeResources();
    manager.onError = (url) => failures.add(url);
    const loader = new URDFLoader(manager);
    loader.workingPath = urdfUrl.slice(0, urdfUrl.lastIndexOf('/') + 1);
    loader.fetchOptions = { cache: 'force-cache' };
    const loadMesh = loader.loadMeshCb;
    loader.loadMeshCb = (path, loadingManager, material, complete) => {
      loadMesh(path, loadingManager, material, (mesh, error) => {
        if (error || !mesh) failures.add(path);
        complete(mesh, error);
      });
    };
    // Await all itemEnd callbacks even after a failed mesh, so cleanup cannot
    // race with a late STL callback and leave geometries attached after dispose.
    const [robotResult] = await Promise.allSettled([loader.loadAsync(urdfUrl), resourcesLoaded]);
    if (robotResult.status === 'fulfilled') {
      robot = robotResult.value;
      modelGroup.add(robot);
    }
    if (robotResult.status === 'rejected') throw robotResult.reason;
    if (failures.size) throw new Error(`G1 mesh loading failed: ${[...failures].join(', ')}`);
    for (const joint of G1_JOINT_POSE) {
      if (!robot.joints[joint.name]) throw new Error(`G1 joint missing: ${joint.name}`);
    }
    robot.rotation.x = -Math.PI / 2;
    applyPose(robot, { joints: JOINTS.map(() => ({ angle: 0 })) });
    robot.updateMatrixWorld(true);

    ghost = robot.clone(true);
    // Keep every link/joint ancestor visible; hide only non-arm meshes.
    const ghostMaterial = new THREE.MeshBasicMaterial({
      color: 0x29bbb5, transparent: true, opacity: 0.23, depthWrite: false,
      polygonOffset: true, polygonOffsetFactor: -1, polygonOffsetUnits: -1,
    });
    ownedMaterials.add(ghostMaterial);
    let armMeshCount = 0;
    let meshCount = 0;
    ghost.traverse((object) => {
      if (!object.isMesh) return;
      meshCount += 1;
      let link = object.parent;
      while (link && !link.isURDFLink) link = link.parent;
      const name = link?.urdfName || link?.name || '';
      object.visible = /^(left|right)_(shoulder_|elbow_|wrist_|rubber_hand)/.test(name);
      if (object.visible) armMeshCount += 1;
      object.material = ghostMaterial;
    });
    if (!meshCount || !armMeshCount) throw new Error('G1 visual meshes are missing');
    applyPose(ghost, { joints: JOINTS.map((joint) => ({ angle: joint.target })) });
    modelGroup.add(ghost);
    modelGroup.updateMatrixWorld(true);
    const bounds = new THREE.Box3().setFromObject(modelGroup);
    modelGroup.position.y -= bounds.min.y;
    modelGroup.updateMatrixWorld(true);
    bounds.setFromObject(modelGroup);
    bounds.getCenter(cameraTarget);
    bounds.getSize(modelSize);
    viewport.dataset.model = 'g1_29dof';
    viewport.dataset.meshCount = String(meshCount);
    viewport.dataset.ghostArmMeshes = String(armMeshCount);

    resizeObserver = new ResizeObserver(resize);
    resizeObserver.observe(viewport);
    themeObserver = new MutationObserver(updateTheme);
    themeObserver.observe(document.documentElement, { attributes: true, attributeFilter: ['data-theme'] });
    updateTheme();
    resize();
    resetCamera();
    return { update, render, resetCamera, dispose };
  } catch (error) {
    dispose();
    onError?.(error);
    throw error;
  }
}
