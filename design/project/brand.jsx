// Shared brand mark — renders the AI 问书 sheet, cropped to the icon-only area on the left.
// Source SVG viewBox: 0 0 2328 764. Icon occupies the leftmost ~764 (roughly square).
const BRAND_SHEET_W = 2328;
const BRAND_SHEET_H = 764;
const BRAND_ICON_W  = 760;   // crop window width in source units

function BrandMark({ size = 40, mono = false }) {
  // Show only the left square (icon) by overscaling the full sheet inside a clipped box.
  const scale = size / BRAND_ICON_W;          // px per source unit at icon area
  const sheetW = BRAND_SHEET_W * scale;       // total rendered width of full sheet
  const sheetH = BRAND_SHEET_H * scale;
  // Vertically the icon sits centered in the 764 box → shift to align centre at our box centre.
  return (
    <div style={{
      width: size, height: size, overflow: 'hidden', position: 'relative',
      display: 'inline-block', lineHeight: 0, flexShrink: 0,
    }}>
      <img
        src="brand-logo.svg"
        alt="AI 问书"
        draggable={false}
        style={{
          width: sheetW, height: sheetH, display: 'block',
          // mono mode → crush colors to pure black; bg remains transparent
          filter: mono ? 'brightness(0)' : undefined,
        }}
      />
    </div>
  );
}

// Bg-tinted brand chip (for compact dark-plate avatar use)
function BrandChip({ size = 40, plate = '#0a0a0a', radius = 10, invert = true }) {
  return (
    <div style={{
      width: size, height: size, borderRadius: radius, background: plate,
      display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
      overflow: 'hidden', flexShrink: 0,
    }}>
      <BrandMark size={Math.round(size * 0.74)} mono={invert} />
      {/* invert white-on-dark via mix-blend + filter — simpler: add a top filter when on dark plate */}
    </div>
  );
}

Object.assign(window, { BrandMark, BrandChip });
