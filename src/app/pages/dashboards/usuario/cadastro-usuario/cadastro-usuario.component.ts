// src/app/pages/dashboards/usuario/cadastro-usuario/cadastro-usuario.component.ts
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

import { Usuario } from 'src/app/store/Usuario/usuario.model';
import { UsuarioService } from 'src/app/core/services/usuario.service';
import { GrupoUsuario } from 'src/app/store/Grupo Usuario/grupo-usuario.model';
import { GrupoUsuarioService } from 'src/app/core/services/grupo-usuario.service';
import { ToastService } from 'src/app/shared/toasts/toast-service';

@Component({
  selector: 'app-cadastro-usuario',
  templateUrl: './cadastro-usuario.component.html',
})
export class CadastroUsuarioComponent implements OnInit, OnDestroy {
  form!: FormGroup;
  isEdit = false;
  private editingId?: number;
  grupos: GrupoUsuario[] = [];
  filteredGrupos: GrupoUsuario[] = [];
  showGroupList = false;
  private groupSub?: Subscription;
  @ViewChild('grpInput') grpInput!: ElementRef<HTMLInputElement>;

  constructor(
    private fb: FormBuilder,
    private service: UsuarioService,
    private grupoService: GrupoUsuarioService,
    private router: Router,
    private route: ActivatedRoute,
    private toast: ToastService
  ) {
    this.buildForm();
  }

  ngOnInit(): void {
    // Carrega todos os grupos e configura o pipe de filtragem
    this.grupoService.getAll().subscribe(list => {
      this.grupos = list;
      this.groupSub = this.form.get('grupoUsuario')!.valueChanges.pipe(
        debounceTime(200),
        distinctUntilChanged(),
        map(v => typeof v === 'string' ? v : ''),
        map(term => {
          const t = term.trim().toLowerCase();
          return this.grupos.filter(g =>
            g.cargo.toLowerCase().includes(t) ||
            g.id.toString().startsWith(t)
          );
        })
      ).subscribe(arr => this.filteredGrupos = arr);
    });

    // Se estivermos em modo de edição, pré-preenche o formulário
    this.route.paramMap.subscribe(params => {
      const idParam = params.get('id');
      if (!idParam) return;
      this.isEdit = true;
      this.editingId = +idParam;
      const usr = this.service.getById(this.editingId);
      if (!usr) return;

      this.form.patchValue({
        id: usr.id,
        nome: usr.nome,
        email: usr.email,
        senha: usr.senha,
        grupoUsuario: `${usr.grupoUsuario.id} – ${usr.grupoUsuario.cargo}`,
        grupoUsuarioId: usr.grupoUsuario.id,
        ativo: usr.ativo
      });
      this.form.get('id')?.disable();
    });
  }

  ngOnDestroy(): void {
    this.groupSub?.unsubscribe();
  }

  private buildForm(): void {
    this.form = this.fb.group({
      id:             [null, [Validators.required, Validators.pattern(/^\d+$/)]],
      nome:           ['', Validators.required],
      email:          ['', [Validators.required, Validators.email]],
      senha:          ['', Validators.required],
      grupoUsuario:   ['', [Validators.required, this.groupExistValidator.bind(this)]],
      grupoUsuarioId: [null, Validators.required],
      ativo:          [true]
    }, {
      validators: this.uniqueIdValidator.bind(this)
    });
  }

  openGroupList(): void {
    this.showGroupList = true;
    if (!this.filteredGrupos.length) {
      this.filteredGrupos = [...this.grupos];
    }
  }

  onGroupInput(term: string): void {
    this.showGroupList = true;
  }

  closeGroupList(): void {
    setTimeout(() => this.showGroupList = false, 200);
  }

  selectGrupo(g: GrupoUsuario): void {
    this.form.patchValue({
      grupoUsuario:   `${g.id} – ${g.cargo}`,
      grupoUsuarioId: g.id
    });
    this.form.markAsDirty();
    this.showGroupList = false;
  }

  onBlurGrupo(): void {
    const ctrl = this.form.get('grupoUsuario')!;
    const val = ctrl.value as string;
    const match = this.grupos.find(g => `${g.id} – ${g.cargo}` === val);
    if (match) {
      ctrl.setErrors(null);
      this.form.patchValue({ grupoUsuarioId: match.id }, { emitEvent: false });
    } else {
      ctrl.setErrors(val ? { invalidGrupo: true } : { required: true });
      this.form.patchValue({ grupoUsuarioId: null }, { emitEvent: false });
    }
  }

  private groupExistValidator(ctrl: AbstractControl): ValidationErrors | null {
    const v = ctrl.value as string;
    return v && !this.grupos.some(g => `${g.id} – ${g.cargo}` === v)
      ? { invalidGrupo: true }
      : null;
  }

  private uniqueIdValidator(c: AbstractControl): ValidationErrors | null {
    const id = c.get('id')?.value;
    if (id == null) return null;
    const existing = this.service.getById(+id);
    if (existing && (!this.isEdit || existing.id !== this.editingId)) {
      return { uniqueId: 'Já existe um usuário com este ID.' };
    }
    return null;
  }

  save(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }
    const v = this.form.getRawValue();
    const selected = this.grupos.find(g => g.id === +v.grupoUsuarioId)!;
    const usr: Usuario = {
      id:           +v.id,
      nome:         v.nome,
      email:        v.email,
      senha:        v.senha,
      ativo:        v.ativo,
      grupoUsuario: selected
    };
    const op$ = this.isEdit
      ? this.service.update(usr)
      : this.service.create(usr);

    op$.subscribe({
      next: () => {
        this.toast.show(
          this.isEdit
            ? `Usuário "${usr.nome}" atualizado!`
            : `Usuário "${usr.nome}" criado!`,
          {
            classname: this.isEdit ? 'bg-info text-light' : 'bg-success text-light',
            delay: 5000
          }
        );
        if (!this.isEdit) this.router.navigate(['/usuario']);
      },
      error: () => {
        this.toast.show('Erro ao salvar usuário.', {
          classname: 'bg-warning text-dark',
          delay: 5000
        });
      }
    });
  }

  cancel(): void {
    this.router.navigate(['/usuario']);
  }
}
