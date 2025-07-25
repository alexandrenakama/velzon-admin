import { Component, OnInit } from '@angular/core';
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

import { GrupoRamo } from 'src/app/store/Grupo Ramo/grupo-ramo.model';
import { Seguradora } from 'src/app/store/Seguradora/seguradora.model';
import { GrupoRamoService } from 'src/app/core/services/grupo-ramo.service';
import { SeguradoraService } from 'src/app/core/services/seguradora.service';
import { ToastService } from 'src/app/shared/toasts/toast-service';

@Component({
  selector: 'app-cadastro-grupo-ramo',
  templateUrl: './cadastro-grupo-ramo.component.html',
})
export class CadastroGrupoRamoComponent implements OnInit {
  form!: FormGroup;
  isEdit = false;
  private editingId?: number;

  seguradoras: Seguradora[] = [];

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

    // 1) Primeiro carrega todas as seguradoras
    this.segService.getAll().subscribe(list => {
      this.seguradoras = list;

      // 2) Só depois verifica se estamos no modo edição
      this.route.paramMap.subscribe(params => {
        const idParam = params.get('id');
        if (idParam) {
          this.isEdit = true;
          this.editingId = +idParam;
          const grp = this.service.getById(this.editingId!);
          if (grp) {
            // encontra o objeto seguradora para pré‑preencher o Typeahead
            const segObj = this.seguradoras.find(s => s.id === grp.seguradoraId);
            this.form.patchValue({
              id:         grp.id,
              nome:       grp.nome,
              seguradora: segObj || null,
              seguradoraId: segObj ? segObj.id : null
            });
            this.form.get('id')?.disable();
          }
        }
      });
    });
  }

  private buildForm(): void {
    this.form = this.fb.group({
      id:           [null, [Validators.required, Validators.pattern(/^\d+$/)]],
      nome:         ['', Validators.required],
      seguradora:   [null as Seguradora | null, Validators.required],
      seguradoraId: [null, Validators.required]
    }, {
      validators: [this.uniqueIdValidator.bind(this)]
    });
  }

  private uniqueIdValidator(control: AbstractControl): ValidationErrors | null {
    const id = control.get('id')?.value;
    if (id == null) return null;
    const existing = this.service.getById(+id);
    if (existing && (!this.isEdit || existing.id !== this.editingId)) {
      return { uniqueId: 'Já existe um grupo com este ID.' };
    }
    return null;
  }

  searchSeguradora: OperatorFunction<string, Seguradora[]> = text$ =>
    text$.pipe(
      debounceTime(200),
      distinctUntilChanged(),
      map(term => {
        const t = term.trim().toLowerCase();
        return this.seguradoras
          .filter(s =>
            s.nome.toLowerCase().includes(t) ||
            s.id.toString().startsWith(t)
          )
          .slice(0, 20);
      })
    );

  formatter = (s: Seguradora) => s ? `${s.id} – ${s.nome}` : '';

  onSelectSeguradora(event: NgbTypeaheadSelectItemEvent<Seguradora>) {
    const seg = event.item;
    this.form.patchValue({
      seguradora:   seg,
      seguradoraId: seg.id
    });
  }

  /**  
   * Ao clicar, limpa o selecionado e reabre o dropdown  
   */
  openDropdown(e: Event): void {
    e.stopPropagation();

    this.form.patchValue({
      seguradora:   null,
      seguradoraId: null
    });

    setTimeout(() => {
      (e.target as HTMLElement).dispatchEvent(new Event('input'));
    }, 0);
  }

  save(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    const v = this.form.getRawValue();
    const grupo: GrupoRamo = {
      id:           +v.id,
      nome:         v.nome,
      seguradoraId: +v.seguradoraId
    };

    const op$ = this.isEdit
      ? this.service.update(grupo)
      : this.service.create(grupo);

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
