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

// 常用格式
export const ACCEPT = {
  image: 'image/png,image/jpeg,image/gif,image/jpg',
  audio: 'audio/*',
  video: 'video/*',
  doc: '.doc,.docx,.pdf',
  cert: '.pem',
  cover: 'image/png,image/jpeg,image/jpg',
};
