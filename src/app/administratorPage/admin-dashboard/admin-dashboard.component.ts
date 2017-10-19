import { PaginationInstance } from 'ngx-pagination';
import { AF } from './../../providers/af';
import { Component, OnInit, ElementRef, ViewChild, OnDestroy, AfterViewInit, ChangeDetectorRef } from '@angular/core';
import { ChartComponent } from 'angular2-chartjs';

@Component({
  selector: 'app-admin-dashboard',
  templateUrl: './admin-dashboard.component.html',
  styleUrls: ['./admin-dashboard.component.css']
})
export class AdminDashboardComponent implements  AfterViewInit {


  @ViewChild('chart1') chart1: ChartComponent;
  @ViewChild('chart2') chart2: ChartComponent;

  //https://github.com/chartjs/Chart.js/issues/815
  dynamicColors = function () {
    var r = Math.floor(Math.random() * 255);
    var g = Math.floor(Math.random() * 255);
    var b = Math.floor(Math.random() * 255);
    return "rgb(" + r + "," + g + "," + b + ")";
  }

  poolColors = function (a) {
    var pool = [];
    for (var i = 0; i < a; i++) {
      pool.push(this.dynamicColors());
    }
    return pool;
  }

  public config: PaginationInstance = {
    id: 'config',
    itemsPerPage: 10,
    currentPage: 1
  };

  chart1type = 'pie';

  chart1Datas = [];

  chart1data = {
    labels: [],
    datasets: [
      {
        label: "News category usage",
        data: [],
        fill: false,
        backgroundColor: [],
        borderColor: [
          "rgb(255, 255, 255)"
        ],
        borderWidth: 1
      }
    ]
  };
  chart1options = {
    responsive: true,
    maintainAspectRatio: false
  };


  chart2type = 'bar';

  chart2Datas = [];

  chart2data = {
    labels: [],
    datasets: [
      {
        label: "",
        data: [],
        fill: false,
        backgroundColor: "rgba(100, 100, 255, 1)",
        borderColor: [
          "rgb(255, 255, 255)"
        ],
        borderWidth: 1
      }
    ]
  };

  chart2dataTmp = {
    labels: [],
    datasets: [
      {
        label: "",
        data: [],
        fill: false,
        backgroundColor: ["rgba(100, 255, 100,1)"],
        borderColor: [
          "rgb(255, 255, 255)"
        ],
        borderWidth: 1
      }
    ]
  };

  chart2options = {
    responsive: true,
    maintainAspectRatio: false,
    legend: {
      display: false
    },                                                                                             
    scales: {
      yAxes: [{id: 'y-axis-1', type: 'linear', position: 'left', ticks: {min: 0}}]
    },
    layout: {
      padding: {
        left: 10,
        bottom: 5
      }
    }
  };

  categoryMaxCount = 0;
  newsShareCount = 0;

  currentChart2Index = -1;
  currentChart1Index = -1;

  chart1Titles = [];
  chart2Titles = [];

  constructor(public afService: AF, private elementRef: ElementRef, private cdRef:ChangeDetectorRef) {

  }

  ngAfterViewInit(): void {

    //50 should be anough for a while
    var chart1Backgrounds = this.poolColors(50);

    this.chart1data.datasets[0].backgroundColor = chart1Backgrounds;    

    //set chart1
    this.afService.af.database.list('statistics/newsCategory').subscribe(
      dates=>{
        this.chart1Datas = [];
        dates.forEach(
          monthlyData => {

            this.chart2Titles.push(monthlyData.$key);

            var tmpData = {labels: [], data:[]}

            console.log(monthlyData);
            var arr = Object.keys(monthlyData).map(function(key){
             return {key: key, value: monthlyData[key]};
            });
            arr.forEach(x => {
              tmpData.labels.push(x.key);
              tmpData.data.push(x.value);
            });

            this.chart1Datas.push(tmpData);
          }
        )

        if(this.currentChart1Index == -1){
          this.currentChart1Index = this.chart1Datas.length-1;
        }

        this.chart1data.labels = this.chart1Datas[this.currentChart1Index].labels;
        this.chart1data.datasets[0].data = this.chart1Datas[this.currentChart1Index].data;
        console.log(this.chart1Datas);
        this.chart1.chart.update();
      }
    );

    //set chart2
    this.afService.af.database.list('statistics/newsShared').subscribe(
      
      dates=>{
        this.chart2Datas = [];
        dates.forEach(
          monthlyData => {

            this.chart2Titles.push(monthlyData.$key);

            var tmpData = {labels: [], data:[]}

            // this.chart2dataTmp.labels = [];
            // this.chart2dataTmp.datasets[0].data = [];
            console.log(monthlyData);
            var arr = Object.keys(monthlyData).map(function(key){
             return {key: key, value: monthlyData[key]};
            });
            arr.forEach(x => {
              tmpData.labels.push(x.key);
              tmpData.data.push(x.value);
            });
    
            this.chart2Datas.push(tmpData);
          }
        )

        if(this.currentChart2Index == -1){
          this.currentChart2Index = this.chart2Datas.length-1;
        }

        this.chart2data.labels = this.chart2Datas[this.currentChart2Index].labels;
        this.chart2data.datasets[0].data = this.chart2Datas[this.currentChart2Index].data;
        console.log(this.chart2Datas);
        this.chart2.chart.update();
      }
    );


    this.cdRef.detectChanges();
  }

  onChart2Move(next?){
    if(this.currentChart2Index!=0 && !next)
      this.currentChart2Index--;
    else if(this.currentChart2Index!=this.chart2Datas.length-1 && next)
      this.currentChart2Index++;

    this.chart2data.labels = this.chart2Datas[this.currentChart2Index].labels;
    this.chart2data.datasets[0].data = this.chart2Datas[this.currentChart2Index].data;

    this.chart2.chart.update();
  }

  onChart1Move(next?){
    if(this.currentChart1Index!=0 && !next)
      this.currentChart1Index--;
    else if(this.currentChart1Index!=this.chart1Datas.length-1 && next)
      this.currentChart1Index++;

    this.chart1data.labels = this.chart1Datas[this.currentChart1Index].labels;
    this.chart1data.datasets[0].data = this.chart1Datas[this.currentChart1Index].data;

    this.chart1.chart.update();
  }

}
