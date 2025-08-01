// src/app/core/services/usuario.service.ts

import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable, of } from 'rxjs';
import { catchError, tap } from 'rxjs/operators';
import { HttpClient } from '@angular/common/http';
import { environment } from 'src/environments/environment';

import { Usuario } from 'src/app/store/Usuario/usuario.model';

@Injectable({ providedIn: 'root' })
export class UsuarioService {
  private API = `${environment.apiBaseUrl}/usuarios`;

  private _usuarios$ = new BehaviorSubject<Usuario[]>([
    {
      id: 1,
      nome: 'Usuário Exemplo',
      email: 'user@example.com',
      senha: '',
      ativo: true,
      grupoUsuario: { id: 1, cargo: 'Administrador', ativo: true }
    }
  ]);
  public usuarios$ = this._usuarios$.asObservable();

  constructor(private http: HttpClient) {
    this.loadAll();
  }

  private loadAll(): void {
    this.http.get<Usuario[]>(this.API).pipe(
      catchError(err => {
        console.warn('Falha ao carregar usuários do backend, mantendo mocks', err);
        return of([] as Usuario[]);
      }),
      tap(list => {
        if (list.length) {
          this._usuarios$.next(list);
        }
      })
    ).subscribe();
  }

  getAll(): Observable<Usuario[]> {
    return this.usuarios$;
  }

  getById(id: number): Usuario | undefined {
    return this._usuarios$.getValue().find(u => u.id === id);
  }

  create(usuario: Usuario): Observable<Usuario> {
    return this.http.post<Usuario>(this.API, usuario).pipe(
      tap(novo => this._usuarios$.next([...this._usuarios$.getValue(), novo])),
      catchError(err => {
        console.warn('POST usuário falhou, adicionando localmente', err);
        this._usuarios$.next([...this._usuarios$.getValue(), usuario]);
        return of(usuario);
      })
    );
  }

  update(usuario: Usuario): Observable<Usuario> {
    const url = `${this.API}/${usuario.id}`;
    return this.http.put<Usuario>(url, usuario).pipe(
      tap(updated => {
        const list = this._usuarios$.getValue().map(u =>
          u.id === updated.id ? updated : u
        );
        this._usuarios$.next(list);
      }),
      catchError(err => {
        console.warn('PUT usuário falhou, atualizando localmente', err);
        const list = this._usuarios$.getValue().map(u =>
          u.id === usuario.id ? usuario : u
        );
        this._usuarios$.next(list);
        return of(usuario);
      })
    );
  }

  delete(id: number): Observable<void> {
    const url = `${this.API}/${id}`;
    return this.http.delete<void>(url).pipe(
      tap(() => {
        this._usuarios$.next(this._usuarios$.getValue().filter(u => u.id !== id));
      }),
      catchError(err => {
        console.warn('DELETE usuário falhou, removendo localmente', err);
        this._usuarios$.next(this._usuarios$.getValue().filter(u => u.id !== id));
        return of(void 0);
      })
    );
  }
}
