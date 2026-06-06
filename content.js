// --- GLOBAL STATE ---
let monitorTimeout; 
let currentOverlay = null;

function startMonitoring() {
  clearTimeout(monitorTimeout);

  if (typeof chrome === "undefined" || !chrome.runtime || !chrome.runtime.id) return;

  chrome.storage.local.get(['timeLimit', 'startTime', 'endTime', 'blockList', 'quickSites', 'alwaysActive'], (config) => {
    if (chrome.runtime.lastError || !config) return;

    const currentUrl = window.location.href.toLowerCase();
    let allBlockedDomains = [];
    if (config.blockList) allBlockedDomains = allBlockedDomains.concat(config.blockList.split(',').map(d => d.trim().toLowerCase()).filter(d => d));
    if (config.quickSites) config.quickSites.forEach(s => allBlockedDomains = allBlockedDomains.concat(s.split(',').map(d => d.trim().toLowerCase())));

    if (allBlockedDomains.length === 0 || !allBlockedDomains.some(domain => currentUrl.includes(domain))) return;

    if (!config.alwaysActive && config.startTime && config.endTime) {
      const now = new Date();
      const cur = now.getHours() * 60 + now.getMinutes(); 
      const [sh, sm] = config.startTime.split(':').map(Number);
      const [eh, em] = config.endTime.split(':').map(Number);
      if (cur < (sh * 60 + sm) || cur > (eh * 60 + em)) return;
    }

    monitorTimeout = setTimeout(() => {
      chrome.storage.local.get(['dogSelect', 'breakTimeSec'], (latest) => {
        let selection = latest.dogSelect || 'golden_stop.mp4';
        if (!selection.includes('golden') && !selection.includes('pug')) {
            selection = 'golden_stop.mp4'; 
        }
        selection = selection.replace('.webm', '.mp4');
        
        startGatekeeper(selection, Math.floor((latest.breakTimeSec || 5) * 60));
      });
    }, (config.timeLimit || 30) * 60 * 1000);
  });
}

startMonitoring();

function startGatekeeper(videoFileName, breakTimeSeconds) {
  if (document.getElementById('dog-overlay') || currentOverlay) return;

  const overlay = document.createElement('div');
  overlay.id = 'dog-overlay';
  currentOverlay = overlay;
  overlay.style.cssText = `
    position: fixed; top: 0; left: 0; width: 100vw; height: 100vh;
    background: rgba(0,0,0,0.5); backdrop-filter: blur(15px);
    z-index: 99999999; display: flex; align-items: center; justify-content: center; pointer-events: auto;
  `;

  overlay.innerHTML = `
    <div style="position: relative; width: 100%; height: 100%; pointer-events: none;">
        <div style="
            position: absolute; top: 50%; left: 30%; transform: translate(-50%, -50%);
            background: rgba(0, 0, 0, 0.85); color: white; padding: 50px; 
            border-radius: 40px; text-align: center; display: flex; flex-direction: column; 
            align-items: center; box-shadow: 0 30px 100px rgba(0,0,0,0.8);
        ">
            <span id="dog-timer-text" style="font-size: 160px; font-weight: bold; font-family: monospace; line-height: 1;">${formatTime(breakTimeSeconds)}</span>
            <div style="font-size: 24px; margin-top: 30px; letter-spacing: 5px; color: #ffcc00; font-weight: bold; font-family: Arial;">DOG STOP! STAY FOCUSED</div>
        </div>
        <canvas id="dog-canvas" style="
            position: absolute; bottom: 0; right: 0; 
            width: 48vw; height: auto; 
            filter: drop-shadow(0 0 50px rgba(0,0,0,0.5));
        "></canvas>
    </div>
  `;
  
  document.body.appendChild(overlay);
  
  document.body.style.setProperty('overflow', 'hidden', 'important');
  const lockKey = (e) => { if ([32, 37, 38, 39, 40].includes(e.keyCode)) e.preventDefault(); };
  window.addEventListener('keydown', lockKey, { capture: true });

  const video = document.createElement('video');
  video.src = chrome.runtime.getURL(`images/${videoFileName}`);
  video.muted = true; 
  video.playsInline = true;
  
  const canvas = document.getElementById('dog-canvas');
  const ctx = canvas.getContext('2d', { willReadFrequently: true });
  let animId;

  // 判斷當前係邊隻狗
  const isGolden = videoFileName.includes('golden');

  video.addEventListener('loadedmetadata', () => { 
      canvas.width = video.videoWidth; 
      canvas.height = video.videoHeight; 
  });
  video.play();

  // --- 🎨 智能分流去背邏輯 ---
  function processFrame() {
    if (video.paused || video.ended) return;
    ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
    let frame = ctx.getImageData(0, 0, canvas.width, canvas.height);
    let d = frame.data;

    for (let i = 0; i < d.length; i += 4) {
      let r = d[i], g = d[i+1], b = d[i+2];
      let minC = Math.min(r, g, b);
      let diff = Math.max(r, g, b) - minC;

      if (isGolden) {
        // 🐕 金毛犬演算法：強力消滅白邊 (Halo)
        if (minC > 235 && diff < 20) {
            d[i+3] = 0; 
        } else if (minC > 180 && diff < 40) {
            // 平滑過渡白邊，同時保護黃色實體
            let alphaWhiteness = ((235 - minC) / 55) * 255;
            let alphaColor = (diff / 40) * 255;
            d[i+3] = Math.min(d[i+3], Math.max(alphaWhiteness, alphaColor));
        }
      } else {
        // 🐶 八哥演算法：嚴格保護白毛 (防止黑點)
        if (minC > 245 && diff < 15) {
            d[i+3] = 0; // 只有極度純白嘅背景先會變透明
        } else if (minC > 225 && diff < 20) {
            // 極窄嘅羽化邊緣，確保唔會傷到心口嘅灰白毛 (220以下安全)
            let alpha = ((245 - minC) / 20) * 255;
            d[i+3] = Math.min(d[i+3], alpha);
        }
      }
    }
    
    ctx.putImageData(frame, 0, 0);
    
    if (video.currentTime >= video.duration - 0.1) { 
        video.currentTime = isGolden ? 4.0 : 0.1; 
        video.play(); 
    }
    if (document.getElementById('dog-overlay')) animId = requestAnimationFrame(processFrame);
  }

  video.addEventListener('play', () => animId = requestAnimationFrame(processFrame));

  const target = Date.now() + (breakTimeSeconds * 1000);
  const timer = setInterval(() => {
    const left = Math.max(0, Math.ceil((target - Date.now()) / 1000));
    if (document.getElementById('dog-timer-text')) document.getElementById('dog-timer-text').innerText = formatTime(left);
    
    if (left <= 0) {
      clearInterval(timer); 
      cancelAnimationFrame(animId);
      video.pause();
      overlay.remove(); 
      currentOverlay = null;
      document.body.style.removeProperty('overflow');
      window.removeEventListener('keydown', lockKey, { capture: true });
      startMonitoring(); 
    }
  }, 1000);
}

function formatTime(s) { 
    return `${Math.floor(s/60)}:${(s%60).toString().padStart(2, '0')}`; 
}