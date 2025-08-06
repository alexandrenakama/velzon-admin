// src/app/core/services/grupo-usuario.service.ts

import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable, of } from 'rxjs';
import { catchError, tap } from 'rxjs/operators';
import { HttpClient } from '@angular/common/http';
import { environment } from 'src/environments/environment';

import { GrupoUsuario } from 'src/app/store/Grupo Usuario/grupo-usuario.model';
import { Funcao }       from 'src/app/store/Funcao/funcao.model';

@Injectable({ providedIn: 'root' })
export class GrupoUsuarioService {
  private API = `${environment.apiBaseUrl}/grupo-usuario`;

  private _grupos$ = new BehaviorSubject<GrupoUsuario[]>([
    {
      id:    1,
      cargo: 'Administrador',
      ativo: true,
      funcoes: [
        { id:  1, nome: 'Editar Seguradora',    descricao: 'Editar ou criar uma seguradora' },
        { id:  2, nome: 'Apagar Seguradora',    descricao: 'Apagar uma seguradora' },
        { id:  3, nome: 'Editar Grupo Ramo',    descricao: 'Editar ou criar um grupo ramo' },
        { id:  4, nome: 'Apagar Grupo Ramo',    descricao: 'Apagar um grupo ramo' },
        { id:  5, nome: 'Editar Ramo',          descricao: 'Editar ou criar um ramo' },
        { id:  6, nome: 'Apagar Ramo',          descricao: 'Apagar um ramo' },
        { id:  7, nome: 'Editar Produto',       descricao: 'Editar ou criar um produto' },
        { id:  8, nome: 'Apagar Produto',       descricao: 'Apagar um produto' },
        { id:  9, nome: 'Editar Cliente',       descricao: 'Editar ou criar um cliente' },
        { id: 10, nome: 'Apagar Cliente',       descricao: 'Apagar um cliente' },
        { id: 11, nome: 'Editar Assessoria',    descricao: 'Editar ou criar uma assessoria' },
        { id: 12, nome: 'Apagar Assessoria',    descricao: 'Apagar uma assessoria' },
        { id: 13, nome: 'Editar Filial',        descricao: 'Editar ou criar uma filial' },
        { id: 14, nome: 'Apagar Filial',        descricao: 'Apagar uma filial' },
        { id: 15, nome: 'Editar Grupo Usuário', descricao: 'Editar ou criar um grupo usuário' },
        { id: 16, nome: 'Apagar Grupo Usuário', descricao: 'Apagar um grupo usuário' },
        { id: 17, nome: 'Editar Usuário',       descricao: 'Editar ou criar um usuário' },
        { id: 18, nome: 'Apagar Usuário',       descricao: 'Apagar um usuário' }
      ]
    }
    // ... outros grupos, se houver
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
    const body = {
      id:      grupo.id,
      cargo:   grupo.cargo,
      ativo:   grupo.ativo,
      funcoes: grupo.funcoes.map(f => f.id)
    };
    return this.http.post<GrupoUsuario>(this.API, body).pipe(
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
    const body = {
      id:      grupo.id,
      cargo:   grupo.cargo,
      ativo:   grupo.ativo,
      funcoes: grupo.funcoes.map(f => f.id)
    };
    return this.http.put<GrupoUsuario>(url, body).pipe(
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
