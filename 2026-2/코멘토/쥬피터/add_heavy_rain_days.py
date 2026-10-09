import pandas as pd, zipfile, io
from pathlib import Path
root=Path('/mnt/data')
meta=pd.read_csv(root/'META_관측지점정보.csv',encoding='cp949')
meta['시도']=meta['지점주소'].fillna('').str.split().str[0].replace({'서울특별시':'서울','부산광역시':'부산','대구광역시':'대구','인천광역시':'인천','광주광역시':'광주','대전광역시':'대전','울산광역시':'울산','세종특별자치시':'세종','경기도':'경기','강원특별자치도':'강원','충청북도':'충북','충청남도':'충남','전북특별자치도':'전북','전라남도':'전남','경상북도':'경북','경상남도':'경남','제주특별자치도':'제주','(산지)강원특별자치도':'강원','(산지)강원도':'강원','전라북도':'전북','전남광주통합특별시':'전남'})
meta.loc[meta['지점'].eq(156),'시도']='광주'
frames=[]
with zipfile.ZipFile(root/'기상청 ASOS 강우자료.zip') as z:
 for f in z.namelist():
  if not f.endswith('.csv'):continue
  d=pd.read_csv(io.BytesIO(z.read(f)),encoding='cp949')
  d['일시']=pd.to_datetime(d['일시'],errors='coerce')
  d['강수량(mm)']=pd.to_numeric(d['강수량(mm)'],errors='coerce')
  frames.append(d)
raw=pd.concat(frames,ignore_index=True)
print('raw',raw.shape,'invalid',raw['일시'].isna().sum(),raw['강수량(mm)'].isna().sum(),'duplicates',raw.duplicated(['지점','일시']).sum())
raw=raw.dropna(subset=['일시','강수량(mm)']).drop_duplicates(['지점','일시'])
raw['연도']=raw['일시'].dt.year
raw['날짜']=raw['일시'].dt.normalize()
daily=raw.groupby(['연도','지점','날짜'],as_index=False)['강수량(mm)'].sum().rename(columns={'강수량(mm)':'일강수량_mm'})
daily['호우일_80mm이상']=daily['일강수량_mm']>=80
station=daily.groupby(['연도','지점'],as_index=False).agg(호우일수_80mm이상=('호우일_80mm이상','sum'),관측일수=('날짜','nunique'),최대일강수량_재계산_mm=('일강수량_mm','max'))
station=station.merge(meta[['지점','시도']].drop_duplicates('지점',keep='last'),on='지점',how='left',validate='many_to_one')
print('unmapped',station[station['시도'].isna()]['지점'].unique())
region=station.dropna(subset=['시도']).groupby(['연도','시도'],as_index=False).agg(평균호우일수_80mm이상=('호우일수_80mm이상','mean'),호우일발생_관측지점수=('호우일수_80mm이상',lambda x:(x>0).sum()),관측지점수_검증=('지점','nunique'),평균관측일수=('관측일수','mean'))
region['평균호우일수_80mm이상']=region['평균호우일수_80mm이상'].round(2)
region['평균관측일수']=region['평균관측일수'].round(1)
region.to_csv(root/'heavy_rain_days_by_region_2015_2024.csv',index=False,encoding='utf-8-sig')
station.to_csv(root/'heavy_rain_days_by_station_2015_2024.csv',index=False,encoding='utf-8-sig')
base=pd.read_csv(root/'final_dataset_enriched.csv',encoding='utf-8-sig')
final=base.merge(region,on=['연도','시도'],how='left',validate='one_to_one')
final.to_csv(root/'final_dataset_with_heavy_rain_days.csv',index=False,encoding='utf-8-sig')
print('region',region.shape,'final',final.shape,'missing heavy',final['평균호우일수_80mm이상'].isna().sum(),'count_diff', (final['관측지점수']!=final['관측지점수_검증']).sum())
print('example',final[['연도','시도','평균호우일수_80mm이상','평균관측일수']].head(8).to_string(index=False))
print('max station rain',daily['일강수량_mm'].max(),'station distribution',station['관측일수'].describe().to_dict())
