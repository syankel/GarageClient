import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, forkJoin } from 'rxjs';

export interface Garage {
  id?: string;
  name: string;
  city?: string;
  address?: string;
  phone?: string;
}

@Injectable({
  providedIn: 'root'
})
export class GarageService {
  private apiUrl = 'http://localhost:5071/api';

  constructor(private http: HttpClient) { }

  getGarages(): Observable<Garage[]> {
    return this.http.get<Garage[]>(`${this.apiUrl}/garages`);
  }

  addGarages(garages: Garage[]): Observable<any> {
    const requests = garages.map(garage => 
      this.http.post(`${this.apiUrl}/garages`, garage)
    );
    return forkJoin(requests);
  }
}
