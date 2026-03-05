import React, { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';

// Pre-computed so values don't change on re-render
const CONFETTI = Array.from({ length: 50 }, (_, i) => ({
  id: i,
  left:     `${(i * 2.1) % 100}%`,
  delay:    `${((i * 0.19) % 3).toFixed(2)}s`,
  duration: `${(2.8 + (i * 0.23) % 1.8).toFixed(2)}s`,
  color:    ['#F9A8C0','#D8B4FE','#FFD4B8','#4ade80','#60a5fa','#fbbf24','#f87171','#a78bfa','#34d399','#fb923c'][i % 10],
  size:     `${8 + (i % 6) * 2}px`,
  round:    i % 3 !== 0,
}));

const IMAGE_CATEGORIES = [
  {
    label: 'Dogs',
    emoji: '🐶',
    images: [
      { src: '/images/jigsaw/dogs/photo-1.jpg', label: 'Photo 1' },
      { src: '/images/jigsaw/dogs/photo-2.jpg', label: 'Photo 2' },
      { src: '/images/jigsaw/dogs/photo-3.jpg', label: 'Photo 3' },
      { src: '/images/jigsaw/dogs/photo-4.jpg', label: 'Photo 4' },
      { src: '/images/jigsaw/dogs/photo-5.jpg', label: 'Photo 5' },
      { src: '/images/jigsaw/dogs/photo-6.jpg', label: 'Photo 6' },
    ],
  },
  {
    label: 'Gardens',
    emoji: '🌷',
    images: [
      { src: '/images/jigsaw/gardens/photo-1.jpg', label: 'Photo 1' },
      { src: '/images/jigsaw/gardens/photo-2.jpg', label: 'Photo 2' },
      { src: '/images/jigsaw/gardens/photo-3.jpg', label: 'Photo 3' },
      { src: '/images/jigsaw/gardens/photo-4.jpg', label: 'Photo 4' },
      { src: '/images/jigsaw/gardens/photo-5.jpg', label: 'Photo 5' },
      { src: '/images/jigsaw/gardens/photo-6.jpg', label: 'Photo 6' },
    ],
  },
  {
    label: 'Art',
    emoji: '🎨',
    images: [
      { src: '/images/jigsaw/art/photo-1.jpg', label: 'Photo 1' },
      { src: '/images/jigsaw/art/photo-2.jpg', label: 'Photo 2' },
      { src: '/images/jigsaw/art/photo-3.jpg', label: 'Photo 3' },
      { src: '/images/jigsaw/art/photo-4.jpg', label: 'Photo 4' },
      { src: '/images/jigsaw/art/photo-5.jpg', label: 'Photo 5' },
      { src: '/images/jigsaw/art/photo-6.jpg', label: 'Photo 6' },
    ],
  },
  {
    label: '1960s',
    emoji: '🕰️',
    images: [
      { src: '/images/jigsaw/1960s/photo-1.jpg', label: 'Photo 1' },
      { src: '/images/jigsaw/1960s/photo-2.jpg', label: 'Photo 2' },
      { src: '/images/jigsaw/1960s/photo-3.jpg', label: 'Photo 3' },
      { src: '/images/jigsaw/1960s/photo-4.jpg', label: 'Photo 4' },
      { src: '/images/jigsaw/1960s/photo-5.jpg', label: 'Photo 5' },
      { src: '/images/jigsaw/1960s/photo-6.jpg', label: 'Photo 6' },
    ],
  },
  {
    label: '1970s',
    emoji: '✌️',
    images: [
      { src: '/images/jigsaw/1970s/photo-1.jpg', label: 'Photo 1' },
      { src: '/images/jigsaw/1970s/photo-2.jpg', label: 'Photo 2' },
      { src: '/images/jigsaw/1970s/photo-3.jpg', label: 'Photo 3' },
      { src: '/images/jigsaw/1970s/photo-4.jpg', label: 'Photo 4' },
      { src: '/images/jigsaw/1970s/photo-5.jpg', label: 'Photo 5' },
      { src: '/images/jigsaw/1970s/photo-6.jpg', label: 'Photo 6' },
    ],
  },
];

const PUZZLE_IMAGES = IMAGE_CATEGORIES.flatMap(c => c.images);

const DIFFICULTIES = [
  { value: 'easy',   label: 'Easy',   cols: 4, rows: 4, description: '16 pieces' },
  { value: 'medium', label: 'Medium', cols: 6, rows: 6, description: '36 pieces' },
  { value: 'hard',   label: 'Hard',   cols: 8, rows: 8, description: '64 pieces' },
];

const UPLOAD_TAB = 'upload';

// ─────────────────────────────────────────────────────────────────────────────
// Canvas puzzle engine
// Returns a cleanup function. Pass (canvas, HTMLImageElement, cols, rows, cbs).
// ─────────────────────────────────────────────────────────────────────────────
function startPuzzleEngine(canvas, sourceImg, cols, rows, { onWin, onProgress, onSnap }) {
  const ctx       = canvas.getContext('2d');
  const container = canvas.parentElement;

  // Constants
  const SNAP_THRESHOLD = 25;
  const SCALE_DRAG     = 1.03;
  const EASE_MS        = 180;
  const MARGIN         = 40;
  const HEAD_HW        = 0.20;
  const NECK_HW        = 0.08;
  const BEZ_K          = 0.5523;

  // Mutable engine state
  let pieces    = [];
  let groups    = new Map();
  let nextGid   = 0;
  let drag      = null;
  let snapAnims = [];
  let rafId     = null;
  let cancelled = false;
  let winFired  = false;

  // Audio (lazy — created on first pointer interaction)
  let audioCtx = null;
  function ensureAudio() {
    if (!audioCtx) {
      try { audioCtx = new (window.AudioContext || window.webkitAudioContext)(); } catch (_) {}
    }
    if (audioCtx && audioCtx.state === 'suspended') audioCtx.resume();
  }
  function playClick() {
    if (!audioCtx) return;
    try {
      const now  = audioCtx.currentTime;
      const osc  = audioCtx.createOscillator();
      const gain = audioCtx.createGain();
      osc.connect(gain);
      gain.connect(audioCtx.destination);
      osc.frequency.setValueAtTime(900, now);
      osc.frequency.exponentialRampToValueAtTime(250, now + 0.07);
      gain.gain.setValueAtTime(0.25, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.1);
      osc.start(now);
      osc.stop(now + 0.12);
    } catch (_) {}
  }

  // Background texture
  const bgPattern = (() => {
    const size = 256;
    const oc   = document.createElement('canvas');
    oc.width = oc.height = size;
    const octx = oc.getContext('2d');
    const id   = octx.createImageData(size, size);
    const d    = id.data;
    for (let i = 0; i < d.length; i += 4) {
      const v = 128 + Math.floor(Math.random() * 22 - 11);
      d[i] = d[i + 1] = d[i + 2] = v;
      d[i + 3] = 255;
    }
    octx.putImageData(id, 0, 0);
    return ctx.createPattern(oc, 'repeat');
  })();

  // Canvas sizing
  function resizeCanvas() {
    canvas.width  = container.clientWidth;
    canvas.height = container.clientHeight;
  }
  resizeCanvas();
  const ro = new ResizeObserver(() => { resizeCanvas(); if (!rafId) draw(); });
  ro.observe(container);

  // ── Edge metadata ───────────────────────────────────────────────────────────
  function makeEdgeMeta(maxDepth) {
    const type   = Math.random() < 0.5 ? 1 : -1;
    const depth  = Math.min(0.28 + Math.random() * 0.12, maxDepth);
    const center = 0.5 + (Math.random() - 0.5) * 0.20;
    const waveL  = (Math.random() - 0.5) * 0.10;
    const waveR  = (Math.random() - 0.5) * 0.10;
    return { type, depth, center, waveL, waveR };
  }
  function complementEdge(e) {
    return { type: -e.type, depth: e.depth, center: 1 - e.center,
             waveL: -e.waveR, waveR: -e.waveL };
  }
  function buildEdgeArrays(numCols, numRows, cw, ch, r) {
    const dH   = Math.max(cw - 2 * r, 1);
    const dV   = Math.max(ch - 2 * r, 1);
    const capH = (0.40 * ch) / dH;
    const capV = (0.40 * cw) / dV;
    const h = Array.from({ length: numRows - 1 }, () =>
      Array.from({ length: numCols }, () => makeEdgeMeta(capH)));
    const v = Array.from({ length: numRows }, () =>
      Array.from({ length: numCols - 1 }, () => makeEdgeMeta(capV)));
    return { h, v };
  }

  // ── Path generation ─────────────────────────────────────────────────────────
  function pathEdge(path, x1, y1, x2, y2, edgeMeta) {
    if (!edgeMeta) { path.lineTo(x2, y2); return; }
    const { type, depth, center: c, waveL, waveR } = edgeMeta;
    const dx = x2 - x1, dy = y2 - y1;
    const d  = Math.hypot(dx, dy);
    const tx = dx / d, ty = dy / d;
    const nx = ty,     ny = -tx; // eslint-disable-line no-unused-vars

    const dep     = type * depth * d;
    const neckDep = type * (depth - HEAD_HW) * d;
    const tNL     = c - NECK_HW;
    const tNR     = c + NECK_HW;
    const tHL     = c - HEAD_HW;
    const tHR     = c + HEAD_HW;
    const pt      = (t, s) => [x1 + tx * d * t + nx * s, y1 + ty * d * t + ny * s];

    path.quadraticCurveTo(...pt(tNL / 2, waveL * d * 2), ...pt(tNL, 0));
    path.bezierCurveTo(
      ...pt(tNL, neckDep / 3),
      ...pt(tHL, 2 * neckDep / 3),
      ...pt(tHL, neckDep),
    );
    path.bezierCurveTo(
      ...pt(tHL, neckDep + (dep - neckDep) * BEZ_K),
      ...pt(c - HEAD_HW * BEZ_K, dep),
      ...pt(c, dep),
    );
    path.bezierCurveTo(
      ...pt(c + HEAD_HW * BEZ_K, dep),
      ...pt(tHR, neckDep + (dep - neckDep) * BEZ_K),
      ...pt(tHR, neckDep),
    );
    path.bezierCurveTo(
      ...pt(tHR, 2 * neckDep / 3),
      ...pt(tNR, neckDep / 3),
      ...pt(tNR, 0),
    );
    path.quadraticCurveTo(...pt(tNR + (1 - tNR) / 2, waveR * d * 2), x2, y2);
  }

  function buildLocalPath(pad, cw, ch, edges, r) {
    const path = new Path2D();
    const x0 = pad, y0 = pad, x1 = pad + cw, y1 = pad + ch;
    path.moveTo(x0 + r, y0);
    pathEdge(path, x0 + r, y0,   x1 - r, y0,   edges.top);
    path.arcTo(x1, y0, x1, y0 + r, r);
    pathEdge(path, x1,     y0 + r, x1,     y1 - r, edges.right);
    path.arcTo(x1, y1, x1 - r, y1, r);
    pathEdge(path, x1 - r, y1,   x0 + r, y1,   edges.bottom);
    path.arcTo(x0, y1, x0, y1 - r, r);
    pathEdge(path, x0,     y1 - r, x0,     y0 + r, edges.left);
    path.arcTo(x0, y0, x0 + r, y0, r);
    path.closePath();
    return path;
  }

  // ── Bitmap generation (offscreen, once per piece) ───────────────────────────
  async function generatePieceBitmap(piece, img) {
    const { cw, ch, pad, path: localPath, srcX, srcY, srcW, srcH } = piece;
    const bw = cw + 2 * pad;
    const bh = ch + 2 * pad;

    let offscreen;
    if (typeof OffscreenCanvas !== 'undefined') {
      offscreen = new OffscreenCanvas(bw, bh);
    } else {
      offscreen = document.createElement('canvas');
      offscreen.width  = bw;
      offscreen.height = bh;
    }
    const octx   = offscreen.getContext('2d');
    const padSrc = pad * srcW / cw;
    const exSrcX = srcX - padSrc;
    const exSrcY = srcY - padSrc;
    const exSrcW = srcW + padSrc * 2;
    const exSrcH = srcH + padSrc * 2;

    octx.save();
    octx.clip(localPath);
    octx.drawImage(img, exSrcX, exSrcY, exSrcW, exSrcH, 0, 0, bw, bh);
    octx.strokeStyle = 'rgba(0,0,0,0.25)';
    octx.lineWidth   = 4;
    octx.stroke(localPath);
    octx.restore();

    octx.strokeStyle = 'rgba(255,255,255,0.2)';
    octx.lineWidth   = 1;
    octx.stroke(localPath);

    if (offscreen instanceof OffscreenCanvas) return offscreen.transferToImageBitmap();
    return createImageBitmap(offscreen);
  }

  // ── Group helpers ───────────────────────────────────────────────────────────
  function getGroupPieces(gid) {
    const ids = groups.get(gid);
    return ids ? pieces.filter(p => ids.has(p.id)) : [];
  }
  function mergeGroups(gidA, gidB) {
    if (gidA === gidB) return;
    const setA = groups.get(gidA);
    const setB = groups.get(gidB);
    if (!setA || !setB) return;
    for (const id of setB) {
      setA.add(id);
      const p = pieces.find(q => q.id === id);
      if (p) p.groupId = gidA;
    }
    groups.delete(gidB);
  }
  function bringToFront(gid) {
    const ids = groups.get(gid);
    if (!ids) return;
    pieces = [
      ...pieces.filter(p => !ids.has(p.id)),
      ...pieces.filter(p =>  ids.has(p.id)),
    ];
  }

  // ── Hit testing ─────────────────────────────────────────────────────────────
  function hitTest(px, py) {
    for (let i = pieces.length - 1; i >= 0; i--) {
      const p = pieces[i];
      if (p.isSnapped || !p.path) continue;
      const lx = px - (p.x - p.pad);
      const ly = py - (p.y - p.pad);
      if (ctx.isPointInPath(p.path, lx, ly)) {
        if (getGroupPieces(p.groupId).some(gp => gp.isSnapped)) continue;
        return p;
      }
    }
    return null;
  }

  function canvasCoords(e) {
    const r = canvas.getBoundingClientRect();
    return [
      (e.clientX - r.left) * (canvas.width  / r.width),
      (e.clientY - r.top)  * (canvas.height / r.height),
    ];
  }

  // ── Pointer events ──────────────────────────────────────────────────────────
  function onPointerDown(e) {
    e.preventDefault();
    ensureAudio();
    canvas.setPointerCapture(e.pointerId);
    const [px, py] = canvasCoords(e);
    const hit = hitTest(px, py);
    if (!hit) return;
    const ids = groups.get(hit.groupId);
    snapAnims = snapAnims.filter(a => !ids || !ids.has(a.piece.id));
    bringToFront(hit.groupId);
    canvas.style.cursor = 'grabbing';
    drag = { groupId: hit.groupId, px, py };
  }
  function onPointerMove(e) {
    if (!drag) return;
    e.preventDefault();
    const [px, py] = canvasCoords(e);
    const dx = px - drag.px;
    const dy = py - drag.py;
    for (const p of getGroupPieces(drag.groupId)) {
      p.x += dx;
      p.y += dy;
    }
    drag.px = px;
    drag.py = py;
  }
  function onPointerUp(e) {
    if (!drag) return;
    e.preventDefault();
    canvas.style.cursor = 'grab';
    doSnapDetect(drag.groupId);
    drag = null;
  }
  function onPointerCancel() {
    drag = null;
    canvas.style.cursor = 'grab';
  }

  // ── Snap detection ──────────────────────────────────────────────────────────
  function doSnapDetect(gid) {
    const gPieces = getGroupPieces(gid);
    let snapped   = false;

    // 1. Snap to solved position
    for (const piece of gPieces) {
      const dx = piece.correctX - piece.x;
      const dy = piece.correctY - piece.y;
      if (Math.abs(dx) <= SNAP_THRESHOLD && Math.abs(dy) <= SNAP_THRESHOLD) {
        for (const gp of gPieces) {
          scheduleSnap(gp, gp.x + dx, gp.y + dy);
          gp.isSnapped = true;
        }
        snapped = true;
        break;
      }
    }

    // 2. Snap to a neighbouring piece
    if (!snapped) {
      const ids = groups.get(gid);
      outer:
      for (const piece of gPieces) {
        for (const other of pieces) {
          if (ids && ids.has(other.id)) continue;
          const dc = piece.col - other.col;
          const dr = piece.row - other.row;
          if (!((Math.abs(dc) === 1 && dr === 0) ||
                (Math.abs(dr) === 1 && dc === 0))) continue;
          const tx = other.x + dc * piece.cw;
          const ty = other.y + dr * piece.ch;
          if (Math.abs(piece.x - tx) <= SNAP_THRESHOLD &&
              Math.abs(piece.y - ty) <= SNAP_THRESHOLD) {
            const offX = tx - piece.x;
            const offY = ty - piece.y;
            for (const gp of gPieces) scheduleSnap(gp, gp.x + offX, gp.y + offY);
            mergeGroups(gid, other.groupId);
            snapped = true;
            break outer;
          }
        }
      }
    }

    if (snapped) {
      playClick();
      if (onSnap) onSnap();
      markSnappedIfAllCorrect(gid);
      updateProgress();
      checkWin();
    }
  }

  function markSnappedIfAllCorrect(gid) {
    const gPieces = getGroupPieces(gid);
    const allOk   = gPieces.every(p => {
      const anim = snapAnims.find(a => a.piece.id === p.id);
      const tx   = anim ? anim.tx : p.x;
      const ty   = anim ? anim.ty : p.y;
      return Math.abs(tx - p.correctX) < 0.5 && Math.abs(ty - p.correctY) < 0.5;
    });
    if (allOk) for (const p of gPieces) p.isSnapped = true;
  }

  // ── Snap animation ──────────────────────────────────────────────────────────
  function scheduleSnap(piece, tx, ty) {
    snapAnims = snapAnims.filter(a => a.piece.id !== piece.id);
    snapAnims.push({ piece, sx: piece.x, sy: piece.y, tx, ty, t0: performance.now() });
  }
  function easeOut(t) { return 1 - (1 - t) * (1 - t); }
  function tickAnims(now) {
    snapAnims = snapAnims.filter(a => {
      const t  = Math.min((now - a.t0) / EASE_MS, 1);
      const et = easeOut(t);
      a.piece.x = a.sx + (a.tx - a.sx) * et;
      a.piece.y = a.sy + (a.ty - a.sy) * et;
      return t < 1;
    });
  }

  // ── Progress & win ──────────────────────────────────────────────────────────
  function updateProgress() {
    const n = pieces.filter(p => p.isSnapped).length;
    if (onProgress) onProgress(`${n} / ${pieces.length} pieces`);
  }
  function checkWin() {
    if (!winFired && pieces.length && pieces.every(p => p.isSnapped)) {
      winFired = true;
      if (onWin) onWin();
    }
  }

  // ── Rendering ───────────────────────────────────────────────────────────────
  function draw() {
    ctx.fillStyle = bgPattern;
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    if (!pieces.length) return;
    const dragIds = drag ? groups.get(drag.groupId) : null;
    for (const p of pieces) {
      if (!p.bitmap) continue;
      const isDragging = !!(dragIds && dragIds.has(p.id));
      const bx = p.x - p.pad;
      const by = p.y - p.pad;
      ctx.save();
      if (isDragging) {
        ctx.shadowColor   = 'rgba(0,0,0,0.5)';
        ctx.shadowBlur    = 18;
        ctx.shadowOffsetX = 4;
        ctx.shadowOffsetY = 10;
        const cx = p.x + p.cw / 2;
        const cy = p.y + p.ch / 2;
        ctx.translate(cx, cy);
        ctx.scale(SCALE_DRAG, SCALE_DRAG);
        ctx.translate(-cx, -cy);
      }
      ctx.drawImage(p.bitmap, bx, by);
      ctx.restore();
    }
  }

  // ── RAF loop ─────────────────────────────────────────────────────────────────
  function startLoop() {
    if (rafId) return;
    function loop(now) {
      if (cancelled) return;
      tickAnims(now);
      draw();
      rafId = requestAnimationFrame(loop);
    }
    rafId = requestAnimationFrame(loop);
  }

  // ── Puzzle init ──────────────────────────────────────────────────────────────
  async function initPuzzle() {
    const W    = canvas.width;
    const H    = canvas.height;
    const imgW_nat = sourceImg.naturalWidth  || sourceImg.width;
    const imgH_nat = sourceImg.naturalHeight || sourceImg.height;

    const scale = Math.min(
      (W - MARGIN * 2) / imgW_nat,
      (H - MARGIN * 2) / imgH_nat,
      1,
    );
    const imgW   = imgW_nat * scale;
    const imgH   = imgH_nat * scale;
    const cw     = imgW / cols;
    const ch     = imgH / rows;
    const pad    = Math.ceil(Math.max(cw, ch) * 0.35);
    const cornerR = Math.round(Math.min(cw, ch) * (0.03 + Math.random() * 0.03));
    const ox     = (W - imgW) / 2;
    const oy     = (H - imgH) / 2;

    const { h, v } = buildEdgeArrays(cols, rows, cw, ch, cornerR);

    if (onProgress) onProgress('Building puzzle\u2026');

    for (let r = 0; r < rows; r++) {
      for (let c = 0; c < cols; c++) {
        const id  = r * cols + c;
        const gid = nextGid++;
        const correctX = ox + c * cw;
        const correctY = oy + r * ch;
        const x = MARGIN + Math.random() * Math.max(0, W - MARGIN * 2 - cw);
        const y = MARGIN + Math.random() * Math.max(0, H - MARGIN * 2 - ch);
        const edges = {
          top:    r > 0      ? complementEdge(h[r - 1][c]) : null,
          right:  c < cols-1 ? v[r][c]                     : null,
          bottom: r < rows-1 ? h[r][c]                     : null,
          left:   c > 0      ? complementEdge(v[r][c - 1]) : null,
        };
        const piece = {
          id, col: c, row: r,
          x, y, correctX, correctY,
          cw, ch, pad,
          srcX: (c / cols) * imgW_nat,
          srcY: (r / rows) * imgH_nat,
          srcW: imgW_nat / cols,
          srcH: imgH_nat / rows,
          edges,
          isSnapped: false,
          groupId: gid,
          path:   null,
          bitmap: null,
        };
        piece.path = buildLocalPath(pad, cw, ch, edges, cornerR);
        pieces.push(piece);
        groups.set(gid, new Set([id]));
      }
    }

    await Promise.all(pieces.map(async p => {
      if (cancelled) return;
      p.bitmap = await generatePieceBitmap(p, sourceImg);
    }));

    if (cancelled) return;
    updateProgress();
    startLoop();
  }

  // Register events and start
  canvas.addEventListener('pointerdown', onPointerDown);
  canvas.addEventListener('pointermove', onPointerMove);
  canvas.addEventListener('pointerup',   onPointerUp);
  canvas.addEventListener('pointercancel', onPointerCancel);

  initPuzzle();

  // Cleanup
  return function cleanup() {
    cancelled = true;
    canvas.removeEventListener('pointerdown', onPointerDown);
    canvas.removeEventListener('pointermove', onPointerMove);
    canvas.removeEventListener('pointerup',   onPointerUp);
    canvas.removeEventListener('pointercancel', onPointerCancel);
    ro.disconnect();
    if (rafId) { cancelAnimationFrame(rafId); rafId = null; }
    if (audioCtx) { try { audioCtx.close(); } catch (_) {} audioCtx = null; }
    for (const p of pieces) {
      if (p.bitmap && typeof p.bitmap.close === 'function') p.bitmap.close();
    }
  };
}

// ─────────────────────────────────────────────────────────────────────────────
// React component
// ─────────────────────────────────────────────────────────────────────────────
const JigsawPuzzle = () => {
  const [screen,          setScreen]          = useState('setup');
  const [activeCategory,  setActiveCategory]  = useState(0);
  const [chosenImage,     setChosenImage]      = useState(PUZZLE_IMAGES[0]);
  const [chosenDifficulty,setChosenDifficulty] = useState('easy');
  const [uploadedImage,   setUploadedImage]    = useState(null);
  const [gameImage,       setGameImage]        = useState(PUZZLE_IMAGES[0]);
  const [gameCols,        setGameCols]         = useState(4);
  const [gameRows,        setGameRows]         = useState(4);
  const [moves,           setMoves]            = useState(0);
  const [progressText,    setProgressText]     = useState('');
  const [gameKey,         setGameKey]          = useState(0);

  const canvasRef          = useRef(null);
  const engineCleanupRef   = useRef(null);
  const uploadObjectUrlRef = useRef(null);

  // Revoke object URL when component unmounts
  useEffect(() => {
    return () => {
      if (uploadObjectUrlRef.current) URL.revokeObjectURL(uploadObjectUrlRef.current);
    };
  }, []);

  // Handle image file upload on setup screen
  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    if (uploadObjectUrlRef.current) URL.revokeObjectURL(uploadObjectUrlRef.current);
    const url = URL.createObjectURL(file);
    uploadObjectUrlRef.current = url;
    const img = { src: url, label: 'Your Photo' };
    setUploadedImage(img);
    setChosenImage(img);
  };

  // Start or restart game
  const startGame = () => {
    if (!chosenImage) return;
    const diff = DIFFICULTIES.find(d => d.value === chosenDifficulty);
    setGameImage(chosenImage);
    setGameCols(diff.cols);
    setGameRows(diff.rows);
    setMoves(0);
    setProgressText('');
    setGameKey(k => k + 1);
    setScreen('game');
  };

  const restartGame = () => {
    setMoves(0);
    setProgressText('');
    setGameKey(k => k + 1);
  };

  // Canvas engine lifecycle
  useEffect(() => {
    if (screen !== 'game') return;
    const canvas = canvasRef.current;
    if (!canvas) return;

    if (engineCleanupRef.current) {
      engineCleanupRef.current();
      engineCleanupRef.current = null;
    }

    let imgLoadCancelled = false;
    const img = new Image();
    img.src = gameImage.src;
    img.onload = () => {
      if (imgLoadCancelled) return;
      const cleanup = startPuzzleEngine(canvas, img, gameCols, gameRows, {
        onWin:      () => setTimeout(() => setScreen('win'), 2500),
        onProgress: (text) => setProgressText(text),
        onSnap:     () => setMoves(m => m + 1),
      });
      engineCleanupRef.current = cleanup;
    };
    img.onerror = () => console.error('Failed to load puzzle image:', gameImage.src);

    return () => {
      imgLoadCancelled = true;
      if (engineCleanupRef.current) {
        engineCleanupRef.current();
        engineCleanupRef.current = null;
      }
    };
  }, [screen, gameImage, gameCols, gameRows, gameKey]);

  // ════════════════════════════════════════════════
  // SETUP SCREEN
  // ════════════════════════════════════════════════
  if (screen === 'setup') {
    const isUploadTab = activeCategory === UPLOAD_TAB;
    const canStart    = !!chosenImage;

    return (
      <div className="min-h-screen p-6 sm:p-12 bg-gradient-to-br from-rose-light via-warm-cream-light to-lavender-light flex flex-col items-center">
        <Helmet>
          <title>Jigsaw Puzzle - Francine's App</title>
          <meta name="description" content="Jigsaw puzzle game with schnauzer photos" />
        </Helmet>

        <header className="text-center mb-10">
          <h1 className="text-5xl sm:text-6xl font-script font-bold text-transparent bg-clip-text bg-gradient-to-r from-rose-dark via-lavender-dark to-rose-dark mb-3">
            Jigsaw Puzzle
          </h1>
          <p className="text-xl text-slate-grey">Choose a photo and difficulty, then start!</p>
        </header>

        {/* Photo selector */}
        <section className="mb-10 w-full max-w-xl">
          <h2 className="text-2xl font-display font-semibold text-charcoal text-center mb-5">
            Choose a Photo
          </h2>

          {/* Category tabs + Upload tab */}
          <div className="flex flex-wrap justify-center gap-2 mb-4">
            {IMAGE_CATEGORIES.map((cat, idx) => (
              <button
                key={cat.label}
                onClick={() => {
                  setActiveCategory(idx);
                  setChosenImage(cat.images[0]);
                }}
                className={`px-4 py-2 rounded-full text-base font-semibold transition-all duration-200 border-2 focus:outline-none
                  ${activeCategory === idx
                    ? 'bg-rose-dark text-white border-rose-dark shadow-md scale-105'
                    : 'bg-white text-charcoal border-warm-cream-dark hover:border-rose hover:scale-105'
                  }`}
              >
                {cat.emoji} {cat.label}
              </button>
            ))}
            <button
              onClick={() => setActiveCategory(UPLOAD_TAB)}
              className={`px-4 py-2 rounded-full text-base font-semibold transition-all duration-200 border-2 focus:outline-none
                ${isUploadTab
                  ? 'bg-rose-dark text-white border-rose-dark shadow-md scale-105'
                  : 'bg-white text-charcoal border-warm-cream-dark hover:border-rose hover:scale-105'
                }`}
            >
              📷 My Photo
            </button>
          </div>

          {/* Image grid or upload area */}
          {isUploadTab ? (
            <div className="flex flex-col items-center gap-4">
              {uploadedImage ? (
                <>
                  <div className={`rounded-2xl overflow-hidden border-4 shadow-xl border-rose-dark`}
                    style={{ width: 220 }}>
                    <img src={uploadedImage.src} alt="Your uploaded photo" className="w-full aspect-square object-cover" />
                  </div>
                  <label className="cursor-pointer bg-gradient-to-r from-lavender to-lavender-dark text-white font-semibold py-2 px-6 rounded-xl shadow hover:shadow-md transition-all text-base">
                    Change Photo
                    <input type="file" accept="image/*" className="hidden" onChange={handleImageUpload} />
                  </label>
                </>
              ) : (
                <label className="cursor-pointer flex flex-col items-center justify-center w-full border-4 border-dashed border-lavender rounded-2xl py-12 bg-white/50 hover:bg-white/80 transition-all gap-3">
                  <span className="text-5xl">📷</span>
                  <span className="text-lg font-semibold text-charcoal">Click to upload a photo</span>
                  <span className="text-sm text-slate-grey">Any image from your device</span>
                  <input type="file" accept="image/*" className="hidden" onChange={handleImageUpload} />
                </label>
              )}
            </div>
          ) : (
            <div className="grid grid-cols-3 gap-3 sm:gap-4">
              {IMAGE_CATEGORIES[activeCategory].images.map((img) => (
                <button
                  key={img.src}
                  onClick={() => setChosenImage(img)}
                  className={`rounded-2xl overflow-hidden border-4 transition-all duration-200 shadow-md focus:outline-none
                    ${chosenImage?.src === img.src
                      ? 'border-rose-dark shadow-xl scale-105'
                      : 'border-white hover:border-lavender hover:scale-105'
                    }`}
                >
                  <img src={img.src} alt={img.label} className="w-full aspect-square object-cover" />
                </button>
              ))}
            </div>
          )}
        </section>

        {/* Difficulty selector */}
        <section className="mb-10">
          <h2 className="text-2xl font-display font-semibold text-charcoal text-center mb-5">
            Difficulty
          </h2>
          <div className="flex gap-3 sm:gap-5">
            {DIFFICULTIES.map(({ value, label, description }) => (
              <button
                key={value}
                onClick={() => setChosenDifficulty(value)}
                className={`py-4 px-5 sm:px-7 rounded-2xl text-center transition-all duration-200 border-4 shadow-md focus:outline-none
                  ${chosenDifficulty === value
                    ? 'bg-gradient-to-br from-lavender to-lavender-dark text-white border-lavender-dark scale-105 shadow-xl'
                    : 'bg-white text-charcoal border-warm-cream-dark hover:border-lavender hover:scale-105'
                  }`}
              >
                <div className="text-2xl font-bold mb-1">{label}</div>
                <div className="text-sm opacity-80">{description}</div>
              </button>
            ))}
          </div>
        </section>

        <button
          onClick={startGame}
          disabled={!canStart}
          className={`font-bold py-5 px-16 rounded-2xl text-2xl shadow-xl transition-all duration-300 active:scale-95
            ${canStart
              ? 'bg-gradient-to-r from-rose to-rose-dark text-white hover:shadow-2xl'
              : 'bg-warm-cream-dark text-slate-grey cursor-not-allowed opacity-60'
            }`}
        >
          Start Puzzle ✿
        </button>

        <Link
          to="/"
          className="mt-8 text-slate-grey hover:text-rose-dark underline decoration-dotted transition-colors text-lg"
        >
          ← Back to Home
        </Link>
      </div>
    );
  }

  // ════════════════════════════════════════════════
  // WIN SCREEN
  // ════════════════════════════════════════════════
  if (screen === 'win') {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-rose-light via-warm-cream-light to-lavender-light text-center relative overflow-hidden p-6">
        <Helmet>
          <title>Puzzle Complete! - Francine's App</title>
        </Helmet>

        <style>{`
          @keyframes confettiFall {
            0%   { transform: translateY(-20px) rotate(0deg);   opacity: 1;   }
            100% { transform: translateY(110vh) rotate(720deg); opacity: 0.2; }
          }
          @keyframes popIn {
            0%   { transform: scale(0.4); opacity: 0; }
            70%  { transform: scale(1.06); opacity: 1; }
            100% { transform: scale(1);   opacity: 1; }
          }
        `}</style>

        <div className="fixed inset-0 pointer-events-none overflow-hidden z-0">
          {CONFETTI.map(p => (
            <div
              key={p.id}
              style={{
                position: 'absolute',
                left: p.left,
                top: '-20px',
                width: p.size,
                height: p.size,
                backgroundColor: p.color,
                borderRadius: p.round ? '50%' : '2px',
                animation: `confettiFall ${p.duration} ${p.delay} linear infinite`,
              }}
            />
          ))}
        </div>

        <div className="relative z-10 flex flex-col items-center">
          <h1 className="text-5xl sm:text-6xl font-script font-bold text-transparent bg-clip-text bg-gradient-to-r from-rose-dark to-lavender-dark mb-2">
            You did it! 🎉
          </h1>
          <p className="text-xl text-slate-grey mb-6">
            Completed in <strong>{moves}</strong> snaps
          </p>

          <img
            src={gameImage.src}
            alt="Completed puzzle"
            className="rounded-3xl shadow-2xl border-8 border-white mb-8"
            style={{
              maxWidth: 400,
              width: '90%',
              animation: 'popIn 0.7s ease-out forwards',
            }}
          />

          <div className="flex flex-col sm:flex-row gap-4">
            <button
              onClick={() => { setScreen('setup'); }}
              className="bg-gradient-to-r from-rose to-rose-dark text-white font-bold py-4 px-10 rounded-2xl text-xl shadow-xl hover:shadow-2xl transition-all active:scale-95"
            >
              Play Again
            </button>
            <Link
              to="/"
              className="bg-gradient-to-r from-slate-grey to-slate-grey-dark text-white font-bold py-4 px-10 rounded-2xl text-xl shadow-xl text-center"
            >
              Home
            </Link>
          </div>
        </div>
      </div>
    );
  }

  // ════════════════════════════════════════════════
  // GAME SCREEN
  // ════════════════════════════════════════════════
  return (
    <div className="flex flex-col" style={{ height: '100vh', overflow: 'hidden' }}>
      <Helmet>
        <title>Jigsaw Puzzle - Francine's App</title>
      </Helmet>

      {/* Header bar */}
      <div className="flex items-center justify-between gap-2 px-3 py-2 bg-gradient-to-r from-rose-light to-lavender-light border-b-2 border-lavender flex-shrink-0">
        <Link
          to="/"
          className="bg-gradient-to-r from-slate-grey to-slate-grey-dark text-white font-semibold py-2 px-4 rounded-xl shadow text-sm whitespace-nowrap"
        >
          ← Home
        </Link>

        <div className="text-center flex-1 min-w-0">
          <h1 className="text-xl sm:text-2xl font-script font-bold text-transparent bg-clip-text bg-gradient-to-r from-rose-dark to-lavender-dark leading-tight">
            Jigsaw Puzzle
          </h1>
          {progressText && (
            <p className="text-xs text-slate-grey">{progressText}</p>
          )}
        </div>

        <div className="flex gap-2 flex-shrink-0">
          <button
            onClick={restartGame}
            className="bg-gradient-to-r from-lavender to-lavender-dark text-white font-semibold py-2 px-3 rounded-xl shadow text-sm"
          >
            Restart
          </button>
          <button
            onClick={() => setScreen('setup')}
            className="bg-gradient-to-r from-peach to-peach-dark text-white font-semibold py-2 px-3 rounded-xl shadow text-sm"
          >
            New Puzzle
          </button>
        </div>
      </div>

      {/* Canvas area — fills all remaining height */}
      <div className="flex-1 relative overflow-hidden">
        <canvas
          ref={canvasRef}
          style={{
            display: 'block',
            width: '100%',
            height: '100%',
            touchAction: 'none',
            cursor: 'grab',
          }}
        />
      </div>
    </div>
  );
};

export default JigsawPuzzle;
