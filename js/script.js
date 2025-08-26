function showToast(msg, ms=2000){
    const el = document.getElementById('toast');
    el.textContent = msg;
    el.classList.add('show');
    clearTimeout(el._t);
    el._t = setTimeout(()=>el.classList.remove('show'), ms);
}

(function(){
  const symbols = ['b', '0','1'];
  let stateCounter = 0;
  const states = [];
  const pastelColors = ["#d0ebff","#ffd6a5","#caffbf","#fdffb6","#bdb2ff","#ffadad","#caffbf","#9bf6ff","#ffc6ff","#fff7a5"];

  let executing = { state: null, read: null };
  let execPhase = null;
  let currentRule = null;

  window.isRunning = false;
  window.isPaused = false;
  let execInterval = null;

  let dragInfo = null;
  let droppedInZone = false;

  function createState(){
    const id = `q${stateCounter++}`;
    const rules = symbols.map(sym => ({ read:sym, write:"", move:"", next:"" }));
    const color = pastelColors[(stateCounter-1) % pastelColors.length];
    states.push({ id, rules, color });
    return id;
  }

  function render(){
    const tbody = document.querySelector('#statesTable tbody');
    tbody.innerHTML = '';

    states.forEach(st => {
      let stateCell = null;

      st.rules.forEach((rule, ruleIdx) => {
        const tr = document.createElement('tr');
        tr.classList.add('rule-row');
        tr.dataset.state = st.id;
        tr.dataset.read = rule.read;

        if (ruleIdx === 0) {
          const tdState = document.createElement('td');
          tdState.rowSpan = st.rules.length;
          const block = document.createElement('div');
          block.className = 'state-block';
          block.textContent = st.id;
          block.style.background = st.color;
          block.draggable = true;
          block.addEventListener('dragstart', e=>{
            e.dataTransfer.setData('text/plain', st.id);
            e.dataTransfer.effectAllowed = 'move';
            dragInfo = { fromState: st };
            droppedInZone = false;
          });
          tdState.appendChild(block);
          tr.appendChild(tdState);

          stateCell = tdState;
        }

        const tdRead = document.createElement('td');
        tdRead.textContent = rule.read;
        tr.appendChild(tdRead);

        const tdWrite = document.createElement('td');
        ['b','0','1'].forEach(val=>{
          const btn = document.createElement('div');
          btn.textContent = val;
          btn.className = 'choice-btn';
          if(rule.write === val){
            btn.classList.add('active');
            btn.style.background = st.color;
            btn.style.color = '#222';
          }
          btn.onclick = () => { rule.write = (rule.write === val ? '' : val); render(); };
          tdWrite.appendChild(btn);
        });
        tr.appendChild(tdWrite);

        const tdMove = document.createElement('td');
        [['L','←'],['R','→']].forEach(([val,label])=>{
          const btn = document.createElement('div');
          btn.textContent = label;
          btn.className = 'choice-btn';
          if(rule.move === val){
            btn.classList.add('active');
            btn.style.background = st.color;
            btn.style.color = '#222';
          }
          btn.onclick = () => { rule.move = (rule.move === val ? '' : val); render(); };
          tdMove.appendChild(btn);
        });
        tr.appendChild(tdMove);

        const tdNext = document.createElement('td');
        const dropZone = document.createElement('div');
        dropZone.className = 'drop-zone';

        if (rule.next) {
          dropZone.classList.add('filled');
          const block = document.createElement('div');
          block.className = 'state-block';
          block.textContent = rule.next;
          if (rule.next === "STOP") block.style.background = "#ffb3b3";
          else {
            const nextState = states.find(s => s.id === rule.next);
            if (nextState) block.style.background = nextState.color;
          }
          block.draggable = true;
          block.addEventListener('dragstart', e=>{
            e.dataTransfer.setData('text/plain', rule.next);
            e.dataTransfer.effectAllowed = 'move';
            dragInfo = { fromRule: rule, stateId: rule.next };
            droppedInZone = false;
          });
          dropZone.appendChild(block);
        }

        dropZone.ondragover = e => { e.preventDefault(); dropZone.classList.add('over'); };
        dropZone.ondragleave = e => { dropZone.classList.remove('over'); };
        dropZone.ondrop = e => {
          e.preventDefault();
          dropZone.classList.remove('over');
          const stateId = e.dataTransfer.getData('text/plain');
          if (!stateId) return;
          if (dragInfo && dragInfo.fromRule) dragInfo.fromRule.next = '';
          rule.next = stateId;
          droppedInZone = true;
          dragInfo = null;
          render();
        };

        tdNext.appendChild(dropZone);
        tr.appendChild(tdNext);

        if ((window.isRunning || window.isPaused) && executing.state === st.id && executing.read === rule.read) {
          if (execPhase === "state") {
            if (stateCell) stateCell.classList.add("executing");
          } else if (execPhase === "read") {
            tdRead.classList.add("executing");
          } else if (execPhase === "write") {
            tdWrite.classList.add("executing");
          } else if (execPhase === "move") {
            tdMove.classList.add("executing");
          } else if (execPhase === "next") {
            tdNext.classList.add("executing");
          }
        }

        tbody.appendChild(tr);
      });
    });
  }

  document.getElementById('addStateBtn').addEventListener('click', ()=>{
    createState();
    render();
  });

  document.addEventListener('dragend', () => {
    if(dragInfo && dragInfo.fromRule && !droppedInZone){
      dragInfo.fromRule.next = '';
      render();
    }
    dragInfo = null;
    droppedInZone = false;
  });

  createState(); createState(); createState(); createState();
  render();

  const stopBlock = document.getElementById("stopBlock");
  stopBlock.addEventListener("dragstart", e => {
    e.dataTransfer.setData('text/plain', "STOP");
    e.dataTransfer.effectAllowed = 'move';
  });

  const exportBtn = document.getElementById('exportBtn');
  exportBtn.addEventListener('click', () => {
    try{
      const payload = {
        version: 1,
        symbols,
        states,
        tape: (Array.isArray(window.tapeStates) ? [...window.tapeStates] : null)
      };
      const blob = new Blob([JSON.stringify(payload, null, 2)], {type: 'application/json'});
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'turing-config.json';
      document.body.appendChild(a);
      a.click();
      a.remove();
      URL.revokeObjectURL(url);
      showToast('Configuration exportée.');
    }catch(e){
      console.error(e);
      showToast('Export impossible.');
    }
  });

  const importBtn = document.getElementById('importBtn');
  const importFile = document.getElementById('importFile');

  importBtn.addEventListener('click', () => importFile.click());

  importFile.addEventListener('change', async () => {
    const file = importFile.files[0];
    if(!file) return;
    try{
      const text = await file.text();
      const data = JSON.parse(text);
      if(!data || !Array.isArray(data.states)) throw new Error('Format non valide');

      states.length = 0;
      data.states.forEach(s => {
        if(typeof s.id === 'string' && Array.isArray(s.rules)){
          states.push({
            id: s.id,
            rules: s.rules.map(r => ({
              read: r.read,
              write: r.write ?? "",
              move: r.move ?? "",
              next: r.next ?? ""
            })),
            color: s.color || '#d0ebff'
          });
        }
      });

      const maxNum = states
        .map(s => (s.id.match(/^q(\d+)$/) ? parseInt(RegExp.$1,10) : -1))
        .reduce((a,b)=>Math.max(a,b), -1);
      stateCounter = Math.max(0, maxNum + 1);

      if (Array.isArray(data.tape) && Array.isArray(window.tapeStates)) {
        const N = window.tapeStates.length;
        for(let i=0;i<N;i++){
          window.tapeStates[i] = (i < data.tape.length ? data.tape[i] : 'b');
        }
      }

      render();
      importFile.value = '';
      showToast('Configuration importée.');
    }catch(e){
      console.error(e);
      showToast('Import impossible (JSON invalide).');
    }
  });

  let currentState = 'q0';

  function updateToggleButtonUI(isRunning){
    const btn = document.getElementById('toggleRunBtn');
    const labelSpan = btn.querySelector('span');
    const icon = document.getElementById('toggleRunIcon');
    if (isRunning) {
      btn.classList.remove('btn-primary');
      btn.classList.add('btn-danger');
      labelSpan.textContent = 'Arrêter le script';
      icon.src = 'img/stop-sign.svg';
      icon.alt = 'Stop';
    } else {
      btn.classList.remove('btn-danger');
      btn.classList.add('btn-primary');
      labelSpan.textContent = 'Lancer le script';
      icon.src = 'img/green_flag.svg';
      icon.alt = 'Start';
    }
  }

  function step(){
  if (!Array.isArray(window.tapeStates)) { stopExecution(); return; }

  const headIndex = ((currentPosition + 8) % N + N) % N;
  const raw = window.tapeStates[headIndex];
  const symbol = (raw === 0 || raw === 1) ? String(raw) : (raw === 'b' ? 'b' : String(raw));

  const st = states.find(s => s.id === currentState);
  if (!st) { stopExecution(); return; }

  if (!currentRule) {
    const rule = st.rules.find(r => r.read === symbol);
    if (!rule) { stopExecution(true); return; }
    currentRule = rule;
    execPhase = "state";
    executing.state = currentState;
    executing.read  = symbol;
    render();
    return;
  }


  if (execPhase === "state") {
    execPhase = "read";
  } else if (execPhase === "read") {
    execPhase = "write";
  } else if (execPhase === "write") {
    if (currentRule.write) {
      if (currentRule.write === 'b') window.tapeStates[headIndex] = 'b';
      else if (currentRule.write === '0') window.tapeStates[headIndex] = 0;
      else if (currentRule.write === '1') window.tapeStates[headIndex] = 1;
    }
    execPhase = "move";
  }
  else if (execPhase === "move") {
    if (currentRule.move === 'L') {
      rotationOffset -= (2 * Math.PI / N);
      snapCurrentPosition();
    } else if (currentRule.move === 'R') {
      rotationOffset += (2 * Math.PI / N);
      snapCurrentPosition();
    }
    execPhase = "next";
  }
  else if (execPhase === "next") {
    if (currentRule.next === 'STOP') { stopExecution(true); return; }
    if (currentRule.next) currentState = currentRule.next;

    currentRule = null;
    execPhase = null;
    executing = { state: null, read: null };
  }

  render();
}

  function startExecution(){
  if (window.isRunning) return;

  if (window.isPaused) {
    window.isRunning = true;
    window.isPaused = false;
    updateToggleButtonUI(true);
    const sel = document.getElementById('speedSel');
    const period = sel ? parseInt(sel.value, 10) : 500;
    execInterval = setInterval(step, period);
    return;
  }

  currentState = (states.find(s => s.id === 'q0') ? 'q0' : (states[0] ? states[0].id : 'q0'));

  currentRule = null;
  execPhase = null;
  executing = { state: null, read: null };

  window.isRunning = true;
  window.isPaused  = false;
  updateToggleButtonUI(true);

  const sel = document.getElementById('speedSel');
  const period = sel ? parseInt(sel.value, 10) : 500;
  execInterval = setInterval(step, period);
}

function stopExecution(isFinal=false){
  if (!window.isRunning && !window.isPaused) { 
    updateToggleButtonUI(false); 
    return; 
  }

  if (execInterval) { clearInterval(execInterval); execInterval = null; }

  if (isFinal) {
    window.isRunning = false;
    window.isPaused  = false;
    currentRule = null;
    execPhase   = null;
    executing   = { state: null, read: null };
  } else {
    window.isRunning = false;
    window.isPaused  = true;
  }

  updateToggleButtonUI(false);
  render();
}
  window.startExecution = startExecution;
  window.stopExecution = stopExecution;

})();
  
(function () {
  const btn = document.getElementById('toggleRunBtn');
  new Image().src = 'img/stop-sign.svg';

  btn.addEventListener('click', () => {
    if (window.isRunning) {
      window.stopExecution();
    } else {
      window.startExecution();
    }
  });
})();

const canvas = document.getElementById("scene");
const ctx = canvas.getContext("2d");
resize();
window.addEventListener("resize", resize);

function resize() {
  const rightPanel = document.querySelector('.right-panel');
  canvas.width = rightPanel.offsetWidth;
  canvas.height = rightPanel.offsetHeight;
}

const N = 32;
const rx = 200;
const ry = 80;
const barHeight = 35;

if (!Array.isArray(window.tapeStates)) {
  window.tapeStates = Array(N).fill("b");
  window.tapeStates[4] = 0;
  window.tapeStates[8] = 1;
  window.tapeStates[12] = 1;
  window.tapeStates[16] = 0;
}

let rotationOffset = 0; 
let currentPosition = 0;
let isDragging = false;
let lastX = 0;
let velocity = 0;
const friction = 0.90;
const sensitivity = 0.006;

canvas.addEventListener("mousedown", e => { isDragging = true; lastX = e.clientX; });
canvas.addEventListener("mousemove", e => {
  if (!isDragging) return;
  const deltaX = e.clientX - lastX;
  lastX = e.clientX;
  rotationOffset -= deltaX * sensitivity;
  velocity = -deltaX * sensitivity;
});
canvas.addEventListener("mouseup", e => { isDragging = false; });
canvas.addEventListener("mouseleave", e => { isDragging = false; });

canvas.addEventListener("touchstart", e => { isDragging = true; lastX = e.touches[0].clientX; });
canvas.addEventListener("touchmove", e => {
  if (!isDragging) return;
  const deltaX = e.touches[0].clientX - lastX;
  lastX = e.touches[0].clientX;
  rotationOffset -= deltaX * sensitivity;
  velocity = -deltaX * sensitivity;
});
canvas.addEventListener("touchend", e => { isDragging = false; });

function draw() {
  ctx.clearRect(0,0,canvas.width,canvas.height);
  const cx = canvas.width/2;
  const cy = canvas.height/2 - 50;

  if (!isDragging) {
    rotationOffset += velocity;
    velocity *= friction;
    if (Math.abs(velocity) < 0.0003) {
      velocity = 0;
      const targetIndex = Math.round(-rotationOffset / (2 * Math.PI) * N);
      rotationOffset = -targetIndex * (2 * Math.PI / N);
    }
  }

  currentPosition = Math.round(-rotationOffset / (2 * Math.PI) * N) % N;
  if (currentPosition < 0) currentPosition += N;

  ctx.save();
  ctx.fillStyle = "rgba(120,120,120,0.08)";
  ctx.strokeStyle = "rgba(120,120,120,0.3)";
  ctx.beginPath();
  ctx.ellipse(cx,cy,rx,ry,0,0,2*Math.PI);
  ctx.fill();
  ctx.stroke();
  ctx.restore();

  const bars = [];
  for (let i = 0; i < N; i++) {
    const a = (i/N) * 2 * Math.PI + rotationOffset;
    const baseX = cx + rx * Math.cos(a);
    const baseY = cy + ry * Math.sin(a);
    const depth = Math.sin(a);
    bars.push({ index: i, baseX, baseY, depth });
  }
  bars.sort((a,b)=>a.depth-b.depth);

  for (const bar of bars) {
    const scale = 0.6 + 0.4 * (bar.depth +1)/2;
    const alpha = 0.5 + 0.5 * (bar.depth +1)/2;
    const state = window.tapeStates[bar.index % window.tapeStates.length];
    let offset = 0, color = "#777";
    if (state===1){ offset=4; color="#2c5f9c"; }   
    else if (state===0){ offset=20; color="#b87b3a"; } 
    else if (state==="b"){ offset=0; color="#999"; }

    ctx.save();
    ctx.translate(bar.baseX, bar.baseY);
    ctx.scale(scale, scale);
    ctx.fillStyle = color;
    ctx.globalAlpha = alpha;
    ctx.beginPath();
    if (state==="b"){ ctx.globalAlpha*=0.3; ctx.roundRect(-2, offset, 4, -barHeight*0.6, 2);} else { ctx.roundRect(-4, offset, 8, -barHeight, 3); }
    ctx.fill();
    ctx.restore();
  }

  ctx.save();
  ctx.translate(cx, cy - ry + 80);
  ctx.fillStyle = "#222";
  ctx.strokeStyle = "#444";
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.moveTo(0,20);
  ctx.lineTo(-15,-20);
  ctx.lineTo(15,-20);
  ctx.closePath();
  ctx.fill();
  ctx.stroke();

  ctx.fillStyle = "#f8f9f8";
  ctx.strokeStyle = "#444";
  ctx.lineWidth = 1.5;
  ctx.beginPath();
  ctx.roundRect(-25,-60,50,30,6);
  ctx.fill();
  ctx.stroke();

  ctx.fillStyle = "#222";
  ctx.font = "16px monospace";
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  const currentValue = window.tapeStates[(currentPosition + 8) % N]; 
  ctx.fillText(`${currentValue}`,0,-45);

  ctx.strokeStyle = "rgba(68,68,68,0.5)";
  ctx.lineWidth = 1;
  ctx.setLineDash([5,5]);
  ctx.beginPath();
  ctx.moveTo(0,20);
  ctx.lineTo(0, ry + 30);
  ctx.stroke();
  ctx.setLineDash([]);

  ctx.restore();
  requestAnimationFrame(draw);
}

draw();

function snapCurrentPosition() {
  const targetIndex = Math.round(-rotationOffset / (2 * Math.PI) * N);
  rotationOffset = -targetIndex * (2 * Math.PI / N);
}

document.getElementById("rightBtn").addEventListener("click", () => { rotationOffset += (2 * Math.PI / N); snapCurrentPosition(); });
document.getElementById("leftBtn").addEventListener("click", () => { rotationOffset -= (2 * Math.PI / N); snapCurrentPosition(); });
document.getElementById("write0Btn").addEventListener("click", () => { window.tapeStates[(currentPosition + 8) % N] = 0; });
document.getElementById("write1Btn").addEventListener("click", () => { window.tapeStates[(currentPosition + 8) % N] = 1; });
document.getElementById("writeBlankBtn").addEventListener("click", () => { window.tapeStates[(currentPosition + 8) % N] = "b"; });
