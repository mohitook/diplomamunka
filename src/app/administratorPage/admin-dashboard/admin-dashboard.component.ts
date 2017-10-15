import { AF } from './../../providers/af';
import { Component, OnInit, ElementRef, ViewChild, OnDestroy, AfterViewInit } from '@angular/core';
import { ChartComponent } from 'angular2-chartjs';

@Component({
  selector: 'app-admin-dashboard',
  templateUrl: './admin-dashboard.component.html',
  styleUrls: ['./admin-dashboard.component.css']
})
export class AdminDashboardComponent implements OnInit, AfterViewInit {


  @ViewChild(ChartComponent) chart: ChartComponent;
  
  ngOnDestroy(): void {
    //this.chart.chart.destroy();
  }

//https://github.com/chartjs/Chart.js/issues/815
  dynamicColors = function() {
    var r = Math.floor(Math.random() * 255);
    var g = Math.floor(Math.random() * 255);
    var b = Math.floor(Math.random() * 255);
    return "rgb(" + r + "," + g + "," + b + ")";
}

  poolColors = function (a) {
    var pool = [];
    for(var i=0;i<a;i++){
        pool.push(this.dynamicColors());
    }
    return pool;
}


  
  type = 'pie';
  data = {
    labels: [],
    datasets: [
      {
        label: "My First dataset",
        data: [],
        fill:false,
        backgroundColor: [],
        borderColor:[  
           "rgb(255, 255, 255)"
        ],
        borderWidth:1
      }
    ]
  };
  options = {
    responsive: true,
    maintainAspectRatio: false
  };



  constructor(public afService: AF, private elementRef: ElementRef ) {
       
  }
  
  ngAfterViewInit(): void {
    this.afService.af.database.list('statistics/newsCategory').subscribe(
      categoryList=>{
       console.log('sub' );
       console.log(categoryList);
       this.data.labels = [];
       this.data.datasets[0].data = [];
       categoryList.forEach(x=>{
         console.log(x.$key + ' | ' + x.$value);
         this.data.labels.push(x.$key);
         this.data.datasets[0].data.push(x.$value);
       });
       this.data.datasets[0].backgroundColor = this.poolColors(categoryList.length);
       this.chart.chart.update();
      }
    );
  }

  ngOnInit() {
  }

}
