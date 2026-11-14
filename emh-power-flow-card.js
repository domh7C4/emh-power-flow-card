/**
 * EMH Power Flow Card v1.0.0 – independently installable Home Assistant Lovelace card.
 * PV top / grid left / battery right / house center, 0..6 individual tiles below.
 * Native SVG paths; requestAnimationFrame energy particles with constant traversal time.
 * (c) 2026 EMH – Effiziente Energielösungen.
 */
(() => {
  'use strict';
  const VERSION = '1.0.0';
  const CARD = 'emh-power-flow-card';
  const EDITOR = 'emh-power-flow-card-editor';
  console.info('[EMH] Power Flow v1.0.0 script start');
  if (customElements.get(CARD)) { console.warn('[EMH] Power Flow already registered; unload older resources.'); return; }
  const SVG = 'http://www.w3.org/2000/svg';
  const T = { pv:'#f5b916', grid:'#36a5f5', battery:'#50d584', home:'#18cef2', individual:'#acbac7', warning:'#f04b54' };
  const ENTITY_DEFAULTS = {
    pv:'sensor.pv_power',
    grid_mode:'separate', grid_import:'sensor.grid_import', grid_export:'sensor.grid_export',
    grid_power:'', grid_invert_sign:false,
    battery_mode:'separate', battery_charge:'sensor.battery_chargepower', battery_discharge:'sensor.battery_dischargepower',
    battery_power:'', battery_invert_sign:false,
    battery_soc:'sensor.battery_soc', home:null,
    fossil:'sensor.electricity_maps_anteil_fossiler_energietrager'
  };
  const NODES_DEFAULT = {
    pv:{name:'Photovoltaik',zero_tolerance_w:10,icon:'mdi:solar-power',popup:'#pop-up-pv',ring_entity:'sensor.pv_power',ring_max_mode:'fixed',ring_max:25000,ring_max_entity:'',ring_unit:'W',color:T.pv},
    grid:{name:'Netz',zero_tolerance_w:10,icon:'mdi:transmission-tower',popup:'#pop-up-grid',ring_entity:'sensor.grid_import',ring_max_mode:'fixed',ring_max:5000,ring_max_entity:'',ring_unit:'W',alert_entity:'sensor.grid_import',alert_threshold_mode:'fixed',alert_threshold_w:5000,alert_threshold_entity:'',alert_threshold_unit:'W',alert_from_percent:90,alert_color:T.warning,color:T.grid},
    battery:{name:'Batterie',zero_tolerance_w:10,icon:'mdi:battery',icon_style:'horizontal',popup:'#pop-up-bat',
      ring_source:'soc',use_soc_colors:true,ring_entity:'sensor.battery_soc',ring_max_mode:'fixed',ring_max:100,ring_max_entity:'',ring_unit:'%',
      power_ring_max_mode:'fixed',power_ring_max:5000,power_ring_unit:'W',power_ring_max_entity:'',power_ring_max_entity_unit:'W',
      charge_ring_color:'#17c8de',discharge_ring_color:T.battery,color:T.battery},
    home:{name:'Haus',zero_tolerance_w:10,icon:'mdi:home',popup:'/energy',color:T.home}
  };
  const IND_DEFAULT = [
    {id:'og',name:'Obergeschoss',entity:'sensor.sm2_power_total_raw',icon:'mdi:home-floor-2',popup:'#pop-up-og',secondary_mode:'text',secondary_text:'Verbrauch',secondary_show_above_enabled:false,secondary_threshold_w:500,highlight_active_enabled:false,highlight_active_color:'#50d584',include_in_home:true,deduct_from_home:false,zero_tolerance_w:10},
    {id:'ug',name:'Untergeschoss',entity:'sensor.sm1_power_no_wb',icon:'mdi:home-floor-1',popup:'#pop-up-ug',secondary_mode:'text',secondary_text:'Verbrauch',secondary_show_above_enabled:false,secondary_threshold_w:500,highlight_active_enabled:false,highlight_active_color:'#50d584',include_in_home:true,deduct_from_home:false,zero_tolerance_w:10},
    {id:'wallbox',name:'Wallbox',entity:'sensor.ev_charge_1_wb_chargepower',icon:'mdi:ev-station',popup:'#pop-up-wallbox',secondary_mode:'entity',secondary_entity:'sensor.ev_charge_1_carsoc',secondary_label:'Fahrzeug',secondary_unit:'%',secondary_show_above_enabled:false,secondary_threshold_w:500,highlight_active_enabled:false,highlight_active_color:'#50d584',include_in_home:true,deduct_from_home:false,zero_tolerance_w:10}
  ];
  const ICONS = {
    'solar-power':'<circle cx="14" cy="10" r="5"/><path d="M14 1v3M14 17v3M5 10h3M20 10h3M7 3l2 2M19 15l2 2M21 3l-2 2M9 15l-2 2M3 26h22M7 22h14M12 17l-3 9M16 17l3 9"/>',
    'transmission-tower':'<path d="M10 2h8M9 9h10M6 16h16M14 2l-10 24M14 2l10 24M7 26h14M9 9l10 7M19 9L9 16"/>',
    'battery':'<rect x="6" y="5" width="17" height="22" rx="3"/><path d="M12 2h5M12 9l-3 9h5l-1 6 6-11h-5l2-4"/>',
    'home':'<path d="M3 13L14 3l11 10M6 12v14h16V12M11 26v-9h7v9"/>',
    'home-floor-2':'<path d="M4 26V5h20v21M2 26h24M8 9h4M17 9h4M8 14h4M17 14h4M8 20h4M17 20h4"/>',
    'home-floor-1':'<path d="M3 26V5h22v21M2 26h24M8 9h5M17 9h5M8 14h5M17 14h5M12 26v-7h6v7"/>',
    'ev-station':'<path d="M6 10h16v13H6zM10 10V6h8v4M9 23v4M19 23v4M22 13l4-2v9c0 3-2 4-4 4M10 15h8M10 19h5"/>',
    'radiator':'<rect x="3" y="8" width="22" height="17" rx="3"/><path d="M8 8v17M13 8v17M18 8v17M23 8v17M7 4v4M21 4v4"/>',
    'water-boiler':'<rect x="8" y="2" width="12" height="25" rx="5"/><path d="M11 20h6M12 9c-2 3 2 4 0 7"/>',
    'heat-pump':'<circle cx="14" cy="14" r="10"/><circle cx="14" cy="14" r="2"/><path d="M14 4c5 4 0 6 0 8M24 14c-4 5-6 0-8 0M14 24c-5-4 0-6 0-8M4 14c4-5 6 0 8 0"/>',
    'power-plug':'<path d="M8 3v8M20 3v8M5 11h18v4c0 7-4 10-9 10S5 22 5 15z"/>',
    'pool':'<path d="M3 22c4-4 5 4 9 0s5 4 9 0 5 4 7 0M7 17h17M9 17V8h8"/>',
    'water':'<path d="M14 2C10 9 5 13 5 19a9 9 0 0 0 18 0c0-6-5-10-9-17z"/>',
    'lightning-bolt':'<path d="M16 2L5 16h8l-2 10 13-15h-9z"/>',
    'server':'<rect x="3" y="3" width="22" height="9" rx="2"/><rect x="3" y="16" width="22" height="9" rx="2"/><path d="M7 8h2M7 21h2M13 8h8M13 21h8"/>'
  };
  const esc=s=>String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
  const clone=o=>JSON.parse(JSON.stringify(o));
  const n=(v,f=0)=>v===null||v===undefined||v===''||!Number.isFinite(Number(v))?f:Number(v);
  const clamp=(x,a,b)=>Math.min(b,Math.max(a,x));
  const fmt=(v,d=0)=>Number.isFinite(v)?v.toLocaleString('de-AT',{minimumFractionDigits:d,maximumFractionDigits:d}):'–';
  const power=v=>!Number.isFinite(v)?'–':Math.abs(v)>=1000?`${fmt(v/1000,2)} kW`:`${fmt(Math.round(v))} W`;
  // Nulltoleranz beeinflusst die Anzeige und den Ring, niemals die Rohmessung
  // der Energiebilanz; dadurch entstehen keine künstlichen Bilanzverluste.
  const displayW=(v,threshold)=>v===null?null:Math.abs(v)<Math.max(0,n(threshold,10))?0:v;
  const socColor=soc=>!Number.isFinite(soc)?T.individual:soc<=20?'#f04b54':soc<=50?'#f2bd35':'#50d584';
  // Ringsegmente als echte SVG-Kreisbögen zeichnen statt per stroke-dasharray.
  // Das verhindert Darstellungsfehler durch pathLength-/Dashoffset-Skalierung,
  // besonders bei kleinen PV-Anteilen und großen Batterieanteilen.
  function ringArcPath(cx,cy,r,startPct,sweepPct){
    if(![cx,cy,r,startPct,sweepPct].every(Number.isFinite)||r<=0||sweepPct<=0)return '';
    const sweep=Math.min(100,sweepPct);
    const at=p=>{
      const a=(p*3.6-90)*Math.PI/180;
      return [cx+r*Math.cos(a),cy+r*Math.sin(a)];
    };
    const fmtPoint=p=>p.map(v=>v.toFixed(4)).join(' ');
    const begin=at(startPct);
    // Volle 360 Grad können nicht als einzelner SVG-A-Bogen gezeichnet werden.
    if(sweep>=99.999999){
      const opposite=at(startPct+50);
      return `M ${fmtPoint(begin)} A ${r} ${r} 0 0 1 ${fmtPoint(opposite)} A ${r} ${r} 0 0 1 ${fmtPoint(begin)}`;
    }
    const finish=at(startPct+sweep);
    return `M ${fmtPoint(begin)} A ${r} ${r} 0 ${sweep>50?1:0} 1 ${fmtPoint(finish)}`;
  }
  function homeEnergyBalance(pv,imp,exp,bc,bd,deductions){
    if(![pv,imp,exp,bc,bd].every(Number.isFinite)) return null;
    return Math.max(0,pv+imp+bd-exp-bc-Math.max(0,deductions));
  }
  const color=(v,f)=>typeof v==='string'&&/^#[0-9a-f]{6}$/i.test(v)?v:f;
  const str=v=>typeof v==='string'?v:'';
  const icon=(key)=>{
    const k=str(key).replace(/^mdi:/,'');
    return ICONS[k] ? `<g fill="none" stroke="currentColor" stroke-width="1.9" stroke-linecap="round" stroke-linejoin="round">${ICONS[k]}</g>` :
      `<foreignObject x="0" y="0" width="28" height="28"><div xmlns="http://www.w3.org/1999/xhtml" style="width:28px;height:28px;display:flex;align-items:center"><ha-icon icon="${esc(str(key)||'mdi:power-plug')}"></ha-icon></div></foreignObject>`;
  };
  function normalizeIndividuals(value){
    const seen=new Set(['pv','grid','battery','home']);
    return (Array.isArray(value)?value:IND_DEFAULT).slice(0,6).map((v,i)=>{
      if(!v||typeof v!=='object')return null;
      let id=String(v.id||`device-${i+1}`).replace(/[^a-zA-Z0-9_-]/g,'-').toLowerCase().slice(0,40)||`device-${i+1}`;
      while(seen.has(id))id+='-2';seen.add(id);
      return {...v,id,name:str(v.name)||`Verbraucher ${i+1}`};
    }).filter(Boolean);
  }
  function coreLayout(mode){
    const m=mode==='mobile';
    const width=m?500:1100, height=m?430:465;
    // Gleich großer Abstand zwischen Mittelpunkten: mobile 190 SVG-Einheiten,
    // desktop 235. Alle Leitungen werden aus den Kreisrändern abgeleitet.
    const s=m?{pv:[250,128,62],grid:[60,318,59],battery:[440,318,59],home:[250,318,75]}:
      {pv:[550,80,72],grid:[315,315,78],battery:[785,315,78],home:[550,315,92]};
    const routes={};
    for(const id of ['pv','grid','battery']){
      const [x,y,r]=s[id], [hx,hy,hr]=s.home;
      const dx=hx-x,dy=hy-y,dist=Math.hypot(dx,dy),ux=dx/dist,uy=dy/dist;
      const a=[x+ux*(r+5),y+uy*(r+5)],b=[hx-ux*(hr+5),hy-uy*(hr+5)];
      routes[id]=`M ${a[0].toFixed(2)} ${a[1].toFixed(2)} L ${b[0].toFixed(2)} ${b[1].toFixed(2)}`;
    }
    return {width,height,s,routes};
  }
  function nodeSVG(id, spec, coords, mobile){
    const [x,y,r]=coords;const isHome=id==='home';
    const col=color(spec.color,T[id]);
    const ico=id==='battery'&&spec.icon_style!=='classic'
      ? `<g fill="none" stroke="currentColor" stroke-width="1.8" stroke-linejoin="round"><rect x="1.4" y="7" width="22" height="14" rx="2.6"/><path d="M24 11.5h2v5h-2"/></g><rect data-battery-fill x="3.8" y="9.4" width="0" height="9.2" rx="1" fill="currentColor" opacity=".75"/>`
      : icon(spec.icon);
    const iy=y-(isHome?54:45);const ik=isHome?1.16:.97;
    // Alle Leistungswerte stehen auf der gleichen Baseline. Der Speicher
    // bekommt eine separat zentrierte Kopfzeile mit Icon und Prozentwert.
    const valueY=y+(isHome?(mobile?25:30):(mobile?19:25));
    const subY=y+(isHome?(mobile?47:54):(mobile?39:47));
    const batteryHeadingY=y-(mobile?30:33);
    return `<g class="core-node ${isHome?'core-house':''}" data-target="${id}" data-core="${id}" tabindex="0" role="button" aria-label="${esc(spec.name||id)}" style="--node-color:${col}">
      <circle class="circle-shadow" cx="${x}" cy="${y}" r="${r-1}"/>
      <circle class="circle-panel" cx="${x}" cy="${y}" r="${r-2}"/>
      <circle class="ring-track" cx="${x}" cy="${y}" r="${r-1}" pathLength="100" transform="rotate(-90 ${x} ${y})"/>
      ${isHome?['pv','grid','battery'].map(k=>`<path class="home-ring-segment" data-home-segment="${k}" data-cx="${x}" data-cy="${y}" data-radius="${r-1}" d=""/>`).join(''):
      `<circle class="progress-ring" data-ring="${id}" cx="${x}" cy="${y}" r="${r-1}" pathLength="100" stroke-dasharray="0 100" transform="rotate(-90 ${x} ${y})"/>`}
      ${id==='battery'
        ? `<g class="battery-heading" transform="translate(${x} ${batteryHeadingY})" style="--battery-soc-color:${col}">
             <g class="core-icon battery-icon" transform="translate(-35 -13) scale(.86)">${ico}</g>
             <text class="battery-soc-label" data-battery-soc-label x="-5" y="6" text-anchor="start">– %</text>
           </g>`
        : `<g class="core-icon" transform="translate(${(x-14*ik).toFixed(2)} ${(iy).toFixed(2)}) scale(${ik})">${ico}</g>`}
      <text class="core-value" data-value="${id}" x="${x}" y="${valueY}" text-anchor="middle">–</text>
      <text class="core-sub" data-sub="${id}" x="${x}" y="${subY}" text-anchor="middle">–</text>
    </g>`;
  }
  function svgMarkup(mode,nodes){
    const L=coreLayout(mode);
    const paths=['pv','grid','battery'].filter(id=>nodes[id].show!==false).map(id=>`<g class="flow-route" data-route="${id}">
      <path class="line-track" d="${L.routes[id]}"/>
      <path class="line-active" d="${L.routes[id]}"/>
      <path class="line-dashes" d="${L.routes[id]}"/>
      <g class="particles"></g>
    </g>`).join('');
    const nodeHtml=['pv','grid','battery','home'].filter(k=>nodes[k].show!==false).map(id=>nodeSVG(id,nodes[id],L.s[id],mode==='mobile')).join('');
    return `<svg class="energy-diagram ${mode}" viewBox="0 0 ${L.width} ${L.height}" xmlns="${SVG}" role="img" aria-label="EMH Energiefluss von PV, Netz und Batterie zum Haus">
      <g class="lines">${paths}</g><g class="nodes">${nodeHtml}</g>
    </svg>`;
  }
  const STYLE=`
    :host{display:block;contain:content}
    *{box-sizing:border-box}ha-card{position:relative;color:var(--emh-text);overflow:hidden;background:var(--emh-bg)!important;border:1px solid var(--emh-border);border-radius:var(--ha-card-border-radius,16px)!important;box-shadow:none!important;padding:0}
    ha-card[data-theme="dark"]{--emh-transparent-base:var(--card-background-color,#293139);--emh-bg:color-mix(in srgb,var(--primary-background-color,#071724) 72%,#071724);--emh-panel:color-mix(in srgb,var(--card-background-color,#293139) 78%,#2d3237);--emh-surface:color-mix(in srgb,var(--card-background-color,#212a32) 72%,#303338);--emh-text:var(--primary-text-color,#f0f7fb);--emh-muted:var(--secondary-text-color,#a8b6c0);--emh-border:var(--divider-color,#2b4b60);--emh-track:#516878;--emh-ring-track:#455663;--emh-secondary-bg:#343d46;--emh-secondary-shadow:rgba(0,0,0,.27);--emh-glow:rgba(19,139,191,.11)}
    ha-card[data-theme="light"]{--emh-transparent-base:var(--card-background-color,#fff);--emh-bg:color-mix(in srgb,var(--primary-background-color,#f5f9fc) 75%,#f5f9fc);--emh-panel:var(--card-background-color,#fff);--emh-surface:var(--card-background-color,#fff);--emh-text:var(--primary-text-color,#213849);--emh-muted:var(--secondary-text-color,#667c8b);--emh-border:var(--divider-color,#cadde7);--emh-track:#bed0d9;--emh-ring-track:#e4ebef;--emh-secondary-bg:#eef3f7;--emh-secondary-shadow:rgba(36,65,90,.13);--emh-glow:rgba(79,173,212,.09)}
    /* Transparenter Kartenhintergrund wie im EMH-Theme; gilt für hell und dunkel. */
    ha-card[data-transparent="true"]{background:linear-gradient(135deg,rgba(128,128,128,.10),rgba(128,128,128,.02)),color-mix(in srgb,var(--emh-transparent-base) 70%,transparent)!important}
    .head{padding:18px 20px 4px;display:flex;gap:12px;align-items:center;justify-content:space-between;flex-wrap:wrap}
    .heading{display:flex;align-items:center;gap:11px}.emh-mark{height:38px;width:38px;border-radius:11px;background:linear-gradient(130deg,#07d4ca,#1478e2);display:grid;place-items:center;font-weight:800;color:white;font-size:14px}
    .head-actions{display:flex;gap:9px;align-items:center;margin-left:auto}.help-button{display:grid;place-items:center;width:31px;height:31px;border:1px solid var(--emh-border);border-radius:50%;background:var(--emh-panel);box-shadow:0 2px 7px rgba(0,0,0,.10);font-weight:800;font-size:16px;color:var(--emh-text);cursor:pointer}.help-button:hover,.help-button:focus-visible{border-color:#18cef2;outline:2px solid transparent;box-shadow:0 0 0 2px rgba(24,206,242,.22)}.heading h3{font-weight:750;font-size:19px;margin:0 0 3px;line-height:1.1}.heading p{margin:0;font-size:10px;letter-spacing:.8px;color:var(--emh-muted)}.status{font-size:11px;border:1px solid var(--emh-border);padding:7px 12px;border-radius:99px;display:flex;align-items:center;gap:7px;color:var(--emh-muted)}.status i{width:7px;height:7px;background:#24da84;display:inline-block;border-radius:50%;box-shadow:0 0 8px #24da84}
    .head-actions.floating{position:absolute;top:9px;right:11px;z-index:12;margin-left:0;gap:7px} .diagram-wrap{padding:0 10px}.energy-diagram{width:100%;display:block;height:auto;overflow:visible}.energy-diagram.mobile{display:none}
    /* Leitungen bleiben neutral grau; ausschließlich bewegte Punkte/Striche sind farbig. */
    .line-track{stroke:var(--emh-track);stroke-width:3.5;stroke-linecap:round;opacity:.70;fill:none}
    .line-active{display:none}
    .line-dashes{stroke:var(--route-color);stroke-width:4;stroke-dasharray:8 13;stroke-linecap:round;opacity:0;fill:none}
    .flow-route{--route-color:var(--emh-track)}
    .circle-shadow{fill:var(--emh-panel);filter:drop-shadow(0 6px 13px rgba(0,0,0,.18))}.circle-panel{fill:var(--emh-panel)}.ring-track{fill:none;stroke:var(--emh-ring-track);stroke-width:var(--emh-ring-track-width,2.8)}.progress-ring{fill:none;stroke:var(--node-color);stroke-width:var(--emh-ring-progress-width,3.15);stroke-linecap:butt;stroke-dashoffset:0;transition:stroke-dasharray .55s ease,stroke .35s ease}.home-ring-segment{fill:none;stroke-width:var(--emh-ring-home-width,3.5);stroke-linecap:butt;transition:stroke .35s ease}
    .progress-ring{filter:drop-shadow(0 0 2.5px var(--node-color))}.home-ring-segment{stroke-linecap:butt;stroke-width:var(--emh-ring-home-width,3.5);filter:drop-shadow(0 0 2px currentColor)}.home-ring-segment[data-home-segment="pv"]{stroke:${T.pv};filter:drop-shadow(0 0 2px ${T.pv})}.home-ring-segment[data-home-segment="grid"]{stroke:${T.grid};filter:drop-shadow(0 0 2px ${T.grid})}.home-ring-segment[data-home-segment="battery"]{stroke:${T.battery};filter:drop-shadow(0 0 2px ${T.battery})}
    .core-node{cursor:pointer;outline:none}.core-node:hover .circle-panel,.core-node:focus-visible .circle-panel{stroke:var(--node-color);stroke-width:2}.core-icon{color:var(--node-color)}.core-icon ha-icon{--mdc-icon-size:28px;color:var(--node-color)}.core-label{fill:var(--node-color);font-weight:750;font-size:18px}.battery-heading .battery-soc-label{fill:var(--battery-soc-color);font-size:19px;font-weight:750;font-variant-numeric:tabular-nums}.battery-heading .battery-icon{color:var(--battery-soc-color)}.battery-heading .battery-icon ha-icon{color:var(--battery-soc-color)}.core-value{fill:var(--emh-text);font-weight:780;font-variant-numeric:tabular-nums;font-size:23px}.core-sub{fill:var(--emh-muted);font-size:12.5px}.core-house .core-value{font-size:28px}.core-house .core-sub{font-size:13.5px}
    .individuals{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:8px;padding:0 18px 11px}.device{position:relative;cursor:pointer;min-width:0;padding:9px 7px 8px;border-radius:12px;text-align:center;background:var(--emh-surface);border:1px solid var(--emh-border);box-shadow:0 5px 13px rgba(0,0,0,.06);transition:transform .2s,border-color .2s}.device:hover,.device:focus-visible{transform:translateY(-2px);border-color:#59bddb;outline:none}.device-icon{display:flex;justify-content:center;color:var(--emh-muted);height:20px}.device-icon svg{height:20px;width:20px}.device-icon ha-icon{--mdc-icon-size:20px}.device-name{font-size:10px;color:var(--emh-muted);font-weight:620;margin-top:4px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap}.device-value{font-size:19px;font-weight:790;color:var(--emh-text);margin-top:4px;white-space:nowrap;font-variant-numeric:tabular-nums}.device-secondary{font-size:9px;color:var(--emh-muted);min-height:12px;margin-top:3px;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;display:inline-block;max-width:100%}.device-secondary[data-secondary-kind="entity"],.device-secondary[data-secondary-kind="state"]{background:var(--emh-secondary-bg);box-shadow:0 2px 5px var(--emh-secondary-shadow);border-radius:6px;padding:2px 6px;color:var(--emh-text)}
    .device[data-active="true"]{
      border-color:var(--device-active-color,#50d584);
      box-shadow:0 0 0 1px color-mix(in srgb,var(--device-active-color,#50d584) 36%,transparent),0 0 16px color-mix(in srgb,var(--device-active-color,#50d584) 48%,transparent),0 6px 15px rgba(0,0,0,.12);
    }
    .device[data-active="true"] .device-secondary:not(:empty){text-shadow:0 0 5px color-mix(in srgb,var(--device-active-color,#50d584) 33%,transparent)}
    .help-panel .help-description{white-space:pre-wrap;overflow-wrap:anywhere}
    .help-panel{position:absolute;z-index:20;right:13px;top:47px;width:min(350px,calc(100% - 26px));max-height:min(430px,75vh);overflow-y:auto;background:var(--emh-panel);border:1px solid var(--emh-border);box-shadow:0 14px 32px rgba(0,0,0,.33);border-radius:14px;padding:17px 16px;color:var(--emh-text);font-size:12px;line-height:1.55}.help-panel[hidden]{display:none}.help-title{display:flex;align-items:center;justify-content:space-between;gap:7px;margin:0 0 7px;font-size:15px;font-weight:750}.help-panel p{margin:7px 0}.help-panel ul{padding-left:20px;margin:8px 0}.help-close{border:1px solid var(--emh-border);background:transparent;border-radius:8px;padding:3px 8px;color:inherit;cursor:pointer;font-size:17px}.foot{border-top:1px solid var(--emh-border);margin:0 18px;padding:10px 0 13px;display:flex;gap:8px;justify-content:space-between;flex-wrap:wrap;color:var(--emh-muted);font-size:10.5px}.foot strong{color:var(--emh-text)}
    .flow-atom{pointer-events:none}.flow-atom .atom-inner{fill:var(--route-color);stroke:none}.flow-atom .atom-glow{fill:var(--route-color);opacity:.25;filter:blur(3px)}
    @media(max-width:750px){.head{padding:12px 11px 0}.heading h3{font-size:15px}.heading p{font-size:8px}.emh-mark{height:32px;width:32px;font-size:12px}.status{font-size:10px;padding:5px 9px}.diagram-wrap{padding:0 2px}.energy-diagram.desktop{display:none}.energy-diagram.mobile{display:block}.mobile .core-label{font-size:17px}.mobile .battery-soc-label{font-size:18px}.mobile .core-value{font-size:21px}.mobile .core-sub{font-size:12px}.mobile .core-house .core-value{font-size:25px}.individuals{grid-template-columns:repeat(3,minmax(0,1fr));gap:6px;padding:0 7px 8px}.device{border-radius:10px;padding:6px 3px 6px}.device-icon{height:18px}.device-icon svg{height:18px;width:18px}.device-icon ha-icon{--mdc-icon-size:18px}.device-name{font-size:9.5px;margin-top:3px;max-width:100%}.device-value{font-size:18px;margin-top:3px;letter-spacing:-.3px}.device-secondary{font-size:8.5px;margin-top:2px}.foot{margin:0 10px;padding:7px 0 10px;font-size:9px}}
    @media(max-width:370px){.mobile .core-value{font-size:18px}.device-value{font-size:16px}}
    @media(max-width:750px){ha-card[data-mobile-save="true"] .energy-diagram.mobile .atom-glow{display:none}ha-card[data-mobile-save="true"] .energy-diagram.mobile .flow-atom{filter:none!important}ha-card[data-mobile-save="true"] .energy-diagram.mobile .home-ring-segment,ha-card[data-mobile-save="true"] .energy-diagram.mobile .progress-ring{filter:none!important}}
    @media(prefers-reduced-motion:reduce){.progress-ring,.home-ring-segment,.line-active{transition:none}}
  `;
  function individualCard(item) {
    const fallback='mdi:power-plug';
    return `<div class="device" data-target="${esc(item.id)}" tabindex="0" role="button" aria-label="${esc(item.name)}">
      <div class="device-icon"><svg xmlns="${SVG}" viewBox="0 0 28 28" width="25" height="25">${icon(item.icon||fallback)}</svg></div>
      <div class="device-name">${esc(item.name)}</div>
      <div class="device-value" data-device-value="${esc(item.id)}">–</div>
      <div class="device-secondary" data-secondary-kind="${esc(item.secondary_mode || (item.secondary_entity?'entity':'text'))}" data-device-secondary="${esc(item.id)}">&nbsp;</div>
    </div>`;
  }

  class EmhPowerFlowCard extends HTMLElement {
    constructor(){
      super();this.attachShadow({mode:'open'});this._config={};this._hass=null;this._nodes=clone(NODES_DEFAULT);
      this._entities={...ENTITY_DEFAULTS};this._individual=normalizeIndividuals();this._rendered=false;
      this._raf=0;this._lastFrame=0;this._lastPaint=0;this._routes=[];this._motion=true;this._inView=true;
      this._mobileMedia=window.matchMedia('(max-width:750px)');
      this._reduceMotion=window.matchMedia('(prefers-reduced-motion: reduce)');
      this._click=ev=>{if(ev.target.closest?.('[data-help-toggle]')){this._toggleHelp();return;}if(ev.target.closest?.('[data-help-close]')){this._toggleHelp(false);return;}const target=ev.target.closest?.('[data-target]');if(target)this._navigate(target.dataset.target);};
      this._key=ev=>{if(ev.key==='Escape'){this._toggleHelp(false);return;}if((ev.key==='Enter'||ev.key===' ')&&ev.target?.matches?.('[data-target]')){ev.preventDefault();this._navigate(ev.target.dataset.target);}};
      this.shadowRoot.addEventListener('click',this._click);
      this.shadowRoot.addEventListener('keydown',this._key);
      this._visibility=()=>{this._lastFrame=0;this._lastPaint=0;if(document.hidden)this._stop();else this._start();};
    }
    static getStubConfig(){return {type:`custom:${CARD}`,theme:'auto',entities:clone(ENTITY_DEFAULTS),individual:clone(IND_DEFAULT),animation:{style:'dots',speed:1,glow:65,max_drops:3,mobile_power_save:true,mobile_fps:25,mobile_max_particles:2},appearance:{ring_width_percent:50,transparent_background:true},display:{header:false,live:true,info_button:true,footer:true,energy_split:true,fossil:true}};}
    static getConfigElement(){return document.createElement(EDITOR);}
    setConfig(cfg){
      if(!cfg||typeof cfg!=='object')throw new Error('EMH Power Flow: Konfiguration fehlt.');
      this._config=clone(cfg);
      this._entities={...ENTITY_DEFAULTS,...(cfg.entities||{})};
      this._nodes={};for(const key of Object.keys(NODES_DEFAULT))this._nodes[key]={...NODES_DEFAULT[key],...(cfg.nodes?.[key]||{})};
      this._individual=normalizeIndividuals(cfg.individual);
      this._stop();this._render();this._update();this._start();
    }
    set hass(hass){this._hass=hass;if(this.isConnected){if(!this._rendered)this._render();this._update();this._start();}}
    connectedCallback(){if(!this._rendered)this._render();this._update();this._start();document.addEventListener('visibilitychange',this._visibility);if('IntersectionObserver' in window){this._observer?.disconnect();this._observer=new IntersectionObserver(entries=>{this._inView=entries[0]?.isIntersecting!==false;this._lastFrame=0;this._lastPaint=0;if(this._inView)this._start();else this._stop();},{threshold:0});this._observer.observe(this);}}
    disconnectedCallback(){this._stop();this._observer?.disconnect();document.removeEventListener('visibilitychange',this._visibility);}
    _toggleHelp(force){
      const panel=this.shadowRoot.querySelector('.help-panel');
      const toggle=this.shadowRoot.querySelector('[data-help-toggle]');
      if(!panel||!toggle)return;
      const visible=typeof force==='boolean'?force:panel.hidden;
      panel.hidden=!visible;
      toggle.setAttribute('aria-expanded',String(visible));
      if(visible)this.shadowRoot.querySelector('[data-help-close]')?.focus();
      else toggle.focus();
    }
    _render(){
      const cfg=this._config,dis=cfg.display||{};
      const individuals=this._individual.filter(i=>i.show!==false);
      const count=individuals.length;
      const theme=cfg.theme||'auto';
      this.shadowRoot.innerHTML=`<style>${STYLE}</style><ha-card data-theme="${theme==='light'?'light':'dark'}" data-transparent="${cfg.appearance?.transparent_background!==false}">
        ${(dis.live!==false||dis.info_button!==false)?`<div class="head-actions floating">${dis.live===false?'':`<div class="status"><i></i><span data-status>LIVE</span></div>`}${dis.info_button===false?'':`<button type="button" class="help-button" data-help-toggle aria-label="Informationen zur EMH Power Flow Card" aria-controls="emh-help-panel" aria-expanded="false">?</button>`}</div>`:''}
        ${dis.info_button===false?'':`<section class="help-panel" id="emh-help-panel" role="dialog" aria-label="Hilfe zur EMH Power Flow Card" hidden><div class="help-title"><span>${esc(cfg.info?.title||'EMH Energiefluss – Erklärung')}</span><button class="help-close" type="button" data-help-close aria-label="Hilfe schließen">×</button></div><p class="help-description">${esc(cfg.info?.description||'Diese Karte zeigt die aktuellen Leistungsflüsse zwischen Photovoltaik, Netz, Batteriespeicher und Haus.')}</p>${cfg.info?.show_default_guide===false?'':`<ul><li><strong>PV (Gelb):</strong> Leistungserzeugung; der Füllring bezieht sich auf das eingestellte 100-%-Maximum.</li><li><strong>Netz (Blau):</strong> Bezug oder Einspeisung; der Ring wird an der konfigurierten Warnschwelle rot.</li><li><strong>Batterie (konfigurierte Ringfarbe):</strong> SOC-Ring oder richtungsabhängiger Leistungsring (Laden / Entladen).</li><li><strong>Haus:</strong> PV + Netzbezug + Batterieentladung − Netzeinspeisung − Batterieladung − ausgewählte Individual-Verbraucher. Gelb/Blau/Grün sind geschätzte Herkunftsanteile.</li><li><strong>Animation:</strong> Lichtpunkte, Kometen, Impulse oder Striche laufen mit konstanter eingestellter Geschwindigkeit und stoppen unter der Nulltoleranz.</li><li><strong>Individual:</strong> Bis zu sechs Verbraucher/Erzeuger in drei Spalten mit frei wählbarer Zusatzzeile.</li></ul><p>Die Hausring-Anteile sind ohne direkte Herkunftsmessung eine Näherung. Nulltoleranzwerte betreffen nur die Anzeige; die Hausbilanz verwendet Rohmessungen. Individual-Abzüge nicht doppelt zählen. Die Netz-Warnung begrenzt keine Leistung.</p>`}</section>`}
        <div class="diagram-wrap">${svgMarkup('desktop',this._nodes)}${svgMarkup('mobile',this._nodes)}</div>
        ${count?`<div class="individuals">${individuals.map(individualCard).join('')}</div>`:''}
        ${dis.footer===false?'':`<footer class="foot">${dis.energy_split===false?'':`<span data-energy-split>PV – · Netz – · Speicher –</span>`}${dis.fossil===false?'':`<span data-fossil></span>`}</footer>`}
      </ha-card>`;
      const card=this.shadowRoot.querySelector('ha-card');
      const ringRatio=clamp(n(cfg.appearance?.ring_width_percent,50),20,150)/100;
      card.style.setProperty('--emh-ring-track-width',String(5.6*ringRatio));
      card.style.setProperty('--emh-ring-progress-width',String(6.3*ringRatio));
      card.style.setProperty('--emh-ring-home-width',String(7*ringRatio));
      card.dataset.mobileSave=String(cfg.animation?.mobile_power_save!==false);
      this._rendered=true;
      this._setupRoutes();
    }
    _read(ref){
      if(!this._hass?.states||!ref)return null;
      const r=typeof ref==='string'?{entity:ref}:ref;
      if(!r?.entity)return null;
      const st=this._hass.states[r.entity];if(!st)return null;
      const raw=r.attribute?st.attributes?.[r.attribute]:st.state;
      if(raw===null||raw===undefined||raw===''||['unknown','unavailable','none','null'].includes(String(raw).toLowerCase()))return null;
      const val=Number(raw);return Number.isFinite(val)?val*n(r.multiplier,1):null;
    }
    // Intern werden alle Leistungswerte in Watt geführt. Vorhandene kW/MW-Sensoren
    // werden automatisch anhand der Home-Assistant-Einheit umgerechnet.
    // Bei einem expliziten multiplier ohne unit bleibt die bisherige manuelle
    // Umrechnung maßgeblich (keine doppelte Multiplikation).
    _configuredPowerRef(key){
      const base=this._entities[key];
      const u=str(this._entities[`${key}_unit`]||'auto');
      if(u==='auto'||!u||!base)return base;
      return typeof base==='string'?{entity:base,unit:u}:{...base,unit:u};
    }
    _readPower(ref, fallbackUnit='W'){
      const v=this._read(ref);
      if(v===null)return null;
      const r=typeof ref==='string'?{entity:ref}:ref;
      const hasManualFactor=r && r.multiplier!==undefined && r.unit===undefined;
      if(hasManualFactor)return v;
      const state=this._hass?.states?.[r?.entity];
      const u=str(r?.unit || state?.attributes?.unit_of_measurement || fallbackUnit).trim().toLowerCase().replace(/\s/g,'');
      return v*(u==='kw'?1000:u==='mw'?1000000:1);
    }
    _readState(ref){
      if(!this._hass?.states||!ref)return null;
      const r=typeof ref==='string'?{entity:ref}:ref;const st=this._hass.states[r.entity];
      if(!st)return null;const raw=r.attribute?st.attributes?.[r.attribute]:st.state;
      return raw===undefined||raw===null||['unknown','unavailable'].includes(String(raw).toLowerCase())?null:String(raw);
    }
    _navigate(id){
      const spec=this._nodes[id]||this._individual.find(x=>x.id===id)||{};
      const path=str(spec.popup||spec.navigation_path);
      if(!path)return;
      if(path.startsWith('#')){window.location.hash=path;return;}
      if(path.startsWith('/')){window.history.pushState({},'',path);window.dispatchEvent(new Event('location-changed'));return;}
      if(/^https?:\/\//i.test(path))window.open(path,'_blank','noopener,noreferrer');
    }
    _put(attr,value){this.shadowRoot.querySelectorAll(attr).forEach(el=>{if(el.textContent!==value)el.textContent=value;});}
    _fitCoreSubtitles(){
      for(const el of this.shadowRoot.querySelectorAll('.core-node .core-sub')){
        const currentText=el.textContent||'';
        if(el.dataset.fittedText===currentText)continue;
        el.dataset.fittedText=currentText;
        el.removeAttribute('textLength');
        el.removeAttribute('lengthAdjust');
        el.style.fontSize='';
        const node=el.closest('.core-node');
        const circle=node?.querySelector('.circle-panel');
        const radius=Number(circle?.getAttribute('r'));
        if(!Number.isFinite(radius)||radius<=0)continue;
        const maxWidth=radius*2-18;
        // Unsichtbare SVG-Variante meldet ggf. Länge 0. Die sichtbare
        // Variante wird unabhängig davon gemessen und angepasst.
        const natural=el.getComputedTextLength?.()||0;
        if(natural>maxWidth){
          const scale=Math.max(.76,maxWidth/natural);
          const base=el.closest('svg.mobile')?12:12.5;
          el.style.fontSize=`${(base*scale).toFixed(2)}px`;
          if(el.getComputedTextLength()>maxWidth){
            el.setAttribute('textLength',String(maxWidth));
            el.setAttribute('lengthAdjust','spacingAndGlyphs');
          }
        }
      }
    }
    _ring(id,percent,warning=false,colorOverride=null,reverse=false){
      const pct=clamp(percent||0,0,100);
      this.shadowRoot.querySelectorAll(`[data-ring="${id}"]`).forEach(el=>{
        el.setAttribute('stroke-dasharray',pct>=99.999?'100 0':`${pct.toFixed(3)} ${(100-pct).toFixed(3)}`);
        el.style.opacity=pct>0.001?'1':'0';
        const ringColor=warning?color(this._nodes.grid?.alert_color,T.warning):(colorOverride||color(this._nodes[id]?.color,T[id]));
        el.style.stroke=ringColor;
        el.setAttribute('stroke-dashoffset',reverse?String(-(100-pct).toFixed(3)):'0');
        el.style.filter=`drop-shadow(0 0 ${warning?4:2.5}px ${ringColor})`;
      });
    }
    _mixRing(shares){
      const keys=['pv','grid','battery'];
      const raw=keys.map(k=>clamp(Number(shares[k])||0,0,100));
      const total=raw.reduce((a,b)=>a+b,0);
      let offset=0;
      const lastPositive=raw.reduce((last,v,j)=>v>0?j:last,-1);
      keys.forEach((id,i)=>{
        // Ein vollständig zugeordnetes Haus wird immer exakt zu 100 % gefüllt.
        // Die letzte positive Quelle bekommt den numerischen Rest, damit kein
        // Rundungs-/Renderspalt zwischen den Segmenten entsteht.
        const pct=total<=0?0:(i===lastPositive?100-offset:raw[i]/total*100);
        this.shadowRoot.querySelectorAll(`[data-home-segment="${id}"]`).forEach(el=>{
          const cx=Number(el.dataset.cx),cy=Number(el.dataset.cy),r=Number(el.dataset.radius);
          el.setAttribute('d',ringArcPath(cx,cy,r,offset,pct));
          el.style.opacity=pct>0?'1':'0';
          // Altattribute aus früheren Circle-/Dash-Versionen sicher entfernen.
          el.removeAttribute('stroke-dasharray');
          el.removeAttribute('stroke-dashoffset');
        });
        offset+=pct;
      });
    }
    _secondary(item,powerW){
      const mode=item.secondary_mode|| (item.secondary_entity?'entity':'text');
      const threshold=Math.max(0,n(item.secondary_threshold_w,500));
      if(item.secondary_show_above_enabled===true && (!Number.isFinite(powerW)||powerW<threshold))return '';
      if(mode==='text')return str(item.secondary_text||item.subtitle||'Verbrauch aktuell');
      const entity=item.secondary_entity||item.secondary_state_entity;
      if(mode==='state'){
        const value=this._readState(entity);if(value===null)return '–';
        const map={on:'Ein',off:'Aus',true:'Ein',false:'Aus',charging:'Lädt',idle:'Bereit',unavailable:'–'};
        const userMap={};str(item.secondary_state_map).split(';').forEach(pair=>{const p=pair.indexOf('=');if(p>0)userMap[pair.slice(0,p).trim()]=pair.slice(p+1).trim();});
        const mapped=userMap[value]??map[value.toLowerCase()]??value;
        return [str(item.secondary_label),mapped].filter(Boolean).join(' · ');
      }
      if(mode==='entity'){
        if(Number.isFinite(powerW)&&powerW<n(item.secondary_threshold_w,0))return str(item.secondary_text||'');
        const val=this._read(entity);if(val===null)return '–';
        const ref=typeof entity==='string'?{entity}:entity;
        const haUnit=str(this._hass?.states?.[ref?.entity]?.attributes?.unit_of_measurement);
        const explicitUnit=str(item.secondary_unit).trim();
        const unit=explicitUnit||haUnit;
        const decimals=clamp(n(item.secondary_decimals,unit==='°C'?1:0),0,3);
        let value;
        if(!explicitUnit&&['W','kW','MW'].includes(haUnit)&&ref?.attribute===undefined){
          const watts=this._readPower(entity);
          value=power(watts);
        } else value=`${fmt(val,decimals)}${unit?' '+unit:''}`;
        return [str(item.secondary_label),value].filter(Boolean).join(' · ');
      }
      return '';
    }
    _coreSecondary(id, standardText){
      const cfg=this._nodes[id]||{};
      const mode=cfg.secondary_mode||'default';
      if(mode==='default')return standardText;
      if(mode==='text')return str(cfg.secondary_text);
      if(mode==='state'||mode==='entity')return this._secondary({...cfg,secondary_mode:mode},null);
      return standardText;
    }
    _update(){
      if(!this._rendered||!this._hass)return;
      const theme=this._config.theme||'auto';
      const dark=theme==='dark'||(theme==='auto'&&(this._hass.themes?.darkMode??window.matchMedia('(prefers-color-scheme: dark)').matches));
      this.shadowRoot.querySelector('ha-card').dataset.theme=dark?'dark':'light';
      const powerKeys=new Set(['pv','grid_import','grid_export','battery_charge','battery_discharge','home']);
      const raw={};for(const id of Object.keys(ENTITY_DEFAULTS))raw[id]=powerKeys.has(id)?this._readPower(this._configuredPowerRef(id)):this._read(this._entities[id]);
      const p=x=>raw[x]===null?null:Math.max(0,raw[x]);
      const pv=p('pv'),soc=p('battery_soc');
      // Signed power convention: grid + = Import, - = Export; battery + = Entladen, - = Laden.
      // Vorzeichen kann bei abweichenden Wechselrichtern invertiert werden.
      const signedGrid=this._readPower(this._configuredPowerRef('grid_power'));
      const signedBattery=this._readPower(this._configuredPowerRef('battery_power'));
      const signedGridW=signedGrid===null?null:signedGrid*(this._entities.grid_invert_sign===true?-1:1);
      const signedBatteryW=signedBattery===null?null:signedBattery*(this._entities.battery_invert_sign===true?-1:1);
      const imp=this._entities.grid_mode==='signed'?(signedGridW===null?null:Math.max(0,signedGridW)):p('grid_import');
      const exp=this._entities.grid_mode==='signed'?(signedGridW===null?null:Math.max(0,-signedGridW)):p('grid_export');
      const bc=this._entities.battery_mode==='signed'?(signedBatteryW===null?null:Math.max(0,-signedBatteryW)):p('battery_charge');
      const bd=this._entities.battery_mode==='signed'?(signedBatteryW===null?null:Math.max(0,signedBatteryW)):p('battery_discharge');
      const grid=imp===null||exp===null?null:imp-exp;
      const battery=bd===null||bc===null?null:bd-bc;
      const amounts={};for(const item of this._individual){const u=str(item.entity_unit||'auto');const ref=u!=='auto'&&u?{entity:item.entity,unit:u}:item.entity;amounts[item.id]=this._readPower(ref);}
      // Ausschließlich ausdrücklich gewählte, nicht überlappende Verbraucher abziehen.
      // Legacy include_in_home=true darf nicht als Abzug interpretiert werden.
      const subtractItems=this._individual.filter(i=>i.deduct_from_home===true && i.show!==false && !i.reverse_flow);
      const missingDeduction=subtractItems.some(i=>!Number.isFinite(amounts[i.id]));
      const deductions=missingDeduction?null:subtractItems.reduce((sum,item)=>sum+Math.max(0,amounts[item.id]*n(item.multiplier,1)),0);
      const complete=[pv,imp,exp,bc,bd].every(Number.isFinite);
      const fromBalance=complete?homeEnergyBalance(pv,imp,exp,bc,bd,0):null;
      const house=fromBalance!==null && deductions!==null ? Math.max(0,fromBalance-deductions) : null;
      const zeroFor=(id,v)=>displayW(v,this._nodes[id]?.zero_tolerance_w??10);
      const visualPv=zeroFor('pv',pv);
      const visualGrid=zeroFor('grid',grid);
      const visualBattery=zeroFor('battery',battery);
      const visualHome=zeroFor('home',house);
      this._put('[data-value="pv"]',power(visualPv));
      this._put('[data-sub="pv"]',this._coreSecondary('pv',pv===null?'Keine Daten':pv>30?'Erzeugung':'Keine Produktion'));
      this._put('[data-value="grid"]',power(visualGrid===null?null:Math.abs(visualGrid)));
      this._put('[data-sub="grid"]',this._coreSecondary('grid',grid===null?'Keine Daten':grid>30?'Bezug':grid< -30?'Einspeisung':'Ausgeglichen'));
      this._put('[data-value="battery"]',power(visualBattery===null?null:Math.abs(visualBattery)));
      this._put('[data-sub="battery"]',this._coreSecondary('battery',`${battery===null?'Keine Daten':battery>30?'Entlädt':battery< -30?'Lädt':'Bereit'}`));
      this.shadowRoot.querySelectorAll('[data-battery-fill]').forEach(el=>el.setAttribute('width',String((19*clamp(soc??0,0,100)/100).toFixed(2))));
      this._put('[data-value="home"]',power(visualHome));this._put('[data-sub="home"]',deductions>0?`Abzüglich ${power(deductions)}`:'Gesamtverbrauch');
      const batSocText=soc===null?'– %':`${fmt(clamp(soc,0,100))} %`;
      this._put('[data-battery-soc-label]',batSocText);
      const batterySpec=this._nodes.battery;
      const fixedBatteryColor=color(batterySpec.color,T.battery);
      // Der äußere Ring bleibt immer in der vom Benutzer eingestellten Farbe.
      // Nur Symbol und Prozentwert dürfen optional die SOC-Farben verwenden.
      const batteryIconColor=batterySpec.use_soc_colors!==false?socColor(soc):fixedBatteryColor;
      this.shadowRoot.querySelectorAll('[data-core="battery"]').forEach(el=>{
        el.style.setProperty('--node-color',fixedBatteryColor);
        el.querySelector('.battery-heading')?.style.setProperty('--battery-soc-color',batteryIconColor);
      });
      this._fitCoreSubtitles();
      // Ring-Maximum ist immer exakt 100 %: W oder kW (PV/Netz), % (Akku).
      // ring_unit bezeichnet die Einheit des eingestellten Maximums, nicht die
      // Maßeinheit des Sensorwertes. Letztere wird direkt von HA übernommen.
      const ringValue=(id,defaultVal)=>{
        const spec=this._nodes[id],ref=spec.ring_entity;
        const unit=str(spec.ring_unit|| (id==='battery'?'%':'W')).trim().toLowerCase();
        const fallbackUnit=str(spec.ring_value_unit||'auto').toLowerCase();
        const readValue=unit==='%'?this._read(ref):this._readPower(ref,fallbackUnit==='auto'?'W':fallbackUnit);
        let actual=readValue===null?defaultVal:readValue;
        if(id!=='battery' && unit!=='%')actual=zeroFor(id,actual);
        // Bei "Entity" wird HA unit_of_measurement (W/kW/MW) ausgewertet.
        // Bleibt die Entity unbekannt oder 0, wird der Ring sicher leer dargestellt.
        const useEntity=spec.ring_max_mode==='entity';
        const maximum=useEntity ? (unit==='%'?this._read(spec.ring_max_entity):this._readPower(spec.ring_max_entity,spec.ring_max_entity_unit||'W'))
          :n(spec.ring_max,id==='battery'?100:id==='grid'?5000:25000)*(unit==='kw'?1000:unit==='mw'?1000000:1);
        return Number.isFinite(maximum)&&maximum>0&&actual!==null?clamp(actual/maximum*100,0,100):0;
      };
      this._ring('pv',ringValue('pv',visualPv));
      const ringSource=batterySpec.ring_source||'soc';
      if(ringSource==='power') {
        const ringMax=batterySpec.power_ring_max_mode==='entity'
          ? this._readPower(batterySpec.power_ring_max_entity,batterySpec.power_ring_max_entity_unit||'W')
          : n(batterySpec.power_ring_max,5000)*(str(batterySpec.power_ring_unit||'W').toLowerCase()==='kw'?1000:1);
        const ringPower=visualBattery===null?null:Math.abs(visualBattery);
        const percentage=Number.isFinite(ringMax)&&ringMax>0&&ringPower!==null?clamp(ringPower/ringMax*100,0,100):0;
        const charging=battery!==null&&battery< -30;
        this._ring('battery',percentage,false,fixedBatteryColor,charging);
      } else {
        this._ring('battery',ringValue('battery',soc),false,fixedBatteryColor);
      }
      const gridSpec=this._nodes.grid;
      const warnLoad=this._entities.grid_mode==='signed' && (!gridSpec.alert_entity || gridSpec.alert_entity===ENTITY_DEFAULTS.grid_import)
        ? imp : this._readPower(gridSpec.alert_entity);
      const threshold=gridSpec.alert_threshold_mode==='entity'
        ? this._readPower(gridSpec.alert_threshold_entity,gridSpec.alert_threshold_entity_unit||'W')
        :Math.max(0,n(gridSpec.alert_threshold_w,5000))*(str(gridSpec.alert_threshold_unit||'W').toLowerCase()==='kw'?1000:1);
      const warnAt=clamp(n(gridSpec.alert_from_percent,90),0,100);
      const warn=Number.isFinite(warnLoad)&&Number.isFinite(threshold)&&threshold>0&&warnLoad>=threshold*warnAt/100;
      const gridRingValue=this._entities.grid_mode==='signed' && (!gridSpec.ring_entity || gridSpec.ring_entity===ENTITY_DEFAULTS.grid_import)
        ? (()=>{const maximum=gridSpec.ring_max_mode==='entity'
            ? this._readPower(gridSpec.ring_max_entity,gridSpec.ring_max_entity_unit||'W')
            : n(gridSpec.ring_max,5000)*(str(gridSpec.ring_unit||'W').toLowerCase()==='kw'?1000:1);
          return Number.isFinite(maximum)&&maximum>0&&imp!==null?clamp(Math.max(0,zeroFor('grid',imp))/maximum*100,0,100):0;})()
        : ringValue('grid',imp);
      this._ring('grid',gridRingValue,warn);
      // Quellenverteilung: PV-/Netz-/Speicherleistung nach Lade-/Exportabzug.
      // Herkunft der abgezogenen Individual-Verbraucher ist unbekannt;
      // daher werden sie proportional von allen drei Quellen abgezogen.
      let pvHome=0,gridHome=0,batHome=0;
      if(complete){
        const pvAvailable=Math.max(0,pv-exp);
        const pvToBattery=Math.min(bc,pvAvailable);
        pvHome=Math.max(0,pvAvailable-pvToBattery);
        gridHome=Math.max(0,imp-Math.max(0,bc-pvToBattery));
        batHome=Math.max(0,bd);
      }
      // Direkte Herkunftssensoren können die Näherung verbessern.
      const exactKeys=['pv_to_home','grid_to_home','battery_to_home'];
      const exact=exactKeys.map(k=>this._readPower(this._configuredPowerRef(k)));
      if(exact.every(Number.isFinite)){[pvHome,gridHome,batHome]=exact.map(x=>Math.max(0,x));}
      const sumSources=pvHome+gridHome+batHome;
      let shares={pv:0,grid:0,battery:0};
      if(sumSources>0&&visualHome!==null&&visualHome>0){
        shares={pv:pvHome/sumSources*100,grid:gridHome/sumSources*100,battery:batHome/sumSources*100};
      }
      this._mixRing(shares);
      this._put('[data-energy-split]',`PV ${fmt(shares.pv)} % · Netz ${fmt(shares.grid)} % · Speicher ${fmt(shares.battery)} %`);
      this._put('[data-fossil]',raw.fossil===null?'':`Fossiler Stromanteil ${fmt(raw.fossil)} %`);
      this._put('[data-status]',complete&&deductions!==null?'LIVE':'TEILWEISE');
      for(const item of this._individual){
        const value=amounts[item.id]===null?null:Math.max(0,amounts[item.id]*n(item.multiplier,1));
        this._put(`[data-device-value="${item.id}"]`,power(displayW(value,item.zero_tolerance_w??10)));
        const secondary=this._secondary(item,value);
        this._put(`[data-device-secondary="${item.id}"]`,secondary);
        const active=Number.isFinite(value)&&value>=Math.max(0,n(item.secondary_threshold_w,500));
        this.shadowRoot.querySelectorAll('.device').forEach(el=>{
          if(el.dataset.target!==item.id)return;
          el.dataset.active=String(item.highlight_active_enabled===true&&active);
          el.style.setProperty('--device-active-color',color(item.highlight_active_color,'#50d584'));
          const extra=el.querySelector('.device-secondary');
          if(extra)extra.style.display=secondary?'':'none';
        });
      }
      this._flows={
        pv:{power:Math.max(0,visualPv??0),dir:1,color:color(this._nodes.pv.color,T.pv)},
        grid:{power:visualGrid===null?0:Math.abs(visualGrid),dir:grid!==null&&grid<0?-1:1,color:color(this._nodes.grid.color,T.grid)},
        battery:{power:visualBattery===null?0:Math.abs(visualBattery),dir:battery!==null&&battery<0?-1:1,color:fixedBatteryColor}
      };
      // Die Geschwindigkeit ist ausschließlich von animation.speed abhängig,
      // niemals von der aktuellen Leistung oder der Bildschirmgröße.
      const minimum=Math.max(0,n(this._config.min_flow_w,0));
      const rate=clamp(n(this._config.animation?.speed,1),0,3);
      for(const r of this._routes){
        const flow=this._flows[r.key];
        r.target=flow.power>minimum&&rate>0?1:0;
        r.dir=flow.dir;
        r.color=flow.color;
        r.group.style.setProperty('--route-color',flow.color);
        const style=['dots','comet','pulse','dash'].includes(this._config.animation?.style)?this._config.animation.style:'dots';
        r.group.querySelector('.line-dashes').style.opacity=r.target&&style==='dash'?'1':'0';
        r.targetSpeed=r.target?(r.length / 3.5) * rate:0; // immer 3,5 s / Faktor je Strecke
        r.visibleCount=clamp(Math.round(n(this._config.animation?.max_drops,3)),1,5);
        r.group.querySelectorAll('.flow-atom').forEach((atom,i)=>atom.style.display=style==='dash'||!r.target||i>=r.visibleCount?'none':'');
      }
      // HA aktualisiert hass häufig auch ohne geänderte Energieflüsse.
      // Bei 0 W keine nutzlose 60-FPS-Animation weiterlaufen lassen.
      if(this._routes.some(r=>r.target))this._start();else this._stop();
    }
    _setupRoutes(){
      this._routes=[];
      const style=['dots','comet','pulse','dash'].includes(this._config.animation?.style)?this._config.animation.style:'dots';
      for(const group of this.shadowRoot.querySelectorAll('.flow-route')){
        const route=group.querySelector('.line-track');
        const length=route.getTotalLength();
        const particles=group.querySelector('.particles');
        const atoms=[];
        for(let i=0;i<5;i++){
          const g=document.createElementNS(SVG,'g');g.classList.add('flow-atom');g.setAttribute('aria-hidden','true');
          const glow=document.createElementNS(SVG,'ellipse');glow.classList.add('atom-glow');
          // Lokale X-Achse zeigt immer in Flussrichtung; (0,0) liegt exakt
          // auf dem SVG-Pfad. Keine vertikal versetzte Partikelform.
          glow.setAttribute('rx',style==='pulse'?'15':'9');glow.setAttribute('ry',style==='pulse'?'5':'6');g.appendChild(glow);
          if(style==='pulse'){
            const p=document.createElementNS(SVG,'ellipse');p.classList.add('atom-inner');p.setAttribute('rx','12');p.setAttribute('ry','4.5');g.appendChild(p);
          } else {
            const p=document.createElementNS(SVG,'circle');p.classList.add('atom-inner');p.setAttribute('r',style==='comet'?'6':'4.2');g.appendChild(p);
            if(style==='comet')for(let k=0;k<3;k++){const tail=document.createElementNS(SVG,'circle');tail.classList.add('atom-inner');tail.setAttribute('cx',String(-7-k*4));tail.setAttribute('cy','0');tail.setAttribute('r',String(3.5-k*.9));tail.style.opacity=String(.4-k*.1);g.appendChild(tail);}
          }
          particles.appendChild(g);atoms.push(g);
        }
        const origin=route.getPointAtLength(0);
        const destination=route.getPointAtLength(length);
        const linearPath=/^\s*M[\d\s.,+-]+L[\d\s.,+-]+\s*$/i.test(route.getAttribute('d')||'');
        const baseRotation=Math.atan2(destination.y-origin.y,destination.x-origin.x)*180/Math.PI;
        this._routes.push({key:group.dataset.route,layout:group.closest('svg')?.classList.contains('mobile')?'mobile':'desktop',group,path:route,length,atoms,
          linearPath,origin,destination,baseRotation,phase:0,dashOffset:0,speed:0,targetSpeed:0,dir:1,target:0,visibleCount:3});
      }
    }
    _start(){
      if(this._raf||!this.isConnected||!this._rendered||!this._hass||!this._inView||document.hidden||this._reduceMotion.matches||!this._routes.some(r=>r.target))return;
      this._lastFrame=0;this._lastPaint=0;
      this._raf=requestAnimationFrame(t=>this._tick(t));
    }
    _stop(){if(this._raf)cancelAnimationFrame(this._raf);this._raf=0;this._lastFrame=0;this._lastPaint=0;}
    _tick(time){
      this._raf=0;
      if(!this.isConnected||!this._inView||document.hidden||!this._hass||this._reduceMotion.matches||!this._routes.some(r=>r.target))return;
      const mobile=this._mobileMedia.matches;
      const saveMobile=mobile&&this._config.animation?.mobile_power_save!==false;
      const maxFps=saveMobile?clamp(n(this._config.animation?.mobile_fps,25),10,60):60;
      if(this._lastPaint&&time-this._lastPaint<1000/maxFps){this._raf=requestAnimationFrame(t=>this._tick(t));return;}
      const dt=this._lastFrame?Math.min((time-this._lastFrame)/1000,.12):0;
      this._lastFrame=time;this._lastPaint=time;
      const style=['dots','comet','pulse','dash'].includes(this._config.animation?.style)?this._config.animation.style:'dots';
      const layout=mobile?'mobile':'desktop';
      const visibleLimit=saveMobile?clamp(n(this._config.animation?.mobile_max_particles,2),1,5):5;
      const rate=clamp(n(this._config.animation?.speed,1),0,3);
      const amp=clamp(n(this._config.animation?.glow,65),0,100)/100;
      for(const route of this._routes){
        // Das ausgeblendete zweite SVG wird niemals animiert.
        if(route.layout!==layout||!route.target)continue;
        route.speed+=(route.targetSpeed-route.speed)*Math.min(1,dt*3.5);
        if(route.speed<.1)continue;
        route.phase=((route.phase+dt*route.speed/route.length*route.dir)%1+1)%1;
        if(style==='dash'){
          const d=route.group.querySelector('.line-dashes');
          route.dashOffset=((route.dashOffset+dt*21*rate*1.5*route.dir)%21+21)%21;
          d.style.strokeDashoffset=String(-route.dashOffset);
          continue;
        }
        const count=Math.min(route.visibleCount,visibleLimit);
        route.atoms.forEach((atom,i)=>{
          if(i>=count){if(atom.style.display!=='none')atom.style.display='none';return;}
          if(atom.style.display==='none')atom.style.display='';
          const position=((route.phase+i/count)%1+1)%1;
          let x,y,rotation;
          if(route.linearPath){
            x=route.origin.x+(route.destination.x-route.origin.x)*position;
            y=route.origin.y+(route.destination.y-route.origin.y)*position;
            rotation=route.baseRotation+(route.dir<0?180:0);
          }else{
            const l=position*route.length;
            const point=route.path.getPointAtLength(l);
            const p1=route.path.getPointAtLength(clamp(l-1,0,route.length));
            const p2=route.path.getPointAtLength(clamp(l+1,0,route.length));
            x=point.x;y=point.y;
            rotation=Math.atan2((p2.y-p1.y)*route.dir,(p2.x-p1.x)*route.dir)*180/Math.PI;
          }
          atom.setAttribute('transform',`translate(${x.toFixed(2)} ${y.toFixed(2)}) rotate(${rotation.toFixed(1)})`);
          atom.style.opacity=String(Math.min(1,position*10,(1-position)*10));
          // Mobile: kein teurer animierter Drop-Shadow auf jedem Frame.
          if(!saveMobile)atom.style.filter=amp?`drop-shadow(0 0 ${(amp*5).toFixed(1)}px ${route.color})`:'none';
        });
      }
      this._raf=requestAnimationFrame(t=>this._tick(t));
    }
    getCardSize(){return Math.ceil(5+this._individual.filter(i=>i.show!==false).length/3);}
    getGridOptions(){return {columns:12,min_columns:6,rows:'auto'};}
  }

  const EDITOR_CSS=`
    :host{display:block;color:var(--primary-text-color)}*{box-sizing:border-box}
    .wrap{font-family:var(--paper-font-body1_-_font-family,system-ui,sans-serif);font-size:13px;display:grid;gap:9px}
    .intro{font-size:12px;color:var(--secondary-text-color);padding:5px 1px 9px;line-height:1.5}
    details{border:1px solid var(--divider-color,#c8d8df);border-radius:11px;overflow:hidden}summary{cursor:pointer;background:var(--secondary-background-color,rgba(115,135,155,.1));font-weight:700;padding:12px 13px}
    .in{padding:12px}.fields{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:9px}
    .field{display:flex;flex-direction:column;gap:4px;min-width:0;font-size:11px}.field.wide{grid-column:1/-1}
    label{font-weight:600;color:var(--secondary-text-color)}input,select{font:inherit;font-size:13px;min-width:0;width:100%;color:var(--primary-text-color);background:var(--card-background-color,#fff);border:1px solid var(--divider-color,#b9c9cf);border-radius:8px;min-height:36px;padding:7px 8px}
    textarea{font:inherit;font-size:13px;min-width:0;width:100%;color:var(--primary-text-color);background:var(--card-background-color,#fff);border:1px solid var(--divider-color,#b9c9cf);border-radius:8px;padding:8px;resize:vertical;min-height:100px}
    input[type=checkbox]{height:18px;width:18px;min-height:18px;align-self:flex-start;accent-color:#18b7d5}
    .color-control{display:flex;gap:8px;align-items:center;min-width:0;width:100%}
    .color-control input[type=color]{width:44px;min-width:44px;max-width:44px;height:36px;padding:3px;flex:none;cursor:pointer;appearance:auto}
    .color-control input[data-color-hex]{min-width:0;flex:1;width:100%;font-family:ui-monospace,SFMono-Regular,Consolas,monospace}
    .color-control input[data-color-hex]:invalid{border-color:#d65e67}
    .item{border:1px solid var(--divider-color,#bccbd5);border-radius:9px;padding:10px;margin-bottom:10px}.itemtop{display:flex;gap:6px;align-items:center;justify-content:space-between;font-weight:700;margin-bottom:9px}.itemtop span{overflow:hidden;text-overflow:ellipsis;white-space:nowrap}
    button{border:1px solid var(--divider-color,#bdcdd7);background:var(--card-background-color,#fff);padding:7px 10px;border-radius:8px;color:var(--primary-text-color);font-weight:650;cursor:pointer}.controls{display:flex;gap:4px}.add{margin-top:4px;color:#03aacd;width:100%}.note{font-size:11px;color:var(--secondary-text-color);margin:8px 0 12px;line-height:1.4}
    @media(max-width:420px){.fields{grid-template-columns:1fr}}
  `;
  class EmhPowerFlowEditor extends HTMLElement{
    constructor(){super();this.attachShadow({mode:'open'});this._config={};this._hass=null;this._initialized=false;
      this.shadowRoot.addEventListener('change',e=>this._change(e));
      this.shadowRoot.addEventListener('input',e=>this._syncColorPreview(e));
      this.shadowRoot.addEventListener('click',e=>this._action(e));
    }
    setConfig(config){this._config=clone(config||{});this._render();}
    set hass(hass){this._hass=hass;this._datalist();}
    connectedCallback(){if(!this._initialized)this._render();}
    _field(label,path,val,options={}){
      const wide=options.wide?' wide':'';
      let input='';
      if(options.options)input=`<select data-path="${esc(path)}">${options.options.map(([value,name])=>`<option value="${esc(value)}" ${String(val)===String(value)?'selected':''}>${esc(name)}</option>`).join('')}</select>`;
      else if(options.multiline)input=`<textarea data-path="${esc(path)}" rows="5">${esc(val??'')}</textarea>`;
      else if(options.check)input=`<input type="checkbox" data-path="${esc(path)}" ${val===true?'checked':''}>`;
      else if(options.colorPicker || /\.(?:color|alert_color|highlight_active_color|charge_ring_color|discharge_ring_color)$/.test(path)){
        const valid=/^#[0-9a-f]{6}$/i.test(String(val??''));
        const pickerValue=valid?String(val):'#50d584';
        input=`<div class="color-control"><input type="color" data-color-path="${esc(path)}" value="${esc(pickerValue)}" aria-label="${esc(label)} auswählen"><input type="text" data-path="${esc(path)}" data-color-hex value="${esc(val??pickerValue)}" pattern="#[0-9a-fA-F]{6}" spellcheck="false" maxlength="7" placeholder="#RRGGBB" aria-label="${esc(label)} als HEX-Wert"></div>`;
      }
      else input=`<input data-path="${esc(path)}" ${options.number?'type="number" step="any"':''} ${options.entity?'list="emh-flow-entities"':''} value="${esc(val??'')}" placeholder="${esc(options.placeholder||'')}">`;
      return `<div class="field${wide}"><label>${esc(label)}</label>${input}</div>`;
    }
    _render(){
      // HA ruft nach jeder Änderung setConfig() erneut auf. Das Neuzeichnen
      // darf nicht die aktuell aufgeklappte Einstellungsgruppe schließen.
      const oldSections=this.shadowRoot.querySelectorAll('details[data-section]');
      const openSections=oldSections.length
        ? new Set([...oldSections].filter(el=>el.open).map(el=>el.dataset.section)) : null;
      this._initialized=true;
      const c=this._config,entity={...ENTITY_DEFAULTS,...(c.entities||{})};
      const nodes={};Object.keys(NODES_DEFAULT).forEach(k=>nodes[k]={...NODES_DEFAULT[k],...(c.nodes?.[k]||{})});
      const individuals=normalizeIndividuals(c.individual);
      const entityRows=[['pv','PV-Leistung (W)'],['grid_import','Netzbezug (W)'],['grid_export','Netzeinspeisung (W)'],['grid_power','Netzleistung vorzeichenbehaftet (W)'],['battery_charge','Batterie laden (W)'],['battery_discharge','Batterie entladen (W)'],['battery_power','Batterieleistung vorzeichenbehaftet (W)'],['battery_soc','Batterie-SOC (%)'],['fossil','Fossiler Stromanteil (%)'],['pv_to_home','PV direkt zum Haus (optional)'],['grid_to_home','Netz direkt zum Haus (optional)'],['battery_to_home','Batterie direkt zum Haus (optional)']];
      const nodeFields=['pv','grid','battery','home'].map(id=>{
        const item=nodes[id];
        return `<div class="item"><div class="itemtop">${esc(id.toUpperCase())}</div><div class="fields">
          ${this._field('Anzeigename',`nodes.${id}.name`,item.name)}
          ${this._field('Nulltoleranz / Anzeige erst ab (W)',`nodes.${id}.zero_tolerance_w`,item.zero_tolerance_w??10,{number:true})}
          ${this._field('Symbol',`nodes.${id}.icon`,item.icon)}
          ${id==='battery'?this._field('Batteriesymbol',`nodes.battery.icon_style`,item.icon_style||'horizontal',{options:[['horizontal','Liegend, mit dynamischer SOC-Füllung'],['classic','Klassisch (MDI)']]}):''}
          ${id==='battery'?this._field('Nur Batteriesymbol und Prozent nach SOC färben (Ringfarbe bleibt fest)',`nodes.battery.use_soc_colors`,item.use_soc_colors!==false,{check:true}):''}
          ${id==='battery'?this._field('Batterie-Außenring – Quelle',`nodes.battery.ring_source`,item.ring_source||'soc',{options:[['soc','SOC / Prozent'],['power','Laden / Entladen (Leistung)'],['custom','Freie Ring-Entität']]}):''}
          ${id==='battery'&&(item.ring_source||'soc')==='power'?`${this._field('100 % Lade-/Entladeleistung aus',`nodes.battery.power_ring_max_mode`,item.power_ring_max_mode||'fixed',{options:[['fixed','Festem Wert'],['entity','Entität']]})}
            ${(item.power_ring_max_mode||'fixed')==='entity'
              ?`${this._field('100 % Leistung – Entität',`nodes.battery.power_ring_max_entity`,item.power_ring_max_entity,{entity:true,wide:true})}${this._field('Einheit der maximalen Entität',`nodes.battery.power_ring_max_entity_unit`,item.power_ring_max_entity_unit||'W',{options:[['W','W'],['kW','kW']]})}`
              :`${this._field('100 % Leistung',`nodes.battery.power_ring_max`,item.power_ring_max??5000,{number:true})}${this._field('Leistungseinheit',`nodes.battery.power_ring_unit`,item.power_ring_unit||'W',{options:[['W','W'],['kW','kW']]})}`}
            `:''}
          ${this._field('Farbe HEX',`nodes.${id}.color`,item.color)}
          ${this._field('Popup-Hash / Link',`nodes.${id}.popup`,item.popup)}
          ${id==='home'?'':`${this._field('Ring-Wert (Entität)',`nodes.${id}.ring_entity`,item.ring_entity,{entity:true,wide:true})}
          ${this._field('Ring-Maximum aus',`nodes.${id}.ring_max_mode`,item.ring_max_mode||'fixed',{options:[['fixed','Festem Wert'],['entity','Entität']]})}
          ${(item.ring_max_mode||'fixed')==='entity'
            ?`${this._field('Ring-Maximum – Entität',`nodes.${id}.ring_max_entity`,item.ring_max_entity,{entity:true,wide:true})}${this._field('Einheit der maximalen Entität',`nodes.${id}.ring_max_entity_unit`,item.ring_max_entity_unit||(id==='battery'?'%':'W'),{options:[['W','W'],['kW','kW'],['%','%']]})}`
            :`${this._field('Ring-Maximum – fester Wert',`nodes.${id}.ring_max`,item.ring_max,{number:true})}`}
          ${this._field('Ring-Einheit bei festem Maximum',`nodes.${id}.ring_unit`,item.ring_unit||(id==='battery'?'%':'W'),{options:[['W','Watt (W)'],['kW','Kilowatt (kW)'],['%','Prozent (%)']]})}
          ${this._field('Sensor-Einheit (falls in HA fehlend)',`nodes.${id}.ring_value_unit`,item.ring_value_unit||'auto',{options:[['auto','Automatisch'],['W','W'],['kW','kW'],['%','%']]})}`}
          ${id==='home'?'':`
          ${this._field('Zusatzzeile – Anzeige',`nodes.${id}.secondary_mode`,item.secondary_mode||'default',{options:[['default','Standardinformation (automatisch)'],['text','Fester Text'],['state','Entitätszustand'],['entity','Numerischer Sensorwert']]})}
          ${(item.secondary_mode||'default')==='text'
            ? this._field('Zusatzzeile – fester Text',`nodes.${id}.secondary_text`,item.secondary_text,{wide:true}) : ''}
          ${(item.secondary_mode||'default')==='state'||(item.secondary_mode||'default')==='entity'
            ? `${this._field('Zusatzzeile – Entität',`nodes.${id}.secondary_entity`,item.secondary_entity,{entity:true,wide:true})}
               ${this._field('Beschriftung (optional)',`nodes.${id}.secondary_label`,item.secondary_label)}
               ${(item.secondary_mode||'default')==='entity'
                 ? this._field('Einheit (leer = automatisch)',`nodes.${id}.secondary_unit`,item.secondary_unit)
                 : ''}` : ''}`}
          ${id==='grid'?`${this._field('Lastspitzen-Entität (Istleistung)',`nodes.grid.alert_entity`,item.alert_entity,{entity:true,wide:true})}
          ${this._field('Roter Warnring ab – Quelle',`nodes.grid.alert_threshold_mode`,item.alert_threshold_mode||'fixed',{options:[['fixed','Fester Wert'],['entity','Entität']]})}
          ${(item.alert_threshold_mode||'fixed')==='entity'
            ?`${this._field('Roter Warnring ab – Entität',`nodes.grid.alert_threshold_entity`,item.alert_threshold_entity,{entity:true,wide:true})}${this._field('Einheit der Warnschwellen-Entität',`nodes.grid.alert_threshold_entity_unit`,item.alert_threshold_entity_unit||'W',{options:[['W','W'],['kW','kW']]})}`
            :`${this._field('Roter Warnring ab – fester Wert',`nodes.grid.alert_threshold_w`,item.alert_threshold_w,{number:true})}${this._field('Einheit Warnschwelle',`nodes.grid.alert_threshold_unit`,item.alert_threshold_unit||'W',{options:[['W','Watt (W)'],['kW','Kilowatt (kW)']]})}`}
          ${this._field('Farbe des Warnrings (HEX)',`nodes.grid.alert_color`,item.alert_color||T.warning)}${this._field('Warnung ab % des Grenzwerts',`nodes.grid.alert_from_percent`,item.alert_from_percent,{number:true})}`:''}
          ${this._field('Knoten anzeigen',`nodes.${id}.show`,item.show!==false,{check:true})}
        </div></div>`;
      }).join('');
      const individualFields=individuals.map((item,index)=>`<div class="item">
        <div class="itemtop"><span>${index+1}. ${esc(item.name)}</span><div class="controls"><button data-act="up" data-index="${index}" ${index===0?'disabled':''}>↑</button><button data-act="down" data-index="${index}" ${index===individuals.length-1?'disabled':''}>↓</button><button data-act="delete" data-index="${index}">×</button></div></div>
        <div class="fields">
          ${this._field('ID',`individual.${index}.id`,item.id)}${this._field('Name',`individual.${index}.name`,item.name)}
          ${this._field('Haupt-Entität',`individual.${index}.entity`,item.entity,{entity:true,wide:true})}
          ${this._field('Einheit der Haupt-Entität überschreiben',`individual.${index}.entity_unit`,item.entity_unit||'auto',{wide:true,options:[['auto','Automatisch (Home Assistant)'],['W','W'],['kW','kW'],['MW','MW']]})}
          ${this._field('Symbol',`individual.${index}.icon`,item.icon)}${this._field('Popup-Hash / Link',`individual.${index}.popup`,item.popup)}
          ${this._field('Zusatzzeile-Modus',`individual.${index}.secondary_mode`,item.secondary_mode||(item.secondary_entity?'entity':'text'),{options:[['text','Fester Text'],['state','Entitätszustand'],['entity','Numerischer Sensorwert']]})}
          ${this._field('Text',`individual.${index}.secondary_text`,item.secondary_text,{wide:true})}
          ${this._field('Zusatz-Entität / Zustand',`individual.${index}.secondary_entity`,item.secondary_entity,{entity:true,wide:true})}
          ${this._field('Beschriftung',`individual.${index}.secondary_label`,item.secondary_label)}${this._field('Einheit (leer = automatisch)',`individual.${index}.secondary_unit`,item.secondary_unit)}
          ${this._field('Zusatzzeile erst ab Leistung (W) einschalten',`individual.${index}.secondary_show_above_enabled`,item.secondary_show_above_enabled===true,{check:true})}
          ${this._field('Leistungsschwelle (W)',`individual.${index}.secondary_threshold_w`,item.secondary_threshold_w??500,{number:true})}
          ${this._field('Aktiv-Schatten bei Überschreiten aktivieren',`individual.${index}.highlight_active_enabled`,item.highlight_active_enabled===true,{check:true})}
          ${this._field('Farbe Aktiv-Schatten (#RRGGBB)',`individual.${index}.highlight_active_color`,item.highlight_active_color||'#50d584')}
          ${this._field('Multiplikator',`individual.${index}.multiplier`,item.multiplier??1,{number:true})}
          ${this._field('Als Erzeuger (statt Verbraucher)',`individual.${index}.reverse_flow`,item.reverse_flow===true,{check:true})}
          ${this._field('Vom berechneten Hausverbrauch abziehen',`individual.${index}.deduct_from_home`,item.deduct_from_home===true,{check:true})}
          ${this._field('Nulltoleranz / Anzeige erst ab (W)',`individual.${index}.zero_tolerance_w`,item.zero_tolerance_w??10,{number:true})}
          ${this._field('Anzeigen',`individual.${index}.show`,item.show!==false,{check:true})}
        </div></div>`).join('');
      this.shadowRoot.innerHTML=`<style>${EDITOR_CSS}</style><div class="wrap">
        <div class="intro">EMH Power Flow v${VERSION} · Karteneinstellungen</div>
        <details data-section="general" open><summary>Allgemeines</summary><div class="in fields">
          ${this._field('Theme','theme',c.theme||'auto',{options:[['auto','Home Assistant'],['dark','Dunkel (graue Kacheln)'],['light','Hell']]})}
          <p class="note">Hausleistung = PV + Netzbezug + Batterieentladung − Einspeisung − Batterieladung − optionale Individual-Abzüge (W). Kein doppeltes Zählen.</p>
          ${this._field('Animation ab Leistung (W)','min_flow_w',c.min_flow_w??0,{number:true})}
          ${this._field('Hintergrund transparent','appearance.transparent_background',c.appearance?.transparent_background!==false,{check:true})}
          ${this._field('Ringbreite in % (50 = halb so breit)','appearance.ring_width_percent',c.appearance?.ring_width_percent??50,{number:true})}
        </div></details>
        <details data-section="animation"><summary>Animation – konstante Geschwindigkeit</summary><div class="in fields">
          ${this._field('Animationsart','animation.style',['dots','comet','pulse','dash'].includes(c.animation?.style)?c.animation.style:'dots',{options:[['dots','Lichtpunkte'],['comet','Kometen'],['pulse','Energieimpulse'],['dash','Fließende Striche']]})}
          ${this._field('Geschwindigkeit (0-3)', 'animation.speed',c.animation?.speed??1,{number:true})}
          ${this._field('Leuchtstärke (0–100)', 'animation.glow',c.animation?.glow??65,{number:true})}
          ${this._field('Maximale Partikel (1–5)','animation.max_drops',c.animation?.max_drops??3,{number:true})}
          ${this._field('Mobil: Energiesparmodus aktiv','animation.mobile_power_save',c.animation?.mobile_power_save!==false,{check:true})}
          ${this._field('Mobil: Bilder pro Sekunde (10–60)','animation.mobile_fps',c.animation?.mobile_fps??25,{number:true})}
          ${this._field('Mobil: Maximale Partikel (1–5)','animation.mobile_max_particles',c.animation?.mobile_max_particles??2,{number:true})}
        </div></details>
        <details data-section="entities"><summary>Haupt-Kacheln</summary><div class="in fields">
          ${this._field('Netz – Leistungsquelle',`entities.grid_mode`,entity.grid_mode||'separate',{wide:true,options:[['separate','Getrennte Entitäten Bezug + Einspeisung'],['signed','Eine vorzeichenbehaftete Entität']]})}
          ${this._field('Batterie – Leistungsquelle',`entities.battery_mode`,entity.battery_mode||'separate',{wide:true,options:[['separate','Getrennte Entitäten Laden + Entladen'],['signed','Eine vorzeichenbehaftete Entität']]})}
          ${entityRows.filter(([key])=>{
            if((entity.grid_mode||'separate')==='signed'&&['grid_import','grid_export'].includes(key))return false;
            if((entity.grid_mode||'separate')!=='signed'&&key==='grid_power')return false;
            if((entity.battery_mode||'separate')==='signed'&&['battery_charge','battery_discharge'].includes(key))return false;
            if((entity.battery_mode||'separate')!=='signed'&&key==='battery_power')return false;
            return true;
          }).map(([key,name])=>`
             ${this._field(name,`entities.${key}`,typeof entity[key]==='string'?entity[key]:entity[key]?.entity,{entity:true,wide:true})}
             ${['pv','grid_import','grid_export','grid_power','battery_charge','battery_discharge','battery_power','pv_to_home','grid_to_home','battery_to_home'].includes(key)
               ? this._field(`Einheit überschreiben – ${name.split(' (')[0]}`,`entities.${key}_unit`,entity[`${key}_unit`]||'auto',{wide:true,options:[['auto','Automatisch (Home Assistant)'],['W','W'],['kW','kW'],['MW','MW']]}) : ''}
          `).join('')}
          ${(entity.grid_mode||'separate')==='signed'?this._field('Netz – Vorzeichen umkehren',`entities.grid_invert_sign`,entity.grid_invert_sign===true,{check:true}):''}
          ${(entity.battery_mode||'separate')==='signed'?this._field('Batterie – Vorzeichen umkehren',`entities.battery_invert_sign`,entity.battery_invert_sign===true,{check:true}):''}
          <p class="note">Vorzeichen bei EINER Entität: Netz + Bezug / − Einspeisung, Batterie + Entladen / − Laden. Bei umgekehrter Konvention Checkbox aktivieren.</p>
        </div></details>
        <details data-section="rings"><summary>Ringe, Farben und Lastspitzenwarnung</summary><div class="in">${nodeFields}</div></details>
        <details data-section="individual" open><summary>Individual-Kacheln (${individuals.length}/6)</summary><div class="in"><p class="note">Drei pro Reihe. Optional einzelne Verbraucher vom Hausbilanzwert abziehen – nur wenn deren Messung nicht schon anderweitig abgezogen wurde. Die alte Einstellung „in Hausverbrauch summieren“ wird nicht als Abzug interpretiert.</p>${individualFields}<button class="add" data-act="add" ${individuals.length>=6?'disabled':''}>+ Individual hinzufügen</button></div></details>
        <details data-section="display"><summary>Sichtbarkeit</summary><div class="in fields">
          ${this._field('Live-Anzeige (unabhängig vom Titel)','display.live',c.display?.live!==false,{check:true})}
          ${this._field('Info-Button (?)','display.info_button',c.display?.info_button!==false,{check:true})}
          ${this._field('Fußzeile insgesamt','display.footer',c.display?.footer!==false,{check:true})}
          
          ${this._field('PV-/Netz-/Batterieanteile','display.energy_split',c.display?.energy_split!==false,{check:true})}
          ${this._field('Fossiler Stromanteil','display.fossil',c.display?.fossil!==false,{check:true})}
        </div></details>
        <details data-section="info"><summary>Information / Hilfe (?)</summary><div class="in fields">
          ${this._field('Titel der Hilfe','info.title',c.info?.title??'EMH Energiefluss – Erklärung',{wide:true})}
          ${this._field('Frei editierbarer Hilfetext','info.description',c.info?.description??'Diese Karte zeigt die aktuellen Leistungsflüsse zwischen Photovoltaik, Netz, Batteriespeicher und Haus.',{wide:true,multiline:true})}
          ${this._field('Standard-Erklärung zusätzlich anzeigen','info.show_default_guide',c.info?.show_default_guide!==false,{check:true})}
          <p class="note">Das Fragezeichen rechts oben öffnet die Beschreibung, die Farblegende und die Erklärung der Ringanzeigen.</p>
        </div></details><datalist id="emh-flow-entities"></datalist></div>`;
      if(openSections){
        this.shadowRoot.querySelectorAll('details[data-section]').forEach(el=>{
          el.open=openSections.has(el.dataset.section);
        });
      }
      this._datalist();
    }
    _datalist(){const el=this.shadowRoot.querySelector('#emh-flow-entities');if(!el||!this._hass?.states)return;el.innerHTML=Object.keys(this._hass.states).sort().slice(0,2500).map(k=>`<option value="${esc(k)}"></option>`).join('');}
    _syncColorPreview(e){
      const input=e.target;
      const path=input.dataset.colorPath||input.dataset.path;
      if(!path)return;
      const pair=[...this.shadowRoot.querySelectorAll('input[data-path],input[data-color-path]')]
        .filter(el=>el!==input&&(el.dataset.path||el.dataset.colorPath)===path);
      if(input.type==='color'){
        const hex=pair.find(el=>el.hasAttribute('data-color-hex'));
        if(hex)hex.value=input.value;
      } else if(input.hasAttribute('data-color-hex')&&/^#[0-9a-f]{6}$/i.test(input.value)){
        const picker=pair.find(el=>el.type==='color');
        if(picker)picker.value=input.value;
      }
    }
    _change(e){
      const path=e.target.dataset.path||e.target.dataset.colorPath;if(!path)return;
      let val=e.target.type==='checkbox'?e.target.checked:e.target.value;
      // Bei HEX-Farben nur gültige #RRGGBB-Werte speichern.
      if(e.target.hasAttribute('data-color-hex')){
        val=String(val).trim();
        if(!/^#[0-9a-f]{6}$/i.test(val)){
          e.target.setCustomValidity('Bitte eine sechsstellige HEX-Farbe eingeben, z. B. #50d584.');
          e.target.reportValidity();return;
        }
        e.target.setCustomValidity('');
      }
      if(e.target.type==='number'){val=val===''?undefined:Number(val);if(val!==undefined&&!Number.isFinite(val))return;}
      const cfg=clone(this._config);const parts=path.split('.');
      if(parts[0]==='individual'){
        if(!Array.isArray(cfg.individual))cfg.individual=normalizeIndividuals();
        const item=cfg.individual[Number(parts[1])];if(!item)return;item[parts[2]]=val;
      } else if(parts.length===1)cfg[parts[0]]=val;
      else {cfg[parts[0]]=cfg[parts[0]]||{};if(parts.length===2)cfg[parts[0]][parts[1]]=val;
        else {cfg[parts[0]][parts[1]]=cfg[parts[0]][parts[1]]||{};cfg[parts[0]][parts[1]][parts[2]]=val;}}
      this._config=cfg;this._emit();
    }
    _action(e){const b=e.target.closest('button[data-act]');if(!b)return;
      e.preventDefault();const cfg=clone(this._config);cfg.individual=normalizeIndividuals(cfg.individual);
      const i=Number(b.dataset.index);
      if(b.dataset.act==='add'){
        if(cfg.individual.length>=6)return;const k=cfg.individual.length+1;
        cfg.individual.push({id:`consumer-${k}`,name:`Verbraucher ${k}`,entity:'sensor.',icon:'mdi:power-plug',popup:'',secondary_mode:'text',secondary_text:'Verbrauch aktuell',secondary_show_above_enabled:false,secondary_threshold_w:500,highlight_active_enabled:false,highlight_active_color:'#50d584',include_in_home:false,deduct_from_home:false,zero_tolerance_w:10});
      } else if(b.dataset.act==='delete')cfg.individual.splice(i,1);
      else if(b.dataset.act==='up'&&i>0)[cfg.individual[i],cfg.individual[i-1]]=[cfg.individual[i-1],cfg.individual[i]];
      else if(b.dataset.act==='down'&&i<cfg.individual.length-1)[cfg.individual[i],cfg.individual[i+1]]=[cfg.individual[i+1],cfg.individual[i]];
      else return;
      this._config=cfg;this._emit();this._render();
    }
    _emit(){this.dispatchEvent(new CustomEvent('config-changed',{detail:{config:clone(this._config)},bubbles:true,composed:true}));}
  }

  customElements.define(CARD,EmhPowerFlowCard);
  customElements.define(EDITOR,EmhPowerFlowEditor);
  window.customCards=window.customCards||[];
  window.customCards.push({type:CARD,name:'EMH Power Flow',preview:true,description:'PV/Netz/Batterie mit dynamischen Füllringen, berechnete Hausbilanz, Energieherkunftsring, konstante Animation und bis zu sechs Individual-Verbraucher.'});
  window.EMHPowerFlowVersion=VERSION;
  console.info(`EMH Power Flow Card v${VERSION} loaded`);
})();
