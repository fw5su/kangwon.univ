from pathlib import Path
import pandas as pd
import numpy as np
P=Path(__file__).parent
names={'서울':'서울','서울특별시':'서울','부산':'부산','부산광역시':'부산','대구':'대구','대구광역시':'대구','인천':'인천','인천광역시':'인천','광주':'광주','광주광역시':'광주','대전':'대전','대전광역시':'대전','울산':'울산','울산광역시':'울산','세종':'세종','세종특별자치시':'세종','경기':'경기','경기도':'경기','강원':'강원','강원도':'강원','강원특별자치도':'강원','충북':'충북','충청북도':'충북','충남':'충남','충청남도':'충남','전북':'전북','전라북도':'전북','전북특별자치도':'전북','전남':'전남','전라남도':'전남','경북':'경북','경상북도':'경북','경남':'경남','경상남도':'경남','제주':'제주','제주도':'제주','제주특별자치도':'제주'}
def norm(s):return str(s).strip().replace(' ','')
def region(s):return names.get(norm(s))
def numeric(s):return pd.to_numeric(s.astype(str).str.replace(',','',regex=False).str.strip().replace({'-':np.nan,'nan':np.nan,'' : np.nan}),errors='coerce')
sewer=[]; logs=[]
for yr in range(2015,2025):
 files=list(P.glob(f'*{yr}*하수*.csv')) if yr<=2020 else list(P.glob(f'한국환경공단_하수관로시설별설치현황_{yr}1231.csv'))
 assert len(files)==1,(yr,files)
 f=files[0]
 if yr<=2020:
  raw=pd.read_csv(f,encoding='cp949',dtype=str)
  col=3 if yr<=2016 else 6
  # Annual reports contain both regional summary and nested administrative rows. Extract exactly the first 17 province-wide summary rows.
  hits=[i for i,x in enumerate(raw.iloc[:,0]) if region(x) is not None]
  chosen=raw.iloc[hits[:17]]
  assert len(chosen)==17 and len(set(chosen.iloc[:,0].map(region)))==17,(yr,chosen.iloc[:,0].tolist())
  part=pd.DataFrame({'연도':yr,'시도':chosen.iloc[:,0].map(region).values,'하수관로_총시설연장_m':numeric(chosen.iloc[:,col]).values,'하수관로_우수관연장_m':np.nan})
  method='published province-level summary; rain-only length not extracted'
 else:
  raw=pd.read_csv(f,encoding='utf-8-sig' if yr>=2024 else 'cp949',low_memory=False)
  raw['시도']=raw['시도'].map(region)
  assert raw['시도'].notna().all(),(yr,raw.loc[raw['시도'].isna()].head())
  part=raw.groupby('시도',as_index=False)[['하수관로_총시설연장','하수관로_지선분류식우수']].sum(min_count=1)
  part.columns=['시도','하수관로_총시설연장_m','하수관로_우수관연장_m'];part.insert(0,'연도',yr)
  method='sum of facility-level rows; requires cross-level validation'
 assert part['시도'].nunique()==17 and (part['하수관로_총시설연장_m']>0).all(),(yr,part)
 sewer.append(part);logs.append({'year':yr,'file':f.name,'raw_rows':len(raw),'regions':len(part),'method':method,'national_sewer_length_km':round(part['하수관로_총시설연장_m'].sum()/1000,2)})
sewer=pd.concat(sewer,ignore_index=True).sort_values(['연도','시도'])
sewer['하수관로_총시설연장_km']=sewer['하수관로_총시설연장_m']/1000
sewer['하수관로_우수관연장_km']=sewer['하수관로_우수관연장_m']/1000
sewer=sewer.drop(columns=['하수관로_총시설연장_m','하수관로_우수관연장_m'])
sewer.to_csv(P/'sewer_by_region_2015_2024.csv',index=False,encoding='utf-8-sig')
base=pd.read_csv(P/'final_dataset.csv',encoding='utf-8-sig');base['시도']=base['시도'].map(region)
assert base['시도'].notna().all()
for filename,cols in [('시도별_총인구_2015_2024(1).csv',['인구수']),('area_by_region_2015_2024(1).csv',['면적_km2'])]:
 part=pd.read_csv(P/filename,encoding='utf-8-sig');part['시도']=part['시도'].map(region)
 assert part['시도'].notna().all() and not part.duplicated(['연도','시도']).any()
 base=base.merge(part[['연도','시도']+cols],on=['연도','시도'],how='left',validate='one_to_one')
base=base.merge(sewer,on=['연도','시도'],how='left',validate='one_to_one')
base['인구밀도_명_km2']=base['인구수']/base['면적_km2']
base['인구1만명당_호우피해액_천원']=base['호우피해액_천원']/base['인구수']*10000
base['면적당_하수관로_km_km2']=base['하수관로_총시설연장_km']/base['면적_km2']
base=base.sort_values(['연도','시도']).reset_index(drop=True)
assert len(base)==166 and not base.duplicated(['연도','시도']).any()
base.to_csv(P/'final_dataset_enriched.csv',index=False,encoding='utf-8-sig')
pd.DataFrame(logs).to_csv(P/'sewer_processing_audit.csv',index=False,encoding='utf-8-sig')
print('MERGED',base.shape,'Missing values:',base.isna().sum().to_dict())
print('AUDIT:',pd.DataFrame(logs)[['year','raw_rows','national_sewer_length_km']].to_string(index=False))
print('SAVED',P/'final_dataset_enriched.csv')
