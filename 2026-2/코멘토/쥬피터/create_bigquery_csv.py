from pathlib import Path
import pandas as pd
source=Path('/mnt/data/final_dataset_with_heavy_rain_days.csv')
target=Path('/mnt/data/final_dataset_bigquery_ready.csv')
names=['region','year','damage_1000krw','annual_rain_mm','max_daily_rain_mm','max_hourly_rain_mm','station_count','population','area_km2','sewer_total_km','sewer_storm_km','population_density_per_km2','damage_per_10k_people_1000krw','sewer_density_km_per_km2','heavy_rain_days_avg_80mm','stations_with_heavy_rain','station_count_validation','avg_observed_days']
df=pd.read_csv(source,encoding='utf-8-sig')
assert len(df.columns)==len(names)==18
df.columns=names
df.to_csv(target,index=False,encoding='utf-8-sig')
check=pd.read_csv(target,encoding='utf-8-sig')
from pandas.testing import assert_frame_equal
assert_frame_equal(check,df,check_exact=False,rtol=1e-12,atol=1e-9)
print('CREATED',target,'rows',len(df),'columns',len(df.columns))
print('HEADERS',','.join(check.columns))
print('NULL sewer_storm_km',check.sewer_storm_km.isna().sum())
print('OTHER NULLS',check.drop(columns=['sewer_storm_km']).isna().sum().sum())
