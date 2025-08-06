// src/app/core/services/funcao.service.ts

import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable, of } from 'rxjs';
import { catchError, tap } from 'rxjs/operators';
import { HttpClient } from '@angular/common/http';
import { environment } from 'src/environments/environment';

import { Funcao } from 'src/app/store/Funcao/funcao.model';

@Injectable({ providedIn: 'root' })
export class FuncaoService {
  private API = `${environment.apiBaseUrl}/funcao`;

  private _funcoes$ = new BehaviorSubject<Funcao[]>([
    // Seguradora
    { id:  1, nome: 'Editar Seguradora',        descricao: 'Editar ou criar uma seguradora' },
    { id:  2, nome: 'Apagar Seguradora',        descricao: 'Apagar uma seguradora' },
    // Grupo Ramo
    { id:  3, nome: 'Editar Grupo Ramo',        descricao: 'Editar ou criar um grupo ramo' },
    { id:  4, nome: 'Apagar Grupo Ramo',        descricao: 'Apagar um grupo ramo' },
    // Ramo
    { id:  5, nome: 'Editar Ramo',              descricao: 'Editar ou criar um ramo' },
    { id:  6, nome: 'Apagar Ramo',              descricao: 'Apagar um ramo' },
    // Produto
    { id:  7, nome: 'Editar Produto',           descricao: 'Editar ou criar um produto' },
    { id:  8, nome: 'Apagar Produto',           descricao: 'Apagar um produto' },
    // Cliente
    { id:  9, nome: 'Editar Cliente',           descricao: 'Editar ou criar um cliente' },
    { id: 10, nome: 'Apagar Cliente',           descricao: 'Apagar um cliente' },
    // Assessoria
    { id: 11, nome: 'Editar Assessoria',        descricao: 'Editar ou criar uma assessoria' },
    { id: 12, nome: 'Apagar Assessoria',        descricao: 'Apagar uma assessoria' },
    // Filial
    { id: 13, nome: 'Editar Filial',            descricao: 'Editar ou criar uma filial' },
    { id: 14, nome: 'Apagar Filial',            descricao: 'Apagar uma filial' },
    // Grupo Usuário
    { id: 15, nome: 'Editar Grupo Usuário',     descricao: 'Editar ou criar um grupo usuário' },
    { id: 16, nome: 'Apagar Grupo Usuário',     descricao: 'Apagar um grupo usuário' },
    // Usuário
    { id: 17, nome: 'Editar Usuário',           descricao: 'Editar ou criar um usuário' },
    { id: 18, nome: 'Apagar Usuário',           descricao: 'Apagar um usuário' }
  ]);
  public funcoes$ = this._funcoes$.asObservable();

  constructor(private http: HttpClient) {
    this.loadAll();
  }

  private loadAll(): void {
    this.http.get<Funcao[]>(this.API).pipe(
      catchError(err => {
        console.warn('Falha ao carregar funções, mantendo mocks', err);
        return of([] as Funcao[]);
      }),
      tap(list => {
        if (list.length) {
          this._funcoes$.next(list);
        }
      })
    ).subscribe();
  }

  getAll(): Observable<Funcao[]> {
    return this.funcoes$;
  }

  getById(id: number): Funcao | undefined {
    return this._funcoes$.getValue().find(f => f.id === id);
  }

  create(funcao: Funcao): Observable<Funcao> {
    return this.http.post<Funcao>(this.API, funcao).pipe(
      tap(novo => this._funcoes$.next([...this._funcoes$.getValue(), novo])),
      catchError(err => {
        console.warn('POST função falhou, adicionando localmente', err);
        this._funcoes$.next([...this._funcoes$.getValue(), funcao]);
        return of(funcao);
      })
    );
  }

  update(funcao: Funcao): Observable<Funcao> {
    const url = `${this.API}/${funcao.id}`;
    return this.http.put<Funcao>(url, funcao).pipe(
      tap(updated => {
        const list = this._funcoes$.getValue().map(f =>
          f.id === updated.id ? updated : f
        );
        this._funcoes$.next(list);
      }),
      catchError(err => {
        console.warn('PUT função falhou, atualizando localmente', err);
        const list = this._funcoes$.getValue().map(f =>
          f.id === funcao.id ? funcao : f
        );
        this._funcoes$.next(list);
        return of(funcao);
      })
    );
  }

  delete(id: number): Observable<void> {
    const url = `${this.API}/${id}`;
    return this.http.delete<void>(url).pipe(
      tap(() => {
        this._funcoes$.next(this._funcoes$.getValue().filter(f => f.id !== id));
      }),
      catchError(err => {
        console.warn('DELETE função falhou, removendo localmente', err);
        this._funcoes$.next(this._funcoes$.getValue().filter(f => f.id !== id));
        return of(void 0);
      })
    );
  }
}
