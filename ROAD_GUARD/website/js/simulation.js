/* 실제 센서나 AI 모델에 연결되지 않은 교육용 감지 시뮬레이션입니다. */
(function () {
  'use strict';
  const RG = window.RG = window.RG || {};
  let sensors = [];
  let selectedId = '';
  let runId = 0;
  let isRunning = false;
  const $ = id => document.getElementById(id);
  const wait = ms => new Promise(resolve=>setTimeout(resolve,ms));

  function getSelected() {return sensors.find(s=>s.id===selectedId);}
  function updateStatus(kicker,title,desc,warning=false) {
    $('statusOverline').textContent = kicker;
    $('statusTitle').textContent = title;
    $('statusDescription').textContent = desc;
    $('statusBox').classList.toggle('alert',warning);
  }
  function setStep(index) {
    for(let i=0;i<4;i++){
      $('simStep'+i).classList.toggle('current',i===index);
      $('simStep'+i).classList.toggle('done',index>i);
    }
  }
  function reset(silent=false) {
    runId++;
    isRunning=false;
    $('simulate').disabled=false;
    $('simulate').textContent='▶ 감지 시뮬레이션 시작';
    $('speciesValue').textContent='—';
    $('aiValue').textContent='대기';
    $('warningValue').textContent='꺼짐';
    setStep(-1);
    updateStatus('● 시뮬레이션 준비','감지 대기 중','버튼을 눌러 반도체 센서 → AI 분석 → 위험 경고 과정을 체험하세요.');
    if(selectedId) RG.map.highlightSensor(selectedId,false);
    if(!silent && getSelected()) $('sensorDescription').textContent = getSelected().description;
  }
  function selectSensor(id) {
    if(!sensors.some(s=>s.id===id)) return;
    selectedId=id;
    $('sensorSelect').value=id;
    reset(true);
    const sensor=getSelected();
    $('sensorDescription').textContent=`${sensor.name} · ${sensor.description}`;
    RG.map.highlightSensor(selectedId,false);
    RG.map.focusSensor(sensor);
  }
  async function simulate() {
    if(isRunning || !getSelected())return;
    const token=++runId;
    isRunning=true;
    $('simulate').disabled=true;
    $('simulate').textContent='분석 진행 중...';
    const sensor=getSelected();
    const stages=[
      {k:'● 1 / 4 · 센싱',title:'카메라 입력 수집',desc:'CMOS 이미지 센서가 주변의 빛을 전기 신호로 바꿔 영상 데이터를 만듭니다.',who:'미분류 대상',ai:'센서 입력',alert:'꺼짐',warn:false},
      {k:'● 2 / 4 · 추론',title:'엣지 AI 분석',desc:'현장 AI 장치가 학습된 객체 탐지 모델을 실행해 고라니를 구분합니다.',who:'고라니 (가상)',ai:'객체 탐지',alert:'꺼짐',warn:false},
      {k:'● 3 / 4 · 조건',title:'위험 구역 진입 판단',desc:'가상 시나리오에서 고라니가 도로 진입 구역에 접근했다고 가정합니다.',who:'고라니 (가상)',ai:'위험 판단',alert:'준비',warn:true},
      {k:'● 4 / 4 · 알림',title:'운전자 경고 표시',desc:`${sensor.name} — 가상 전광판에 '야생동물 주의'를 표시했습니다.`,who:'고라니 (가상)',ai:'판단 완료',alert:'경고 표시',warn:true}
    ];
    for(let i=0;i<stages.length;i++){
      if(token!==runId) return;
      const s=stages[i];
      updateStatus(s.k,s.title,s.desc,s.warn);
      $('speciesValue').textContent=s.who;
      $('aiValue').textContent=s.ai;
      $('warningValue').textContent=s.alert;
      setStep(i);
      RG.map.highlightSensor(selectedId,s.warn);
      await wait(1050);
    }
    if(token!==runId) return;
    isRunning=false;
    $('simulate').disabled=false;
    $('simulate').textContent='▶ 다시 시뮬레이션';
  }
  function init(inputSensors) {
    sensors=inputSensors;
    const select=$('sensorSelect');
    select.replaceChildren();
    sensors.forEach(s=>{const option=document.createElement('option');option.value=s.id;option.textContent=s.name;select.appendChild(option);});
    select.addEventListener('change',ev=>selectSensor(ev.target.value));
    $('simulate').addEventListener('click',simulate);
    $('reset').addEventListener('click',()=>reset());
    if(sensors.length) selectSensor(sensors[0].id);
  }
  RG.simulation={init,selectSensor,reset};
})();
