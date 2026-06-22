// ═══════════════════════════════════════════════════════════════════
//  GYMFEVER v2 — TRUE 3D-STYLE HUMAN + MACHINERY RENDERING ENGINE
//  Filled tapered-polygon limbs with light/shadow shading (not strokes)
//  Layered, gradient-shaded equipment that reads as real machinery
//  Fully responsive canvas — scales to any container size, no cutoff
// ═══════════════════════════════════════════════════════════════════

let CV, CTX, CW, CH;
let _key='bench', _t=0, _playing=true, _speed=1;
let _rep=0, _maxRep=10, _lastCyc=0, _raf=null, _lastTs=null;

function initCanvas(){
  CV = document.getElementById('animCanvas');
  CTX = CV.getContext('2d');
  CW = 580; CH = 320;
  CV.width = CW; CV.height = CH;
  window.addEventListener('resize', function(){
    if (document.getElementById('animModalBg').classList.contains('open')) {
      resizeCanvas();
    }
  });
}

function resizeCanvas(){
  const wrap = document.querySelector('.modal-canvas-area');
  if(!wrap || !CV) return;
  const w = wrap.clientWidth, h = wrap.clientHeight;
  if (w <= 0 || h <= 0) return;
  CW = w;
  CH = Math.min(h, Math.floor(CW * 0.56));
  if (CH <= 0) CH = Math.floor(CW * 0.56);
  CV.width = CW; CV.height = CH;
  CV.style.width = CW + 'px'; CV.style.height = CH + 'px';
}

// ── SCALE HELPERS (everything is a ratio of canvas size — never a fixed pixel) ──
function sc(n){ return n * (CW / 580); }
function px(xR){ return CW * xR; }
function py(yR){ return CH * yR; }

// ── BASIC CANVAS HELPERS ──────────────────────────────────────────────
function clr(){ CTX.clearRect(0,0,CW,CH); }

function grid(){
  CTX.strokeStyle='rgba(255,255,255,0.022)'; CTX.lineWidth=1;
  const step = sc(40);
  for(let x=0;x<CW;x+=step){CTX.beginPath();CTX.moveTo(x,0);CTX.lineTo(x,CH);CTX.stroke();}
  for(let y=0;y<CH;y+=step){CTX.beginPath();CTX.moveTo(0,y);CTX.lineTo(CW,y);CTX.stroke();}
}

function floorLine(yR, col){
  const y = py(yR);
  CTX.strokeStyle = col||'rgba(232,255,0,0.18)';
  CTX.lineWidth = sc(1.5);
  CTX.beginPath(); CTX.moveTo(0,y); CTX.lineTo(CW,y); CTX.stroke();
}

function shadowEllipse(xR, yR, rxPx, ryPx, alpha){
  CTX.fillStyle = `rgba(0,0,0,${alpha||0.28})`;
  CTX.beginPath();
  CTX.ellipse(px(xR), py(yR), sc(rxPx), sc(ryPx), 0, 0, Math.PI*2);
  CTX.fill();
}

function glow(xR, yR, rPx, color){
  const x=px(xR), y=py(yR), r=sc(rPx);
  const g=CTX.createRadialGradient(x,y,0,x,y,Math.max(r,1));
  g.addColorStop(0,color); g.addColorStop(1,'transparent');
  CTX.fillStyle=g; CTX.beginPath(); CTX.arc(x,y,Math.max(r,1),0,Math.PI*2); CTX.fill();
}

function watermark(text, col){
  CTX.fillStyle = col||'rgba(255,255,255,0.035)';
  CTX.font = `bold ${sc(44)}px 'Bebas Neue',sans-serif`;
  CTX.textAlign='center';
  CTX.fillText(text.toUpperCase(), CW/2, CH-sc(10));
}

// Convert an absolute pixel coordinate back into a canvas ratio, so the
// return value of human3D() (which is in pixels) can be fed straight
// into prop-drawing helpers that expect ratios (0..1).
function toRatioX(xPix){ return xPix / CW; }
function toRatioY(yPix){ return yPix / CH; }

function repFlash(t, yR, col){
  const c=t%1, a=Math.max(0,1-c*5);
  if(a>0 && c<0.18){
    CTX.fillStyle=(col||'rgba(232,255,0,')+a+')';
    CTX.font=`bold ${sc(22)}px 'Bebas Neue',sans-serif`;
    CTX.textAlign='center';
    CTX.fillText('REP '+_rep, CW/2, py(yR));
  }
}

function holdTimer(label_yR, seconds){
  CTX.fillStyle = 'rgba(232,255,0,0.85)';
  CTX.font = `bold ${sc(28)}px 'Bebas Neue',sans-serif`;
  CTX.textAlign='center';
  CTX.fillText(Math.floor(seconds)+'s', CW/2, py(label_yR));
}

// ═══════════════════════════════════════════════════════════════════
//  3D HUMAN FIGURE — built from filled tapered polygon limbs, not
//  strokes. Each limb is drawn as a quad (wide-near, wide-far) filled
//  with a perpendicular light->shadow gradient, giving a rounded,
//  cylindrical, "real" look instead of a flat stick line.
// ═══════════════════════════════════════════════════════════════════

function limb3D(x1,y1,x2,y2,w1,w2,baseColor,lightDir){
  lightDir = lightDir===undefined?0.35:lightDir;
  const dx=x2-x1, dy=y2-y1;
  const len=Math.hypot(dx,dy)||1;
  const nx=-dy/len, ny=dx/len;

  const ax1=x1+nx*w1, ay1=y1+ny*w1;
  const bx1=x1-nx*w1, by1=y1-ny*w1;
  const ax2=x2+nx*w2, ay2=y2+ny*w2;
  const bx2=x2-nx*w2, by2=y2-ny*w2;

  const maxw = Math.max(w1,w2,0.5);
  const gx1 = x1 - nx*maxw, gy1 = y1 - ny*maxw;
  const gx2 = x1 + nx*maxw, gy2 = y1 + ny*maxw;
  const grad = CTX.createLinearGradient(gx1,gy1,gx2,gy2);
  const lightPos = 0.5 + lightDir*0.32;
  grad.addColorStop(0, shadeColor(baseColor,-42));
  grad.addColorStop(Math.max(0,Math.min(1,lightPos-0.28)), shadeColor(baseColor,-12));
  grad.addColorStop(Math.max(0,Math.min(1,lightPos)), shadeColor(baseColor,38));
  grad.addColorStop(Math.max(0,Math.min(1,lightPos+0.3)), shadeColor(baseColor,-8));
  grad.addColorStop(1, shadeColor(baseColor,-46));

  CTX.fillStyle = grad;
  CTX.beginPath();
  CTX.moveTo(ax1,ay1); CTX.lineTo(ax2,ay2); CTX.lineTo(bx2,by2); CTX.lineTo(bx1,by1);
  CTX.closePath(); CTX.fill();

  CTX.strokeStyle = shadeColor(baseColor,-55);
  CTX.globalAlpha = 0.35;
  CTX.lineWidth = Math.max(1, w1*0.12);
  CTX.stroke();
  CTX.globalAlpha = 1;
}

function shadeColor(hex, amt){
  hex = hex.replace('#','');
  if(hex.length===3) hex = hex.split('').map(c=>c+c).join('');
  let r=parseInt(hex.substr(0,2),16), g=parseInt(hex.substr(2,2),16), b=parseInt(hex.substr(4,2),16);
  r=Math.max(0,Math.min(255,r+amt)); g=Math.max(0,Math.min(255,g+amt)); b=Math.max(0,Math.min(255,b+amt));
  return `rgb(${r|0},${g|0},${b|0})`;
}

function joint3D(x, y, rPx, baseColor){
  const r = Math.max(sc(rPx), 0.6);
  const g = CTX.createRadialGradient(x-r*0.3,y-r*0.3,r*0.1,x,y,r);
  g.addColorStop(0, shadeColor(baseColor,55));
  g.addColorStop(0.6, baseColor);
  g.addColorStop(1, shadeColor(baseColor,-40));
  CTX.fillStyle = g;
  CTX.beginPath(); CTX.arc(x,y,r,0,Math.PI*2); CTX.fill();
}

/**
 * human3D — draws a complete proportioned human figure using filled,
 * gradient-shaded tapered limbs (true 3D look, not a stick figure).
 *
 * xR, yR : hip anchor position, as canvas ratios (0..1)
 * opts.col          base color hex
 * opts.scale        size multiplier
 * opts.torsoAngle   degrees, 90 = upright standing, 0 = lying flat
 * opts.lean         extra forward/back lean in degrees
 * opts.armRot/armLRot   shoulder angle in degrees (0=down,-90=forward/up)
 * opts.elbowR/elbowL    0..1 elbow bend
 * opts.legRot/legLRot   hip angle in degrees (0=down/standing)
 * opts.kneeR/kneeL      0..1 knee bend
 * opts.lightDir     -1..1 highlight side, default 0.35
 */
function human3D(xR, yR, opts){
  opts = opts||{};
  const col = opts.col || '#1ecbff';
  const scale = (opts.scale===undefined?1:opts.scale);
  const torsoAngle = (opts.torsoAngle===undefined?90:opts.torsoAngle);
  const lean = opts.lean||0;
  const armRot = opts.armRot===undefined?5:opts.armRot;
  const armLRot = opts.armLRot===undefined?-5:opts.armLRot;
  const elbowR = opts.elbowR||0, elbowL = opts.elbowL||0;
  const legRot = opts.legRot===undefined?8:opts.legRot;
  const legLRot = opts.legLRot===undefined?-8:opts.legLRot;
  const kneeR = opts.kneeR||0, kneeL = opts.kneeL||0;
  const lightDir = opts.lightDir===undefined?0.35:opts.lightDir;

  // FIGURE_SCALE boosts the whole figure to properly fill the canvas
  // (the original 1x proportions rendered too small / lost in empty
  // space). Boosting `s` uniformly here keeps every relative limb
  // proportion and every exercise's tuned pose angles unchanged.
  const FIGURE_SCALE = 1.55;
  const s = sc(1) * scale * FIGURE_SCALE;
  const cx = px(xR), cy = py(yR);

  const headR=11.5*s, neckLen=7*s, torsoLen=46*s, shoulderHalf=14*s, hipHalf=8.5*s;
  const upperArm=27*s, foreArm=24*s, armW1=6*s, armW2=4.8*s, foreW2=3.8*s;
  const thigh=36*s, shin=32*s, legW1=8*s, legW2=6.2*s, shinW2=5*s;

  const ta = (torsoAngle-90+lean) * Math.PI/180;
  const upX = Math.sin(ta), upY = -Math.cos(ta);

  const hipX=cx, hipY=cy;
  const shX = hipX + upX*torsoLen, shY = hipY + upY*torsoLen;
  const neckX = shX + upX*neckLen, neckY = shY + upY*neckLen;
  const headX = neckX + upX*headR*0.7, headY = neckY + upY*headR*0.7;

  const perpX = upY, perpY = -upX;
  const shLx = shX - perpX*shoulderHalf, shLy = shY - perpY*shoulderHalf;
  const shRx = shX + perpX*shoulderHalf, shRy = shY + perpY*shoulderHalf;
  const hipLx = hipX - perpX*hipHalf, hipLy = hipY - perpY*hipHalf;
  const hipRx = hipX + perpX*hipHalf, hipRy = hipY + perpY*hipHalf;

  shadowEllipse(xR, yR + (legRot>45?0.16:0.05), 26*scale, 6*scale, 0.18);

  function drawLeg(hipPX,hipPY, angleDeg, kneeBend, mirror){
    const a = angleDeg*Math.PI/180;
    const kneeX = hipPX + Math.sin(a)*thigh, kneeY = hipPY + Math.cos(a)*thigh;
    const kAngle = a + kneeBend*1.3*mirror;
    const footX = kneeX + Math.sin(kAngle)*shin, footY = kneeY + Math.cos(kAngle)*shin;
    limb3D(hipPX,hipPY,kneeX,kneeY, legW1,legW2, shadeColor(col,-15), lightDir);
    joint3D(kneeX,kneeY, 5.4*s, shadeColor(col,-15));
    limb3D(kneeX,kneeY,footX,footY, legW2,shinW2, shadeColor(col,-26), lightDir);
    const footA = kAngle + Math.PI/2*mirror;
    const toeX = footX + Math.cos(footA)*9*s, toeY = footY + Math.sin(footA)*4*s;
    limb3D(footX,footY,toeX,toeY, shinW2*0.85, shinW2*0.5, shadeColor(col,-32), lightDir);
    return {kneeX,kneeY,footX,footY};
  }
  drawLeg(hipRx,hipRy, legRot, kneeR, 1);
  drawLeg(hipLx,hipLy, legLRot, kneeL, -1);

  const torsoGrad = CTX.createLinearGradient(shLx,shLy,shRx,shRy);
  const lp = Math.max(0,Math.min(1,0.5+lightDir*0.3));
  torsoGrad.addColorStop(0, shadeColor(col,-35));
  torsoGrad.addColorStop(Math.max(0,Math.min(1,lp-0.3)), shadeColor(col,-8));
  torsoGrad.addColorStop(lp, shadeColor(col,32));
  torsoGrad.addColorStop(Math.max(0,Math.min(1,lp+0.32)), shadeColor(col,-5));
  torsoGrad.addColorStop(1, shadeColor(col,-38));
  CTX.fillStyle = torsoGrad;
  CTX.beginPath();
  CTX.moveTo(shLx,shLy); CTX.lineTo(shRx,shRy); CTX.lineTo(hipRx,hipRy); CTX.lineTo(hipLx,hipLy);
  CTX.closePath(); CTX.fill();
  CTX.strokeStyle = shadeColor(col,-50); CTX.globalAlpha=0.3; CTX.lineWidth=sc(1); CTX.stroke(); CTX.globalAlpha=1;

  CTX.strokeStyle = shadeColor(col, lightDir>0?40:-15);
  CTX.globalAlpha = 0.22; CTX.lineWidth = sc(2);
  CTX.beginPath(); CTX.moveTo((shLx+shRx)/2,(shLy+shRy)/2); CTX.lineTo((hipLx+hipRx)/2,(hipLy+hipRy)/2); CTX.stroke();
  CTX.globalAlpha = 1;

  function drawArm(shPX,shPY, angleDeg, elbowBend, mirror, baseShade){
    const a = angleDeg*Math.PI/180;
    const ex = shPX + Math.sin(a)*upperArm, ey = shPY + Math.cos(a)*upperArm;
    const elbowA = a + elbowBend*1.6*mirror;
    const hx = ex + Math.sin(elbowA)*foreArm, hy = ey + Math.cos(elbowA)*foreArm;
    limb3D(shPX,shPY,ex,ey, armW1,armW2, shadeColor(col,baseShade), lightDir);
    joint3D(ex,ey, 4.6*s, shadeColor(col,baseShade));
    limb3D(ex,ey,hx,hy, armW2,foreW2, shadeColor(col,baseShade-10), lightDir);
    joint3D(hx,hy, 3.6*s, shadeColor(col,baseShade-16));
    return {ex,ey,hx,hy};
  }
  const rArm = drawArm(shRx,shRy, armRot, elbowR, 1, -6);
  const lArm = drawArm(shLx,shLy, armLRot, elbowL, -1, -22);

  limb3D(shX,shY,neckX,neckY, 6.4*s,6*s, shadeColor(col,-20), lightDir);
  const headGrad = CTX.createRadialGradient(headX-headR*0.32,headY-headR*0.32,headR*0.15, headX,headY,headR);
  headGrad.addColorStop(0, shadeColor(col,60));
  headGrad.addColorStop(0.55, shadeColor(col,5));
  headGrad.addColorStop(1, shadeColor(col,-45));
  CTX.fillStyle = headGrad;
  CTX.beginPath(); CTX.arc(headX,headY,headR,0,Math.PI*2); CTX.fill();
  CTX.strokeStyle = shadeColor(col,-55); CTX.globalAlpha=0.5; CTX.lineWidth=sc(1.4);
  CTX.beginPath(); CTX.arc(headX,headY,headR*0.62, ta+0.5, ta+2.2); CTX.stroke();
  CTX.globalAlpha=1;

  return {hipX,hipY,shX,shY,neckX,neckY,headX,headY,rArm,lArm};
}

// ═══════════════════════════════════════════════════════════════════
//  REAL EQUIPMENT — layered, gradient-shaded shapes that read as
//  actual gym machinery, built with the same lighting model as the
//  human figure so everything in a scene feels like one consistent
//  3D-lit illustration.
// ═══════════════════════════════════════════════════════════════════

function metalGrad(x1,y1,x2,y2, base, hi, lo){
  const g = CTX.createLinearGradient(x1,y1,x2,y2);
  g.addColorStop(0, lo); g.addColorStop(0.45, base); g.addColorStop(0.55, hi); g.addColorStop(1, lo);
  return g;
}

// Barbell with loaded plates. xR/yR = bar center. halfLenPx = half the
// visible bar length in px (already scaled). liftGlow = true adds a glow.
function barbell3D(xR, yR, halfLenPx, opts){
  opts = opts||{};
  const col = opts.col || '#e8c200';
  const x = px(xR), y = py(yR);
  const hl = sc(halfLenPx);
  const barH = sc(5);

  // bar shaft
  CTX.fillStyle = metalGrad(x-hl,y,x+hl,y, '#9a9a9a','#f4f4f4','#3a3a3a');
  CTX.beginPath(); CTX.roundRect(x-hl, y-barH/2, hl*2, barH, sc(2)); CTX.fill();
  // knurling
  CTX.strokeStyle='rgba(0,0,0,0.35)'; CTX.lineWidth=sc(1);
  for(let i=-4;i<=4;i++){ const kx=x+i*hl*0.22; CTX.beginPath(); CTX.moveTo(kx,y-barH/2); CTX.lineTo(kx,y+barH/2); CTX.stroke(); }

  function plate(px2, big){
    const pw = sc(big?15:10), ph = sc(big?38:26);
    CTX.fillStyle = metalGrad(px2-pw/2,y,px2+pw/2,y, big?'#2b2b2b':'#3a3a3a', big?'#7a7a7a':'#8a8a8a', '#0f0f0f');
    CTX.beginPath(); CTX.roundRect(px2-pw/2, y-ph/2, pw, ph, sc(3)); CTX.fill();
    CTX.strokeStyle='rgba(255,255,255,0.18)'; CTX.lineWidth=sc(0.8); CTX.stroke();
    CTX.fillStyle='rgba(0,0,0,0.5)';
    CTX.beginPath(); CTX.arc(px2,y,sc(3),0,Math.PI*2); CTX.fill();
  }
  plate(x-hl-sc(8), true);  plate(x-hl-sc(20), false);
  plate(x+hl+sc(8), true);  plate(x+hl+sc(20), false);

  glow(xR, yR, halfLenPx*0.9, 'rgba(255,221,0,0.10)');
}

// Dumbbell, can be rotated.
function dumbbell3D(xR, yR, opts){
  opts = opts||{};
  const angle = opts.angle||0;
  const x=px(xR), y=py(yR);
  CTX.save(); CTX.translate(x,y); CTX.rotate(angle);
  const hw = sc(17);
  CTX.fillStyle = metalGrad(-hw,0,hw,0, '#aaa','#f6f6f6','#444');
  CTX.beginPath(); CTX.roundRect(-hw,-sc(2.6), hw*2, sc(5.2), sc(2)); CTX.fill();
  for(const side of [-1,1]){
    const cx2 = side*hw*0.78;
    const g = CTX.createRadialGradient(cx2-sc(2),0,sc(1), cx2,0,sc(9));
    g.addColorStop(0,'#999'); g.addColorStop(0.6,'#444'); g.addColorStop(1,'#111');
    CTX.fillStyle = g;
    CTX.beginPath(); CTX.ellipse(cx2,0, sc(6),sc(9.5), 0,0,Math.PI*2); CTX.fill();
    CTX.strokeStyle='rgba(255,255,255,0.15)'; CTX.lineWidth=sc(0.8); CTX.stroke();
  }
  CTX.restore();
}

// Flat or inclined bench. angle in degrees (0=flat, negative=incline up at far end)
function bench3D(xR, yR, opts){
  opts = opts||{};
  const angle = (opts.angle||0)*Math.PI/180;
  const x=px(xR), y=py(yR);
  const w = sc(155), h = sc(15);
  CTX.save(); CTX.translate(x,y); CTX.rotate(angle);
  // pad
  CTX.fillStyle = metalGrad(-w/2,0,w/2,0,'#2a2a55','#4a3a7a','#15152a');
  CTX.beginPath(); CTX.roundRect(-w/2,-h,w,h, sc(4)); CTX.fill();
  CTX.strokeStyle='rgba(168,85,247,0.55)'; CTX.lineWidth=sc(1.5); CTX.stroke();
  // top seam highlight
  CTX.fillStyle='rgba(255,255,255,0.10)';
  CTX.beginPath(); CTX.roundRect(-w/2,-h,w,sc(3), [sc(4),sc(4),0,0]); CTX.fill();
  // legs
  CTX.strokeStyle='rgba(168,85,247,0.55)'; CTX.lineWidth=sc(4); CTX.lineCap='round';
  for(const ox of [-w/2+sc(18), w/2-sc(18)]){
    CTX.beginPath(); CTX.moveTo(ox,0); CTX.lineTo(ox,sc(40)); CTX.stroke();
  }
  CTX.restore();
}

// Squat / bench-press rack uprights with J-hooks, framed to sit behind the lifter
function rack3D(){
  for(const xR of [0.22, 0.78]){
    const x=px(xR);
    const w=sc(9), topY=py(0.06), botY=py(0.86);
    CTX.fillStyle = metalGrad(x-w/2,0,x+w/2,0,'#383850','#5a5a78','#1c1c2c');
    CTX.beginPath(); CTX.roundRect(x-w/2, topY, w, botY-topY, sc(3)); CTX.fill();
    CTX.strokeStyle='rgba(168,85,247,0.4)'; CTX.lineWidth=sc(1); CTX.stroke();
    // J-hook
    CTX.fillStyle='#d8c200';
    const hookY = py(0.42);
    CTX.beginPath(); CTX.roundRect(x-w/2-sc(7), hookY, sc(7), sc(14), sc(2)); CTX.fill();
    CTX.beginPath(); CTX.roundRect(x+w/2, hookY, sc(7), sc(14), sc(2)); CTX.fill();
  }
}

// Wall-mounted pull-up bar
function pullUpBar3D(){
  const y = py(0.14);
  for(const xR of [0.3,0.7]){
    const x=px(xR);
    CTX.fillStyle = metalGrad(x-sc(8),0,x+sc(8),0,'#383850','#5a5a78','#1c1c2c');
    CTX.beginPath(); CTX.roundRect(x-sc(8), 0, sc(16), y, sc(3)); CTX.fill();
  }
  CTX.fillStyle = metalGrad(px(0.2),y,px(0.8),y,'#9a9a9a','#fafafa','#333');
  CTX.beginPath(); CTX.roundRect(px(0.2), y-sc(6), px(0.6), sc(12), sc(5)); CTX.fill();
  CTX.strokeStyle='rgba(0,0,0,0.3)'; CTX.lineWidth=sc(1);
  for(let i=0;i<9;i++){ const kx=px(0.27+i*0.058); CTX.beginPath(); CTX.moveTo(kx,y-sc(5)); CTX.lineTo(kx,y+sc(5)); CTX.stroke(); }
}

// Parallel dip bars
function parallelBars3D(){
  for(const xR of [0.34,0.66]){
    const x=px(xR);
    CTX.fillStyle = metalGrad(x-sc(5),0,x+sc(5),0,'#9a9a9a','#fafafa','#333');
    CTX.beginPath(); CTX.roundRect(x-sc(5), py(0.36), sc(10), sc(58), sc(4)); CTX.fill();
    CTX.strokeStyle='rgba(168,85,247,0.5)'; CTX.lineWidth=sc(3); CTX.lineCap='round';
    for(const dx of [-sc(20),sc(20)]){
      CTX.beginPath(); CTX.moveTo(x, py(0.86)); CTX.lineTo(x+dx, py(0.94)); CTX.stroke();
    }
  }
}

// Leg press machine — seat, backrest, rails, sliding sled
function legPressMachine3D(){
  const sx=px(0.62), sy=py(0.56), sw=sc(135), sh=sc(20);
  CTX.fillStyle = metalGrad(sx,sy,sx+sw,sy,'#2a2a55','#4a3a7a','#15152a');
  CTX.beginPath(); CTX.roundRect(sx,sy,sw,sh,sc(4)); CTX.fill();
  CTX.strokeStyle='rgba(168,85,247,0.55)'; CTX.lineWidth=sc(1.5); CTX.stroke();
  CTX.beginPath(); CTX.roundRect(sx+sw-sc(18), py(0.2), sc(18), sy-py(0.2)+sh, sc(4)); CTX.fill(); CTX.stroke();
  CTX.strokeStyle='rgba(168,85,247,0.35)'; CTX.lineWidth=sc(3);
  for(const dy of [-sc(13),sc(13)]){
    CTX.beginPath(); CTX.moveTo(sx,sy+sh/2+dy); CTX.lineTo(sx-sc(105),sy+sh/2+dy-sc(64)); CTX.stroke();
  }
  const plx = sx-sc(105), ply = sy-sc(64);
  CTX.fillStyle = metalGrad(plx-sc(48),ply,plx+sc(48),ply,'#444','#888','#222');
  CTX.beginPath(); CTX.roundRect(plx-sc(48),ply-sc(11),sc(96),sc(22),sc(4)); CTX.fill();
  CTX.strokeStyle='rgba(168,85,247,0.55)'; CTX.lineWidth=sc(1.4); CTX.stroke();
}

// Cable tower (left or right wall)
function cableTower3D(side){
  const w = sc(28);
  const x = side==='left' ? 0 : CW-w;
  CTX.fillStyle = metalGrad(x,0,x+w,0,'#161628','#26264a','#0a0a14');
  CTX.beginPath(); CTX.rect(x,0,w,CH); CTX.fill();
  CTX.strokeStyle='rgba(168,85,247,0.35)'; CTX.lineWidth=sc(1); CTX.stroke();
  const spoolX = side==='left'? w*0.5 : CW-w*0.5;
  const spoolY = py(0.28);
  CTX.fillStyle = metalGrad(spoolX-sc(10),spoolY,spoolX+sc(10),spoolY,'#333','#777','#111');
  CTX.beginPath(); CTX.roundRect(spoolX-sc(10),spoolY-sc(16),sc(20),sc(32),sc(3)); CTX.fill();
  CTX.strokeStyle='rgba(168,85,247,0.5)'; CTX.lineWidth=sc(1.2); CTX.stroke();
  return spoolX, spoolY;
}

function cableLine(x1R,y1R,x2,y2){
  CTX.strokeStyle='rgba(255,221,0,0.5)'; CTX.lineWidth=sc(2);
  CTX.beginPath(); CTX.moveTo(px(x1R),py(y1R)); CTX.lineTo(x2,y2); CTX.stroke();
}

function cableHandle3D(x,y, style){
  CTX.strokeStyle='#e8c200'; CTX.lineWidth=sc(4); CTX.lineCap='round';
  if(style==='rope'){
    CTX.beginPath(); CTX.moveTo(x-sc(3),y-sc(10)); CTX.lineTo(x-sc(3),y+sc(10)); CTX.stroke();
    CTX.beginPath(); CTX.moveTo(x+sc(3),y-sc(10)); CTX.lineTo(x+sc(3),y+sc(10)); CTX.stroke();
  } else {
    CTX.beginPath(); CTX.moveTo(x-sc(15),y); CTX.lineTo(x+sc(15),y); CTX.stroke();
    CTX.beginPath(); CTX.moveTo(x-sc(15),y); CTX.lineTo(x-sc(21),y+sc(11)); CTX.stroke();
    CTX.beginPath(); CTX.moveTo(x+sc(15),y); CTX.lineTo(x+sc(21),y+sc(11)); CTX.stroke();
  }
}

// Chair / table props used in home workouts
function chairProp3D(xR, yR){
  const x=px(xR), y=py(yR);
  CTX.fillStyle = metalGrad(x-sc(46),y,x+sc(46),y,'#2a2a55','#4a3a7a','#15152a');
  CTX.beginPath(); CTX.roundRect(x-sc(46),y,sc(92),sc(13),sc(3)); CTX.fill();
  CTX.strokeStyle='rgba(168,85,247,0.5)'; CTX.lineWidth=sc(1.4); CTX.stroke();
  CTX.beginPath(); CTX.roundRect(x+sc(32),y-sc(44),sc(13),sc(44),sc(3)); CTX.fill(); CTX.stroke();
  CTX.strokeStyle='rgba(168,85,247,0.45)'; CTX.lineWidth=sc(4); CTX.lineCap='round';
  for(const dx of [-sc(38),sc(38)]){ CTX.beginPath(); CTX.moveTo(x+dx,y+sc(13)); CTX.lineTo(x+dx,y+sc(44)); CTX.stroke(); }
}

function tableProp3D(xR, yR, wPx){
  const x=px(xR), y=py(yR), w=sc(wPx);
  CTX.fillStyle = metalGrad(x-w/2,y,x+w/2,y,'#2a2a55','#4a3a7a','#15152a');
  CTX.beginPath(); CTX.roundRect(x-w/2,y,w,sc(15),sc(3)); CTX.fill();
  CTX.strokeStyle='rgba(168,85,247,0.55)'; CTX.lineWidth=sc(1.5); CTX.stroke();
  CTX.strokeStyle='rgba(168,85,247,0.4)'; CTX.lineWidth=sc(5); CTX.lineCap='round';
  for(const dx of [-w/2+sc(14), w/2-sc(14)]){
    CTX.beginPath(); CTX.moveTo(x+dx,y+sc(15)); CTX.lineTo(x+dx,y+sc(60)); CTX.stroke();
  }
}

function wallProp3D(side){
  const w = sc(26);
  const x = side==='right' ? CW-w : 0;
  CTX.fillStyle = metalGrad(x,0,x+w,0,'#161628','#26264a','#0a0a14');
  CTX.beginPath(); CTX.rect(x,0,w,CH); CTX.fill();
  CTX.strokeStyle='rgba(168,85,247,0.3)'; CTX.lineWidth=sc(1); CTX.stroke();
}

// ═══════════════════════════════════════════════════════════════════
//  EXERCISE METADATA — name / target muscle / max reps per animation
// ═══════════════════════════════════════════════════════════════════
const ANIM_META = {
  bench:{name:'Flat Bench Press',muscle:'Pectoralis Major',maxRep:8},
  incline_press:{name:'Incline Dumbbell Press',muscle:'Upper Chest — Clavicular Head',maxRep:12},
  cable_fly:{name:'Cable Crossover',muscle:'Chest — Isolation',maxRep:15},
  pushdown:{name:'Tricep Pushdown',muscle:'Triceps — Lateral Head',maxRep:12},
  oh_ext:{name:'OH DB Extension',muscle:'Triceps — Long Head',maxRep:12},
  dips:{name:'Tricep Dips',muscle:'Triceps — All 3 Heads',maxRep:10},
  deadlift:{name:'Conventional Deadlift',muscle:'Entire Posterior Chain',maxRep:5},
  pullup:{name:'Pull-Up',muscle:'Lats — Width Builder',maxRep:10},
  bent_row:{name:'Barbell Bent-Over Row',muscle:'Mid-Back · Rhomboids',maxRep:8},
  cable_row:{name:'Seated Cable Row',muscle:'Mid-Back — Thickness',maxRep:12},
  bicep_curl:{name:'Barbell Bicep Curl',muscle:'Biceps — Long + Short Head',maxRep:10},
  hammer_curl:{name:'Hammer Curl',muscle:'Brachialis · Brachioradialis',maxRep:12},
  squat:{name:'Barbell Back Squat',muscle:'Quads · Glutes · Hamstrings',maxRep:8},
  leg_press:{name:'Leg Press',muscle:'Quads — Machine',maxRep:12},
  rdl:{name:'Romanian Deadlift',muscle:'Hamstrings · Glutes',maxRep:10},
  lunge:{name:'Walking Lunges',muscle:'Quads · Glutes · Balance',maxRep:12},
  leg_ext:{name:'Leg Extension',muscle:'Quads — Isolation',maxRep:15},
  calf:{name:'Standing Calf Raise',muscle:'Calves — Gastrocnemius',maxRep:20},
  shoulder_press:{name:'Seated DB OH Press',muscle:'Anterior + Medial Delt',maxRep:10},
  lateral_raise:{name:'Dumbbell Lateral Raise',muscle:'Medial Delt — Width Builder',maxRep:15},
  rear_fly:{name:'Rear Delt Fly',muscle:'Posterior Delt — Posture',maxRep:15},
  shrug:{name:'Barbell Shrug',muscle:'Traps — Upper',maxRep:15},
  plank:{name:'Plank',muscle:'Core — Anterior Foundation',maxRep:1},
  crunch:{name:'Weighted Crunch',muscle:'Rectus Abdominis',maxRep:20},
  leg_raise:{name:'Hanging Leg Raise',muscle:'Lower Abs · Hip Flexors',maxRep:12},
  skull:{name:'Skull Crusher',muscle:'Triceps — Long Head',maxRep:10},
  inc_curl:{name:'Incline DB Curl',muscle:'Biceps — Long Head Stretch',maxRep:12},
  wrist_curl:{name:'Barbell Wrist Curl',muscle:'Forearms — Flexors',maxRep:20},
  rev_curl:{name:'Reverse Barbell Curl',muscle:'Forearms — Extensors',maxRep:15},
  standing_ohp:{name:'Standing Barbell OHP',muscle:'Shoulders · Core · Triceps',maxRep:5},
  face_pull:{name:'Face Pulls',muscle:'Rear Delt · Rotator Cuff',maxRep:20},
  plyo_push:{name:'Plyometric Push-Up',muscle:'Chest · Shoulders · Power',maxRep:10},
  hip_stretch:{name:'Hip Flexor Stretch',muscle:'Hip Flexors — Recovery',maxRep:1},
  foam_roll:{name:'Foam Roll',muscle:'Myofascial Release',maxRep:1},
  shoulder_str:{name:'Shoulder Stretch',muscle:'Posterior Delt — Recovery',maxRep:1},
  pushup:{name:'Standard Push-Up',muscle:'Chest · Triceps · Ant. Delt',maxRep:15},
  wide_push:{name:'Wide Push-Up',muscle:'Outer Chest — Width',maxRep:12},
  diamond:{name:'Diamond Push-Up',muscle:'Triceps · Inner Chest',maxRep:10},
  pike:{name:'Pike Push-Up',muscle:'Shoulders — Ant. + Medial',maxRep:10},
  decline:{name:'Decline Push-Up',muscle:'Upper Chest — Clavicular',maxRep:10},
  chair_dip:{name:'Chair Tricep Dip',muscle:'Triceps — All 3 Heads',maxRep:12},
  planche:{name:'Pseudo Planche Push-Up',muscle:'Ant. Delt · Chest · Core',maxRep:8},
  table_row:{name:'Table / Door Row',muscle:'Lats · Mid-Back · Biceps',maxRep:15},
  towel_curl:{name:'Towel Bicep Curl',muscle:'Biceps — Full Range',maxRep:15},
  superman:{name:'Superman Hold',muscle:'Lower Back · Glutes',maxRep:12},
  pull_apart:{name:'Rear Delt Pull-Apart',muscle:'Posterior Delt · Rhomboids',maxRep:20},
  arch_hold:{name:'Arch Body Hold',muscle:'Entire Posterior Chain',maxRep:1},
  iso_curl:{name:'Isometric Bicep Curl',muscle:'Biceps — Peak Density',maxRep:1},
  bw_squat:{name:'Bodyweight Squat',muscle:'Quads · Glutes · Hamstrings',maxRep:20},
  jump_squat:{name:'Jump Squat',muscle:'Quads · Glutes — Explosive',maxRep:12},
  bss:{name:'Bulgarian Split Squat',muscle:'Quads · Glutes — Single Leg',maxRep:10},
  glute_br:{name:'Glute Bridge',muscle:'Glutes · Hamstrings',maxRep:20},
  wall_sit:{name:'Wall Sit',muscle:'Quads — Isometric',maxRep:1},
  calf_step:{name:'Calf Raise (Step)',muscle:'Calves — Gastrocnemius',maxRep:25},
  slg_bridge:{name:'Single-Leg Glute Bridge',muscle:'Glutes — Unilateral',maxRep:15},
  hollow:{name:'Hollow Body Hold',muscle:'Deep Core — Gymnastics',maxRep:1},
  bicycle:{name:'Bicycle Crunch',muscle:'Obliques · Rectus Abdominis',maxRep:20},
  leg_raise_h:{name:'Leg Raise',muscle:'Lower Abs · Hip Flexors',maxRep:15},
  mt_climb:{name:'Mountain Climber',muscle:'Core · Cardio · Hip Flexors',maxRep:20},
  side_plank:{name:'Side Plank',muscle:'Obliques — Lateral Core',maxRep:1},
  v_up:{name:'V-Up',muscle:'Full Abs — Advanced',maxRep:12},
  burpee:{name:'Burpee',muscle:'Full Body — Conditioning',maxRep:10},
  pu_row:{name:'Push-Up to Row',muscle:'Chest · Lats · Core',maxRep:8},
  jump_lunge:{name:'Jump Lunge',muscle:'Quads · Glutes — Explosive',maxRep:10},
  bear_crawl:{name:'Bear Crawl',muscle:'Shoulders · Core · Hips',maxRep:1},
  pu_tap:{name:'Push-Up Shoulder Tap',muscle:'Chest · Core Anti-rotation',maxRep:10},
  squat_tuck:{name:'Squat Jump Tuck',muscle:'Legs · Core — Explosive',maxRep:8},
  inchworm:{name:'Inchworm',muscle:'Hamstrings · Shoulders · Core',maxRep:8},

// ── HOME WORKOUT ANIMATIONS (blue #4fa8ff base color) ──────────────
pushup(t){
  const p=Math.sin(t*Math.PI*2)*0.5+0.5;
  floorLine(0.84);
  human3D(0.5,0.7+p*0.07,{
    torsoAngle:0, armRot:80-p*180,armLRot:-80+p*180, elbowR:0.6-p*0.5,elbowL:0.6-p*0.5,
    legRot:-2,legLRot:2, col:'#4fa8ff', scale:0.88,
  });
  watermark('PUSH-UP'); repFlash(t,0.18,'rgba(79,168,255,');
},

wide_push(t){
  const p=Math.sin(t*Math.PI*2)*0.5+0.5;
  floorLine(0.84);
  human3D(0.5,0.7+p*0.07,{
    torsoAngle:0, armRot:96-p*190,armLRot:-96+p*190, elbowR:0.55-p*0.45,elbowL:0.55-p*0.45,
    legRot:-2,legLRot:2, col:'#4fa8ff', scale:0.88,
  });
  watermark('WIDE PUSH-UP'); repFlash(t,0.18,'rgba(79,168,255,');
},

diamond(t){
  const p=Math.sin(t*Math.PI*2)*0.5+0.5;
  floorLine(0.84);
  human3D(0.5,0.7+p*0.07,{
    torsoAngle:0, armRot:30-p*60,armLRot:-30+p*60, elbowR:0.55-p*0.45,elbowL:0.55-p*0.45,
    legRot:-2,legLRot:2, col:'#4fa8ff', scale:0.88,
  });
  watermark('DIAMOND PUSH-UP'); repFlash(t,0.18,'rgba(79,168,255,');
},

pike(t){
  const p=Math.sin(t*Math.PI*2)*0.5+0.5;
  floorLine(0.9);
  human3D(0.5,0.78,{
    torsoAngle:46,
    armRot:160+p*16, armLRot:-160-p*16, elbowR:0.5-p*0.35,elbowL:0.5-p*0.35,
    legRot:8,legLRot:-8, col:'#4fa8ff', scale:0.9,
  });
  watermark('PIKE PUSH-UP'); repFlash(t,0.18,'rgba(79,168,255,');
},

decline(t){
  const p=Math.sin(t*Math.PI*2)*0.5+0.5;
  chairProp3D(0.66,0.62);
  floorLine(0.84);
  human3D(0.42,0.66,{
    torsoAngle:-12, armRot:84-p*172,armLRot:-84+p*172, elbowR:0.55-p*0.45,elbowL:0.55-p*0.45,
    legRot:-10,legLRot:10, col:'#4fa8ff', scale:0.86,
  });
  watermark('DECLINE PUSH-UP'); repFlash(t,0.18,'rgba(79,168,255,');
},

chair_dip(t){
  const p=Math.sin(t*Math.PI*2)*0.5+0.5;
  chairProp3D(0.5,0.5);
  floorLine(0.9);
  human3D(0.5,0.4+p*0.13,{
    armRot:-96,armLRot:96, elbowR:p*0.55,elbowL:p*0.55,
    legRot:16,legLRot:-16, kneeR:0.55,kneeL:0.55,
    col:'#4fa8ff', scale:0.88,
  });
  watermark('CHAIR DIP'); repFlash(t,0.86,'rgba(79,168,255,');
},

planche(t){
  const p=Math.sin(t*Math.PI*2)*0.5+0.5;
  floorLine(0.84);
  human3D(0.5,0.68+p*0.06,{
    torsoAngle:0, lean:16,
    armRot:100,armLRot:-100, elbowR:0.55-p*0.45,elbowL:0.55-p*0.45,
    legRot:-2,legLRot:2, col:'#4fa8ff', scale:0.88,
  });
  watermark('PSEUDO PLANCHE'); repFlash(t,0.18,'rgba(79,168,255,');
},

table_row(t){
  const p=Math.sin(t*Math.PI*2)*0.5+0.5;
  tableProp3D(0.5,0.38,210);
  floorLine(0.9);
  human3D(0.5,0.58-p*0.12,{
    torsoAngle:0, armRot:-95+p*18,armLRot:95-p*18, elbowR:p*0.5,elbowL:p*0.5,
    legRot:-2,legLRot:2, col:'#4fa8ff', scale:0.86,
  });
  watermark('TABLE ROW'); repFlash(t,0.86,'rgba(79,168,255,');
},

towel_curl(t){
  const p=Math.sin(t*Math.PI*2)*0.5+0.5;
  wallProp3D('left');
  human3D(0.5,0.78,{
    torsoAngle:84-p*16,
    armRot:24-p*150, armLRot:-24+p*150, elbowR:p*0.95,elbowL:p*0.95,
    legRot:14,legLRot:-14, col:'#4fa8ff', scale:0.9,
  });
  watermark('TOWEL BICEP CURL'); repFlash(t,0.16,'rgba(79,168,255,');
},

superman(t){
  const p=Math.sin(t*Math.PI*2)*0.5+0.5;
  floorLine(0.84);
  human3D(0.5,0.7,{
    torsoAngle:0, lean:p*6,
    armRot:120+p*40, armLRot:-120-p*40, elbowR:0.06,elbowL:0.06,
    legRot:-3-p*10, legLRot:3+p*10, col:'#4fa8ff', scale:0.88,
  });
  watermark('SUPERMAN HOLD'); repFlash(t,0.18,'rgba(79,168,255,');
},

pull_apart(t){
  const p=Math.sin(t*Math.PI*2)*0.5+0.5;
  human3D(0.5,0.76,{
    armRot:8-p*78, armLRot:-8+p*78, elbowR:0.08,elbowL:0.08,
    legRot:8,legLRot:-8, col:'#4fa8ff', scale:0.95,
  });
  CTX.strokeStyle=`rgba(79,168,255,${0.4+p*0.4})`; CTX.lineWidth=sc(5); CTX.lineCap='round';
  CTX.beginPath(); CTX.moveTo(px(0.32-p*0.08),py(0.58)); CTX.lineTo(px(0.68+p*0.08),py(0.58)); CTX.stroke();
  watermark('PULL-APART'); repFlash(t,0.16,'rgba(79,168,255,');
},

arch_hold(t){
  const p=Math.sin(t*Math.PI*2)*0.5+0.5;
  floorLine(0.84);
  human3D(0.5,0.72,{
    torsoAngle:0, lean:-p*10,
    armRot:130+p*30, armLRot:-130-p*30, elbowR:0.06,elbowL:0.06,
    legRot:-3-p*10, legLRot:3+p*10, col:'#4fa8ff', scale:0.88,
  });
  watermark('ARCH BODY HOLD'); repFlash(t,0.18,'rgba(79,168,255,');
},

iso_curl(t){
  const p=Math.sin(t*Math.PI*2)*0.5+0.5;
  tableProp3D(0.5,0.5,150);
  human3D(0.5,0.72,{
    torsoAngle:84,
    armRot:158+p*5,armLRot:-158-p*5, elbowR:0.78+p*0.1,elbowL:0.78+p*0.1,
    legRot:24,legLRot:-24, kneeR:0.85,kneeL:0.85,
    col:'#4fa8ff', scale:0.84,
  });
  watermark('ISOMETRIC CURL');
},

bw_squat(t){
  const p=Math.sin(t*Math.PI*2)*0.5+0.5; const d=p*0.18;
  floorLine(0.9);
  human3D(0.5,0.74+d,{
    torsoAngle:86+(1-p)*8,
    armRot:-92,armLRot:92,
    legRot:22+d*92,legLRot:-22-d*92, kneeR:d*2.4,kneeL:d*2.4,
    col:'#4fa8ff', scale:0.95,
  });
  watermark('BODYWEIGHT SQUAT'); repFlash(t,0.16,'rgba(79,168,255,');
},

jump_squat(t){
  const p=Math.sin(t*Math.PI*2)*0.5+0.5;
  const airH = p>0.6 ? (p-0.6)/0.4*0.28 : 0;
  floorLine(0.9);
  human3D(0.5,0.76-airH,{
    armRot: airH>0.1?-160:-92, armLRot: airH>0.1?160:92,
    legRot: airH>0.1?10:18, legLRot: airH>0.1?-10:-18,
    kneeR: airH>0.1?0.06:0, kneeL: airH>0.1?0.06:0,
    col:'#4fa8ff', scale:0.93,
  });
  if(airH>0.04) glow(0.5,0.88,68,'rgba(79,168,255,0.14)');
  watermark('JUMP SQUAT'); repFlash(t,0.16,'rgba(79,168,255,');
},

bss(t){
  const p=Math.sin(t*Math.PI*2)*0.5+0.5;
  chairProp3D(0.74,0.58);
  floorLine(0.9);
  human3D(0.42,0.74+p*0.06,{
    armRot:50,armLRot:-50,
    legRot:26+p*10,legLRot:-16, kneeR:p*0.45,kneeL:0.3,
    col:'#4fa8ff', scale:0.9,
  });
  watermark('BULGARIAN SPLIT SQUAT'); repFlash(t,0.16,'rgba(79,168,255,');
},

glute_br(t){
  const p=Math.sin(t*Math.PI*2)*0.5+0.5;
  floorLine(0.84);
  human3D(0.5,0.76,{
    torsoAngle:-p*22,
    armRot:88,armLRot:88, elbowR:0.3,elbowL:0.3,
    legRot:30-p*8,legLRot:-30+p*8, kneeR:0.78-p*0.35,kneeL:0.78-p*0.35,
    col:'#4fa8ff', scale:0.88,
  });
  watermark('GLUTE BRIDGE'); repFlash(t,0.16,'rgba(79,168,255,');
},

slg_bridge(t){ ANIMS.glute_br(t); },

wall_sit(t){
  wallProp3D('right');
  floorLine(0.9);
  human3D(0.66,0.56,{
    armRot:74,armLRot:-74, elbowR:0.08,elbowL:0.08,
    legRot:46,legLRot:-46, kneeR:0.95,kneeL:0.95,
    col:'#4fa8ff', scale:0.88,
  });
  holdTimer(0.3,_t*62); watermark('WALL SIT');
},

calf_step(t){ ANIMS.calf(t); },

hollow(t){
  const p=Math.sin(t*Math.PI)*0.5+0.5;
  floorLine(0.84);
  human3D(0.5,0.78,{
    torsoAngle:-p*16,
    armRot:130+p*30,armLRot:-130-p*30, elbowR:0.06,elbowL:0.06,
    legRot:-10+p*16, legLRot:10-p*16, col:'#4fa8ff', scale:0.88,
  });
  watermark('HOLLOW BODY HOLD');
},

bicycle(t){
  const p=Math.sin(t*Math.PI*2);
  floorLine(0.9);
  human3D(0.5,0.74,{
    torsoAngle:-16,
    armRot:-40+p*40,armLRot:40-p*40, elbowR:0.5,elbowL:0.5,
    legRot:16+p*30,legLRot:-16-p*30, kneeR:0.42+p*0.4,kneeL:0.42-p*0.4,
    col:'#4fa8ff', scale:0.88,
  });
  watermark('BICYCLE CRUNCH'); repFlash(t,0.16,'rgba(79,168,255,');
},

leg_raise_h(t){
  const p=Math.sin(t*Math.PI*2)*0.5+0.5;
  floorLine(0.9);
  human3D(0.5,0.74,{
    torsoAngle:0, armRot:90,armLRot:90,
    legRot:-42+p*62, legLRot:42-p*62, kneeR:0.04,kneeL:0.04,
    col:'#4fa8ff', scale:0.88,
  });
  watermark('LEG RAISE'); repFlash(t,0.16,'rgba(79,168,255,');
},

mt_climb(t){
  const p=Math.sin(t*Math.PI*4)*0.5+0.5;
  floorLine(0.84);
  human3D(0.5,0.7,{
    torsoAngle:0, armRot:88,armLRot:-88, elbowR:0.5,elbowL:0.5,
    legRot:-16+p*36, legLRot:16-p*36, kneeR:p*0.55,kneeL:(1-p)*0.55,
    col:'#4fa8ff', scale:0.88,
  });
  watermark('MOUNTAIN CLIMBER'); repFlash(t,0.18,'rgba(79,168,255,');
},

side_plank(t){
  const pulse=Math.sin(t*Math.PI*4)*0.008;
  floorLine(0.86);
  human3D(0.42,0.68+pulse,{
    torsoAngle:46, armRot:-92,armLRot:6, elbowR:0.78,elbowL:0.08,
    legRot:46,legLRot:36, col:'#4fa8ff', scale:0.86,
  });
  holdTimer(0.3,_t*32); watermark('SIDE PLANK');
},

v_up(t){
  const p=Math.sin(t*Math.PI*2)*0.5+0.5;
  floorLine(0.9);
  human3D(0.5,0.72,{
    torsoAngle:-32+p*62,
    armRot:-90+p*86, armLRot:90-p*86, elbowR:0.06,elbowL:0.06,
    legRot:-32+p*52, legLRot:32-p*52, kneeR:0.04,kneeL:0.04,
    col:'#4fa8ff', scale:0.88,
  });
  watermark('V-UP'); repFlash(t,0.16,'rgba(79,168,255,');
},

burpee(t){
  const ph=t%1;
  floorLine(0.9);
  if(ph<0.3){
    const pp=ph/0.3;
    human3D(0.5,0.76+pp*0.06,{
      torsoAngle:86-(1-pp)*38, armRot:-92,armLRot:92,
      legRot:18+pp*10,legLRot:-18-pp*10, kneeR:pp*0.5,kneeL:pp*0.5,
      col:'#4fa8ff', scale:0.92,
    });
  } else if(ph<0.55){
    human3D(0.5,0.7,{
      torsoAngle:0, armRot:88,armLRot:-88, elbowR:0.5,elbowL:0.5,
      legRot:-2,legLRot:2, col:'#4fa8ff', scale:0.88,
    });
  } else {
    const pp=(ph-0.55)/0.45; const airH=pp*0.3;
    human3D(0.5,0.76-airH,{
      armRot:-176+pp*30, armLRot:176-pp*30,
      legRot:8,legLRot:-8, col:'#4fa8ff', scale:0.92,
    });
    if(airH>0.05) glow(0.5,0.88,70,'rgba(79,168,255,0.14)');
  }
  watermark('BURPEE'); repFlash(t,0.16,'rgba(79,168,255,');
},

pu_row(t){
  const ph=t%1;
  floorLine(0.84);
  if(ph<0.5){
    const p2=Math.sin(ph*Math.PI*2)*0.5+0.5;
    human3D(0.5,0.7+p2*0.07,{
      torsoAngle:0, armRot:88,armLRot:-88, elbowR:0.6-p2*0.5,elbowL:0.6-p2*0.5,
      legRot:-2,legLRot:2, col:'#4fa8ff', scale:0.88,
    });
  } else {
    const p3=(ph-0.5)/0.5;
    human3D(0.5,0.7,{
      torsoAngle:34, armRot:-100+p3*90, armLRot:100,
      elbowR:p3*0.5,elbowL:0.6, legRot:30,legLRot:22,
      col:'#4fa8ff', scale:0.88,
    });
  }
  watermark('PUSH-UP TO ROW'); repFlash(t,0.18,'rgba(79,168,255,');
},

jump_lunge(t){
  const p=Math.sin(t*Math.PI*2)*0.5+0.5;
  const airH = p>0.55 ? (p-0.55)/0.45*0.24 : 0;
  floorLine(0.9);
  human3D(0.5,0.76-airH,{
    armRot: airH>0.05?-160:50, armLRot: airH>0.05?160:-140,
    legRot: airH>0.05?20:30, legLRot: airH>0.05?-20:-16,
    kneeR: airH>0.05?0.18:0.45, kneeL: airH>0.05?0.18:0.14,
    col:'#4fa8ff', scale:0.93,
  });
  if(airH>0.04) glow(0.5,0.88,60,'rgba(79,168,255,0.13)');
  watermark('JUMP LUNGE'); repFlash(t,0.16,'rgba(79,168,255,');
},

bear_crawl(t){
  const step=Math.sin(t*Math.PI*4)*0.5+0.5;
  floorLine(0.84);
  human3D(0.5,0.68,{
    torsoAngle:0,
    armRot:70+step*30, armLRot:-70-step*30, elbowR:0.5,elbowL:0.5,
    legRot:-18-step*16, legLRot:18+step*16, kneeR:step*0.4,kneeL:(1-step)*0.4,
    col:'#4fa8ff', scale:0.88,
  });
  watermark('BEAR CRAWL');
},

pu_tap(t){
  const ph=t%1; const p=Math.sin(ph*Math.PI*2)*0.5+0.5;
  floorLine(0.84);
  human3D(0.5,0.7+p*0.07,{
    torsoAngle:0,
    armRot: ph>0.65 ? -20 : 88, armLRot:-88,
    elbowR: ph>0.65 ? 0.3 : 0.6-p*0.5, elbowL:0.6-p*0.5,
    legRot:-2,legLRot:2, col:'#4fa8ff', scale:0.88,
  });
  watermark('PUSH-UP SHOULDER TAP'); repFlash(t,0.18,'rgba(79,168,255,');
},

squat_tuck(t){
  const p=Math.sin(t*Math.PI*2)*0.5+0.5;
  const airH = p>0.5 ? (p-0.5)/0.5*0.32 : 0;
  floorLine(0.9);
  if(airH>0.08){
    human3D(0.5,0.72-airH,{
      armRot:-60,armLRot:60, elbowR:0.3,elbowL:0.3,
      legRot:46,legLRot:-46, kneeR:1,kneeL:1, col:'#4fa8ff', scale:0.9,
    });
    glow(0.5,0.88,76,'rgba(79,168,255,0.15)');
  } else {
    human3D(0.5,0.76,{
      armRot:-92,armLRot:92, legRot:18,legLRot:-18, col:'#4fa8ff', scale:0.93,
    });
  }
  watermark('SQUAT JUMP TUCK'); repFlash(t,0.16,'rgba(79,168,255,');
},

inchworm(t){
  const ph=t%1;
  floorLine(0.9);
  if(ph<0.35){
    const pp=ph/0.35;
    human3D(0.5,0.76,{
      torsoAngle:86-pp*54, armRot:100+pp*-12,armLRot:-100+pp*12, elbowR:pp*0.16,elbowL:pp*0.16,
      legRot:8,legLRot:-8, col:'#4fa8ff', scale:0.9,
    });
  } else if(ph<0.65){
    human3D(0.5,0.7,{
      torsoAngle:0, armRot:88,armLRot:-88, elbowR:0.5,elbowL:0.5,
      legRot:-2,legLRot:2, col:'#4fa8ff', scale:0.88,
    });
  } else {
    const pp=(ph-0.65)/0.35;
    human3D(0.5,0.76,{
      torsoAngle:32+pp*54, armRot:90-pp*-10,armLRot:-90+pp*10, elbowR:(1-pp)*0.16,elbowL:(1-pp)*0.16,
      legRot:8,legLRot:-8, col:'#4fa8ff', scale:0.9,
    });
  }
  watermark('INCHWORM');
},

};

// ═══════════════════════════════════════════════════════════════════
//  EXERCISE ANIMATIONS — gym page (cyan #1ecbff base color)
// ═══════════════════════════════════════════════════════════════════
const ANIMS = {
// Angle convention for human3D: 0deg = limb points straight DOWN,
// 90deg = points to the model's right side, -90deg = left side,
// 180/-180deg = points straight UP. All poses below were checked
// against this convention to match real exercise form.

bench(t){
  const p=Math.sin(t*Math.PI*2)*0.5+0.5;
  floorLine(0.9);
  rack3D();
  bench3D(0.5, 0.78);
  human3D(0.5, 0.62, {
    torsoAngle:0,
    armRot:170-p*60, armLRot:-170+p*60,   // arms from bent-at-chest to pressed-up
    elbowR:0.85-p*0.8, elbowL:0.85-p*0.8,
    legRot:35, legLRot:-35, kneeR:0.9, kneeL:0.9,
    col:'#1ecbff', scale:0.92,
  });
  barbell3D(0.5, 0.3+p*0.13, 62, {});
  watermark('BENCH PRESS'); repFlash(t,0.15);
},

incline_press(t){
  const p=Math.sin(t*Math.PI*2)*0.5+0.5;
  bench3D(0.54, 0.8, {angle:-26});
  const f1 = human3D(0.46, 0.6, {
    torsoAngle:32,
    armRot:160-p*40, armLRot:-160+p*40,
    elbowR:0.8-p*0.7, elbowL:0.8-p*0.7,
    legRot:30, legLRot:-30, kneeR:0.85, kneeL:0.85,
    col:'#1ecbff', scale:0.9,
  });
  dumbbell3D(toRatioX(f1.rArm.hx),toRatioY(f1.rArm.hy),{angle:-0.25});
  dumbbell3D(toRatioX(f1.lArm.hx),toRatioY(f1.lArm.hy),{angle:0.25});
  watermark('INCLINE PRESS'); repFlash(t,0.18);
},

cable_fly(t){
  const p=Math.sin(t*Math.PI*2)*0.5+0.5;
  cableTower3D('left'); cableTower3D('right');
  const lx=px(0.38-p*0.1), ly=py(0.42), rx=px(0.62+p*0.1), ry=py(0.42);
  cableLine(0.04,0.28,lx,ly); cableLine(0.96,0.28,rx,ry);
  cableHandle3D(lx,ly,'v'); cableHandle3D(rx,ry,'v');
  human3D(0.5,0.74,{
    armRot:90-p*70, armLRot:-90+p*70, elbowR:0.18,elbowL:0.18,
    legRot:8,legLRot:-8, col:'#1ecbff', scale:0.94,
  });
  watermark('CABLE CROSSOVER'); repFlash(t,0.16);
},

pushdown(t){
  const p=Math.sin(t*Math.PI*2)*0.5+0.5;
  cableTower3D('right');
  const hx=px(0.56), hy=py(0.42+p*0.16);
  cableLine(0.92,0.06,hx,hy); cableHandle3D(hx,hy,'v');
  human3D(0.46,0.74,{
    armRot:30-p*30, armLRot:-30+p*30, elbowR:0.85-p*0.55,elbowL:0.85-p*0.55,
    legRot:8,legLRot:-8, col:'#1ecbff', scale:0.94,
  });
  watermark('TRICEP PUSHDOWN'); repFlash(t,0.16);
},

oh_ext(t){
  const p=Math.sin(t*Math.PI*2)*0.5+0.5;
  const f2 = human3D(0.5,0.74,{
    armRot:172, armLRot:-172, elbowR:0.85-p*0.75, elbowL:0.85-p*0.75,
    legRot:8,legLRot:-8, col:'#1ecbff', scale:0.94,
  });
  const mx=(f2.rArm.hx+f2.lArm.hx)/2, my=(f2.rArm.hy+f2.lArm.hy)/2;
  dumbbell3D(toRatioX(mx),toRatioY(my), {angle:0});
  watermark('OH EXTENSION'); repFlash(t,0.18);
},

dips(t){
  const p=Math.sin(t*Math.PI*2)*0.5+0.5;
  parallelBars3D();
  human3D(0.5,0.42+p*0.14,{
    armRot:96,armLRot:-96, elbowR:p*0.5,elbowL:p*0.5,
    legRot:8,legLRot:-8, kneeR:0.25,kneeL:0.25,
    col:'#1ecbff', scale:0.9,
  });
  watermark('DIPS'); repFlash(t,0.82);
},

deadlift(t){
  const p=Math.sin(t*Math.PI*2)*0.5+0.5;
  floorLine(0.92);
  const fD = human3D(0.5,0.78,{
    torsoAngle:48+p*42,
    armRot:8, armLRot:-8, elbowR:0.04,elbowL:0.04,
    legRot:14+p*4, legLRot:-14-p*4, kneeR:(1-p)*0.3, kneeL:(1-p)*0.3,
    col:'#1ecbff', scale:0.96,
  });
  const bx=(fD.rArm.hx+fD.lArm.hx)/2, by=(fD.rArm.hy+fD.lArm.hy)/2;
  barbell3D(toRatioX(bx), toRatioY(by), 64, {});
  watermark('DEADLIFT'); repFlash(t,0.16);
},

pullup(t){
  const p=Math.sin(t*Math.PI*2)*0.5+0.5;
  pullUpBar3D();
  human3D(0.5,0.42+p*0.3,{
    armRot:172-p*16, armLRot:-172+p*16, elbowR:p*0.55,elbowL:p*0.55,
    legRot:8,legLRot:-8, kneeR:0.2,kneeL:0.2,
    col:'#1ecbff', scale:0.88,
  });
  watermark('PULL-UP'); repFlash(t,0.88);
},

squat(t){
  const p=Math.sin(t*Math.PI*2)*0.5+0.5; const d=p*0.22;
  floorLine(0.9); rack3D();
  human3D(0.5,0.74+d,{
    torsoAngle:84+(1-p)*10,
    armRot:172,armLRot:-172, elbowR:0.05,elbowL:0.05,
    legRot:22+d*90,legLRot:-22-d*90, kneeR:d*2.4,kneeL:d*2.4,
    col:'#1ecbff', scale:0.94,
  });
  barbell3D(0.5, 0.46+d*0.6, 58,{});
  watermark('BACK SQUAT'); repFlash(t,0.14);
},

leg_press(t){
  const p=Math.sin(t*Math.PI*2)*0.5+0.5;
  legPressMachine3D();
  human3D(0.74,0.52,{
    torsoAngle:14,
    armRot:50,armLRot:-50, elbowR:0.5,elbowL:0.5,
    legRot:-150+p*55, legLRot:-150+p*55, kneeR:(1-p)*0.55,kneeL:(1-p)*0.55,
    col:'#1ecbff', scale:0.8,
  });
  watermark('LEG PRESS'); repFlash(t,0.84);
},

bent_row(t){
  const p=Math.sin(t*Math.PI*2)*0.5+0.5;
  floorLine(0.9);
  human3D(0.5,0.72,{
    torsoAngle:46,
    armRot:16-p*120, armLRot:-16+p*120, elbowR:p*0.6, elbowL:p*0.6,
    legRot:10,legLRot:-10, col:'#1ecbff', scale:0.94,
  });
  barbell3D(0.5, 0.66-p*0.14, 56,{});
  watermark('BENT-OVER ROW'); repFlash(t,0.18);
},

cable_row(t){
  const p=Math.sin(t*Math.PI*2)*0.5+0.5;
  cableTower3D('left');
  const hx=px(0.42-p*0.06), hy=py(0.56);
  cableLine(0.04,0.55,hx,hy); cableHandle3D(hx,hy,'v');
  human3D(0.6,0.7,{
    torsoAngle:84+p*8,
    armRot:50-p*100, armLRot:-50+p*100, elbowR:p*0.6,elbowL:p*0.6,
    legRot:36,legLRot:-36, kneeR:0.8,kneeL:0.8,
    col:'#1ecbff', scale:0.88,
  });
  watermark('CABLE ROW'); repFlash(t,0.18);
},

bicep_curl(t){
  const p=Math.sin(t*Math.PI*2)*0.5+0.5;
  human3D(0.5,0.76,{
    armRot:12, armLRot:-12, elbowR:p*1.4, elbowL:p*1.4,
    legRot:8,legLRot:-8, col:'#1ecbff', scale:0.95,
  });
  barbell3D(0.5, 0.7-p*0.26, 42,{});
  watermark('BICEP CURL'); repFlash(t,0.16);
},

hammer_curl(t){
  const p=Math.sin(t*Math.PI*2)*0.5+0.5; const p2=Math.sin((t+0.5)*Math.PI*2)*0.5+0.5;
  const f3 = human3D(0.5,0.76,{
    armRot:12,armLRot:-12, elbowR:p*1.4,elbowL:p2*1.4,
    legRot:8,legLRot:-8, col:'#1ecbff', scale:0.95,
  });
  dumbbell3D(toRatioX(f3.rArm.hx),toRatioY(f3.rArm.hy),{angle:-0.5});
  dumbbell3D(toRatioX(f3.lArm.hx),toRatioY(f3.lArm.hy),{angle:0.5});
  watermark('HAMMER CURL'); repFlash(t,0.16);
},

shoulder_press(t){
  const p=Math.sin(t*Math.PI*2)*0.5+0.5;
  chairProp3D(0.5,0.66);
  const f4 = human3D(0.5,0.62,{
    armRot:100-p*92, armLRot:-100+p*92, elbowR:0.95-p*0.85,elbowL:0.95-p*0.85,
    legRot:34,legLRot:-34, kneeR:0.85,kneeL:0.85,
    col:'#1ecbff', scale:0.88,
  });
  dumbbell3D(toRatioX(f4.rArm.hx),toRatioY(f4.rArm.hy),{angle:-0.2});
  dumbbell3D(toRatioX(f4.lArm.hx),toRatioY(f4.lArm.hy),{angle:0.2});
  watermark('SHOULDER PRESS'); repFlash(t,0.16);
},

lateral_raise(t){
  const p=Math.sin(t*Math.PI*2)*0.5+0.5;
  const f = human3D(0.5,0.76,{
    armRot:8+p*82, armLRot:-8-p*82, elbowR:0.12,elbowL:0.12,
    legRot:8,legLRot:-8, col:'#1ecbff', scale:0.95,
  });
  dumbbell3D(toRatioX(f.rArm.hx),toRatioY(f.rArm.hy),{angle:-0.4+p*0.4});
  dumbbell3D(toRatioX(f.lArm.hx),toRatioY(f.lArm.hy),{angle:0.4-p*0.4});
  watermark('LATERAL RAISE'); repFlash(t,0.16);
},

shrug(t){
  const p=Math.sin(t*Math.PI*2)*0.5+0.5;
  human3D(0.5,0.78-p*0.035,{
    armRot:6,armLRot:-6, legRot:8,legLRot:-8, col:'#1ecbff', scale:0.95,
  });
  barbell3D(0.5, 0.68, 56,{});
  watermark('BARBELL SHRUG'); repFlash(t,0.16);
},

rear_fly(t){
  const p=Math.sin(t*Math.PI*2)*0.5+0.5;
  const f5 = human3D(0.5,0.72,{
    torsoAngle:50,
    armRot:30+p*80, armLRot:-30-p*80, elbowR:0.18,elbowL:0.18,
    legRot:10,legLRot:-10, col:'#1ecbff', scale:0.94,
  });
  dumbbell3D(toRatioX(f5.rArm.hx),toRatioY(f5.rArm.hy), {angle:p*0.5});
  dumbbell3D(toRatioX(f5.lArm.hx),toRatioY(f5.lArm.hy), {angle:-p*0.5});
  watermark('REAR DELT FLY'); repFlash(t,0.18);
},

plank(t){
  const pulse=Math.sin(t*Math.PI*6)*0.01;
  floorLine(0.84);
  human3D(0.5,0.7+pulse,{
    torsoAngle:0, armRot:90+pulse*40,armLRot:-90-pulse*40, elbowR:0.5,elbowL:0.5,
    legRot:0,legLRot:0, col:'#1ecbff', scale:0.86,
  });
  holdTimer(0.4, _t*62); watermark('PLANK');
},

leg_raise(t){
  const p=Math.sin(t*Math.PI*2)*0.5+0.5;
  pullUpBar3D();
  human3D(0.5,0.36+p*0.3,{
    armRot:176,armLRot:-176, elbowR:0.18,elbowL:0.18,
    legRot:-25+p*55, legLRot:25-p*55, kneeR:0.04,kneeL:0.04,
    col:'#1ecbff', scale:0.86,
  });
  watermark('HANGING LEG RAISE'); repFlash(t,0.9);
},

skull(t){
  const p=Math.sin(t*Math.PI*2)*0.5+0.5;
  bench3D(0.5,0.78); rack3D();
  human3D(0.5,0.62,{
    torsoAngle:0,
    armRot:165, armLRot:-165, elbowR:0.95-p*0.85, elbowL:0.95-p*0.85,
    legRot:35,legLRot:-35, kneeR:0.9,kneeL:0.9,
    col:'#1ecbff', scale:0.9,
  });
  barbell3D(0.5,0.28+(1-p)*0.13, 32,{});
  watermark('SKULL CRUSHER'); repFlash(t,0.18);
},

inc_curl(t){
  const p=Math.sin(t*Math.PI*2)*0.5+0.5;
  bench3D(0.54,0.8,{angle:-26});
  const f6 = human3D(0.46,0.6,{
    torsoAngle:32,
    armRot:14, armLRot:-14, elbowR:p*1.3,elbowL:p*1.3,
    legRot:30,legLRot:-30, kneeR:0.85,kneeL:0.85,
    col:'#1ecbff', scale:0.88,
  });
  dumbbell3D(toRatioX(f6.rArm.hx),toRatioY(f6.rArm.hy),{angle:-0.3});
  dumbbell3D(toRatioX(f6.lArm.hx),toRatioY(f6.lArm.hy),{angle:0.3});
  watermark('INCLINE CURL'); repFlash(t,0.2);
},

standing_ohp(t){
  const p=Math.sin(t*Math.PI*2)*0.5+0.5;
  floorLine(0.9); rack3D();
  human3D(0.5,0.78,{
    armRot:96+p*76, armLRot:-96-p*76, elbowR:0.9-p*0.8, elbowL:0.9-p*0.8,
    legRot:8,legLRot:-8, col:'#1ecbff', scale:0.95,
  });
  barbell3D(0.5, 0.2+(1-p)*0.26, 50,{});
  watermark('STANDING OHP'); repFlash(t,0.16);
},

face_pull(t){
  const p=Math.sin(t*Math.PI*2)*0.5+0.5;
  cableTower3D('right');
  const hx=px(0.58-p*0.08), hy=py(0.5);
  cableLine(0.92,0.3,hx,hy); cableHandle3D(hx,hy,'rope');
  human3D(0.46,0.74,{
    armRot:40+p*60, armLRot:-40-p*60, elbowR:0.7,elbowL:0.7,
    legRot:8,legLRot:-8, col:'#1ecbff', scale:0.92,
  });
  watermark('FACE PULLS'); repFlash(t,0.18);
},

wrist_curl(t){
  const p=Math.sin(t*Math.PI*2)*0.5+0.5;
  bench3D(0.5,0.72);
  human3D(0.5,0.6,{
    torsoAngle:58,
    armRot:90,armLRot:-90, elbowR:0.96,elbowL:0.96,
    legRot:36,legLRot:-36, kneeR:0.85,kneeL:0.85,
    col:'#1ecbff', scale:0.85,
  });
  barbell3D(0.5, 0.7-p*0.05, 28,{});
  watermark('WRIST CURL'); repFlash(t,0.2);
},

rev_curl(t){
  const p=Math.sin(t*Math.PI*2)*0.5+0.5;
  human3D(0.5,0.76,{
    armRot:12, armLRot:-12, elbowR:p*1.4,elbowL:p*1.4,
    legRot:8,legLRot:-8, col:'#1ecbff', scale:0.95,
  });
  barbell3D(0.5, 0.7-p*0.26, 42, {col:'#a855f7'});
  watermark('REVERSE CURL'); repFlash(t,0.16);
},

rdl(t){
  const p=Math.sin(t*Math.PI*2)*0.5+0.5;
  floorLine(0.9);
  human3D(0.5,0.76,{
    torsoAngle:58+p*32,
    armRot:6,armLRot:-6, elbowR:0.04,elbowL:0.04,
    legRot:8,legLRot:-8, kneeR:0.06,kneeL:0.06,
    col:'#1ecbff', scale:0.96,
  });
  barbell3D(0.5, 0.74-p*0.16, 54, {});
  watermark('ROMANIAN DL'); repFlash(t,0.16);
},

lunge(t){
  const p=Math.sin(t*Math.PI*2)*0.5+0.5;
  floorLine(0.9);
  const f7 = human3D(0.46+p*0.06,0.72,{
    armRot:6,armLRot:-6,
    legRot:26+p*16,legLRot:-12-p*10, kneeR:p*0.45,kneeL:0.1,
    col:'#1ecbff', scale:0.93,
  });
  dumbbell3D(toRatioX(f7.rArm.hx),toRatioY(f7.rArm.hy),{angle:0.08});
  dumbbell3D(toRatioX(f7.lArm.hx),toRatioY(f7.lArm.hy),{angle:-0.08});
  watermark('WALKING LUNGE'); repFlash(t,0.16);
},

leg_ext(t){
  const p=Math.sin(t*Math.PI*2)*0.5+0.5;
  legPressMachine3D();
  human3D(0.58,0.5,{
    torsoAngle:84,
    armRot:60,armLRot:-60, elbowR:0.4,elbowL:0.4,
    legRot:60-p*70, legLRot:60-p*70, kneeR:0.04,kneeL:0.04,
    col:'#1ecbff', scale:0.78,
  });
  watermark('LEG EXTENSION'); repFlash(t,0.84);
},

calf(t){
  const p=Math.sin(t*Math.PI*2)*0.5+0.5;
  floorLine(0.9);
  human3D(0.5,0.76-p*0.06,{
    armRot:8,armLRot:-8, legRot:5+p*10,legLRot:-5-p*10,
    col:'#1ecbff', scale:0.95,
  });
  watermark('CALF RAISE'); repFlash(t,0.16);
},

crunch(t){
  const p=Math.sin(t*Math.PI*2)*0.5+0.5;
  floorLine(0.88);
  human3D(0.5,0.72,{
    torsoAngle:-p*32,
    armRot:30-p*16,armLRot:-30+p*16, elbowR:0.5,elbowL:0.5,
    legRot:25,legLRot:-25, kneeR:0.85,kneeL:0.85,
    col:'#1ecbff', scale:0.9,
  });
  watermark('CRUNCH'); repFlash(t,0.18);
},

hip_stretch(t){
  const p=Math.sin(t*Math.PI)*0.5+0.5;
  floorLine(0.9);
  human3D(0.5,0.76,{
    armRot:50,armLRot:-50, elbowR:0.3,elbowL:0.3,
    legRot:30+p*12, legLRot:-12, kneeR:0.5,kneeL:0.85,
    col:'#00e676', scale:0.93,
  });
  watermark('HIP FLEXOR STRETCH','rgba(0,230,118,0.06)');
},

foam_roll(t){
  const rx=Math.sin(t*Math.PI*2)*0.06;
  floorLine(0.84);
  human3D(0.5+rx,0.72,{
    torsoAngle:0, armRot:90,armLRot:-90, legRot:-3,legLRot:3,
    col:'#00e676', scale:0.86,
  });
  watermark('FOAM ROLLING','rgba(0,230,118,0.06)');
},

shoulder_str(t){
  const p=Math.sin(t*Math.PI)*0.5+0.5;
  human3D(0.5,0.76,{
    armRot:30-p*60, armLRot:-100, elbowR:0.7,elbowL:0.08,
    legRot:8,legLRot:-8, col:'#00e676', scale:0.95,
  });
  watermark('SHOULDER STRETCH','rgba(0,230,118,0.06)');
},

// ── HOME WORKOUT ANIMATIONS (blue #4fa8ff base color) ──────────────
pushup(t){
  const p=Math.sin(t*Math.PI*2)*0.5+0.5;
  floorLine(0.84);
  human3D(0.5,0.7+p*0.07,{
    torsoAngle:0, armRot:100-p*8,armLRot:-100+p*8, elbowR:0.95-p*0.85,elbowL:0.95-p*0.85,
    legRot:-2,legLRot:2, col:'#4fa8ff', scale:0.88,
  });
  watermark('PUSH-UP'); repFlash(t,0.18,'rgba(79,168,255,');
},

wide_push(t){
  const p=Math.sin(t*Math.PI*2)*0.5+0.5;
  floorLine(0.84);
  human3D(0.5,0.7+p*0.07,{
    torsoAngle:0, armRot:112-p*6,armLRot:-112+p*6, elbowR:0.85-p*0.75,elbowL:0.85-p*0.75,
    legRot:-2,legLRot:2, col:'#4fa8ff', scale:0.88,
  });
  watermark('WIDE PUSH-UP'); repFlash(t,0.18,'rgba(79,168,255,');
},

diamond(t){
  const p=Math.sin(t*Math.PI*2)*0.5+0.5;
  floorLine(0.84);
  human3D(0.5,0.7+p*0.07,{
    torsoAngle:0, armRot:84-p*4,armLRot:-84+p*4, elbowR:1.0-p*0.85,elbowL:1.0-p*0.85,
    legRot:-2,legLRot:2, col:'#4fa8ff', scale:0.88,
  });
  watermark('DIAMOND PUSH-UP'); repFlash(t,0.18,'rgba(79,168,255,');
},

pike(t){
  const p=Math.sin(t*Math.PI*2)*0.5+0.5;
  floorLine(0.9);
  human3D(0.5,0.78,{
    torsoAngle:46,
    armRot:150, armLRot:-150, elbowR:0.5-p*0.35,elbowL:0.5-p*0.35,
    legRot:8,legLRot:-8, col:'#4fa8ff', scale:0.9,
  });
  watermark('PIKE PUSH-UP'); repFlash(t,0.18,'rgba(79,168,255,');
},

decline(t){
  const p=Math.sin(t*Math.PI*2)*0.5+0.5;
  chairProp3D(0.66,0.62);
  floorLine(0.84);
  human3D(0.42,0.66,{
    torsoAngle:-12, armRot:96-p*6,armLRot:-96+p*6, elbowR:0.85-p*0.75,elbowL:0.85-p*0.75,
    legRot:-10,legLRot:10, col:'#4fa8ff', scale:0.86,
  });
  watermark('DECLINE PUSH-UP'); repFlash(t,0.18,'rgba(79,168,255,');
},

chair_dip(t){
  const p=Math.sin(t*Math.PI*2)*0.5+0.5;
  chairProp3D(0.5,0.5);
  floorLine(0.9);
  human3D(0.5,0.4+p*0.13,{
    armRot:96,armLRot:-96, elbowR:p*0.55,elbowL:p*0.55,
    legRot:16,legLRot:-16, kneeR:0.55,kneeL:0.55,
    col:'#4fa8ff', scale:0.88,
  });
  watermark('CHAIR DIP'); repFlash(t,0.86,'rgba(79,168,255,');
},

planche(t){
  const p=Math.sin(t*Math.PI*2)*0.5+0.5;
  floorLine(0.84);
  human3D(0.5,0.68+p*0.06,{
    torsoAngle:0, lean:16,
    armRot:100,armLRot:-100, elbowR:0.85-p*0.75,elbowL:0.85-p*0.75,
    legRot:-2,legLRot:2, col:'#4fa8ff', scale:0.88,
  });
  watermark('PSEUDO PLANCHE'); repFlash(t,0.18,'rgba(79,168,255,');
},

table_row(t){
  const p=Math.sin(t*Math.PI*2)*0.5+0.5;
  tableProp3D(0.5,0.38,210);
  floorLine(0.9);
  human3D(0.5,0.58-p*0.12,{
    torsoAngle:0, armRot:170-p*18,armLRot:-170+p*18, elbowR:p*0.5,elbowL:p*0.5,
    legRot:-2,legLRot:2, col:'#4fa8ff', scale:0.86,
  });
  watermark('TABLE ROW'); repFlash(t,0.86,'rgba(79,168,255,');
},

towel_curl(t){
  const p=Math.sin(t*Math.PI*2)*0.5+0.5;
  wallProp3D('left');
  human3D(0.5,0.78,{
    torsoAngle:84-p*16,
    armRot:14, armLRot:-14, elbowR:p*1.3,elbowL:p*1.3,
    legRot:14,legLRot:-14, col:'#4fa8ff', scale:0.9,
  });
  watermark('TOWEL BICEP CURL'); repFlash(t,0.16,'rgba(79,168,255,');
},

superman(t){
  const p=Math.sin(t*Math.PI*2)*0.5+0.5;
  floorLine(0.84);
  human3D(0.5,0.7,{
    torsoAngle:0, lean:p*6,
    armRot:150+p*30, armLRot:-150-p*30, elbowR:0.06,elbowL:0.06,
    legRot:-3-p*10, legLRot:3+p*10, col:'#4fa8ff', scale:0.88,
  });
  watermark('SUPERMAN HOLD'); repFlash(t,0.18,'rgba(79,168,255,');
},

pull_apart(t){
  const p=Math.sin(t*Math.PI*2)*0.5+0.5;
  human3D(0.5,0.76,{
    armRot:8+p*78, armLRot:-8-p*78, elbowR:0.08,elbowL:0.08,
    legRot:8,legLRot:-8, col:'#4fa8ff', scale:0.95,
  });
  CTX.strokeStyle=`rgba(79,168,255,${0.4+p*0.4})`; CTX.lineWidth=sc(5); CTX.lineCap='round';
  CTX.beginPath(); CTX.moveTo(px(0.32-p*0.08),py(0.58)); CTX.lineTo(px(0.68+p*0.08),py(0.58)); CTX.stroke();
  watermark('PULL-APART'); repFlash(t,0.16,'rgba(79,168,255,');
},

arch_hold(t){
  const p=Math.sin(t*Math.PI*2)*0.5+0.5;
  floorLine(0.84);
  human3D(0.5,0.72,{
    torsoAngle:0, lean:-p*10,
    armRot:160+p*20, armLRot:-160-p*20, elbowR:0.06,elbowL:0.06,
    legRot:-3-p*10, legLRot:3+p*10, col:'#4fa8ff', scale:0.88,
  });
  watermark('ARCH BODY HOLD'); repFlash(t,0.18,'rgba(79,168,255,');
},

iso_curl(t){
  const p=Math.sin(t*Math.PI*2)*0.5+0.5;
  tableProp3D(0.5,0.5,150);
  human3D(0.5,0.72,{
    torsoAngle:84,
    armRot:10,armLRot:-10, elbowR:1.2+p*0.1,elbowL:1.2+p*0.1,
    legRot:24,legLRot:-24, kneeR:0.85,kneeL:0.85,
    col:'#4fa8ff', scale:0.84,
  });
  watermark('ISOMETRIC CURL');
},

bw_squat(t){
  const p=Math.sin(t*Math.PI*2)*0.5+0.5; const d=p*0.18;
  floorLine(0.9);
  human3D(0.5,0.74+d,{
    torsoAngle:86+(1-p)*8,
    armRot:172,armLRot:-172,
    legRot:22+d*92,legLRot:-22-d*92, kneeR:d*2.4,kneeL:d*2.4,
    col:'#4fa8ff', scale:0.95,
  });
  watermark('BODYWEIGHT SQUAT'); repFlash(t,0.16,'rgba(79,168,255,');
},

jump_squat(t){
  const p=Math.sin(t*Math.PI*2)*0.5+0.5;
  const airH = p>0.6 ? (p-0.6)/0.4*0.28 : 0;
  floorLine(0.9);
  human3D(0.5,0.76-airH,{
    armRot: airH>0.1?160:172, armLRot: airH>0.1?-160:-172,
    legRot: airH>0.1?10:18, legLRot: airH>0.1?-10:-18,
    kneeR: airH>0.1?0.06:0, kneeL: airH>0.1?0.06:0,
    col:'#4fa8ff', scale:0.93,
  });
  if(airH>0.04) glow(0.5,0.88,68,'rgba(79,168,255,0.14)');
  watermark('JUMP SQUAT'); repFlash(t,0.16,'rgba(79,168,255,');
},

bss(t){
  const p=Math.sin(t*Math.PI*2)*0.5+0.5;
  chairProp3D(0.74,0.58);
  floorLine(0.9);
  human3D(0.42,0.74+p*0.06,{
    armRot:50,armLRot:-50,
    legRot:26+p*10,legLRot:-16, kneeR:p*0.45,kneeL:0.3,
    col:'#4fa8ff', scale:0.9,
  });
  watermark('BULGARIAN SPLIT SQUAT'); repFlash(t,0.16,'rgba(79,168,255,');
},

glute_br(t){
  const p=Math.sin(t*Math.PI*2)*0.5+0.5;
  floorLine(0.84);
  human3D(0.5,0.76,{
    torsoAngle:-p*22,
    armRot:88,armLRot:-88, elbowR:0.3,elbowL:0.3,
    legRot:30-p*8,legLRot:-30+p*8, kneeR:0.78-p*0.35,kneeL:0.78-p*0.35,
    col:'#4fa8ff', scale:0.88,
  });
  watermark('GLUTE BRIDGE'); repFlash(t,0.16,'rgba(79,168,255,');
},

slg_bridge(t){ ANIMS.glute_br(t); },

wall_sit(t){
  wallProp3D('right');
  floorLine(0.9);
  human3D(0.66,0.56,{
    armRot:84,armLRot:-84, elbowR:0.08,elbowL:0.08,
    legRot:46,legLRot:-46, kneeR:0.95,kneeL:0.95,
    col:'#4fa8ff', scale:0.88,
  });
  holdTimer(0.3,_t*62); watermark('WALL SIT');
},

calf_step(t){ ANIMS.calf(t); },

hollow(t){
  const p=Math.sin(t*Math.PI)*0.5+0.5;
  floorLine(0.84);
  human3D(0.5,0.78,{
    torsoAngle:-p*16,
    armRot:160+p*20,armLRot:-160-p*20, elbowR:0.06,elbowL:0.06,
    legRot:-10+p*16, legLRot:10-p*16, col:'#4fa8ff', scale:0.88,
  });
  watermark('HOLLOW BODY HOLD');
},

bicycle(t){
  const p=Math.sin(t*Math.PI*2);
  floorLine(0.9);
  human3D(0.5,0.74,{
    torsoAngle:-16,
    armRot:30-p*40,armLRot:-30+p*40, elbowR:0.5,elbowL:0.5,
    legRot:16+p*30,legLRot:-16-p*30, kneeR:0.42+p*0.4,kneeL:0.42-p*0.4,
    col:'#4fa8ff', scale:0.88,
  });
  watermark('BICYCLE CRUNCH'); repFlash(t,0.16,'rgba(79,168,255,');
},

leg_raise_h(t){
  const p=Math.sin(t*Math.PI*2)*0.5+0.5;
  floorLine(0.9);
  human3D(0.5,0.74,{
    torsoAngle:0, armRot:90,armLRot:-90,
    legRot:-42+p*62, legLRot:42-p*62, kneeR:0.04,kneeL:0.04,
    col:'#4fa8ff', scale:0.88,
  });
  watermark('LEG RAISE'); repFlash(t,0.16,'rgba(79,168,255,');
},

mt_climb(t){
  const p=Math.sin(t*Math.PI*4)*0.5+0.5;
  floorLine(0.84);
  human3D(0.5,0.7,{
    torsoAngle:0, armRot:92,armLRot:-92, elbowR:0.5,elbowL:0.5,
    legRot:-16+p*36, legLRot:16-p*36, kneeR:p*0.55,kneeL:(1-p)*0.55,
    col:'#4fa8ff', scale:0.88,
  });
  watermark('MOUNTAIN CLIMBER'); repFlash(t,0.18,'rgba(79,168,255,');
},

side_plank(t){
  const pulse=Math.sin(t*Math.PI*4)*0.008;
  floorLine(0.86);
  human3D(0.42,0.68+pulse,{
    torsoAngle:46, armRot:96,armLRot:174, elbowR:0.78,elbowL:0.08,
    legRot:46,legLRot:36, col:'#4fa8ff', scale:0.86,
  });
  holdTimer(0.3,_t*32); watermark('SIDE PLANK');
},

v_up(t){
  const p=Math.sin(t*Math.PI*2)*0.5+0.5;
  floorLine(0.9);
  human3D(0.5,0.72,{
    torsoAngle:-32+p*62,
    armRot:90-p*86, armLRot:-90+p*86, elbowR:0.06,elbowL:0.06,
    legRot:-32+p*52, legLRot:32-p*52, kneeR:0.04,kneeL:0.04,
    col:'#4fa8ff', scale:0.88,
  });
  watermark('V-UP'); repFlash(t,0.16,'rgba(79,168,255,');
},

burpee(t){
  const ph=t%1;
  floorLine(0.9);
  if(ph<0.3){
    const pp=ph/0.3;
    human3D(0.5,0.76+pp*0.06,{
      torsoAngle:86-(1-pp)*38, armRot:92,armLRot:-92,
      legRot:18+pp*10,legLRot:-18-pp*10, kneeR:pp*0.5,kneeL:pp*0.5,
      col:'#4fa8ff', scale:0.92,
    });
  } else if(ph<0.55){
    human3D(0.5,0.7,{
      torsoAngle:0, armRot:92,armLRot:-92, elbowR:0.5,elbowL:0.5,
      legRot:-2,legLRot:2, col:'#4fa8ff', scale:0.88,
    });
  } else {
    const pp=(ph-0.55)/0.45; const airH=pp*0.3;
    human3D(0.5,0.76-airH,{
      armRot:172-pp*8, armLRot:-172+pp*8,
      legRot:8,legLRot:-8, col:'#4fa8ff', scale:0.92,
    });
    if(airH>0.05) glow(0.5,0.88,70,'rgba(79,168,255,0.14)');
  }
  watermark('BURPEE'); repFlash(t,0.16,'rgba(79,168,255,');
},

pu_row(t){
  const ph=t%1;
  floorLine(0.84);
  if(ph<0.5){
    const p2=Math.sin(ph*Math.PI*2)*0.5+0.5;
    human3D(0.5,0.7+p2*0.07,{
      torsoAngle:0, armRot:100,armLRot:-100, elbowR:0.95-p2*0.85,elbowL:0.95-p2*0.85,
      legRot:-2,legLRot:2, col:'#4fa8ff', scale:0.88,
    });
  } else {
    const p3=(ph-0.5)/0.5;
    human3D(0.5,0.7,{
      torsoAngle:34, armRot:96-p3*86, armLRot:-100,
      elbowR:p3*0.5,elbowL:0.6, legRot:30,legLRot:22,
      col:'#4fa8ff', scale:0.88,
    });
  }
  watermark('PUSH-UP TO ROW'); repFlash(t,0.18,'rgba(79,168,255,');
},

jump_lunge(t){
  const p=Math.sin(t*Math.PI*2)*0.5+0.5;
  const airH = p>0.55 ? (p-0.55)/0.45*0.24 : 0;
  floorLine(0.9);
  human3D(0.5,0.76-airH,{
    armRot: airH>0.05?170:60, armLRot: airH>0.05?-170:-150,
    legRot: airH>0.05?20:30, legLRot: airH>0.05?-20:-16,
    kneeR: airH>0.05?0.18:0.45, kneeL: airH>0.05?0.18:0.14,
    col:'#4fa8ff', scale:0.93,
  });
  if(airH>0.04) glow(0.5,0.88,60,'rgba(79,168,255,0.13)');
  watermark('JUMP LUNGE'); repFlash(t,0.16,'rgba(79,168,255,');
},

bear_crawl(t){
  const step=Math.sin(t*Math.PI*4)*0.5+0.5;
  floorLine(0.84);
  human3D(0.5,0.68,{
    torsoAngle:0,
    armRot:80+step*20, armLRot:-80-step*20, elbowR:0.5,elbowL:0.5,
    legRot:-18-step*16, legLRot:18+step*16, kneeR:step*0.4,kneeL:(1-step)*0.4,
    col:'#4fa8ff', scale:0.88,
  });
  watermark('BEAR CRAWL');
},

pu_tap(t){
  const ph=t%1; const p=Math.sin(ph*Math.PI*2)*0.5+0.5;
  floorLine(0.84);
  human3D(0.5,0.7+p*0.07,{
    torsoAngle:0,
    armRot: ph>0.65 ? 20 : 100, armLRot:-100,
    elbowR: ph>0.65 ? 0.3 : 0.95-p*0.85, elbowL:0.95-p*0.85,
    legRot:-2,legLRot:2, col:'#4fa8ff', scale:0.88,
  });
  watermark('PUSH-UP SHOULDER TAP'); repFlash(t,0.18,'rgba(79,168,255,');
},

squat_tuck(t){
  const p=Math.sin(t*Math.PI*2)*0.5+0.5;
  const airH = p>0.5 ? (p-0.5)/0.5*0.32 : 0;
  floorLine(0.9);
  if(airH>0.08){
    human3D(0.5,0.72-airH,{
      armRot:60,armLRot:-60, elbowR:0.3,elbowL:0.3,
      legRot:46,legLRot:-46, kneeR:1,kneeL:1, col:'#4fa8ff', scale:0.9,
    });
    glow(0.5,0.88,76,'rgba(79,168,255,0.15)');
  } else {
    human3D(0.5,0.76,{
      armRot:172,armLRot:-172, legRot:18,legLRot:-18, col:'#4fa8ff', scale:0.93,
    });
  }
  watermark('SQUAT JUMP TUCK'); repFlash(t,0.16,'rgba(79,168,255,');
},

inchworm(t){
  const ph=t%1;
  floorLine(0.9);
  if(ph<0.35){
    const pp=ph/0.35;
    human3D(0.5,0.76,{
      torsoAngle:86-pp*54, armRot:100,armLRot:-100, elbowR:pp*0.16,elbowL:pp*0.16,
      legRot:8,legLRot:-8, col:'#4fa8ff', scale:0.9,
    });
  } else if(ph<0.65){
    human3D(0.5,0.7,{
      torsoAngle:0, armRot:92,armLRot:-92, elbowR:0.5,elbowL:0.5,
      legRot:-2,legLRot:2, col:'#4fa8ff', scale:0.88,
    });
  } else {
    const pp=(ph-0.65)/0.35;
    human3D(0.5,0.76,{
      torsoAngle:32+pp*54, armRot:96,armLRot:-96, elbowR:(1-pp)*0.16,elbowL:(1-pp)*0.16,
      legRot:8,legLRot:-8, col:'#4fa8ff', scale:0.9,
    });
  }
  watermark('INCHWORM');
},

};

// ═══════════════════════════════════════════════════════════════════
//  MODAL CONTROLS
// ═══════════════════════════════════════════════════════════════════
function openAnimModal(key){
  _key=key; _t=0; _rep=0; _lastCyc=0; _playing=true; _lastTs=null;
  const meta = ANIM_META[key]||{name:key,muscle:'',maxRep:10};
  document.getElementById('animModalBg').classList.add('open');
  document.getElementById('animExName').textContent = meta.name;
  document.getElementById('animMuscle').textContent = meta.muscle;
  _maxRep = meta.maxRep||10;
  document.getElementById('animPlayBtn').textContent='⏸ PAUSE';
  document.getElementById('animPlayBtn').className='ctrl-btn pr';
  updateRepBar();
  if(_raf) cancelAnimationFrame(_raf);
  requestAnimationFrame(function(){
    resizeCanvas();
    if (CW > 0 && CH > 0) {
      _raf = requestAnimationFrame(animLoop);
    } else {
      requestAnimationFrame(function(){
        resizeCanvas();
        _raf = requestAnimationFrame(animLoop);
      });
    }
  });
}

function closeAnimModal(){
  document.getElementById('animModalBg').classList.remove('open');
  if(_raf){cancelAnimationFrame(_raf);_raf=null;}
}

function togglePlay(){
  _playing=!_playing;
  const b=document.getElementById('animPlayBtn');
  b.textContent=_playing?'⏸ PAUSE':'▶ PLAY';
  b.className='ctrl-btn'+(_playing?' pr':'');
}

function setSpeed(v){ _speed=parseFloat(v); }

function updateRepBar(){
  const pct=(_rep/_maxRep)*100;
  document.getElementById('repBarFill').style.width=pct+'%';
  document.getElementById('repLbl').textContent='REP '+_rep+' / '+_maxRep;
}

function animLoop(ts){
  if(!_lastTs) _lastTs=ts;
  const dt=Math.min(ts-_lastTs,50); _lastTs=ts;
  if(_playing) _t=(_t+dt*0.00075*_speed)%1;
  const cyc=_t%1;
  if(cyc<_lastCyc){_rep=Math.min(_rep+1,_maxRep);updateRepBar();}
  _lastCyc=cyc;
  clr(); grid();
  const fn=ANIMS[_key]||ANIMS.bench;
  fn(_t);
  _raf=requestAnimationFrame(animLoop);
}

document.addEventListener('DOMContentLoaded', initCanvas);
