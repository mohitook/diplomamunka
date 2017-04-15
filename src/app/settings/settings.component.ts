import { Component, OnInit } from '@angular/core';
import { AF } from "../providers/af";

@Component({
  selector: 'app-settings',
  templateUrl: './settings.component.html',
  styleUrls: ['./settings.component.css']
})
export class SettingsComponent implements OnInit {

  characters: Array<any>;
  selectedValues: Array<any>;

  constructor(public afService: AF) { }

  ngOnInit() {

    this.characters = [
        {value: '0', label: 'Aech'},
        {value: '1', label: 'Art3mis'},
        {value: '2', label: 'Daito'},
        {value: '3', label: 'Parzival'},
        {value: '4', label: 'Shoto'}
    ];

  }

}
