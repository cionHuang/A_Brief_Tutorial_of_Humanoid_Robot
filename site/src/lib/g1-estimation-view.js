/** Fixed-camera G1 pose comparison. All panels share one loaded URDF and mesh geometry. */
export async function createG1EstimationView(root, urdfUrl) {
  const [THREE, {default: URDFLoader}] = await Promise.all([import('three'), import('urdf-loader')]);
  const response = await fetch(urdfUrl);
  if (!response.ok) throw new Error('G1 model unavailable');
  const manager = new THREE.LoadingManager();
  let finish;
  const ready = new Promise(resolve => { finish = resolve; });
  const failures = [];
  manager.onLoad = finish;
  manager.onError = url => failures.push(url);
  const loader = new URDFLoader(manager);
  loader.workingPath = urdfUrl.slice(0, urdfUrl.lastIndexOf('/') + 1);
  manager.itemStart('g1-estimation');
  let model;
  try { model = loader.parse(await response.text()); }
  finally { manager.itemEnd('g1-estimation'); }
  await ready;
  if (failures.length) throw new Error('G1 mesh unavailable');
  model.updateMatrixWorld(true);
  const bounds = new THREE.Box3().setFromObject(model);
  const floorZ = bounds.min.z;
  const height = bounds.max.z - floorZ;
  const panels = [];
  let state = {truth: 0, gyro: 0, acc: 0, fuse: 0};
  let disposed = false;
  const materials = new Set(), geometries = new Set();
  model.traverse(o => { if(o.geometry) geometries.add(o.geometry); if(o.material) (Array.isArray(o.material)?o.material:[o.material]).forEach(m=>materials.add(m)); });
  function render(next = state) {
    state = next;
    if (disposed) return;
    panels.forEach(({viewport, renderer, scene, camera, estimate, reference}) => {
      estimate.rotation.y = THREE.MathUtils.degToRad(state[viewport.dataset.cfModel]);
      reference.rotation.y = THREE.MathUtils.degToRad(state.truth);
      renderer.render(scene, camera);
    });
  }
  function dispose() {
    disposed = true;
    resize.disconnect(); theme.disconnect();
    panels.forEach(p=>{ p.renderer.dispose(); p.renderer.domElement.remove(); });
    materials.forEach(m=>m.dispose()); geometries.forEach(g=>g.dispose());
  }
  const resize = new ResizeObserver(() => {
    panels.forEach(({viewport, renderer, camera}) => {
      const w = viewport.clientWidth, h = viewport.clientHeight;
      if (!w || !h) return;
      renderer.setPixelRatio(Math.min(devicePixelRatio, 1.5)); renderer.setSize(w,h,false);
      const aspect = w/h, half = height * .66;
      camera.left = -half*aspect; camera.right = half*aspect;
      camera.top = half; camera.bottom = -half; camera.updateProjectionMatrix();
    });
    render();
  });
  const theme = new MutationObserver(() => {
    const color = document.documentElement.dataset.theme === 'dark' ? 0xdce5ef : 0x526172;
    panels.forEach(p=>p.outlineMaterial.color.setHex(color)); render();
  });
  try {
    for (const viewport of root.querySelectorAll('[data-cf-model]')) {
      const renderer = new THREE.WebGLRenderer({antialias:true,alpha:true});
      renderer.setClearColor(0,0);
      renderer.outputColorSpace = THREE.SRGBColorSpace;
      renderer.domElement.setAttribute('aria-hidden','true');
      Object.assign(renderer.domElement.style,{width:'100%',height:'100%',display:'block'});
      viewport.prepend(renderer.domElement);
      const scene = new THREE.Scene();
      scene.add(new THREE.HemisphereLight(0xffffff,0x667788,2.6));
      const light = new THREE.DirectionalLight(0xffffff,3); light.position.set(3,-4,5); scene.add(light);
      const camera = new THREE.OrthographicCamera(-1,1,1,-1,.01,20);
      camera.up.set(0,0,1); camera.position.set(2,-4,height*.9); camera.lookAt(.12,0,height*.53);
      const estimate = new THREE.Group(), reference = new THREE.Group();
      const copy = model.clone(true); copy.position.z -= floorZ;
      const color = getComputedStyle(viewport.closest('.cf-card')).getPropertyValue('--cf-color').trim();
      copy.traverse(o=>{
        if (!o.isMesh) return;
        const wasArray = Array.isArray(o.material);
        const tinted = (wasArray?o.material:[o.material]).map(original=>{
          const m = original.clone(); m.color.lerp(new THREE.Color(color),.38); materials.add(m); return m;
        });
        o.material = wasArray ? tinted : tinted[0];
      });
      estimate.add(copy); scene.add(estimate,reference);
      const outlineMaterial = new THREE.LineDashedMaterial({color:document.documentElement.dataset.theme === 'dark'?0xdce5ef:0x526172,dashSize:.025,gapSize:.016,transparent:true,opacity:.42,depthTest:false});
      materials.add(outlineMaterial);
      // Edges use the neutral model's world transforms, then rotate together about the floor.
      model.traverse(o=>{
        if (!o.isMesh) return;
        const geometry = new THREE.EdgesGeometry(o.geometry,35); geometries.add(geometry);
        geometry.applyMatrix4(o.matrixWorld); geometry.translate(0,0,-floorZ);
        const edges = new THREE.LineSegments(geometry,outlineMaterial); edges.computeLineDistances(); edges.renderOrder=2; reference.add(edges);
      });
      panels.push({viewport,renderer,scene,camera,estimate,reference,outlineMaterial});
      resize.observe(viewport);
      viewport.dataset.loaded='true';
    }
    theme.observe(document.documentElement,{attributes:true,attributeFilter:['data-theme']});
    render();
    return {render,dispose};
  } catch(error) { dispose(); throw error; }
}
