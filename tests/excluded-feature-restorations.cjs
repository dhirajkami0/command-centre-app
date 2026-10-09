const assert=require('node:assert/strict');
function restoreElephantLayerChanges(source){
    for(const {before, after} of [...require('./elephant-layer-patch.json')].reverse()){
        if(source.includes(after)){
            assert.equal(source.split(after).length, 2, 'Unique reviewed elephant lifecycle change');
            source = source.replace(after, before);
        }
    }
    return source;
}
const guard = '  if (!BTR_MONTHLY_HEATMAP_ENABLED) { clearMonthlyHeatmap(); return false; }\n';
const flag = '// Temporary display-only switch; analytics and stored grid data stay active.\nconst BTR_MONTHLY_HEATMAP_ENABLED = false;\n\n';
const startup = "// Restore this UI by enabling the display switch above.\nconst monthlyHeatmapButton = document.getElementById('heatmapBtn');\nif (monthlyHeatmapButton) monthlyHeatmapButton.style.display = BTR_MONTHLY_HEATMAP_ENABLED ? 'flex' : 'none';\nif (!BTR_MONTHLY_HEATMAP_ENABLED) clearMonthlyHeatmap();\n\n";
function restoreHeatmapChanges(html) {
    let source = html.replace(/\r\n/g, '\n');
    if (!source.includes(flag)) return source;
    assert.equal(source.split(flag).length, 2);
    assert.equal(source.split(startup).length, 2);
    assert.equal(source.split(guard).length, 4);
    source = source.replace(flag, '').replace(startup, '').split(guard).join('');
    const button = /(<button\s+id="heatmapBtn"[\s\S]*?style="[\s\S]*?)display:none;/;
    assert.match(source, button);
    return source.replace(button, '$1display:flex;');
}
module.exports={restoreElephantLayerChanges,restoreHeatmapChanges};
