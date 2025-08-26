import { Component, OnInit, OnDestroy } from '@angular/core';
import {
  FormBuilder, FormGroup, Validators, AbstractControl, ValidationErrors, FormControl
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
  enderecoTipos: string[] = ['Residencial', 'Comercial'];
  telefoneTipos: string[] = ['Residencial', 'Comercial'];

  allProdutos: Produto[] = [];
  allFiliais:  Filial[]  = [];

  private cepSub?: Subscription;

  get isJuridica(): boolean {
    return this.form.get('tipoPessoa')?.value === 'Jurídica';
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
    // carregar selects
    this.produtoSvc.getAll().subscribe(p => this.allProdutos = p);
    this.filialSvc.getAll().subscribe(f => this.allFiliais = f);

    // troca tipoPessoa -> limpa documento
    this.form.get('tipoPessoa')!.valueChanges.subscribe(() => {
      this.form.get('documento')!.reset();
    });

    // CEP auto (debounce) como no modal da seguradora
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
      // ⚠️ não desabilita mais o ID — edição igual ao cadastro

      // único endereço/contato: patch mantendo null para selects vazios
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

      // selects por ID
      this.form.get('produtoIds')!.setValue((cor.produtos || []).map(p => p.id));
      this.form.get('filialIds')!.setValue((cor.filiais || []).map(f => f.id));
    });
  }

  ngOnDestroy(): void {
    this.cepSub?.unsubscribe();
  }

  // ---------- utils de validação ----------
  private minLengthArray(min: number) {
    return (ctrl: AbstractControl): ValidationErrors | null => {
      const v = ctrl.value as unknown;
      return Array.isArray(v) && v.length >= min ? null : { minLengthArray: { requiredLength: min } };
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

      // exige ao menos 1 selecionado
      produtoIds:   new FormControl<number[]>([], { nonNullable: true, validators: [Validators.required, this.minLengthArray(1)] }),
      filialIds:    new FormControl<number[]>([], { nonNullable: true, validators: [Validators.required, this.minLengthArray(1)] }),
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
      // inicia com null para placeholder "Selecione..."
      tipoEndereco:    [e?.tipoEndereco   ?? null, Validators.required],
    });
  }

  private buildContato(c?: Partial<Contato>): FormGroup {
    return this.fb.group({
      id:           [c?.id ?? null],
      nomeContato:  [c?.nomeContato ?? '', Validators.required],
      ddd:          [c?.ddd ?? '', [Validators.required, Validators.pattern(/^\d{2}$/)]],
      telefone:     [c?.telefone ?? '', [Validators.required]],
      // inicia com null para placeholder "Selecione..."
      tipoTelefone: [c?.tipoTelefone ?? null, Validators.required],
      email:        [c?.email ?? '', [Validators.required, Validators.email]],
    });
  }

  // ViaCEP (igual ao modal da seguradora)
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
    const produtosSel = (v.produtoIds as number[]).map(id => this.produtoSvc.getById(id)).filter(Boolean) as Produto[];
    const filiaisSel  = (v.filialIds as number[]).map(id => this.filialSvc.getById(id)).filter(Boolean) as Filial[];

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
