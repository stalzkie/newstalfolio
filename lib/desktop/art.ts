/* ─────────────────────────────────────────────────────────────────────
   Generated SVG art, dock/spotlight glyphs, and award medals.

   The art doubles as the image placeholder: any project without an
   `imageUrl` renders its `art` key instead, so no slot is ever empty.
   ───────────────────────────────────────────────────────────────────── */

const W = "rgba(255,255,255,";
const ACC = "#7cb9ff";
const RED = "#ff6b6b";
const GRN = "#6ee29a";

function svg(inner: string): string {
  return '<svg viewBox="0 0 240 120" fill="none" aria-hidden="true">' + inner + "</svg>";
}

export function art(kind: string): string {
  switch (kind) {
    case "graph": {
      const n: [number, number][] = [[30, 60], [80, 30], [80, 90], [135, 45], [135, 95], [190, 30], [200, 80]];
      const e: [number, number][] = [[0, 1], [0, 2], [1, 3], [2, 3], [2, 4], [3, 5], [3, 6], [4, 6]];
      let s = e
        .map((x) => {
          const a = n[x[0]];
          const b = n[x[1]];
          const hot = x[1] === 3 || x[0] === 3;
          return (
            '<line x1="' + a[0] + '" y1="' + a[1] + '" x2="' + b[0] + '" y2="' + b[1] +
            '" stroke="' + (hot ? RED : W + ".4)") + '" stroke-width="' + (hot ? 2 : 1.5) + '"/>'
          );
        })
        .join("");
      s += n
        .map((p, i) =>
          i === 3
            ? '<circle cx="' + p[0] + '" cy="' + p[1] + '" r="14" stroke="' + RED +
              '" stroke-opacity=".5" stroke-width="2"><animate attributeName="r" values="10;17;10" dur="2.4s" repeatCount="indefinite"/></circle><circle cx="' +
              p[0] + '" cy="' + p[1] + '" r="8" fill="' + RED + '"/>'
            : '<circle cx="' + p[0] + '" cy="' + p[1] + '" r="7" fill="' + W + '.9)"/>'
        )
        .join("");
      return svg(s);
    }
    case "shield":
      return svg(
        '<rect x="20" y="16" width="200" height="88" rx="8" stroke="' + W + '.35)"/><text x="34" y="40" font-family="monospace" font-size="11" fill="' + W + '.85)">$ git commit</text><text x="34" y="60" font-family="monospace" font-size="11" fill="' + GRN + '">✓ regex  ✓ coreml</text><text x="34" y="80" font-family="monospace" font-size="11" fill="' + RED + '">✕ blocked: AWS key</text><path d="M184 36l18 7v14c0 12-8 20-18 24-10-4-18-12-18-24V43z" fill="' + ACC + '" fill-opacity=".3" stroke="' + ACC + '" stroke-width="2"/>'
      );
    case "align": {
      let s2 = "";
      for (let i = 0; i < 5; i++) {
        const y = 22 + i * 19;
        const y2 = 22 + ((i + 2) % 5) * 19;
        s2 +=
          '<rect x="24" y="' + y + '" width="' + (60 + ((i * 37) % 40)) + '" height="9" rx="4" fill="' + W + '.8)"/><rect x="150" y="' + y2 + '" width="' + (50 + ((i * 23) % 40)) + '" height="9" rx="4" fill="' + ACC + '"/>';
        if (i !== 3)
          s2 +=
            '<line x1="' + (84 + ((i * 37) % 40)) + '" y1="' + (y + 4.5) + '" x2="150" y2="' + (y2 + 4.5) + '" stroke="' + W + '.4)" stroke-dasharray="3 3"/>';
      }
      return svg(s2);
    }
    case "phone":
      return svg(
        '<rect x="88" y="6" width="64" height="108" rx="12" stroke="' + W + '.85)" stroke-width="2"/><rect x="98" y="22" width="44" height="18" rx="4" fill="' + ACC + '"/><rect x="98" y="46" width="44" height="18" rx="4" fill="' + W + '.5)"/><rect x="98" y="70" width="44" height="18" rx="4" fill="' + W + '.3)"/><text x="160" y="35" font-family="monospace" font-size="10" fill="' + GRN + '">match score</text><text x="160" y="59" font-family="monospace" font-size="10" fill="' + W + '.7)">roadmap</text>'
      );
    case "lots": {
      let s3 = "";
      for (let r = 0; r < 4; r++)
        for (let c = 0; c < 9; c++) {
          const k = (r * 9 + c) % 7;
          const f = k === 0 ? ACC : k === 3 ? RED : W + ".25)";
          s3 +=
            '<rect x="' + (18 + c * 23) + '" y="' + (14 + r * 24) + '" width="19" height="20" rx="2" fill="' + f + '" stroke="' + W + '.5)"/>';
        }
      return svg(s3);
    }
    case "chat":
      return svg(
        '<rect x="24" y="16" width="120" height="30" rx="14" fill="' + W + '.85)"/><rect x="96" y="54" width="120" height="30" rx="14" fill="' + ACC + '"/><rect x="24" y="90" width="80" height="20" rx="10" fill="' + W + '.5)"/>'
      );
    case "scan":
      return svg(
        '<rect x="30" y="14" width="180" height="92" rx="8" stroke="' + W + '.5)"/><line x1="30" y1="34" x2="210" y2="34" stroke="' + W + '.3)"/><rect x="44" y="46" width="70" height="8" rx="4" fill="' + W + '.6)"/><rect x="44" y="62" width="110" height="8" rx="4" fill="' + W + '.35)"/><rect x="44" y="78" width="90" height="8" rx="4" fill="' + W + '.35)"/><line x1="30" y1="70" x2="210" y2="70" stroke="' + ACC + '" stroke-width="2"><animate attributeName="y1" values="40;100;40" dur="3s" repeatCount="indefinite"/><animate attributeName="y2" values="40;100;40" dur="3s" repeatCount="indefinite"/></line>'
      );
    case "edu":
      return svg(
        '<path d="M120 18l70 28-70 28-70-28z" stroke="' + W + '.85)" stroke-width="2" fill="' + ACC + '" fill-opacity=".25"/><path d="M82 62v22c0 8 17 16 38 16s38-8 38-16V62" stroke="' + W + '.7)" stroke-width="2"/><line x1="190" y1="46" x2="190" y2="80" stroke="' + ACC + '" stroke-width="2"/><circle cx="190" cy="84" r="4" fill="' + ACC + '"/>'
      );
    case "menu":
      return svg(
        '<rect x="70" y="10" width="100" height="100" rx="8" stroke="' + W + '.6)"/><circle cx="120" cy="34" r="12" stroke="' + ACC + '" stroke-width="2"/><rect x="86" y="56" width="68" height="6" rx="3" fill="' + W + '.7)"/><rect x="86" y="70" width="52" height="6" rx="3" fill="' + W + '.4)"/><rect x="86" y="84" width="60" height="6" rx="3" fill="' + W + '.4)"/>'
      );
    case "euclid":
      return svg(
        '<circle cx="120" cy="60" r="44" stroke="' + W + '.4)"/><path d="M120 16L158 82H82z" stroke="' + ACC + '" stroke-width="2"/><circle cx="120" cy="16" r="4" fill="' + W + '.9)"/><circle cx="158" cy="82" r="4" fill="' + W + '.9)"/><circle cx="82" cy="82" r="4" fill="' + W + '.9)"/>'
      );
    case "spend":
      return svg(
        '<rect x="88" y="6" width="64" height="108" rx="12" stroke="' + W + '.85)" stroke-width="2"/><rect x="100" y="70" width="8" height="30" rx="2" fill="' + W + '.5)"/><rect x="112" y="56" width="8" height="44" rx="2" fill="' + W + '.5)"/><rect x="124" y="44" width="8" height="56" rx="2" fill="' + ACC + '"/><rect x="136" y="62" width="8" height="38" rx="2" fill="' + W + '.5)"/><text x="98" y="32" font-family="monospace" font-size="10" fill="' + W + '.85)">$ this month</text>'
      );
    default:
      return svg(
        '<rect x="30" y="14" width="180" height="92" rx="8" stroke="' + W + '.5)"/><circle cx="42" cy="25" r="3" fill="' + W + '.6)"/><circle cx="52" cy="25" r="3" fill="' + W + '.6)"/><line x1="30" y1="36" x2="210" y2="36" stroke="' + W + '.3)"/><rect x="44" y="48" width="80" height="44" rx="4" fill="' + ACC + '" fill-opacity=".5"/><rect x="134" y="48" width="62" height="8" rx="4" fill="' + W + '.6)"/><rect x="134" y="64" width="50" height="8" rx="4" fill="' + W + '.35)"/><rect x="134" y="80" width="56" height="8" rx="4" fill="' + W + '.35)"/>'
      );
  }
}

const GLYPH: Record<string, string> = {
  home: '<path d="M3 11l9-7 9 7v9a1 1 0 0 1-1 1h-5v-6H9v6H4a1 1 0 0 1-1-1z"/>',
  about: '<circle cx="12" cy="8" r="4"/><path d="M4 21c1.5-4 4.5-6 8-6s6.5 2 8 6"/>',
  systems: '<rect x="3" y="4" width="18" height="16" rx="3"/><path d="M3 9h18M8 14l-2 2 2 2M16 14l2 2-2 2"/>',
  ai: '<path d="M12 3l1.9 5.1L19 10l-5.1 1.9L12 17l-1.9-5.1L5 10l5.1-1.9z"/><path d="M19 15l.8 2.2L22 18l-2.2.8L19 21l-.8-2.2L16 18l2.2-.8z"/>',
  ventures: '<path d="M12 2c3 2 5 6 5 10l-2 4H9l-2-4c0-4 2-8 5-10z"/><circle cx="12" cy="10" r="2"/><path d="M9 16l-3 4M15 16l3 4"/>',
  writing: '<path d="M4 20h4L19 9l-4-4L4 16z"/><path d="M14 6l4 4"/>',
  work: '<rect x="3" y="7" width="18" height="13" rx="2"/><path d="M8 7V5a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2M3 13h18"/>',
  search: '<circle cx="11" cy="11" r="6"/><path d="M16 16l5 5"/>',
  github: '<path d="M9 19c-4 1.5-4-2-6-2.5M15 21v-3.5c0-1 .1-1.4-.5-2 2.8-.3 5.5-1.4 5.5-6a4.6 4.6 0 0 0-1.3-3.2 4.2 4.2 0 0 0-.1-3.2s-1.1-.3-3.5 1.3a12 12 0 0 0-6.2 0C6.5 2.8 5.4 3.1 5.4 3.1a4.2 4.2 0 0 0-.1 3.2A4.6 4.6 0 0 0 4 9.5c0 4.6 2.7 5.7 5.5 6-.6.6-.6 1.2-.5 2V21"/>',
};

export function glyph(k: string): string {
  return (
    '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">' +
    (GLYPH[k] || GLYPH.systems) +
    "</svg>"
  );
}

const TILE: Record<string, string> = {
  home: "t7", about: "t5", systems: "t1", ai: "t4",
  ventures: "t3", writing: "t2", work: "t6", search: "t7", github: "t7",
};

export function tileBg(k: string): string {
  const t = TILE[k] || "t1";
  return "background:linear-gradient(180deg, var(--" + t + "a), var(--" + t + "b))";
}

export function medal(kind: string): string {
  return kind === "feature"
    ? '<svg class="medal" viewBox="0 0 48 48" fill="none" aria-hidden="true"><rect x="6" y="10" width="36" height="28" rx="6" stroke="currentColor" stroke-width="2.4"/><path d="M14 20h20M14 27h12" stroke="currentColor" stroke-width="2.4" stroke-linecap="round"/><circle cx="37" cy="11" r="6" fill="var(--bad)"/></svg>'
    : '<svg class="medal" viewBox="0 0 48 48" aria-hidden="true"><path d="M16 4h6l4 12h-6zM32 4h-6l-4 12h6z" fill="var(--accent)"/><circle cx="24" cy="30" r="13" fill="var(--gold)"/><circle cx="24" cy="30" r="9" fill="none" stroke="#fff" stroke-opacity=".6" stroke-width="1.5"/><path d="M24 24l1.8 3.7 4 .6-2.9 2.8.7 4L24 33.2l-3.6 1.9.7-4-2.9-2.8 4-.6z" fill="#fff"/></svg>';
}
