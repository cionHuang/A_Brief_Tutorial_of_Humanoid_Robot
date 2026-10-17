"""Render a static G1 redundancy illustration. Requires Python 3, numpy and Pillow.
Run from any directory; inputs are the repository URDF and STL assets.
Both poses respect joint limits; this is not a collision-checked motion plan.
"""
from pathlib import Path
import xml.etree.ElementTree as ET
import numpy as np
from PIL import Image, ImageDraw, ImageFont
import json, math
ROOT=Path(__file__).resolve().parents[2]
MODEL=ROOT/'robot_descriptions/g1'
OUT=ROOT/'chapters/04-cerebellum-realtime-control/assets/images/g1-arm-redundancy.png'
robot=ET.parse(MODEL/'g1_29dof.urdf').getroot()
links={e.get('name'):e for e in robot.findall('link')}
joints=list(robot.findall('joint'))
names=['left_'+n+'_joint' for n in ['shoulder_pitch','shoulder_roll','shoulder_yaw','elbow','wrist_roll','wrist_pitch','wrist_yaw']]
arm=[next(j for j in joints if j.get('name')==n) for n in names]
def vals(s):return np.array([float(v) for v in s.split()])
def rot(axis,a):
 axis=np.asarray(axis);x,y,z=axis;K=np.array([[0,-z,y],[z,0,-x],[-y,x,0]])
 return np.eye(3)+np.sin(a)*K+(1-np.cos(a))*(K@K)
def origin(e):
 T=np.eye(4)
 if e is not None:
  T[:3,3]=vals(e.get('xyz','0 0 0'));r,p,y=vals(e.get('rpy','0 0 0'))
  T[:3,:3]=rot([0,0,1],y)@rot([0,1,0],p)@rot([1,0,0],r)
 return T
orig=[origin(j.find('origin')) for j in arm]
axes=[vals(j.find('axis').get('xyz')) for j in arm]
lo=np.array([float(j.find('limit').get('lower')) for j in arm]);hi=np.array([float(j.find('limit').get('upper')) for j in arm])
def fk(q):
 T=np.eye(4);fs=[]
 for O,a,t in zip(orig,axes,q):
  R=np.eye(4);R[:3,:3]=rot(a,t);T=T@O@R;fs.append(T.copy())
 return fs
q0=np.deg2rad([-50,20,-25,15,0,35,0]);target=fk(q0)[-1]
def err(q):
 T=fk(q)[-1];return np.r_[T[:3,3]-target[:3,3],(T[:3,:3]-target[:3,:3]).flatten()*.25]
def solve(q):
 for it in range(100):
  e=err(q)
  if np.linalg.norm(e)<1e-10:break
  h=1e-5;J=np.column_stack([(err(q+np.eye(7)[k]*h)-err(q-np.eye(7)[k]*h))/(2*h) for k in range(7)])
  dq=-np.linalg.lstsq(J,e,rcond=1e-7)[0];dq*=min(1,.3/(np.linalg.norm(dq)+1e-12))
  q=np.clip(q+dq,lo,hi)
 return q
rng=np.random.default_rng(15);best=None
for i in range(70):
 q=solve(np.clip(q0+rng.normal(0,.7,7),lo,hi));fs=fk(q)
 if np.linalg.norm(err(q))>1e-7:continue
 # Prefer elbow raised and moved outward, keep it outside torso.
 elbow=fs[3][:3,3];d=elbow-fk(q0)[3][:3,3]
 score=np.linalg.norm(d) if d[1]>0 else -1
 if best is None or score>best[0]:best=(score,q)
q1=best[1]
print('A',np.rad2deg(q0),'B',np.rad2deg(q1),'error',np.linalg.norm(err(q1)))
# Global robot link transforms, torso at original URDF pose; right arm remains relaxed.
def frames(q):
 angles=dict(zip(names,q));tf={'pelvis':np.eye(4)}
 for _ in range(10):
  for j in joints:
   pa=j.find('parent').get('link');ch=j.find('child').get('link')
   if pa not in tf:continue
   T=origin(j.find('origin'));a=j.find('axis')
   if a is not None:
    R=np.eye(4);R[:3,:3]=rot(vals(a.get('xyz')),angles.get(j.get('name'),0));T=T@R
   tf[ch]=tf[pa]@T
 return tf
A=frames(q0);B=frames(q1)
# Orthographic view, looking from front-left and slightly above.
eye=np.array([2.4,3.2,1.25]);eye/=np.linalg.norm(eye)
right=np.cross([0,0,1],eye);right/=np.linalg.norm(right);up=np.cross(eye,right)
S=1900;cx=690;cy=870
W,H=1600,1150
im=Image.new('RGB',(W,H),'#f8fafc');draw=ImageDraw.Draw(im)
def project(v):
 return np.c_[cx+v@right*S,cy-v@up*S]
def mesh(n,tf):
 v=links[n].find('visual')
 if v is None:return None
 m=v.find('geometry/mesh')
 if m is None:return None
 path=MODEL/m.get('filename');data=path.read_bytes();count=int.from_bytes(data[80:84],'little')
 dt=np.dtype([('n','<f4',(3,)),('v','<f4',(3,3)),('attr','<u2')]);arr=np.frombuffer(data,dt,count=count,offset=84)['v'].astype(float)
 T=tf[n]@origin(v.find('origin'));arr=arr@T[:3,:3].T+T[:3,3]
 return arr
chosen=[n for n in links if n in A and not any(s in n for s in ['hip','knee','ankle','pelvis','waist','right_'])]
# Fit model inside illustration bounds, leaving title and notes clear.
allv=np.concatenate([mesh(n,A).reshape(-1,3) for n in chosen if mesh(n,A) is not None])
u=allv@right;v=allv@up
S=min(820/(u.max()-u.min()),710/(v.max()-v.min()))
cx=150-u.min()*S;cy=950+v.min()*S
# Triangles painted back to front; model materials are simplified for print clarity.
tris=[]
light=np.array([1,1,2]);light=light/np.linalg.norm(light)
for n in chosen:
 ar=mesh(n,A)
 if ar is None:continue
 normals=np.cross(ar[:,1]-ar[:,0],ar[:,2]-ar[:,0]);normals/=np.maximum(np.linalg.norm(normals,axis=1)[:,None],1e-9)
 shade=.5+.5*np.abs(normals@light)
 col=np.array([68,139,175]) if n.startswith('left_') else np.array([178,188,199])
 if 'rubber' in n:col=np.array([53,72,88])
 xy=project(ar.reshape(-1,3)).reshape(-1,3,2);depth=ar.mean(axis=1)@eye
 for poly,z,sh in zip(xy,depth,shade):tris.append((z,poly,tuple((col*sh).astype(int))))
for _,poly,c in sorted(tris,key=lambda x:x[0]):draw.polygon([tuple(p) for p in poly],fill=c)
# Dashed silhouette of alternative arm per actual mesh projection, using a convex outline per link.
def hull(points):
 pts=sorted(set(map(tuple,np.round(points,2))))
 def cross(o,a,b):return (a[0]-o[0])*(b[1]-o[1])-(a[1]-o[1])*(b[0]-o[0])
 low=[]
 for p in pts:
  while len(low)>=2 and cross(low[-2],low[-1],p)<=0:low.pop()
  low.append(p)
 high=[]
 for p in pts[::-1]:
  while len(high)>=2 and cross(high[-2],high[-1],p)<=0:high.pop()
  high.append(p)
 return np.array(low[:-1]+high[:-1])
def dash(poly,fill,width=4):
 phase=0
 for a,b in zip(poly,np.roll(poly,-1,axis=0)):
  d=b-a;length=np.linalg.norm(d);t=0
  while t<length:
   rem=(13 if phase<13 else 21)-phase;step=min(rem,length-t)
   if phase<13:draw.line([tuple(a+d*t/length),tuple(a+d*(t+step)/length)],fill=fill,width=width)
   t+=step;phase=(phase+step)%21
for n in chosen:
 if not n.startswith('left_') or 'rubber' in n or 'wrist_yaw' in n:continue
 ar=mesh(n,B)
 if ar is not None:dash(hull(project(ar.reshape(-1,3))),'#d87925',4)
font='/System/Library/Fonts/STHeiti Medium.ttc'
def txt(pos,s,size=30,color='#233447'):draw.text(pos,s,font=ImageFont.truetype(font,size),fill=color)
txt((65,42),'手的位姿不变，肘部仍可调整',44)
txt((66,108),'G1 左臂 · 同一末端位置与朝向 · 两组关节角',25,'#627387')
# legend
draw.line((70,175,125,175),fill='#448baf',width=12);txt((140,158),'姿势 A：实体',26)
dash(np.array([[420,175],[480,175]]),'#d87925',4);txt((495,158),'姿势 B：虚线轮廓',26)
def mark(P,label,pos,color):
 x,y=project(P[None])[0];draw.ellipse((x-8,y-8,x+8,y+8),fill=color,outline='white',width=2)
 draw.line([(x,y),pos],fill=color,width=3);txt((pos[0]+8,pos[1]-17),label,27,color)
mark(A['left_elbow_link'][:3,3],'肘部 A',(1010,660),'#276c93')
mark(B['left_elbow_link'][:3,3],'肘部 B',(1010,390),'#bb651b')
hand=A['left_rubber_hand'][:3,3]
mark(hand,'手的位置、朝向重合',(1040,830),'#267a65')
# Shared frame axes make fixed hand orientation visible.
for k,col in enumerate(['#d74a48','#26835a','#4769ba']):
 p=project(np.array([hand,hand+A['left_rubber_hand'][:3,k]*.045]));draw.line(list(map(tuple,p)),fill=col,width=5)
txt((66,1030),'躯干固定；左臂 7 个关节参与求解；无灵巧手模型。',25,'#627387')
txt((66,1074),'基于 G1 URDF 与原始网格渲染 · 虚线为另一姿势的外轮廓',22,'#627387')
im.save(OUT)
Ta=A['left_rubber_hand'];Tb=B['left_rubber_hand'];angle=np.arccos(np.clip((np.trace(Ta[:3,:3].T@Tb[:3,:3])-1)/2,-1,1))
record={'model':'robot_descriptions/g1/g1_29dof.urdf','joints':names,'pose_a_rad':q0.tolist(),'pose_b_rad':q1.tolist(),'hand_position_error_m':float(np.linalg.norm(Ta[:3,3]-Tb[:3,3])),'hand_orientation_error_rad':float(angle),'elbow_separation_m':float(np.linalg.norm(A['left_elbow_link'][:3,3]-B['left_elbow_link'][:3,3])),'scope':'Kinematic illustration; joint limits checked; not a collision-checked motion plan.'}
OUT.with_suffix('.json').write_text(json.dumps(record,indent=2)+'\n')
print(json.dumps(record,indent=2))
