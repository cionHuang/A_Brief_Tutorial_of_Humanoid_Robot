import {pixelToBody,loopFrame,routePoint} from './perception-lessons.js';

/** Fixed views: G1 supplies the sensor/body reference and a moving localization reference. */
export async function createG1PerceptionView(viewport,kind,urdfUrl){
 const [T,{default:Loader}]=await Promise.all([import('three'),import('urdf-loader')]);
 const response=await fetch(urdfUrl);if(!response.ok)throw Error('G1 unavailable');
 const manager=new T.LoadingManager();let done;const ready=new Promise(r=>done=r),failures=[];
 manager.onLoad=done;manager.onError=u=>failures.push(u);
 const loader=new Loader(manager);loader.workingPath=urdfUrl.slice(0,urdfUrl.lastIndexOf('/')+1);
 const meshLoads=[];const originalLoad=loader.loadMeshCb;loader.loadMeshCb=(path,manager,material,complete)=>{meshLoads.push(new Promise((resolve,reject)=>originalLoad(path,manager,material,(obj,error)=>{complete(obj,error);if(error)reject(error);else resolve(obj);})));};
 manager.itemStart('model');let robot;try{robot=loader.parse(await response.text());}finally{manager.itemEnd('model');}await ready;await Promise.all(meshLoads);if(failures.length)throw Error('G1 meshes unavailable');
 const scene=new T.Scene(),camera=new T.PerspectiveCamera(kind==='target'?34:38,1,.01,40);
 camera.up.set(0,0,1);
 const renderer=new T.WebGLRenderer({antialias:true,alpha:true});renderer.setClearColor(0,0);renderer.outputColorSpace=T.SRGBColorSpace;
 Object.assign(renderer.domElement.style,{display:'block',width:'100%',height:'100%'});renderer.domElement.setAttribute('aria-hidden','true');viewport.prepend(renderer.domElement);
 scene.add(new T.HemisphereLight(0xffffff,0x738399,2.7));const light=new T.DirectionalLight(0xffffff,3);light.position.set(3,-4,6);scene.add(light);
 robot.setJointValue('left_shoulder_roll_joint',.12);robot.setJointValue('right_shoulder_roll_joint',-.12);robot.setJointValue('left_elbow_joint',.3);robot.setJointValue('right_elbow_joint',.3);
 robot.updateMatrixWorld(true);const floor=new T.Box3().setFromObject(robot).min.z;if(!Number.isFinite(floor))throw Error(`G1 geometry missing: children ${robot.children.length}, joints ${Object.keys(robot.joints).length}, floor ${floor}`);robot.position.z=-floor;scene.add(robot);
 const mesh=(geometry,color,parent=scene)=>{const o=new T.Mesh(geometry,new T.MeshStandardMaterial({color,roughness:.75}));parent.add(o);return o;};
 const line=(points,color,dashed=false)=>{const o=new T.Line(new T.BufferGeometry().setFromPoints(points.map(p=>new T.Vector3(...p))),dashed?new T.LineDashedMaterial({color,dashSize:.06,gapSize:.04}):new T.LineBasicMaterial({color}));if(dashed)o.computeLineDistances();scene.add(o);return o;};
 const label=(name,pos)=>{const el=document.createElement('span');el.className='g1-perception-label';el.textContent=name;viewport.append(el);return {el,pos:new T.Vector3(...pos)};};
 const labels=[];let ray,axes,ghost,path,closure,marker;
 const ground=mesh(new T.PlaneGeometry(kind==='target'?2.6:5,kind==='target'?1.4:4),0xe8edf2);ground.position.set(kind==='target'?.45:0,0,-.014);ground.material.transparent=true;ground.material.opacity=.4;
 if(kind==='target'){
  const origin=[0,0,-floor],sensor=[.1,0,-floor+.5],target=pixelToBody().body.map((v,i)=>v+(i===2?-floor:0));
  const cam=mesh(new T.BoxGeometry(.055,.07,.045),0x299b7a);cam.position.set(...sensor);
  const tableZ=target[2]-.14,table=mesh(new T.BoxGeometry(.6,.55,.035),0xb5c4cf);table.position.set(target[0]+.04,0,tableZ);
  for(const y of [-.22,.22]){const leg=mesh(new T.BoxGeometry(.035,.035,tableZ),0x91a0ac);leg.position.set(target[0]+.2,y,tableZ/2);}
  const cup=mesh(new T.CylinderGeometry(.055,.05,.16,32,1,true),0xc7655b);cup.rotation.x=Math.PI/2;cup.position.set(target[0]+.055,target[1],tableZ+.098);cup.material.side=T.DoubleSide;
  marker=mesh(new T.SphereGeometry(.012,16,12),0x299b7a);marker.position.set(...target);
  ray=line([sensor,target],0x299b7a,true);axes=new T.Group();scene.add(axes);
  [[1,0,0,0xd66b52],[0,1,0,0x299b7a],[0,0,1,0x8670d8]].forEach(([x,y,z,c])=>axes.add(new T.ArrowHelper(new T.Vector3(x,y,z),new T.Vector3(...origin),.32,c,.05,.025)));
  axes.traverse(o=>{if(o.material){o.material.depthTest=false;o.renderOrder=8;}});
  labels.push(label('头部相机',sensor.map((v,i)=>v+(i===2?.12:0))),label('身体原点 · 骨盆',[-.2,-.25,-floor-.22]),label('杯子表面点',[target[0],target[1],target[2]+.14]));
  camera.position.set(2.5,-4,2);camera.lookAt(.43,0,.8);
 }else{
  const map=p=>[(p[0]-182.5)/65,(122.5-p[1])/65,.012];
  robot.scale.setScalar(.85);robot.position.z=-floor*.85;
  ghost=robot.clone(true);ghost.traverse(o=>{if(o.isMesh)o.material=new T.MeshBasicMaterial({color:0x8670d8,transparent:true,opacity:.35,depthWrite:false});});scene.add(ghost);
  const table=mesh(new T.BoxGeometry(1.35,.6,.07),0xb5c4cf);table.position.z=.45;for(const x of [-.55,.55])for(const y of [-.22,.22]){const leg=mesh(new T.BoxGeometry(.04,.04,.43),0x91a0ac);leg.position.set(x,y,.215);}
  line([0,.25,.5,.75,1].map(u=>map(routePoint(u))),0x8c969e,true);
  path=line([[0,0,.02],[0,0,.02]],0x8670d8);closure=line([map([80,180]),map([115,138])],0x299b7a,true);
  marker=mesh(new T.SphereGeometry(.045,16,12),0x299b7a);marker.position.set(...map([115,138]));marker.position.z=.5;
  labels.push(label('熟悉的桌角',[-.6,0,.6]));
  camera.position.set(3.7,-5.4,6.8);camera.lookAt(0,0,.15);
 }
 let state=0,disposed=false;
 function render(value=state){state=value;if(disposed)return;
  if(kind==='target'){ray.visible=value>=1;axes.visible=value===2;labels[1].el.hidden=value!==2;}
  else{const s=loopFrame(value),end=s.points.at(-1),p=s.actual,u=Math.min(.999999,value/8),a=routePoint(u),b=routePoint(Math.min(1,u+.001));const yaw=Math.atan2(a[1]-b[1],b[0]-a[0]);
   robot.position.x=(p[0]-182.5)/65;robot.position.y=(122.5-p[1])/65;robot.rotation.z=yaw;
   ghost.position.x=(end[0]-182.5)/65;ghost.position.y=(122.5-end[1])/65;ghost.rotation.z=yaw;
   path.geometry.setFromPoints(s.points.map(q=>new T.Vector3((q[0]-182.5)/65,(122.5-q[1])/65,.025)));
   closure.visible=s.phase>=1;closure.geometry.setFromPoints([new T.Vector3(robot.position.x,robot.position.y,.45),marker.position]);closure.computeLineDistances();
  }
  camera.updateMatrixWorld();renderer.render(scene,camera);for(const l of labels){const p=l.pos.clone().project(camera);l.el.style.left=`${(p.x+1)*viewport.clientWidth/2}px`;l.el.style.top=`${(1-p.y)*viewport.clientHeight/2}px`;}
  viewport.dataset.rendered='true';
 }
 const resize=new ResizeObserver(()=>{const w=viewport.clientWidth,h=viewport.clientHeight;renderer.setPixelRatio(Math.min(devicePixelRatio,1.5));renderer.setSize(w,h,false);camera.aspect=w/h;camera.zoom=kind==='target'?(w>420?1.45:1.15):(w>420?1.55:1.15);camera.updateProjectionMatrix();render();});resize.observe(viewport);
 const dispose=()=>{disposed=true;resize.disconnect();const geometries=new Set(),materials=new Set();scene.traverse(o=>{if(o.geometry)geometries.add(o.geometry);for(const m of Array.isArray(o.material)?o.material:[o.material])if(m)materials.add(m);});geometries.forEach(g=>g.dispose());materials.forEach(m=>m.dispose());renderer.dispose();renderer.domElement.remove();labels.forEach(l=>l.el.remove());};
 render();return {render,dispose};
}
