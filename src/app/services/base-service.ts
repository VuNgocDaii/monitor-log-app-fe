import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { Service } from './service';

@Injectable({
  providedIn: 'root',
})
export abstract class BaseService extends Service {
  url: string = '';
  search(data: any): Observable<any> {
    return this.post(`${this.url}/Search`, data);
  }
  getAll(params?: any): Observable<any> {
    return this.get(this.url, params);
  }
  getAllEnabledAndApporved(params?: any): Observable<any> {
    return this.get(this.url, { ...params, Enable: true, Approve: true });
  }
  getAllEnabled(params?: any): Observable<any> {
    return this.get(this.url, { ...params, Enable: true });
  }
  getAllandSub(params?: any) {
    let  data:any = []
    this.get(this.url, params).subscribe((res)=>{
        if(res.isValid){
          data = res.jsonData.data
        }
    })
    return data;
  }

  getAllandSubEnabled(params?: any) {
    let  data:any = []
    this.get(this.url, { ...params, Enable: true }).subscribe((res)=>{
        if(res.isValid){
          data = res.jsonData.data
        }
    })
    return data;
  }

  getById(id: any): Observable<any> {
    return this.get(`${this.url}/${id}`);
  }
  create(data: any): Observable<any> {
    return this.post(this.url, data);
  }
  update(id: any, data: any): Observable<any> {
    return this.put(`${this.url}/${id}`, data);
  }
  deleteById(id: any): Observable<any> {
    return this.delete(`${this.url}/`, id);
  }
}
