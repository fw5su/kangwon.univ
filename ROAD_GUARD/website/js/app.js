/* ROAD GUARD 데이터 필터·통계·카드뉴스·영상 연결 */
(function () {
  'use strict';
  const RG = window.RG = window.RG || {};
  const $ = id=>document.getElementById(id);
  const number=n=>Number(n).toLocaleString('ko-KR');
  const cardData = [
    {title:'도로 위 고라니를 먼저 발견할 수 있을까?',body:'운전자가 보지 못한 동물을 카메라와 AI가 먼저 감지하도록 설계할 수 있어요. 이제 어떤 기술이 함께 작동하는지 살펴봐요.',term:'로드킬 예방 시스템',symbol:'♧'},
    {title:'반도체가 눈이 된다고?',body:'카메라 속 CMOS 이미지 센서는 빛을 전기 신호로 바꿔요. 덕분에 컴퓨터가 주변 모습을 디지털 영상으로 받아들일 수 있죠.',term:'CMOS 이미지 센서',symbol:'◉'},
    {title:'동물까지 거리는 어떻게 알까?',body:'라이다(LiDAR)는 레이저를 보내고 반사되어 돌아오는 시간을 측정해 물체까지의 거리를 계산해요.',term:'LiDAR · 레이저 거리 측정',symbol:'⌁'},
    {title:'AI는 어떻게 고라니를 구별할까?',body:'학습된 객체 탐지 모델이 영상 속 동물의 특징을 분석해 위치와 종류를 추정해요. 사진 속 동물을 네모난 상자로 표시하는 것도 그 결과예요.',term:'딥러닝 · 객체 탐지',symbol:'▣'},
    {title:'판단을 꼭 먼 서버에서 해야 할까?',body:'엣지 AI는 데이터를 생성한 장소 근처의 장치에서 AI를 실행해요. 멀리 서버를 오가는 통신 단계를 줄이는 데 도움이 돼요.',term:'엣지 AI · 현장 추론',symbol:'◎'},
    {title:'AI 계산은 누가 담당할까?',body:'NPU는 신경망 연산을 효율적으로 수행하도록 설계한 반도체 연산 장치예요. AI 모델을 현장 장치에서 실행하는 데 활용될 수 있어요.',term:'NPU · AI 반도체',symbol:'▦'},
    {title:'기술이 모이면 위험을 줄일 수 있어요',body:'센서가 정보를 수집하고, AI가 동물을 식별하고, 위험 조건이 충족되면 운전자에게 경고해요. 기술은 사고 예방을 돕지만 모든 사고를 막는다고 보장할 수는 없어요.',term:'센싱 → AI 분석 → 경고',symbol:'↟'}
  ];
  const USE_CARD_IMAGES = false; // 카드뉴스 PNG 7장을 추가한 뒤 true로 바꾸세요.
  let currentCard=0;
  let records=[];
  let lastSelection=null;

  function fillOptions(id,values,placeholder){
    const el=$(id);el.replaceChildren();
    const all=document.createElement('option');all.value='';all.textContent=placeholder;el.appendChild(all);
    values.forEach(v=>{const opt=document.createElement('option');opt.value=String(v);opt.textContent=String(v);el.appendChild(opt);});
  }
  function selectedRecords(){
    const park=$('parkFilter').value;
    const species=$('speciesFilter').value;
    const year=$('yearFilter').value;
    return records.filter(r=>(!park||r.park_name===park)&&(!species||r.species_name===species)&&(!year||String(r.year)===year));
  }
  function countBy(rows,key) {const counts=new Map();rows.forEach(r=>counts.set(r[key],(counts.get(r[key])||0)+1));return [...counts].sort((a,b)=>b[1]-a[1] || String(a[0]).localeCompare(String(b[0]),'ko'));}
  function renderRanking(rows){
    const target=$('parkRanking');target.replaceChildren();
    const ranking=countBy(rows,'park_name').slice(0,5);
    if(!ranking.length){target.textContent='조건에 맞는 기록이 없습니다.';return;}
    const max=ranking[0][1];
    ranking.forEach(([name,count])=>{
      const line=document.createElement('div');line.className='ranking-row';
      const label=document.createElement('span');label.textContent=name;
      const track=document.createElement('div');track.className='rank-track';
      const bar=document.createElement('div');bar.className='rank-fill';bar.style.width=`${count/max*100}%`;track.appendChild(bar);
      const val=document.createElement('strong');val.textContent=number(count);
      line.append(label,track,val);target.appendChild(line);
    });
  }
  function applyFilters(){
    const rows=selectedRecords();
    $('recordCount').textContent=number(rows.length);
    $('siteCount').textContent=number(new Set(rows.map(r=>r.site_id)).size);
    $('parkCount').textContent=number(new Set(rows.map(r=>r.park_name)).size);
    $('speciesCount').textContent=number(new Set(rows.map(r=>r.species_name)).size);
    RG.map.renderRecords(rows);RG.map.fitResults();
    renderRanking(rows);
    lastSelection=null;
    $('siteDetail').className='detail-empty';
    $('siteDetail').textContent='지도의 파란 사고 기록 마커를 클릭해 보세요.';
  }
  RG.onSiteSelected=(s)=>{
    lastSelection=s;
    const target=$('siteDetail');target.className='site-content';target.replaceChildren();
    const title=document.createElement('h4');title.textContent=`${s.park} · ${number(s.count)}건`;
    const period=document.createElement('p');period.textContent=`조사일 범위: ${s.first} ~ ${s.last}`;
    const location=document.createElement('p');location.textContent=`기록 좌표: ${s.lat.toFixed(5)}, ${s.lng.toFixed(5)}`;
    const top=document.createElement('p');top.className='detail-muted';top.textContent='해당 좌표에 기록된 주요 동물';
    target.append(title,period,location,top);
    s.species.slice(0,5).forEach(([name,n])=>{
      const badge=document.createElement('span');badge.className='site-badge';badge.textContent=`${name} ${number(n)}건`;target.appendChild(badge);
    });
    const note=document.createElement('p');note.className='detail-muted';note.textContent='※ 좌표는 제공 데이터 기준이며 정확한 사고 지점과 현재 위험도는 보장하지 않습니다.';target.appendChild(note);
  };
  function updateCard(){
    const c=cardData[currentCard];
    $('cardCounter').textContent=`${String(currentCard+1).padStart(2,'0')} / 07`;
    $('cardTitle').textContent=c.title;
    $('cardBody').textContent=c.body;
    $('cardTerm').textContent=`핵심 용어 · ${c.term}`;
    $('cardSymbol').textContent=c.symbol;
    $('prevCard').disabled=currentCard===0;
    $('nextCard').disabled=currentCard===cardData.length-1;
    const img=$('cardImage'),fallback=$('cardFallback');
    if(USE_CARD_IMAGES){
      img.onload=()=>{img.hidden=false;fallback.hidden=true;};
      img.onerror=()=>{img.hidden=true;fallback.hidden=false;};
      img.alt=`${currentCard+1}번 교육 카드뉴스: ${c.title}`;
      img.src=`./assets/cardnews/card_${String(currentCard+1).padStart(2,'0')}.png`;
    }else{img.hidden=true;fallback.hidden=false;}
  }
  function initContent(){
    $('prevCard').addEventListener('click',()=>{if(currentCard>0){currentCard--;updateCard();}});
    $('nextCard').addEventListener('click',()=>{if(currentCard<cardData.length-1){currentCard++;updateCard();}});
    updateCard();
    const video=$('campaignVideo'),placeholder=$('videoPlaceholder');
    video.addEventListener('loadedmetadata',()=>{video.hidden=false;placeholder.hidden=true;});
    video.addEventListener('error',()=>{video.hidden=true;placeholder.hidden=false;});
  }
  async function init(){
    initContent();
    try{
      const sources=['./data/roadguard_sites.geojson','./data/roadguard_records.json','./data/sensors.json'];
      const responses=await Promise.all(sources.map(p=>fetch(p)));
      responses.forEach((r,i)=>{if(!r.ok)throw new Error(`${sources[i]}: HTTP ${r.status}`);});
      const [sites,data,sensors]=await Promise.all(responses.map(r=>r.json()));
      if(sites.type!=='FeatureCollection'||!Array.isArray(sites.features)||!Array.isArray(data)||!Array.isArray(sensors))throw new Error('데이터 구조가 예상과 다릅니다.');
      records=data;
      fillOptions('parkFilter',[...new Set(records.map(r=>r.park_name))].sort((a,b)=>a.localeCompare(b,'ko')),'전체 국립공원');
      fillOptions('speciesFilter',[...new Set(records.map(r=>r.species_name))].sort((a,b)=>a.localeCompare(b,'ko')),'전체 동물');
      fillOptions('yearFilter',[...new Set(records.map(r=>r.year))].sort((a,b)=>b-a),'전체 연도');
      RG.map.initMap(sites.features,sensors);
      RG.simulation.init(sensors);
      ['parkFilter','speciesFilter','yearFilter'].forEach(id=>$(id).addEventListener('change',applyFilters));
      $('clearFilters').addEventListener('click',()=>{['parkFilter','speciesFilter','yearFilter'].forEach(id=>$(id).value='');applyFilters();});
      $('fitResults').addEventListener('click',RG.map.fitResults);
      applyFilters();
    }catch(error){
      console.error('ROAD GUARD 초기화 오류:',error);
      $('loadError').hidden=false;
      $('loadError').textContent=`데이터 또는 지도 라이브러리를 불러오지 못했습니다. README의 실행 방법과 인터넷 연결을 확인해 주세요. (${error.message})`;
    }
  }
  document.addEventListener('DOMContentLoaded',init);
})();
