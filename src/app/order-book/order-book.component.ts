import { Component } from '@angular/core';
import { ChartDataService } from '../services/chart-data.service';
import { INITIAL_PAYLOAD_FOR_ORDERBOOK } from '../constants';
import { OrderBookPayload, UpdatedValuesFromWs, isUpdatedValuesFromWs } from '../models';
import { ActivatedRoute, Params } from '@angular/router';
import { WebsocketService } from '../services/websocket.service';
import { first } from 'rxjs';

const INDEX_OF_COUNT = 1;
const INDEX_OF_PRICE = 0;

@Component({
  selector: 'app-order-book',
  templateUrl: './order-book.component.html',
  styleUrls: ['./order-book.component.scss']
})
export class OrderBookComponent {
  bookMap: Map<number, [number, number, number]> = new Map();
  bidsMap: Map<number, [number, number, number, number]> = new Map();
  asksMap: Map<number, [number, number, number, number]> = new Map();
  displayedColumns: string[] = ['']
  bookPayload: OrderBookPayload;

  constructor(private route: ActivatedRoute, private chartDataService: ChartDataService, private ws: WebsocketService) {

  }

  ngOnInit() {
    this.bookPayload = INITIAL_PAYLOAD_FOR_ORDERBOOK;
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

    // On Select OrdbookApi Call implmentation
    this.chartDataService.selectedSymbol.subscribe((selectedValue: string) => {
      if(selectedValue) {
        this.bookMap = new Map();
        this.asksMap = new Map();
        this.bidsMap = new Map();
        this.onSymbolChange(selectedValue);
      }
    })
  }

  onSymbolChange(value: string) {
    this.bookPayload.symbol = value;
    this.callOrderBookAPI();
  }

  callOrderBookAPI() {
    this.chartDataService.getOrderBookData(this.bookPayload).pipe().subscribe(data => {
      this.updateBookMap(data);
    })
  }

  updateBookMap(updatedValue: UpdatedValuesFromWs | UpdatedValuesFromWs[]) {
    if (isUpdatedValuesFromWs(updatedValue)) {
      // console.log("this is data update", updatedValue);
      let [price,count, amount] = [...updatedValue];
      if (updatedValue[INDEX_OF_COUNT] != 0) {
        if(updatedValue[2] < 0) {
          // let totalForAsk = amount < updatedValue[]
          this.asksMap.set(price, [count, Math.abs(amount), 0, price]);
        } else {
          this.bidsMap.set(price, [count, Math.abs(amount), 0, price]);
        }
        this.bookMap.set(updatedValue[INDEX_OF_PRICE], updatedValue);
      } else {
        this.bookMap.delete(updatedValue[INDEX_OF_PRICE]);
      }
    } else if (typeof updatedValue[1] != 'string') {
      // console.log("this is data first", updatedValue);
      let totalForBids = 0;
      let totalForAsks = 0;
      updatedValue.forEach(([price, count, amount]: [price:number, count:number, amount:number]) => {
        if(amount < 0) {
          totalForAsks += Math.abs(amount);
          this.asksMap.set(price, [count, Math.abs(amount), totalForAsks, price]);
        } else { // amount > 0
          totalForBids += amount;
          this.bidsMap.set(price, [count, amount, totalForBids, price])
        }
        // this.bookMap.set(element[INDEX_OF_PRICE], element);
      });
    }
  }

  calcTotal(index: number, itemValue: any[], list: any[]) {
    if(index == 0) {
      itemValue[2] = itemValue[1];
      // return itemValue[1];
    } else {
      // console.log(itemValue, list)
      itemValue[2] = list[index-1].value[2] + itemValue[1];
    }
  }
}
