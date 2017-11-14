import { HttpModule } from '@angular/http';
import { FormsModule } from '@angular/forms';
import { RoleGuardService } from './../providers/role-guard.service';
import { ManageUsersComponent } from './manage-users/manage-users.component';
import { LabelsPageComponent } from './labels-page/labels-page.component';
import { DeleteNewsComponent } from './delete-news/delete-news.component';
import { AddNewComponent } from './add-new/add-new.component';
import { AdminDashboardComponent } from './admin-dashboard/admin-dashboard.component';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { SharedModule } from 'app/app-shared.module';
import { AdministratorPageComponent } from './administratorPage.component';
import { Routes } from '@angular/router';
import { NgModule } from '@angular/core';



const routes: Routes = [
  { path: '', component: AdministratorPageComponent,
children: [
  {
    path: '',
    pathMatch: 'full',
    redirectTo: 'dashBoard'
  },
    { path: 'dashBoard', component: AdminDashboardComponent},
      { path: 'addNews', component: AddNewComponent,
      canActivate: [RoleGuardService], data: { roles: ['author']}},
      { path: 'deleteNews', component: DeleteNewsComponent,
      canActivate: [RoleGuardService], data: { roles: ['author']}},
      { path: 'labelsPage', component: LabelsPageComponent,
      canActivate: [RoleGuardService], data: { roles: ['author']}},
      { path: 'manageUsers', component: ManageUsersComponent,
        canActivate: [RoleGuardService], data: { roles: ['admin'] }}
    ]   }
];

@NgModule({
  imports: [ 
     SharedModule, RouterModule.forChild(routes)
  ],
  declarations: [AdministratorPageComponent, AdminDashboardComponent, AddNewComponent, DeleteNewsComponent, LabelsPageComponent, ManageUsersComponent]
})
export class AdminModuleModule { }