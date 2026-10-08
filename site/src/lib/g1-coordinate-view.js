import { composeLesson, lessonPose, transformPoint } from './robot-math-demo-model.js';

/** Renders the official G1 in a Z-up world. Pose changes never solve a gait. */
export async function createG1CoordinateView(viewport, {urdfUrl,onInvalidate=()=>{},onSample=()=>{}}) {
  const [THREE,{OrbitControls},{default:URDFLoader}]=await Promise.all([import('three'),import('three/examples/jsm/controls/OrbitControls.js'),import('urdf-loader')]);
  let disposed=false,robot,footLocal,resizeObserver,themeObserver,lastProfile='';
  const fetchAbort=new AbortController(),scene=new THREE.Scene(),camera=new THREE.PerspectiveCamera(33,1,.01,30);
  camera.up.set(0,0,1);
  const renderer=new THREE.WebGLRenderer({antialias:true,alpha:true});
  renderer.outputColorSpace=THREE.SRGBColorSpace;renderer.toneMapping=THREE.ACESFilmicToneMapping;
  renderer.setClearColor(0,0);renderer.domElement.setAttribute('aria-hidden','true');
  Object.assign(renderer.domElement.style,{width:'100%',height:'100%',display:'block',touchAction:'pan-y'});viewport.prepend(renderer.domElement);
  const controls=new OrbitControls(camera,renderer.domElement);controls.enablePan=false;controls.enableZoom=false;controls.enableDamping=false;
  controls.minPolarAngle=.2;controls.maxPolarAngle=Math.PI*.49;
  const invalidate=()=>{if(!disposed)onInvalidate();};controls.addEventListener('change',invalidate);
  const ambient=new THREE.HemisphereLight(0xffffff,0x6c7888,2.7),key=new THREE.DirectionalLight(0xffffff,3),fill=new THREE.DirectionalLight(0xbbddff,1.7);
  key.position.set(3,-4,6);fill.position.set(-3,2,3);scene.add(ambient,key,fill);
  const floor=new THREE.Mesh(new THREE.PlaneGeometry(2.5,2.5),new THREE.MeshStandardMaterial({color:0xe5eaf0,roughness:1,transparent:true,opacity:.35}));floor.position.z=-.012;scene.add(floor);
  const grid=new THREE.GridHelper(2.4,24,0x8297ad,0xb5c2d0);grid.rotation.x=Math.PI/2;grid.position.z=-.008;grid.material.transparent=true;grid.material.opacity=.3;scene.add(grid);
  const axisGroup=(length)=>{const g=new THREE.Group();[[1,0,0,0xd75b50],[0,1,0,0x299f78],[0,0,1,0x398ccd]].forEach(([x,y,z,color])=>g.add(new THREE.ArrowHelper(new THREE.Vector3(x,y,z),new THREE.Vector3(),length,color,.045,.02)));g.traverse(o=>{if(o.material){o.material.depthTest=false;o.renderOrder=5;}});scene.add(g);return g;};
  const worldAxes=axisGroup(.53),bodyAxes=axisGroup(.30);
  const point=new THREE.Mesh(new THREE.SphereGeometry(.018,16,10),new THREE.MeshBasicMaterial({color:0xe59a20,depthTest:false}));point.renderOrder=10;scene.add(point);
  const connector=new THREE.Line(new THREE.BufferGeometry().setFromPoints([new THREE.Vector3(),new THREE.Vector3()]),new THREE.LineDashedMaterial({color:0xe59a20,dashSize:.04,gapSize:.025,depthTest:false}));connector.renderOrder=9;scene.add(connector);
  const paths={};
  for(const [basis,color] of [['world',0x9864ce],['body',0x179c93]]){
    const group=new THREE.Group();scene.add(group);
    const line=new THREE.Line(new THREE.BufferGeometry(),new THREE.LineBasicMaterial({color,transparent:true}));group.add(line);
    const end=new THREE.Mesh(new THREE.RingGeometry(.018,.025,24),new THREE.MeshBasicMaterial({color,side:THREE.DoubleSide}));group.add(end);
    const arrow=new THREE.ArrowHelper(new THREE.Vector3(1,0,0),new THREE.Vector3(),.05,color,.03,.014);group.add(arrow);
    group.traverse(o=>{if(o.material){o.material.depthTest=false;o.renderOrder=6;}});
    paths[basis]={group,line,end,arrow};
  }
  const labels=[...viewport.querySelectorAll('[data-coordinate-label]')];
  function resetCamera(profile=lastProfile){
    if(profile==='goals'){controls.target.set(.32,.22,.3);camera.position.set(1.50,-.35,1.25);}
    else {controls.target.set(.22,.16,.62);camera.position.set(2.8,0,1.55);}
    controls.update();invalidate();
  }
  function cleanup(){
    resizeObserver?.disconnect();themeObserver?.disconnect();controls.removeEventListener('change',invalidate);controls.dispose();
    const geometries=new Set(),materials=new Set(),textures=new Set();scene.traverse(o=>{if(o.geometry)geometries.add(o.geometry);for(const m of Array.isArray(o.material)?o.material:[o.material])if(m)materials.add(m);});
    for(const m of materials){for(const t of Object.values(m))if(t?.isTexture)textures.add(t);m.dispose();}textures.forEach(t=>t.dispose());geometries.forEach(g=>g.dispose());scene.clear();renderer.dispose();renderer.domElement.remove();
  }
  function dispose(){disposed=true;fetchAbort.abort();cleanup();}
  function placeLabel(name,position,visible=true){const label=labels.find(el=>el.dataset.coordinateLabel===name);if(!label)return;label.hidden=!visible;if(!visible)return;
    const v=new THREE.Vector3(...position).project(camera),w=viewport.clientWidth,h=viewport.clientHeight;
    label.style.left=`${Math.max(45,Math.min(w-45,(v.x+1)*w/2))}px`;label.style.top=`${Math.max(18,Math.min(h-18,(1-v.y)*h/2))}px`;
  }
  let state={step:1,frame:'world',kind:'translate',amount:0,basis:'world',progress:0};
  function render(next=state){
    state=next;if(disposed||!robot)return;
    const pose=state.step===3?composeLesson(state.basis,state.kind,state.progress):lessonPose(state.step,state.kind,state.amount);
    robot.position.set(...pose.p);robot.rotation.set(0,0,pose.yaw);bodyAxes.position.copy(robot.position);bodyAxes.rotation.set(0,0,pose.yaw);
    const profile=state.step===3&&state.kind==='translate'?'goals':'full';if(profile!==lastProfile){lastProfile=profile;resetCamera(profile);}
    const foot=transformPoint(pose,footLocal);point.position.set(...foot);point.visible=state.step===1;
    connector.visible=state.step===1;const origin=state.frame==='world'?[0,0,0]:pose.p;
    connector.geometry.setFromPoints([new THREE.Vector3(...origin),new THREE.Vector3(...foot)]);connector.computeLineDistances();
    for(const [basis,path] of Object.entries(paths)){
      path.group.visible=state.step===3;
      if(state.step===3){const pts=Array.from({length:33},(_,i)=>{const t=composeLesson(basis,state.kind,i/32).p;return new THREE.Vector3(t[0],t[1],.006);});
        path.line.geometry.setFromPoints(pts);path.line.material.opacity=basis===state.basis?1:.3;
        const end=pts.at(-1);path.end.position.copy(end);
        // A body-frame pure rotation leaves the origin fixed; show a circular cue.
        if(state.kind==='rotate'&&basis==='body'){
          const p=lessonPose().p,arc=Array.from({length:33},(_,i)=>{const a=i/32*Math.PI/2;return new THREE.Vector3(p[0]+.09*Math.cos(a),p[1]+.09*Math.sin(a),.008);});
          path.line.geometry.setFromPoints(arc);const dir=arc.at(-1).clone().sub(arc.at(-2)).normalize();path.arrow.position.copy(arc.at(-1).clone().addScaledVector(dir,-.035));path.arrow.setDirection(dir);
        }else {const dir=end.clone().sub(pts.at(-2)).normalize();path.arrow.position.copy(end.clone().addScaledVector(dir,-.035));path.arrow.setDirection(dir);}
        path.arrow.setLength(.035,.026,.012);
      }
    }
    const opacity=(g,value)=>g.traverse(o=>{for(const m of Array.isArray(o.material)?o.material:[o.material])if(m){m.transparent=true;m.opacity=value;}});
    opacity(worldAxes,state.step!==1||state.frame==='world'?1:.3);opacity(bodyAxes,state.step!==1||state.frame==='body'?1:.3);
    controls.update();scene.updateMatrixWorld(true);camera.updateMatrixWorld();renderer.render(scene,camera);
    placeLabel('world',[0,0,.02]);placeLabel('body',pose.p);placeLabel('point',foot,state.step===1);
    viewport.dataset.model='g1_29dof';viewport.dataset.rendered='true';viewport.dataset.step=String(state.step);
    viewport.dataset.pose=JSON.stringify({p:pose.p,yaw:pose.yaw});viewport.dataset.footWorld=JSON.stringify(foot);viewport.dataset.footBody=JSON.stringify(footLocal);
    onSample({pose,footWorld:foot,footBody:footLocal});
  }
  try{
    const response=await fetch(urdfUrl,{cache:'force-cache',signal:fetchAbort.signal});if(!response.ok)throw new Error(`G1 URDF ${response.status}`);
    const xml=new DOMParser().parseFromString(await response.text(),'application/xml');if(disposed)throw new Error('disposed');if(xml.querySelector('parsererror'))throw new Error('Invalid G1 model');
    const manager=new THREE.LoadingManager(),failures=[];let done;const loaded=new Promise(resolve=>done=resolve);manager.onLoad=done;manager.onError=url=>failures.push(url);
    const loader=new URDFLoader(manager);loader.workingPath=urdfUrl.slice(0,urdfUrl.lastIndexOf('/')+1);
    manager.itemStart('coordinate-model');let parseError;try{robot=loader.parse(xml);scene.add(robot);}catch(e){parseError=e;}manager.itemEnd('coordinate-model');await loaded;
    if(parseError)throw parseError;if(disposed)throw new Error('disposed');if(failures.length)throw new Error('G1 mesh loading failed');
    if(!robot.links.left_ankle_roll_link)throw new Error('G1 foot is missing');
    robot.setJointValue('left_shoulder_roll_joint',.16);robot.setJointValue('right_shoulder_roll_joint',-.16);robot.setJointValue('left_elbow_joint',Math.PI/2);robot.setJointValue('right_elbow_joint',Math.PI/2);
    scene.updateMatrixWorld(true);const selected=robot.links.left_ankle_roll_link.localToWorld(new THREE.Vector3(.06,0,-.025));footLocal=robot.worldToLocal(selected).toArray();
    let meshes=0;robot.traverse(o=>{if(o.isMesh)meshes++;});if(!meshes)throw new Error('G1 mesh is missing');viewport.dataset.meshCount=String(meshes);
    const resize=()=>{if(disposed)return;const w=viewport.clientWidth,h=viewport.clientHeight;if(!w||!h)return;renderer.setPixelRatio(Math.min(devicePixelRatio||1,1.7));renderer.setSize(w,h,false);camera.aspect=w/h;camera.updateProjectionMatrix();invalidate();};
    resizeObserver=new ResizeObserver(resize);resizeObserver.observe(viewport);
    const theme=()=>{const dark=document.documentElement.dataset.theme==='dark';floor.material.color.set(dark?0x27384d:0xe5eaf0);ambient.intensity=dark?2.2:2.7;invalidate();};
    themeObserver=new MutationObserver(theme);themeObserver.observe(document.documentElement,{attributes:true,attributeFilter:['data-theme']});resize();theme();render();
    return {render,dispose,resetCamera:()=>resetCamera(lastProfile)};
  }catch(error){cleanup();throw error;}
}
