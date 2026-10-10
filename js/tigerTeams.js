/* Office Order 56 presentation only. Exact identities verified against the local staff export.
 * Unresolved manual-review pairs and the shared AJAY CHHETRI candidate are not assigned.
 * Sanjib Kharia is assigned exclusively to SBMT-1. No remote data access.
 */
(function (w) {
    'use strict';
    const roster = {
    "TINKU MAHATO": {
        "type": "RRT",
        "team": "RRT-1",
        "documentId": "TINKU MAHATO"
    },
    "AMIT BANERJEE": {
        "type": "RRT",
        "team": "RRT-1",
        "documentId": "AMIT BANERJEE"
    },
    "TAPAN BARMAN": {
        "type": "RRT",
        "team": "RRT-1",
        "documentId": "TAPAN BARMAN"
    },
    "AJAY LAMA": {
        "type": "RRT",
        "team": "RRT-1",
        "documentId": "AJAY LAMA"
    },
    "JOGESWAR ROY": {
        "type": "RRT",
        "team": "RRT-2",
        "documentId": "JOGESWAR ROY"
    },
    "HIRO RAVA": {
        "type": "RRT",
        "team": "RRT-2",
        "documentId": "HIRO RAVA"
    },
    "DEBDULAL SARKAR": {
        "type": "RRT",
        "team": "RRT-2",
        "documentId": "DEBDULAL SARKAR"
    },
    "ABUL KALAM AZAD": {
        "type": "RRT",
        "team": "RRT-2",
        "documentId": "ABUL KALAM AZAD"
    },
    "PRADIP NARJINARY": {
        "type": "RRT",
        "team": "RRT-2",
        "documentId": "PRADIP NARJINARY"
    },
    "RAJESH TUDU": {
        "type": "RRT",
        "team": "RRT-2",
        "documentId": "RAJESH TUDU"
    },
    "MAN BAHADUR CHHETRI": {
        "type": "RRT",
        "team": "RRT-3",
        "documentId": "MAN BAHADUR CHHETRI"
    },
    "KAPIL CHHETRI": {
        "type": "RRT",
        "team": "RRT-3",
        "documentId": "KAPIL CHHETRI"
    },
    "MITALIB MIYA": {
        "type": "RRT",
        "team": "RRT-3",
        "documentId": "MITALIB MIYA"
    },
    "PARIMOL BISWAS": {
        "type": "RRT",
        "team": "RRT-3",
        "documentId": "PARIMOL BISWAS"
    },
    "KRISHNA THAKUR": {
        "type": "RRT",
        "team": "RRT-3",
        "documentId": "KRISHNA THAKUR"
    },
    "PRADYUT DUTTA": {
        "type": "RRT",
        "team": "RRT-4",
        "documentId": "PRADYUT DUTTA"
    },
    "NIRMAL CHETRI": {
        "type": "RRT",
        "team": "RRT-4",
        "documentId": "NIRMAL CHETRI"
    },
    "SANJAY LAMA": {
        "type": "RRT",
        "team": "RRT-4",
        "documentId": "SANJAY LAMA"
    },
    "ABHISHEK THAKUR": {
        "type": "RRT",
        "team": "RRT-4",
        "documentId": "ABHISHEK THAKUR"
    },
    "DIPSON RAVA": {
        "type": "RRT",
        "team": "RRT-4",
        "documentId": "DIPSON RAVA"
    },
    "BIKASH SHIDDA": {
        "type": "RRT",
        "team": "RRT-4",
        "documentId": "BIKASH SHIDDA"
    },
    "JAYANTA SARKAR": {
        "type": "STPF",
        "team": "STPF-1",
        "documentId": "JAYANTA SARKAR"
    },
    "UTTAM ROY": {
        "type": "STPF",
        "team": "STPF-1",
        "documentId": "UTTAM ROY"
    },
    "SURAJ MINJ": {
        "type": "STPF",
        "team": "STPF-1",
        "documentId": "SURAJ MINJ"
    },
    "SHIVPARSAD THAKUR": {
        "type": "STPF",
        "team": "STPF-1",
        "documentId": "SHIVPARSAD THAKUR"
    },
    "BABUL THAKUR": {
        "type": "STPF",
        "team": "STPF-2",
        "documentId": "BABUL THAKUR"
    },
    "AKASH MUNDA": {
        "type": "STPF",
        "team": "STPF-2",
        "documentId": "AKASH MUNDA"
    },
    "SONU LIMBOO": {
        "type": "STPF",
        "team": "STPF-2",
        "documentId": "SONU LIMBOO"
    },
    "PALASH MARAK": {
        "type": "STPF",
        "team": "STPF-2",
        "documentId": "PALASH MARAK"
    },
    "SAHED ALI": {
        "type": "STPF",
        "team": "STPF-2",
        "documentId": "SAHED ALI"
    },
    "PRATAP MANDAL": {
        "type": "STPF",
        "team": "STPF-3",
        "documentId": "PRATAP MANDAL"
    },
    "NARAYAN BISWAS": {
        "type": "STPF",
        "team": "STPF-3",
        "documentId": "NARAYAN BISWAS"
    },
    "AJIT DAS": {
        "type": "STPF",
        "team": "STPF-3",
        "documentId": "AJIT DAS"
    },
    "GEORGE LAKRA": {
        "type": "STPF",
        "team": "STPF-3",
        "documentId": "GEORGE LAKRA"
    },
    "PITHOR RAVA": {
        "type": "STPF",
        "team": "STPF-3",
        "documentId": "PITHOR RAVA"
    },
    "JINDA RAVA": {
        "type": "STPF",
        "team": "STPF-4",
        "documentId": "JINDA RAVA"
    },
    "NILKUSH MARAK": {
        "type": "STPF",
        "team": "STPF-4",
        "documentId": "NILKUSH MARAK-DL"
    },
    "DHIRAJ BASUMATA": {
        "type": "STPF",
        "team": "STPF-4",
        "documentId": "DHIRAJ BASUMATA"
    },
    "JER RAVA": {
        "type": "STPF",
        "team": "STPF-4",
        "documentId": "JER RAVA"
    },
    "SUMAN THAPA": {
        "type": "SBMT",
        "team": "SBMT-1",
        "documentId": "SUMAN THAPA"
    },
    "HARADHAN GUHAROY": {
        "type": "SBMT",
        "team": "SBMT-1",
        "documentId": "HARADHAN GUHAROY"
    },
    "ALDRIN KHARIA": {
        "type": "SBMT",
        "team": "SBMT-1",
        "documentId": "ALDRIN KHARIA"
    },
    "SAJEN SUNAR": {
        "type": "SBMT",
        "team": "SBMT-1",
        "documentId": "SAJEN SUNAR"
    },
"SEKENDAR RABHA": {
        "type": "SBMT",
        "team": "SBMT-2",
        "documentId": "SEKENDAR RABHA"
    },

    "SANJIB KHARIA": {
        "type": "SBMT",
        "team": "SBMT-1",
        "documentId": "SANJIB KHARIA"
    },
    "RAHIBUL MIYA": {
        "type": "SBMT",
        "team": "SBMT-1",
        "documentId": "RAHIBUL MIYA"
    },
    "ARSAD ALI": {
        "type": "SBMT",
        "team": "SBMT-2",
        "documentId": "ARSAD ALI"
    },
 "SURESH RAVA": {
        "type": "SBMT",
        "team": "SBMT-2",
        "documentId": "SURESH RAVA"
    },

    "RAJ MANGAR": {
        "type": "SBMT",
        "team": "SBMT-2",
        "documentId": "RAJ MANGAR"
    },
    "LACHCHU RAI": {
        "type": "SBMT",
        "team": "SBMT-2",
        "documentId": "LACHCHU RAI"
    },
    "SACHIN CHHETRI": {
        "type": "SBMT",
        "team": "SBMT-2",
        "documentId": "SACHIN CHHETRI"
    },
    "BEJOY THAPA": {
        "type": "STPF",
        "team": "STPF-4",
        "documentId": "BEJOY THAPA"
    },
    "BIJAY LAL": {
        "type": "STPF",
        "team": "STPF-4",
        "documentId": "BIJAY LAL"
    },
    "SINDUR RAVA": {
        "type": "SBMT",
        "team": "SBMT-2",
        "documentId": "SINDUR RAVA"
    }
};
    const categories = Object.freeze({
        SBMT: Object.freeze({letter: 'M', color: '#0284C7', role: 'TIGER MONITORING', tooltip: 'Tiger Monitoring'}),
        STPF: Object.freeze({letter: 'S', color: '#166534', role: 'TIGER PROTECTION', tooltip: 'Tiger Protection'}),
        RRT: Object.freeze({letter: 'R', color: '#F59E0B', role: 'HUMAN–ANIMAL CONFLICT RESPONSE', tooltip: 'Human–Animal Conflict Response'})
    });
    const assignments = new Map(Object.entries(roster).map(([key, value]) => [key, Object.freeze({...value, ...categories[value.type]})]));
    const icons = new Map();
    const escape = value => String(value).replace(/[&<>"']/g, char => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[char]));
    function getTigerTeamForStaff(identity){
        // cleanName is the stored identity, never a display-name/fuzzy matching fallback.
        const key = typeof identity === 'string' ? identity : identity?.cleanName;
        if(typeof key !== 'string') return null;
        const team = assignments.get(key.trim().toUpperCase());
        if(!team) return null;
        if(typeof identity === 'object' && identity.documentId != null && String(identity.documentId) !== team.documentId) return null;
        return team;
    }
    // Compact, ID-free operational symbols. Cached once per existing team category.
    const symbols = Object.freeze({
        SBMT: '<g data-symbol="telemetry" fill="none" stroke="white" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"><path d="M12 8v10m-3 0h6M12 11l-3 7m3-7 3 7"/><circle cx="12" cy="7" r="1" fill="white"/><path d="M8.5 5a5 5 0 0 0 0 5m7-5a5 5 0 0 1 0 5M6 3a8 8 0 0 0 0 9m12-9a8 8 0 0 1 0 9"/></g>',
        STPF: '<g data-symbol="tiger-paw" fill="white"><ellipse data-pad="toe" cx="6.7" cy="9.3" rx="1.6" ry="2.1" transform="rotate(-25 6.7 9.3)"/><ellipse data-pad="toe" cx="10.2" cy="7.5" rx="1.6" ry="2.1"/><ellipse data-pad="toe" cx="13.8" cy="7.5" rx="1.6" ry="2.1"/><ellipse data-pad="toe" cx="17.3" cy="9.3" rx="1.6" ry="2.1" transform="rotate(25 17.3 9.3)"/><path data-pad="central" d="M8 13c1-1 2-2 4-2s3 1 4 2c1 1 2 3 1 4-1 2-3 0-5 0s-4 2-5 0c-1-1 0-3 1-4z"/></g>',
        RRT: '<path data-symbol="response-bolt" fill="white" d="M13 4 7 13h4l-1 7 7-11h-4z"/>'
    });
    function getTigerTeamIcon(type){
        const category = categories[type];
        if(!category) return null;
        const markerColor = {SBMT: "#FF00FF", STPF: "#39FF14", RRT: "#FF6B00"}[type]; // Marker presentation only; team metadata unchanged.
        if(!icons.has(type)) icons.set(type, w.L.divIcon({
            className: 'btr-tiger-team-icon', iconSize: [30, 30], iconAnchor: [15, 15],
            html: `<div class="btr-team-wrap" aria-hidden="true" style="--btr-team-color:${markerColor}"><div class="btr-team-body${type === 'SBMT' ? ' btr-team-monitoring' : type === 'STPF' ? ' btr-team-stpf' : ' btr-team-rrt'}"><svg class="btr-team-symbol" viewBox="0 0 24 24" preserveAspectRatio="none" focusable="false" aria-hidden="true"><path d="M1 1h22v10c0 6-6 10-11 12C7 21 1 17 1 11z" fill="${markerColor}" stroke="white" stroke-width="1" stroke-linejoin="round"/>${symbols[type]}</svg></div></div>`
        }));
        return icons.get(type);
    }
    function activeTeam(staff){ return staff?.dutyActive === true ? getTigerTeamForStaff(staff) : null; }
    function iconForStaff(staff){ const team = activeTeam(staff); return team ? getTigerTeamIcon(team.type) : null; }
    function present(marker, staff, freshness){
        const team = activeTeam(staff);
        if(!team){
            if(marker.__tigerTeamTooltip){ marker.unbindTooltip(); delete marker.__tigerTeamTooltip; }
            return;
        }
        const label = `${team.team} | ${team.tooltip} | ${staff.name || staff.cleanName}`;
        if(marker.__tigerTeamTooltip !== label){
            marker.bindTooltip(escape(label), {direction: 'top', interactive: false});
            marker.__tigerTeamTooltip = label;
        }
        const element = marker.getElement?.();
        if(element){
            if(element.getAttribute?.('aria-label') !== label) element.setAttribute('aria-label', label);
            const opacity = '1'; // Team visibility stays bright; GPS freshness remains in popup data.
            if(element.style.opacity !== opacity) element.style.opacity = opacity;
        }
    }
    function popupRow(staff){
        const team = activeTeam(staff);
        if(!team) return '';
        return `<div data-staff-field="tigerTeam" style="margin-bottom:8px;padding:6px;border-left:3px solid ${team.color};font-size:11px;line-height:1.4;overflow-wrap:normal"><b>${team.type} — ${team.role}</b><div>TEAM: <b>${team.team}</b></div><div>ROLE: ${team.role}</div></div>`;
    }
    w.TigerTeams = Object.freeze({getTigerTeamForStaff, getTigerTeamIcon, activeTeam, iconForStaff, present, popupRow});
})(window);
