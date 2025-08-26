// src/app/core/services/corretor.service.ts

import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable, of, combineLatest } from 'rxjs';
import { catchError, tap } from 'rxjs/operators';
import { HttpClient } from '@angular/common/http';
import { environment } from 'src/environments/environment';

import { Corretor, PessoaTipo, Endereco, Contato } from 'src/app/store/Corretor/corretor.model';
import { Produto } from 'src/app/store/Produto/produto.model';
import { Filial } from 'src/app/store/Filial/filial.model';
import { ProdutoService } from './produto.service';
import { FilialService } from './filial.service';

@Injectable({ providedIn: 'root' })
export class CorretorService {
  private API = `${environment.apiBaseUrl}/corretores`;

  /** Store in-memory com mocks iniciais (produtos/filiais populados depois) */
  private _corretores$ = new BehaviorSubject<Corretor[]>([
    {
      id: 1,
      nome: 'João Correia',
      tipoPessoa: 'Física' as PessoaTipo,
      documento: '123.456.789-00',
      ativo: true,
      enderecos: [
        {
          id: 1,
          tipoLogradouro: 'Rua',
          logradouro: 'das Laranjeiras',
          numero: '456',
          complemento: 'Apto 21',
          bairro: 'Centro',
          cidade: 'Rio de Janeiro',
          uf: 'RJ',
          cep: '20000-000',
          tipoEndereco: 'Residencial'
        }
      ],
      contatos: [
        {
          id: 1,
          ddd: '21',
          telefone: '998877665',
          tipoTelefone: 'Celular',
          email: 'joao@corretora.com',
          nomeContato: 'João Correia'
        }
      ],
      produtos: [], // será populado
      filiais:  [], // será populado
      dataCadastro: new Date().toISOString(),
      comissaoMinima: 5,
      comissaoMaxima: 20,
      comissaoPadrao: 10
    },
    {
      id: 2,
      nome: 'Agência Alfa Seguros',
      tipoPessoa: 'Jurídica' as PessoaTipo,
      documento: '12.345.678/0001-95',
      ativo: true,
      enderecos: [
        {
          id: 2,
          tipoLogradouro: 'Avenida',
          logradouro: 'Paulista',
          numero: '1500',
          complemento: 'Conj. 1207',
          bairro: 'Bela Vista',
          cidade: 'São Paulo',
          uf: 'SP',
          cep: '01310-200',
          tipoEndereco: 'Comercial'
        }
      ],
      contatos: [
        {
          id: 2,
          ddd: '11',
          telefone: '911112222',
          tipoTelefone: 'Comercial',
          email: 'contato@agenciaalfa.com.br',
          nomeContato: 'Atendimento'
        }
      ],
      produtos: [], // será populado
      filiais:  [], // será populado
      dataCadastro: new Date().toISOString(),
      comissaoMinima: 3,
      comissaoMaxima: 25,
      comissaoPadrao: 12
    }
  ]);

  public corretores$ = this._corretores$.asObservable();

  constructor(
    private http: HttpClient,
    private produtoService: ProdutoService,
    private filialService: FilialService
  ) {
    this.loadAll();
    this.populateFromServices();
  }

  /** Carrega todos do backend; se falhar, mantém mocks locais */
  private loadAll(): void {
    this.http.get<Corretor[]>(this.API).pipe(
      catchError(err => {
        console.warn('Falha ao carregar corretores do backend, mantendo mocks', err);
        return of([] as Corretor[]);
      }),
      tap(list => {
        if (list.length) {
          this._corretores$.next(list);
        }
      })
    ).subscribe();
  }

  /** Popula produtos e filiais usando os services existentes */
  private populateFromServices(): void {
    combineLatest([this.produtoService.getAll(), this.filialService.getAll()])
      .pipe(
        tap(([produtos, filiais]) => {
          if (!produtos?.length && !filiais?.length) return;

          const p100 = produtos.find(p => p.id === 100);
          const p101 = produtos.find(p => p.id === 101);
          const p102 = produtos.find(p => p.id === 102);
          const f1   = filiais.find(f => f.id === 1);

          const populated = this._corretores$.getValue().map(c => {
            if (c.produtos.length || c.filiais.length) return c; // já populado
            if (c.id === 1) {
              return {
                ...c,
                produtos: [p100, p101].filter(Boolean) as Produto[],
                filiais:  [f1].filter(Boolean) as Filial[]
              };
            }
            if (c.id === 2) {
              return {
                ...c,
                produtos: [p101, p102].filter(Boolean) as Produto[],
                filiais:  [f1].filter(Boolean) as Filial[]
              };
            }
            return c;
          });

          this._corretores$.next(populated);
        })
      )
      .subscribe();
  }

  // ===== CRUD =====

  getAll(): Observable<Corretor[]> {
    return this.corretores$;
  }

  getById(id: number): Corretor | undefined {
    return this._corretores$.getValue().find(c => c.id === id);
  }

  create(cor: Corretor): Observable<Corretor> {
    return this.http.post<Corretor>(this.API, cor).pipe(
      tap(novo => this._corretores$.next([...this._corretores$.getValue(), novo])),
      catchError(err => {
        console.warn('POST corretor falhou, adicionando localmente', err);
        this._corretores$.next([...this._corretores$.getValue(), cor]);
        return of(cor);
      })
    );
  }

  update(cor: Corretor): Observable<Corretor> {
    const url = `${this.API}/${cor.id}`;
    return this.http.put<Corretor>(url, cor).pipe(
      tap(updated => {
        const list = this._corretores$.getValue().map(c =>
          c.id === updated.id ? updated : c
        );
        this._corretores$.next(list);
      }),
      catchError(err => {
        console.warn('PUT corretor falhou, atualizando localmente', err);
        const list = this._corretores$.getValue().map(c =>
          c.id === cor.id ? cor : c
        );
        this._corretores$.next(list);
        return of(cor);
      })
    );
  }

  delete(id: number): Observable<void> {
    const url = `${this.API}/${id}`;
    return this.http.delete<void>(url).pipe(
      tap(() => {
        this._corretores$.next(this._corretores$.getValue().filter(c => c.id !== id));
      }),
      catchError(err => {
        console.warn('DELETE corretor falhou, removendo localmente', err);
        this._corretores$.next(this._corretores$.getValue().filter(c => c.id !== id));
        return of(void 0);
      })
    );
  }

  // ===== Helpers (mesmo padrão dos seus services) =====

  deleteEndereco(corId: number, idx: number): Observable<void> {
    const url = `${this.API}/${corId}/enderecos/${idx}`;
    return this.http.delete<void>(url).pipe(
      tap(() => {
        const list = this._corretores$.getValue().map(c => {
          if (c.id !== corId) return c;
          const novos = c.enderecos.filter((_, i) => i !== idx);
          return { ...c, enderecos: novos };
        });
        this._corretores$.next(list);
      }),
      catchError(err => {
        console.warn('DELETE endereço falhou, removendo localmente', err);
        const list = this._corretores$.getValue().map(c => {
          if (c.id !== corId) return c;
          const novos = c.enderecos.filter((_, i) => i !== idx);
          return { ...c, enderecos: novos };
        });
        this._corretores$.next(list);
        return of(void 0);
      })
    );
  }

  deleteContato(corId: number, idx: number): Observable<void> {
    const url = `${this.API}/${corId}/contatos/${idx}`;
    return this.http.delete<void>(url).pipe(
      tap(() => {
        const list = this._corretores$.getValue().map(c => {
          if (c.id !== corId) return c;
          const novos = c.contatos.filter((_, i) => i !== idx);
          return { ...c, contatos: novos };
        });
        this._corretores$.next(list);
      }),
      catchError(err => {
        console.warn('DELETE contato falhou, removendo localmente', err);
        const list = this._corretores$.getValue().map(c => {
          if (c.id !== corId) return c;
          const novos = c.contatos.filter((_, i) => i !== idx);
          return { ...c, contatos: novos };
        });
        this._corretores$.next(list);
        return of(void 0);
      })
    );
  }
}
