// cadastro-grupo-ramo.component.ts
import { Component, OnInit, OnDestroy, ViewChild, ElementRef } from '@angular/core';
import {
  FormBuilder, FormGroup, Validators,
  AbstractControl, ValidationErrors
} from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { Subscription } from 'rxjs';
import { debounceTime, distinctUntilChanged, map } from 'rxjs/operators';
import { GrupoRamo } from 'src/app/store/Grupo Ramo/grupo-ramo.model';
import { Seguradora } from 'src/app/store/Seguradora/seguradora.model';
import { GrupoRamoService } from 'src/app/core/services/grupo-ramo.service';
import { SeguradoraService } from 'src/app/core/services/seguradora.service';
import { ToastService } from 'src/app/shared/toasts/toast-service';

@Component({
  selector: 'app-cadastro-grupo-ramo',
  templateUrl: './cadastro-grupo-ramo.component.html',
})
export class CadastroGrupoRamoComponent implements OnInit, OnDestroy {
  form!: FormGroup;
  isEdit = false;
  private editingId?: number;
  seguradoras: Seguradora[] = [];
  filteredSeguradoras: Seguradora[] = [];
  showSegList = false;
  searchTerm = '';
  private segSub?: Subscription;
  @ViewChild('segInput') segInput!: ElementRef<HTMLInputElement>;

  constructor(
    private fb: FormBuilder,
    private service: GrupoRamoService,
    private segService: SeguradoraService,
    private router: Router,
    private route: ActivatedRoute,
    private toast: ToastService
  ) {}

  ngOnInit(): void {
    this.buildForm();
    this.segService.getAll().subscribe(list => {
      this.seguradoras = list;
      this.segSub = this.form.get('seguradora')!.valueChanges.pipe(
        debounceTime(200),
        distinctUntilChanged(),
        map(v => typeof v === 'string' ? v : ''),
        map(term => {
          this.searchTerm = term;
          const t = term.trim().toLowerCase();
          return this.seguradoras.filter(s =>
            s.nome.toLowerCase().includes(t) || s.id.toString().startsWith(t)
          );
        })
      ).subscribe(arr => this.filteredSeguradoras = arr);

      this.route.paramMap.subscribe(params => {
        const idParam = params.get('id');
        if (idParam) {
          this.isEdit = true;
          this.editingId = +idParam;
          const grp = this.service.getById(this.editingId!);
          if (grp) {
            const segObj = this.seguradoras.find(s => s.id === grp.seguradoraId)!;
            this.form.patchValue({
              id: grp.id,
              nome: grp.nome,
              seguradora: this.formatSeg(segObj),
              seguradoraId: segObj.id
            });
            this.form.get('id')?.disable();
            this.onBlurSeguradora();
          }
        }
      });
    });
  }

  ngOnDestroy(): void {
    this.segSub?.unsubscribe();
  }

  private buildForm(): void {
    this.form = this.fb.group({
      id: [null, [Validators.required, Validators.pattern(/^\d+$/)]],
      nome: ['', Validators.required],
      seguradora: ['', [Validators.required, this.segExistValidator.bind(this)]],
      seguradoraId: [null, Validators.required]
    }, {
      validators: [this.uniqueIdValidator.bind(this)]
    });
  }

  formatSeg(s: Seguradora) {
    return `${s.id} – ${s.nome}`;
  }

  onSegInput(term: string): void {
    this.searchTerm = term;
    this.showSegList = true;
  }

  openSegList(): void {
    this.showSegList = true;
    if (!this.filteredSeguradoras.length) {
      this.filteredSeguradoras = [...this.seguradoras];
    }
  }

  closeSegList(): void {
    setTimeout(() => this.showSegList = false, 200);
  }

  selectSeguradora(s: Seguradora): void {
    this.form.patchValue({
      seguradora: this.formatSeg(s),
      seguradoraId: s.id
    });
    this.form.markAsDirty();
    this.showSegList = false;
  }

  onBlurSeguradora(): void {
    const ctrl = this.form.get('seguradora')!;
    const val = ctrl.value as string;
    const match = this.seguradoras.find(s => this.formatSeg(s) === val);
    if (match) {
      ctrl.setErrors(null);
      this.form.patchValue({ seguradoraId: match.id }, { emitEvent: false });
    } else {
      ctrl.setErrors(val ? { invalidSeguradora: true } : { required: true });
      this.form.patchValue({ seguradoraId: null }, { emitEvent: false });
    }
  }

  private segExistValidator(ctrl: AbstractControl): ValidationErrors | null {
    const v = ctrl.value as string;
    return v && !this.seguradoras.some(s => this.formatSeg(s) === v)
      ? { invalidSeguradora: true }
      : null;
  }

  private uniqueIdValidator(ctrl: AbstractControl): ValidationErrors | null {
    const id = ctrl.get('id')?.value;
    if (!id) return null;
    const existing = this.service.getById(+id);
    if (existing && (!this.isEdit || existing.id !== this.editingId)) {
      return { uniqueId: 'Já existe um grupo com este ID.' };
    }
    return null;
  }

  save(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }
    const v = this.form.getRawValue();
    const grupo: GrupoRamo = {
      id: +v.id,
      nome: v.nome,
      seguradoraId: +v.seguradoraId
    };
    const op$ = this.isEdit ? this.service.update(grupo) : this.service.create(grupo);
    op$.subscribe({
      next: () => {
        const msg = this.isEdit
          ? `Grupo de Ramo "${grupo.nome}" atualizado!`
          : `Grupo de Ramo "${grupo.nome}" criado!`;
        this.toast.show(msg, {
          classname: this.isEdit ? 'bg-info text-light' : 'bg-success text-light',
          delay: 5000
        });
        if (!this.isEdit) this.router.navigate(['/grupo-ramo']);
      },
      error: () => {
        this.toast.show('Erro ao salvar grupo de ramo.', {
          classname: 'bg-warning text-dark',
          delay: 5000
        });
      }
    });
  }

  cancel(): void {
    this.router.navigate(['/grupo-ramo']);
  }
}
