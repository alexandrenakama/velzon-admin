// src/app/pages/dashboards/dashboard/dashboard.component.ts

import { Component, OnInit } from '@angular/core';
import { ToastService } from './toast-service';

import { ChartType } from './dashboard.model';
import { BestSelling, Recentelling, TopSelling, statData } from 'src/app/core/data';

@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.scss']
})
export class DashboardComponent implements OnInit {
  // breadcrumb
  breadCrumbItems!: Array<{}>;

  // gráficos
  analyticsChart!: ChartType;
  SalesCategoryChart!: ChartType;

  // dados de cards e tabelas
  BestSelling: any;
  TopSelling: any;
  Recentelling: any;
  statData!: any;

  // data picker
  currentDate: { from: Date; to: Date };

  // countUp options
  num = 0;
  option = {
    startVal: this.num,
    useEasing: true,
    duration: 2,
    decimalPlaces: 2,
  };

  constructor(public ToastService: ToastService) {
    // inicializa date range para o mês atual
    const today = new Date();
    this.currentDate = {
      from: new Date(today.getFullYear(), today.getMonth(), 1),
      to: new Date(today.getFullYear(), today.getMonth() + 1, 0)
    };
  }

  ngOnInit(): void {
    // breadcrumbs
    this.breadCrumbItems = [
      { label: 'Dashboards' },
      { label: 'Dashboard', active: true }
    ];

    // notificação de login, se existir
    if (sessionStorage.getItem('toast')) {
      this.ToastService.show(
        'Logged in Successfully.',
        { classname: 'bg-success text-center text-white', delay: 5000 }
      );
      sessionStorage.removeItem('toast');
    }

    // carrega dados
    this.fetchData();

    // configura gráficos
    this._analyticsChart('["--vz-primary", "--vz-success", "--vz-danger"]');
    this._SalesCategoryChart('["--vz-primary", "--vz-success", "--vz-warning", "--vz-danger", "--vz-info"]');
  }

  // alterna série do gráfico de revenue
  setrevenuevalue(value: string) {
    const seriesMap: { [key: string]: any[] } = {
      all: [
        { name: 'Orders',  type: 'area', data: [34,65,46,68,49,61,42,44,78,52,63,67] },
        { name: 'Earnings',type: 'bar',  data: [89.25,98.58,68.74,108.87,77.54,84.03,51.24,28.57,92.57,42.36,88.51,36.57] },
        { name: 'Refunds', type: 'line', data: [ 8, 12,  7, 17, 21, 11,  5,  9,  7, 29, 12, 35] }
      ],
      '1M': [
        { name: 'Orders',  type: 'area', data: [24,75,16,98,19,41,52,34,28,52,63,67] },
        { name: 'Earnings',type: 'bar',  data: [99.25,28.58,98.74,12.87,107.54,94.03,11.24,48.57,22.57,42.36,88.51,36.57] },
        { name: 'Refunds', type: 'line', data: [28,22,17,27,21,11, 5,  9,17,29,12,15] }
      ],
      '6M': [
        { name: 'Orders',  type: 'area', data: [34,75,66,78,29,41,32,44,58,52,43,77] },
        { name: 'Earnings',type: 'bar',  data: [109.25,48.58,38.74,57.87,77.54,84.03,31.24,18.57,92.57,42.36,48.51,56.57] },
        { name: 'Refunds', type: 'line', data: [12,22,17,27, 1,51, 5,  9, 7,29,12,35] }
      ],
      '1Y': [
        { name: 'Orders',  type: 'area', data: [34,65,46,68,49,61,42,44,78,52,63,67] },
        { name: 'Earnings',type: 'bar',  data: [89.25,98.58,68.74,108.87,77.54,84.03,51.24,28.57,92.57,42.36,88.51,36.57] },
        { name: 'Refunds', type: 'line', data: [ 8,12, 7,17,21,11, 5,  9, 7,29,12,35] }
      ],
    };

    this.analyticsChart.series = seriesMap[value];
  }

  // monta o chart de revenue
  private _analyticsChart(colors: string) {
    const c = this.getChartColorsArray(colors);
    this.analyticsChart = {
      chart: { height: 370, type: 'line', toolbar: { show: false } },
      stroke: { curve: 'straight', dashArray: [0,0,8], width: [2,0,2.2] },
      colors: c,
      series: [], // será preenchido por setrevenuevalue('all') no init
      fill: { opacity: [0.1,0.9,1] },
      labels: ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'],
      xaxis: { axisTicks:{show:false}, axisBorder:{show:false} },
      grid: { xaxis:{lines:{show:true}}, yaxis:{lines:{show:false}}, padding:{top:0,right:-2,bottom:15,left:10} },
      legend:{ show:true, horizontalAlign:'center', offsetY:-5, markers:{width:9,height:9,radius:6}, itemMargin:{horizontal:10,vertical:0} },
      plotOptions:{ bar:{ columnWidth:'30%', barHeight:'70%' } }
    };
    this.setrevenuevalue('all');
  }

  // monta o chart donut Sales by Location
  private _SalesCategoryChart(colors: string) {
    const c = this.getChartColorsArray(colors);
    this.SalesCategoryChart = {
      series: [44,55,41,17,15],
      labels: ['Direct','Social','Email','Other','Referrals'],
      chart: { height: 333, type: 'donut' },
      legend: { position: 'bottom' },
      stroke: { show: false },
      dataLabels: { dropShadow:{ enabled: false } },
      colors: c
    };
  }

  // busca dados estáticos
  private fetchData() {
    this.BestSelling  = BestSelling;
    this.TopSelling   = TopSelling;
    this.Recentelling = Recentelling;
    this.statData     = statData;
  }

  // converte CSS variables para cores
  private getChartColorsArray(colors: string) {
    return JSON.parse(colors).map((val: string) => {
      const varName = val.trim();
      const cssVal = getComputedStyle(document.documentElement).getPropertyValue(varName);
      return cssVal ? cssVal.trim() : varName;
    });
  }
}
