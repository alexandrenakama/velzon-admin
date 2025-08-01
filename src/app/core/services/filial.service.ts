// src/app/core/services/filial.service.ts

import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable, of } from 'rxjs';
import { catchError, tap } from 'rxjs/operators';
import { HttpClient } from '@angular/common/http';
import { environment } from 'src/environments/environment';

import { Filial, Endereco, Contato, PessoaTipo } from 'src/app/store/Filial/filial.model';

@Injectable({ providedIn: 'root' })
export class FilialService {
  private API = `${environment.apiBaseUrl}/filiais`;

  private _filiais$ = new BehaviorSubject<Filial[]>([
    {
      id:         1,
      nome:       'Filial Exemplo',
      tipoPessoa: 'Jurídica' as PessoaTipo,
      ativo:      true,
      documento:  '12.345.678/0001-95',
      enderecos: [
        {
          id:             1,
          tipoLogradouro: 'Rua',
          logradouro:     'das Flores',
          numero:         '123',
          complemento:    'Sala 1',
          bairro:         'Centro',
          cidade:         'São Paulo',
          uf:             'SP',
          cep:            '01000-000',
          tipoEndereco:   'Comercial'
        }
      ],
      contatos: [
        {
          id:           1,
          ddd:          '11',
          telefone:     '912345678',
          tipoTelefone: 'Comercial',
          email:        'contato@filial.com.br',
          nomeContato:  'Maria Souza'
        }
      ]
    }
  ]);
  public filiais$ = this._filiais$.asObservable();

  constructor(private http: HttpClient) {
    this.loadAll();
  }

  private loadAll(): void {
    this.http.get<Filial[]>(this.API).pipe(
      catchError(err => {
        console.warn('Falha ao carregar filiais do backend, mantendo mocks', err);
        return of([] as Filial[]);
      }),
      tap(list => {
        if (list.length) {
          this._filiais$.next(list);
        }
      })
    ).subscribe();
  }

  getAll(): Observable<Filial[]> {
    return this.filiais$;
  }

  getById(id: number): Filial | undefined {
    return this._filiais$.getValue().find(f => f.id === id);
  }

  create(filial: Filial): Observable<Filial> {
    return this.http.post<Filial>(this.API, filial).pipe(
      tap(nova => this._filiais$.next([...this._filiais$.getValue(), nova])),
      catchError(err => {
        console.warn('POST filial falhou, adicionando localmente', err);
        this._filiais$.next([...this._filiais$.getValue(), filial]);
        return of(filial);
      })
    );
  }

  update(filial: Filial): Observable<Filial> {
    const url = `${this.API}/${filial.id}`;
    return this.http.put<Filial>(url, filial).pipe(
      tap(updated => {
        const list = this._filiais$.getValue().map(f =>
          f.id === updated.id ? updated : f
        );
        this._filiais$.next(list);
      }),
      catchError(err => {
        console.warn('PUT filial falhou, atualizando localmente', err);
        const list = this._filiais$.getValue().map(f =>
          f.id === filial.id ? filial : f
        );
        this._filiais$.next(list);
        return of(filial);
      })
    );
  }

  delete(id: number): Observable<void> {
    const url = `${this.API}/${id}`;
    return this.http.delete<void>(url).pipe(
      tap(() => {
        this._filiais$.next(this._filiais$.getValue().filter(f => f.id !== id));
      }),
      catchError(err => {
        console.warn('DELETE filial falhou, removendo localmente', err);
        this._filiais$.next(this._filiais$.getValue().filter(f => f.id !== id));
        return of(void 0);
      })
    );
  }

  deleteEndereco(filialId: number, idx: number): Observable<void> {
    const url = `${this.API}/${filialId}/enderecos/${idx}`;
    return this.http.delete<void>(url).pipe(
      tap(() => {
        const list = this._filiais$.getValue().map(f => {
          if (f.id !== filialId) return f;
          const novos = f.enderecos.filter((_, i) => i !== idx);
          return { ...f, enderecos: novos };
        });
        this._filiais$.next(list);
      }),
      catchError(err => {
        console.warn('DELETE endereço falhou, removendo localmente', err);
        const list = this._filiais$.getValue().map(f => {
          if (f.id !== filialId) return f;
          const novos = f.enderecos.filter((_, i) => i !== idx);
          return { ...f, enderecos: novos };
        });
        this._filiais$.next(list);
        return of(void 0);
      })
    );
  }

  deleteContato(filialId: number, idx: number): Observable<void> {
    const url = `${this.API}/${filialId}/contatos/${idx}`;
    return this.http.delete<void>(url).pipe(
      tap(() => {
        const list = this._filiais$.getValue().map(f => {
          if (f.id !== filialId) return f;
          const novos = f.contatos.filter((_, i) => i !== idx);
          return { ...f, contatos: novos };
        });
        this._filiais$.next(list);
      }),
      catchError(err => {
        console.warn('DELETE contato falhou, removendo localmente', err);
        const list = this._filiais$.getValue().map(f => {
          if (f.id !== filialId) return f;
          const novos = f.contatos.filter((_, i) => i !== idx);
          return { ...f, contatos: novos };
        });
        this._filiais$.next(list);
        return of(void 0);
      })
    );
  }
}
