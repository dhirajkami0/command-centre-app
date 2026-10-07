/* DOM layout only. Existing Leaflet, monthly, compass and Offence handlers remain owners. */
(function (w, d) {
    'use strict';
    function install() {
        const map = d.getElementById('map'), controls = map?.querySelector('.leaflet-control-container');
        if (!controls || map.querySelector('.btr-map-control-rail')) return;
        const rail = d.createElement('div'); rail.className = 'btr-map-control-rail';
        const action = d.createElement('div'); action.className = 'btr-map-operational-action';
        map.append(rail,action);
        w.L.DomEvent.disableClickPropagation(rail);
        w.L.DomEvent.disableScrollPropagation(rail);
        w.L.DomEvent.disableClickPropagation(action);
        let layers, monthly;
        function collapseMonthly() {
            if (monthly && !monthly.classList.contains('collapsed')) w.toggleMonthlyStatusCard();
        }
        function collapseLayers() {
            if (layers?.classList.contains('leaflet-control-layers-expanded')) w.layerControl.collapse();
        }
        function adopt() {
            for (const selector of ['.leaflet-control-zoom','#tacticalCompass','.leaflet-control-layers','#monthlyStatusCard']) {
                const node = d.querySelector(selector);
                if (!node) continue;
                if (node.parentNode !== rail) rail.appendChild(node);
                if (selector === '.leaflet-control-layers') layers = node;
                if (selector === '#monthlyStatusCard' && monthly !== node) {
                    monthly = node;
                    collapseMonthly();
                }
            }
            const button = d.getElementById('gg-offence-main-button');
            if (button && button.parentNode !== action) {
                button.setAttribute('aria-label','OFFENCE'); button.title='OFFENCE';
                const symbol = button.querySelector('span'); if (symbol) symbol.textContent='⚖';
                action.appendChild(button); // Move the same button; retain its existing click listener.
            }
        }
        new MutationObserver(records => {
            // Only the existing control corners can introduce/recreate rail controls.
            if (records.some(record=>[...record.addedNodes].some(node=>node.nodeType===1 &&
                (node.matches('.leaflet-control-zoom,.leaflet-control-layers,#monthlyStatusCard') ||
                node.querySelector('.leaflet-control-zoom,.leaflet-control-layers,#monthlyStatusCard'))))) adopt();
        }).observe(controls,{childList:true,subtree:true});
        new MutationObserver(records => {
            if (records.some(record=>[...record.addedNodes].some(node=>node.id==='gg-offence-main-button'))) adopt();
        }).observe(d.body,{childList:true});
        new MutationObserver(records => {
            // The latest opening wins if both native controls change within one event turn.
            const opened = records.filter(record=>record.target===layers || record.target===monthly)
                .filter(record=>record.target===layers ? layers.classList.contains('leaflet-control-layers-expanded') : !monthly.classList.contains('collapsed')).at(-1);
            if (opened?.target===layers) collapseMonthly();
            else if (opened?.target===monthly) collapseLayers();
        }).observe(rail,{attributes:true,attributeFilter:['class'],subtree:true});
        adopt();
    }
    if (d.readyState==='loading') d.addEventListener('DOMContentLoaded',install,{once:true}); else install();
})(window,document);
