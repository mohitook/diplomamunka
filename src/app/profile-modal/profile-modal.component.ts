import { Component, OnInit } from '@angular/core';
import { AF } from "../providers/af";

@Component({
  selector: 'app-profile-modal',
  templateUrl: './profile-modal.component.html',
  styleUrls: ['./profile-modal.component.css']
})
export class ProfileModalComponent implements OnInit {

  constructor(public afService: AF) { }

  ngOnInit() {
  }

}
