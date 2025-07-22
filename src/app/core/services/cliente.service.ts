// src/app/core/services/cliente.service.ts
import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable, of } from 'rxjs';
import { catchError, tap } from 'rxjs/operators';
import { HttpClient } from '@angular/common/http';
import { environment } from 'src/environments/environment';

import { Cliente, Endereco, Contato, PessoaTipo } from 'src/app/store/Cliente/cliente.model';

@Injectable({ providedIn: 'root' })
export class ClienteService {
  private API = `${environment.apiBaseUrl}/clientes`;

  private _clientes$ = new BehaviorSubject<Cliente[]>([
    {
      id:         1,
      nome:       'Cliente Exemplo',
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
          email:        'contato@cliente.com.br',
          nomeContato:  'João Silva'
        }
      ]
    }
  ]);
  public clientes$ = this._clientes$.asObservable();

  constructor(private http: HttpClient) {
    this.loadAll();
  }

  private loadAll(): void {
    this.http.get<Cliente[]>(this.API).pipe(
      catchError(err => {
        console.warn('Falha ao carregar clientes do backend, mantendo mocks', err);
        return of([] as Cliente[]);
      }),
      tap(list => {
        if (list.length) {
          this._clientes$.next(list);
        }
      })
    ).subscribe();
  }

  getAll(): Observable<Cliente[]> {
    return this.clientes$;
  }

  getById(id: number): Cliente | undefined {
    return this._clientes$.getValue().find(c => c.id === id);
  }

  create(cliente: Cliente): Observable<Cliente> {
    return this.http.post<Cliente>(this.API, cliente).pipe(
      tap(novo => this._clientes$.next([...this._clientes$.getValue(), novo])),
      catchError(err => {
        console.warn('POST cliente falhou, adicionando localmente', err);
        this._clientes$.next([...this._clientes$.getValue(), cliente]);
        return of(cliente);
      })
    );
  }

  update(cliente: Cliente): Observable<Cliente> {
    const url = `${this.API}/${cliente.id}`;
    return this.http.put<Cliente>(url, cliente).pipe(
      tap(updated => {
        const list = this._clientes$.getValue().map(c =>
          c.id === updated.id ? updated : c
        );
        this._clientes$.next(list);
      }),
      catchError(err => {
        console.warn('PUT cliente falhou, atualizando localmente', err);
        const list = this._clientes$.getValue().map(c =>
          c.id === cliente.id ? cliente : c
        );
        this._clientes$.next(list);
        return of(cliente);
      })
    );
  }

  delete(id: number): Observable<void> {
    const url = `${this.API}/${id}`;
    return this.http.delete<void>(url).pipe(
      tap(() => {
        this._clientes$.next(this._clientes$.getValue().filter(c => c.id !== id));
      }),
      catchError(err => {
        console.warn('DELETE cliente falhou, removendo localmente', err);
        this._clientes$.next(this._clientes$.getValue().filter(c => c.id !== id));
        return of(void 0);
      })
    );
  }

  deleteEndereco(clienteId: number, idx: number): Observable<void> {
    const url = `${this.API}/${clienteId}/enderecos/${idx}`;
    return this.http.delete<void>(url).pipe(
      tap(() => {
        const list = this._clientes$.getValue().map(c => {
          if (c.id !== clienteId) return c;
          const novos = c.enderecos.filter((_, i) => i !== idx);
          return { ...c, enderecos: novos };
        });
        this._clientes$.next(list);
      }),
      catchError(err => {
        console.warn('DELETE endereço falhou, removendo localmente', err);
        const list = this._clientes$.getValue().map(c => {
          if (c.id !== clienteId) return c;
          const novos = c.enderecos.filter((_, i) => i !== idx);
          return { ...c, enderecos: novos };
        });
        this._clientes$.next(list);
        return of(void 0);
      })
    );
  }

  deleteContato(clienteId: number, idx: number): Observable<void> {
    const url = `${this.API}/${clienteId}/contatos/${idx}`;
    return this.http.delete<void>(url).pipe(
      tap(() => {
        const list = this._clientes$.getValue().map(c => {
          if (c.id !== clienteId) return c;
          const novos = c.contatos.filter((_, i) => i !== idx);
          return { ...c, contatos: novos };
        });
        this._clientes$.next(list);
      }),
      catchError(err => {
        console.warn('DELETE contato falhou, removendo localmente', err);
        const list = this._clientes$.getValue().map(c => {
          if (c.id !== clienteId) return c;
          const novos = c.contatos.filter((_, i) => i !== idx);
          return { ...c, contatos: novos };
        });
        this._clientes$.next(list);
        return of(void 0);
      })
    );
  }
}
