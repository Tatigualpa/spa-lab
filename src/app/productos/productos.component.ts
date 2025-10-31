// src/app/productos/productos.component.ts

import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common'; // Para *ngIf, *ngFor
import { FormsModule } from '@angular/forms'; // Para [(ngModel)]
import { MatButtonModule } from '@angular/material/button';
import { MatTableModule } from '@angular/material/table'; 
import { MatInputModule } from '@angular/material/input';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatCardModule } from '@angular/material/card';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatIconModule } from '@angular/material/icon';

// --- Placeholder para la interfaz y el servicio ---
// Deberías crear estos en un archivo de servicios similar a cliente.service.ts
export interface Producto {
  codigo: string; // Código del producto
  nombre: string; // Nombre: tipo texto
  costo: number; // Costo: tipo numérico
  precio: number; // Precio: tipo flotante
  valor: number; // Valor: tipo flotante
}

// Placeholder para el servicio (asumiendo métodos listar, agregar, actualizar, eliminar)
class ProductoService {
  listar(): any { /* Implementación mock */ return { subscribe: (cb: (data: Producto[]) => void) => cb([]) }; }
  agregar(p: Producto): any { /* Implementación mock */ return { subscribe: (cb: () => void) => cb() }; }
  actualizar(p: Producto): any { /* Implementación mock */ return { subscribe: (cb: () => void) => cb() }; }
  eliminar(id: string): any { /* Implementación mock */ return { subscribe: (cb: () => void) => cb() }; }
}
// --- Fin Placeholder ---


@Component({
  standalone: true,
  selector: 'app-productos',
  templateUrl: './productos.component.html',
  styleUrls: ['./productos.component.css'],

  imports: [
    CommonModule, 
    FormsModule, 
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
  // Inicialización con valores por defecto para los nuevos campos
  nuevo: Producto = { codigo: '', nombre: '', costo: 0, precio: 0, valor: 0 };
  editando = false;
  cargando = false;
  
  // Mensajes de error de validación
  errores: { [key: string]: string } = {};

  // Placeholder, inyecta el servicio real aquí
  constructor(private productoSrv: ProductoService) {} 

  ngOnInit() {
    this.cargarProductos();
  }

  // --- TAREA 1: FUNCIONES DE VALIDACIÓN PERSONALIZADAS ---

  validar(): boolean {
    this.errores = {};

    // 1. Nombre del producto: no debe ser nulo y tener al menos 5 caracteres.
    if (!this.nuevo.nombre || this.nuevo.nombre.length < 5) {
      this.errores['nombre'] = 'El nombre del producto debe tener mínimo 5 caracteres.';
    }

    // 2. Costo: debe ser mayor a cero.
    if (this.nuevo.costo === null || this.nuevo.costo <= 0) {
      this.errores['costo'] = 'Ingrese un costo válido.';
    }

    // 3. Precio: debe estar en el rango de 10 a 100.
    if (this.nuevo.precio < 10 || this.nuevo.precio > 100) {
      this.errores['precio'] = 'El precio está fuera de rango.';
    }

    // 4. Código de producto: debe iniciar con una letra seguida de números (Ej: A001).
    const regexCodigo = /^[a-zA-Z][0-9]+$/;
    if (!this.nuevo.codigo || !regexCodigo.test(this.nuevo.codigo)) {
      this.errores['codigo'] = 'El código debe iniciar con una letra seguida de números (Ej: A001).';
    }

    return Object.keys(this.errores).length === 0;
  }

  // -----------------------------------------------------------------

  cargarProductos() {
    this.cargando = true;
    this.productoSrv.listar().subscribe((data: Producto[]) => {
      this.productos = data;
      this.cargando = false;
    });
  }

  guardar() {
    // 🔑 Aplicar validación antes de guardar
    if (!this.validar()) {
      alert('Corrija los errores en el formulario.');
      return;
    }
    
    // Convertir a float/number por seguridad si los inputs de Material no lo hacen automáticamente
    this.nuevo.costo = Number(this.nuevo.costo);
    this.nuevo.precio = Number(this.nuevo.precio);
    this.nuevo.valor = Number(this.nuevo.valor);


    if (this.editando) {
      this.productoSrv.actualizar(this.nuevo).subscribe(() => {
        this.cargarProductos();
        this.cancelar();
      });
    } else {
      this.productoSrv.agregar(this.nuevo).subscribe(() => {
        this.cargarProductos();
        this.nuevo = { codigo: '', nombre: '', costo: 0, precio: 0, valor: 0 };
        this.errores = {}; // Limpiar errores
      });
    }
  }

  editar(producto: Producto) {
    this.nuevo = { ...producto };
    this.editando = true;
    this.errores = {}; // Limpiar errores al editar
  }

  eliminar(codigo: string) {
    if (!confirm('¿Eliminar producto?')) return;
    this.productoSrv.eliminar(codigo).subscribe(() => this.cargarProductos());
  }

  cancelar() {
    this.editando = false;
    this.nuevo = { codigo: '', nombre: '', costo: 0, precio: 0, valor: 0 };
    this.errores = {}; // Limpiar errores
  }
}