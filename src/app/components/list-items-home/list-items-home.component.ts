import { Component, OnInit } from '@angular/core';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-list-items-home',
  templateUrl: './list-items-home.component.html',
  styleUrls: ['./list-items-home.component.scss'],
  standalone: true,
  imports:[RouterLink]
})
export class ListItemsHomeComponent  implements OnInit {

  constructor() { }

  ngOnInit() {}

}
