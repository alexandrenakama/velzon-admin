// src/app/core/services/ramo.service.ts
import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable, of } from 'rxjs';
import { catchError, tap } from 'rxjs/operators';
import { HttpClient } from '@angular/common/http';
import { environment } from 'src/environments/environment';
import { Ramo } from 'src/app/store/Ramo/ramo.model';
import { GrupoRamo } from 'src/app/store/Grupo Ramo/grupo-ramo.model';
import { GrupoRamoService } from './grupo-ramo.service';

@Injectable({ providedIn: 'root' })
export class RamoService {
  private API = `${environment.apiBaseUrl}/ramos`;

  constructor(
    private http: HttpClient,
    private grupoRamoService: GrupoRamoService
  ) {
    this.loadAll();
  }

  /** Obtém lista de grupos delegando ao GrupoRamoService */
  getGroups(): Observable<GrupoRamo[]> {
    return this.grupoRamoService.getAll();
  }

  /** Comportamento interno de ramos (in-memory + api) */
  private _ramos$ = new BehaviorSubject<Ramo[]>([
    {
      grupo: { id: 18, nome: 'Seguro Pet' },
      identificadorRamo: '1',
      codigoRamo: '1801',
      nomeRamo: 'Empresa Blindada',
      nomeAbreviado: 'Empresa',
      inicioVigencia: '2025-02-07',
      fimVigencia: '2025-12-02',
      ramoAtivo: false
    },
    {
      grupo: { id: 15, nome: 'Seguro Automotivo' },
      identificadorRamo: '2',
      codigoRamo: '1502',
      nomeRamo: 'Empresa Blindada',
      nomeAbreviado: 'Empresa',
      inicioVigencia: '2025-04-16',
      fimVigencia: '2025-12-31',
      ramoAtivo: true
    },
    {
      grupo: { id: 12, nome: 'Seguro Residencial' },
      identificadorRamo: '3',
      codigoRamo: '1203',
      nomeRamo: 'Auto Protegido',
      nomeAbreviado: 'Auto',
      inicioVigencia: '2025-01-06',
      fimVigencia: '2025-06-14',
      ramoAtivo: true
    },
    {
      grupo: { id: 20, nome: 'Seguro Tecnológico' },
      identificadorRamo: '4',
      codigoRamo: '2004',
      nomeRamo: 'Tech Seguro',
      nomeAbreviado: 'Tech',
      inicioVigencia: '2025-02-07',
      fimVigencia: '2025-06-08',
      ramoAtivo: false
    },
    {
      grupo: { id: 11, nome: 'Seguro Agrícola' },
      identificadorRamo: '5',
      codigoRamo: '1105',
      nomeRamo: 'Empresa Blindada',
      nomeAbreviado: 'Empresa',
      inicioVigencia: '2025-04-16',
      fimVigencia: '2025-12-31',
      ramoAtivo: true
    },
    {
      grupo: { id: 15, nome: 'Seguro Automotivo' },
      identificadorRamo: '6',
      codigoRamo: '1506',
      nomeRamo: 'Educação Garantida',
      nomeAbreviado: 'Educação',
      inicioVigencia: '2025-06-25',
      fimVigencia: '2025-10-23',
      ramoAtivo: true
    },
    {
      grupo: { id: 17, nome: 'Seguro Saúde' },
      identificadorRamo: '7',
      codigoRamo: '1707',
      nomeRamo: 'Pet Protegido',
      nomeAbreviado: 'Pet',
      inicioVigencia: '2025-06-15',
      fimVigencia: '2025-12-11',
      ramoAtivo: false
    },
    {
      grupo: { id: 11, nome: 'Seguro Agrícola' },
      identificadorRamo: '8',
      codigoRamo: '1108',
      nomeRamo: 'Casa Segura',
      nomeAbreviado: 'Casa',
      inicioVigencia: '2025-06-02',
      fimVigencia: '2025-11-23',
      ramoAtivo: true
    },
    {
      grupo: { id: 16, nome: 'Seguro Viagem' },
      identificadorRamo: '9',
      codigoRamo: '1609',
      nomeRamo: 'Auto Protegido',
      nomeAbreviado: 'Auto',
      inicioVigencia: '2025-01-24',
      fimVigencia: '2025-12-17',
      ramoAtivo: false
    },
    {
      grupo: { id: 19, nome: 'Seguro Educacional' },
      identificadorRamo: '10',
      codigoRamo: '1910',
      nomeRamo: 'Pet Protegido',
      nomeAbreviado: 'Pet',
      inicioVigencia: '2025-02-07',
      fimVigencia: '2025-09-04',
      ramoAtivo: true
    },
    {
      grupo: { id: 11, nome: 'Seguro Agrícola' },
      identificadorRamo: '11',
      codigoRamo: '1111',
      nomeRamo: 'Auto Protegido',
      nomeAbreviado: 'Auto',
      inicioVigencia: '2025-01-08',
      fimVigencia: '2025-11-29',
      ramoAtivo: false
    },
    {
      grupo: { id: 19, nome: 'Seguro Educacional' },
      identificadorRamo: '12',
      codigoRamo: '1912',
      nomeRamo: 'Pet Protegido',
      nomeAbreviado: 'Pet',
      inicioVigencia: '2025-03-22',
      fimVigencia: '2025-11-16',
      ramoAtivo: true
    },
    {
      grupo: { id: 20, nome: 'Seguro Tecnológico' },
      identificadorRamo: '13',
      codigoRamo: '2013',
      nomeRamo: 'Tech Seguro',
      nomeAbreviado: 'Tech',
      inicioVigencia: '2025-04-17',
      fimVigencia: '2025-07-28',
      ramoAtivo: false
    },
    {
      grupo: { id: 17, nome: 'Seguro Saúde' },
      identificadorRamo: '14',
      codigoRamo: '1714',
      nomeRamo: 'Pet Protegido',
      nomeAbreviado: 'Pet',
      inicioVigencia: '2025-05-12',
      fimVigencia: '2025-12-12',
      ramoAtivo: true
    },
    {
      grupo: { id: 15, nome: 'Seguro Automotivo' },
      identificadorRamo: '15',
      codigoRamo: '1515',
      nomeRamo: 'Saúde Premium',
      nomeAbreviado: 'Saúde',
      inicioVigencia: '2025-02-01',
      fimVigencia: '2025-07-24',
      ramoAtivo: false
    },
    {
      grupo: { id: 13, nome: 'Seguro de Vida' },
      identificadorRamo: '16',
      codigoRamo: '1316',
      nomeRamo: 'Vida Total',
      nomeAbreviado: 'Vida',
      inicioVigencia: '2025-01-01',
      fimVigencia: '2025-07-18',
      ramoAtivo: true
    },
    {
      grupo: { id: 17, nome: 'Seguro Saúde' },
      identificadorRamo: '17',
      codigoRamo: '1717',
      nomeRamo: 'Auto Protegido',
      nomeAbreviado: 'Auto',
      inicioVigencia: '2025-04-28',
      fimVigencia: '2025-11-29',
      ramoAtivo: false
    },
    {
      grupo: { id: 18, nome: 'Seguro Pet' },
      identificadorRamo: '18',
      codigoRamo: '1818',
      nomeRamo: 'Empresa Blindada',
      nomeAbreviado: 'Empresa',
      inicioVigencia: '2025-02-28',
      fimVigencia: '2025-08-26',
      ramoAtivo: false
    },
    {
      grupo: { id: 12, nome: 'Seguro Residencial' },
      identificadorRamo: '19',
      codigoRamo: '1219',
      nomeRamo: 'Casa Segura',
      nomeAbreviado: 'Casa',
      inicioVigencia: '2025-04-19',
      fimVigencia: '2025-11-20',
      ramoAtivo: true
    },
    {
      grupo: { id: 20, nome: 'Seguro Tecnológico' },
      identificadorRamo: '20',
      codigoRamo: '2020',
      nomeRamo: 'Tech Seguro',
      nomeAbreviado: 'Tech',
      inicioVigencia: '2025-03-15',
      fimVigencia: '2025-10-31',
      ramoAtivo: true
    },
    {
      grupo: { id: 15, nome: 'Seguro Automotivo' },
      identificadorRamo: '21',
      codigoRamo: '1521',
      nomeRamo: 'Saúde Premium',
      nomeAbreviado: 'Saúde',
      inicioVigencia: '2025-06-15',
      fimVigencia: '2025-11-01',
      ramoAtivo: false
    },
    {
      grupo: { id: 13, nome: 'Seguro de Vida' },
      identificadorRamo: '22',
      codigoRamo: '1322',
      nomeRamo: 'Vida Total',
      nomeAbreviado: 'Vida',
      inicioVigencia: '2025-02-06',
      fimVigencia: '2025-12-14',
      ramoAtivo: true
    },
    {
      grupo: { id: 14, nome: 'Seguro Empresarial' },
      identificadorRamo: '23',
      codigoRamo: '1423',
      nomeRamo: 'Empresa Blindada',
      nomeAbreviado: 'Empresa',
      inicioVigencia: '2025-03-04',
      fimVigencia: '2025-07-15',
      ramoAtivo: true
    },
    {
      grupo: { id: 12, nome: 'Seguro Residencial' },
      identificadorRamo: '24',
      codigoRamo: '1224',
      nomeRamo: 'Casa Segura',
      nomeAbreviado: 'Casa',
      inicioVigencia: '2025-04-01',
      fimVigencia: '2025-12-10',
      ramoAtivo: false
    },
    {
      grupo: { id: 20, nome: 'Seguro Tecnológico' },
      identificadorRamo: '25',
      codigoRamo: '2025',
      nomeRamo: 'Tech Seguro',
      nomeAbreviado: 'Tech',
      inicioVigencia: '2025-01-01',
      fimVigencia: '2025-08-11',
      ramoAtivo: true
    }
  ]);
  public ramos$ = this._ramos$.asObservable();

  /** Carrega todos do backend (ou mantém os mocks) */
  loadAll(): void {
    this.http.get<Ramo[]>(this.API).pipe(
      catchError(err => {
        console.warn('Falha ao carregar do backend, mantendo dados mock', err);
        return of([] as Ramo[]);
      }),
      tap(apiList => {
        if (apiList.length) {
          this._ramos$.next(apiList);
        }
      })
    ).subscribe();
  }

  /** Retorna Observable de ramos */
  getAll(): Observable<Ramo[]> {
    return this.ramos$;
  }

  /** GET síncrono para editar */
  getById(id: string): Ramo | undefined {
    return this._ramos$.getValue().find(r => r.identificadorRamo === id);
  }

  /** Cria ramo (POST + fallback local) */
  create(ramo: Ramo): Observable<Ramo> {
    return this.http.post<Ramo>(this.API, ramo).pipe(
      tap(novo => this._ramos$.next([...this._ramos$.getValue(), novo])),
      catchError(err => {
        console.warn('POST falhou, adicionando localmente', err);
        this._ramos$.next([...this._ramos$.getValue(), ramo]);
        return of(ramo);
      })
    );
  }

  /** Atualiza ramo (PUT + fallback local) */
  update(ramo: Ramo): Observable<Ramo> {
    const url = `${this.API}/${ramo.identificadorRamo}`;
    return this.http.put<Ramo>(url, ramo).pipe(
      tap(updated => {
        const list = this._ramos$.getValue().map(r =>
          r.identificadorRamo === updated.identificadorRamo ? updated : r
        );
        this._ramos$.next(list);
      }),
      catchError(err => {
        console.warn('PUT falhou, atualizando localmente', err);
        const list = this._ramos$.getValue().map(r =>
          r.identificadorRamo === ramo.identificadorRamo ? ramo : r
        );
        this._ramos$.next(list);
        return of(ramo);
      })
    );
  }

  /** Remove ramo (DELETE + fallback local) */
  delete(id: string): Observable<void> {
    const url = `${this.API}/${id}`;
    return this.http.delete<void>(url).pipe(
      tap(() => {
        this._ramos$.next(
          this._ramos$.getValue().filter(r => r.identificadorRamo !== id)
        );
      }),
      catchError(err => {
        console.warn('DELETE falhou, removendo localmente', err);
        this._ramos$.next(
          this._ramos$.getValue().filter(r => r.identificadorRamo !== id)
        );
        return of(void 0);
      })
    );
  }
}
