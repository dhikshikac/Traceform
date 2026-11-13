/* "Prompt this part" for the text-style, component/photo-style and spacing-step panels.

   The token panel's prompt (wirePrompt in 40-app.js) changes one token value. These
   panels edit several fields at once, so here a prompt fills the panel's fields as a
   draft: the Preview shows the suggestion live (26-preview-extras.js), and Apply or
   Cancel decides, exactly as if the designer had typed the values.

   With an AI provider, the model gets the research context, the current values and
   each field's allowed range, and answers in JSON. Offline, plain words work:
   bigger / smaller, bolder / lighter, tighter / looser, rounder / sharper, more /
   less space, and "why". */

/* fields: [{ id, k, label, min, max, opts }] where id is the input's element id. */
function wireStylePrompt(r, scope, fields, ctx) {
  if (pScope !== scope) { pTurns = []; pScope = scope; }
  const out = $("#pOut", r), form = $("#pForm", r); if (!out || !form) return;
  const note = form.parentElement && $(".note", form.parentElement);
  if (note) note.textContent = sample ? "Describe the change you want. The suggestion shows in the preview; Apply to keep it or Cancel to drop it."
    : "Offline, try words like bigger, smaller, bolder, lighter, tighter, looser, rounder or sharper, or ask why. Connect an AI provider for anything else.";
  const inp = $("#pIn", r); if (inp) inp.placeholder = "e.g. “make this easier to read” · “why this?”";
  out.innerHTML = pTurns.map(t => `<div class="msg ${t.role === "user" ? "me" : ""}">${esc(t.content)}</div>`).join("");
  const cur = () => Object.fromEntries(fields.map(f => [f.k, $("#" + f.id, r) ? $("#" + f.id, r).value : ""]));
  const fill = vals => {
    let n = 0;
    fields.forEach(f => {
      if (!(f.k in vals)) return; const el = $("#" + f.id, r); if (!el) return;
      let v = vals[f.k];
      if (f.opts) { const o = f.opts.find(x => String(x).toLowerCase() === String(v).toLowerCase()); if (o == null) return; v = o; }
      else { v = +v; if (!Number.isFinite(v)) return; v = Math.min(f.max, Math.max(f.min, Math.round(v * 100) / 100)); }
      if (String(el.value) !== String(v)) { el.value = v; n++; }
    });
    if (n) { const fm = $("form.sys-editor", r); fm && fm.dispatchEvent(new Event("input", { bubbles: true })); if (fields[0] && fields[0].id === "scVal") $("#scVal", r).oninput && $("#scVal", r).oninput(); }
    return n;
  };
  form.onsubmit = async e => {
    e.preventDefault(); if (pBusy) return;
    const q = $("#pIn", r).value.trim(); if (!q) return; $("#pIn", r).value = "";
    pTurns.push({ role: "user", content: q });
    out.insertAdjacentHTML("beforeend", `<div class="msg me">${esc(q)}</div><div class="msg" id="pPending">Thinking…</div>`); out.scrollTop = out.scrollHeight; pBusy = true;
    let text;
    try {
      if (sample) {
        const spec = fields.map(f => f.opts ? `${f.k} (${f.label}): one of ${f.opts.join(", ")}` : `${f.k} (${f.label}): number from ${f.min} to ${f.max}`).join("\n");
        const res = await sample.json(`${RULES}\n\nCONTEXT:\n${ctxSummary()}\n\nSELECTED: ${ctx}\nCURRENT VALUES: ${JSON.stringify(cur())}\nFIELDS YOU MAY SET:\n${spec}\n\nREQUEST: ${q}\n\nIf the request asks for a change, choose new values that do what it asks and still fit the research. If it only asks a question, answer it and set no values. Reply with only a JSON object {"values": {<field>: <value>}, "say": "<one or two plain sentences: what you changed and why, or the answer>"}.`);
        const vals = res && res.values && typeof res.values === "object" ? res.values : {};
        const n = fill(vals);
        text = String((res && res.say) || (n ? "Suggested new values." : "No change suggested.")) + (n ? " Shown in the preview; Apply to keep it or Cancel to drop it." : "");
      } else {
        text = styleOfflineEdit(q, fields, cur(), fill, ctx);
      }
    } catch (err) { text = err && err.text || "Couldn't reach the AI. Try again, or edit the fields directly."; }
    pTurns.push({ role: "assistant", content: text });
    const p = $("#pPending"); if (p) { p.id = ""; p.textContent = text; }
    pBusy = false; const o2 = $("#pOut"); if (o2) o2.scrollTop = o2.scrollHeight;
  };
}

/* Offline: plain words nudge the fields that exist on this panel. */
function styleOfflineEdit(q, fields, cur, fill, ctx) {
  const t = q.toLowerCase(), has = k => fields.some(f => f.k === k), num = k => +cur[k];
  if (/\bwhy\b/.test(t)) { const w = String(ctx).split("Why: ").pop(); return w && w !== "no explanation" ? w : "No reason was recorded for this one yet."; }
  const v = {};
  const up = /bigger|larger|more prominent|stand out|bolder|heavier|rounder|softer|more space|roomier|airier|looser|taller|wider|more padding|easier to read/.test(t);
  const down = /smaller|less prominent|subtler|lighter|thinner|sharper|square|less space|tighter|denser|compact|shorter|narrower|less padding/.test(t);
  if (/bigger|larger|more prominent|stand out|easier to read/.test(t)) { if (has("size")) v.size = Math.round(num("size") * 1.15); if (has("fs")) v.fs = num("fs") + 1; if (has("h")) v.h = num("h") + 4; }
  if (/smaller|less prominent|subtler/.test(t)) { if (has("size")) v.size = Math.round(num("size") * 0.87); if (has("fs")) v.fs = num("fs") - 1; if (has("h")) v.h = num("h") - 4; }
  if (/bolder|heavier|stand out/.test(t) && has("w")) v.w = Math.min(800, num("w") + 100);
  if (/\blighter\b|thinner/.test(t) && has("w")) v.w = Math.max(300, num("w") - 100);
  if (/easier to read|airier|looser|more space|roomier/.test(t)) { if (has("lh")) v.lh = Math.round((num("lh") + 0.1) * 100) / 100; if (has("pad")) v.pad = num("pad") + 4; if (has("px")) v.px = num("px") + 4; if (has("val") && fields[0].label === "Space") v.val = Math.round(num("val") * 1.25); }
  if (/tighter|denser|compact|less space/.test(t)) { if (has("lh")) v.lh = Math.round((num("lh") - 0.1) * 100) / 100; if (has("tr")) v.tr = Math.round((num("tr") - 0.3) * 10) / 10; if (has("pad")) v.pad = num("pad") - 4; if (has("px")) v.px = num("px") - 4; if (has("val") && fields[0].label === "Space") v.val = Math.round(num("val") * 0.8); }
  if (/rounder|softer|friendlier|friendly/.test(t)) { if (has("r")) v.r = Math.max(4, Math.round(num("r") * 1.5 + 2)); if (has("val") && fields[0].label === "Radius") v.val = Math.round(num("val") * 1.5 + 2); }
  if (/sharper|square|crisp/.test(t)) { if (has("r")) v.r = 0; if (has("val") && fields[0].label === "Radius") v.val = 0; }
  if (/friendlier|friendly|warmer/.test(t) && has("w") && !("w" in v)) v.w = Math.max(400, num("w") - 100);
  const n = fill(v);
  if (n) return "Suggested a change. It's shown in the preview: Apply to keep it or Cancel to drop it.";
  return up || down ? "That's already at its limit here." : "Offline, try words like bigger, smaller, bolder, lighter, tighter, looser, rounder, sharper, or ask why. Connect an AI provider for anything else.";
}
