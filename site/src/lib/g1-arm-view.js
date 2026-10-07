/** G1 geometry for the servo lesson; motor and controller parameters stay
 * in the lesson models. Angles here mean forearm travel from hanging downward.
 * The official URDF elbow coordinate is therefore π/2 - lessonAngle. */
export const g1ElbowAngle = (angle) => Math.PI / 2 - angle;
export const g1ArmPose = (angle) => ({
  left_shoulder_roll_joint: 12 * Math.PI / 180,
  left_elbow_joint: g1ElbowAngle(angle),
});
// The tray bottom clears the official hand mesh's local z maximum, 0.06345 m.
// The block bottom meets the tray top exactly; both follow the real hand link.
export const G1_PAYLOAD_MOUNT = Object.freeze({
  link: 'left_rubber_hand',
  trayCenter: Object.freeze([.065, -.014, .0715]),
  blockCenter: Object.freeze([.065, -.014, .12]),
  traySize: Object.freeze([.145, .14, .012]),
  blockSize: Object.freeze([.092, .094, .085]),
});

const visibleLink = (name) => ['torso_link', 'logo_link', 'head_link', 'waist_support_link'].includes(name)
  || /^left_(shoulder_|elbow_|wrist_|rubber_hand)/.test(name);

export async function createG1ArmView(viewport, { urdfUrl, onInvalidate = () => {}, onError } = {}) {
  let renderer, scene, camera, controls, robot, ghost, resizeObserver, themeObserver;
  let payload, pushArrow, ambient;
  let disposed = false;
  const materials = new Set();
  const elements = [];
  const invalidate = () => { if (!disposed) onInvalidate(); };

  function dispose() {
    if (disposed) return;
    disposed = true;
    resizeObserver?.disconnect();
    themeObserver?.disconnect();
    controls?.removeEventListener('change', invalidate);
    controls?.dispose();
    const geometries = new Set(), textures = new Set();
    scene?.traverse((object) => {
      if (object.geometry) geometries.add(object.geometry);
      for (const material of Array.isArray(object.material) ? object.material : [object.material]) {
        if (material) materials.add(material);
      }
    });
    for (const material of materials) {
      for (const value of Object.values(material)) if (value?.isTexture) textures.add(value);
      material.dispose();
    }
    geometries.forEach((geometry) => geometry.dispose());
    textures.forEach((texture) => texture.dispose());
    scene?.clear();
    renderer?.dispose();
    renderer?.domElement.remove();
    elements.forEach((element) => element.remove());
    for (const key of ['model', 'meshCount', 'rendered', 'renderedTriangles', 'elbowAngle', 'payload']) {
      delete viewport.dataset[key];
    }
  }

  try {
    const [THREE, { OrbitControls }, { default: URDFLoader }] = await Promise.all([
      import('three'), import('three/examples/jsm/controls/OrbitControls.js'), import('urdf-loader'),
    ]);
    const response = await fetch(urdfUrl, { cache: 'force-cache' });
    if (!response.ok) throw new Error(`G1 URDF: ${response.status}`);
    const documentSource = new DOMParser().parseFromString(await response.text(), 'application/xml');
    if (documentSource.querySelector('parsererror')) throw new Error('Invalid G1 URDF');
    // Preserve the kinematic tree, but remove unused visual descriptions before
    // parsing so the lesson never downloads hidden leg/right-arm meshes.
    for (const link of documentSource.querySelectorAll('robot > link')) {
      if (!visibleLink(link.getAttribute('name') || '')) {
        for (const visual of link.querySelectorAll(':scope > visual')) visual.remove();
      }
    }

    scene = new THREE.Scene();
    camera = new THREE.PerspectiveCamera(35, 1, 0.01, 20);
    const assembly = new THREE.Group();
    scene.add(assembly);
    renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.outputColorSpace = THREE.SRGBColorSpace;
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.setClearColor(0x000000, 0);
    renderer.domElement.setAttribute('aria-hidden', 'true');
    Object.assign(renderer.domElement.style, { display: 'block', width: '100%', height: '100%' });
    viewport.prepend(renderer.domElement);
    ambient = new THREE.HemisphereLight(0xffffff, 0x506174, 2.5);
    const key = new THREE.DirectionalLight(0xffffff, 2.7);
    const fill = new THREE.DirectionalLight(0xb9e4ff, 1.1);
    key.position.set(3, 5, -4); fill.position.set(-2, 1.5, 3);
    scene.add(ambient, key, fill);
    controls = new OrbitControls(camera, renderer.domElement);
    controls.enablePan = false;
    controls.enableZoom = false;
    controls.enableDamping = false;
    controls.minPolarAngle = Math.PI * .2;
    controls.maxPolarAngle = Math.PI * .65;
    controls.addEventListener('change', invalidate);
    Object.assign(renderer.domElement.style, { touchAction: 'pan-y', cursor: 'grab' });

    const manager = new THREE.LoadingManager();
    const failures = new Set();
    let resourcesComplete;
    const resourcePromise = new Promise((resolve) => { resourcesComplete = resolve; });
    manager.onLoad = resourcesComplete;
    manager.onError = (url) => failures.add(url);
    const loader = new URDFLoader(manager);
    loader.workingPath = urdfUrl.slice(0, urdfUrl.lastIndexOf('/') + 1);
    const defaultMesh = loader.loadMeshCb;
    loader.loadMeshCb = (path, loadingManager, material, complete) => {
      defaultMesh(path, loadingManager, material, (mesh, error) => {
        if (error || !mesh) failures.add(path);
        complete(mesh, error);
      });
    };
    // A sentinel also covers cached/synchronous geometry callbacks and the
    // no-mesh error case, while allowing all resources to finish before cleanup.
    manager.itemStart('g1-arm-assembly');
    let parseError;
    try { robot = loader.parse(documentSource); assembly.add(robot); }
    catch (error) { parseError = error; }
    manager.itemEnd('g1-arm-assembly');
    await resourcePromise;
    if (parseError) throw parseError;
    if (failures.size) throw new Error(`G1 mesh loading failed: ${[...failures].join(', ')}`);
    if (!robot.joints.left_elbow_joint || !robot.links.left_rubber_hand) throw new Error('G1 left arm is missing');
    robot.rotation.x = -Math.PI / 2;
    for (const [name, value] of Object.entries(g1ArmPose(0))) robot.setJointValue(name, value);

    const ghostMaterial = new THREE.MeshBasicMaterial({ color: 0x22b4b8, transparent: true, opacity: .22, depthWrite: false });
    materials.add(ghostMaterial);
    ghost = robot.clone(true);
    let meshCount = 0, ghostMeshCount = 0;
    ghost.traverse((object) => {
      if (!object.isMesh) return;
      meshCount += 1;
      let link = object.parent;
      while (link && !link.isURDFLink) link = link.parent;
      object.visible = /^left_(elbow_|wrist_|rubber_hand)/.test(link?.urdfName || link?.name || '');
      if (object.visible) ghostMeshCount += 1;
      object.material = ghostMaterial;
    });
    if (!meshCount || !ghostMeshCount) throw new Error('G1 visual meshes are missing');
    ghost.setJointValue('left_elbow_joint', 0);
    assembly.add(ghost);

    const makeMesh = (geometry, material, parent, x = 0, y = 0, z = 0) => {
      const mesh = new THREE.Mesh(geometry, material);
      mesh.position.set(x, y, z); parent.add(mesh); return mesh;
    };
    const trayMaterial = new THREE.MeshStandardMaterial({ color: 0x42566b, roughness: .6, metalness: .25 });
    const payloadMaterial = new THREE.MeshStandardMaterial({ color: 0xeab04b, roughness: .6 });
    payload = new THREE.Group();
    robot.links[G1_PAYLOAD_MOUNT.link].add(payload);
    makeMesh(new THREE.BoxGeometry(...G1_PAYLOAD_MOUNT.traySize), trayMaterial, payload, ...G1_PAYLOAD_MOUNT.trayCenter);
    makeMesh(new THREE.BoxGeometry(...G1_PAYLOAD_MOUNT.blockSize), payloadMaterial, payload, ...G1_PAYLOAD_MOUNT.blockCenter);
    makeMesh(new THREE.BoxGeometry(.02, .096, .087), trayMaterial, payload, ...G1_PAYLOAD_MOUNT.blockCenter);
    payload.visible = false;
    pushArrow = new THREE.ArrowHelper(new THREE.Vector3(0, -1, 0), new THREE.Vector3(), .14, 0xe4932e, .042, .03);
    pushArrow.visible = false; scene.add(pushArrow);

    const jointLabel = document.createElement('span');
    jointLabel.textContent = '左肘';
    jointLabel.setAttribute('aria-hidden', 'true');
    jointLabel.className = 'g1-arm-joint-label';
    Object.assign(jointLabel.style, { position: 'absolute', pointerEvents: 'none', transform: 'translate(-50%, -100%)',
      padding: '3px 7px', borderRadius: '5px', fontSize: '12px', lineHeight: '1.4', whiteSpace: 'nowrap', zIndex: '1' });
    viewport.append(jointLabel); elements.push(jointLabel);

    // Fit the hanging arm and horizontal target once. Actions do not move the
    // camera, making small disturbances easy to compare.
    assembly.updateMatrixWorld(true);
    const bounds = new THREE.Box3().setFromObject(assembly);
    const center = bounds.getCenter(new THREE.Vector3());
    const size = bounds.getSize(new THREE.Vector3());
    center.z -= .04;
    let distance = 1.7;
    const handPosition = new THREE.Vector3(), elbowPosition = new THREE.Vector3(), projected = new THREE.Vector3();
    const resetCamera = () => {
      if (disposed) return;
      camera.position.copy(center).addScaledVector(new THREE.Vector3(.8, .18, -1.4).normalize(), distance);
      controls.target.copy(center); controls.update(); invalidate();
    };
    const resize = () => {
      if (disposed) return;
      const width = Math.max(viewport.clientWidth, 1), height = Math.max(viewport.clientHeight, 1);
      camera.aspect = width / height;
      camera.updateProjectionMatrix();
      renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
      renderer.setSize(width, height, false);
      const oldDistance = distance;
      distance = Math.max(size.y, Math.max(size.x, size.z) / camera.aspect) / (2 * Math.tan(camera.fov * Math.PI / 360)) * 1.23;
      camera.position.sub(controls.target).multiplyScalar(distance / oldDistance).add(controls.target);
      invalidate();
    };
    const updateTheme = () => {
      const dark = document.documentElement.dataset.theme === 'dark';
      ambient.intensity = dark ? 2.8 : 2.5;
      jointLabel.style.background = dark ? 'rgba(24, 38, 50, .88)' : 'rgba(244, 249, 251, .94)';
      jointLabel.style.color = dark ? '#b0e8ed' : '#236a76';
      invalidate();
    };
    const update = ({ angle = 0, target = 0, payload: loaded = false, pushing = false } = {}) => {
      if (disposed) return;
      robot.setJointValue('left_elbow_joint', g1ElbowAngle(angle));
      ghost.setJointValue('left_elbow_joint', g1ElbowAngle(target));
      ghost.visible = target > 0 && Math.abs(target - angle) > .006;
      payload.visible = loaded;
      robot.updateMatrixWorld(true);
      pushArrow.visible = pushing;
      if (pushArrow.visible) {
        robot.links.left_rubber_hand.getWorldPosition(handPosition);
        pushArrow.position.copy(handPosition).add(new THREE.Vector3(.035, .23, 0));
      }
      viewport.dataset.elbowAngle = String(g1ElbowAngle(angle));
      viewport.dataset.payload = String(payload.visible);
    };
    const render = () => {
      if (disposed) return;
      controls.update(); scene.updateMatrixWorld(true); camera.updateMatrixWorld();
      renderer.render(scene, camera);
      robot.joints.left_elbow_joint.getWorldPosition(elbowPosition);
      projected.copy(elbowPosition).project(camera);
      jointLabel.style.visibility = Math.abs(projected.x) < .92 && Math.abs(projected.y) < .92 && Math.abs(projected.z) < 1 ? 'visible' : 'hidden';
      jointLabel.style.left = `${(projected.x + 1) * 50}%`;
      jointLabel.style.top = `calc(${(1 - projected.y) * 50}% - 24px)`;
      viewport.dataset.rendered = 'true';
      viewport.dataset.renderedTriangles = String(renderer.info.render.triangles);
    };
    viewport.dataset.model = 'g1_29dof_left_arm';
    viewport.dataset.meshCount = String(meshCount);
    resizeObserver = new ResizeObserver(resize); resizeObserver.observe(viewport);
    themeObserver = new MutationObserver(updateTheme);
    themeObserver.observe(document.documentElement, { attributes: true, attributeFilter: ['data-theme'] });
    updateTheme(); resize(); resetCamera();
    update({ angle: 0, target: 0 });
    return { update, render, resetCamera, dispose };
  } catch (error) {
    dispose(); onError?.(error); throw error;
  }
}
