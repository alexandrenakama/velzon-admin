import { Component, OnInit, OnDestroy } from '@angular/core';
import {
  FormBuilder, FormGroup, Validators, AbstractControl, ValidationErrors,
  FormControl, FormArray, ValidatorFn
} from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { Subscription } from 'rxjs';
import { debounceTime, distinctUntilChanged, filter, map } from 'rxjs/operators';

import { Corretor, Endereco, Contato, PessoaTipo } from 'src/app/store/Corretor/corretor.model';
import { CorretorService } from 'src/app/core/services/corretor.service';
import { ProdutoService }  from 'src/app/core/services/produto.service';
import { FilialService }   from 'src/app/core/services/filial.service';
import { Produto } from 'src/app/store/Produto/produto.model';
import { Filial }  from 'src/app/store/Filial/filial.model';
import { ToastService } from 'src/app/shared/toasts/toast-service';
import { DefinicaoColuna } from 'src/app/shared/lista-base/lista-base.component';

@Component({
  selector: 'app-cadastro-corretor',
  templateUrl: './cadastro-corretor.component.html',
})
export class CadastroCorretorComponent implements OnInit, OnDestroy {
  form!: FormGroup;
  isEdit = false;
  submitted = false;
  private editingId?: number;

  pessoaTipos: PessoaTipo[] = ['Física', 'Jurídica'];
  enderecoTipos: string[]   = ['Residencial', 'Comercial'];
  telefoneTipos: string[]   = ['Residencial', 'Comercial'];

  allProdutos: Produto[] = [];
  allFiliais:  Filial[]  = [];

  // IDs pré-selecionados quando em edição
  private selectedProdutoIds: number[] = [];
  private selectedFilialIds:  number[] = [];

  // colunas das listas (como no exemplo do Grupo Usuário)
  prodColunas: DefinicaoColuna[] = [
    { campo: 'id',          cabecalho: 'ID',         ordenavel: true, largura: '80px' },
    { campo: 'nomeProduto', cabecalho: 'Produto',    ordenavel: true },
    { campo: 'nomeRamo',    cabecalho: 'Ramo',       ordenavel: true }
  ];
  filialColunas: DefinicaoColuna[] = [
    { campo: 'id',         cabecalho: 'ID',          ordenavel: true, largura: '80px' },
    { campo: 'nome',       cabecalho: 'Filial',      ordenavel: true },
    { campo: 'tipoPessoa', cabecalho: 'Tipo Pessoa', ordenavel: true, largura: '120px' }
  ];

  private cepSub?: Subscription;

  get isJuridica(): boolean {
    return this.form.get('tipoPessoa')?.value === 'Jurídica';
  }

  // atalhos
  get produtoFlags(): FormArray<FormControl<boolean>> {
    return this.form.get('produtoFlags') as FormArray<FormControl<boolean>>;
  }
  get filialFlags(): FormArray<FormControl<boolean>> {
    return this.form.get('filialFlags') as FormArray<FormControl<boolean>>;
  }

  constructor(
    private fb: FormBuilder,
    private service: CorretorService,
    private produtoSvc: ProdutoService,
    private filialSvc: FilialService,
    private router: Router,
    private route: ActivatedRoute,
    private toast: ToastService,
    private http: HttpClient
  ) {
    this.buildForm();
  }

  ngOnInit(): void {
    // carregar listas
    this.produtoSvc.getAll().subscribe(p => {
      this.allProdutos = p;
      this.initProdutoFlags(this.selectedProdutoIds);
    });
    this.filialSvc.getAll().subscribe(f => {
      this.allFiliais = f;
      this.initFilialFlags(this.selectedFilialIds);
    });

    // trocar tipo pessoa limpa documento
    this.form.get('tipoPessoa')!.valueChanges.subscribe(() => {
      this.form.get('documento')!.reset();
    });

    // busca CEP auto (como no modal da seguradora)
    this.cepSub = this.form.get('endereco.cep')!.valueChanges.pipe(
      map(v => (v || '').toString().replace(/\D/g, '')),
      filter(digits => digits.length === 8),
      debounceTime(300),
      distinctUntilChanged()
    ).subscribe(digits => this.buscarCep(digits));

    // modo edição
    this.route.paramMap.subscribe(params => {
      const idParam = params.get('id');
      if (!idParam) return;

      this.isEdit = true;
      this.editingId = +idParam;
      const cor = this.service.getById(this.editingId);
      if (!cor) return;

      this.form.patchValue({
        id:           cor.id,
        nome:         cor.nome,
        tipoPessoa:   cor.tipoPessoa,
        ativo:        cor.ativo,
        documento:    cor.documento,
        dataCadastro: typeof cor.dataCadastro === 'string'
          ? cor.dataCadastro.substring(0, 10)
          : new Date(cor.dataCadastro).toISOString().substring(0, 10),
        comissaoMinima: cor.comissaoMinima,
        comissaoMaxima: cor.comissaoMaxima,
        comissaoPadrao: cor.comissaoPadrao,
      });

      // único endereço/contato — mantém null para selects vazios (placeholder “Selecione…”)
      const e0 = cor.enderecos?.[0];
      const c0 = cor.contatos?.[0];
      if (e0) {
        this.form.get('endereco')!.patchValue({
          ...e0,
          tipoEndereco: e0.tipoEndereco ?? null
        });
      }
      if (c0) {
        this.form.get('contato')!.patchValue({
          ...c0,
          tipoTelefone: c0.tipoTelefone ?? null
        });
      }

      // preencher seleção de listas
      this.selectedProdutoIds = (cor.produtos || []).map(p => p.id);
      this.selectedFilialIds  = (cor.filiais  || []).map(f => f.id);
      // se listas já carregadas, re-inicializa flags
      if (this.allProdutos.length) this.initProdutoFlags(this.selectedProdutoIds);
      if (this.allFiliais.length)  this.initFilialFlags(this.selectedFilialIds);
    });
  }

  ngOnDestroy(): void {
    this.cepSub?.unsubscribe();
  }

  // --------- utils ----------
  private minOneSelected(): ValidatorFn {
    return (ctrl: AbstractControl): ValidationErrors | null => {
      const arr = ctrl as FormArray;
      const hasOne = (arr.value as boolean[]).some(v => v === true);
      return hasOne ? null : { minOneSelected: true };
    };
  }

  isInvalid(path: string): boolean {
    const c = this.form.get(path);
    return !!c && (c.invalid && (c.touched || this.submitted));
  }

  private buildForm(): void {
    this.form = this.fb.group({
      id:           [null, [Validators.required, Validators.pattern(/^\d+$/)]],
      nome:         ['', Validators.required],
      tipoPessoa:   ['Física', Validators.required],
      ativo:        [true, Validators.required],
      documento:    ['', Validators.required],
      dataCadastro: [this.todayISO(), Validators.required],

      comissaoMinima: [0,   [Validators.required, Validators.min(0),  Validators.max(100)]],
      comissaoMaxima: [100, [Validators.required, Validators.min(0),  Validators.max(100)]],
      comissaoPadrao: [0,   [Validators.required, Validators.min(0),  Validators.max(100)]],

      endereco: this.buildEndereco(),
      contato:  this.buildContato(),

      // listas com checkbox
      produtoFlags: this.fb.array<FormControl<boolean>>([], { validators: [this.minOneSelected()] }),
      filialFlags:  this.fb.array<FormControl<boolean>>([], { validators: [this.minOneSelected()] }),
    }, {
      validators: [
        this.uniqueIdValidator.bind(this),
        this.requireAddressAndContact.bind(this),
        this.comissaoValidator.bind(this),
      ]
    });
  }

  private todayISO(): string {
    return new Date().toISOString().substring(0, 10);
  }

  private buildEndereco(e?: Partial<Endereco>): FormGroup {
    return this.fb.group({
      id:              [e?.id ?? null],
      cep:             [e?.cep ?? '', [Validators.required, Validators.pattern(/^\d{5}-?\d{3}$/)]],
      tipoLogradouro:  [e?.tipoLogradouro ?? '', Validators.required],
      logradouro:      [e?.logradouro     ?? '', Validators.required],
      numero:          [e?.numero         ?? '', Validators.required],
      complemento:     [e?.complemento    ?? '', Validators.required],
      bairro:          [e?.bairro         ?? '', Validators.required],
      cidade:          [e?.cidade         ?? '', Validators.required],
      uf:              [e?.uf             ?? '', [Validators.required, Validators.maxLength(2)]],
      tipoEndereco:    [e?.tipoEndereco   ?? null, Validators.required], // null -> placeholder
    });
  }

  private buildContato(c?: Partial<Contato>): FormGroup {
    return this.fb.group({
      id:           [c?.id ?? null],
      nomeContato:  [c?.nomeContato ?? '', Validators.required],
      ddd:          [c?.ddd ?? '', [Validators.required, Validators.pattern(/^\d{2}$/)]],
      telefone:     [c?.telefone ?? '', [Validators.required]],
      tipoTelefone: [c?.tipoTelefone ?? null, Validators.required], // null -> placeholder
      email:        [c?.email ?? '', [Validators.required, Validators.email]],
    });
  }

  private buscarCep(digits: string): void {
    this.http.get<any>(`https://viacep.com.br/ws/${digits}/json/`)
      .subscribe(data => {
        if (data?.erro) return;
        const parts = (data.logradouro || '').split(' ');
        const tipo  = parts.shift() || '';
        const nome  = parts.join(' ');
        let comp    = data.complemento || '';
        if (/^até\s*\d+/i.test(comp.trim())) comp = '';
        this.form.patchValue({
          endereco: {
            tipoLogradouro: tipo,
            logradouro:     nome,
            complemento:    comp,
            bairro:         data.bairro || '',
            cidade:         data.localidade || '',
            uf:             data.uf || ''
          }
        });
      });
  }

  private initProdutoFlags(selectedIds: number[]): void {
  const controls = this.allProdutos.map(p =>
    this.fb.control<boolean>(selectedIds.includes(p.id), { nonNullable: true })
    // ou: new FormControl<boolean>(selectedIds.includes(p.id), { nonNullable: true })
  );
  this.form.setControl(
    'produtoFlags',
    this.fb.array<FormControl<boolean>>(controls, { validators: [this.minOneSelected()] })
  );
}

private initFilialFlags(selectedIds: number[]): void {
  const controls = this.allFiliais.map(f =>
    this.fb.control<boolean>(selectedIds.includes(f.id), { nonNullable: true })
    // ou: new FormControl<boolean>(selectedIds.includes(f.id), { nonNullable: true })
  );
  this.form.setControl(
    'filialFlags',
    this.fb.array<FormControl<boolean>>(controls, { validators: [this.minOneSelected()] })
  );
}


  // master checkbox (Produtos)
  produtosAllSelected(): boolean {
    return this.produtoFlags.length > 0 && this.produtoFlags.controls.every(c => c.value === true);
  }
  produtosToggleAll(checked: boolean): void {
    this.produtoFlags.controls.forEach(c => c.setValue(checked));
    this.form.markAsDirty();
  }
  produtoIsChecked(p: Produto): boolean {
    const idx = this.allProdutos.findIndex(x => x.id === p.id);
    return this.produtoFlags.at(idx)?.value ?? false;
  }
  produtoCheckboxChange(evt: Event, p: Produto): void {
    const checked = (evt.target as HTMLInputElement).checked;
    const idx = this.allProdutos.findIndex(x => x.id === p.id);
    this.produtoFlags.at(idx).setValue(checked);
    this.form.markAsDirty();
  }

  // master checkbox (Filiais)
  filiaisAllSelected(): boolean {
    return this.filialFlags.length > 0 && this.filialFlags.controls.every(c => c.value === true);
  }
  filiaisToggleAll(checked: boolean): void {
    this.filialFlags.controls.forEach(c => c.setValue(checked));
    this.form.markAsDirty();
  }
  filialIsChecked(f: Filial): boolean {
    const idx = this.allFiliais.findIndex(x => x.id === f.id);
    return this.filialFlags.at(idx)?.value ?? false;
  }
  filialCheckboxChange(evt: Event, f: Filial): void {
    const checked = (evt.target as HTMLInputElement).checked;
    const idx = this.allFiliais.findIndex(x => x.id === f.id);
    this.filialFlags.at(idx).setValue(checked);
    this.form.markAsDirty();
  }

  // ----- Validators de Form -----
  private uniqueIdValidator(ctrl: AbstractControl): ValidationErrors | null {
    const id = ctrl.get('id')?.value;
    if (id == null) return null;
    const existing = this.service.getById(+id);
    if (existing && (!this.isEdit || existing.id !== this.editingId)) {
      return { uniqueId: 'Já existe um corretor com este ID.' };
    }
    return null;
  }

  private requireAddressAndContact(ctrl: AbstractControl): ValidationErrors | null {
    const enderecoValid = ctrl.get('endereco')?.valid;
    const contatoValid  = ctrl.get('contato')?.valid;
    return enderecoValid && contatoValid ? null : { requireAddressAndContact: true };
  }

  private comissaoValidator(ctrl: AbstractControl): ValidationErrors | null {
    const min = ctrl.get('comissaoMinima')?.value;
    const max = ctrl.get('comissaoMaxima')?.value;
    const pad = ctrl.get('comissaoPadrao')?.value;
    if (min == null || max == null || pad == null) return null;

    const erros: any = {};
    if (min > max) erros.range = 'Comissão Mínima não pode ser maior que Comissão Máxima.';
    if (pad < min || pad > max) erros.padrao = 'Comissão Padrão deve estar entre Mínima e Máxima.';
    return Object.keys(erros).length ? erros : null;
  }

  // ----- Save / Cancel -----
  save(): void {
    this.submitted = true;
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    const v = this.form.getRawValue();

    const produtosSel = this.allProdutos.filter((_, i) => (v.produtoFlags as boolean[])[i]);
    const filiaisSel  = this.allFiliais.filter((_, i)  => (v.filialFlags  as boolean[])[i]);

    const cor: Corretor = {
      id:           +v.id,
      nome:         v.nome,
      tipoPessoa:   v.tipoPessoa as PessoaTipo,
      ativo:        v.ativo,
      documento:    v.documento,
      enderecos:    [v.endereco as Endereco],
      contatos:     [v.contato  as Contato],
      produtos:     produtosSel,
      filiais:      filiaisSel,
      dataCadastro: v.dataCadastro,
      comissaoMinima: v.comissaoMinima,
      comissaoMaxima: v.comissaoMaxima,
      comissaoPadrao: v.comissaoPadrao,
    };

    const op$ = this.isEdit ? this.service.update(cor) : this.service.create(cor);
    op$.subscribe(() => {
      this.toast.show(
        this.isEdit ? `Corretor "${cor.nome}" atualizado!` : `Corretor "${cor.nome}" criado!`,
        { classname: this.isEdit ? 'bg-info text-light' : 'bg-success text-light', delay: 5000 }
      );
      if (!this.isEdit) this.router.navigate(['/corretor']);
    });
  }

  cancel(): void {
    this.router.navigate(['/corretor']);
  }
}
