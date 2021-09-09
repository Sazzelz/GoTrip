import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import * as Parse from 'parse';

@Injectable({
    providedIn: 'root'
})
export class AuthService {
    constructor(private http: HttpClient) { }

    isAuthenticated() {

        // console.log(Parse.Session.current());
        return Parse.Session.current();
    }
}
