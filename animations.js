// ═══════════════════════════════════════════════════
//  GYMFEVER - 3D HUMAN + REAL EQUIPMENT ANIMATIONS
//  Full mobile optimized canvas engine
// ═══════════════════════════════════════════════════

let CV, CTX, CW, CH;
let _key='bench', _t=0, _playing=true, _speed=1;
let _rep=0, _maxRep=10, _lastCyc=0, _raf=null, _lastTs=null;

function initCanvas(){
  CV = document.getElementById('animCanvas');
  CTX = CV.getContext('2d');
  resizeCanvas();
  window.addEventListener('resize', resizeCanvas);
}

function resizeCanvas(){
  const wrap = document.querySelector('.modal-canvas-area');
  if(!wrap || !CV) return;
  CW = wrap.clientWidth;
  CH = Math.min(wrap.clientHeight, Math.floor(CW * 0.55));
  CV.width = CW;
  CV.height = CH;
  CV.style.width = CW + 'px';
  CV.style.height = CH + 'px';
}

const ANIM_META = {
  bench:         {name:'Flat Bench Press',        muscle:'Pectoralis Major',             maxRep:8 },
  incline_press: {name:'Incline Dumbbell Press',   muscle:'Upper Chest — Clavicular Head',maxRep:12},
  cable_fly:     {name:'Cable Crossover',           muscle:'Chest — Isolation',            maxRep:15},
  pushdown:      {name:'Tricep Pushdown',           muscle:'Triceps — Lateral Head',       maxRep:12},
  oh_ext:        {name:'OH DB Extension',           muscle:'Triceps — Long Head',          maxRep:12},
  dips:          {name:'Tricep Dips',               muscle:'Triceps — All 3 Heads',        maxRep:10},
  deadlift:      {name:'Conventional Deadlift',     muscle:'Entire Posterior Chain',       maxRep:5 },
  pullup:        {name:'Pull-Up',                   muscle:'Lats — Width Builder',         maxRep:10},
  bent_row:      {name:'Barbell Bent-Over Row',     muscle:'Mid-Back · Rhomboids',         maxRep:8 },
  cable_row:     {name:'Seated Cable Row',          muscle:'Mid-Back — Thickness',         maxRep:12},
  bicep_curl:    {name:'Barbell Bicep Curl',        muscle:'Biceps — Long + Short Head',   maxRep:10},
  hammer_curl:   {name:'Hammer Curl',               muscle:'Brachialis · Brachioradialis', maxRep:12},
  squat:         {name:'Barbell Back Squat',        muscle:'Quads · Glutes · Hamstrings',  maxRep:8 },
  leg_press:     {name:'Leg Press',                 muscle:'Quads — Machine',              maxRep:12},
  rdl:           {name:'Romanian Deadlift',         muscle:'Hamstrings · Glutes',          maxRep:10},
  lunge:         {name:'Walking Lunges',            muscle:'Quads · Glutes · Balance',     maxRep:12},
  leg_ext:       {name:'Leg Extension',             muscle:'Quads — Isolation',            maxRep:15},
  calf:          {name:'Standing Calf Raise',       muscle:'Calves — Gastrocnemius',       maxRep:20},
  shoulder_press:{name:'Seated DB OH Press',        muscle:'Anterior + Medial Delt',       maxRep:10},
  lateral_raise: {name:'Dumbbell Lateral Raise',    muscle:'Medial Delt — Width Builder',  maxRep:15},
  rear_fly:      {name:'Rear Delt Fly',             muscle:'Posterior Delt — Posture',     maxRep:15},
  shrug:         {name:'Barbell Shrug',             muscle:'Traps — Upper',                maxRep:15},
  plank:         {name:'Plank',                     muscle:'Core — Anterior Foundation',   maxRep:1 },
  crunch:        {name:'Weighted Crunch',           muscle:'Rectus Abdominis',             maxRep:20},
  leg_raise:     {name:'Hanging Leg Raise',         muscle:'Lower Abs · Hip Flexors',      maxRep:12},
  skull:         {name:'Skull Crusher',             muscle:'Triceps — Long Head',          maxRep:10},
  inc_curl:      {name:'Incline DB Curl',           muscle:'Biceps — Long Head Stretch',   maxRep:12},
  wrist_curl:    {name:'Barbell Wrist Curl',        muscle:'Forearms — Flexors',           maxRep:20},
  rev_curl:      {name:'Reverse Barbell Curl',      muscle:'Forearms — Extensors',         maxRep:15},
  standing_ohp:  {name:'Standing Barbell OHP',      muscle:'Shoulders · Core · Triceps',   maxRep:5 },
  face_pull:     {name:'Face Pulls',                muscle:'Rear Delt · Rotator Cuff',     maxRep:20},
  plyo_push:     {name:'Plyometric Push-Up',        muscle:'Chest · Shoulders · Power',    maxRep:10},
  hip_stretch:   {name:'Hip Flexor Stretch',        muscle:'Hip Flexors — Recovery',       maxRep:1 },
  foam_roll:     {name:'Foam Roll',                 muscle:'Myofascial Release',            maxRep:1 },
  shoulder_str:  {name:'Shoulder Stretch',          muscle:'Posterior Delt — Recovery',    maxRep:1 },
  pushup:        {name:'Standard Push-Up',          muscle:'Chest · Triceps · Ant. Delt',  maxRep:15},
  wide_push:     {name:'Wide Push-Up',              muscle:'Outer Chest — Width',          maxRep:12},
  diamond:       {name:'Diamond Push-Up',           muscle:'Triceps · Inner Chest',        maxRep:10},
  pike:          {name:'Pike Push-Up',              muscle:'Shoulders — Ant. + Medial',    maxRep:10},
  decline:       {name:'Decline Push-Up',           muscle:'Upper Chest — Clavicular',     maxRep:10},
  chair_dip:     {name:'Chair Tricep Dip',          muscle:'Triceps — All 3 Heads',        maxRep:12},
  planche:       {name:'Pseudo Planche Push-Up',    muscle:'Ant. Delt · Chest · Core',     maxRep:8 },
  table_row:     {name:'Table / Door Row',          muscle:'Lats · Mid-Back · Biceps',     maxRep:15},
  towel_curl:    {name:'Towel Bicep Curl',          muscle:'Biceps — Full Range',          maxRep:15},
  superman:      {name:'Superman Hold',             muscle:'Lower Back · Glutes',          maxRep:12},
  pull_apart:    {name:'Rear Delt Pull-Apart',      muscle:'Posterior Delt · Rhomboids',   maxRep:20},
  arch_hold:     {name:'Arch Body Hold',            muscle:'Entire Posterior Chain',       maxRep:1 },
  iso_curl:      {name:'Isometric Bicep Curl',      muscle:'Biceps — Peak Density',        maxRep:1 },
  bw_squat:      {name:'Bodyweight Squat',          muscle:'Quads · Glutes · Hamstrings',  maxRep:20},
  jump_squat:    {name:'Jump Squat',                muscle:'Quads · Glutes — Explosive',   maxRep:12},
  bss:           {name:'Bulgarian Split Squat',     muscle:'Quads · Glutes — Single Leg',  maxRep:10},
  glute_br:      {name:'Glute Bridge',              muscle:'Glutes · Hamstrings',          maxRep:20},
  wall_sit:      {name:'Wall Sit',                  muscle:'Quads — Isometric',            maxRep:1 },
  calf_step:     {name:'Calf Raise (Step)',          muscle:'Calves — Gastrocnemius',       maxRep:25},
  slg_bridge:    {name:'Single-Leg Glute Bridge',   muscle:'Glutes — Unilateral',          maxRep:15},
  hollow:        {name:'Hollow Body Hold',          muscle:'Deep Core — Gymnastics',       maxRep:1 },
  bicycle:       {name:'Bicycle Crunch',            muscle:'Obliques · Rectus Abdominis',  maxRep:20},
  leg_raise_h:   {name:'Leg Raise',                 muscle:'Lower Abs · Hip Flexors',      maxRep:15},
  mt_climb:      {name:'Mountain Climber',          muscle:'Core · Cardio · Hip Flexors',  maxRep:20},
  side_plank:    {name:'Side Plank',                muscle:'Obliques — Lateral Core',      maxRep:1 },
  v_up:          {name:'V-Up',                      muscle:'Full Abs — Advanced',          maxRep:12},
  burpee:        {name:'Burpee',                    muscle:'Full Body — Conditioning',     maxRep:10},
  pu_row:        {name:'Push-Up to Row',            muscle:'Chest · Lats · Core',          maxRep:8 },
  jump_lunge:    {name:'Jump Lunge',                muscle:'Quads · Glutes — Explosive',   maxRep:10},
  bear_crawl:    {name:'Bear Crawl',                muscle:'Shoulders · Core · Hips',      maxRep:1 },
  pu_tap:        {name:'Push-Up Shoulder Tap',      muscle:'Chest · Core Anti-rotation',   maxRep:10},
  squat_tuck:    {name:'Squat Jump Tuck',           muscle:'Legs · Core — Explosive',      maxRep:8 },
  inchworm:      {name:'Inchworm',                  muscle:'Hamstrings · Shoulders · Core',maxRep:8 },
};

// ── SCALE HELPER (everything relative to canvas size) ──
function sc(n){ return n * (CW / 580); }
function sx(n){ return n * (CW / 580); }   // x scale
function sy(n){ return n * (CH / 320); }   // y scale
function cx(){ return CW / 2; }            // center x

// ── DRAWING PRIMITIVES ──────────────────────────────────────────────
function clr(){ CTX.clearRect(0,0,CW,CH); }

function grid(){
  CTX.strokeStyle='rgba(255,255,255,0.022)'; CTX.lineWidth=1;
  const step = sx(40);
  for(let x=0;x<CW;x+=step){CTX.beginPath();CTX.moveTo(x,0);CTX.lineTo(x,CH);CTX.stroke();}
  for(let y=0;y<CH;y+=step){CTX.beginPath();CTX.moveTo(0,y);CTX.lineTo(CW,y);CTX.stroke();}
}

function fl(yRatio, col){
  const y = CH * yRatio;
  CTX.strokeStyle = col||'rgba(232,255,0,0.18)';
  CTX.lineWidth = sc(1.5);
  CTX.beginPath(); CTX.moveTo(0,y); CTX.lineTo(CW,y); CTX.stroke();
}

function glo(xR,yR,rR,c){
  const x=CW*xR, y=CH*yR, r=sc(rR);
  const g=CTX.createRadialGradient(x,y,0,x,y,r);
  g.addColorStop(0,c); g.addColorStop(1,'transparent');
  CTX.fillStyle=g; CTX.beginPath(); CTX.arc(x,y,r,0,Math.PI*2); CTX.fill();
}

function wm(t, col){
  CTX.fillStyle = col||'rgba(255,255,255,0.035)';
  const fs = sc(46);
  CTX.font = `bold ${fs}px 'Bebas Neue',sans-serif`;
  CTX.textAlign='center';
  CTX.fillText(t.toUpperCase(), CW/2, CH-sy(10));
}

function repFlash(t, yR, col){
  const c=t%1, a=Math.max(0,1-c*5);
  if(a>0 && c<0.18){
    const y = CH*yR;
    CTX.fillStyle=(col||'rgba(232,255,0,')+a+')';
    const fs = sc(22);
    CTX.font=`bold ${fs}px 'Bebas Neue',sans-serif`;
    CTX.textAlign='center';
    CTX.fillText('REP '+_rep, CW/2, y);
  }
}

// ── 3D HUMAN BODY (proper proportions, shading) ──────────────────────
// All positions are ratios of CW/CH
function human3d(xR, yR, opts){
  const {
    col='#00ffcc', lean=0,
    // arm angles (degrees from shoulder, 0=down)
    armRot=0,   // right arm rotation
    armLRot=0,  // left arm rotation
    // elbow bend 0-1
    elbowR=0, elbowL=0,
    // leg angles
    legRot=0, legLRot=0,
    // knee bend 0-1
    kneeR=0, kneeL=0,
    // torso angle (degrees)
    torsoAngle=90,
    // scale override
    scale=1,
    alpha=1,
  } = opts;

  CTX.save();
  CTX.globalAlpha = alpha;

  const cx = CW * xR;
  const cy = CH * yR;
  const s = sc(1) * scale;

  // Body dimensions (proportional)
  const headR   = 13*s;
  const neckH   = 8*s;
  const torsoH  = 44*s;
  const upperArmL = 28*s;
  const foreArmL  = 24*s;
  const thighL    = 36*s;
  const shinL     = 32*s;
  const shoulderW = 26*s;

  // Convert torso angle to radians
  const ta = (torsoAngle - 90) * Math.PI / 180 + lean * Math.PI/180;

  // Torso start (hip) = cx,cy
  const hipX = cx, hipY = cy;
  const shoulderX = hipX + Math.cos(ta - Math.PI/2) * torsoH;
  const shoulderY = hipY - Math.sin(ta - Math.PI/2) * torsoH;
  const neckX = shoulderX + Math.cos(ta - Math.PI/2) * neckH;
  const neckY = shoulderY - Math.sin(ta - Math.PI/2) * neckH;

  // Gradient for 3D torso
  const tg = CTX.createLinearGradient(shoulderX-shoulderW, shoulderY, shoulderX+shoulderW, shoulderY);
  tg.addColorStop(0, col+'44');
  tg.addColorStop(0.5, col+'cc');
  tg.addColorStop(1, col+'44');

  // SHADOW
  CTX.fillStyle = 'rgba(0,0,0,0.15)';
  CTX.beginPath();
  CTX.ellipse(hipX, hipY + thighL + shinL - 4*s, 18*s, 5*s, 0, 0, Math.PI*2);
  CTX.fill();

  // LEGS with 3D shading
  function drawLeg(side, legAngleDeg, kneeBend){
    const dir = side === 'R' ? 1 : -1;
    const legAngle = legAngleDeg * Math.PI/180;
    const hipXOffset = dir * 10 * s;

    // thigh
    const thighEndX = hipX + hipXOffset + Math.sin(legAngle) * thighL;
    const thighEndY = hipY + Math.cos(legAngle) * thighL;

    // shin with knee bend
    const kneeAngle = legAngle + kneeBend * Math.PI * 0.6;
    const shinEndX = thighEndX + Math.sin(kneeAngle) * shinL;
    const shinEndY = thighEndY + Math.cos(kneeAngle) * shinL;

    // thigh gradient
    const lg1 = CTX.createLinearGradient(hipX+hipXOffset, hipY, thighEndX, thighEndY);
    lg1.addColorStop(0, col+'99');
    lg1.addColorStop(0.5, col+'dd');
    lg1.addColorStop(1, col+'88');
    CTX.strokeStyle = lg1;
    CTX.lineWidth = 11*s;
    CTX.lineCap = 'round';
    CTX.beginPath();
    CTX.moveTo(hipX+hipXOffset, hipY);
    CTX.lineTo(thighEndX, thighEndY);
    CTX.stroke();

    // shin gradient
    const lg2 = CTX.createLinearGradient(thighEndX, thighEndY, shinEndX, shinEndY);
    lg2.addColorStop(0, col+'88');
    lg2.addColorStop(0.5, col+'cc');
    lg2.addColorStop(1, col+'66');
    CTX.strokeStyle = lg2;
    CTX.lineWidth = 9*s;
    CTX.beginPath();
    CTX.moveTo(thighEndX, thighEndY);
    CTX.lineTo(shinEndX, shinEndY);
    CTX.stroke();

    // knee joint
    CTX.fillStyle = col+'aa';
    CTX.beginPath();
    CTX.arc(thighEndX, thighEndY, 5*s, 0, Math.PI*2);
    CTX.fill();

    // foot
    CTX.strokeStyle = col+'99';
    CTX.lineWidth = 7*s;
    CTX.beginPath();
    CTX.moveTo(shinEndX, shinEndY);
    CTX.lineTo(shinEndX + dir*8*s, shinEndY);
    CTX.stroke();

    return {kneeX: thighEndX, kneeY: thighEndY, footX: shinEndX, footY: shinEndY};
  }

  drawLeg('R', legRot, kneeR);
  drawLeg('L', legLRot, kneeL);

  // TORSO with 3D depth
  CTX.strokeStyle = tg;
  CTX.lineWidth = 18*s;
  CTX.lineCap = 'round';
  CTX.beginPath();
  CTX.moveTo(hipX, hipY);
  CTX.lineTo(shoulderX, shoulderY);
  CTX.stroke();

  // Hip width indicator
  CTX.strokeStyle = col+'66';
  CTX.lineWidth = 6*s;
  CTX.beginPath();
  CTX.moveTo(hipX - 12*s, hipY);
  CTX.lineTo(hipX + 12*s, hipY);
  CTX.stroke();

  // SHOULDERS line with 3D effect
  const perpX = -Math.sin(ta - Math.PI/2);
  const perpY = -Math.cos(ta - Math.PI/2);
  const sLX = shoulderX - perpX * shoulderW;
  const sLY = shoulderY - perpY * shoulderW;
  const sRX = shoulderX + perpX * shoulderW;
  const sRY = shoulderY + perpY * shoulderW;

  const sg = CTX.createLinearGradient(sLX, sLY, sRX, sRY);
  sg.addColorStop(0, col+'66'); sg.addColorStop(0.5, col+'ee'); sg.addColorStop(1, col+'66');
  CTX.strokeStyle = sg; CTX.lineWidth = 14*s;
  CTX.beginPath(); CTX.moveTo(sLX, sLY); CTX.lineTo(sRX, sRY); CTX.stroke();

  // ARMS with proper joints
  function drawArm(side, angleRad, elbowBend, color){
    const sx2 = side === 'R' ? sRX : sLX;
    const sy2 = side === 'R' ? sRY : sLY;
    const dir2 = side === 'R' ? 1 : -1;

    const uaEndX = sx2 + Math.cos(angleRad) * upperArmL;
    const uaEndY = sy2 + Math.sin(angleRad) * upperArmL;

    const elbowAngle = angleRad + elbowBend * Math.PI * 0.7;
    const faEndX = uaEndX + Math.cos(elbowAngle) * foreArmL;
    const faEndY = uaEndY + Math.sin(elbowAngle) * foreArmL;

    // upper arm
    const ag = CTX.createLinearGradient(sx2, sy2, uaEndX, uaEndY);
    ag.addColorStop(0, color+'cc'); ag.addColorStop(1, color+'88');
    CTX.strokeStyle = ag; CTX.lineWidth = 9*s; CTX.lineCap = 'round';
    CTX.beginPath(); CTX.moveTo(sx2, sy2); CTX.lineTo(uaEndX, uaEndY); CTX.stroke();

    // elbow joint
    CTX.fillStyle = color+'99';
    CTX.beginPath(); CTX.arc(uaEndX, uaEndY, 4*s, 0, Math.PI*2); CTX.fill();

    // forearm
    const fg = CTX.createLinearGradient(uaEndX, uaEndY, faEndX, faEndY);
    fg.addColorStop(0, color+'88'); fg.addColorStop(1, color+'bb');
    CTX.strokeStyle = fg; CTX.lineWidth = 7*s;
    CTX.beginPath(); CTX.moveTo(uaEndX, uaEndY); CTX.lineTo(faEndX, faEndY); CTX.stroke();

    // hand
    CTX.fillStyle = color+'bb';
    CTX.beginPath(); CTX.arc(faEndX, faEndY, 4*s, 0, Math.PI*2); CTX.fill();

    return {elbX: uaEndX, elbY: uaEndY, handX: faEndX, handY: faEndY};
  }

  const armAngleBase = ta - Math.PI/2;
  const rArm = drawArm('R', armAngleBase + armRot*Math.PI/180, elbowR, col);
  const lArm = drawArm('L', armAngleBase + armLRot*Math.PI/180, elbowL, col);

  // NECK
  const ng = CTX.createLinearGradient(shoulderX, shoulderY, neckX, neckY);
  ng.addColorStop(0, col+'88'); ng.addColorStop(1, col+'bb');
  CTX.strokeStyle = ng; CTX.lineWidth = 9*s;
  CTX.beginPath(); CTX.moveTo(shoulderX, shoulderY); CTX.lineTo(neckX, neckY); CTX.stroke();

  // HEAD with 3D shading
  const headGrad = CTX.createRadialGradient(neckX-headR*0.3, neckY-headR*0.3, headR*0.1, neckX, neckY, headR);
  headGrad.addColorStop(0, col+'ff');
  headGrad.addColorStop(0.5, col+'cc');
  headGrad.addColorStop(1, col+'55');
  CTX.fillStyle = '#09090f';
  CTX.beginPath(); CTX.arc(neckX, neckY, headR, 0, Math.PI*2); CTX.fill();
  CTX.strokeStyle = headGrad; CTX.lineWidth = 2.5*s;
  CTX.beginPath(); CTX.arc(neckX, neckY, headR, 0, Math.PI*2); CTX.stroke();

  // Eye
  CTX.fillStyle = col+'99';
  CTX.beginPath(); CTX.arc(neckX + 4*s, neckY - 2*s, 2.5*s, 0, Math.PI*2); CTX.fill();

  CTX.restore();
  return {shoulderX, shoulderY, sLX, sLY, sRX, sRY, neckX, neckY,
          rHandX: 0, rHandY: 0, lHandX: 0, lHandY: 0};
}

// ── REAL EQUIPMENT ──────────────────────────────────────────────────
function barbell(xR, yR, widthR, opts){
  const {col='#ffe600', lifted=false} = opts||{};
  const x = CW*xR, y = CH*yR, w = CW*widthR;
  const pw = sc(14), ph = sc(36), bh = sc(5);

  // bar shadow
  CTX.fillStyle = 'rgba(0,0,0,0.3)';
  CTX.beginPath(); CTX.ellipse(x, y+sc(4), w/2, sc(4), 0, 0, Math.PI*2); CTX.fill();

  // bar shaft
  const barGrad = CTX.createLinearGradient(x-w/2, y, x+w/2, y);
  barGrad.addColorStop(0, '#888800');
  barGrad.addColorStop(0.3, col);
  barGrad.addColorStop(0.5, '#fff8aa');
  barGrad.addColorStop(0.7, col);
  barGrad.addColorStop(1, '#888800');
  CTX.fillStyle = barGrad;
  CTX.beginPath(); CTX.roundRect(x-w/2, y-bh/2, w, bh, sc(2)); CTX.fill();

  // knurling marks
  CTX.strokeStyle = 'rgba(0,0,0,0.4)'; CTX.lineWidth = sc(1);
  for(let i=-3; i<=3; i++){
    const kx = x + i * sc(18);
    CTX.beginPath(); CTX.moveTo(kx, y-bh/2); CTX.lineTo(kx, y+bh/2); CTX.stroke();
  }

  // LEFT PLATES
  function plate(px, py, big){
    const pg = CTX.createLinearGradient(px-pw/2, py, px+pw/2, py);
    pg.addColorStop(0, '#333');
    pg.addColorStop(0.3, big ? '#888' : '#666');
    pg.addColorStop(0.5, big ? '#ccc' : '#aaa');
    pg.addColorStop(0.7, big ? '#888' : '#666');
    pg.addColorStop(1, '#333');
    CTX.fillStyle = pg;
    CTX.beginPath(); CTX.roundRect(px-pw/2, py-ph/2, pw, ph, sc(3)); CTX.fill();
    CTX.strokeStyle = 'rgba(255,255,255,0.2)'; CTX.lineWidth = sc(1);
    CTX.stroke();
    // inner ring
    CTX.strokeStyle = 'rgba(0,0,0,0.4)'; CTX.lineWidth = sc(1);
    CTX.beginPath(); CTX.arc(px, py, sc(4), 0, Math.PI*2); CTX.stroke();
  }

  plate(x - w/2 - pw*0.6, y, true);
  plate(x - w/2 - pw*1.4, y, false);
  plate(x + w/2 + pw*0.6, y, true);
  plate(x + w/2 + pw*1.4, y, false);
}

function dumbbell(xR, yR, opts){
  const {col='#ffe600', angle=0} = opts||{};
  const x = CW*xR, y = CH*yR;
  const hw = sc(20), hr = sc(10), sr = sc(5);

  CTX.save();
  CTX.translate(x, y); CTX.rotate(angle);

  const dbg = CTX.createLinearGradient(-hw, 0, hw, 0);
  dbg.addColorStop(0, '#555'); dbg.addColorStop(0.4, col); dbg.addColorStop(0.5, '#fff8aa');
  dbg.addColorStop(0.6, col); dbg.addColorStop(1, '#555');
  CTX.fillStyle = dbg;
  CTX.beginPath(); CTX.roundRect(-hw, -sr/2, hw*2, sr, sc(2)); CTX.fill();

  // plates
  for(const side of [-1, 1]){
    const pg = CTX.createRadialGradient(side*hw*0.6, 0, 0, side*hw*0.6, 0, hr);
    pg.addColorStop(0, '#aaa'); pg.addColorStop(0.5, '#666'); pg.addColorStop(1, '#333');
    CTX.fillStyle = pg;
    CTX.beginPath(); CTX.ellipse(side*hw*0.7, 0, hr*0.6, hr, 0, 0, Math.PI*2); CTX.fill();
    CTX.strokeStyle = 'rgba(255,255,255,0.15)'; CTX.lineWidth = sc(1); CTX.stroke();
  }
  CTX.restore();
}

function bench3d(xR, yR, opts){
  const {angle=0} = opts||{};
  const x = CW*xR, y = CH*yR;
  const bw = sc(160), bh = sc(16), bd = sc(10);

  CTX.save(); CTX.translate(x, y); CTX.rotate(angle * Math.PI/180);

  // 3D bench top surface
  const padGrad = CTX.createLinearGradient(-bw/2, -bh, bw/2, 0);
  padGrad.addColorStop(0, '#1a1a3e');
  padGrad.addColorStop(0.5, '#2a2a5e');
  padGrad.addColorStop(1, '#1a1a3e');
  CTX.fillStyle = padGrad;
  CTX.beginPath(); CTX.roundRect(-bw/2, -bh, bw, bh, sc(4)); CTX.fill();

  // top highlight
  CTX.fillStyle = 'rgba(168,85,247,0.3)';
  CTX.beginPath(); CTX.roundRect(-bw/2, -bh, bw, sc(3), [sc(4),sc(4),0,0]); CTX.fill();

  CTX.strokeStyle = 'rgba(168,85,247,0.6)'; CTX.lineWidth = sc(2);
  CTX.beginPath(); CTX.roundRect(-bw/2, -bh, bw, bh, sc(4)); CTX.stroke();

  // legs (perspective)
  CTX.strokeStyle = 'rgba(168,85,247,0.5)'; CTX.lineWidth = sc(4); CTX.lineCap = 'round';
  for(const ox of [-bw/2+sc(20), bw/2-sc(20)]){
    CTX.beginPath(); CTX.moveTo(ox, 0); CTX.lineTo(ox, sc(42)); CTX.stroke();
    // foot
    CTX.beginPath(); CTX.moveTo(ox-sc(8), sc(42)); CTX.lineTo(ox+sc(8), sc(42)); CTX.stroke();
  }

  CTX.restore();
}

function cableMachine(side){
  // side = 'left' or 'right'
  const x = side === 'left' ? 0 : CW;
  const dir = side === 'left' ? 1 : -1;
  const w = sc(30);

  // frame
  const mg = CTX.createLinearGradient(x, 0, x+dir*w, 0);
  mg.addColorStop(0, '#0a0a1a'); mg.addColorStop(1, '#1a1a3a');
  CTX.fillStyle = mg;
  CTX.beginPath(); CTX.rect(side==='left'?0:CW-w, 0, w, CH); CTX.fill();
  CTX.strokeStyle = 'rgba(168,85,247,0.4)'; CTX.lineWidth = sc(1);
  CTX.stroke();

  // cable spool
  const spoolX = side==='left' ? w*0.5 : CW-w*0.5;
  const spoolY = CH * 0.3;
  CTX.fillStyle = '#1a1a3a'; CTX.strokeStyle = 'rgba(168,85,247,0.6)'; CTX.lineWidth = sc(1.5);
  CTX.beginPath(); CTX.roundRect(spoolX-sc(10), spoolY-sc(16), sc(20), sc(32), sc(3)); CTX.fill(); CTX.stroke();

  // vertical rail
  CTX.strokeStyle = 'rgba(168,85,247,0.3)'; CTX.lineWidth = sc(2);
  CTX.beginPath(); CTX.moveTo(spoolX, spoolY-sc(16)); CTX.lineTo(spoolX, spoolY+sc(16)); CTX.stroke();
}

function pullUpBar(){
  const y = CH * 0.12;

  // mounting brackets
  CTX.fillStyle = '#1a1a3a'; CTX.strokeStyle = 'rgba(168,85,247,0.5)'; CTX.lineWidth = sc(2);
  for(const xR of [0.3, 0.7]){
    const bx = CW*xR;
    CTX.beginPath(); CTX.roundRect(bx-sc(8), 0, sc(16), y, sc(3)); CTX.fill(); CTX.stroke();
  }

  // bar with 3D effect
  const barGrad = CTX.createLinearGradient(CW*0.2, y, CW*0.8, y);
  barGrad.addColorStop(0, '#333'); barGrad.addColorStop(0.3, '#aaa');
  barGrad.addColorStop(0.5, '#fff'); barGrad.addColorStop(0.7, '#aaa'); barGrad.addColorStop(1, '#333');
  CTX.fillStyle = barGrad;
  CTX.beginPath(); CTX.roundRect(CW*0.2, y-sc(6), CW*0.6, sc(12), sc(5)); CTX.fill();

  // knurling
  CTX.strokeStyle = 'rgba(0,0,0,0.3)'; CTX.lineWidth = sc(1);
  for(let i=0; i<8; i++){
    const kx = CW*(0.28 + i*0.06);
    CTX.beginPath(); CTX.moveTo(kx, y-sc(5)); CTX.lineTo(kx, y+sc(5)); CTX.stroke();
  }
}

function parallelBars(){
  const by = CH * 0.88;
  for(const xR of [0.34, 0.66]){
    const bx = CW*xR;
    // vertical pole
    const pg = CTX.createLinearGradient(bx-sc(5), 0, bx+sc(5), 0);
    pg.addColorStop(0,'#222'); pg.addColorStop(0.5,'#888'); pg.addColorStop(1,'#222');
    CTX.fillStyle = pg;
    CTX.beginPath(); CTX.roundRect(bx-sc(5), CH*0.38, sc(10), CH*0.55, sc(3)); CTX.fill();

    // grips
    const gg = CTX.createLinearGradient(bx-sc(5), 0, bx+sc(5), 0);
    gg.addColorStop(0,'#333'); gg.addColorStop(0.5,'#aaa'); gg.addColorStop(1,'#333');
    CTX.fillStyle = gg;
    CTX.beginPath(); CTX.roundRect(bx-sc(5), CH*0.38, sc(10), sc(60), sc(3)); CTX.fill();

    // foot supports
    CTX.strokeStyle = 'rgba(168,85,247,0.5)'; CTX.lineWidth = sc(3); CTX.lineCap = 'round';
    for(const dx of [-sc(20), sc(20)]){
      CTX.beginPath(); CTX.moveTo(bx, by); CTX.lineTo(bx+dx, by+sc(16)); CTX.stroke();
    }
  }
}

function legPressMachine(){
  // seat
  CTX.fillStyle = '#1a1a3a'; CTX.strokeStyle = 'rgba(168,85,247,0.55)'; CTX.lineWidth = sc(2);
  const sx2 = CW*0.62, sy2 = CH*0.55, sw = sc(140), sh = sc(22);
  CTX.beginPath(); CTX.roundRect(sx2, sy2, sw, sh, sc(4)); CTX.fill(); CTX.stroke();

  // back rest
  const bg = CTX.createLinearGradient(sx2+sw-sc(20), 0, sx2+sw, 0);
  bg.addColorStop(0,'#1a1a3a'); bg.addColorStop(1,'#0a0a1a');
  CTX.fillStyle = bg;
  CTX.beginPath(); CTX.roundRect(sx2+sw-sc(20), CH*0.2, sc(20), sy2-CH*0.2+sh, sc(4)); CTX.fill();
  CTX.strokeStyle = 'rgba(168,85,247,0.5)'; CTX.stroke();

  // guide rails
  CTX.strokeStyle = 'rgba(168,85,247,0.35)'; CTX.lineWidth = sc(3);
  for(const dy of [-sc(14), sc(14)]){
    CTX.beginPath();
    CTX.moveTo(sx2, sy2+sh/2+dy);
    CTX.lineTo(sx2-sc(110), sy2+sh/2+dy-sc(70));
    CTX.stroke();
  }

  // sled / platform
  const sledX = sx2 - sc(110), sledY = sy2 - sc(70);
  const platGrad = CTX.createLinearGradient(sledX-sc(50), sledY, sledX+sc(50), sledY);
  platGrad.addColorStop(0,'#333'); platGrad.addColorStop(0.5,'#777'); platGrad.addColorStop(1,'#333');
  CTX.fillStyle = platGrad;
  CTX.beginPath(); CTX.roundRect(sledX-sc(50), sledY-sc(12), sc(100), sc(24), sc(4)); CTX.fill();
  CTX.strokeStyle = 'rgba(168,85,247,0.6)'; CTX.lineWidth = sc(1.5); CTX.stroke();
}

function legExtMachine(){
  // seat
  CTX.fillStyle = '#1a1a3a'; CTX.strokeStyle = 'rgba(168,85,247,0.55)'; CTX.lineWidth = sc(2);
  CTX.beginPath(); CTX.roundRect(CW*0.42, CH*0.55, sc(100), sc(18), sc(4)); CTX.fill(); CTX.stroke();

  // back rest
  CTX.beginPath(); CTX.roundRect(CW*0.42+sc(80), CH*0.2, sc(20), CH*0.35, sc(4)); CTX.fill(); CTX.stroke();

  // frame base
  CTX.strokeStyle = 'rgba(168,85,247,0.3)'; CTX.lineWidth = sc(4); CTX.lineCap = 'round';
  CTX.beginPath(); CTX.moveTo(CW*0.42, CH*0.73); CTX.lineTo(CW*0.42, CH*0.92); CTX.stroke();
  CTX.beginPath(); CTX.moveTo(CW*0.42+sc(100), CH*0.73); CTX.lineTo(CW*0.42+sc(100), CH*0.92); CTX.stroke();

  // pivot arm
  CTX.strokeStyle = 'rgba(168,85,247,0.5)'; CTX.lineWidth = sc(3);
  CTX.beginPath(); CTX.moveTo(CW*0.42+sc(10), CH*0.55); CTX.lineTo(CW*0.1, CH*0.55); CTX.stroke();

  // roller pad
  CTX.fillStyle = '#a855f7aa';
  CTX.beginPath(); CTX.roundRect(CW*0.08, CH*0.5, sc(28), sc(14), sc(5)); CTX.fill();
}

function cableHandle(xR, yR){
  const x=CW*xR, y=CH*yR;
  // handle bar
  CTX.strokeStyle = '#ffe600'; CTX.lineWidth = sc(4); CTX.lineCap = 'round';
  CTX.beginPath(); CTX.moveTo(x-sc(16), y); CTX.lineTo(x+sc(16), y); CTX.stroke();
  // V shape
  CTX.beginPath(); CTX.moveTo(x-sc(16), y); CTX.lineTo(x-sc(22), y+sc(12)); CTX.stroke();
  CTX.beginPath(); CTX.moveTo(x+sc(16), y); CTX.lineTo(x+sc(22), y+sc(12)); CTX.stroke();
}

function benchPress_machine(){
  // uprights
  const upW = sc(10), upH = CH*0.72;
  for(const xR of [0.28, 0.72]){
    const ux = CW*xR;
    const ug = CTX.createLinearGradient(ux-upW/2, 0, ux+upW/2, 0);
    ug.addColorStop(0,'#222'); ug.addColorStop(0.5,'#777'); ug.addColorStop(1,'#222');
    CTX.fillStyle = ug;
    CTX.beginPath(); CTX.roundRect(ux-upW/2, CH*0.12, upW, upH, sc(3)); CTX.fill();
    // J-hooks
    CTX.fillStyle = '#ffe60099';
    CTX.beginPath(); CTX.roundRect(ux-upW/2-sc(6), CH*0.32, sc(6), sc(16), sc(2)); CTX.fill();
    CTX.beginPath(); CTX.roundRect(ux+upW/2, CH*0.32, sc(6), sc(16), sc(2)); CTX.fill();
  }
}

// ── ANIMATION FUNCTIONS ─────────────────────────────────────────────
const ANIMS = {

bench(t){
  const p = Math.sin(t*Math.PI*2)*0.5+0.5;
  const pressY = 0.04 + p*0.12;  // how much bar travels up

  fl(0.86); benchPress_machine();
  bench3d(0.5, 0.74);

  // person lying - torso is horizontal
  human3d(0.5, 0.68, {
    torsoAngle: 0,  // horizontal
    armRot: -140 + p*50,  // arms up pressing
    armLRot: -40 - p*50,
    elbowR: 0.3 - p*0.3,
    elbowL: 0.3 - p*0.3,
    legRot: 16, legLRot: -16,
    kneeR: 0.5, kneeL: 0.5,
    col: '#00ffcc', scale: 0.92,
  });

  // barbell moving up/down
  barbell(0.5, 0.32 + pressY, {col:'#ffe600'});
  glo(0.5, 0.32+pressY, 45, 'rgba(255,230,0,0.18)');

  // chest muscle highlight
  CTX.fillStyle = 'rgba(232,255,0,0.07)';
  CTX.beginPath(); CTX.ellipse(CW*0.5, CH*0.64, sc(54), sc(12), 0, 0, Math.PI*2); CTX.fill();

  repFlash(t, 0.2); wm('BENCH PRESS');
},

deadlift(t){
  const p = Math.sin(t*Math.PI*2)*0.5+0.5;
  fl(0.88);

  // barbell on floor rising
  barbell(0.5, 0.88 - p*0.35, {});
  glo(0.5, 0.88-p*0.18, 50, 'rgba(255,230,0,0.15)');

  // person: starts bent, ends upright
  const torsoA = 45 + p*45;  // 45 deg bent to 90 deg upright
  human3d(0.5, 0.78, {
    torsoAngle: torsoA,
    lean: (1-p)*14,
    armRot: 80 - p*80,  // arms from reaching down to by sides
    armLRot: 100 + p*80,
    elbowR: 0.1, elbowL: 0.1,
    legRot: 15+p*5, legLRot: -15-p*5,
    kneeR: (1-p)*0.3, kneeL: (1-p)*0.3,
    col: '#00ffcc', scale: 0.96,
  });

  // back highlight
  CTX.fillStyle = 'rgba(232,255,0,0.08)';
  CTX.beginPath(); CTX.ellipse(CW*0.5, CH*0.56, sc(20), sc(38), (-torsoA+90)*Math.PI/180, 0, Math.PI*2); CTX.fill();

  repFlash(t, 0.15); wm('DEADLIFT');
},

pullup(t){
  const p = Math.sin(t*Math.PI*2)*0.5+0.5;
  const bodyY = 0.32 + p*0.28;  // body goes down as arms extend

  pullUpBar();

  human3d(0.5, bodyY+0.22, {
    torsoAngle: 90,
    armRot: -160 + p*20,
    armLRot: -20 - p*20,
    elbowR: p*0.4,
    elbowL: p*0.4,
    legRot: 8, legLRot: -8,
    kneeR: 0.2, kneeL: 0.2,
    col: '#00ffcc', scale: 0.9,
  });

  // lat highlights
  glo(0.38, bodyY+0.1, 30, 'rgba(0,255,204,0.09)');
  glo(0.62, bodyY+0.1, 30, 'rgba(0,255,204,0.09)');

  repFlash(t, 0.82); wm('PULL-UP');
},

squat(t){
  const p = Math.sin(t*Math.PI*2)*0.5+0.5;
  fl(0.88);
  benchPress_machine();

  // squat depth
  const sqDepth = p*0.18;

  human3d(0.5, 0.76+sqDepth, {
    torsoAngle: 88 + (1-p)*8,  // slight lean at bottom
    armRot: -60, armLRot: -120,
    elbowR: 0, elbowL: 0,
    legRot: 20+sqDepth*80, legLRot: -20-sqDepth*80,
    kneeR: sqDepth*2.5, kneeL: sqDepth*2.5,
    col: '#00ffcc', scale: 0.96,
  });

  barbell(0.5, 0.5+sqDepth, {});
  glo(0.5, 0.7, 55, 'rgba(255,230,0,0.1)');

  // quad highlight
  CTX.fillStyle = 'rgba(232,255,0,0.08)';
  CTX.beginPath(); CTX.ellipse(CW*0.4, CH*(0.8+sqDepth*0.5), sc(18), sc(26), 0.3, 0, Math.PI*2); CTX.fill();
  CTX.beginPath(); CTX.ellipse(CW*0.6, CH*(0.8+sqDepth*0.5), sc(18), sc(26), -0.3, 0, Math.PI*2); CTX.fill();

  repFlash(t, 0.12); wm('BACK SQUAT');
},

leg_press(t){
  const p = Math.sin(t*Math.PI*2)*0.5+0.5;
  fl(0.92);
  legPressMachine();

  // person reclined in machine
  human3d(0.72, 0.56, {
    torsoAngle: 15,  // nearly horizontal, slight recline
    armRot: 60, armLRot: 120,
    elbowR: 0.5, elbowL: 0.5,
    legRot: -60 + p*35,  // legs extending and compressing
    legLRot: -120 - p*35,
    kneeR: (1-p)*0.6, kneeL: (1-p)*0.6,
    col: '#00ffcc', scale: 0.82,
  });

  // quad highlight
  CTX.fillStyle = 'rgba(232,255,0,0.09)';
  CTX.beginPath(); CTX.ellipse(CW*0.42, CH*0.44, sc(22), sc(16), -0.8, 0, Math.PI*2); CTX.fill();

  repFlash(t, 0.82); wm('LEG PRESS');
},

bent_row(t){
  const p = Math.sin(t*Math.PI*2)*0.5+0.5;
  fl(0.88);

  human3d(0.5, 0.72, {
    torsoAngle: 45,  // bent forward
    armRot: 80 + p*(-80),  // pulling up
    armLRot: 100 - p*(-80),
    elbowR: p*0.5, elbowL: p*0.5,
    legRot: 10, legLRot: -10,
    kneeR: 0.1, kneeL: 0.1,
    col: '#00ffcc', scale: 0.94,
  });

  // barbell being rowed
  barbell(0.5, 0.72 - p*0.15, {});
  glo(0.5, 0.66-p*0.12, 36, 'rgba(255,230,0,0.13)');

  repFlash(t, 0.12); wm('BENT-OVER ROW');
},

cable_row(t){
  const p = Math.sin(t*Math.PI*2)*0.5+0.5;
  fl(0.88);
  cableMachine('left');

  // cable line
  CTX.strokeStyle = 'rgba(255,230,0,0.5)'; CTX.lineWidth = sc(2);
  CTX.beginPath();
  CTX.moveTo(sc(30), CH*0.56);
  CTX.lineTo(CW*0.42 + p*sc(-30), CH*0.56);
  CTX.stroke();

  // handle
  cableHandle(0.42 + p*(-0.05), 0.56);

  // seated platform
  CTX.fillStyle = '#1a1a3a'; CTX.strokeStyle = 'rgba(168,85,247,0.45)'; CTX.lineWidth = sc(2);
  CTX.beginPath(); CTX.roundRect(CW*0.42, CH*0.72, sc(160), sc(14), sc(3)); CTX.fill(); CTX.stroke();

  human3d(0.6, 0.7, {
    torsoAngle: 88 + p*8,
    armRot: 20 + p*(-70),  // pulling back
    armLRot: 160 - p*(-70),
    elbowR: p*0.5, elbowL: p*0.5,
    legRot: 35, legLRot: -35,
    kneeR: 0.8, kneeL: 0.8,
    col: '#00ffcc', scale: 0.88,
  });

  repFlash(t, 0.14); wm('CABLE ROW');
},

bicep_curl(t){
  const p = Math.sin(t*Math.PI*2)*0.5+0.5;
  fl(0.88);

  human3d(0.5, 0.78, {
    torsoAngle: 90,
    armRot: 70 + p*(-110),  // curling up
    armLRot: 110 + p*(110),
    elbowR: p*0.8, elbowL: p*0.8,
    legRot: 8, legLRot: -8,
    kneeR: 0, kneeL: 0,
    col: '#00ffcc', scale: 0.96,
  });

  barbell(0.5, 0.74 - p*0.22, {col:'#ffe600'});
  glo(0.5, 0.72-p*0.2, 34, 'rgba(255,230,0,0.16)');

  // bicep peak highlight
  CTX.fillStyle = 'rgba(232,255,0,0.12)';
  CTX.beginPath(); CTX.ellipse(CW*0.39, CH*(0.62-p*0.1), sc(14), sc(20), 0.3, 0, Math.PI*2); CTX.fill();
  CTX.beginPath(); CTX.ellipse(CW*0.61, CH*(0.62-p*0.1), sc(14), sc(20), -0.3, 0, Math.PI*2); CTX.fill();

  repFlash(t, 0.12); wm('BICEP CURL');
},

hammer_curl(t){
  const p = Math.sin(t*Math.PI*2)*0.5+0.5;
  const p2 = Math.sin((t+0.5)*Math.PI*2)*0.5+0.5;
  fl(0.88);

  human3d(0.5, 0.78, {
    torsoAngle: 90,
    armRot: 70 + p*(-110),
    armLRot: 110 + p2*(110),
    elbowR: p*0.8, elbowL: p2*0.8,
    legRot: 8, legLRot: -8,
    col: '#00ffcc', scale: 0.96,
  });

  dumbbell(0.38, 0.68-p*0.2, {angle: -Math.PI/6});
  dumbbell(0.62, 0.74-p2*0.2, {angle: Math.PI/6});

  repFlash(t, 0.12); wm('HAMMER CURL');
},

shoulder_press(t){
  const p = Math.sin(t*Math.PI*2)*0.5+0.5;
  fl(0.88);

  // bench seat
  CTX.fillStyle = '#1a1a3a'; CTX.strokeStyle = 'rgba(168,85,247,0.5)'; CTX.lineWidth = sc(2);
  CTX.beginPath(); CTX.roundRect(CW*0.38, CH*0.68, sc(100), sc(16), sc(4)); CTX.fill(); CTX.stroke();
  // back support
  CTX.beginPath(); CTX.roundRect(CW*0.38+sc(80), CH*0.28, sc(18), CH*0.4, sc(4)); CTX.fill(); CTX.stroke();

  human3d(0.52, 0.66, {
    torsoAngle: 90,
    armRot: -100 + p*120,  // pressing up
    armLRot: -80 - p*120,
    elbowR: (1-p)*0.5, elbowL: (1-p)*0.5,
    legRot: 30, legLRot: -30,
    kneeR: 0.8, kneeL: 0.8,
    col: '#00ffcc', scale: 0.9,
  });

  dumbbell(0.37, 0.42-p*0.18, {angle: -0.2});
  dumbbell(0.67, 0.42-p*0.18, {angle: 0.2});
  glo(0.5, 0.4-p*0.16, 42, 'rgba(255,230,0,0.15)');

  repFlash(t, 0.12); wm('SHOULDER PRESS');
},

lateral_raise(t){
  const p = Math.sin(t*Math.PI*2)*0.5+0.5;
  fl(0.88);

  human3d(0.5, 0.78, {
    torsoAngle: 90,
    armRot: 90 - p*90,  // from down to out
    armLRot: 90 + p*90,
    elbowR: 0.15, elbowL: 0.15,
    legRot: 8, legLRot: -8,
    col: '#00ffcc', scale: 0.96,
  });

  dumbbell(0.28+p*0.04, 0.66-p*0.06, {angle: -0.4+p*0.4});
  dumbbell(0.72-p*0.04, 0.66-p*0.06, {angle: 0.4-p*0.4});

  // delt highlight
  CTX.fillStyle = 'rgba(232,255,0,0.1)';
  CTX.beginPath(); CTX.ellipse(CW*(0.38+p*0.04), CH*(0.58+p*0.04), sc(18)*p, sc(12)*p, -0.3, 0, Math.PI*2); CTX.fill();
  CTX.beginPath(); CTX.ellipse(CW*(0.62-p*0.04), CH*(0.58+p*0.04), sc(18)*p, sc(12)*p, 0.3, 0, Math.PI*2); CTX.fill();

  repFlash(t, 0.12); wm('LATERAL RAISE');
},

cable_fly(t){
  const p = Math.sin(t*Math.PI*2)*0.5+0.5;
  fl(0.88);
  cableMachine('left');
  cableMachine('right');

  // cables
  CTX.strokeStyle = 'rgba(255,230,0,0.45)'; CTX.lineWidth = sc(2);
  CTX.beginPath(); CTX.moveTo(sc(30), CH*0.22); CTX.lineTo(CW*(0.38-p*0.08), CH*0.58); CTX.stroke();
  CTX.beginPath(); CTX.moveTo(CW-sc(30), CH*0.22); CTX.lineTo(CW*(0.62+p*0.08), CH*0.58); CTX.stroke();

  human3d(0.5, 0.78, {
    torsoAngle: 90,
    armRot: 90 - p*70,
    armLRot: 90 + p*70,
    elbowR: 0.2, elbowL: 0.2,
    legRot: 8, legLRot: -8,
    col: '#00ffcc', scale: 0.96,
  });

  // chest glow
  glo(0.5, 0.58, 50, 'rgba(0,255,204,0.07)');
  repFlash(t, 0.12); wm('CABLE CROSSOVER');
},

pushdown(t){
  const p = Math.sin(t*Math.PI*2)*0.5+0.5;
  cableMachine('right');

  // cable & handle
  CTX.strokeStyle = 'rgba(255,230,0,0.5)'; CTX.lineWidth = sc(2);
  CTX.beginPath(); CTX.moveTo(CW-sc(30), CH*0.08); CTX.lineTo(CW*0.56, CH*0.36); CTX.stroke();
  cableHandle(0.54, 0.36);

  fl(0.88);
  human3d(0.5, 0.78, {
    torsoAngle: 90,
    armRot: 10 + p*70,  // pushing down
    armLRot: 170 - p*70,
    elbowR: 0.6, elbowL: 0.6,
    legRot: 8, legLRot: -8,
    col: '#00ffcc', scale: 0.94,
  });

  // tricep highlight
  CTX.fillStyle = 'rgba(232,255,0,0.1)';
  CTX.beginPath(); CTX.ellipse(CW*0.42, CH*0.6, sc(12), sc(20), 0.2, 0, Math.PI*2); CTX.fill();
  CTX.beginPath(); CTX.ellipse(CW*0.58, CH*0.6, sc(12), sc(20), -0.2, 0, Math.PI*2); CTX.fill();

  repFlash(t, 0.12); wm('TRICEP PUSHDOWN');
},

oh_ext(t){
  const p = Math.sin(t*Math.PI*2)*0.5+0.5;
  fl(0.88);

  human3d(0.5, 0.78, {
    torsoAngle: 90,
    armRot: -160 + p*80,  // from overhead bent to extended
    armLRot: -20 - p*80,
    elbowR: (1-p)*0.8, elbowL: (1-p)*0.8,
    legRot: 8, legLRot: -8,
    col: '#00ffcc', scale: 0.94,
  });

  dumbbell(0.5, 0.24 + (1-p)*0.18, {angle: 0.2});
  glo(0.5, 0.24+(1-p)*0.14, 28, 'rgba(255,230,0,0.18)');

  repFlash(t, 0.12); wm('OH EXTENSION');
},

dips(t){
  const p = Math.sin(t*Math.PI*2)*0.5+0.5;
  parallelBars();
  fl(0.88);

  const bodyY = 0.44 + p*0.16;
  human3d(0.5, bodyY, {
    torsoAngle: 92,
    armRot: -85, armLRot: -95,
    elbowR: p*0.5, elbowL: p*0.5,
    legRot: 5, legLRot: -5,
    kneeR: 0.2, kneeL: 0.2,
    col: '#00ffcc', scale: 0.92,
  });

  repFlash(t, 0.82); wm('DIPS');
},

rdl(t){
  const p = Math.sin(t*Math.PI*2)*0.5+0.5;
  fl(0.88);

  human3d(0.5, 0.76, {
    torsoAngle: 55 + p*35,  // from bent to upright
    armRot: 85 - p*85,
    armLRot: 95 + p*85,
    elbowR: 0.05, elbowL: 0.05,
    legRot: 8, legLRot: -8,
    kneeR: 0, kneeL: 0,
    col: '#00ffcc', scale: 0.96,
  });

  barbell(0.5, 0.76-p*0.16, {});
  glo(0.5, 0.7-p*0.12, 40, 'rgba(255,230,0,0.1)');

  repFlash(t, 0.12); wm('ROMANIAN DL');
},

lunge(t){
  const p = Math.sin(t*Math.PI*2)*0.5+0.5;
  fl(0.88);

  human3d(0.46 + p*0.06, 0.72, {
    torsoAngle: 90,
    armRot: 90, armLRot: 90,
    elbowR: 0.1, elbowL: 0.1,
    legRot: 25+p*15, legLRot: -10-p*10,
    kneeR: p*0.4, kneeL: 0.1,
    col: '#00ffcc', scale: 0.94,
  });

  dumbbell(0.34, 0.62, {angle: 0.1});
  dumbbell(0.62, 0.62, {angle: -0.1});

  repFlash(t, 0.12); wm('WALKING LUNGE');
},

leg_ext(t){
  const p = Math.sin(t*Math.PI*2)*0.5+0.5;
  fl(0.88);
  legExtMachine();

  human3d(0.56, 0.62, {
    torsoAngle: 90,
    armRot: 60, armLRot: 120,
    elbowR: 0.4, elbowL: 0.4,
    legRot: 40 - p*50,  // extending forward
    legLRot: -40 + p*50,
    kneeR: 0, kneeL: 0,
    col: '#00ffcc', scale: 0.86,
  });

  // quad highlight at extension
  CTX.fillStyle = `rgba(232,255,0,${0.05+p*0.1})`;
  CTX.beginPath(); CTX.ellipse(CW*0.3, CH*0.64, sc(20), sc(10), -0.5, 0, Math.PI*2); CTX.fill();

  repFlash(t, 0.82); wm('LEG EXTENSION');
},

calf(t){
  const p = Math.sin(t*Math.PI*2)*0.5+0.5;
  fl(0.88);

  // step platform
  const platGrad = CTX.createLinearGradient(CW*0.3, CH*0.82, CW*0.7, CH*0.86);
  platGrad.addColorStop(0,'#1a1a3a'); platGrad.addColorStop(0.5,'#2a2a5a'); platGrad.addColorStop(1,'#1a1a3a');
  CTX.fillStyle = platGrad;
  CTX.beginPath(); CTX.roundRect(CW*0.3, CH*0.84, CW*0.4, CH*0.06, sc(4)); CTX.fill();
  CTX.strokeStyle = 'rgba(168,85,247,0.6)'; CTX.lineWidth = sc(2); CTX.stroke();

  // rise with heels - body moves up
  human3d(0.5, 0.78 - p*0.07, {
    torsoAngle: 90,
    armRot: 90, armLRot: 90,
    legRot: 5+p*10, legLRot: -5-p*10,
    kneeR: 0, kneeL: 0,
    col: '#00ffcc', scale: 0.96,
  });

  // calf highlight
  CTX.fillStyle = `rgba(232,255,0,${0.06+p*0.1})`;
  CTX.beginPath(); CTX.ellipse(CW*0.45, CH*0.81, sc(11), sc(18), 0, 0, Math.PI*2); CTX.fill();
  CTX.beginPath(); CTX.ellipse(CW*0.55, CH*0.81, sc(11), sc(18), 0, 0, Math.PI*2); CTX.fill();

  repFlash(t, 0.12); wm('CALF RAISE');
},

rear_fly(t){
  const p = Math.sin(t*Math.PI*2)*0.5+0.5;
  fl(0.88);

  human3d(0.5, 0.74, {
    torsoAngle: 50,  // bent forward
    armRot: 120 - p*100,
    armLRot: 60 + p*100,
    elbowR: 0.2, elbowL: 0.2,
    legRot: 10, legLRot: -10,
    col: '#00ffcc', scale: 0.94,
  });

  dumbbell(0.26+p*0.1, 0.52-p*0.06, {angle: p*0.5});
  dumbbell(0.74-p*0.1, 0.52-p*0.06, {angle: -p*0.5});

  repFlash(t, 0.12); wm('REAR DELT FLY');
},

shrug(t){
  const p = Math.sin(t*Math.PI*2)*0.5+0.5;
  fl(0.88);

  human3d(0.5, 0.76 - p*0.04, {
    torsoAngle: 90,
    armRot: 90, armLRot: 90,
    legRot: 8, legLRot: -8,
    col: '#00ffcc', scale: 0.96,
  });

  barbell(0.5, 0.68, {});
  glo(0.5, 0.62, 44, 'rgba(0,255,204,0.07)');

  // trap highlight
  CTX.fillStyle = `rgba(232,255,0,${0.06+p*0.1})`;
  CTX.beginPath(); CTX.ellipse(CW*0.42, CH*0.46, sc(18), sc(16), -0.4, 0, Math.PI*2); CTX.fill();
  CTX.beginPath(); CTX.ellipse(CW*0.58, CH*0.46, sc(18), sc(16), 0.4, 0, Math.PI*2); CTX.fill();

  repFlash(t, 0.12); wm('BARBELL SHRUG');
},

plank(t){
  const pulse = Math.sin(t*Math.PI*6)*0.008;
  fl(0.82);

  // horizontal body
  human3d(0.5, 0.7+pulse, {
    torsoAngle: 0,
    armRot: 90 + pulse*50,
    armLRot: 90 + pulse*50,
    elbowR: 0.5, elbowL: 0.5,
    legRot: -2, legLRot: 2,
    kneeR: 0, kneeL: 0,
    col: '#00ffcc', scale: 0.88,
  });

  // core highlight
  CTX.fillStyle = 'rgba(232,255,0,0.07)';
  CTX.beginPath(); CTX.ellipse(CW*0.5, CH*0.7, sc(68), sc(9), 0, 0, Math.PI*2); CTX.fill();

  glo(0.5, 0.84, 70, 'rgba(0,255,204,0.08)');
  CTX.fillStyle = 'rgba(232,255,0,0.8)';
  CTX.font = `bold ${sc(30)}px 'Bebas Neue',sans-serif`;
  CTX.textAlign = 'center';
  CTX.fillText(Math.floor(_t*62)+'s', CW/2, CH*0.42);
  wm('PLANK');
},

leg_raise(t){
  const p = Math.sin(t*Math.PI*2)*0.5+0.5;
  pullUpBar();

  human3d(0.5, 0.38+p*0.3, {
    torsoAngle: 90,
    armRot: -165, armLRot: -15,
    elbowR: 0.2, elbowL: 0.2,
    legRot: -30+p*50,   // legs raising
    legLRot: 30-p*50,
    kneeR: 0, kneeL: 0,
    col: '#00ffcc', scale: 0.9,
  });

  CTX.fillStyle = `rgba(232,255,0,${0.05+p*0.1})`;
  CTX.beginPath(); CTX.ellipse(CW*0.5, CH*(0.62-p*0.14), sc(22), sc(14), 0, 0, Math.PI*2); CTX.fill();

  repFlash(t, 0.86); wm('HANGING LEG RAISE');
},

skull(t){
  const p = Math.sin(t*Math.PI*2)*0.5+0.5;
  fl(0.88);
  bench3d(0.5, 0.74);
  benchPress_machine();

  human3d(0.5, 0.68, {
    torsoAngle: 0,
    armRot: -70 + p*50,
    armLRot: -110 - p*50,
    elbowR: (1-p)*0.7, elbowL: (1-p)*0.7,
    legRot: 16, legLRot: -16,
    kneeR: 0.5, kneeL: 0.5,
    col: '#00ffcc', scale: 0.9,
  });

  barbell(0.5, 0.34+(1-p)*0.12, {col:'#ffe600'});

  repFlash(t, 0.16); wm('SKULL CRUSHER');
},

incline_press(t){
  const p = Math.sin(t*Math.PI*2)*0.5+0.5;
  bench3d(0.5, 0.76, {angle: -0.28});

  human3d(0.52, 0.68, {
    torsoAngle: 20,
    armRot: -120+p*60,
    armLRot: -60-p*60,
    elbowR: (1-p)*0.4, elbowL: (1-p)*0.4,
    legRot: 10, legLRot: -10,
    kneeR: 0.6, kneeL: 0.6,
    col: '#00ffcc', scale: 0.9,
  });

  dumbbell(0.38, 0.38-p*0.1, {angle:-0.3});
  dumbbell(0.64, 0.36-p*0.1, {angle:0.3});
  glo(0.5, 0.38-p*0.08, 38, 'rgba(255,230,0,0.14)');

  repFlash(t, 0.14); wm('INCLINE PRESS');
},

standing_ohp(t){
  const p = Math.sin(t*Math.PI*2)*0.5+0.5;
  fl(0.88);
  benchPress_machine();

  human3d(0.5, 0.78, {
    torsoAngle: 90,
    armRot: -120+p*130,
    armLRot: -60-p*130,
    elbowR: (1-p)*0.5, elbowL: (1-p)*0.5,
    legRot: 8, legLRot: -8,
    col: '#00ffcc', scale: 0.96,
  });

  barbell(0.5, 0.26+(1-p)*0.24, {});
  glo(0.5, 0.26+(1-p)*0.2, 46, 'rgba(255,230,0,0.16)');

  repFlash(t, 0.12); wm('STANDING OHP');
},

face_pull(t){
  const p = Math.sin(t*Math.PI*2)*0.5+0.5;
  fl(0.88);
  cableMachine('right');

  CTX.strokeStyle = 'rgba(255,230,0,0.5)'; CTX.lineWidth = sc(2);
  CTX.beginPath();
  CTX.moveTo(CW-sc(30), CH*0.28);
  CTX.lineTo(CW*(0.6-p*0.08), CH*0.52);
  CTX.stroke();

  human3d(0.48, 0.78, {
    torsoAngle: 90,
    armRot: -10+p*(-60),
    armLRot: -170-p*(-60),
    elbowR: 0.6, elbowL: 0.6,
    legRot: 8, legLRot: -8,
    col: '#00ffcc', scale: 0.94,
  });

  glo(0.5, 0.52, 40, 'rgba(0,255,204,0.07)');
  repFlash(t, 0.12); wm('FACE PULLS');
},

inc_curl(t){
  const p = Math.sin(t*Math.PI*2)*0.5+0.5;
  bench3d(0.5, 0.76, {angle: -0.28});

  human3d(0.52, 0.68, {
    torsoAngle: 20,
    armRot: 60+p*(-90),
    armLRot: 120-p*(-90),
    elbowR: p*0.8, elbowL: p*0.8,
    legRot: 10, legLRot: -10,
    kneeR: 0.6, kneeL: 0.6,
    col: '#00ffcc', scale: 0.9,
  });

  dumbbell(0.38, 0.56-p*0.14, {angle:-0.2});
  dumbbell(0.64, 0.56-p*0.14, {angle:0.2});
  glo(0.5, 0.56-p*0.12, 30, 'rgba(255,230,0,0.14)');

  repFlash(t, 0.14); wm('INCLINE CURL');
},

wrist_curl(t){
  const p = Math.sin(t*Math.PI*2)*0.5+0.5;
  fl(0.88);
  bench3d(0.5, 0.72);

  human3d(0.5, 0.66, {
    torsoAngle: 60,
    armRot: 80, armLRot: 100,
    elbowR: 0.9, elbowL: 0.9,
    legRot: 16, legLRot: -16,
    kneeR: 0.8, kneeL: 0.8,
    col: '#00ffcc', scale: 0.88,
  });

  barbell(0.5, 0.7-p*0.04, {col:'#ffe600'});
  glo(0.5, 0.68, 26, 'rgba(255,230,0,0.14)');
  repFlash(t, 0.12); wm('WRIST CURL');
},

rev_curl(t){
  const p = Math.sin(t*Math.PI*2)*0.5+0.5;
  fl(0.88);

  human3d(0.5, 0.78, {
    torsoAngle: 90,
    armRot: 70+p*(-110),
    armLRot: 110+p*(110),
    elbowR: p*0.8, elbowL: p*0.8,
    legRot: 8, legLRot: -8,
    col: '#00ffcc', scale: 0.96,
  });

  barbell(0.5, 0.74-p*0.22, {col:'#a855f7'});
  glo(0.5, 0.72-p*0.2, 32, 'rgba(168,85,247,0.18)');
  repFlash(t, 0.12); wm('REVERSE CURL');
},

plyo_push(t){
  const p = Math.sin(t*Math.PI*2)*0.5+0.5;
  const airH = p>0.65 ? (p-0.65)/0.35*0.1 : 0;
  fl(0.82);

  human3d(0.5, 0.72+airH*0.5, {
    torsoAngle: 0,
    armRot: 80-airH*200,
    armLRot: 100+airH*200,
    elbowR: (1-p)*0.4, elbowL: (1-p)*0.4,
    legRot: -2, legLRot: 2,
    col: '#00ffcc', scale: 0.88,
  });

  if(airH>0.02) glo(0.5, 0.84, 62, 'rgba(0,255,204,0.13)');
  repFlash(t, 0.14); wm('PLYO PUSH-UP');
},

hip_stretch(t){
  const p = Math.sin(t*Math.PI)*0.5+0.5;
  fl(0.88);

  human3d(0.5, 0.76, {
    torsoAngle: 90,
    armRot: 60, armLRot: 120,
    elbowR: 0.3, elbowL: 0.3,
    legRot: 30+p*15, legLRot: -15,
    kneeR: 0.5, kneeL: 0.8,
    col: '#00e676', scale: 0.94,
  });

  glo(0.5, 0.8, 58, 'rgba(0,230,118,0.09)');
  wm('HIP FLEXOR STRETCH', 'rgba(0,230,118,0.06)');
},

foam_roll(t){
  const rx = Math.sin(t*Math.PI*2)*0.06;
  fl(0.82);

  // foam roller
  const rg = CTX.createLinearGradient(CW*(0.3+rx), CH*0.78, CW*(0.7+rx), CH*0.82);
  rg.addColorStop(0,'#2a1a5a'); rg.addColorStop(0.5,'#6a2aaa'); rg.addColorStop(1,'#2a1a5a');
  CTX.fillStyle = rg;
  CTX.beginPath(); CTX.roundRect(CW*(0.28+rx), CH*0.76, CW*0.44, CH*0.08, sc(12)); CTX.fill();
  CTX.strokeStyle = 'rgba(168,85,247,0.7)'; CTX.lineWidth = sc(2); CTX.stroke();

  // texture lines
  CTX.strokeStyle = 'rgba(0,0,0,0.3)'; CTX.lineWidth = sc(1);
  for(let i=0; i<6; i++){
    const rx2 = CW*(0.32+rx+i*0.06);
    CTX.beginPath(); CTX.moveTo(rx2, CH*0.76); CTX.lineTo(rx2, CH*0.84); CTX.stroke();
  }

  human3d(0.5+rx, 0.7, {
    torsoAngle: 0,
    armRot: 90, armLRot: 90,
    legRot: -5, legLRot: 5,
    col: '#00e676', scale: 0.88,
  });

  wm('FOAM ROLLING', 'rgba(0,230,118,0.06)');
},

shoulder_str(t){
  const p = Math.sin(t*Math.PI)*0.5+0.5;
  fl(0.88);

  human3d(0.5, 0.78, {
    torsoAngle: 90,
    armRot: -30+p*60,
    armLRot: -100,
    elbowR: 0.7, elbowL: 0.1,
    legRot: 8, legLRot: -8,
    col: '#00e676', scale: 0.96,
  });

  glo(0.38+p*0.05, 0.56, 36, 'rgba(0,230,118,0.1)');
  wm('SHOULDER STRETCH', 'rgba(0,230,118,0.06)');
},

// ── HOME WORKOUT ANIMATIONS (blue color) ────────────────────────────

pushup(t){
  const p = Math.sin(t*Math.PI*2)*0.5+0.5;
  const liftH = p*0.07;
  fl(0.82, 'rgba(100,180,255,0.18)');

  human3d(0.5, 0.7+liftH, {
    torsoAngle: 0,
    armRot: 80-liftH*200,
    armLRot: 100+liftH*200,
    elbowR: (1-p)*0.5, elbowL: (1-p)*0.5,
    legRot: -2, legLRot: 2,
    col: '#64b4ff', scale: 0.9,
  });

  CTX.fillStyle = `rgba(100,180,255,${0.05+p*0.08})`;
  CTX.beginPath(); CTX.ellipse(CW*0.5, CH*0.7, sc(68), sc(10), 0, 0, Math.PI*2); CTX.fill();

  glo(0.5, 0.84, 60, 'rgba(100,180,255,0.1)');
  repFlash(t, 0.14, 'rgba(100,180,255,'); wm('PUSH-UP');
},

wide_push(t){
  const p = Math.sin(t*Math.PI*2)*0.5+0.5;
  fl(0.82, 'rgba(100,180,255,0.18)');

  human3d(0.5, 0.7+p*0.07, {
    torsoAngle: 0,
    armRot: 80, armLRot: 100,
    elbowR: (1-p)*0.5, elbowL: (1-p)*0.5,
    legRot: -2, legLRot: 2,
    col: '#64b4ff', scale: 0.9,
  });

  repFlash(t, 0.14, 'rgba(100,180,255,'); wm('WIDE PUSH-UP');
},

diamond(t){
  const p = Math.sin(t*Math.PI*2)*0.5+0.5;
  fl(0.82, 'rgba(100,180,255,0.18)');

  human3d(0.5, 0.7+p*0.07, {
    torsoAngle: 0,
    armRot: 92, armLRot: 88,
    elbowR: (1-p)*0.5, elbowL: (1-p)*0.5,
    legRot: -2, legLRot: 2,
    col: '#64b4ff', scale: 0.9,
  });

  // diamond hands indicator
  CTX.strokeStyle = 'rgba(100,180,255,0.45)'; CTX.lineWidth = sc(1.5);
  CTX.beginPath(); CTX.moveTo(CW*0.47, CH*0.84); CTX.lineTo(CW*0.5, CH*0.8); CTX.lineTo(CW*0.53, CH*0.84); CTX.lineTo(CW*0.5, CH*0.88); CTX.closePath(); CTX.stroke();

  repFlash(t, 0.14, 'rgba(100,180,255,'); wm('DIAMOND PUSH-UP');
},

pike(t){
  const p = Math.sin(t*Math.PI*2)*0.5+0.5;
  fl(0.88, 'rgba(100,180,255,0.18)');

  human3d(0.5, 0.78, {
    torsoAngle: 45,  // bent forward into V shape
    armRot: 135+p*20,  // reaching to floor
    armLRot: 45-p*20,
    elbowR: (1-p)*0.3, elbowL: (1-p)*0.3,
    legRot: 8, legLRot: -8,
    col: '#64b4ff', scale: 0.92,
  });

  CTX.fillStyle = 'rgba(100,180,255,0.1)';
  CTX.beginPath(); CTX.ellipse(CW*0.5, CH*0.56, sc(26), sc(14), 0, 0, Math.PI*2); CTX.fill();

  repFlash(t, 0.14, 'rgba(100,180,255,'); wm('PIKE PUSH-UP');
},

decline(t){
  const p = Math.sin(t*Math.PI*2)*0.5+0.5;

  // chair for feet
  CTX.fillStyle = '#1a1a3a'; CTX.strokeStyle = 'rgba(168,85,247,0.55)'; CTX.lineWidth = sc(2);
  CTX.beginPath(); CTX.roundRect(CW*0.62, CH*0.6, sc(100), sc(16), sc(3)); CTX.fill(); CTX.stroke();
  CTX.beginPath(); CTX.roundRect(CW*0.62, CH*0.32, sc(14), CH*0.28, sc(3)); CTX.fill(); CTX.stroke();

  fl(0.82, 'rgba(100,180,255,0.18)');

  human3d(0.44, 0.66, {
    torsoAngle: -15,  // slightly declined
    armRot: 82+p*8,
    armLRot: 98-p*8,
    elbowR: (1-p)*0.5, elbowL: (1-p)*0.5,
    legRot: -8, legLRot: 8,
    col: '#64b4ff', scale: 0.88,
  });

  repFlash(t, 0.14, 'rgba(100,180,255,'); wm('DECLINE PUSH-UP');
},

chair_dip(t){
  const p = Math.sin(t*Math.PI*2)*0.5+0.5;

  // chair
  CTX.fillStyle = '#1a1a3a'; CTX.strokeStyle = 'rgba(168,85,247,0.55)'; CTX.lineWidth = sc(2);
  CTX.beginPath(); CTX.roundRect(CW*0.36, CH*0.52, sc(100), sc(14), sc(3)); CTX.fill(); CTX.stroke();
  CTX.beginPath(); CTX.roundRect(CW*0.36, CH*0.26, sc(14), CH*0.26, sc(3)); CTX.fill(); CTX.stroke();
  for(const xR of [0.36, 0.63]){
    CTX.beginPath(); CTX.moveTo(CW*xR+sc(7), CH*0.66); CTX.lineTo(CW*xR+sc(7), CH*0.88); CTX.stroke();
  }

  fl(0.88, 'rgba(100,180,255,0.18)');

  const bodyY = 0.44 + p*0.12;
  human3d(0.5, bodyY, {
    torsoAngle: 92,
    armRot: -84, armLRot: -96,
    elbowR: p*0.5, elbowL: p*0.5,
    legRot: 15, legLRot: -15,
    kneeR: 0.6, kneeL: 0.6,
    col: '#64b4ff', scale: 0.9,
  });

  repFlash(t, 0.82, 'rgba(100,180,255,'); wm('CHAIR DIP');
},

planche(t){
  const p = Math.sin(t*Math.PI*2)*0.5+0.5;
  fl(0.82, 'rgba(100,180,255,0.18)');

  human3d(0.5, 0.68+p*0.06, {
    torsoAngle: 0,
    lean: 15,
    armRot: 95, armLRot: 85,
    elbowR: (1-p)*0.4, elbowL: (1-p)*0.4,
    legRot: -2, legLRot: 2,
    col: '#64b4ff', scale: 0.9,
  });

  glo(0.5, 0.72, 65, 'rgba(100,180,255,0.08)');
  repFlash(t, 0.14, 'rgba(100,180,255,'); wm('PSEUDO PLANCHE');
},

table_row(t){
  const p = Math.sin(t*Math.PI*2)*0.5+0.5;

  // table
  const tabGrad = CTX.createLinearGradient(CW*0.14, CH*0.38, CW*0.86, CH*0.42);
  tabGrad.addColorStop(0,'#1a1a3a'); tabGrad.addColorStop(0.5,'#2a2a5a'); tabGrad.addColorStop(1,'#1a1a3a');
  CTX.fillStyle = tabGrad;
  CTX.beginPath(); CTX.roundRect(CW*0.14, CH*0.38, CW*0.72, CH*0.06, sc(4)); CTX.fill();
  CTX.strokeStyle = 'rgba(168,85,247,0.6)'; CTX.lineWidth = sc(2); CTX.stroke();

  for(const xR of [0.18, 0.82]){
    CTX.fillStyle = '#1a1a3a'; CTX.strokeStyle = 'rgba(168,85,247,0.4)';
    CTX.beginPath(); CTX.roundRect(CW*xR-sc(6), CH*0.44, sc(12), CH*0.4, sc(3)); CTX.fill(); CTX.stroke();
  }

  fl(0.88, 'rgba(100,180,255,0.18)');

  // body hanging under table pulling up
  human3d(0.5, 0.62-p*0.12, {
    torsoAngle: 0,
    armRot: -80+p*20,
    armLRot: -100-p*20,
    elbowR: p*0.4, elbowL: p*0.4,
    legRot: -2, legLRot: 2,
    col: '#64b4ff', scale: 0.88,
  });

  repFlash(t, 0.82, 'rgba(100,180,255,'); wm('TABLE ROW');
},

towel_curl(t){
  const p = Math.sin(t*Math.PI*2)*0.5+0.5;
  fl(0.88, 'rgba(100,180,255,0.18)');

  // door with handle
  CTX.fillStyle = '#0f0f1e'; CTX.strokeStyle = 'rgba(168,85,247,0.3)'; CTX.lineWidth = sc(2);
  CTX.beginPath(); CTX.rect(0, 0, sc(28), CH); CTX.fill(); CTX.stroke();
  CTX.fillStyle = '#ffe60088';
  CTX.beginPath(); CTX.roundRect(sc(22), CH*0.38, sc(16), sc(44), sc(6)); CTX.fill();

  // towel
  CTX.strokeStyle = 'rgba(100,180,255,0.6)'; CTX.lineWidth = sc(5); CTX.lineCap = 'round';
  CTX.beginPath();
  CTX.moveTo(sc(30), CH*0.46);
  CTX.quadraticCurveTo(CW*0.22, CH*(0.52-p*0.12), CW*0.32, CH*(0.62-p*0.18));
  CTX.stroke();

  human3d(0.5, 0.78, {
    torsoAngle: 88-p*18,
    armRot: 30+p*(-90),
    armLRot: 150-p*(90),
    elbowR: p*0.7, elbowL: p*0.7,
    legRot: 15, legLRot: -15,
    col: '#64b4ff', scale: 0.9,
  });

  repFlash(t, 0.12, 'rgba(100,180,255,'); wm('TOWEL BICEP CURL');
},

superman(t){
  const p = Math.sin(t*Math.PI*2)*0.5+0.5;
  fl(0.82, 'rgba(100,180,255,0.18)');

  human3d(0.5, 0.7, {
    torsoAngle: 0,
    armRot: -30-p*40,  // arms lifting up overhead
    armLRot: -150+p*40,
    elbowR: 0.1, elbowL: 0.1,
    legRot: -5-p*10,  // legs lifting
    legLRot: 5+p*10,
    col: '#64b4ff', scale: 0.9,
    lean: p*5,
  });

  CTX.fillStyle = `rgba(100,180,255,${0.05+p*0.09})`;
  CTX.beginPath(); CTX.ellipse(CW*0.5, CH*0.7, sc(70), sc(9), 0, 0, Math.PI*2); CTX.fill();

  repFlash(t, 0.14, 'rgba(100,180,255,'); wm('SUPERMAN HOLD');
},

pull_apart(t){
  const p = Math.sin(t*Math.PI*2)*0.5+0.5;
  fl(0.88, 'rgba(100,180,255,0.18)');

  human3d(0.5, 0.78, {
    torsoAngle: 90,
    armRot: 90-p*75,
    armLRot: 90+p*75,
    elbowR: 0.1, elbowL: 0.1,
    legRot: 8, legLRot: -8,
    col: '#64b4ff', scale: 0.96,
  });

  // towel/band
  CTX.strokeStyle = `rgba(100,180,255,${0.4+p*0.4})`; CTX.lineWidth = sc(5); CTX.lineCap = 'round';
  CTX.beginPath();
  CTX.moveTo(CW*(0.32-p*0.1), CH*0.58);
  CTX.lineTo(CW*(0.68+p*0.1), CH*0.58);
  CTX.stroke();

  repFlash(t, 0.12, 'rgba(100,180,255,'); wm('PULL-APART');
},

arch_hold(t){
  const p = Math.sin(t*Math.PI*2)*0.5+0.5;
  fl(0.88, 'rgba(100,180,255,0.18)');

  human3d(0.5, 0.72, {
    torsoAngle: 0,
    lean: -p*10,
    armRot: -50-p*30,
    armLRot: -130+p*30,
    elbowR: 0.1, elbowL: 0.1,
    legRot: -5-p*10, legLRot: 5+p*10,
    col: '#64b4ff', scale: 0.9,
  });

  repFlash(t, 0.14, 'rgba(100,180,255,'); wm('ARCH BODY HOLD');
},

iso_curl(t){
  const p = Math.sin(t*Math.PI*2)*0.5+0.5;
  fl(0.88, 'rgba(100,180,255,0.18)');

  // table
  CTX.fillStyle = '#1a1a3a'; CTX.strokeStyle = 'rgba(168,85,247,0.5)'; CTX.lineWidth = sc(2);
  CTX.beginPath(); CTX.roundRect(CW*0.28, CH*0.5, CW*0.44, CH*0.06, sc(4)); CTX.fill(); CTX.stroke();

  human3d(0.5, 0.72, {
    torsoAngle: 85,
    armRot: 20+p*5, armLRot: 160-p*5,
    elbowR: 0.7+p*0.1, elbowL: 0.7+p*0.1,
    legRot: 22, legLRot: -22,
    kneeR: 0.8, kneeL: 0.8,
    col: '#64b4ff', scale: 0.86,
  });

  glo(0.5, 0.5, 35, 'rgba(100,180,255,0.1)');
  wm('ISOMETRIC CURL');
},

bw_squat(t){
  const p = Math.sin(t*Math.PI*2)*0.5+0.5;
  fl(0.88, 'rgba(100,180,255,0.18)');

  const sqD = p*0.18;
  human3d(0.5, 0.76+sqD, {
    torsoAngle: 88+(1-p)*8,
    armRot: -60, armLRot: -120,
    legRot: 20+sqD*80, legLRot: -20-sqD*80,
    kneeR: sqD*2.5, kneeL: sqD*2.5,
    col: '#64b4ff', scale: 0.96,
  });

  CTX.fillStyle = `rgba(100,180,255,${0.06+p*0.09})`;
  CTX.beginPath(); CTX.ellipse(CW*0.4, CH*(0.8+sqD*0.5), sc(18), sc(26), 0.3, 0, Math.PI*2); CTX.fill();
  CTX.beginPath(); CTX.ellipse(CW*0.6, CH*(0.8+sqD*0.5), sc(18), sc(26), -0.3, 0, Math.PI*2); CTX.fill();

  repFlash(t, 0.12, 'rgba(100,180,255,'); wm('BODYWEIGHT SQUAT');
},

jump_squat(t){
  const p = Math.sin(t*Math.PI*2)*0.5+0.5;
  const airH = p>0.6 ? (p-0.6)/0.4*0.28 : 0;
  fl(0.88, 'rgba(100,180,255,0.18)');

  human3d(0.5, 0.76-airH, {
    torsoAngle: 90,
    armRot: airH>0.1 ? -110 : -60,
    armLRot: airH>0.1 ? -70 : -120,
    legRot: airH>0.1 ? 10 : 18,
    legLRot: airH>0.1 ? -10 : -18,
    kneeR: airH>0.1 ? 0.1 : 0,
    kneeL: airH>0.1 ? 0.1 : 0,
    col: '#64b4ff', scale: 0.94,
  });

  if(airH>0.04) glo(0.5, 0.86, 68, 'rgba(100,180,255,0.14)');

  repFlash(t, 0.12, 'rgba(100,180,255,'); wm('JUMP SQUAT');
},

bss(t){
  const p = Math.sin(t*Math.PI*2)*0.5+0.5;

  // chair for rear foot
  CTX.fillStyle = '#1a1a3a'; CTX.strokeStyle = 'rgba(168,85,247,0.55)'; CTX.lineWidth = sc(2);
  CTX.beginPath(); CTX.roundRect(CW*0.62, CH*0.6, sc(90), sc(14), sc(3)); CTX.fill(); CTX.stroke();
  CTX.beginPath(); CTX.roundRect(CW*0.62, CH*0.34, sc(14), CH*0.26, sc(3)); CTX.fill(); CTX.stroke();

  fl(0.88, 'rgba(100,180,255,0.18)');

  human3d(0.44, 0.74+p*0.06, {
    torsoAngle: 90,
    armRot: 70, armLRot: 110,
    elbowR: 0.3, elbowL: 0.3,
    legRot: 28+p*10, legLRot: -15,
    kneeR: p*0.5, kneeL: 0.3,
    col: '#64b4ff', scale: 0.9,
  });

  repFlash(t, 0.12, 'rgba(100,180,255,'); wm('BULGARIAN SPLIT SQUAT');
},

glute_br(t){
  const p = Math.sin(t*Math.PI*2)*0.5+0.5;
  fl(0.88, 'rgba(100,180,255,0.18)');

  human3d(0.5, 0.76, {
    torsoAngle: -p*25,  // hips rising
    armRot: 90, armLRot: 90,
    elbowR: 0.3, elbowL: 0.3,
    legRot: 30-p*10, legLRot: -30+p*10,
    kneeR: 0.8-p*0.4, kneeL: 0.8-p*0.4,
    col: '#64b4ff', scale: 0.9,
  });

  CTX.fillStyle = `rgba(100,180,255,${0.06+p*0.1})`;
  CTX.beginPath(); CTX.ellipse(CW*0.5, CH*0.64, sc(30), sc(12), 0, 0, Math.PI*2); CTX.fill();

  repFlash(t, 0.12, 'rgba(100,180,255,'); wm('GLUTE BRIDGE');
},

slg_bridge(t){
  ANIMS.glute_br(t);
  wm('SINGLE-LEG GLUTE BRIDGE');
},

wall_sit(t){
  fl(0.88, 'rgba(100,180,255,0.18)');

  // wall
  CTX.fillStyle = '#0f0f1e'; CTX.strokeStyle = 'rgba(168,85,247,0.3)'; CTX.lineWidth = sc(2);
  CTX.beginPath(); CTX.rect(CW-sc(28), 0, sc(28), CH); CTX.fill(); CTX.stroke();

  human3d(0.7, 0.58, {
    torsoAngle: 90,
    armRot: 70, armLRot: 110,
    elbowR: 0.1, elbowL: 0.1,
    legRot: 45, legLRot: -45,
    kneeR: 0.95, kneeL: 0.95,
    col: '#64b4ff', scale: 0.9,
  });

  CTX.fillStyle = `rgba(100,180,255,${0.06+Math.sin(_t*Math.PI*4)*0.05})`;
  CTX.beginPath(); CTX.ellipse(CW*0.62, CH*0.72, sc(22), sc(10), 0, 0, Math.PI*2); CTX.fill();

  CTX.fillStyle = 'rgba(100,180,255,0.8)';
  CTX.font = `bold ${sc(26)}px 'Bebas Neue',sans-serif`;
  CTX.textAlign = 'center';
  CTX.fillText(Math.floor(_t*62)+'s', CW*0.32, CH*0.42);
  wm('WALL SIT');
},

calf_step(t){ ANIMS.calf(t); wm('CALF RAISE (STEP)'); },

hollow(t){
  const p = Math.sin(t*Math.PI)*0.5+0.5;
  fl(0.88, 'rgba(100,180,255,0.18)');

  human3d(0.5, 0.78, {
    torsoAngle: -p*15,
    armRot: -70-p*20,
    armLRot: -110+p*20,
    elbowR: 0.1, elbowL: 0.1,
    legRot: -10+p*15, legLRot: 10-p*15,
    col: '#64b4ff', scale: 0.9,
  });

  CTX.fillStyle = `rgba(100,180,255,${0.05+p*0.09})`;
  CTX.beginPath(); CTX.ellipse(CW*0.5, CH*0.78, sc(70), sc(9), -p*0.15, 0, Math.PI*2); CTX.fill();

  wm('HOLLOW BODY HOLD');
},

bicycle(t){
  const p = Math.sin(t*Math.PI*2);
  fl(0.88, 'rgba(100,180,255,0.18)');

  human3d(0.5, 0.74, {
    torsoAngle: -15,
    armRot: -30+p*40,
    armLRot: -150-p*40,
    elbowR: 0.5, elbowL: 0.5,
    legRot: 15+p*30, legLRot: -15-p*30,
    kneeR: 0.4+p*0.4, kneeL: 0.4-p*0.4,
    col: '#64b4ff', scale: 0.9,
  });

  repFlash(t, 0.12, 'rgba(100,180,255,'); wm('BICYCLE CRUNCH');
},

leg_raise_h(t){
  const p = Math.sin(t*Math.PI*2)*0.5+0.5;
  fl(0.88, 'rgba(100,180,255,0.18)');

  human3d(0.5, 0.74, {
    torsoAngle: 0,
    armRot: 90, armLRot: 90,
    legRot: -40+p*60,
    legLRot: 40-p*60,
    kneeR: 0, kneeL: 0,
    col: '#64b4ff', scale: 0.9,
  });

  CTX.fillStyle = `rgba(100,180,255,${0.05+p*0.1})`;
  CTX.beginPath(); CTX.ellipse(CW*0.5, CH*0.62, sc(22), sc(14), 0, 0, Math.PI*2); CTX.fill();

  repFlash(t, 0.12, 'rgba(100,180,255,'); wm('LEG RAISE');
},

mt_climb(t){
  const p = Math.sin(t*Math.PI*4)*0.5+0.5;
  fl(0.82, 'rgba(100,180,255,0.18)');

  human3d(0.5, 0.7, {
    torsoAngle: 0,
    armRot: 88, armLRot: 92,
    elbowR: 0.5, elbowL: 0.5,
    legRot: -15+p*35,
    legLRot: 15-p*35,
    kneeR: p*0.5, kneeL: (1-p)*0.5,
    col: '#64b4ff', scale: 0.9,
  });

  repFlash(t, 0.14, 'rgba(100,180,255,'); wm('MOUNTAIN CLIMBER');
},

side_plank(t){
  const pulse = Math.sin(t*Math.PI*4)*0.006;
  fl(0.86, 'rgba(100,180,255,0.18)');

  human3d(0.42, 0.68+pulse, {
    torsoAngle: 45,  // sideways
    armRot: -90,
    armLRot: 0,
    elbowR: 0.8, elbowL: 0.1,
    legRot: 45, legLRot: 35,
    col: '#64b4ff', scale: 0.88,
  });

  CTX.fillStyle = 'rgba(100,180,255,0.8)';
  CTX.font = `bold ${sc(26)}px 'Bebas Neue',sans-serif`;
  CTX.textAlign = 'center';
  CTX.fillText(Math.floor(_t*32)+'s', CW*0.72, CH*0.42);
  wm('SIDE PLANK');
},

v_up(t){
  const p = Math.sin(t*Math.PI*2)*0.5+0.5;
  fl(0.88, 'rgba(100,180,255,0.18)');

  human3d(0.5, 0.72, {
    torsoAngle: -30+p*60,  // crunching up
    armRot: -80+p*80,
    armLRot: -100-p*80,
    elbowR: 0.1, elbowL: 0.1,
    legRot: -30+p*50, legLRot: 30-p*50,
    kneeR: 0, kneeL: 0,
    col: '#64b4ff', scale: 0.9,
  });

  CTX.fillStyle = `rgba(100,180,255,${0.05+p*0.1})`;
  CTX.beginPath(); CTX.ellipse(CW*0.5, CH*0.62, sc(20), sc(14), 0, 0, Math.PI*2); CTX.fill();

  repFlash(t, 0.12, 'rgba(100,180,255,'); wm('V-UP');
},

burpee(t){
  const ph = t%1;
  fl(0.88, 'rgba(100,180,255,0.18)');

  if(ph < 0.3){
    // squatting down
    const pp = ph/0.3;
    human3d(0.5, 0.76+pp*0.06, {
      torsoAngle: 88-(1-pp)*35,
      armRot: -60, armLRot: -120,
      legRot: 18+pp*10, legLRot: -18-pp*10,
      kneeR: pp*0.5, kneeL: pp*0.5,
      col: '#64b4ff', scale: 0.94,
    });
  } else if(ph < 0.55){
    // plank position
    human3d(0.5, 0.7, {
      torsoAngle: 0,
      armRot: 88, armLRot: 92,
      elbowR: 0.5, elbowL: 0.5,
      legRot: -2, legLRot: 2,
      col: '#64b4ff', scale: 0.9,
    });
  } else {
    // jumping up
    const pp = (ph-0.55)/0.45;
    const airH = pp*0.3;
    human3d(0.5, 0.76-airH, {
      torsoAngle: 90,
      armRot: -150+pp*20,
      armLRot: -30-pp*20,
      legRot: 8, legLRot: -8,
      col: '#64b4ff', scale: 0.94,
    });
    if(airH>0.05) glo(0.5, 0.88, 70, 'rgba(100,180,255,0.14)');
  }

  repFlash(t, 0.12, 'rgba(100,180,255,'); wm('BURPEE');
},

pu_row(t){
  const ph = t%1;
  fl(0.82, 'rgba(100,180,255,0.18)');

  if(ph < 0.5){
    const p2 = Math.sin(ph*Math.PI*2)*0.5+0.5;
    human3d(0.5, 0.7+p2*0.07, {
      torsoAngle: 0,
      armRot: 88, armLRot: 92,
      elbowR: (1-p2)*0.5, elbowL: (1-p2)*0.5,
      legRot: -2, legLRot: 2,
      col: '#64b4ff', scale: 0.9,
    });
  } else {
    const p3 = (ph-0.5)/0.5;
    human3d(0.5, 0.7, {
      torsoAngle: 30,  // rolling to side
      armRot: -80+p3*80,
      armLRot: 90,
      elbowR: p3*0.5, elbowL: 0.6,
      legRot: 30, legLRot: 20,
      col: '#64b4ff', scale: 0.9,
    });
  }

  repFlash(t, 0.14, 'rgba(100,180,255,'); wm('PUSH-UP TO ROW');
},

jump_lunge(t){
  const p = Math.sin(t*Math.PI*2)*0.5+0.5;
  const airH = p>0.55 ? (p-0.55)/0.45*0.24 : 0;
  fl(0.88, 'rgba(100,180,255,0.18)');

  human3d(0.5, 0.76-airH, {
    torsoAngle: 90,
    armRot: airH>0.05 ? -110 : 40,
    armLRot: airH>0.05 ? -70 : 140,
    legRot: airH>0.05 ? 20 : 30,
    legLRot: airH>0.05 ? -20 : -15,
    kneeR: airH>0.05 ? 0.2 : 0.5,
    kneeL: airH>0.05 ? 0.2 : 0.15,
    col: '#64b4ff', scale: 0.94,
  });

  if(airH>0.04) glo(0.5, 0.88, 60, 'rgba(100,180,255,0.13)');
  repFlash(t, 0.12, 'rgba(100,180,255,'); wm('JUMP LUNGE');
},

bear_crawl(t){
  const step = Math.sin(t*Math.PI*4)*0.5+0.5;
  fl(0.88, 'rgba(100,180,255,0.18)');

  human3d(0.5, 0.7, {
    torsoAngle: 0,
    armRot: 70+step*30,
    armLRot: 110-step*30,
    elbowR: 0.5, elbowL: 0.5,
    legRot: -15-step*20, legLRot: 15+step*20,
    kneeR: step*0.4, kneeL: (1-step)*0.4,
    col: '#64b4ff', scale: 0.9,
  });

  wm('BEAR CRAWL');
},

pu_tap(t){
  const ph = t%1;
  const p = Math.sin(ph*Math.PI*2)*0.5+0.5;
  fl(0.82, 'rgba(100,180,255,0.18)');

  human3d(0.5, 0.7+p*0.07, {
    torsoAngle: 0,
    armRot: ph>0.65 ? -20 : 88,
    armLRot: 92,
    elbowR: ph>0.65 ? 0.4 : (1-p)*0.5,
    elbowL: (1-p)*0.5,
    legRot: -2, legLRot: 2,
    col: '#64b4ff', scale: 0.9,
  });

  if(ph>0.65){
    CTX.strokeStyle = 'rgba(255,140,0,0.9)'; CTX.lineWidth = sc(3); CTX.lineCap = 'round';
    CTX.beginPath(); CTX.moveTo(CW*0.42, CH*0.58); CTX.lineTo(CW*0.56, CH*0.54); CTX.stroke();
    CTX.fillStyle = 'rgba(255,140,0,0.8)';
    CTX.beginPath(); CTX.arc(CW*0.56, CH*0.54, sc(6), 0, Math.PI*2); CTX.fill();
  }

  repFlash(t, 0.14, 'rgba(100,180,255,'); wm('PUSH-UP SHOULDER TAP');
},

squat_tuck(t){
  const p = Math.sin(t*Math.PI*2)*0.5+0.5;
  const airH = p>0.5 ? (p-0.5)/0.5*0.36 : 0;
  fl(0.88, 'rgba(100,180,255,0.18)');

  if(airH > 0.08){
    // tuck in air
    human3d(0.5, 0.72-airH, {
      torsoAngle: 90,
      armRot: -50, armLRot: -130,
      elbowR: 0.3, elbowL: 0.3,
      legRot: 45, legLRot: -45,
      kneeR: 1, kneeL: 1,
      col: '#64b4ff', scale: 0.9,
    });
    glo(0.5, 0.88, 78, 'rgba(100,180,255,0.15)');
  } else {
    human3d(0.5, 0.76, {
      torsoAngle: 90,
      armRot: -60, armLRot: -120,
      legRot: 18, legLRot: -18,
      kneeR: 0, kneeL: 0,
      col: '#64b4ff', scale: 0.94,
    });
  }

  repFlash(t, 0.12, 'rgba(100,180,255,'); wm('SQUAT JUMP TUCK');
},

inchworm(t){
  const ph = t%1;
  fl(0.88, 'rgba(100,180,255,0.18)');

  if(ph < 0.35){
    // hinging forward
    const pp = ph/0.35;
    human3d(0.5, 0.76, {
      torsoAngle: 90 - pp*55,
      armRot: 100+pp*30, armLRot: 80-pp*30,
      elbowR: pp*0.2, elbowL: pp*0.2,
      legRot: 8, legLRot: -8,
      col: '#64b4ff', scale: 0.92,
    });
  } else if(ph < 0.65){
    // walking hands out to plank
    human3d(0.5, 0.7, {
      torsoAngle: 0,
      armRot: 88, armLRot: 92,
      elbowR: 0.5, elbowL: 0.5,
      legRot: -2, legLRot: 2,
      col: '#64b4ff', scale: 0.9,
    });
  } else {
    // walking feet back in
    const pp = (ph-0.65)/0.35;
    human3d(0.5, 0.76, {
      torsoAngle: 35+pp*55,
      armRot: 130-pp*30, armLRot: 50+pp*30,
      elbowR: (1-pp)*0.2, elbowL: (1-pp)*0.2,
      legRot: 8, legLRot: -8,
      col: '#64b4ff', scale: 0.92,
    });
  }

  wm('INCHWORM');
},

// crunch
crunch(t){
  const p = Math.sin(t*Math.PI*2)*0.5+0.5;
  fl(0.88);

  human3d(0.5, 0.72, {
    torsoAngle: -p*35,
    armRot: -30+p*20, armLRot: -150-p*20,
    elbowR: 0.4, elbowL: 0.4,
    legRot: 25, legLRot: -25,
    kneeR: 0.8, kneeL: 0.8,
    col: '#00ffcc', scale: 0.9,
  });

  CTX.fillStyle = `rgba(232,255,0,${0.05+p*0.1})`;
  CTX.beginPath(); CTX.ellipse(CW*0.5, CH*0.56, sc(22), sc(14), 0, 0, Math.PI*2); CTX.fill();

  repFlash(t, 0.14); wm('CABLE CRUNCH');
},

};

// ── MODAL CONTROLS ──────────────────────────────────────────────────
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
  resizeCanvas();
  _raf = requestAnimationFrame(animLoop);
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
  if(_playing) _t=(_t+dt*0.00085*_speed)%1;
  const cyc=_t%1;
  if(cyc<_lastCyc){_rep=Math.min(_rep+1,_maxRep);updateRepBar();}
  _lastCyc=cyc;
  clr(); grid();
  const fn=ANIMS[_key]||ANIMS.bench;
  fn(_t);
  _raf=requestAnimationFrame(animLoop);
}

document.addEventListener('DOMContentLoaded', initCanvas);
