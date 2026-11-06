/* ROAD GUARD 지도 기능: 과거 기록과 가상 센서를 분리 표시합니다. */
(function () {
  'use strict';
  const RG = window.RG = window.RG || {};
  let map;
  let historicalLayer;
  let sensorLayer;
  let featureById = new Map();
  let sensorMarkers = new Map();
  let latestSites = [];

  function safe(value) {
    return String(value ?? '').replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
  }
  function format(n) { return Number(n).toLocaleString('ko-KR'); }
  function initMap(features, sensors) {
    if (typeof L === 'undefined') throw new Error('Leaflet 라이브러리를 불러오지 못했습니다. 인터넷 연결을 확인해 주세요.');
    map = L.map('map', { zoomControl: true }).setView([36.45, 127.95], 7);
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      maxZoom: 18,
      attribution: '&copy; <a href="https://www.openstreetmap.org/copyright" target="_blank" rel="noopener">OpenStreetMap</a> contributors'
    }).addTo(map);
    historicalLayer = L.layerGroup().addTo(map);
    sensorLayer = L.layerGroup().addTo(map);
    featureById = new Map(features.map(f => [f.properties.site_id, f]));
    sensors.forEach(s => {
      const marker = L.circleMarker([s.latitude, s.longitude], {
        radius: 10, color: '#fff', weight: 2.5, fillColor: '#1d9465', fillOpacity: .97
      }).bindTooltip(s.name, { direction: 'top' });
      marker.on('click', () => {
        document.getElementById('sensorSelect').value = s.id;
        RG.simulation.selectSensor(s.id);
        document.getElementById('ai-demo').scrollIntoView({behavior:'smooth',block:'nearest'});
      });
      marker.addTo(sensorLayer);
      sensorMarkers.set(s.id, marker);
    });
  }

  function renderRecords(records) {
    latestSites = [];
    historicalLayer.clearLayers();
    const grouped = new Map();
    for (const rec of records) {
      const id = rec.site_id;
      if (!grouped.has(id)) grouped.set(id, {count:0, species:new Map(), years:new Set(), dates:[],park:rec.park_name});
      const g = grouped.get(id);
      g.count++;
      g.species.set(rec.species_name,(g.species.get(rec.species_name)||0)+1);
      g.years.add(rec.year);
      if (rec.observed_date) g.dates.push(rec.observed_date);
    }
    grouped.forEach((g,id) => {
      const feature = featureById.get(id);
      if (!feature) return;
      const [lng,lat] = feature.geometry.coordinates;
      if (!Number.isFinite(lat) || !Number.isFinite(lng)) return;
      const species = [...g.species.entries()].sort((a,b)=>b[1]-a[1] || a[0].localeCompare(b[0],'ko'));
      const [topSpecies] = species[0] || ['—',0];
      const radius = Math.min(22,Math.max(6,5 + Math.sqrt(g.count)*.8));
      const marker = L.circleMarker([lat,lng], {radius,color:'#fff',weight:2,fillColor:'#3576aa',fillOpacity:.77});
      const first=g.dates.length?g.dates.slice().sort()[0]:'—';
      const last=g.dates.length?g.dates.slice().sort().at(-1):'—';
      marker.bindPopup(
        `<div class="popup-title">${safe(g.park)} · 과거 기록</div>`+
        `<div><span class="popup-label">기록 건수</span> <b>${format(g.count)}건</b></div>`+
        `<div><span class="popup-label">가장 많이 기록된 동물</span> ${safe(topSpecies)}</div>`+
        `<div><span class="popup-label">조사 기간</span> ${safe(first)} ~ ${safe(last)}</div>`+
        `<div class="popup-note">좌표 집계 기록 · 현재 위험도를 뜻하지 않습니다.</div>`
      );
      marker.on('click',()=> RG.onSiteSelected?.({id,lat,lng,park:g.park,count:g.count,first,last,species}));
      marker.addTo(historicalLayer);
      latestSites.push([lat,lng]);
    });
  }
  function fitResults() {
    if (latestSites.length) map.fitBounds(L.latLngBounds(latestSites).pad(.20),{maxZoom:13,animate:false});
    else map.setView([36.45,127.95],7);
  }
  function highlightSensor(sensorId, isAlert) {
    for(const [id,marker] of sensorMarkers.entries()){
      const selected=id===sensorId;
      marker.setStyle({radius:selected?13:9,fillColor:selected && isAlert?'#db7044':'#1d9465',fillOpacity:1,weight:selected?4:2});
    }
  }
  function focusSensor(sensor) { map.flyTo([sensor.latitude,sensor.longitude],10,{duration:.6}); }
  RG.map = {initMap,renderRecords,fitResults,highlightSensor,focusSensor};
})();
