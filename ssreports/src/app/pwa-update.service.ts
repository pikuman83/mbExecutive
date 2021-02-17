import { Injectable } from '@angular/core';
import { SwUpdate } from '@angular/service-worker';

@Injectable({
  providedIn: 'root'
})
export class PwaUpdateService {

  constructor(private readonly swUpdate: SwUpdate) { 
    this.swUpdate.available.subscribe(event => {
      if (confirm("A new update of this app is available and is ready to install,\ would you like to install it now?")) {
        window.location.reload();
      }
    })
  }
}
