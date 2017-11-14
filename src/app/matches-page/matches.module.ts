import { MatchesPageComponent } from './matches-page.component';
import { HttpModule } from '@angular/http';
import { FormsModule } from '@angular/forms';
import { RoleGuardService } from './../providers/role-guard.service';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { SharedModule } from 'app/app-shared.module';
import { Routes } from '@angular/router';
import { NgModule } from '@angular/core';



const routes: Routes = [
  { path: '', component: MatchesPageComponent}
];

@NgModule({
  imports: [ 
     SharedModule, RouterModule.forChild(routes)
  ],
  declarations: [MatchesPageComponent]
})
export class MatchesModule { }