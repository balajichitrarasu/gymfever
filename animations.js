// ═══════════════════════════════════════════════════
//  BALAJI WORKOUT - ANIMATION ENGINE
//  All canvas stick-figure + equipment animations
// ═══════════════════════════════════════════════════

let CV, CTX, CW = 580, CH = 310;
let _key = 'bench', _t = 0, _playing = true, _speed = 1;
let _rep = 0, _maxRep = 10, _lastCyc = 0, _raf = null, _lastTs = null;

const ANIM_META = {
  bench:          { name:'Flat Bench Press',       muscle:'Pectoralis Major',              maxRep:8  },
  incline_press:  { name:'Incline DB Press',        muscle:'Upper Chest — Clavicular Head', maxRep:12 },
  cable_fly:      { name:'Cable Crossover',          muscle:'Chest — Isolation/Stretch',     maxRep:15 },
  pushdown:       { name:'Tricep Pushdown',          muscle:'Triceps — Lateral Head',        maxRep:12 },
  oh_ext:         { name:'OH DB Extension',          muscle:'Triceps — Long Head',           maxRep:12 },
  dips:           { name:'Tricep Dips',              muscle:'Triceps — All 3 Heads',         maxRep:10 },
  deadlift:       { name:'Conventional Deadlift',    muscle:'Entire Posterior Chain',        maxRep:5  },
  pullup:         { name:'Pull-Up / Lat Pulldown',   muscle:'Lats — Width Builder',          maxRep:10 },
  bent_row:       { name:'Barbell Bent-Over Row',    muscle:'Mid-Back · Rhomboids',          maxRep:8  },
  cable_row:      { name:'Seated Cable Row',         muscle:'Mid-Back — Thickness',          maxRep:12 },
  bicep_curl:     { name:'Barbell Bicep Curl',       muscle:'Biceps — Long + Short Head',    maxRep:10 },
  hammer_curl:    { name:'Hammer Curl',              muscle:'Brachialis · Brachioradialis',  maxRep:12 },
  squat:          { name:'Barbell Back Squat',       muscle:'Quads · Glutes · Hamstrings',   maxRep:8  },
  leg_press:      { name:'Leg Press',                muscle:'Quads — Machine',               maxRep:12 },
  rdl:            { name:'Romanian Deadlift',        muscle:'Hamstrings · Glutes',           maxRep:10 },
  lunge:          { name:'Walking Lunges',           muscle:'Quads · Glutes · Balance',      maxRep:12 },
  leg_ext:        { name:'Leg Extension',            muscle:'Quads — Isolation',             maxRep:15 },
  calf:           { name:'Standing Calf Raise',      muscle:'Calves — Gastrocnemius',        maxRep:20 },
  shoulder_press: { name:'Seated DB OH Press',       muscle:'Anterior + Medial Delt',        maxRep:10 },
  lateral:        { name:'Dumbbell Lateral Raise',   muscle:'Medial Delt — Width Builder',   maxRep:15 },
  rear_fly:       { name:'Rear Delt Fly',            muscle:'Posterior Delt — Posture',      maxRep:15 },
  shrug:          { name:'Barbell Shrug',            muscle:'Traps — Upper',                 maxRep:15 },
  plank:          { name:'Plank',                    muscle:'Core — Anterior Foundation',    maxRep:1  },
  crunch:         { name:'Weighted Crunch',          muscle:'Rectus Abdominis',              maxRep:20 },
  leg_raise:      { name:'Hanging Leg Raise',        muscle:'Lower Abs · Hip Flexors',       maxRep:12 },
  skull:          { name:'Skull Crusher',            muscle:'Triceps — Long Head',           maxRep:10 },
  inc_curl:       { name:'Incline DB Curl',          muscle:'Biceps — Long Head Stretch',    maxRep:12 },
  wrist_curl:     { name:'Barbell Wrist Curl',       muscle:'Forearms — Flexors',            maxRep:20 },
  rev_curl:       { name:'Reverse Barbell Curl',     muscle:'Forearms — Extensors',          maxRep:15 },
  standing_ohp:   { name:'Standing Barbell OHP',     muscle:'Shoulders · Core · Triceps',    maxRep:5  },
  face_pull:      { name:'Face Pulls',               muscle:'Rear Delt · Rotator Cuff',      maxRep:20 },
  plyo_push:      { name:'Plyometric Push-Up',       muscle:'Chest · Shoulders · Power',     maxRep:10 },
  hip_stretch:    { name:'Hip Flexor Stretch',       muscle:'Hip Flexors — Recovery',        maxRep:1  },
  foam_roll:      { name:'Foam Roll',                muscle:'Myofascial Release',             maxRep:1  },
  shoulder_str:   { name:'Shoulder Stretch',         muscle:'Posterior Delt — Recovery',     maxRep:1  },
  pushup:         { name:'Standard Push-Up',         muscle:'Chest · Triceps · Ant. Delt',   maxRep:15 },
  wide_push:      { name:'Wide Push-Up',             muscle:'Outer Chest — Width',           maxRep:12 },
  diamond:        { name:'Diamond Push-Up',          muscle:'Triceps · Inner Chest',         maxRep:10 },
  pike:           { name:'Pike Push-Up',             muscle:'Shoulders — Ant. + Medial',     maxRep:10 },
  decline:        { name:'Decline Push-Up',          muscle:'Upper Chest — Clavicular',      maxRep:10 },
  chair_dip:      { name:'Chair Tricep Dip',         muscle:'Triceps — All 3 Heads',         maxRep:12 },
  planche:        { name:'Pseudo Planche Push-Up',   muscle:'Ant. Delt · Chest · Core',      maxRep:8  },
  table_row:      { name:'Table / Door Row',         muscle:'Lats · Mid-Back · Biceps',      maxRep:15 },
  towel_curl:     { name:'Towel Bicep Curl',         muscle:'Biceps — Full Range',           maxRep:15 },
  superman:       { name:'Superman Hold',            muscle:'Lower Back · Glutes',           maxRep:12 },
  pull_apart:     { name:'Rear Delt Pull-Apart',     muscle:'Posterior Delt · Rhomboids',    maxRep:20 },
  arch_hold:      { name:'Arch Body Hold',           muscle:'Entire Posterior Chain',        maxRep:1  },
  iso_curl:       { name:'Isometric Bicep Curl',     muscle:'Biceps — Peak Density',         maxRep:1  },
  bw_squat:       { name:'Bodyweight Squat',         muscle:'Quads · Glutes · Hamstrings',   maxRep:20 },
  jump_squat:     { name:'Jump Squat',               muscle:'Quads · Glutes — Explosive',    maxRep:12 },
  bss:            { name:'Bulgarian Split Squat',    muscle:'Quads · Glutes — Single Leg',   maxRep:10 },
  glute_br:       { name:'Glute Bridge',             muscle:'Glutes · Hamstrings',           maxRep:20 },
  wall_sit:       { name:'Wall Sit',                 muscle:'Quads — Isometric',             maxRep:1  },
  calf_step:      { name:'Calf Raise (Step)',        muscle:'Calves — Gastrocnemius',        maxRep:25 },
  slg_bridge:     { name:'Single-Leg Glute Bridge',  muscle:'Glutes — Unilateral',           maxRep:15 },
  hollow:         { name:'Hollow Body Hold',         muscle:'Deep Core — Gymnastics',        maxRep:1  },
  bicycle:        { name:'Bicycle Crunch',           muscle:'Obliques · Rectus Abdominis',   maxRep:20 },
  leg_raise_h:    { name:'Leg Raise',                muscle:'Lower Abs · Hip Flexors',       maxRep:15 },
  mt_climb:       { name:'Mountain Climber',         muscle:'Core · Cardio · Hip Flexors',   maxRep:20 },
  side_plank:     { name:'Side Plank',               muscle:'Obliques — Lateral Core',       maxRep:1  },
  v_up:           { name:'V-Up',                     muscle:'Full Abs — Advanced',           maxRep:12 },
  burpee:         { name:'Burpee',                   muscle:'Full Body — Conditioning',      maxRep:10 },
  pu_row:         { name:'Push-Up to Row',           muscle:'Chest · Lats · Core',           maxRep:8  },
  jump_lunge:     { name:'Jump Lunge',               muscle:'Quads · Glutes — Explosive',    maxRep:10 },
  bear_crawl:     { name:'Bear Crawl',               muscle:'Shoulders · Core · Hips',       maxRep:1  },
  pu_tap:         { name:'Push-Up Shoulder Tap',     muscle:'Chest · Core Anti-rotation',    maxRep:10 },
  squat_tuck:     { name:'Squat Jump Tuck',          muscle:'Legs · Core — Explosive',       maxRep:8  },
  inchworm:       { name:'Inchworm',                 muscle:'Hamstrings · Shoulders · Core', maxRep:8  },
};

// ── helpers ──────────────────────────────────────────
const s = (n) => n; // scale (1:1 on 580x310)
function clr() { CTX.clearRect(0,0,CW,CH); }
function grid() {
  CTX.strokeStyle='rgba(255,255,255,.022)'; CTX.lineWidth=1;
  for(let x=0;x<CW;x+=40){CTX.beginPath();CTX.moveTo(x,0);CTX.lineTo(x,CH);CTX.stroke();}
  for(let y=0;y<CH;y+=40){CTX.beginPath();CTX.moveTo(0,y);CTX.lineTo(CW,y);CTX.stroke();}
}
function fl(y,c='rgba(232,255,0,.15)'){CTX.strokeStyle=c;CTX.lineWidth=1.5;CTX.beginPath();CTX.moveTo(0,y);CTX.lineTo(CW,y);CTX.stroke();}
function glo(x,y,r,c){const g=CTX.createRadialGradient(x,y,0,x,y,r);g.addColorStop(0,c);g.addColorStop(1,'transparent');CTX.fillStyle=g;CTX.beginPath();CTX.arc(x,y,r,0,Math.PI*2);CTX.fill();}
function wm(t){CTX.fillStyle='rgba(255,255,255,.03)';CTX.font="bold 52px 'Bebas Neue',sans-serif";CTX.textAlign='center';CTX.fillText(t.toUpperCase(),CW/2,CH-14);}

// 3D-style human figure: cx/cy = hip, sc=scale, options
function human(cx,cy,sc,opts){
  const {aR,aL,lR,lL,lean=0,col='#00ffcc',alpha=1,bend=0}=opts;
  CTX.globalAlpha=alpha; CTX.strokeStyle=col; CTX.lineWidth=4; CTX.lineCap='round'; CTX.lineJoin='round';
  const lx=cx+lean*sc;
  // shadow ellipse
  CTX.fillStyle=col.replace(')',',0.07)').replace('rgb','rgba');
  CTX.beginPath();CTX.ellipse(cx,cy+78*sc,24*sc,6*sc,0,0,Math.PI*2);CTX.fill();
  // head with face
  CTX.strokeStyle=col; CTX.lineWidth=3.5;
  CTX.beginPath();CTX.arc(lx,cy-54*sc,13*sc,0,Math.PI*2);CTX.stroke();
  // eye dots
  CTX.fillStyle=col; CTX.globalAlpha=alpha*0.6;
  CTX.beginPath();CTX.arc(lx+4*sc,cy-56*sc,2*sc,0,Math.PI*2);CTX.fill();
  CTX.globalAlpha=alpha;
  // neck
  CTX.beginPath();CTX.moveTo(lx,cy-41*sc);CTX.lineTo(lx,cy-36*sc);CTX.stroke();
  // torso (with slight width taper)
  CTX.lineWidth=5;
  CTX.beginPath();CTX.moveTo(lx,cy-36*sc);CTX.lineTo(cx,cy);CTX.stroke();
  // arms
  CTX.lineWidth=3.5; CTX.globalAlpha=alpha*0.92;
  CTX.beginPath();CTX.moveTo(lx,cy-28*sc);CTX.lineTo(cx+aR[0]*sc,cy+aR[1]*sc);CTX.stroke();
  CTX.beginPath();CTX.moveTo(lx,cy-28*sc);CTX.lineTo(cx+aL[0]*sc,cy+aL[1]*sc);CTX.stroke();
  // legs
  CTX.globalAlpha=alpha*0.78;
  CTX.beginPath();CTX.moveTo(cx,cy);CTX.lineTo(cx+lR[0]*sc,cy+lR[1]*sc);CTX.stroke();
  CTX.beginPath();CTX.moveTo(cx,cy);CTX.lineTo(cx+lL[0]*sc,cy+lL[1]*sc);CTX.stroke();
  CTX.globalAlpha=1;
}

function barbell(cx,cy,w,col='#ffe600'){
  CTX.strokeStyle=col;CTX.lineWidth=5;CTX.lineCap='round';
  CTX.beginPath();CTX.moveTo(cx-w/2,cy);CTX.lineTo(cx+w/2,cy);CTX.stroke();
  CTX.fillStyle=col;
  for(const px of[cx-w/2-9,cx+w/2+9]){CTX.beginPath();CTX.ellipse(px,cy,9,20,0,0,Math.PI*2);CTX.fill();}
  // inner ring
  CTX.fillStyle=col.replace('#ffe600','#ffcc00').replace('#a855f7','#7c3aed');
  for(const px of[cx-w/2-5,cx+w/2+5]){CTX.beginPath();CTX.ellipse(px,cy,5,14,0,0,Math.PI*2);CTX.fill();}
}
function dumbbell(x,y,col='#ffe600'){
  CTX.fillStyle=col;
  CTX.beginPath();CTX.roundRect(x-14,y-5,28,10,3);CTX.fill();
  CTX.beginPath();CTX.ellipse(x-14,y,6,12,0,0,Math.PI*2);CTX.fill();
  CTX.beginPath();CTX.ellipse(x+14,y,6,12,0,0,Math.PI*2);CTX.fill();
}
function bench_shape(cx,cy){
  CTX.fillStyle='#1a1a2e';CTX.strokeStyle='rgba(168,85,247,.6)';CTX.lineWidth=2;
  CTX.beginPath();CTX.roundRect(cx-82,cy,164,18,4);CTX.fill();CTX.stroke();
  CTX.lineWidth=3;CTX.strokeStyle='rgba(168,85,247,.4)';
  for(const ox of[-62,62]){CTX.beginPath();CTX.moveTo(cx+ox,cy+18);CTX.lineTo(cx+ox,cy+44);CTX.stroke();}
}
function machine_sled(cx,cy,w,h){
  CTX.fillStyle='#1a1a2e';CTX.strokeStyle='rgba(168,85,247,.55)';CTX.lineWidth=2;
  CTX.beginPath();CTX.roundRect(cx-w/2,cy-h/2,w,h,4);CTX.fill();CTX.stroke();
}
function cable(x1,y1,x2,y2){
  CTX.strokeStyle='rgba(255,230,0,.45)';CTX.lineWidth=2;
  CTX.beginPath();CTX.moveTo(x1,y1);CTX.lineTo(x2,y2);CTX.stroke();
}
function rep_flash(t,y,col='rgba(232,255,0,'){
  const c=t%1,a=Math.max(0,1-c*5);
  if(a>0&&c<0.18){CTX.fillStyle=col+a+')';CTX.font="bold 22px 'Bebas Neue',sans-serif";CTX.textAlign='center';CTX.fillText('REP '+_rep,CW/2,y);}
}

// ── GYM ANIMATIONS ──────────────────────────────────────────────────────
const ANIMS = {
bench(t){
  const fY=268,p=Math.sin(t*Math.PI*2)*.5+.5,cx=290,cy=196;
  fl(fY); bench_shape(cx,cy+18);
  // lying body
  CTX.strokeStyle='#00ffcc';CTX.lineWidth=3.5;CTX.lineCap='round';
  CTX.beginPath();CTX.moveTo(cx-84,cy+8);CTX.lineTo(cx+72,cy+8);CTX.stroke();
  CTX.beginPath();CTX.arc(cx+86,cy+8,13,0,Math.PI*2);CTX.stroke();
  const ay=cy+8-24-p*34;
  CTX.beginPath();CTX.moveTo(cx-24,cy+5);CTX.lineTo(cx-56,ay);CTX.stroke();
  CTX.beginPath();CTX.moveTo(cx+24,cy+5);CTX.lineTo(cx+56,ay);CTX.stroke();
  // legs
  CTX.beginPath();CTX.moveTo(cx-84,cy+8);CTX.lineTo(cx-94,cy+44);CTX.stroke();
  CTX.beginPath();CTX.moveTo(cx-84,cy+8);CTX.lineTo(cx-72,cy+44);CTX.stroke();
  barbell(cx,ay,124); glo(cx,ay,46,'rgba(255,230,0,.18)');
  // chest highlight
  CTX.fillStyle='rgba(232,255,0,.06)';CTX.beginPath();CTX.ellipse(cx,cy+4,52,14,0,0,Math.PI*2);CTX.fill();
  rep_flash(t,cy-58); wm('BENCH PRESS');
},
incline_press(t){
  const p=Math.sin(t*Math.PI*2)*.5+.5,cx=290,cy=208;
  CTX.save();CTX.translate(cx,cy);CTX.rotate(-.28);bench_shape(0,0);CTX.restore();
  CTX.strokeStyle='#00ffcc';CTX.lineWidth=3.5;CTX.lineCap='round';
  CTX.beginPath();CTX.moveTo(cx-70,cy+22);CTX.lineTo(cx+44,cy-18);CTX.stroke();
  CTX.beginPath();CTX.arc(cx+58,cy-30,13,0,Math.PI*2);CTX.stroke();
  const ay=cy-20-p*34;
  CTX.beginPath();CTX.moveTo(cx,cy);CTX.lineTo(cx-40,ay);CTX.stroke();
  CTX.beginPath();CTX.moveTo(cx,cy);CTX.lineTo(cx+40,ay);CTX.stroke();
  dumbbell(cx-42,ay-4); dumbbell(cx+42,ay-4); glo(cx,ay,40,'rgba(255,230,0,.15)');
  rep_flash(t,cy-78); wm('INCLINE PRESS');
},
cable_fly(t){
  const p=Math.sin(t*Math.PI*2)*.5+.5,cx=290,cy=196,sp=22+p*84;
  cable(24,22,cx-sp,cy-18); cable(CW-24,22,cx+sp,cy-18);
  // anchor circles
  CTX.fillStyle='#1e1e35';CTX.strokeStyle='rgba(168,85,247,.7)';CTX.lineWidth=2;
  CTX.beginPath();CTX.arc(24,22,9,0,Math.PI*2);CTX.fill();CTX.stroke();
  CTX.beginPath();CTX.arc(CW-24,22,9,0,Math.PI*2);CTX.fill();CTX.stroke();
  human(cx,cy,1.2,{aR:[sp,-18],aL:[-sp,-18],lR:[18,80],lL:[-18,80]});
  // handles
  CTX.fillStyle='#ffe600';
  CTX.beginPath();CTX.arc(cx-sp,cy-18,7,0,Math.PI*2);CTX.fill();
  CTX.beginPath();CTX.arc(cx+sp,cy-18,7,0,Math.PI*2);CTX.fill();
  // chest glo
  glo(cx,cy-6,56,'rgba(0,255,204,.07)');
  rep_flash(t,cy-88); wm('CABLE CROSSOVER');
},
pushdown(t){
  const p=Math.sin(t*Math.PI*2)*.5+.5,cx=290,cy=178,ad=38+p*54;
  // machine top
  CTX.fillStyle='#1e1e35';CTX.strokeStyle='rgba(168,85,247,.6)';CTX.lineWidth=2;
  CTX.beginPath();CTX.roundRect(cx-30,0,60,18,3);CTX.fill();CTX.stroke();
  cable(cx,18,cx,cy-72);
  // V-bar handle
  CTX.strokeStyle='#ffe600';CTX.lineWidth=4;CTX.lineCap='round';
  CTX.beginPath();CTX.moveTo(cx-24,cy-74);CTX.lineTo(cx+24,cy-74);CTX.stroke();
  CTX.beginPath();CTX.moveTo(cx-24,cy-74);CTX.lineTo(cx-32,cy-60);CTX.stroke();
  CTX.beginPath();CTX.moveTo(cx+24,cy-74);CTX.lineTo(cx+32,cy-60);CTX.stroke();
  human(cx,cy,1.1,{aR:[26,-32+ad],aL:[-26,-32+ad],lR:[14,80],lL:[-14,80]});
  // tricep highlight
  CTX.fillStyle='rgba(232,255,0,.1)';
  CTX.beginPath();CTX.ellipse(cx-24,cy-20+ad*.4,12,18,-.3,0,Math.PI*2);CTX.fill();
  CTX.beginPath();CTX.ellipse(cx+24,cy-20+ad*.4,12,18,.3,0,Math.PI*2);CTX.fill();
  rep_flash(t,cy-78); wm('TRICEP PUSHDOWN');
},
oh_ext(t){
  const p=Math.sin(t*Math.PI*2)*.5+.5,cx=290,cy=192,ah=-52+p*88;
  human(cx,cy,1.1,{aR:[10,ah*.5],aL:[-10,ah*.5],lR:[14,80],lL:[-14,80]});
  dumbbell(cx,cy-96+p*40); glo(cx,cy-90+p*36,28,'rgba(255,230,0,.2)');
  rep_flash(t,cy-86); wm('OH EXTENSION');
},
dips(t){
  const p=Math.sin(t*Math.PI*2)*.5+.5,cx=290,cy=156+p*42;
  // bars
  CTX.fillStyle='#1a1a2e';CTX.strokeStyle='rgba(168,85,247,.7)';CTX.lineWidth=8;CTX.lineCap='round';
  CTX.beginPath();CTX.moveTo(cx-74,130);CTX.lineTo(cx-74,CH-20);CTX.stroke();
  CTX.beginPath();CTX.moveTo(cx+74,130);CTX.lineTo(cx+74,CH-20);CTX.stroke();
  // support cross bars
  CTX.lineWidth=3;CTX.strokeStyle='rgba(168,85,247,.4)';
  for(const ox of[-74,74]){CTX.beginPath();CTX.moveTo(cx+ox,148);CTX.lineTo(cx+ox+Math.sign(cx-ox-cx)*30,176);CTX.stroke();}
  human(cx,cy,1.1,{aR:[70,-28],aL:[-70,-28],lR:[9,88],lL:[-9,88]});
  rep_flash(t,cy-86); wm('DIPS');
},
deadlift(t){
  const fY=268,p=Math.sin(t*Math.PI*2)*.5+.5,cx=290,lift=p*108;
  fl(fY); barbell(cx,fY-lift,140); glo(cx,fY-lift*.5,54,'rgba(255,230,0,.14)');
  const lean=(1-p)*20;
  human(cx,fY-82,1.2,{aR:[26,22-p*22],aL:[-26,22-p*22],lR:[18,80],lL:[-18,80],lean:lean});
  // back highlight
  CTX.fillStyle='rgba(232,255,0,.07)';CTX.beginPath();CTX.ellipse(cx+lean*.5,fY-130+lift*.4,22,40,-.2,0,Math.PI*2);CTX.fill();
  rep_flash(t,fY-194); wm('DEADLIFT');
},
pullup(t){
  const p=Math.sin(t*Math.PI*2)*.5+.5,cx=290,cy=80+p*96;
  // bar
  CTX.fillStyle='#1a1a2e';CTX.strokeStyle='rgba(168,85,247,.8)';CTX.lineWidth=10;CTX.lineCap='round';
  CTX.beginPath();CTX.moveTo(cx-84,74);CTX.lineTo(cx+84,74);CTX.stroke();
  // supports
  CTX.lineWidth=3;CTX.strokeStyle='rgba(168,85,247,.4)';
  CTX.beginPath();CTX.moveTo(cx-60,74);CTX.lineTo(cx-60,0);CTX.stroke();
  CTX.beginPath();CTX.moveTo(cx+60,74);CTX.lineTo(cx+60,0);CTX.stroke();
  human(cx,cy+60,1.1,{aR:[28,-58-p*10],aL:[-28,-58-p*10],lR:[7,88],lL:[-7,88]});
  // hand grips
  CTX.fillStyle='rgba(0,255,204,.3)';
  CTX.beginPath();CTX.arc(cx-28,74,7,0,Math.PI*2);CTX.fill();
  CTX.beginPath();CTX.arc(cx+28,74,7,0,Math.PI*2);CTX.fill();
  // lat glo
  glo(cx-36,cy+90,28,'rgba(0,255,204,.08)'); glo(cx+36,cy+90,28,'rgba(0,255,204,.08)');
  rep_flash(t,260); wm('PULL-UP');
},
bent_row(t){
  const fY=268,p=Math.sin(t*Math.PI*2)*.5+.5,cx=290,cy=235,ap=p*36;
  fl(fY);
  human(cx,cy,1.1,{aR:[28,ap-8],aL:[-28,ap-8],lR:[18,80],lL:[-18,80],lean:16});
  barbell(cx,cy+ap,128); glo(cx,cy+ap,36,'rgba(255,230,0,.13)');
  rep_flash(t,cy-84); wm('BENT-OVER ROW');
},
cable_row(t){
  const p=Math.sin(t*Math.PI*2)*.5+.5,cx=290,cy=220;
  // machine left
  CTX.fillStyle='#0f0f1e';CTX.strokeStyle='rgba(168,85,247,.3)';CTX.lineWidth=2;
  CTX.beginPath();CTX.rect(0,0,28,CH);CTX.fill();CTX.stroke();
  machine_sled(14,100,26,32);
  cable(27,100,cx-30-p*20,cy+18);
  // seat
  CTX.fillStyle='#1a1a2e';CTX.strokeStyle='rgba(168,85,247,.5)';CTX.lineWidth=2;
  CTX.beginPath();CTX.roundRect(cx+50,cy+20,160,14,3);CTX.fill();CTX.stroke();
  human(cx+p*8,cy,1.1,{aR:[-22+p*5,20],aL:[-32+p*5,20],lR:[80,40],lL:[120,40]});
  rep_flash(t,cy-76); wm('CABLE ROW');
},
bicep_curl(t){
  const p=Math.sin(t*Math.PI*2)*.5+.5,cx=290,cy=200,ah=-55+p*76;
  human(cx,cy,1.2,{aR:[34,ah],aL:[-34,ah],lR:[14,80],lL:[-14,80]});
  barbell(cx,cy+ah-4,80); glo(cx,cy+ah,32,'rgba(255,230,0,.16)');
  // bicep highlight
  CTX.fillStyle='rgba(232,255,0,.1)';
  CTX.beginPath();CTX.ellipse(cx-30,cy+ah*.4-10,12,18,.3,0,Math.PI*2);CTX.fill();
  CTX.beginPath();CTX.ellipse(cx+30,cy+ah*.4-10,12,18,-.3,0,Math.PI*2);CTX.fill();
  rep_flash(t,cy-88); wm('BICEP CURL');
},
hammer_curl(t){
  const p=Math.sin(t*Math.PI*2)*.5+.5,cx=290,cy=200;
  const a1=-55+p*68,a2=-55+Math.sin((t+.5)*Math.PI*2)*.5*68+34;
  human(cx,cy,1.2,{aR:[34,a1],aL:[-34,a2],lR:[14,80],lL:[-14,80]});
  dumbbell(cx+26,cy+a1); dumbbell(cx-38,cy+a2);
  rep_flash(t,cy-88); wm('HAMMER CURL');
},
squat(t){
  const fY=268,p=Math.sin(t*Math.PI*2)*.5+.5,cx=290,dip=p*20;
  fl(fY);
  human(cx,fY-82-dip*.5,1.2,{aR:[40,-14],aL:[-40,-14],lR:[22+dip*.5,80+dip],lL:[-22-dip*.5,80+dip]});
  barbell(cx,fY-142-dip*.5+dip,154); glo(cx,fY-100,54,'rgba(255,230,0,.12)');
  // quad highlight
  CTX.fillStyle='rgba(232,255,0,.08)';
  CTX.beginPath();CTX.ellipse(cx-28,fY-50+dip,18,28,-0.3,0,Math.PI*2);CTX.fill();
  CTX.beginPath();CTX.ellipse(cx+28,fY-50+dip,18,28,0.3,0,Math.PI*2);CTX.fill();
  rep_flash(t,fY-210); wm('BACK SQUAT');
},
leg_press(t){
  const p=Math.sin(t*Math.PI*2)*.5+.5,cx=290,cy=196,le=p*56;
  machine_sled(cx,cy,214,30);
  // guide rails
  CTX.strokeStyle='rgba(168,85,247,.4)';CTX.lineWidth=2;
  CTX.beginPath();CTX.moveTo(cx-96,cy+14);CTX.lineTo(cx-96-20,cy-30);CTX.stroke();
  CTX.beginPath();CTX.moveTo(cx+96,cy+14);CTX.lineTo(cx+96+20,cy-30);CTX.stroke();
  // sled platform
  CTX.fillStyle='rgba(168,85,247,.35)';
  CTX.beginPath();CTX.roundRect(cx-108-le,cy-42+le,90,22,3);CTX.fill();
  // reclining figure
  CTX.strokeStyle='#00ffcc';CTX.lineWidth=3.5;CTX.lineCap='round';
  CTX.beginPath();CTX.moveTo(cx-94,cy+18);CTX.lineTo(cx+54,cy+18);CTX.stroke();
  CTX.beginPath();CTX.arc(cx+68,cy+18,13,0,Math.PI*2);CTX.stroke();
  // legs pressing
  CTX.beginPath();CTX.moveTo(cx-20,cy+18);CTX.lineTo(cx-54-le,cy-20+le);CTX.stroke();
  CTX.beginPath();CTX.moveTo(cx-6,cy+18);CTX.lineTo(cx-38-le,cy-20+le);CTX.stroke();
  rep_flash(t,cy-68); wm('LEG PRESS');
},
rdl(t){
  const fY=268,p=Math.sin(t*Math.PI*2)*.5+.5,cx=290,ln=p*26;
  fl(fY);
  human(cx,fY-82,1.2,{aR:[24,ln+9],aL:[-24,ln+9],lR:[11,80],lL:[-11,80],lean:ln});
  barbell(cx+ln*.8,fY-82+ln+9,126); 
  // hamstring glo
  glo(cx,fY-50,42,'rgba(232,255,0,.1)');
  rep_flash(t,fY-194); wm('ROMANIAN DL');
},
lunge(t){
  const fY=268,p=Math.sin(t*Math.PI*2)*.5+.5,cx=268+p*18;
  fl(fY);
  human(cx,fY-100,1.1,{aR:[38,0],aL:[-38,0],lR:[52+p*18,82+p*18],lL:[-18,80]});
  dumbbell(cx+56,fY-100); dumbbell(cx-64,fY-100);
  rep_flash(t,fY-204); wm('WALKING LUNGE');
},
leg_ext(t){
  const p=Math.sin(t*Math.PI*2)*.5+.5,cx=290,cy=180,le=p*62;
  machine_sled(cx,cy+20,110,20);
  // back support
  CTX.fillStyle='#1a1a2e';CTX.strokeStyle='rgba(168,85,247,.5)';CTX.lineWidth=2;
  CTX.beginPath();CTX.roundRect(cx+38,cy-54,22,74,4);CTX.fill();CTX.stroke();
  // seated figure
  CTX.strokeStyle='#00ffcc';CTX.lineWidth=3.5;CTX.lineCap='round';
  CTX.beginPath();CTX.moveTo(cx,cy+20);CTX.lineTo(cx,cy-50);CTX.stroke();
  CTX.beginPath();CTX.arc(cx,cy-64,13,0,Math.PI*2);CTX.stroke();
  CTX.beginPath();CTX.moveTo(cx,cy-28);CTX.lineTo(cx+34,cy-18);CTX.stroke();
  CTX.beginPath();CTX.moveTo(cx,cy-28);CTX.lineTo(cx-34,cy-18);CTX.stroke();
  CTX.beginPath();CTX.moveTo(cx+14,cy+20);CTX.lineTo(cx+38+le*.5,cy+44-le);CTX.stroke();
  CTX.beginPath();CTX.moveTo(cx-14,cy+20);CTX.lineTo(cx-38-le*.5,cy+44-le);CTX.stroke();
  // extension pad
  CTX.fillStyle='rgba(255,230,0,.5)';CTX.beginPath();CTX.roundRect(cx+18+le*.3,cy+20-le,30,12,3);CTX.fill();
  rep_flash(t,cy-86); wm('LEG EXTENSION');
},
calf(t){
  const fY=268,p=Math.sin(t*Math.PI*2)*.5+.5,cx=290,lf=p*24;
  fl(fY);
  // step platform
  CTX.fillStyle='rgba(168,85,247,.2)';CTX.strokeStyle='rgba(168,85,247,.5)';CTX.lineWidth=2;
  CTX.beginPath();CTX.roundRect(cx-56,fY,112,16,3);CTX.fill();CTX.stroke();
  human(cx,fY-82-lf,1.2,{aR:[28,18],aL:[-28,18],lR:[9,80],lL:[-9,80]});
  // calf highlight
  CTX.fillStyle='rgba(232,255,0,.12)';
  CTX.beginPath();CTX.ellipse(cx-9,fY-42-lf*.5,12,22,0,0,Math.PI*2);CTX.fill();
  CTX.beginPath();CTX.ellipse(cx+9,fY-42-lf*.5,12,22,0,0,Math.PI*2);CTX.fill();
  glo(cx,fY-18,38,'rgba(0,255,204,.09)');
  rep_flash(t,fY-202); wm('CALF RAISE');
},
shoulder_press(t){
  const p=Math.sin(t*Math.PI*2)*.5+.5,cx=290,cy=200,ah=-48+p*72;
  // bench seat
  CTX.fillStyle='#1a1a2e';CTX.strokeStyle='rgba(168,85,247,.5)';CTX.lineWidth=2;
  CTX.beginPath();CTX.roundRect(cx-38,cy+18,76,16,3);CTX.fill();CTX.stroke();
  human(cx,cy,1.1,{aR:[38,ah],aL:[-38,ah],lR:[28,68],lL:[-28,68]});
  dumbbell(cx-40,cy+ah); dumbbell(cx+40,cy+ah);
  glo(cx,cy+ah,40,'rgba(255,230,0,.16)');
  // delt highlight
  CTX.fillStyle='rgba(232,255,0,.1)';
  CTX.beginPath();CTX.ellipse(cx-36,cy-4+ah*.3,16,18,-.3,0,Math.PI*2);CTX.fill();
  CTX.beginPath();CTX.ellipse(cx+36,cy-4+ah*.3,16,18,.3,0,Math.PI*2);CTX.fill();
  rep_flash(t,cy-96); wm('SHOULDER PRESS');
},
lateral(t){
  const p=Math.sin(t*Math.PI*2)*.5+.5,cx=290,cy=200,sp=18+p*72;
  human(cx,cy,1.2,{aR:[sp,-sp*.5],aL:[-sp,-sp*.5],lR:[14,80],lL:[-14,80]});
  dumbbell(cx+sp+2,-sp*.5+cy+11); dumbbell(cx-sp-2,-sp*.5+cy+11);
  // delt highlight
  CTX.fillStyle='rgba(232,255,0,.12)';
  CTX.beginPath();CTX.ellipse(cx-sp*.4,cy-16,22,12,-.2,0,Math.PI*2);CTX.fill();
  CTX.beginPath();CTX.ellipse(cx+sp*.4,cy-16,22,12,.2,0,Math.PI*2);CTX.fill();
  rep_flash(t,cy-88); wm('LATERAL RAISE');
},
rear_fly(t){
  const p=Math.sin(t*Math.PI*2)*.5+.5,cx=290,cy=218,sp=18+p*72;
  human(cx,cy,1.1,{aR:[sp,9],aL:[-sp,9],lR:[14,80],lL:[-14,80],lean:18});
  dumbbell(cx+sp+4,cy+10); dumbbell(cx-sp-4,cy+10);
  rep_flash(t,cy-88); wm('REAR DELT FLY');
},
shrug(t){
  const p=Math.sin(t*Math.PI*2)*.5+.5,cx=290,cy=200-p*10;
  human(cx,cy,1.2,{aR:[28,28],aL:[-28,28],lR:[14,80],lL:[-14,80]});
  barbell(cx,cy+28,148); glo(cx,cy,46,'rgba(0,255,204,.08)');
  // trap highlight
  CTX.fillStyle='rgba(232,255,0,.12)';
  CTX.beginPath();CTX.ellipse(cx-22,cy-30,18,16,-.4,0,Math.PI*2);CTX.fill();
  CTX.beginPath();CTX.ellipse(cx+22,cy-30,18,16,.4,0,Math.PI*2);CTX.fill();
  rep_flash(t,cy-88); wm('BARBELL SHRUG');
},
plank(t){
  const fY=255,px=Math.sin(t*Math.PI*4)*2.5,cx=290,cy=fY-32+px;
  fl(fY);
  CTX.strokeStyle='#00ffcc';CTX.lineWidth=3.5;CTX.lineCap='round';
  CTX.beginPath();CTX.moveTo(cx-114,cy);CTX.lineTo(cx+90,cy);CTX.stroke();
  CTX.beginPath();CTX.arc(cx+104,cy,13,0,Math.PI*2);CTX.stroke();
  for(const ox of[-32,32]){CTX.beginPath();CTX.moveTo(cx+ox,cy);CTX.lineTo(cx+ox,fY);CTX.stroke();}
  CTX.beginPath();CTX.moveTo(cx-114,cy);CTX.lineTo(cx-114,fY);CTX.stroke();
  // core highlight
  CTX.fillStyle='rgba(232,255,0,.08)';CTX.beginPath();CTX.ellipse(cx-12,cy,70,9,0,0,Math.PI*2);CTX.fill();
  glo(cx,fY,72,'rgba(0,255,204,.08)');
  CTX.fillStyle='rgba(232,255,0,.8)';CTX.font="bold 30px 'Bebas Neue',sans-serif";CTX.textAlign='center';
  CTX.fillText(Math.floor(_t*62)+'s',cx,cy-50); wm('PLANK');
},
crunch(t){
  const fY=268,p=Math.sin(t*Math.PI*2)*.5+.5,cx=290,curl=p*40;
  fl(fY);
  CTX.strokeStyle='#00ffcc';CTX.lineWidth=3.5;CTX.lineCap='round';
  CTX.beginPath();CTX.moveTo(cx-84,fY-18);CTX.lineTo(cx+24,fY-18);CTX.stroke();
  CTX.beginPath();CTX.moveTo(cx+24,fY-18);CTX.bezierCurveTo(cx+46,fY-18,cx+54,fY-42-curl,cx+64,fY-54-curl);CTX.stroke();
  CTX.beginPath();CTX.arc(cx+78,fY-66-curl,13,0,Math.PI*2);CTX.stroke();
  CTX.beginPath();CTX.moveTo(cx+44,fY-30-curl*.5);CTX.lineTo(cx+70,fY-30-curl*.5);CTX.stroke();
  CTX.beginPath();CTX.moveTo(cx+44,fY-30-curl*.5);CTX.lineTo(cx+18,fY-30-curl*.5);CTX.stroke();
  CTX.beginPath();CTX.moveTo(cx-32,fY-18);CTX.lineTo(cx-64,fY-18);CTX.lineTo(cx-64,fY);CTX.stroke();
  CTX.beginPath();CTX.moveTo(cx-12,fY-18);CTX.lineTo(cx-32,fY-18);CTX.lineTo(cx-22,fY);CTX.stroke();
  rep_flash(t,fY-146); wm('CABLE CRUNCH');
},
leg_raise(t){
  const p=Math.sin(t*Math.PI*2)*.5+.5,cx=290,lr=p*92;
  CTX.fillStyle='#1a1a2e';CTX.strokeStyle='rgba(168,85,247,.8)';CTX.lineWidth=10;CTX.lineCap='round';
  CTX.beginPath();CTX.moveTo(cx-84,72);CTX.lineTo(cx+84,72);CTX.stroke();
  // supports
  CTX.lineWidth=3;CTX.strokeStyle='rgba(168,85,247,.4)';
  CTX.beginPath();CTX.moveTo(cx-60,72);CTX.lineTo(cx-60,0);CTX.stroke();
  CTX.beginPath();CTX.moveTo(cx+60,72);CTX.lineTo(cx+60,0);CTX.stroke();
  human(cx,124,1.1,{aR:[26,-66],aL:[-26,-66],lR:[9+lr*.3,80-lr],lL:[-9-lr*.3,80-lr]});
  // hand grips
  CTX.fillStyle='rgba(0,255,204,.3)';
  CTX.beginPath();CTX.arc(cx-26,72,7,0,Math.PI*2);CTX.fill();
  CTX.beginPath();CTX.arc(cx+26,72,7,0,Math.PI*2);CTX.fill();
  rep_flash(t,258); wm('HANGING LEG RAISE');
},
skull(t){
  const p=Math.sin(t*Math.PI*2)*.5+.5,cx=290,cy=200;
  bench_shape(cx,cy+18);
  CTX.strokeStyle='#00ffcc';CTX.lineWidth=3.5;CTX.lineCap='round';
  CTX.beginPath();CTX.moveTo(cx-84,cy+8);CTX.lineTo(cx+72,cy+8);CTX.stroke();
  CTX.beginPath();CTX.arc(cx+86,cy+8,13,0,Math.PI*2);CTX.stroke();
  const ay=cy-28+p*40;
  CTX.beginPath();CTX.moveTo(cx-24,cy+5);CTX.lineTo(cx-12,ay);CTX.stroke();
  CTX.beginPath();CTX.moveTo(cx+24,cy+5);CTX.lineTo(cx+12,ay);CTX.stroke();
  barbell(cx,ay,70); glo(cx,ay,32,'rgba(255,230,0,.16)');
  rep_flash(t,cy-58); wm('SKULL CRUSHER');
},
inc_curl(t){
  const p=Math.sin(t*Math.PI*2)*.5+.5,cx=290,cy=210;
  CTX.save();CTX.translate(cx,cy);CTX.rotate(-.28);bench_shape(0,0);CTX.restore();
  CTX.strokeStyle='#00ffcc';CTX.lineWidth=3.5;CTX.lineCap='round';
  CTX.beginPath();CTX.moveTo(cx-68,cy+22);CTX.lineTo(cx+44,cy-18);CTX.stroke();
  CTX.beginPath();CTX.arc(cx+58,cy-30,13,0,Math.PI*2);CTX.stroke();
  const ah=-18+p*60;
  CTX.beginPath();CTX.moveTo(cx,cy);CTX.lineTo(cx+38,cy+ah);CTX.stroke();
  CTX.beginPath();CTX.moveTo(cx-10,cy+4);CTX.lineTo(cx-44,cy+ah+4);CTX.stroke();
  dumbbell(cx+30,cy+ah); dumbbell(cx-52,cy+ah+4);
  rep_flash(t,cy-78); wm('INCLINE CURL');
},
wrist_curl(t){
  const p=Math.sin(t*Math.PI*2)*.5+.5,cx=290,cy=222;
  bench_shape(cx,cy+38);
  CTX.strokeStyle='#00ffcc';CTX.lineWidth=3.5;CTX.lineCap='round';
  CTX.beginPath();CTX.moveTo(cx-64,cy+18);CTX.lineTo(cx+64,cy+18);CTX.stroke();
  for(const ox of[-64,64]){CTX.beginPath();CTX.moveTo(cx+ox,cy);CTX.lineTo(cx+ox,cy+18);CTX.stroke();}
  barbell(cx,cy+18-p*25,100); glo(cx,cy+18-p*12,28,'rgba(255,230,0,.16)');
  rep_flash(t,cy-56); wm('WRIST CURL');
},
rev_curl(t){
  const p=Math.sin(t*Math.PI*2)*.5+.5,cx=290,cy=200,ah=-46+p*72;
  human(cx,cy,1.2,{aR:[34,ah],aL:[-34,ah],lR:[14,80],lL:[-14,80]});
  barbell(cx,cy+ah-4,90,'#a855f7'); glo(cx,cy+ah,32,'rgba(168,85,247,.18)');
  rep_flash(t,cy-88,'rgba(168,85,247,'); wm('REVERSE CURL');
},
standing_ohp(t){
  const fY=268,p=Math.sin(t*Math.PI*2)*.5+.5,cx=290,cy=235,ah=-56+p*92;
  fl(fY);
  human(cx,cy,1.2,{aR:[34,ah],aL:[-34,ah],lR:[11,80],lL:[-11,80]});
  barbell(cx,cy+ah,108); glo(cx,cy+ah,46,'rgba(255,230,0,.17)');
  rep_flash(t,cy-96); wm('STANDING OHP');
},
plyo_push(t){
  const fY=260,p=Math.sin(t*Math.PI*2)*.5+.5,airH=p>.65?(p-.65)/.35*38:0;
  const cx=290,cy=fY-32+8*Math.sin(t*Math.PI*2)-airH;
  fl(fY);
  CTX.strokeStyle='#00ffcc';CTX.lineWidth=3.5;CTX.lineCap='round';
  CTX.beginPath();CTX.moveTo(cx-114,cy);CTX.lineTo(cx+90,cy);CTX.stroke();
  CTX.beginPath();CTX.arc(cx+104,cy,13,0,Math.PI*2);CTX.stroke();
  const ah=p*18+airH;
  for(const ox of[-32,32]){CTX.beginPath();CTX.moveTo(cx+ox,cy);CTX.lineTo(cx+ox,fY-ah);CTX.stroke();}
  CTX.beginPath();CTX.moveTo(cx-114,cy);CTX.lineTo(cx-114,fY);CTX.stroke();
  if(airH>4)glo(cx,fY-8,64,'rgba(0,255,204,.13)');
  rep_flash(t,cy-56); wm('PLYO PUSH-UP');
},
face_pull(t){
  const p=Math.sin(t*Math.PI*2)*.5+.5,cx=290,cy=200,sp=18+p*42;
  // cable machine right
  CTX.fillStyle='#0f0f1e';CTX.strokeStyle='rgba(168,85,247,.3)';CTX.lineWidth=2;
  CTX.beginPath();CTX.rect(CW-28,0,28,CH);CTX.fill();CTX.stroke();
  machine_sled(CW-14,100,26,34);
  cable(CW-28,100,cx+28+p*18,cy-18);
  human(cx,cy,1.1,{aR:[sp,-18],aL:[-sp,-18],lR:[11,80],lL:[-11,80]});
  // rope handles
  CTX.strokeStyle='#ffe600';CTX.lineWidth=3;CTX.lineCap='round';
  CTX.beginPath();CTX.moveTo(cx+28+p*18,cy-24);CTX.lineTo(cx+36+p*18,cy-18);CTX.stroke();
  CTX.beginPath();CTX.moveTo(cx+28+p*18,cy-12);CTX.lineTo(cx+36+p*18,cy-18);CTX.stroke();
  glo(cx,cy-18,46,'rgba(0,255,204,.08)');
  rep_flash(t,cy-88); wm('FACE PULLS');
},
hip_stretch(t){
  const fY=268,p=Math.sin(t*Math.PI*1)*.5+.5,cx=290;
  fl(fY);
  human(cx,fY-92,1.1,{aR:[10,18],aL:[-10,18],lR:[52+p*22,80],lL:[-15,28],lean:-5,col:'#00e676'});
  glo(cx,fY-30,60,'rgba(0,230,118,.09)'); wm('HIP FLEXOR STRETCH');
},
foam_roll(t){
  const fY=260,rx=Math.sin(t*Math.PI*2)*30,cx=290+rx;
  fl(fY);
  CTX.strokeStyle='rgba(168,85,247,.7)';CTX.lineWidth=14;CTX.lineCap='round';
  CTX.beginPath();CTX.moveTo(cx-64,fY-18);CTX.lineTo(cx+24,fY-18);CTX.stroke();
  CTX.strokeStyle='#00ffcc';CTX.lineWidth=3.5;CTX.lineCap='round';
  CTX.beginPath();CTX.moveTo(cx-90,fY-16);CTX.lineTo(cx+74,fY-16);CTX.stroke();
  CTX.beginPath();CTX.arc(cx+88,fY-16,13,0,Math.PI*2);CTX.stroke();
  wm('FOAM ROLLING');
},
shoulder_str(t){
  const fY=268,p=Math.sin(t*Math.PI*1)*.5+.5,cx=290;
  fl(fY);
  human(cx,fY-82,1.1,{aR:[-18+p*62,-20],aL:[-50,-10],lR:[12,80],lL:[-12,80],col:'#00e676'});
  glo(cx+10,fY-102,40,'rgba(0,230,118,.09)'); wm('SHOULDER STRETCH');
},

// ── HOME WORKOUT ANIMATIONS (blue col) ──────────────────────────────
pushup(t){
  const fY=260,p=Math.sin(t*Math.PI*2)*.5+.5,cx=290,cy=fY-32-p*18;
  fl(fY,'rgba(100,180,255,.15)');
  CTX.strokeStyle='#64b4ff';CTX.lineWidth=3.5;CTX.lineCap='round';
  CTX.beginPath();CTX.moveTo(cx-114,cy);CTX.lineTo(cx+90,cy);CTX.stroke();
  CTX.beginPath();CTX.arc(cx+104,cy,13,0,Math.PI*2);CTX.stroke();
  for(const ox of[-32,32]){CTX.beginPath();CTX.moveTo(cx+ox,cy);CTX.lineTo(cx+ox,fY);CTX.stroke();}
  CTX.beginPath();CTX.moveTo(cx-114,cy);CTX.lineTo(cx-114,fY);CTX.stroke();
  // chest + tricep glo
  CTX.fillStyle='rgba(100,180,255,.07)';CTX.beginPath();CTX.ellipse(cx-12,cy,70,10,0,0,Math.PI*2);CTX.fill();
  glo(cx,fY-8,60,'rgba(100,180,255,.1)');
  rep_flash(t,cy-42,'rgba(100,180,255,'); wm('PUSH-UP');
},
wide_push(t){
  const fY=260,p=Math.sin(t*Math.PI*2)*.5+.5,cx=290,cy=fY-30-p*18;
  fl(fY,'rgba(100,180,255,.15)');
  CTX.strokeStyle='#64b4ff';CTX.lineWidth=3.5;CTX.lineCap='round';
  CTX.beginPath();CTX.moveTo(cx-114,cy);CTX.lineTo(cx+90,cy);CTX.stroke();
  CTX.beginPath();CTX.arc(cx+104,cy,13,0,Math.PI*2);CTX.stroke();
  for(const ox of[-56,56]){CTX.beginPath();CTX.moveTo(cx+ox,cy);CTX.lineTo(cx+ox,fY);CTX.stroke();}
  CTX.beginPath();CTX.moveTo(cx-114,cy);CTX.lineTo(cx-114,fY);CTX.stroke();
  rep_flash(t,cy-42,'rgba(100,180,255,'); wm('WIDE PUSH-UP');
},
diamond(t){
  const fY=260,p=Math.sin(t*Math.PI*2)*.5+.5,cx=290,cy=fY-30-p*18;
  fl(fY,'rgba(100,180,255,.15)');
  CTX.strokeStyle='#64b4ff';CTX.lineWidth=3.5;CTX.lineCap='round';
  CTX.beginPath();CTX.moveTo(cx-114,cy);CTX.lineTo(cx+90,cy);CTX.stroke();
  CTX.beginPath();CTX.arc(cx+104,cy,13,0,Math.PI*2);CTX.stroke();
  for(const ox of[-10,10]){CTX.beginPath();CTX.moveTo(cx+ox,cy);CTX.lineTo(cx+ox,fY);CTX.stroke();}
  CTX.beginPath();CTX.moveTo(cx-114,cy);CTX.lineTo(cx-114,fY);CTX.stroke();
  // diamond shape on floor
  CTX.strokeStyle='rgba(100,180,255,.45)';CTX.lineWidth=1.5;
  CTX.beginPath();CTX.moveTo(cx-10,fY);CTX.lineTo(cx,fY-12);CTX.lineTo(cx+10,fY);CTX.lineTo(cx,fY+10);CTX.closePath();CTX.stroke();
  rep_flash(t,cy-42,'rgba(100,180,255,'); wm('DIAMOND PUSH-UP');
},
pike(t){
  const fY=268,p=Math.sin(t*Math.PI*2)*.5+.5,cx=290,cy=196,headY=cy-28+p*40;
  fl(fY,'rgba(100,180,255,.15)');
  CTX.strokeStyle='#64b4ff';CTX.lineWidth=3.5;CTX.lineCap='round';
  CTX.beginPath();CTX.moveTo(cx-84,fY);CTX.lineTo(cx,cy);CTX.lineTo(cx+84,fY);CTX.stroke();
  CTX.beginPath();CTX.arc(cx,headY,13,0,Math.PI*2);CTX.stroke();
  // shoulder highlight
  CTX.fillStyle='rgba(100,180,255,.1)';CTX.beginPath();CTX.ellipse(cx,cy-8,24,14,0,0,Math.PI*2);CTX.fill();
  rep_flash(t,headY-42,'rgba(100,180,255,'); wm('PIKE PUSH-UP');
},
decline(t){ ANIMS.wide_push(t); wm('DECLINE PUSH-UP'); },
chair_dip(t){
  const p=Math.sin(t*Math.PI*2)*.5+.5,cx=290,cy=196+p*42;
  // chair
  CTX.fillStyle='#1a1a2e';CTX.strokeStyle='rgba(168,85,247,.55)';CTX.lineWidth=2;
  CTX.beginPath();CTX.roundRect(cx-54,168,108,16,3);CTX.fill();CTX.stroke();
  CTX.beginPath();CTX.roundRect(cx-48,118,14,50,3);CTX.fill();CTX.stroke();
  // legs
  for(const ox of[-40,40]){CTX.beginPath();CTX.moveTo(cx+ox,184);CTX.lineTo(cx+ox,CH-20);CTX.stroke();}
  human(cx,cy,1.1,{aR:[56,-56],aL:[-56,-56],lR:[14,80],lL:[-14,80],col:'#64b4ff'});
  rep_flash(t,264,'rgba(100,180,255,'); wm('CHAIR DIP');
},
planche(t){
  const fY=260,p=Math.sin(t*Math.PI*2)*.5+.5,cx=290,cy=fY-30-p*14;
  fl(fY,'rgba(100,180,255,.15)');
  CTX.strokeStyle='#64b4ff';CTX.lineWidth=3.5;CTX.lineCap='round';
  CTX.beginPath();CTX.moveTo(cx-114,cy);CTX.lineTo(cx+84,cy);CTX.stroke();
  CTX.beginPath();CTX.arc(cx+98,cy,13,0,Math.PI*2);CTX.stroke();
  for(const ox of[40,70]){CTX.beginPath();CTX.moveTo(cx+ox,cy);CTX.lineTo(cx+ox,fY);CTX.stroke();}
  CTX.beginPath();CTX.moveTo(cx-114,cy);CTX.lineTo(cx-114,fY);CTX.stroke();
  glo(cx,cy,68,'rgba(100,180,255,.08)');
  rep_flash(t,cy-38,'rgba(100,180,255,'); wm('PSEUDO PLANCHE PUSH-UP');
},
table_row(t){
  const fY=268,p=Math.sin(t*Math.PI*2)*.5+.5,cx=290,cy=fY-38-p*26;
  fl(fY,'rgba(100,180,255,.15)');
  // table
  CTX.fillStyle='#1a1a2e';CTX.strokeStyle='rgba(168,85,247,.55)';CTX.lineWidth=2;
  CTX.beginPath();CTX.roundRect(cx-116,fY-92,232,18,3);CTX.fill();CTX.stroke();
  for(const ox of[-106,106]){CTX.beginPath();CTX.moveTo(cx+ox,fY-74);CTX.lineTo(cx+ox,fY);CTX.stroke();}
  CTX.strokeStyle='#64b4ff';CTX.lineWidth=3.5;CTX.lineCap='round';
  CTX.beginPath();CTX.moveTo(cx-94,cy);CTX.lineTo(cx+72,cy);CTX.stroke();
  CTX.beginPath();CTX.arc(cx+86,cy,13,0,Math.PI*2);CTX.stroke();
  for(const ox of[-22,22]){CTX.beginPath();CTX.moveTo(cx+ox,cy);CTX.lineTo(cx+ox,fY);CTX.stroke();}
  // hand grips
  CTX.fillStyle='rgba(100,180,255,.35)';
  for(const ox of[-22,22]){CTX.beginPath();CTX.arc(cx+ox,fY-74,7,0,Math.PI*2);CTX.fill();}
  rep_flash(t,cy-40,'rgba(100,180,255,'); wm('TABLE ROW');
},
towel_curl(t){
  const p=Math.sin(t*Math.PI*2)*.5+.5,cx=290,cy=220;
  CTX.fillStyle='rgba(168,85,247,.35)';CTX.strokeStyle='rgba(168,85,247,.7)';CTX.lineWidth=3;
  CTX.beginPath();CTX.roundRect(cx-66,76,22,58,4);CTX.fill();CTX.stroke();
  CTX.strokeStyle='rgba(100,180,255,.55)';CTX.lineWidth=4;CTX.lineCap='round';
  CTX.beginPath();CTX.moveTo(cx-55,106);CTX.lineTo(cx-18,cy-46+p*18);CTX.stroke();
  human(cx+18,cy,1.1,{aR:[-48,-28+p*38],aL:[-58,-18+p*28],lR:[14,80],lL:[-14,80],lean:-9,col:'#64b4ff'});
  rep_flash(t,cy-88,'rgba(100,180,255,'); wm('TOWEL BICEP CURL');
},
superman(t){
  const fY=258,p=Math.sin(t*Math.PI*2)*.5+.5,cx=290,lf=p*22;
  fl(fY,'rgba(100,180,255,.15)');
  CTX.strokeStyle='#64b4ff';CTX.lineWidth=3.5;CTX.lineCap='round';
  CTX.beginPath();CTX.moveTo(cx-84,fY-18+lf*.3);CTX.lineTo(cx+72,fY-18+lf*.3);CTX.stroke();
  CTX.beginPath();CTX.arc(cx+86,fY-18+lf*.3,13,0,Math.PI*2);CTX.stroke();
  CTX.beginPath();CTX.moveTo(cx-84,fY-18+lf*.3);CTX.lineTo(cx-128,fY-28-lf);CTX.stroke();
  CTX.beginPath();CTX.moveTo(cx-84,fY-18+lf*.3);CTX.lineTo(cx-106,fY-18-lf);CTX.stroke();
  glo(cx,fY-18,56,'rgba(100,180,255,.08)');
  rep_flash(t,fY-76,'rgba(100,180,255,'); wm('SUPERMAN HOLD');
},
pull_apart(t){
  const p=Math.sin(t*Math.PI*2)*.5+.5,cx=290,cy=218,sp=28+p*72;
  human(cx,cy,1.1,{aR:[sp,-9],aL:[-sp,-9],lR:[11,80],lL:[-11,80],col:'#64b4ff'});
  CTX.strokeStyle='rgba(100,180,255,.55)';CTX.lineWidth=4.5;CTX.lineCap='round';
  CTX.beginPath();CTX.moveTo(cx-sp+10,cy-9);CTX.lineTo(cx+sp-10,cy-9);CTX.stroke();
  rep_flash(t,cy-88,'rgba(100,180,255,'); wm('PULL-APART');
},
arch_hold(t){
  const fY=258,p=Math.sin(t*Math.PI*2)*.5+.5,cx=290,lf=p*26;
  fl(fY,'rgba(100,180,255,.15)');
  CTX.strokeStyle='#64b4ff';CTX.lineWidth=3.5;CTX.lineCap='round';
  CTX.beginPath();CTX.moveTo(cx-76,fY-18);CTX.quadraticCurveTo(cx,fY-18-lf,cx+76,fY-18);CTX.stroke();
  CTX.beginPath();CTX.arc(cx+90,fY-18+lf*.1,13,0,Math.PI*2);CTX.stroke();
  CTX.beginPath();CTX.moveTo(cx-76,fY-18);CTX.lineTo(cx-116,fY-18-lf*.8);CTX.stroke();
  wm('ARCH BODY HOLD');
},
iso_curl(t){
  const p=Math.sin(t*Math.PI*2)*.5+.5,cx=290,cy=222;
  CTX.fillStyle='#1a1a2e';CTX.strokeStyle='rgba(168,85,247,.5)';CTX.lineWidth=2;
  CTX.beginPath();CTX.roundRect(cx-106,cy-28,212,18,3);CTX.fill();CTX.stroke();
  human(cx,cy,1.1,{aR:[24,-24+p*5],aL:[-24,-24+p*5],lR:[18,68],lL:[-18,68],col:'#64b4ff'});
  glo(cx,cy-18,38,'rgba(100,180,255,.1)'); wm('ISOMETRIC CURL');
},
bw_squat(t){
  const fY=268,p=Math.sin(t*Math.PI*2)*.5+.5,cx=290,dip=p*20;
  fl(fY,'rgba(100,180,255,.15)');
  human(cx,fY-82-dip*.5,1.2,{aR:[38,-14],aL:[-38,-14],lR:[22+dip*.5,80+dip],lL:[-22-dip*.5,80+dip],col:'#64b4ff'});
  CTX.fillStyle='rgba(100,180,255,.08)';
  CTX.beginPath();CTX.ellipse(cx-28,fY-50+dip,18,28,-.3,0,Math.PI*2);CTX.fill();
  CTX.beginPath();CTX.ellipse(cx+28,fY-50+dip,18,28,.3,0,Math.PI*2);CTX.fill();
  glo(cx,fY-18,54,'rgba(100,180,255,.07)');
  rep_flash(t,fY-194,'rgba(100,180,255,'); wm('BODYWEIGHT SQUAT');
},
jump_squat(t){
  const fY=268,p=Math.sin(t*Math.PI*2)*.5+.5,airH=p>.6?(p-.6)/.4*76:0,cx=290;
  fl(fY,'rgba(100,180,255,.15)');
  human(cx,fY-82-airH,1.2,{aR:[34,airH>28?-28:-14],aL:[-34,airH>28?-28:-14],lR:[21,80],lL:[-21,80],col:'#64b4ff'});
  if(airH>4)glo(cx,fY-8,68,'rgba(100,180,255,.13)');
  rep_flash(t,Math.min(fY-82-airH-60,fY-182),'rgba(100,180,255,'); wm('JUMP SQUAT');
},
bss(t){
  const fY=268,p=Math.sin(t*Math.PI*2)*.5+.5,cx=264,dip=p*30;
  fl(fY,'rgba(100,180,255,.15)');
  CTX.fillStyle='#1a1a2e';CTX.strokeStyle='rgba(168,85,247,.5)';CTX.lineWidth=2;
  CTX.beginPath();CTX.roundRect(cx+104,fY-48,92,14,3);CTX.fill();CTX.stroke();
  human(cx,fY-82-dip*.3,1.1,{aR:[9,-14],aL:[-9,-14],lR:[54,82+dip],lL:[-18,28],col:'#64b4ff'});
  rep_flash(t,fY-196,'rgba(100,180,255,'); wm('BULGARIAN SPLIT SQUAT');
},
glute_br(t){
  const fY=268,p=Math.sin(t*Math.PI*2)*.5+.5,cx=290,lf=p*42;
  fl(fY,'rgba(100,180,255,.15)');
  CTX.strokeStyle='#64b4ff';CTX.lineWidth=3.5;CTX.lineCap='round';
  CTX.beginPath();CTX.moveTo(cx-84,fY-18);CTX.lineTo(cx+24,fY-18);CTX.stroke();
  CTX.beginPath();CTX.arc(cx+38,fY-18,13,0,Math.PI*2);CTX.stroke();
  CTX.beginPath();CTX.moveTo(cx-54,fY-18);CTX.lineTo(cx-54,fY-18-lf);CTX.lineTo(cx+24,fY-18-lf);CTX.stroke();
  CTX.beginPath();CTX.moveTo(cx+24,fY-18-lf);CTX.lineTo(cx+44,fY);CTX.stroke();
  CTX.beginPath();CTX.moveTo(cx-76,fY-18);CTX.lineTo(cx-84,fY);CTX.stroke();
  CTX.fillStyle='rgba(100,180,255,.1)';CTX.beginPath();CTX.ellipse(cx-16,fY-18-lf,36,12,0,0,Math.PI*2);CTX.fill();
  glo(cx-18,fY-18-lf,40,'rgba(100,180,255,.1)');
  rep_flash(t,fY-96,'rgba(100,180,255,'); wm('GLUTE BRIDGE');
},
slg_bridge(t){ ANIMS.glute_br(t); wm('SINGLE-LEG GLUTE BRIDGE'); },
wall_sit(t){
  const fY=268,pulse=Math.sin(t*Math.PI*6)*2,cx=284;
  fl(fY,'rgba(100,180,255,.15)');
  CTX.fillStyle='rgba(168,85,247,.1)';CTX.strokeStyle='rgba(168,85,247,.4)';CTX.lineWidth=2;
  CTX.beginPath();CTX.rect(CW-28,0,28,CH);CTX.fill();CTX.stroke();
  CTX.strokeStyle='#64b4ff';CTX.lineWidth=3.5;CTX.lineCap='round';
  CTX.beginPath();CTX.moveTo(cx+18,fY-100+pulse);CTX.lineTo(CW-28,fY-100+pulse);CTX.stroke();
  CTX.beginPath();CTX.arc(cx+3,fY-114+pulse,13,0,Math.PI*2);CTX.stroke();
  CTX.beginPath();CTX.moveTo(cx+18,fY-86+pulse);CTX.lineTo(cx-4,fY-86+pulse);CTX.stroke();
  for(const [px,py] of[[cx-4,fY-86+pulse],[cx+18,fY-86+pulse]]){
    CTX.beginPath();CTX.moveTo(px,py);CTX.lineTo(px+(px<cx?-22:22),fY);CTX.stroke();
  }
  CTX.fillStyle='rgba(100,180,255,.75)';CTX.font="bold 28px 'Bebas Neue',sans-serif";CTX.textAlign='center';
  CTX.fillText(Math.floor(_t*62)+'s',cx,fY-148); wm('WALL SIT');
},
calf_step(t){ ANIMS.calf(t); wm('CALF RAISE (STEP)'); },
hollow(t){
  const fY=268,p=Math.sin(t*Math.PI*1)*.5+.5,cx=290,lf=p*22;
  fl(fY,'rgba(100,180,255,.15)');
  CTX.strokeStyle='#64b4ff';CTX.lineWidth=3.5;CTX.lineCap='round';
  CTX.beginPath();CTX.moveTo(cx-84,fY-14-lf*.3);CTX.lineTo(cx+62,fY-14-lf*.3);CTX.stroke();
  CTX.beginPath();CTX.arc(cx+76,fY-14-lf*.3,13,0,Math.PI*2);CTX.stroke();
  CTX.beginPath();CTX.moveTo(cx-84,fY-14-lf*.3);CTX.lineTo(cx-124,fY-14-lf);CTX.stroke();
  CTX.beginPath();CTX.moveTo(cx+62,fY-14-lf*.3);CTX.lineTo(cx+94,fY-14-lf*.5);CTX.stroke();
  CTX.fillStyle='rgba(100,180,255,.08)';CTX.beginPath();CTX.ellipse(cx-14,fY-14-lf*.15,84,10,-.05,0,Math.PI*2);CTX.fill();
  glo(cx,fY-18,70,'rgba(100,180,255,.08)'); wm('HOLLOW BODY HOLD');
},
bicycle(t){
  const fY=268,p=Math.sin(t*Math.PI*2),cx=290;
  fl(fY,'rgba(100,180,255,.15)');
  CTX.strokeStyle='#64b4ff';CTX.lineWidth=3.5;CTX.lineCap='round';
  CTX.beginPath();CTX.moveTo(cx-64,fY-18);CTX.lineTo(cx+44,fY-18);CTX.stroke();
  CTX.beginPath();CTX.arc(cx+58,fY-18,13,0,Math.PI*2);CTX.stroke();
  CTX.beginPath();CTX.moveTo(cx-28,fY-18);CTX.lineTo(cx-28+p*40,fY-18-40);CTX.stroke();
  CTX.beginPath();CTX.moveTo(cx+12,fY-18);CTX.lineTo(cx+12-p*40,fY-18-40);CTX.stroke();
  CTX.beginPath();CTX.moveTo(cx-28,fY-18);CTX.lineTo(cx-9+p*30,fY);CTX.stroke();
  CTX.beginPath();CTX.moveTo(cx+12,fY-18);CTX.lineTo(cx+22-p*30,fY);CTX.stroke();
  rep_flash(t,fY-100,'rgba(100,180,255,'); wm('BICYCLE CRUNCH');
},
leg_raise_h(t){
  const fY=268,p=Math.sin(t*Math.PI*2)*.5+.5,cx=290,lf=p*84;
  fl(fY,'rgba(100,180,255,.15)');
  CTX.strokeStyle='#64b4ff';CTX.lineWidth=3.5;CTX.lineCap='round';
  CTX.beginPath();CTX.moveTo(cx-84,fY-18);CTX.lineTo(cx+64,fY-18);CTX.stroke();
  CTX.beginPath();CTX.arc(cx+78,fY-18,13,0,Math.PI*2);CTX.stroke();
  CTX.beginPath();CTX.moveTo(cx-32,fY-18);CTX.lineTo(cx-44,fY-lf);CTX.stroke();
  CTX.beginPath();CTX.moveTo(cx,fY-18);CTX.lineTo(cx-12,fY-lf);CTX.stroke();
  CTX.fillStyle='rgba(100,180,255,.1)';CTX.beginPath();CTX.ellipse(cx-22,fY-lf*.5,14,28,-.15,0,Math.PI*2);CTX.fill();
  rep_flash(t,fY-120,'rgba(100,180,255,'); wm('LEG RAISE');
},
mt_climb(t){
  const fY=260,p=Math.sin(t*Math.PI*4),cx=290,cy=fY-32;
  fl(fY,'rgba(100,180,255,.15)');
  CTX.strokeStyle='#64b4ff';CTX.lineWidth=3.5;CTX.lineCap='round';
  CTX.beginPath();CTX.moveTo(cx-114,cy);CTX.lineTo(cx+90,cy);CTX.stroke();
  CTX.beginPath();CTX.arc(cx+104,cy,13,0,Math.PI*2);CTX.stroke();
  for(const ox of[-32,32]){CTX.beginPath();CTX.moveTo(cx+ox,cy);CTX.lineTo(cx+ox,fY);CTX.stroke();}
  CTX.beginPath();CTX.moveTo(cx-114,cy);CTX.lineTo(cx-114,fY);CTX.stroke();
  CTX.beginPath();CTX.moveTo(cx-80,cy);CTX.lineTo(cx-80+p*30,fY-p*40-20);CTX.stroke();
  rep_flash(t,cy-40,'rgba(100,180,255,'); wm('MOUNTAIN CLIMBER');
},
side_plank(t){
  const fY=256,pulse=Math.sin(t*Math.PI*3)*2.5,cx=290,cy=fY-60+pulse;
  fl(fY,'rgba(100,180,255,.15)');
  CTX.strokeStyle='#64b4ff';CTX.lineWidth=3.5;CTX.lineCap='round';
  CTX.beginPath();CTX.moveTo(cx-126,fY);CTX.lineTo(cx+84,cy);CTX.stroke();
  CTX.beginPath();CTX.arc(cx+98,cy-9,13,0,Math.PI*2);CTX.stroke();
  CTX.beginPath();CTX.moveTo(cx-18,fY-28+pulse*.5);CTX.lineTo(cx-18,fY);CTX.stroke();
  CTX.strokeStyle='rgba(100,180,255,.75)';
  CTX.beginPath();CTX.moveTo(cx+24,cy-7+pulse*.3);CTX.lineTo(cx+24,cy-50+pulse*.3);CTX.stroke();
  CTX.fillStyle='rgba(100,180,255,.08)';CTX.beginPath();CTX.ellipse(cx-20,cy+28,80,10,-.17,0,Math.PI*2);CTX.fill();
  CTX.fillStyle='rgba(100,180,255,.75)';CTX.font="bold 26px 'Bebas Neue',sans-serif";CTX.textAlign='center';
  CTX.fillText(Math.floor(_t*32)+'s',cx,cy-62); wm('SIDE PLANK');
},
v_up(t){
  const fY=268,p=Math.sin(t*Math.PI*2)*.5+.5,cx=290,comp=p*52;
  fl(fY,'rgba(100,180,255,.15)');
  CTX.strokeStyle='#64b4ff';CTX.lineWidth=3.5;CTX.lineCap='round';
  CTX.beginPath();CTX.moveTo(cx-84,fY-18);CTX.quadraticCurveTo(cx,fY-18-comp,cx+84,fY-18);CTX.stroke();
  CTX.beginPath();CTX.arc(cx+98,fY-18,13,0,Math.PI*2);CTX.stroke();
  CTX.beginPath();CTX.moveTo(cx-84,fY-18);CTX.lineTo(cx-104,fY-18-comp);CTX.stroke();
  CTX.fillStyle='rgba(100,180,255,.1)';CTX.beginPath();CTX.ellipse(cx-12,fY-18-comp*.4,20,12,0,0,Math.PI*2);CTX.fill();
  rep_flash(t,fY-98,'rgba(100,180,255,'); wm('V-UP');
},
burpee(t){
  const fY=260,ph=t%1,cx=290;
  fl(fY,'rgba(100,180,255,.15)');
  if(ph<.32){ const p2=ph/.32; human(cx,fY-82,1.1,{aR:[24,-9-p2*40],aL:[-24,-9-p2*40],lR:[14,80],lL:[-14,80],col:'#64b4ff'}); }
  else if(ph<.62){
    const cy2=fY-32; CTX.strokeStyle='#64b4ff';CTX.lineWidth=3.5;CTX.lineCap='round';
    CTX.beginPath();CTX.moveTo(cx-114,cy2);CTX.lineTo(cx+90,cy2);CTX.stroke();
    CTX.beginPath();CTX.arc(cx+104,cy2,13,0,Math.PI*2);CTX.stroke();
    for(const ox of[-32,32]){CTX.beginPath();CTX.moveTo(cx+ox,cy2);CTX.lineTo(cx+ox,fY);CTX.stroke();}
    CTX.beginPath();CTX.moveTo(cx-114,cy2);CTX.lineTo(cx-114,fY);CTX.stroke();
  } else {
    const airH=(ph-.62)/.38*84;
    human(cx,fY-82-airH,1.1,{aR:[28,-46],aL:[-28,-46],lR:[9,80],lL:[-9,80],col:'#64b4ff'});
    glo(cx,fY-8,78,'rgba(100,180,255,.13)');
  }
  rep_flash(t,fY-178,'rgba(100,180,255,'); wm('BURPEE');
},
pu_row(t){
  const fY=260,ph=t%1,cx=290;
  fl(fY,'rgba(100,180,255,.15)');
  if(ph<.5){
    const p2=Math.sin(ph*Math.PI*2)*.5+.5,cy2=fY-32-p2*18;
    CTX.strokeStyle='#64b4ff';CTX.lineWidth=3.5;CTX.lineCap='round';
    CTX.beginPath();CTX.moveTo(cx-114,cy2);CTX.lineTo(cx+90,cy2);CTX.stroke();
    CTX.beginPath();CTX.arc(cx+104,cy2,13,0,Math.PI*2);CTX.stroke();
    for(const ox of[-32,32]){CTX.beginPath();CTX.moveTo(cx+ox,cy2);CTX.lineTo(cx+ox,fY);CTX.stroke();}
    CTX.beginPath();CTX.moveTo(cx-114,cy2);CTX.lineTo(cx-114,fY);CTX.stroke();
  } else {
    const p3=(ph-.5)/.5,cy3=fY-60;
    CTX.strokeStyle='#64b4ff';CTX.lineWidth=3.5;CTX.lineCap='round';
    CTX.beginPath();CTX.moveTo(cx-126,fY);CTX.lineTo(cx+84,cy3);CTX.stroke();
    CTX.beginPath();CTX.arc(cx+98,cy3-9,13,0,Math.PI*2);CTX.stroke();
    CTX.beginPath();CTX.moveTo(cx-18,fY-28);CTX.lineTo(cx-18,fY);CTX.stroke();
    CTX.strokeStyle='rgba(100,180,255,.8)';
    CTX.beginPath();CTX.moveTo(cx+24,cy3-5);CTX.lineTo(cx+24,cy3-50+p3*42);CTX.stroke();
  }
  rep_flash(t,fY-156,'rgba(100,180,255,'); wm('PUSH-UP TO ROW');
},
jump_lunge(t){
  const fY=268,p=Math.sin(t*Math.PI*2)*.5+.5,airH=p*52,cx=268;
  fl(fY,'rgba(100,180,255,.15)');
  human(cx,fY-82-airH,1.1,{aR:[9,-14],aL:[-9,-14],lR:[44+airH*.3,80],lL:[-28-airH*.2,48],col:'#64b4ff'});
  if(airH>8)glo(cx,fY-8,58,'rgba(100,180,255,.12)');
  rep_flash(t,fY-188,'rgba(100,180,255,'); wm('JUMP LUNGE');
},
bear_crawl(t){
  const fY=260,st=Math.sin(t*Math.PI*4),cx=290+t*40-20,cy=fY-70;
  fl(fY,'rgba(100,180,255,.15)');
  CTX.strokeStyle='#64b4ff';CTX.lineWidth=3.5;CTX.lineCap='round';
  CTX.beginPath();CTX.moveTo(cx-64,cy);CTX.lineTo(cx+44,cy);CTX.stroke();
  CTX.beginPath();CTX.arc(cx+58,cy,13,0,Math.PI*2);CTX.stroke();
  for(const [ox,lx] of [[-22,st*9],[22,-st*9],[-64,-st*8]]){
    CTX.beginPath();CTX.moveTo(cx+ox,cy);CTX.lineTo(cx+ox+lx,fY-4);CTX.stroke();
  }
  wm('BEAR CRAWL');
},
pu_tap(t){
  const fY=260,ph=t%1,p=Math.sin(ph*Math.PI*2)*.5+.5,cx=290,cy=fY-32-p*18;
  fl(fY,'rgba(100,180,255,.15)');
  CTX.strokeStyle='#64b4ff';CTX.lineWidth=3.5;CTX.lineCap='round';
  CTX.beginPath();CTX.moveTo(cx-114,cy);CTX.lineTo(cx+90,cy);CTX.stroke();
  CTX.beginPath();CTX.arc(cx+104,cy,13,0,Math.PI*2);CTX.stroke();
  if(ph>.68){ CTX.strokeStyle='rgba(255,100,0,.95)'; CTX.beginPath();CTX.moveTo(cx-32,cy);CTX.lineTo(cx+44,cy-16);CTX.stroke(); }
  else { CTX.beginPath();CTX.moveTo(cx-32,cy);CTX.lineTo(cx-32,fY);CTX.stroke(); }
  CTX.strokeStyle='rgba(100,180,255,.85)';
  CTX.beginPath();CTX.moveTo(cx+32,cy);CTX.lineTo(cx+32,fY);CTX.stroke();
  CTX.beginPath();CTX.moveTo(cx-114,cy);CTX.lineTo(cx-114,fY);CTX.stroke();
  rep_flash(t,cy-40,'rgba(100,180,255,'); wm('PUSH-UP SHOULDER TAP');
},
squat_tuck(t){
  const fY=268,p=Math.sin(t*Math.PI*2)*.5+.5,airH=p*92,cx=290;
  fl(fY,'rgba(100,180,255,.15)');
  if(airH>18){ human(cx,fY-82-airH,1.1,{aR:[28,-28],aL:[-28,-28],lR:[28,38],lL:[-28,38],col:'#64b4ff'}); glo(cx,fY-8,80,'rgba(100,180,255,.15)'); }
  else { human(cx,fY-82,1.1,{aR:[34,-14],aL:[-34,-14],lR:[21,80],lL:[-21,80],col:'#64b4ff'}); }
  rep_flash(t,fY-198,'rgba(100,180,255,'); wm('SQUAT JUMP TUCK');
},
inchworm(t){
  const fY=260,ph=t%1,cx=290;
  fl(fY,'rgba(100,180,255,.15)');
  if(ph<.38){ const p2=ph/.38; human(cx,fY-82-p2*18,1.1,{aR:[28,-9+p2*60],aL:[-28,-9+p2*60],lR:[14,80],lL:[-14,80],lean:p2*18,col:'#64b4ff'}); }
  else if(ph<.62){
    const cy2=fY-32; CTX.strokeStyle='#64b4ff';CTX.lineWidth=3.5;CTX.lineCap='round';
    CTX.beginPath();CTX.moveTo(cx-114,cy2);CTX.lineTo(cx+90,cy2);CTX.stroke();
    CTX.beginPath();CTX.arc(cx+104,cy2,13,0,Math.PI*2);CTX.stroke();
    for(const ox of[-32,32]){CTX.beginPath();CTX.moveTo(cx+ox,cy2);CTX.lineTo(cx+ox,fY);CTX.stroke();}
    CTX.beginPath();CTX.moveTo(cx-114,cy2);CTX.lineTo(cx-114,fY);CTX.stroke();
  } else {
    const p3=(ph-.62)/.38; human(cx,fY-82,1.1,{aR:[28,48-p3*60],aL:[-28,48-p3*60],lR:[14,80],lL:[-14,80],lean:18-p3*18,col:'#64b4ff'});
  }
  wm('INCHWORM');
},
};

// ── MODAL CONTROLS ───────────────────────────────────────────────────
function openAnimModal(key) {
  _key = key; _t = 0; _rep = 0; _lastCyc = 0; _playing = true; _lastTs = null;
  const meta = ANIM_META[key] || { name: key, muscle: '', maxRep: 10 };
  document.getElementById('animModalBg').classList.add('open');
  document.getElementById('animExName').textContent = meta.name;
  document.getElementById('animMuscle').textContent = meta.muscle;
  _maxRep = meta.maxRep || 10;
  document.getElementById('animPlayBtn').textContent = '⏸ PAUSE';
  document.getElementById('animPlayBtn').className = 'ctrl-btn pr';
  updateRepBar();
  if (_raf) cancelAnimationFrame(_raf);
  _raf = requestAnimationFrame(animLoop);
}
function closeAnimModal() {
  document.getElementById('animModalBg').classList.remove('open');
  if (_raf) { cancelAnimationFrame(_raf); _raf = null; }
}
function togglePlay() {
  _playing = !_playing;
  const b = document.getElementById('animPlayBtn');
  b.textContent = _playing ? '⏸ PAUSE' : '▶ PLAY';
  b.className = 'ctrl-btn' + (_playing ? ' pr' : '');
}
function setSpeed(v) { _speed = parseFloat(v); }
function updateRepBar() {
  const pct = (_rep / _maxRep) * 100;
  document.getElementById('repBarFill').style.width = pct + '%';
  document.getElementById('repLbl').textContent = 'REP ' + _rep + ' / ' + _maxRep;
}
function animLoop(ts) {
  if (!_lastTs) _lastTs = ts;
  const dt = Math.min(ts - _lastTs, 50); _lastTs = ts;
  if (_playing) _t = (_t + dt * 0.0009 * _speed) % 1;
  const cyc = _t % 1;
  if (cyc < _lastCyc) { _rep = Math.min(_rep + 1, _maxRep); updateRepBar(); }
  _lastCyc = cyc;
  clr(); grid();
  const fn = ANIMS[_key] || ANIMS.bench;
  fn(_t);
  _raf = requestAnimationFrame(animLoop);
}

// ── INIT ─────────────────────────────────────────────────────────────
function initCanvas() {
  CV = document.getElementById('animCanvas');
  CV.width = CW; CV.height = CH;
  CTX = CV.getContext('2d');
}
document.addEventListener('DOMContentLoaded', initCanvas);
