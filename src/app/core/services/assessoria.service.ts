// src/app/core/services/assessoria.service.ts
import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable, of } from 'rxjs';
import { catchError, tap } from 'rxjs/operators';
import { HttpClient } from '@angular/common/http';
import { environment } from 'src/environments/environment';

import { Assessoria, Endereco, Contato, PessoaTipo } from 'src/app/store/Assessoria/assessoria.model';

@Injectable({ providedIn: 'root' })
export class AssessoriaService {
  private API = `${environment.apiBaseUrl}/assessorias`;

  private _assessorias$ = new BehaviorSubject<Assessoria[]>([
    {
      id:         1,
      nome:       'Assessoria Exemplo',
      tipoPessoa: 'Jurídica' as PessoaTipo,
      ativo:      true,
      documento:  '12.345.678/0001-95',
      enderecos: [
        {
          id:             1,
          tipoLogradouro: 'Avenida',
          logradouro:     'Brasil',
          numero:         '1000',
          complemento:    'Sala 101',
          bairro:         'Centro',
          cidade:         'Rio de Janeiro',
          uf:             'RJ',
          cep:            '20010-000',
          tipoEndereco:   'Comercial'
        }
      ],
      contatos: [
        {
          id:           1,
          ddd:          '21',
          telefone:     '987654321',
          tipoTelefone: 'Comercial',
          email:        'contato@assessoria.com.br',
          nomeContato:  'João Silva'
        }
      ]
    }
  ]);
  public assessorias$ = this._assessorias$.asObservable();

  constructor(private http: HttpClient) {
    this.loadAll();
  }

  private loadAll(): void {
    this.http.get<Assessoria[]>(this.API).pipe(
      catchError(err => {
        console.warn('Falha ao carregar assessorias do backend, mantendo mocks', err);
        return of([] as Assessoria[]);
      }),
      tap(list => {
        if (list.length) {
          this._assessorias$.next(list);
        }
      })
    ).subscribe();
  }

  getAll(): Observable<Assessoria[]> {
    return this.assessorias$;
  }

  getById(id: number): Assessoria | undefined {
    return this._assessorias$.getValue().find(a => a.id === id);
  }

  create(assessoria: Assessoria): Observable<Assessoria> {
    return this.http.post<Assessoria>(this.API, assessoria).pipe(
      tap(nova => this._assessorias$.next([...this._assessorias$.getValue(), nova])),
      catchError(err => {
        console.warn('POST assessoria falhou, adicionando localmente', err);
        this._assessorias$.next([...this._assessorias$.getValue(), assessoria]);
        return of(assessoria);
      })
    );
  }

  update(assessoria: Assessoria): Observable<Assessoria> {
    const url = `${this.API}/${assessoria.id}`;
    return this.http.put<Assessoria>(url, assessoria).pipe(
      tap(updated => {
        const list = this._assessorias$.getValue().map(a =>
          a.id === updated.id ? updated : a
        );
        this._assessorias$.next(list);
      }),
      catchError(err => {
        console.warn('PUT assessoria falhou, atualizando localmente', err);
        const list = this._assessorias$.getValue().map(a =>
          a.id === assessoria.id ? assessoria : a
        );
        this._assessorias$.next(list);
        return of(assessoria);
      })
    );
  }

  delete(id: number): Observable<void> {
    const url = `${this.API}/${id}`;
    return this.http.delete<void>(url).pipe(
      tap(() => {
        this._assessorias$.next(this._assessorias$.getValue().filter(a => a.id !== id));
      }),
      catchError(err => {
        console.warn('DELETE assessoria falhou, removendo localmente', err);
        this._assessorias$.next(this._assessorias$.getValue().filter(a => a.id !== id));
        return of(void 0);
      })
    );
  }

  deleteEndereco(assessoriaId: number, idx: number): Observable<void> {
    const url = `${this.API}/${assessoriaId}/enderecos/${idx}`;
    return this.http.delete<void>(url).pipe(
      tap(() => {
        const list = this._assessorias$.getValue().map(a => {
          if (a.id !== assessoriaId) return a;
          const novos = a.enderecos.filter((_, i) => i !== idx);
          return { ...a, enderecos: novos };
        });
        this._assessorias$.next(list);
      }),
      catchError(err => {
        console.warn('DELETE endereço falhou, removendo localmente', err);
        const list = this._assessorias$.getValue().map(a => {
          if (a.id !== assessoriaId) return a;
          const novos = a.enderecos.filter((_, i) => i !== idx);
          return { ...a, enderecos: novos };
        });
        this._assessorias$.next(list);
        return of(void 0);
      })
    );
  }

  deleteContato(assessoriaId: number, idx: number): Observable<void> {
    const url = `${this.API}/${assessoriaId}/contatos/${idx}`;
    return this.http.delete<void>(url).pipe(
      tap(() => {
        const list = this._assessorias$.getValue().map(a => {
          if (a.id !== assessoriaId) return a;
          const novos = a.contatos.filter((_, i) => i !== idx);
          return { ...a, contatos: novos };
        });
        this._assessorias$.next(list);
      }),
      catchError(err => {
        console.warn('DELETE contato falhou, removendo localmente', err);
        const list = this._assessorias$.getValue().map(a => {
          if (a.id !== assessoriaId) return a;
          const novos = a.contatos.filter((_, i) => i !== idx);
          return { ...a, contatos: novos };
        });
        this._assessorias$.next(list);
        return of(void 0);
      })
    );
  }
}
