import { Component, EventEmitter, Input, OnChanges, Output, SimpleChanges } from '@angular/core';
import { StateService } from '../state.service';
import { MatSliderModule } from '@angular/material/slider';

type IconInfo = {
  field?: string;
  text: string;
  icon: string;
  tooltip?: string;
  value?: string | ((record: any) => string | null);
  units?: string | ((record: any) => string);
};

const ICON_INFOS: IconInfo[] = [
  // these 2 icons use fields in the muni record
  {
    text: 'טמפרטורת פני השטח',
    icon: 'temperature',
    tooltip: 'לפי נתוני למ״ס 2020',
    units: 'מעלות',
    field: 'Temperatur',
    //value: (row) => "45",
  },
  {
    text: 'מדד סוציואקונומי',
    icon: 'madad',
    tooltip: 'לפי נתוני למ״ס 2020',
    units: '',
    field: 'cluster17',
    //value: (row) => "8",
  },
  // these 2 icons use fields in the stat-area record
  {
    text: 'טמפרטורת פני השטח',
    icon: 'temperature',
    tooltip: 'לפי נתוני למ״ס 2020',
    units: 'מעלות',
    field: 'median_tem',
    //value: (row) => "45",
  },
  {
    text: 'מדד סוציואקונומי',
    icon: 'madad',
    tooltip: 'לפי נתוני למ״ס 2020',
    units: '',
    field: 'cluster',
    //value: (row) => "8",
  },
  // shadowing score currently not calculated 
  // TODO: when it will be, you may need to calculate differently for muni and for stat-area!!
  {
    text: 'ציון הצללה משוקלל',
    icon: 'shadowing-score',
    tooltip: 'בקרוב...',
    units: '',
    value: (row) => "--",
  },
];

const ICON_INFOS2: IconInfo[] = [
  {
    text: 'כיסוי נוכחי',
    icon: 'current-cover',
    tooltip: 'לפי נתוני למ״ס 2020',
    units: '',
    //field: 'VegFrac',
    value: (row) => (row.VegFrac * 100).toFixed(0) + '%',
    //value: "2%",
  },
  {
    text: 'כיסוי לאחר התערבות',
    icon: 'expected-cover',
    tooltip: 'הזז את הסקרול לתוצאות',
    units: '',
    value: (row) => '?',
  },
];

const ICON_INFOS3: IconInfo[] = [
  {
    text: 'שינוי בטמפרטורה',
    icon: 'temperature-change',
    tooltip: 'הזז את הסקרול לתוצאות',
    units: 'מעלות',
    value: '0',
  },
  {
    text: 'חיסכון',
    icon: 'savings',
    tooltip: 'בקרוב...',
    units: '',
    value: '--',
  },
  {
    text: 'מניעת תחלואה',
    icon: 'prevent-sickness',
    tooltip: 'בקרוב...',
    units: '',
    value: '--',
  },
  {
    text: 'מניעת תמותה מוקדמת',
    icon: 'prevent-death',
    tooltip: 'הזז את הסקרול לתוצאות',
    units: 'בשנה',
    value: '0',
  },
];

@Component({
  selector: 'app-region',
  templateUrl: './region.component.html',
  styleUrls: ['./region.component.less'],
  // standalone: true,
  // imports: [MatSliderModule],
})
export class RegionComponent implements OnChanges {
  @Input() record: any = null;
  @Input() sources: any[] = [];
  @Input() name: string = '';
  @Input() focus: string = '';
  @Input() focusLink: string = '';

  iconInfos: IconInfo[] = [];
  iconInfos2: IconInfo[] = [];
  iconInfos3: IconInfo[] = ICON_INFOS3;
  focusParams: any = {};
  nameOfRegion: String = 'unknown'; // region could be Muni or Stat-Area - depending on which view we are in!!

  constructor(public state: StateService) {}

  ngOnChanges(): void {
    console.log('ngOnChange started');
    if (this.record) {
      console.log('REGION RECORD', this.record);
      const lastFeature = this.state.getLastFeature();
      console.log('LAST FEATURE', lastFeature);
      
      if (lastFeature) {
        // according to feature.layer.id we know if we are in stat-area or in muni
        if (lastFeature.layer.id === "prcc-settlements-data") {
          this.nameOfRegion = lastFeature.properties['Muni_Heb'];
        }
        else if (lastFeature.layer.id === "prcc-statistical-areas") {
          this.nameOfRegion = lastFeature.properties['SHEM_YISHU'] + " " + "איזור" + " " + lastFeature.properties['stat_area'];
        }
        // Hack here: I use data from lastFeature instead of record!!
        this.record = lastFeature.properties;
      }
      this.iconInfos = [];
      ICON_INFOS.forEach((iconInfo) => {
        this.populateIconInfo(iconInfo, this.iconInfos);
      });
      ICON_INFOS2.forEach((iconInfo) => {
        this.populateIconInfo(iconInfo, this.iconInfos2);
      });
      console.log('REGION ICON_INFOS', this.iconInfos);
      console.log('REGION ICON_INFOS2', this.iconInfos2);
      // iconInfo3
      this.iconInfos3[0].value = '--';
      this.iconInfos3[1].value = '--';
      this.iconInfos3[2].value = '--';
      this.iconInfos3[3].value = '--';
  

      this.focusParams = {
        focus: this.focus,
      };
    }
      
  }

  populateIconInfo(iconInfo: any, theArray: any[]) {
    let value: any | null = null;
    if (iconInfo.field) {
      value = this.record[iconInfo.field];
    } else if (typeof iconInfo.value === 'function') {
      value = iconInfo.value(this.record);
    }
    let units = iconInfo.units;
    if (typeof units === 'function') {
      units = units(this.record);
    }
    if (value !== null && value !== undefined && units !== null && units !== undefined) {
      if (typeof value === 'number') {
        value = value.toLocaleString();
      }
      //this.iconInfos.push({
      theArray.push({
        text: iconInfo.text,
        icon: iconInfo.icon,
        tooltip: iconInfo.tooltip,
        value, units,
      });
    }
  }

  // This is for the slider, see https://material.angular.io/components/slider/examples#slider-formatting
  formatLabel(value: number): string {
    if (value >= -1) {
      return Math.round(value) + '%';
    }

    return `${value}`;
  }

  // this method is called every time the slider value changes (only when draging with the mouse, not when using keyboard!)
  onDragEnd(event: any) {
    console.log('event dragEnd', event);
    console.log('slider value is now', event.value);
    // hack - access iconInfos2 by index, assuming a known structure!!
    const aoc = this.calculate_aoc(event.value);
    const sqm = this.record.SqM_Costs;
    const temperature_change = this.calculate_Temperature_change(event.value);
    this.iconInfos2[1].value = event.value.toFixed(0) + '%';
    this.iconInfos3[0].value = String(temperature_change);
    this.iconInfos3[1].value = '--';
    this.iconInfos3[2].value = '--';
    this.iconInfos3[3].value = String(aoc);
  }
  calculate_Temperature_change(slider_val_percents: number) {
    const current_ndvi = this.record.VegFrac;
    const slider_val = slider_val_percents * 0.01 ;
    const delta = slider_val - current_ndvi;
    const slopet = this.record.SlopeT;
    const temperature_change = (-1 * slopet * delta).toFixed(2);
    console.log('temperature_change=', temperature_change);
    return temperature_change;
  }

  calculate_aoc(slider_val_percents: number) {
    const current_ndvi = this.record.VegFrac;
    const slider_val = slider_val_percents * 0.01 ;
    const delta = slider_val - current_ndvi;
    const rri = Math.exp(-0.4082 * delta);
    const pafi = (rri - 1) / rri ;
    const em = this.record.EM ;
    const aoc = (-1 * pafi * em).toFixed(2) ;
    console.log("calculate_aoc, slider_val_percents=", slider_val_percents );
    console.log('current_ndvi=', current_ndvi);
    console.log('slider_val=', slider_val);
    console.log('delta=', delta);
    console.log('rri=', rri);
    console.log('pafi=', pafi);
    console.log('em=', em);
    console.log('aoc=', aoc);
    return aoc;
  }
}
function Exp(arg0: number) {
  throw new Error('Function not implemented.');
}

