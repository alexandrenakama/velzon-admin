// cadastro-ramo.component.ts
import { Component, OnInit, OnDestroy, ViewChild, ElementRef } from '@angular/core';
import {
  FormBuilder,
  FormGroup,
  Validators,
  AbstractControl,
  ValidationErrors
} from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { Subscription } from 'rxjs';
import { debounceTime, distinctUntilChanged, map } from 'rxjs/operators';
import { Ramo } from 'src/app/store/Ramo/ramo.model';
import { GrupoRamo } from 'src/app/store/Grupo Ramo/grupo-ramo.model';
import { RamoService } from 'src/app/core/services/ramo.service';
import { ToastService } from 'src/app/shared/toasts/toast-service';
import { dateRangeValidator } from './date-range.validator';

@Component({
  selector: 'app-cadastro-ramo',
  templateUrl: './cadastro-ramo.component.html'
})
export class CadastroRamoComponent implements OnInit, OnDestroy {
  @ViewChild('inicioDate') inicioDate!: ElementRef<HTMLInputElement>;
  @ViewChild('fimDate') fimDate!: ElementRef<HTMLInputElement>;

  form!: FormGroup;
  isEdit = false;
  private editingId?: string;

  grupos: GrupoRamo[] = [];
  filteredGrupos: GrupoRamo[] = [];
  showGrupoList = false;
  searchTerm = '';
  private grupoSub?: Subscription;

  constructor(
    private fb: FormBuilder,
    private ramoService: RamoService,
    private router: Router,
    private route: ActivatedRoute,
    private toastService: ToastService
  ) {}

  ngOnInit(): void {
    this.buildForm();
    this.ramoService.getGroups().subscribe(list => {
      this.grupos = list;

      // filtrar enquanto digita
      this.grupoSub = this.form.get('grupo')!.valueChanges.pipe(
        debounceTime(200),
        distinctUntilChanged(),
        map(v => typeof v === 'string' ? v : ''),
        map(term => {
          this.searchTerm = term;
          const t = term.trim().toLowerCase();
          return this.grupos.filter(g =>
            g.id.toString().includes(t) ||
            g.nome.toLowerCase().includes(t)
          );
        })
      ).subscribe(arr => this.filteredGrupos = arr);

      // se for edição, preenche
      this.route.paramMap.subscribe(params => {
        const id = params.get('id');
        if (id) {
          this.isEdit = true;
          this.editingId = id;
          const ramo = this.ramoService.getById(id);
          if (ramo) {
            const grp = this.grupos.find(g => g.id === ramo.grupo.id)!;
            this.form.patchValue({
              grupo: this.formatter(grp),
              grupoId: grp.id,
              identificadorRamo: +ramo.identificadorRamo,
              codigoRamo: ramo.codigoRamo,
              nomeRamo: ramo.nomeRamo,
              nomeAbreviado: ramo.nomeAbreviado,
              inicioVigencia: ramo.inicioVigencia,
              fimVigencia: ramo.fimVigencia,
              ramoAtivo: ramo.ativo
            });
            this.form.get('identificadorRamo')?.disable();
          }
        }
      });
    });

    // atualiza código e validações
    this.form.get('identificadorRamo')!.valueChanges.subscribe(() => this.updateCodigo());
    this.form.get('grupo')!.valueChanges.subscribe(() => this.form.updateValueAndValidity());
    this.form.get('inicioVigencia')!.valueChanges.subscribe(() => this.form.updateValueAndValidity());
    this.form.get('fimVigencia')!.valueChanges.subscribe(() => this.form.updateValueAndValidity());
  }

  ngOnDestroy(): void {
    this.grupoSub?.unsubscribe();
  }

  private buildForm() {
    this.form = this.fb.group({
      grupo: [ '', [ Validators.required, this.grupoExistValidator.bind(this) ] ],
      grupoId: [ null, Validators.required ],
      identificadorRamo: [ null, [ Validators.required, Validators.pattern(/^\d+$/) ] ],
      codigoRamo: [ { value: '', disabled: true } ],
      nomeRamo: [ '', Validators.required ],
      nomeAbreviado: [ '' ],
      inicioVigencia: [ null, Validators.required ],
      fimVigencia: [ null, Validators.required ],
      ramoAtivo: [ true ]
    }, {
      validators: [
        dateRangeValidator,
        this.uniqueIdentificadorValidator.bind(this)
      ]
    });
  }

  formatter = (g: GrupoRamo) => g ? `${g.id} – ${g.nome}` : '';

  onGrupoInput(term: string): void {
    this.searchTerm = term;
    this.showGrupoList = true;
  }

  openGrupoList(): void {
    this.showGrupoList = true;
    if (!this.filteredGrupos.length) {
      this.filteredGrupos = [...this.grupos];
    }
  }

  closeGrupoList(): void {
    setTimeout(() => this.showGrupoList = false, 200);
  }

  selectGrupo(g: GrupoRamo): void {
    this.form.patchValue({
      grupo: this.formatter(g),
      grupoId: g.id
    });
    this.form.markAsDirty();
    this.updateCodigo();
    this.showGrupoList = false;
  }

  onBlurGrupo(): void {
    const ctrl = this.form.get('grupo')!;
    const val = ctrl.value as string;
    const match = this.filteredGrupos.find(g => this.formatter(g) === val);
    if (match) {
      ctrl.setErrors(null);
      this.form.patchValue({ grupoId: match.id }, { emitEvent: false });
    } else {
      ctrl.setErrors(val ? { invalidGrupo: true } : { required: true });
      this.form.patchValue({ grupoId: null }, { emitEvent: false });
    }
  }

  private grupoExistValidator(ctrl: AbstractControl): ValidationErrors | null {
    const v = ctrl.value;
    return v && typeof v === 'string' && !this.grupos.some(g => this.formatter(g) === v)
      ? { invalidGrupo: true }
      : null;
  }

  private uniqueIdentificadorValidator(ctrl: AbstractControl): ValidationErrors | null {
    const ident = ctrl.get('identificadorRamo')?.value?.toString();
    if (!ident) return null;
    const existing = this.ramoService.getById(ident);
    if (existing && (!this.isEdit || this.editingId !== ident)) {
      return { uniqueIdentificador: 'Já existe um ramo com este identificador.' };
    }
    return null;
  }

  private updateCodigo() {
    const gid = this.form.get('grupoId')!.value;
    const ident = this.form.get('identificadorRamo')!.value;
    const code = gid != null && ident != null ? `${gid}${ident}` : '';
    this.form.patchValue({ codigoRamo: code }, { emitEvent: false });
  }

  openInicioPicker(): void { this.inicioDate.nativeElement.showPicker(); }
  openFimPicker(): void { this.fimDate.nativeElement.showPicker(); }

  save(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }
    const v = this.form.getRawValue();
    const grp = this.grupos.find(g => g.id === v.grupoId)!;
    const ramo: Ramo = {
      grupo: { id: grp.id, nome: grp.nome, seguradoraId: grp.seguradoraId },
      identificadorRamo: v.identificadorRamo.toString(),
      codigoRamo: v.codigoRamo,
      nomeRamo: v.nomeRamo,
      nomeAbreviado: v.nomeAbreviado,
      inicioVigencia: v.inicioVigencia,
      fimVigencia: v.fimVigencia,
      ativo: v.ramoAtivo
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
      error: () => this.toastService.show('Erro ao salvar ramo.', { classname: 'bg-warning text-dark', delay: 5000 })
    });
  }

  cancel(): void {
    this.router.navigate(['/ramo']);
  }
}
