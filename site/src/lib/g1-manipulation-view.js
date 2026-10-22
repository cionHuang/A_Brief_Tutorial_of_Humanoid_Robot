import * as T from 'three';
import {joints,fingerPose,GRIP_CENTER,GRIP_ANGLE,BOX_HANDLES,boxTransform,createBoxMotion,sampleArm,graspState,clamp} from './manipulation-lessons.js';

export async function createManipulationView(viewport,{urdfUrl,kind}){
 const {default:Loader}=await import('urdf-loader');
 const response=await fetch(urdfUrl);if(!response.ok)throw Error('G1 hand model unavailable');
 const xml=new DOMParser().parseFromString(await response.text(),'application/xml');
 for(const link of xml.querySelectorAll('robot > link')){
  const n=link.getAttribute('name')||'';
  const show=kind==='grasp'?n.startsWith('left_hand_'):/^(left_(shoulder|elbow|wrist|hand)|right_(shoulder|elbow|wrist|hand)|torso|head|logo|waist_support)/.test(n);
  if(!show)for(const v of link.querySelectorAll(':scope > visual'))v.remove();
 }
 const loader=new Loader(),loads=[];loader.workingPath=urdfUrl.slice(0,urdfUrl.lastIndexOf('/')+1);
 const original=loader.loadMeshCb;loader.loadMeshCb=(path,manager,material,done)=>loads.push(new Promise((resolve,reject)=>original(path,manager,material,(obj,error)=>{done(obj,error);error?reject(error):resolve(obj);})));
 const robot=loader.parse(xml);await Promise.all(loads);robot.updateMatrixWorld(true);
 const originLink=robot.links[kind==='grasp'?'left_hand_palm_link':'torso_link'];
 const anchor=originLink.getWorldPosition(new T.Vector3());
 if(kind==='grasp'){
  robot.quaternion.copy(originLink.getWorldQuaternion(new T.Quaternion()).invert());
  robot.position.copy(anchor).applyQuaternion(robot.quaternion).negate();
 }else robot.position.copy(anchor).negate();
 const basePosition=robot.position.clone();
 const scene=new T.Scene();scene.add(robot,new T.HemisphereLight(0xffffff,0x718091,2.3));
 const light=new T.DirectionalLight(0xffffff,3);light.position.set(2,1,4);scene.add(light);
 const camera=new T.PerspectiveCamera(34,1,.001,20);camera.up.set(0,0,1);
 if(kind==='grasp'){camera.position.set(.28,-.40,.22);camera.lookAt(.065,-.025,.027);}else{camera.position.set(1.65,1.75,.95);camera.lookAt(.16,0,.15);}
 const renderer=new T.WebGLRenderer({alpha:true,antialias:true});renderer.setClearColor(0,0);renderer.outputColorSpace=T.SRGBColorSpace;renderer.setPixelRatio(Math.min(devicePixelRatio,1.5));
 Object.assign(renderer.domElement.style,{width:'100%',height:'100%',display:'block'});renderer.domElement.setAttribute('aria-hidden','true');viewport.prepend(renderer.domElement);
 function mesh(geometry,color,parent=scene){const m=new T.Mesh(geometry,new T.MeshStandardMaterial({color,roughness:.65}));parent.add(m);return m;}
 function line(color,dashed=false){const m=dashed?new T.LineDashedMaterial({color,dashSize:.012,gapSize:.009,depthTest:false}):new T.LineBasicMaterial({color,depthTest:false});const l=new T.Line(new T.BufferGeometry(),m);l.renderOrder=5;scene.add(l);return l;}
 function setLine(l,points){l.geometry.setFromPoints(points);if(l.computeLineDistances)l.computeLineDistances();}
 const labels=[];
 function label(text,p){const el=document.createElement('span');el.className='gm-label';el.textContent=text;viewport.append(el);const l={el,p:new T.Vector3(...p)};labels.push(l);return l;}
 function fingers(side,close){for(const [n,v]of Object.entries(fingerPose(side,close)))robot.setJointValue(n,v);}
 function arm(side,q){joints[side].filter(j=>j.axis&&!j.name.includes('_hand_')).forEach((j,i)=>robot.setJointValue(j.name,q[i]));}
 let block,table,motion,boxGroup,markers,routes,arrows,handLabel,objectLabel;
 if(kind==='grasp'){
  block=mesh(new T.BoxGeometry(.040,.016,.078),0xcc8b54);block.rotation.z=GRIP_ANGLE;
  table=mesh(new T.BoxGeometry(.21,.16,.008),0xa3b4be);table.position.set(.075,-.04,-.043);
  handLabel=label('G1 三指手',[.005,.018,.015]);objectLabel=label('小方块',[GRIP_CENTER[0],GRIP_CENTER[1],-.025]);
  arrows=[];const n=new T.Vector3(Math.sin(GRIP_ANGLE),-Math.cos(GRIP_ANGLE),0);
  // Opposing thumb / index+middle groups; blue arrow shows total vertical friction.
  for(const color of [0xd99725,0xd99725,0x219982,0x66778a]){const a=new T.ArrowHelper(new T.Vector3(0,0,1),new T.Vector3(),.04,color,.009,.005);a.line.material.depthTest=false;a.cone.material.depthTest=false;a.line.renderOrder=9;a.cone.renderOrder=9;scene.add(a);arrows.push(a);}
  arrows[0].setDirection(n);arrows[1].setDirection(n.clone().negate());
  arrows[3].setDirection(new T.Vector3(0,0,-1));
 }else{
  motion=createBoxMotion();boxGroup=new T.Group();scene.add(boxGroup);
  mesh(new T.BoxGeometry(.18,.25,.13),0xcc8b54,boxGroup);
  const tape=mesh(new T.BoxGeometry(.182,.035,.132),0xe6b77a,boxGroup);
  markers={};routes={};
  for(const side of ['left','right']){
   fingers(side,1);const sign=side==='left'?1:-1,color=side==='left'?0x328dcb:0x9c6cc4;
   const handle=mesh(new T.BoxGeometry(.040,.016,.078),0x435362,boxGroup);handle.position.set(...BOX_HANDLES[side]);handle.rotation.z=sign*GRIP_ANGLE;
   for(const z of [-.045,.045]){const bracket=mesh(new T.BoxGeometry(.025,.04,.012),0x435362,boxGroup);bracket.position.set(0,sign*.143,z);}
   const mark=mesh(new T.SphereGeometry(.010,14,10),color,boxGroup);mark.position.set(...BOX_HANDLES[side]);mark.material.depthTest=false;mark.renderOrder=8;markers[side]=mark;
   routes[side]=line(color,true);
  }
  handLabel=label('左手抓取点',[0,0,0]);objectLabel=label('右手抓取点',[0,0,0]);
 }
 let last=0,disposed=false;
 function render(time=last){last=time;if(disposed)return;
  if(kind==='grasp'){
   const s=graspState(time);fingers('left',s.closing);
   robot.position.copy(basePosition).add(new T.Vector3(-s.approach,0,s.handZ));
   block.position.set(GRIP_CENTER[0],GRIP_CENTER[1],s.objectZ);
   handLabel.p.set(.005-s.approach,.025,.025+s.handZ);objectLabel.p.copy(block.position).add(new T.Vector3(.038,-.038,0));
   const n=new T.Vector3(Math.sin(GRIP_ANGLE),-Math.cos(GRIP_ANGLE),0),c=block.position.clone();
   const contact=s.closing>.99&&(s.strong||s.handZ<.04);
   arrows.forEach(a=>a.visible=contact);
   const length=.018+.025*s.N/1.2;
   arrows[0].position.copy(c).addScaledVector(n,-.018-length);arrows[0].setLength(length,.008,.005);
   arrows[1].position.copy(c).addScaledVector(n,.018+length);arrows[1].setLength(length,.008,.005);
   arrows[2].position.copy(c).add(new T.Vector3(-.032,0,0));arrows[2].setLength(.05*s.support/s.weight,.009,.005);
   arrows[3].position.copy(c).add(new T.Vector3(.032,0,0));arrows[3].setLength(.05,.009,.005);
   viewport.dataset.gripCase=s.strong?'firm':'loose';viewport.dataset.lift=String(s.objectZ);
  }else{
   for(const side of ['left','right'])arm(side,sampleArm(motion[side],time));
   boxGroup.matrixAutoUpdate=false;boxGroup.matrix.copy(boxTransform(time));boxGroup.updateMatrixWorld(true);
   const samples=Array.from({length:Math.floor(time*10)+1},(_,i)=>i/10);samples.push(time);
   for(const side of ['left','right'])setLine(routes[side],samples.map(t=>new T.Vector3(...BOX_HANDLES[side]).applyMatrix4(boxTransform(t))));
   handLabel.p.copy(markers.left.getWorldPosition(new T.Vector3())).add(new T.Vector3(0,.06,.07));
   objectLabel.p.copy(markers.right.getWorldPosition(new T.Vector3())).add(new T.Vector3(0,-.06,.07));
   robot.updateMatrixWorld(true);
   const errors=['left','right'].map(side=>{
    const grip=side==='left'?GRIP_CENTER:[GRIP_CENTER[0],-GRIP_CENTER[1],0];
    return new T.Vector3(...grip).applyMatrix4(robot.links[side+'_hand_palm_link'].matrixWorld).distanceTo(markers[side].getWorldPosition(new T.Vector3()));
   });viewport.dataset.contactError=String(Math.max(...errors));
  }
  robot.updateMatrixWorld(true);camera.updateMatrixWorld();renderer.render(scene,camera);
  for(const l of labels){const v=l.p.clone().project(camera);l.el.style.left=`${clamp((v.x+1)*viewport.clientWidth/2,46,viewport.clientWidth-46)}px`;l.el.style.top=`${clamp((1-v.y)*viewport.clientHeight/2,16,viewport.clientHeight-16)}px`;}
  viewport.dataset.rendered='true';viewport.dataset.time=String(time);
 }
 const resize=new ResizeObserver(()=>{const w=viewport.clientWidth,h=viewport.clientHeight;if(!w||!h)return;renderer.setSize(w,h,false);camera.aspect=w/h;camera.zoom=kind==='grasp'?Math.min(1.6,w/260):Math.min(1.9,w/180);camera.updateProjectionMatrix();render();});resize.observe(viewport);
 render();
 return {render,duration:kind==='grasp'?18:12,dispose(){disposed=true;resize.disconnect();const gs=new Set(),ms=new Set();scene.traverse(o=>{if(o.geometry)gs.add(o.geometry);for(const m of Array.isArray(o.material)?o.material:[o.material])if(m)ms.add(m);});gs.forEach(g=>g.dispose());ms.forEach(m=>m.dispose());renderer.dispose();renderer.domElement.remove();labels.forEach(l=>l.el.remove());}};
}
