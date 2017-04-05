import { Component, OnInit } from '@angular/core';
import { AF } from "../providers/af";

@Component({
  selector: 'app-settings',
  templateUrl: './settings.component.html',
  styleUrls: ['./settings.component.css']
})
export class SettingsComponent implements OnInit {

  constructor(public afService: AF) { }

  ngOnInit() {
  }

}
