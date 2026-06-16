// 真实调起本地文件选择（带格式限制）。演示用：返回选中文件名。
export function pickFile(accept: string, onPick?: (name: string) => void) {
  const inp = document.createElement('input');
  inp.type = 'file';
  inp.accept = accept;
  inp.style.display = 'none';
  inp.onchange = () => {
    const f = inp.files && inp.files[0];
    if (f) onPick?.(f.name);
    inp.remove();
  };
  document.body.appendChild(inp);
  inp.click();
}

// 0613-2：上传图片并用 canvas 真实智能取色 —— 取像素主色 + 次色（供机构品牌外观）
const toHex = (r: number, g: number, b: number) =>
  '#' + [r, g, b].map((v) => Math.max(0, Math.min(255, Math.round(v))).toString(16).padStart(2, '0')).join('').toUpperCase();

export function pickImageColor(onColors: (primary: string, secondary: string, name: string) => void) {
  const inp = document.createElement('input');
  inp.type = 'file';
  inp.accept = ACCEPT.image;
  inp.style.display = 'none';
  inp.onchange = () => {
    const f = inp.files && inp.files[0];
    if (!f) { inp.remove(); return; }
    const url = URL.createObjectURL(f);
    const img = new Image();
    img.onload = () => {
      const S = 48;
      const c = document.createElement('canvas');
      c.width = S; c.height = S;
      const ctx = c.getContext('2d');
      if (!ctx) { URL.revokeObjectURL(url); inp.remove(); return; }
      ctx.drawImage(img, 0, 0, S, S);
      const px = ctx.getImageData(0, 0, S, S).data;
      // 按色相分 12 桶，跳过透明 / 近白 / 近黑 / 低饱和像素，累计像素量与 rgb 均值
      const buckets = Array.from({ length: 12 }, () => ({ n: 0, r: 0, g: 0, b: 0 }));
      let anyN = 0, anyR = 0, anyG = 0, anyB = 0;
      for (let i = 0; i < px.length; i += 4) {
        const r = px[i], g = px[i + 1], b = px[i + 2], a = px[i + 3];
        if (a < 128) continue;
        anyN++; anyR += r; anyG += g; anyB += b;
        const mx = Math.max(r, g, b), mn = Math.min(r, g, b);
        if (mx > 240 && mn > 230) continue; // 近白
        if (mx < 24) continue;              // 近黑
        if (mx - mn < 28) continue;         // 低饱和（灰）
        // 计算色相
        let h = 0;
        const d = mx - mn;
        if (mx === r) h = ((g - b) / d) % 6;
        else if (mx === g) h = (b - r) / d + 2;
        else h = (r - g) / d + 4;
        h = (h * 60 + 360) % 360;
        const bk = buckets[Math.floor(h / 30) % 12];
        bk.n++; bk.r += r; bk.g += g; bk.b += b;
      }
      const sorted = buckets.filter((x) => x.n > 0).sort((a, b2) => b2.n - a.n);
      let primary: string, secondary: string;
      if (sorted.length === 0) {
        // 纯灰度图：用整体均值作主色，次色取其加深
        const ar = anyR / Math.max(1, anyN), ag = anyG / Math.max(1, anyN), ab = anyB / Math.max(1, anyN);
        primary = toHex(ar, ag, ab);
        secondary = toHex(ar * 0.65, ag * 0.65, ab * 0.65);
      } else {
        const p = sorted[0];
        primary = toHex(p.r / p.n, p.g / p.n, p.b / p.n);
        const s = sorted[1] ?? sorted[0];
        secondary = sorted[1]
          ? toHex(s.r / s.n, s.g / s.n, s.b / s.n)
          : toHex((p.r / p.n) * 0.7 + 40, (p.g / p.n) * 0.7 + 20, (p.b / p.n) * 0.7 + 70); // 单色图：主色偏移派生次色
      }
      URL.revokeObjectURL(url);
      onColors(primary, secondary, f.name);
    };
    img.onerror = () => { URL.revokeObjectURL(url); };
    img.src = url;
    inp.remove();
  };
  document.body.appendChild(inp);
  inp.click();
}

// 常用格式
export const ACCEPT = {
  image: 'image/png,image/jpeg,image/gif,image/jpg',
  audio: 'audio/*',
  video: 'video/*',
  doc: '.doc,.docx,.pdf',
  cert: '.pem',
  cover: 'image/png,image/jpeg,image/jpg',
};
