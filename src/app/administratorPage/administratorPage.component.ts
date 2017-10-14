import { Router, ActivatedRoute } from '@angular/router';
import { MobileViewService } from './../providers/mobileView.service';
import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-administratorPage',
  templateUrl: './administratorPage.component.html',
  styleUrls: ['./administratorPage.component.css']
})
export class AdministratorPageComponent implements OnInit {

  labels = ['All'];

  sidenavLabels = [
    {name: 'Add news', icon: 'add', route: 'addNews'},
    {name: 'Delete news', icon: 'delete', route: 'deleteNews'},
    {name: 'Modify categories', icon: 'class', route: 'labelsPage'},
    {name: 'Manage Users', icon: 'supervisor_account', route: 'manageUsers'}
  ];
  selectedSidenav;
  
  constructor(public mobView: MobileViewService,public router: Router,  private r:ActivatedRoute) { }

  ngOnInit() {
    this.selectedSidenav = this.sidenavLabels[0]; 
  }

  onSidenavClick(sidenavItem: any){
    this.selectedSidenav = sidenavItem;
    this.router.navigate([sidenavItem.route], { relativeTo: this.r });
  }

}
