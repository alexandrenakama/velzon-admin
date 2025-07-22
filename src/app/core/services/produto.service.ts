// src/app/core/services/produto.service.ts

import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable, of } from 'rxjs';
import { catchError, tap } from 'rxjs/operators';
import { HttpClient } from '@angular/common/http';
import { environment } from 'src/environments/environment';

import { Produto } from 'src/app/store/Produto/produto.model';
import { RamoService } from './ramo.service';
import { Ramo } from 'src/app/store/Ramo/ramo.model';

@Injectable({ providedIn: 'root' })
export class ProdutoService {
  private API = `${environment.apiBaseUrl}/produtos`;

  constructor(
    private http: HttpClient,
    private ramoService: RamoService
  ) {
    this.loadAll();
  }

  /** Obtém lista de ramos para popular selects, etc */
  getRamos(): Observable<Ramo[]> {
    return this.ramoService.getAll();
  }

  /** in-memory + API */
  private _produtos$ = new BehaviorSubject<Produto[]>([
    { id: 100, ramoId: 1, nomeRamo: 'Empresa Blindada', nomeProduto: 'Produto Premium', nomeAbreviadoProduto: 'Premium', inicioVigencia: '2025-01-01', fimVigencia: '2025-12-31', numeroProcessoSusep: 123456, permitePessoaFisica: true, permitePessoaJuridica: true, ativo: true },
    { id: 101, ramoId: 3, nomeRamo: 'Auto Protegido', nomeProduto: 'Seguro Auto Light',  nomeAbreviadoProduto: 'Auto Light',  inicioVigencia: '2025-03-15', fimVigencia: '2025-09-15', numeroProcessoSusep: 234567, permitePessoaFisica: true, permitePessoaJuridica: false, ativo: true },
    { id: 102, ramoId: 5, nomeRamo: 'Casa Segura',     nomeProduto: 'Residencial Total',  nomeAbreviadoProduto: 'Resid Total', inicioVigencia: '2025-02-10', fimVigencia: '2025-08-10', numeroProcessoSusep: 345678, permitePessoaFisica: false, permitePessoaJuridica: true, ativo: false }
  ]);
  public produtos$ = this._produtos$.asObservable();

  /** Carrega todos do backend (ou mantém os mocks locais) */
  loadAll(): void {
    this.http.get<Produto[]>(this.API).pipe(
      catchError(err => {
        console.warn('Falha ao carregar produtos do backend, mantendo dados mock', err);
        return of([] as Produto[]);
      }),
      tap(apiList => {
        if (apiList.length) {
          this._produtos$.next(apiList);
        }
      })
    ).subscribe();
  }

  /** Retorna Observable de produtos */
  getAll(): Observable<Produto[]> {
    return this.produtos$;
  }

  /** GET síncrono para edição */
  getById(id: number): Produto | undefined {
    return this._produtos$.getValue().find(p => p.id === id);
  }

  /**
   * GET síncrono para edição via Nº Processo SUSEP
   * Retorna o primeiro produto cujo numeroProcessoSusep bata com o parâmetro.
   */
  getBySusep(numeroProcessoSusep: number): Produto | undefined {
    return this._produtos$.getValue().find(p => p.numeroProcessoSusep === numeroProcessoSusep);
  }

  /** Cria produto (POST + fallback local) */
  create(produto: Produto): Observable<Produto> {
    return this.http.post<Produto>(this.API, produto).pipe(
      tap(novo => this._produtos$.next([...this._produtos$.getValue(), novo])),
      catchError(err => {
        console.warn('POST produto falhou, adicionando localmente', err);
        this._produtos$.next([...this._produtos$.getValue(), produto]);
        return of(produto);
      })
    );
  }

  /** Atualiza produto (PUT + fallback local) */
  update(produto: Produto): Observable<Produto> {
    const url = `${this.API}/${produto.id}`;
    return this.http.put<Produto>(url, produto).pipe(
      tap(updated => {
        const list = this._produtos$.getValue().map(p => p.id === updated.id ? updated : p);
        this._produtos$.next(list);
      }),
      catchError(err => {
        console.warn('PUT produto falhou, atualizando localmente', err);
        const list = this._produtos$.getValue().map(p => p.id === produto.id ? produto : p);
        this._produtos$.next(list);
        return of(produto);
      })
    );
  }

  /** Remove produto (DELETE + fallback local) */
  delete(id: number): Observable<void> {
    const url = `${this.API}/${id}`;
    return this.http.delete<void>(url).pipe(
      tap(() => {
        this._produtos$.next(this._produtos$.getValue().filter(p => p.id !== id));
      }),
      catchError(err => {
        console.warn('DELETE produto falhou, removendo localmente', err);
        this._produtos$.next(this._produtos$.getValue().filter(p => p.id !== id));
        return of(void 0);
      })
    );
  }
}
