import { AF } from './../providers/af';
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
    {name: 'Dashboard', icon: 'pie_chart', route: 'dashBoard', role:'all'},
    {name: 'Add news', icon: 'add', route: 'addNews', role:'author'},
    {name: 'Delete news', icon: 'delete', route: 'deleteNews',role:'author'},
    {name: 'Modify categories', icon: 'class', route: 'labelsPage', role:'author'},
    {name: 'Manage Users', icon: 'supervisor_account', route: 'manageUsers', role:'admin'}
  ];
  selectedSidenav;
  
  filter = {role: {$or:['all']}};
 
  constructor(public afService: AF, public mobView: MobileViewService,public router: Router,  private r:ActivatedRoute) { }

  ngOnInit() {
    this.selectedSidenav = this.sidenavLabels[0];

    var roles = ['all'];
    
    if(this.afService.user.roles.admin)
      roles.push('admin');
    if(this.afService.user.roles.author)
      roles.push('author');

    if(roles.length != 0)
      this.filter = {role: {$or:roles}}
  }

  onSidenavClick(sidenavItem: any){
    this.selectedSidenav = sidenavItem;
    this.router.navigate([sidenavItem.route], { relativeTo: this.r });
  }

}
