import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { WebsocketService } from './websocket.service';
import { map, skipWhile } from 'rxjs';
import { tableDataType } from '../models';

@Injectable({
  providedIn: 'root'
})
export class ChartDataService {

  constructor(private http: HttpClient, public ws: WebsocketService) { }

  getCandles(msg: any) {
    console.log("payload: getCandles ", msg)
    return this.http.post('api/getCandles', msg);
    // debugger
    // this.ws.sendMessage.next(msg);
    // return this.ws.receiveMessage.pipe(map(data => JSON.parse(data)), skipWhile((data) => { return data.event != undefined }), map(data => candleMapping(data[1])));
  }

  getAllSymbols() {
    return this.http.get('api/getAllSymbols').pipe(map((sybmolData: any) => {
      return tableDataType.mapToTableDataType(sybmolData);
    }))
  }
}
