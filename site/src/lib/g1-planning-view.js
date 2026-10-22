import {PHY,fk} from './g1-arm-physics.js';
import {createReachPaths,createMpcSequence,handPosition,mix,samplePath,solveHand,timing,clamp} from './planning-lessons.js';

export async function createG1PlanningView(viewport,{urdfUrl,kind}){
 const [T,{default:Loader}]=await Promise.all([import('three'),import('urdf-loader')]);
 const response=await fetch(urdfUrl);if(!response.ok)throw Error('G1 model unavailable');
 const xml=new DOMParser().parseFromString(await response.text(),'application/xml');
 for(const link of xml.querySelectorAll('robot > link')){
  if(!/^(left_(shoulder|elbow|wrist|rubber)|right_(shoulder|elbow|wrist|rubber)|torso|head|logo|waist_support)/.test(link.getAttribute('name')||''))for(const v of link.querySelectorAll(':scope > visual'))v.remove();
 }
 const loader=new Loader(),loads=[];loader.workingPath=urdfUrl.slice(0,urdfUrl.lastIndexOf('/')+1);
 const original=loader.loadMeshCb;loader.loadMeshCb=(path,manager,material,complete)=>loads.push(new Promise((resolve,reject)=>original(path,manager,material,(obj,error)=>{complete(obj,error);error?reject(error):resolve(obj);}))); 
 const robot=loader.parse(xml);await Promise.all(loads);
 robot.updateMatrixWorld(true);robot.position.sub(robot.links.torso_link.getWorldPosition(new T.Vector3()));robot.setJointValue('right_shoulder_roll_joint',-.12);robot.setJointValue('right_elbow_joint',.6);
 const paths=createReachPaths(),frames=createMpcSequence();let seed=paths.start;
 const mpcPoint=(s,o=0)=>mix(paths.a,paths.b,s).map((v,i)=>v+(i===2?o:0));
 const mpcQ=frames.map(f=>{seed=solveHand(mpcPoint(f.state[0],f.offset[0]),seed);return seed;});
 const scene=new T.Scene();scene.add(robot,new T.HemisphereLight(0xffffff,0x607080,2.4));
 const sun=new T.DirectionalLight(0xffffff,3);sun.position.set(2,3,4);scene.add(sun);
 const camera=new T.PerspectiveCamera(32,1,.01,20);camera.up.set(0,0,1);camera.position.set(1.4,2.1,.92);camera.lookAt(.15,.12,.12);
 const renderer=new T.WebGLRenderer({alpha:true,antialias:true});renderer.setClearColor(0,0);renderer.outputColorSpace=T.SRGBColorSpace;renderer.setPixelRatio(Math.min(devicePixelRatio,1.5));
 Object.assign(renderer.domElement.style,{width:'100%',height:'100%',display:'block'});renderer.domElement.setAttribute('aria-hidden','true');viewport.prepend(renderer.domElement);
 const mesh=(geo,color)=>{const m=new T.Mesh(geo,new T.MeshStandardMaterial({color,roughness:.65}));scene.add(m);return m;};
 const end=new T.Vector3(...paths.b),table=mesh(new T.BoxGeometry(.3,.32,.018),0x94a9bb);table.position.copy(end).add(new T.Vector3(.20,0,-.095));
 for(const y of [-.13,.13]){const leg=mesh(new T.BoxGeometry(.018,.018,.3),0x94a9bb);leg.position.copy(table.position).add(new T.Vector3(.1,y,-.15));}
 const cup=mesh(new T.CylinderGeometry(.035,.03,.1,32,1,true),0xc86556);cup.rotation.x=Math.PI/2;cup.position.copy(end).add(new T.Vector3(.11,0,-.034));cup.material.side=T.DoubleSide;
 const handle=mesh(new T.TorusGeometry(.023,.005,8,24,Math.PI*1.6),0xc86556);handle.position.copy(cup.position).add(new T.Vector3(0,.04,0));handle.rotation.y=Math.PI/2;
 const ball=mesh(new T.SphereGeometry(.011,16,12),0x1d9c87);ball.material.depthTest=false;ball.renderOrder=8;
 const goal=mesh(new T.SphereGeometry(.012,16,12),0xd99422);goal.position.copy(end);
 const joints=['left_shoulder_pitch_joint','left_elbow_joint','left_wrist_pitch_joint'].map(()=>mesh(new T.SphereGeometry(.012,12,8),0xd99422));
 joints.forEach(o=>{o.material.depthTest=false;o.renderOrder=7;});
 const makeLine=(color,dashed=false)=>{const l=new T.Line(new T.BufferGeometry(),dashed?new T.LineDashedMaterial({color,dashSize:.015,gapSize:.009,depthTest:false}):new T.LineBasicMaterial({color,depthTest:false}));l.renderOrder=5;scene.add(l);return l;};
 const route=makeLine(0x7b68ce,true),executed=makeLine(0x1d9c87),first=mesh(new T.SphereGeometry(.009,12,8),0xe19c27);
 const labels=[];function label(text,pos){const el=document.createElement('span');el.className='gp-label';el.textContent=text;viewport.append(el);labels.push({el,p:new T.Vector3(...pos)});return el;}
 label('G1 左臂',[-.07,.29,.34]);label('接近杯子的位置',[paths.b[0],paths.b[1],paths.b[2]+.065]);
 const disturbance=label('↓ 轻微扰动',[0,0,0]);disturbance.hidden=true;
 let disposed=false,lastState={mode:'joint',time:0},lastRoute='';
 function setLine(l,pts){l.geometry.setFromPoints(pts.map(p=>new T.Vector3(...p)));if(l.computeLineDistances)l.computeLineDistances();}
 function pose(q){PHY.chain.slice(0,7).forEach((j,i)=>robot.setJointValue(j.name,q[i]));robot.updateMatrixWorld(true);ball.position.copy(robot.links.left_rubber_hand.getWorldPosition(new T.Vector3()));const f=fk(q);['left_shoulder_pitch_joint','left_elbow_joint','left_wrist_pitch_joint'].forEach((name,i)=>joints[i].position.set(...f.joints[name].p));}
 function render(state=lastState){lastState=state;if(disposed)return;
  if(kind==='reach'){
   const path=paths[state.mode],s=timing(clamp(state.time/5)),q=samplePath(path,s);pose(q);first.visible=false;
   if(lastRoute!==state.mode){setLine(route,path.map(handPosition));lastRoute=state.mode;}
   setLine(executed,[...path.slice(0,Math.floor(s*100)+1).map(handPosition),handPosition(q)]);
  }else{
   const at=clamp(state.time/.7,0,frames.length-1),k=Math.floor(at),f=frames[k],u=clamp((at-k-.5)*4);
   const q=mix(mpcQ[k],mpcQ[Math.min(k+1,mpcQ.length-1)],u);pose(q);joints.forEach(o=>o.visible=false);
   disturbance.hidden=!(k>=5&&k<8);labels.at(-1).p.copy(ball.position).add(new T.Vector3(0,0,.08));
   if(lastRoute!==String(k)){setLine(route,f.plan.states.map((v,i)=>mpcPoint(v[0],f.offsetPlan.states[i][0])));lastRoute=String(k);}
   setLine(executed,[mpcPoint(f.state[0],f.offset[0]),handPosition(q)]);
   first.visible=k<frames.length-1;first.position.set(...mpcPoint(f.plan.states[1][0],f.offsetPlan.states[1][0]));
  }
  camera.updateMatrixWorld();renderer.render(scene,camera);
  for(const {el,p}of labels){const v=p.clone().project(camera);el.style.left=`${clamp((v.x+1)*viewport.clientWidth/2,65,viewport.clientWidth-65)}px`;el.style.top=`${(1-v.y)*viewport.clientHeight/2}px`;}
  viewport.dataset.rendered='true';viewport.dataset.hand=JSON.stringify(ball.position.toArray());
 }
 const resize=new ResizeObserver(()=>{const w=viewport.clientWidth,h=viewport.clientHeight;if(!w||!h)return;renderer.setSize(w,h,false);camera.aspect=w/h;camera.zoom=Math.min(1.6,w/266);camera.updateProjectionMatrix();render();});resize.observe(viewport);
 function dispose(){disposed=true;resize.disconnect();const geos=new Set(),mats=new Set();scene.traverse(o=>{if(o.geometry)geos.add(o.geometry);for(const m of Array.isArray(o.material)?o.material:[o.material])if(m)mats.add(m);});geos.forEach(g=>g.dispose());mats.forEach(m=>m.dispose());renderer.dispose();renderer.domElement.remove();labels.forEach(l=>l.el.remove());}
 render();return {render,dispose,duration:kind==='reach'?5:(frames.length-1)*.7};
}
