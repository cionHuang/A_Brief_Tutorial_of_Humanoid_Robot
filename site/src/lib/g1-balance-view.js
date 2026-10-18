import {balancePose} from './g1-balance-pose.js';
export async function createBalanceView(viewport,url,kind){
 const [T,{default:Loader}]=await Promise.all([import('three'),import('urdf-loader')]);
 let renderer,resize,disposed=false;const materials=new Set(),geometry=new Set();
 const manager=new T.LoadingManager();let done;const ready=new Promise(r=>done=r),fail=[];manager.onLoad=done;manager.onError=u=>fail.push(u);
 const response=await fetch(url);if(!response.ok)throw Error('G1 model load failed');
 const loader=new Loader(manager);loader.workingPath=url.slice(0,url.lastIndexOf('/')+1);manager.itemStart('root');let robot;try{robot=loader.parse(await response.text());}finally{manager.itemEnd('root');}await ready;if(fail.length)throw Error('G1 mesh load failed');
 const scene=new T.Scene();scene.add(robot,new T.HemisphereLight(0xffffff,0x748497,3));const light=new T.DirectionalLight(0xffffff,3);light.position.set(2,-3,4);scene.add(light);
 const floor=new T.Mesh(new T.PlaneGeometry(2,1),new T.MeshBasicMaterial({color:0x95a8ba,transparent:true,opacity:.12,side:T.DoubleSide}));floor.position.set(.18,0,0);scene.add(floor);
 const dot=new T.Mesh(new T.SphereGeometry(.018,12,8),new T.MeshBasicMaterial({color:0x6a61d4}));dot.visible=kind==='reach';scene.add(dot);
 const target=new T.Mesh(new T.SphereGeometry(.035,16,12),new T.MeshBasicMaterial({color:0xdb972a,wireframe:true}));target.visible=kind==='reach';scene.add(target);
 const camera=new T.OrthographicCamera(-1,1,1,-1,.01,20);camera.up.set(0,0,1);camera.position.set(1.9,-3.5,1.7);camera.lookAt(.17,0,.65);
 renderer=new T.WebGLRenderer({alpha:true,antialias:true});renderer.setClearColor(0,0);renderer.setPixelRatio(Math.min(devicePixelRatio,1.5));renderer.domElement.style.cssText='width:100%;height:100%;display:block';renderer.domElement.setAttribute('aria-hidden','true');viewport.prepend(renderer.domElement);
 let last=null; const initialHand=kind==='reach'?balancePose({arm:1,adjust:0,step:0,advance:0,pelvisX:0,pelvisY:0,rightX:0,rightZ:0,waist:0},'reach').hand:null;
 function render(s){if(disposed)return;if(s)last=s;if(!last)return;const p=balancePose(last,kind);robot.position.set(...p.root);robot.setJointValues(p.q);dot.position.set(p.com[0],p.com[1],.008);if(kind==='reach'){if(initialHand)target.position.set(initialHand[0]+(last.phase>=3?.14:0),initialHand[1],initialHand[2]);}renderer.render(scene,camera);viewport.dataset.loaded='true';return p;}
 resize=new ResizeObserver(()=>{const w=viewport.clientWidth,h=viewport.clientHeight;if(!w||!h)return;renderer.setSize(w,h,false);const half=.75;camera.left=-half*w/h;camera.right=half*w/h;camera.top=half;camera.bottom=-half;camera.updateProjectionMatrix();render();});resize.observe(viewport);
 scene.traverse(o=>{if(o.geometry)geometry.add(o.geometry);for(const m of Array.isArray(o.material)?o.material:[o.material])if(m)materials.add(m);});
 return {render,dispose(){disposed=true;resize.disconnect();geometry.forEach(g=>g.dispose());materials.forEach(m=>m.dispose());renderer.dispose();renderer.domElement.remove();}};
}
