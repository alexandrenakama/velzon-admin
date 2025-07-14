// src/app/core/services/seguradora.service.ts
import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable, of, throwError } from 'rxjs';
import { catchError, tap, switchMap, take } from 'rxjs/operators';
import { HttpClient } from '@angular/common/http';
import { environment } from 'src/environments/environment';

import { Seguradora, Endereco, Contato } from 'src/app/store/Seguradora/seguradora.model';
import { GrupoRamoService }               from './grupo-ramo.service';

@Injectable({ providedIn: 'root' })
export class SeguradoraService {
  private API = `${environment.apiBaseUrl}/seguradoras`;

  private _seguradoras$ = new BehaviorSubject<Seguradora[]>([
    {
      id:      1,
      nome:    'Porto Seguros',
      ativa:   true,
      cnpj:    '12.345.678/0001-95',
      enderecos: [
        {
          id:              1,
          tipoLogradouro: 'Rua',
          logradouro:      'das Flores',
          numero:          '123',
          complemento:     'Sala 45',
          bairro:          'Centro',
          cidade:          'São Paulo',
          uf:              'SP',
          cep:             '01001-000',
          tipoEndereco:    'Comercial'
        }
      ],
      contatos: [
        {
          id:            1,
          tipoPessoa:   'Física',
          ddd:          '11',
          telefone:     '987654321',
          tipoTelefone: 'Residencial',
          email:        'contato@porto.com.br',
          nomeContato:  'Maria Silva'
        }
      ]
    }
  ]);
  public seguradoras$ = this._seguradoras$.asObservable();

  constructor(
    private http:          HttpClient,
    private grupoService:  GrupoRamoService
  ) {
    this.loadAll();
  }

  private loadAll(): void {
    this.http.get<Seguradora[]>(this.API).pipe(
      catchError(err => {
        console.warn('Falha ao carregar seguradoras do backend, mantendo mocks', err);
        return of([] as Seguradora[]);
      }),
      tap(list => {
        if (list.length) {
          this._seguradoras$.next(list);
        }
      })
    ).subscribe();
  }

  getAll(): Observable<Seguradora[]> {
    return this.seguradoras$;
  }

  getById(id: number): Seguradora | undefined {
    return this._seguradoras$.getValue().find(s => s.id === id);
  }

  create(seg: Seguradora): Observable<Seguradora> {
    return this.http.post<Seguradora>(this.API, seg).pipe(
      tap(nova => this._seguradoras$.next([...this._seguradoras$.getValue(), nova])),
      catchError(err => {
        console.warn('POST falhou, adicionando localmente', err);
        this._seguradoras$.next([...this._seguradoras$.getValue(), seg]);
        return of(seg);
      })
    );
  }

  update(seg: Seguradora): Observable<Seguradora> {
    const url = `${this.API}/${seg.id}`;
    return this.http.put<Seguradora>(url, seg).pipe(
      tap(updated => {
        const list = this._seguradoras$.getValue().map(s =>
          s.id === updated.id ? updated : s
        );
        this._seguradoras$.next(list);
      }),
      catchError(err => {
        console.warn('PUT falhou, atualizando localmente', err);
        const list = this._seguradoras$.getValue().map(s =>
          s.id === seg.id ? seg : s
        );
        this._seguradoras$.next(list);
        return of(seg);
      })
    );
  }

  delete(id: number): Observable<void> {
    return this.grupoService.getAll().pipe(
      take(1),
      switchMap(allGroups => {
        const vinculados = allGroups.filter(g => g.seguradoraId === id);
        if (vinculados.length) {
          return throwError(() =>
            new Error(`Existem ${vinculados.length} grupo(s) de ramo vinculados a esta seguradora.`)
          );
        }
        const url = `${this.API}/${id}`;
        return this.http.delete<void>(url).pipe(
          tap(() => {
            this._seguradoras$.next(
              this._seguradoras$.getValue().filter(s => s.id !== id)
            );
          }),
          catchError(err => {
            console.warn('DELETE falhou, removendo localmente', err);
            this._seguradoras$.next(
              this._seguradoras$.getValue().filter(s => s.id !== id)
            );
            return of(void 0);
          })
        );
      })
    );
  }

  /**
   * DELETE /seguradoras/:segId/enderecos/:idx
   */
  deleteEndereco(segId: number, idx: number): Observable<void> {
    const url = `${this.API}/${segId}/enderecos/${idx}`;
    return this.http.delete<void>(url).pipe(
      tap(() => {
        const list = this._seguradoras$.getValue().map(s => {
          if (s.id !== segId) return s;
          const novosEnd = s.enderecos.filter((_, i) => i !== idx);
          return { ...s, enderecos: novosEnd };
        });
        this._seguradoras$.next(list);
      }),
      catchError(err => {
        console.warn('DELETE endereço falhou, removendo localmente', err);
        const list = this._seguradoras$.getValue().map(s => {
          if (s.id !== segId) return s;
          const novosEnd = s.enderecos.filter((_, i) => i !== idx);
          return { ...s, enderecos: novosEnd };
        });
        this._seguradoras$.next(list);
        return of(void 0);
      })
    );
  }

  /**
   * DELETE /seguradoras/:segId/contatos/:idx
   */
  deleteContato(segId: number, idx: number): Observable<void> {
    const url = `${this.API}/${segId}/contatos/${idx}`;
    return this.http.delete<void>(url).pipe(
      tap(() => {
        const list = this._seguradoras$.getValue().map(s => {
          if (s.id !== segId) return s;
          const novosCont = s.contatos.filter((_, i) => i !== idx);
          return { ...s, contatos: novosCont };
        });
        this._seguradoras$.next(list);
      }),
      catchError(err => {
        console.warn('DELETE contato falhou, removendo localmente', err);
        const list = this._seguradoras$.getValue().map(s => {
          if (s.id !== segId) return s;
          const novosCont = s.contatos.filter((_, i) => i !== idx);
          return { ...s, contatos: novosCont };
        });
        this._seguradoras$.next(list);
        return of(void 0);
      })
    );
  }
}
