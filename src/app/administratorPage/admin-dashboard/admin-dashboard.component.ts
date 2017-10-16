import { AF } from './../../providers/af';
import { Component, OnInit, ElementRef, ViewChild, OnDestroy, AfterViewInit } from '@angular/core';
import { ChartComponent } from 'angular2-chartjs';

@Component({
  selector: 'app-admin-dashboard',
  templateUrl: './admin-dashboard.component.html',
  styleUrls: ['./admin-dashboard.component.css']
})
export class AdminDashboardComponent implements OnInit, AfterViewInit {


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



  chart1type = 'pie';
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


  chart2type = 'line';
  chart2data = {
    labels: ['2017-10-16', '2017-10-17'],
    datasets: []
  };
  chart2options: {
    responsive: true,
    maintainAspectRatio: false
  }

  categoryCount = 0;
  newsShareCount = 0;

  constructor(public afService: AF, private elementRef: ElementRef) {

  }

  ngAfterViewInit(): void {
    //set chart1
    this.afService.af.database.list('statistics/newsCategory').subscribe(
      categoryList => {
        this.chart1data.labels = [];
        this.chart1data.datasets[0].data = [];
        categoryList.forEach(x => {
          console.log(x.$key + ' | ' + x.$value);
          this.chart1data.labels.push(x.$key);
          this.chart1data.datasets[0].data.push(x.$value);
        });
        if (this.categoryCount != categoryList.length) {
          this.categoryCount = categoryList.length;
          this.chart1data.datasets[0].backgroundColor = this.poolColors(categoryList.length);
        }

        this.chart1.chart.update();
      }
    );

    //set chart2
    this.afService.af.database.list('statistics/newsShared').subscribe(
      newsShareList => {
        this.chart2data.labels = [];
        this.chart2data.datasets = [];
        console.log(newsShareList)
        newsShareList.forEach(date => {
          var resultArray = Object.keys(date).map(function(key){
            var retvalue = {value:date[key], key: key};
            // do something with person
            return retvalue;
        });
        console.log(resultArray);
          this.chart2data.labels.push(date.$key);
          resultArray.forEach(x=>{
            
            if(this.chart2data.datasets.find(y=> y.label == x.key)){
              
            }

            this.chart2data.datasets.push({
              label: x.key,
              data: [x.value],
              fill: false,
              borderColor: [this.dynamicColors()],
              borderWidth: 1
            });
          })
        });
        if (this.newsShareCount != newsShareList.length) {
          this.newsShareCount = newsShareList.length;
        }
        this.chart2.chart.update();
      }
    );
  }

  ngOnInit() {
  }

}
