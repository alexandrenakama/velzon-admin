// src/app/core/services/usuario.service.ts

import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable, of } from 'rxjs';
import { catchError, tap } from 'rxjs/operators';
import { HttpClient } from '@angular/common/http';
import { environment } from 'src/environments/environment';

import { Usuario }      from 'src/app/store/Usuario/usuario.model';
import { GrupoUsuario } from 'src/app/store/Grupo Usuario/grupo-usuario.model';
import { Funcao }        from 'src/app/store/Funcao/funcao.model';

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
      grupoUsuario: {
        id:    1,
        cargo: 'Administrador',
        ativo: true,
        funcoes: [
          { id:  1, nome: 'Editar Seguradora',        descricao: 'Editar ou criar uma seguradora' },
          { id:  2, nome: 'Apagar Seguradora',        descricao: 'Apagar uma seguradora' },
          { id:  3, nome: 'Editar Grupo Ramo',        descricao: 'Editar ou criar um grupo ramo' },
          { id:  4, nome: 'Apagar Grupo Ramo',        descricao: 'Apagar um grupo ramo' },
          { id:  5, nome: 'Editar Ramo',              descricao: 'Editar ou criar um ramo' },
          { id:  6, nome: 'Apagar Ramo',              descricao: 'Apagar um ramo' },
          { id:  7, nome: 'Editar Produto',           descricao: 'Editar ou criar um produto' },
          { id:  8, nome: 'Apagar Produto',           descricao: 'Apagar um produto' },
          { id:  9, nome: 'Editar Cliente',           descricao: 'Editar ou criar um cliente' },
          { id: 10, nome: 'Apagar Cliente',           descricao: 'Apagar um cliente' },
          { id: 11, nome: 'Editar Assessoria',        descricao: 'Editar ou criar uma assessoria' },
          { id: 12, nome: 'Apagar Assessoria',        descricao: 'Apagar uma assessoria' },
          { id: 13, nome: 'Editar Filial',            descricao: 'Editar ou criar uma filial' },
          { id: 14, nome: 'Apagar Filial',            descricao: 'Apagar uma filial' },
          { id: 15, nome: 'Editar Grupo Usuário',     descricao: 'Editar ou criar um grupo usuário' },
          { id: 16, nome: 'Apagar Grupo Usuário',     descricao: 'Apagar um grupo usuário' },
          { id: 17, nome: 'Editar Usuário',           descricao: 'Editar ou criar um usuário' },
          { id: 18, nome: 'Apagar Usuário',           descricao: 'Apagar um usuário' }
        ]
      }
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
