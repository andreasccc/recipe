import { Injectable } from "@angular/core";
import { HttpClient, HttpErrorResponse } from "@angular/common/http";
import { catchError, tap } from "rxjs/operators";
import { throwError, Subject } from 'rxjs';
import { User } from "./user.model";

export interface AuthResponseData {
  kind: string;
  idToken: string;
  email: string;
  refreshToken: string;
  expiresIn: string;
  localId: string;
  registered?: boolean;
}


@Injectable({providedIn: 'root'})
export class AuthService {

  user = new Subject<User>();

  constructor(private http: HttpClient) {}

  signup(email: string, password: string) {
    return this.http.post<AuthResponseData>(
      'https://identitytoolkit.googleapis.com/v1/accounts:signUp?key=AIzaSyBs8t_cFCffNtLPqNUWl0ErkrJH3ZmCIuk' ,
      {
        email: email,
        password: password,
        returnSecureToken: true
      }
    ).pipe(
      catchError(this.handleError),
      tap(resData => {this.handleAuth(resData.email, resData.localId, resData.idToken, +resData.expiresIn);
      }));
  }
  login(email: string, password: string) {
    return this.http.post<AuthResponseData>(
      'https://identitytoolkit.googleapis.com/v1/accounts:signInWithPassword?key=AIzaSyBs8t_cFCffNtLPqNUWl0ErkrJH3ZmCIuk' ,
    {
      email: email,
      password: password,
      returnSecureToken: true
    }
    ).pipe(
      catchError(this.handleError),
      tap(resData => {this.handleAuth(resData.email, resData.localId, resData.idToken, +resData.expiresIn);
    }));
  }

  private handleAuth(email: string, userId: string, token: string, expiresIn: number) {
    const expirationDate = new Date(new Date().getTime() + expiresIn * 1000);
    const user = new User(email, userId, token, expirationDate);
    this.user.next(user);
  }


  private handleError (errorRes: HttpErrorResponse) {
    let errorMessage = 'An unknown error occurred!';
      if (!errorRes.error || !errorRes.error.error) {
        return throwError(errorMessage);
      }
      switch (errorRes.error.error.message) {
      case 'EMAIL_EXISTS': errorMessage = 'This email exists already'; break;
      case 'EMAIL_NOT_FOUND': errorMessage = 'This email does not exists'; break;
      case 'EMAIL_INVALID_PASSWORD': errorMessage = 'This password ist not correct'; break;
    }
      return throwError(errorMessage);
  }
}