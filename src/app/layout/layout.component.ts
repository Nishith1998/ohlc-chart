import { Component } from '@angular/core';
import { ActivatedRoute, Params, Router } from '@angular/router';
import { ChartDataService } from '../services/chart-data.service';
import { first } from 'rxjs';

@Component({
  selector: 'layout',
  templateUrl: './layout.component.html',
  styleUrls: ['./layout.component.scss']
})
export class LayoutComponent {
  constructor(private route: ActivatedRoute, private chartDataService: ChartDataService) {

  }

  ngOnInit() {
    this.route.queryParams.pipe(first()).subscribe((params: Params) => {
      // console.log("Params: ",params['symbol']);
      if (params['symbol']) {
        // this.ws.closeConnection();
        // this.ws.setConnection();
        // this.bookMap = new Map();
        this.chartDataService.selectedSymbol.next(params['symbol']);
        // this.onSymbolChange(params['symbol']);
      }
    })
  }
}
