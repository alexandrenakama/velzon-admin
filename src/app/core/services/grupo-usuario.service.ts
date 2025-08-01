// src/app/core/services/grupo-usuario.service.ts

import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable, of } from 'rxjs';
import { catchError, tap } from 'rxjs/operators';
import { HttpClient } from '@angular/common/http';
import { environment } from 'src/environments/environment';

import { GrupoUsuario } from 'src/app/store/Grupo Usuario/grupo-usuario.model';

@Injectable({ providedIn: 'root' })
export class GrupoUsuarioService {
  private API = `${environment.apiBaseUrl}/grupo-usuario`;

  private _grupos$ = new BehaviorSubject<GrupoUsuario[]>([
    { id: 1, cargo: 'Administrador', ativo: true }
  ]);
  public grupos$ = this._grupos$.asObservable();

  constructor(private http: HttpClient) {
    this.loadAll();
  }

  private loadAll(): void {
    this.http.get<GrupoUsuario[]>(this.API).pipe(
      catchError(err => {
        console.warn('Falha ao carregar grupos de usuário, mantendo mocks', err);
        return of([] as GrupoUsuario[]);
      }),
      tap(list => {
        if (list.length) {
          this._grupos$.next(list);
        }
      })
    ).subscribe();
  }

  getAll(): Observable<GrupoUsuario[]> {
    return this.grupos$;
  }

  getById(id: number): GrupoUsuario | undefined {
    return this._grupos$.getValue().find(g => g.id === id);
  }

  create(grupo: GrupoUsuario): Observable<GrupoUsuario> {
    return this.http.post<GrupoUsuario>(this.API, grupo).pipe(
      tap(novo => this._grupos$.next([...this._grupos$.getValue(), novo])),
      catchError(err => {
        console.warn('POST grupo-usuario falhou, adicionando localmente', err);
        this._grupos$.next([...this._grupos$.getValue(), grupo]);
        return of(grupo);
      })
    );
  }

  update(grupo: GrupoUsuario): Observable<GrupoUsuario> {
    const url = `${this.API}/${grupo.id}`;
    return this.http.put<GrupoUsuario>(url, grupo).pipe(
      tap(updated => {
        const list = this._grupos$.getValue().map(g =>
          g.id === updated.id ? updated : g
        );
        this._grupos$.next(list);
      }),
      catchError(err => {
        console.warn('PUT grupo-usuario falhou, atualizando localmente', err);
        const list = this._grupos$.getValue().map(g =>
          g.id === grupo.id ? grupo : g
        );
        this._grupos$.next(list);
        return of(grupo);
      })
    );
  }

  delete(id: number): Observable<void> {
    const url = `${this.API}/${id}`;
    return this.http.delete<void>(url).pipe(
      tap(() => {
        this._grupos$.next(this._grupos$.getValue().filter(g => g.id !== id));
      }),
      catchError(err => {
        console.warn('DELETE grupo-usuario falhou, removendo localmente', err);
        this._grupos$.next(this._grupos$.getValue().filter(g => g.id !== id));
        return of(void 0);
      })
    );
  }
}
