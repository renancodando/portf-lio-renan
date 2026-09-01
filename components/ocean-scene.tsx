'use client';
import { useEffect,useRef } from 'react';

/** Live 2.5D WebGL scene: an environment plate, deformable photographic orcas,
 * animated light and depth particles. It is intentionally not a 3D animal model. */
export default function OceanScene({paused}:{paused:boolean}){
 const host=useRef<HTMLDivElement>(null),pausedRef=useRef(paused),resume=useRef<()=>void>(()=>{});
 useEffect(()=>{pausedRef.current=paused;resume.current()},[paused]);
 useEffect(()=>{
  let disposed=false,clean=()=>{};
  import('three').then(THREE=>{
   if(disposed||!host.current)return;
   let renderer:InstanceType<typeof THREE.WebGLRenderer>;
   try{renderer=new THREE.WebGLRenderer({alpha:true,antialias:false,powerPreference:'low-power'})}catch{return}
   const mount=host.current;mount.appendChild(renderer.domElement);
   renderer.setPixelRatio(Math.min(window.devicePixelRatio,1.5));
   renderer.setClearColor(0x000000,0);
   const scene=new THREE.Scene(),camera=new THREE.OrthographicCamera(-8,8,5,-5,.1,100);camera.position.z=10;
   const loader=new THREE.TextureLoader();let aspect=innerWidth/innerHeight,frame=0,time=0,last=0;
   const bgTexture=loader.load('/assets/ocean-observatory.webp',()=>{background.visible=true;wake()});bgTexture.colorSpace=THREE.SRGBColorSpace;
   const bgMaterial=new THREE.ShaderMaterial({depthTest:false,depthWrite:false,uniforms:{uMap:{value:bgTexture},uTime:{value:0},uAspect:{value:aspect}},vertexShader:'varying vec2 vUv;void main(){vUv=uv;gl_Position=vec4(position.xy,0.999,1.);}',fragmentShader:`uniform sampler2D uMap;uniform float uTime;uniform float uAspect;varying vec2 vUv;
    void main(){vec2 p=vUv;float a=1672./941.;if(uAspect>a)p.y=(p.y-.5)*a/uAspect+.5;else p.x=(p.x-.5)*uAspect/a+.5;
    float water=smoothstep(.20,.65,vUv.y)*(1.-smoothstep(.88,1.,vUv.y));
    p.x+=sin(p.y*25.+uTime*.38)*.0011*water;p.y+=sin(p.x*28.-uTime*.25)*.0008*water;
    vec3 c=texture2D(uMap,p).rgb;float rays=pow(max(0.,sin(vUv.x*39.+vUv.y*7.+sin(uTime*.12))),13.)*.035*water;
    c+=vec3(.15,.65,.8)*rays;c*=.91+sin(uTime*.22)*.025;gl_FragColor=vec4(c,1.);
    #include <colorspace_fragment>
    }`});
   const bgGeometry=new THREE.PlaneGeometry(2,2),background=new THREE.Mesh(bgGeometry,bgMaterial);background.visible=false;background.frustumCulled=false;background.renderOrder=-100;scene.add(background);
   const whaleTexture=loader.load('/assets/orca-cyan.webp',()=>{whales.forEach(w=>w.mesh.visible=true);wake()});whaleTexture.colorSpace=THREE.SRGBColorSpace;
   const whaleGeometry=new THREE.PlaneGeometry(1.5,1,56,30);
   const whaleSpecs=[{size:.37,y:.43,start:.26,speed:.009,depth:1,opacity:.94,phase:0},{size:.23,y:.58,start:.78,speed:-.007,depth:0,opacity:.68,phase:2.4},{size:.11,y:.13,start:.6,speed:.0035,depth:-1,opacity:.43,phase:4}];
   const whales=whaleSpecs.map(spec=>{
    const material=new THREE.ShaderMaterial({transparent:true,depthWrite:false,side:THREE.DoubleSide,uniforms:{uMap:{value:whaleTexture},uTime:{value:0},uOpacity:{value:spec.opacity},uTint:{value:new THREE.Vector3(.67,.89,1)}},vertexShader:`uniform float uTime;varying vec2 vUv;void main(){vUv=uv;vec3 p=position;float tail=pow(1.-uv.x,2.8);p.y+=sin(uTime*1.55+uv.x*4.5)*tail*.11;p.z+=sin(uTime*1.55+uv.x*4.5)*tail*.06;gl_Position=projectionMatrix*modelViewMatrix*vec4(p,1.);}`,fragmentShader:`uniform sampler2D uMap;uniform float uOpacity;uniform vec3 uTint;varying vec2 vUv;void main(){vec4 c=texture2D(uMap,vUv);float key=min(c.r,c.b)-c.g;float alpha=1.-smoothstep(.08,.30,key);if(alpha<.02)discard;if(key>.025)c.r=min(c.r,c.g+.025);c.rgb*=uTint;gl_FragColor=vec4(c.rgb,alpha*uOpacity);
     #include <colorspace_fragment>
    }`});
    const mesh=new THREE.Mesh(whaleGeometry,material);mesh.visible=false;mesh.frustumCulled=false;mesh.renderOrder=spec.depth+3;scene.add(mesh);return {mesh,material,spec};
   });
   let seed=37;const random=()=>{seed=(seed*16807)%2147483647;return seed/2147483647};
   const count=innerWidth<600?65:160,positions=new Float32Array(count*3);
   for(let i=0;i<count;i++){positions[i*3]=(random()-.5)*32;positions[i*3+1]=(random()-.5)*12;positions[i*3+2]=random()*3}
   const pointsGeometry=new THREE.BufferGeometry();pointsGeometry.setAttribute('position',new THREE.BufferAttribute(positions,3));
   const pointMaterial=new THREE.ShaderMaterial({transparent:true,depthWrite:false,uniforms:{uTime:{value:0},uPixel:{value:renderer.getPixelRatio()}},vertexShader:`uniform float uTime;uniform float uPixel;void main(){vec3 p=position;p.y=mod(p.y+6.+uTime*(.018+p.z*.012),12.)-6.;p.x+=sin(uTime*.15+p.y*2.)*.15;gl_Position=projectionMatrix*modelViewMatrix*vec4(p,1.);gl_PointSize=(1.+p.z*.8)*uPixel;}`,fragmentShader:'void main(){float d=length(gl_PointCoord-.5);if(d>.5)discard;gl_FragColor=vec4(.64,.86,.98,(1.-smoothstep(.04,.5,d))*.45);}'});
   scene.add(new THREE.Points(pointsGeometry,pointMaterial));
   const pointer={x:0,y:0},smoothed={x:0,y:0};
   function resize(){aspect=innerWidth/innerHeight;renderer.setSize(innerWidth,innerHeight);camera.left=-5*aspect;camera.right=5*aspect;camera.updateProjectionMatrix();bgMaterial.uniforms.uAspect.value=aspect;wake()}
   function render(now:number){frame=0;if(disposed||document.hidden)return;const dt=last?Math.min((now-last)/1000,.05):0;last=now;if(!pausedRef.current)time+=dt;
    smoothed.x+=(pointer.x-smoothed.x)*.025;smoothed.y+=(pointer.y-smoothed.y)*.025;
    bgMaterial.uniforms.uTime.value=time;pointMaterial.uniforms.uTime.value=time;
    whales.forEach(({mesh,material,spec})=>{const progress=((spec.start+time*spec.speed+.5)%2+2)%2-.5;const size=innerWidth<600?spec.size*1.85:spec.size;const worldSize=size*aspect*10/1.5;mesh.scale.set(worldSize*(spec.speed<0?-1:1),worldSize,1);mesh.position.set((progress-.5)*aspect*10+smoothed.x*.08,(.5-spec.y)*10+Math.sin(time*.21+spec.phase)*.22+smoothed.y*.06,spec.depth);mesh.rotation.z=Math.sin(time*.24+spec.phase)*.045;material.uniforms.uTime.value=time+spec.phase});
    renderer.render(scene,camera);if(!pausedRef.current)frame=requestAnimationFrame(render);
   }
   function wake(){if(!disposed&&!frame){last=0;frame=requestAnimationFrame(render)}}
   function visibility(){if(document.hidden){cancelAnimationFrame(frame);frame=0;last=0}else wake()}
   function move(e:PointerEvent){if(e.pointerType==='mouse'&&!pausedRef.current){pointer.x=e.clientX/innerWidth-.5;pointer.y=e.clientY/innerHeight-.5}}
   function lost(e:Event){e.preventDefault();cancelAnimationFrame(frame);frame=0;mount.style.opacity='0'}
   function restored(){mount.style.opacity='1';wake()}
   resume.current=wake;resize();document.addEventListener('visibilitychange',visibility);window.addEventListener('resize',resize);window.addEventListener('pointermove',move,{passive:true});renderer.domElement.addEventListener('webglcontextlost',lost);renderer.domElement.addEventListener('webglcontextrestored',restored);
   clean=()=>{cancelAnimationFrame(frame);resume.current=()=>{};document.removeEventListener('visibilitychange',visibility);window.removeEventListener('resize',resize);window.removeEventListener('pointermove',move);renderer.domElement.removeEventListener('webglcontextlost',lost);renderer.domElement.removeEventListener('webglcontextrestored',restored);bgTexture.dispose();whaleTexture.dispose();bgGeometry.dispose();bgMaterial.dispose();whaleGeometry.dispose();whales.forEach(w=>w.material.dispose());pointsGeometry.dispose();pointMaterial.dispose();renderer.dispose();renderer.domElement.remove()};
  }).catch(()=>{/* Static atmosphere remains available when WebGL cannot load. */});
  return()=>{disposed=true;clean()};
 },[]);
 return <div className="ocean-canvas" ref={host} aria-hidden="true"/>;
}
