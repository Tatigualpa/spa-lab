// src/app/productos/productos.component.ts

import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, AbstractControl, ReactiveFormsModule } from '@angular/forms';
import { ProductoService, Producto} from '../services/producto.service';

import { MatButtonModule } from '@angular/material/button';
import { MatTableModule } from '@angular/material/table'; 
import { MatInputModule } from '@angular/material/input';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatCardModule } from '@angular/material/card';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatIconModule } from '@angular/material/icon';

// Función de validador personalizado para el Rango de Precio (10 a 100)
function rangoPrecioValidator(control: AbstractControl): { [key: string]: any } | null {
  const precio = control.value;
  if (precio !== null && (precio < 10 || precio > 100)) {
    return { 'rangoPrecio': true };
  }
  return null;
}

// Función de validador personalizado para el Código (Letra seguida de números)
function codigoProductoValidator(control: AbstractControl): { [key: string]: any } | null {
  const codigo = control.value;
  const regexCodigo = /^[a-zA-Z][0-9]+$/;
  // Solo validamos si hay un valor, sino dejamos que Validators.required lo maneje
  if (codigo && !regexCodigo.test(codigo)) {
    return { 'codigoInvalido': true };
  }
  return null;
}

@Component({
  standalone: true,
  selector: 'app-productos',
  templateUrl: './productos.component.html',
  styleUrls: ['./productos.component.css'],

  imports: [
    CommonModule, 
    ReactiveFormsModule, 
    MatButtonModule, 
    MatTableModule,
    MatInputModule,
    MatFormFieldModule,
    MatCardModule,
    MatToolbarModule,
    MatIconModule
  ]
})
export class ProductosComponent implements OnInit {
  productos: Producto[] = [];
  
  // 🔑 CAMBIO CLAVE: FormGroup para manejar el formulario
  productoForm: FormGroup; 
  
  // No necesitamos 'nuevo', editando o cargando, pero las mantenemos
  editando = false;
  cargando = false;

  constructor(private productoSrv: ProductoService, private fb: FormBuilder) { 
    // 🔑 Inicialización del FormGroup con las validaciones
    this.productoForm = this.fb.group({
      codigo: ['', [Validators.required, codigoProductoValidator]], // Validador personalizado
      nombre: ['', [Validators.required, Validators.minLength(5)]], // Validación nativa
      costo: [0, [Validators.required, Validators.min(0.01)]], // Costo > 0
      precio: [0, [Validators.required, rangoPrecioValidator]], // Validador personalizado
      valor: [0, [Validators.required, Validators.min(0)]], 
    });
  } 

  ngOnInit() {
    this.cargarProductos();
  }

  // Se remueve la función validar() manual. Ahora Angular la maneja.

  // Helper para obtener el valor del formulario
  get f() { return this.productoForm.controls; }

  // -----------------------------------------------------------------

cargarProductos() {

    this.cargando = true;

    this.productoSrv.listar().subscribe((data: Producto[]) => {

      this.productos = data;

      this.cargando = false;

    });

  }

  guardar() {
    // 🔑 Nuevo check de validación basado en el estado del formulario
    if (this.productoForm.invalid) {
      // Marcar todos los campos como 'touched' para que los errores se muestren inmediatamente
      this.productoForm.markAllAsTouched();
      return;
    }
    
    // Obtener los datos válidos del formulario
    const nuevoProducto = this.productoForm.value as Producto; 

    // Lógica de guardado...
    if (this.editando) {
      this.productoSrv.actualizar(nuevoProducto).subscribe(() => {
        this.cargarProductos();
        this.cancelar();
      });
    } else {
      this.productoSrv.agregar(nuevoProducto).subscribe(() => {
        this.cargarProductos();
        this.productoForm.reset({ codigo: '', nombre: '', costo: 0, precio: 0, valor: 0 }); // Resetear el formulario
      });
    }
  }

  editar(producto: Producto) {
    this.editando = true;
    // 🔑 Llenar el formulario con los datos del producto
    this.productoForm.setValue(producto);
  }

  eliminar(codigo: string) {
    // ... (se mantiene igual)
  }

  cancelar() {
    this.editando = false;
    this.productoForm.reset({ codigo: '', nombre: '', costo: 0, precio: 0, valor: 0 }); // Resetear
  }
}