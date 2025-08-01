import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ListaAssessoriaComponent } from './lista-assessoria.component';

describe('ListaAssessoriaComponent', () => {
  let component: ListaAssessoriaComponent;
  let fixture: ComponentFixture<ListaAssessoriaComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ListaAssessoriaComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ListaAssessoriaComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
