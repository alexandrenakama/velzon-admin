import { Component, OnInit, ViewChild, ElementRef } from '@angular/core';
import {
  FormBuilder,
  FormGroup,
  Validators,
  AbstractControl,
  ValidationErrors
} from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { OperatorFunction } from 'rxjs';
import { debounceTime, distinctUntilChanged, map } from 'rxjs/operators';
import { NgbTypeaheadSelectItemEvent } from '@ng-bootstrap/ng-bootstrap';

import { Ramo } from 'src/app/store/Ramo/ramo.model';
import { GrupoRamo } from 'src/app/store/Grupo Ramo/grupo-ramo.model';
import { RamoService } from 'src/app/core/services/ramo.service';
import { ToastService } from 'src/app/shared/toasts/toast-service';
import { dateRangeValidator } from './date-range.validator';

@Component({
  selector: 'app-cadastro-ramo',
  templateUrl: './cadastro-ramo.component.html',
  styleUrls: ['./cadastro-ramo.component.scss']
})
export class CadastroRamoComponent implements OnInit {
  @ViewChild('inicioDate') inicioDate!: ElementRef<HTMLInputElement>;
  @ViewChild('fimDate') fimDate!: ElementRef<HTMLInputElement>;

  form!: FormGroup;
  isEdit = false;
  private editingId?: string;
  grupos: GrupoRamo[] = [];

  constructor(
    private fb: FormBuilder,
    private ramoService: RamoService,
    private router: Router,
    private route: ActivatedRoute,
    private toastService: ToastService
  ) {}

  ngOnInit(): void {
    this.buildForm();

    // 1) carrega lista de grupos
    this.ramoService.getGroups().subscribe(list => {
      this.grupos = list;

      // 2) só depois checa edição
      this.route.paramMap.subscribe(params => {
        const id = params.get('id');
        if (id) {
          this.isEdit = true;
          this.editingId = id;
          const ramo = this.ramoService.getById(id);
          if (ramo) {
            // encontra o GrupoRamo correspondente
            const grpObj = this.grupos.find(g => g.id === ramo.grupo.id) || null;
            this.form.patchValue({
              grupo:             grpObj,
              grupoId:           grpObj?.id ?? null,
              identificadorRamo: +ramo.identificadorRamo,
              codigoRamo:        ramo.codigoRamo,
              nomeRamo:          ramo.nomeRamo,
              nomeAbreviado:     ramo.nomeAbreviado,
              inicioVigencia:    ramo.inicioVigencia,
              fimVigencia:       ramo.fimVigencia,
              ramoAtivo:         ramo.ramoAtivo
            });
            this.form.get('identificadorRamo')?.disable();
          }
        }
      });
    });

    // atualiza o código sempre que mudar identificador ou grupo
    this.form.get('identificadorRamo')!.valueChanges.subscribe(() => this.updateCodigo());
  }

  private buildForm() {
    this.form = this.fb.group(
      {
        grupo:             [null as GrupoRamo | null, Validators.required],
        grupoId:           [null, Validators.required],
        identificadorRamo: [null, [Validators.required, Validators.pattern(/^\d+$/)]],
        codigoRamo:        [{ value: '', disabled: true }],
        nomeRamo:          ['', Validators.required],
        nomeAbreviado:     [''],
        inicioVigencia:    [null, Validators.required],
        fimVigencia:       [null, Validators.required],
        ramoAtivo:         [true]
      },
      {
        validators: [
          dateRangeValidator,
          this.uniqueIdentificadorValidator.bind(this)
        ]
      }
    );
  }

  // valida se identificador já existe
  private uniqueIdentificadorValidator(ctrl: AbstractControl): ValidationErrors | null {
    const ident = ctrl.get('identificadorRamo')?.value?.toString();
    if (!ident) return null;
    const existing = this.ramoService.getById(ident);
    if (existing && (!this.isEdit || this.editingId !== ident)) {
      return { uniqueIdentificador: 'Já existe um ramo com este identificador.' };
    }
    return null;
  }

  // typeahead
  searchGrupo: OperatorFunction<string, GrupoRamo[]> = text$ =>
    text$.pipe(
      debounceTime(200),
      distinctUntilChanged(),
      map(term => {
        const t = term.trim().toLowerCase();
        return this.grupos
          .filter(g =>
            g.nome.toLowerCase().includes(t) ||
            g.id.toString().startsWith(t)
          )
          .slice(0, 20);
      })
    );

  formatter = (g: GrupoRamo) => g ? `${g.id} – ${g.nome}` : '';

  onSelectGrupo(event: NgbTypeaheadSelectItemEvent<GrupoRamo>) {
    const grupo = event.item;
    this.form.patchValue({
      grupo:   grupo,
      grupoId: grupo.id
    });
    this.updateCodigo();
  }

  /** 
   * Limpa seleção e abre dropdown ao clicar
   */
  openDropdown(e: Event): void {
    e.stopPropagation();
    this.form.patchValue({ grupo: null, grupoId: null });
    setTimeout(() => {
      (e.target as HTMLElement).dispatchEvent(new Event('input'));
    }, 0);
  }

  private updateCodigo() {
    const gid   = this.form.get('grupoId')!.value;
    const ident = this.form.get('identificadorRamo')!.value;
    const code  = gid != null && ident != null ? `${gid}${ident}` : '';
    this.form.patchValue({ codigoRamo: code }, { emitEvent: false });
  }

  openInicioPicker() { this.inicioDate.nativeElement.showPicker(); }
  openFimPicker()    { this.fimDate.nativeElement.showPicker(); }

  save(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }
    const v = this.form.getRawValue();
    const ramo: Ramo = {
      grupo:             { id: +v.grupoId, nome: v.grupo.nome, seguradoraId: v.grupo.seguradoraId },
      identificadorRamo: v.identificadorRamo.toString(),
      codigoRamo:        v.codigoRamo,
      nomeRamo:          v.nomeRamo,
      nomeAbreviado:     v.nomeAbreviado,
      inicioVigencia:    v.inicioVigencia,
      fimVigencia:       v.fimVigencia,
      ramoAtivo:         v.ramoAtivo
    };
    const op$ = this.isEdit
      ? this.ramoService.update(ramo)
      : this.ramoService.create(ramo);
    op$.subscribe({
      next: () => {
        const msg = this.isEdit
          ? `Ramo "${ramo.nomeRamo}" atualizado!`
          : `Ramo "${ramo.nomeRamo}" criado!`;
        this.toastService.show(msg, {
          classname: this.isEdit ? 'bg-info text-light' : 'bg-success text-light',
          delay: 5000
        });
        if (!this.isEdit) this.router.navigate(['/ramo']);
      },
      error: () => this.toastService.show(
        'Erro ao salvar ramo.',
        { classname: 'bg-warning text-dark', delay: 5000 }
      )
    });
  }

  cancel(): void {
    this.router.navigate(['/ramo']);
  }
}
