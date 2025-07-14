// src/app/core/services/grupo-ramo.service.ts

import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable, of } from 'rxjs';
import { catchError, tap } from 'rxjs/operators';
import { HttpClient } from '@angular/common/http';
import { environment } from 'src/environments/environment';
import { GrupoRamo } from 'src/app/store/Grupo Ramo/grupo-ramo.model';

@Injectable({ providedIn: 'root' })
export class GrupoRamoService {
  private API = `${environment.apiBaseUrl}/grupos`;

  /** Mock inicial — futuramente virá do backend */
  private _groups$ = new BehaviorSubject<GrupoRamo[]>([
    { id: 11, nome: 'Seguro Agrícola',    seguradoraId: 1 },
    { id: 12, nome: 'Seguro Residencial', seguradoraId: 1 },
    { id: 21, nome: 'Seguro Automotivo',  seguradoraId: 1 },
    { id: 22, nome: 'Seguro Vida',        seguradoraId: 1 },
    { id: 31, nome: 'Seguro Saúde',       seguradoraId: 1 }
  ]);

  /** Observable público de grupos */
  public groups$ = this._groups$.asObservable();

  constructor(private http: HttpClient) {
    this.loadAll();
  }

  /** Carrega do backend e atualiza o BehaviorSubject */
  loadAll(): void {
    this.http.get<GrupoRamo[]>(this.API).pipe(
      catchError(err => {
        console.warn('Falha ao carregar grupos, mantendo mock local', err);
        return of([] as GrupoRamo[]);
      }),
      tap(list => {
        if (list.length) {
          this._groups$.next(list);
        }
      })
    ).subscribe();
  }

  /** Retorna Observable de todos os grupos */
  getAll(): Observable<GrupoRamo[]> {
    return this.groups$;
  }

  /** Busca um grupo pelo ID de forma síncrona */
  getById(id: number): GrupoRamo | undefined {
    return this._groups$.getValue().find(g => g.id === id);
  }

  /** Cria um novo grupo (POST + fallback local) */
  create(grupo: GrupoRamo): Observable<GrupoRamo> {
    return this.http.post<GrupoRamo>(this.API, grupo).pipe(
      tap(novo => this._groups$.next([...this._groups$.getValue(), novo])),
      catchError(err => {
        console.warn('POST falhou, adicionando localmente', err);
        this._groups$.next([...this._groups$.getValue(), grupo]);
        return of(grupo);
      })
    );
  }

  /** Atualiza um grupo existente (PUT + fallback local) */
  update(grupo: GrupoRamo): Observable<GrupoRamo> {
    const url = `${this.API}/${grupo.id}`;
    return this.http.put<GrupoRamo>(url, grupo).pipe(
      tap(updated => {
        const list = this._groups$.getValue().map(g =>
          g.id === updated.id ? updated : g
        );
        this._groups$.next(list);
      }),
      catchError(err => {
        console.warn('PUT falhou, atualizando localmente', err);
        const list = this._groups$.getValue().map(g =>
          g.id === grupo.id ? grupo : g
        );
        this._groups$.next(list);
        return of(grupo);
      })
    );
  }

  /** Remove um grupo (DELETE + fallback local) */
  delete(id: number): Observable<void> {
    const url = `${this.API}/${id}`;
    return this.http.delete<void>(url).pipe(
      tap(() => {
        this._groups$.next(
          this._groups$.getValue().filter(g => g.id !== id)
        );
      }),
      catchError(err => {
        console.warn('DELETE falhou, removendo localmente', err);
        this._groups$.next(
          this._groups$.getValue().filter(g => g.id !== id)
        );
        return of(void 0);
      })
    );
  }
}
