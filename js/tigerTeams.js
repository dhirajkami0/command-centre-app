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
        SBMT: Object.freeze({letter: 'M', color: '#0D9488', role: 'TIGER MONITORING', tooltip: 'Tiger Monitoring'}),
        STPF: Object.freeze({letter: 'S', color: '#F59E0B', role: 'TIGER PROTECTION', tooltip: 'Tiger Protection'}),
        RRT: Object.freeze({letter: 'R', color: '#DC3545', role: 'HUMAN–ANIMAL CONFLICT RESPONSE', tooltip: 'Human–Animal Conflict Response'})
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
    function getTigerTeamIcon(type){
        const category = categories[type];
        if(!category) return null;
        if(!icons.has(type)) icons.set(type, w.L.divIcon({
            className: 'btr-tiger-team-icon', iconSize: [30, 30], iconAnchor: [15, 15],
            html: `<div aria-hidden="true" style="width:30px;height:30px;box-sizing:border-box;border:2px solid white;border-radius:50%;background:${category.color};color:white;font:700 20px/26px Arial,sans-serif;text-align:center;box-shadow:0 0 0 2px rgba(255,255,255,.22),0 2px 4px rgba(0,0,0,.35)">${category.letter}</div>`
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
            const opacity = freshness === 'OFFLINE' ? '0.35' : freshness === 'STALE' ? '0.55' : '1';
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
