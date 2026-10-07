/** G1 geometry for the servo/deadline/safety lessons; controller parameters stay
 * in the lesson models. Angles here mean forearm travel from hanging downward.
 * The official URDF elbow coordinate is therefore π/2 - lessonAngle. */
export const g1ElbowAngle = (angle) => Math.PI / 2 - angle;
export const g1ArmPose = (angle) => ({
  left_shoulder_roll_joint: 12 * Math.PI / 180,
  left_elbow_joint: g1ElbowAngle(angle),
});
export const G1_SAFETY_ARM_RANGE = Object.freeze({
  initialAngle: 20 * Math.PI / 180,
  targetAngle: 80 * Math.PI / 180,
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

const armLink = (name) => /^left_(shoulder_|elbow_|wrist_|rubber_hand)/.test(name);
const visibleLink = (name, armOnly) => armLink(name)
  || (!armOnly && ['torso_link', 'logo_link', 'head_link', 'waist_support_link'].includes(name));

export async function createG1ArmView(viewport, { urdfUrl, profile = 'servo', onInvalidate = () => {}, onError } = {}) {
  const deadline = profile === 'deadline';
  const safety = profile === 'safety';
  const armOnly = deadline || safety;
  const initialAngle = deadline ? Math.PI / 3 : safety ? G1_SAFETY_ARM_RANGE.initialAngle : 0;
  let renderer, scene, camera, controls, robot, ghost, resizeObserver, themeObserver;
  let payload, pushArrow, ambient, statusRing;
  let safetyStatus = 'ready';
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
    for (const key of ['model', 'meshCount', 'rendered', 'renderedTriangles', 'elbowAngle', 'payload', 'viewProfile', 'armStatus', 'targetVisible']) {
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
      if (!visibleLink(link.getAttribute('name') || '', armOnly)) {
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
    for (const [name, value] of Object.entries(g1ArmPose(initialAngle))) robot.setJointValue(name, value);

    let meshCount = 0;
    robot.traverse((object) => { if (object.isMesh) meshCount += 1; });
    if (!meshCount) throw new Error('G1 visual meshes are missing');
    if (!deadline) {
      const ghostMaterial = new THREE.MeshBasicMaterial({ color: safety ? 0x90a7b8 : 0x22b4b8,
        transparent: true, opacity: safety ? .2 : .22, depthWrite: false });
      materials.add(ghostMaterial);
      ghost = robot.clone(true);
      let ghostMeshCount = 0;
      ghost.traverse((object) => {
        if (!object.isMesh) return;
        let link = object.parent;
        while (link && !link.isURDFLink) link = link.parent;
        object.visible = /^left_(elbow_|wrist_|rubber_hand)/.test(link?.urdfName || link?.name || '');
        if (object.visible) ghostMeshCount += 1;
        object.material = ghostMaterial;
      });
      if (!ghostMeshCount) throw new Error('G1 visual meshes are missing');
      ghost.setJointValue('left_elbow_joint', safety ? g1ElbowAngle(G1_SAFETY_ARM_RANGE.targetAngle) : 0);
      assembly.add(ghost);
    }

    const makeMesh = (geometry, material, parent, x = 0, y = 0, z = 0) => {
      const mesh = new THREE.Mesh(geometry, material);
      mesh.position.set(x, y, z); parent.add(mesh); return mesh;
    };
    if (!armOnly) {
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
    }
    const safetyStates = {
      normal: { color: 0x25a877, label: '左肘 · 运行' },
      limited: { color: 0xe8a327, label: '左肘 · 限速' },
      fault: { color: 0xe85859, label: '左肘 · 保护' },
      ready: { color: 0x25a877, label: '左肘 · 待命' },
    };
    if (safety) {
      // A separate, camera-facing marker conveys status without recoloring the
      // official G1 parts or implying that a mechanical brake has engaged.
      const ringMaterial = new THREE.MeshBasicMaterial({ color: safetyStates.ready.color,
        transparent: true, opacity: .9, depthTest: false, depthWrite: false });
      statusRing = makeMesh(new THREE.TorusGeometry(.057, .004, 8, 48), ringMaterial, scene);
      statusRing.renderOrder = 2;
    }

    const jointLabel = document.createElement('span');
    jointLabel.textContent = '左肘';
    jointLabel.setAttribute('aria-hidden', 'true');
    jointLabel.className = 'g1-arm-joint-label';
    Object.assign(jointLabel.style, { position: 'absolute', pointerEvents: 'none', transform: 'translate(-50%, -100%)',
      padding: '3px 7px', borderRadius: '5px', fontSize: '12px', lineHeight: '1.4', whiteSpace: 'nowrap', zIndex: '1' });
    viewport.append(jointLabel); elements.push(jointLabel);

    // Servo fits its hanging and horizontal poses; deadline fits one fixed
    // pose. Safety fits the entire real URDF sweep before fixing the camera.
    assembly.updateMatrixWorld(true);
    const bounds = new THREE.Box3().setFromObject(assembly);
    if (safety) {
      bounds.makeEmpty();
      for (let step = 0; step <= 30; step += 1) {
        const angle = initialAngle + (G1_SAFETY_ARM_RANGE.targetAngle - initialAngle) * step / 30;
        robot.setJointValue('left_elbow_joint', g1ElbowAngle(angle));
        robot.updateMatrixWorld(true);
        bounds.union(new THREE.Box3().setFromObject(robot));
      }
      robot.setJointValue('left_elbow_joint', g1ElbowAngle(initialAngle));
      robot.updateMatrixWorld(true);
      // Also leave room for the joint marker, beyond the physical mesh bounds.
      const pivot = robot.joints.left_elbow_joint.getWorldPosition(new THREE.Vector3());
      bounds.union(new THREE.Box3().setFromCenterAndSize(pivot, new THREE.Vector3(.13, .13, .13)));
    }
    const center = bounds.getCenter(new THREE.Vector3());
    const size = bounds.getSize(new THREE.Vector3());
    const safetyRadius = safety ? bounds.getBoundingSphere(new THREE.Sphere()).radius : 0;
    if (!armOnly) center.z -= .04;
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
      if (safety) {
        // A sphere fit stays valid after orbiting and on a 300 px portrait view.
        const halfVertical = camera.fov * Math.PI / 360;
        const halfHorizontal = Math.atan(Math.tan(halfVertical) * camera.aspect);
        distance = safetyRadius / Math.sin(Math.min(halfVertical, halfHorizontal)) * 1.12;
      } else {
        distance = Math.max(size.y, Math.max(size.x, size.z) / camera.aspect) / (2 * Math.tan(camera.fov * Math.PI / 360)) * 1.23;
      }
      camera.position.sub(controls.target).multiplyScalar(distance / oldDistance).add(controls.target);
      invalidate();
    };
    const updateTheme = () => {
      const dark = document.documentElement.dataset.theme === 'dark';
      ambient.intensity = dark ? 2.8 : 2.5;
      jointLabel.style.background = dark ? 'rgba(24, 38, 50, .88)' : 'rgba(244, 249, 251, .94)';
      jointLabel.style.color = safety ? (dark ? '#e8f1f7' : '#263e4e') : (dark ? '#b0e8ed' : '#236a76');
      invalidate();
    };
    const update = ({ angle = initialAngle, target = safety ? G1_SAFETY_ARM_RANGE.targetAngle : 0,
      payload: loaded = false, pushing = false, status = safetyStatus, showTarget = true } = {}) => {
      if (disposed) return;
      if (deadline) {
        viewport.dataset.elbowAngle = String(g1ElbowAngle(initialAngle));
        viewport.dataset.payload = 'false';
        return;
      }
      robot.setJointValue('left_elbow_joint', g1ElbowAngle(angle));
      ghost.setJointValue('left_elbow_joint', g1ElbowAngle(target));
      ghost.visible = showTarget && target > 0 && Math.abs(target - angle) > .006;
      if (payload) payload.visible = loaded;
      robot.updateMatrixWorld(true);
      if (pushArrow) pushArrow.visible = pushing;
      if (pushArrow?.visible) {
        robot.links.left_rubber_hand.getWorldPosition(handPosition);
        pushArrow.position.copy(handPosition).add(new THREE.Vector3(.035, .23, 0));
      }
      if (safety) {
        safetyStatus = Object.hasOwn(safetyStates, status) ? status : 'ready';
        statusRing.material.color.setHex(safetyStates[safetyStatus].color);
        jointLabel.textContent = safetyStates[safetyStatus].label;
        viewport.dataset.armStatus = safetyStatus;
        viewport.dataset.targetVisible = String(ghost.visible);
      }
      viewport.dataset.elbowAngle = String(g1ElbowAngle(angle));
      viewport.dataset.payload = String(payload?.visible ?? false);
    };
    const render = () => {
      if (disposed) return;
      controls.update(); scene.updateMatrixWorld(true); camera.updateMatrixWorld();
      robot.joints.left_elbow_joint.getWorldPosition(elbowPosition);
      if (statusRing) {
        statusRing.position.copy(elbowPosition);
        statusRing.quaternion.copy(camera.quaternion);
      }
      renderer.render(scene, camera);
      projected.copy(elbowPosition).project(camera);
      jointLabel.style.visibility = Math.abs(projected.x) < .92 && Math.abs(projected.y) < .92 && Math.abs(projected.z) < 1 ? 'visible' : 'hidden';
      if (armOnly) {
        // Keep the small label beside the joint, leaving the cropped arm clear.
        const width = Math.max(viewport.clientWidth, 1), height = Math.max(viewport.clientHeight, 1);
        const labelMargin = safety ? 55 : 26;
        const x = Math.min(width - labelMargin, Math.max(labelMargin, (projected.x + 1) * width / 2 - (safety ? 64 : 38)));
        const y = Math.min(height - 14, Math.max(14, (1 - projected.y) * height / 2));
        jointLabel.style.left = `${x}px`;
        jointLabel.style.top = `${y}px`;
        jointLabel.style.transform = 'translate(-50%, -50%)';
      } else {
        jointLabel.style.left = `${(projected.x + 1) * 50}%`;
        jointLabel.style.top = `calc(${(1 - projected.y) * 50}% - 24px)`;
      }
      viewport.dataset.rendered = 'true';
      viewport.dataset.renderedTriangles = String(renderer.info.render.triangles);
    };
    viewport.dataset.model = 'g1_29dof_left_arm';
    viewport.dataset.meshCount = String(meshCount);
    viewport.dataset.viewProfile = profile;
    resizeObserver = new ResizeObserver(resize); resizeObserver.observe(viewport);
    themeObserver = new MutationObserver(updateTheme);
    themeObserver.observe(document.documentElement, { attributes: true, attributeFilter: ['data-theme'] });
    updateTheme(); resize(); resetCamera();
    update({ angle: initialAngle, target: safety ? G1_SAFETY_ARM_RANGE.targetAngle : 0 });
    return { update, render, resetCamera, dispose };
  } catch (error) {
    dispose(); onError?.(error); throw error;
  }
}
