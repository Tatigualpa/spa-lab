import { Injectable } from '@angular/core';
import { of, Observable } from 'rxjs';
import { delay } from 'rxjs/operators';

// 1. DEFINICIÓN DE LA INTERFAZ
export interface Producto {
  codigo: string; // Campo: Código del producto (usado como ID)
  nombre: string; // Campo: Nombre
  costo: number; // Campo: Costo (numérico)
  precio: number; // Campo: Precio (flotante)
  valor: number; // Campo: Valor (flotante)
}

@Injectable({
  providedIn: 'root'
})
export class ProductoService {
  private productos: Producto[] = [];
  
  // Inicialización: Carga datos de localStorage o usa datos de ejemplo
  constructor() {
    const raw = localStorage.getItem('productos');
    this.productos = raw ? JSON.parse(raw) : [
      { codigo: 'A001', nombre: 'Monitor 27"', costo: 350, precio: 99.99, valor: 120 },
      { codigo: 'B023', nombre: 'Teclado Mecánico', costo: 40, precio: 75.00, valor: 85 }
    ];
    // Asegura que los datos iniciales se guarden si localStorage estaba vacío
    this.guardar(); 
  }

  // Función privada para guardar el array actual en localStorage
  private guardar() {
    localStorage.setItem('productos', JSON.stringify(this.productos));
  }

  // 1. LISTAR: Devuelve todos los productos de forma asíncrona
  listar(): Observable<Producto[]> {
    return of(this.productos).pipe(delay(500));
  }

  // 2. AGREGAR: Añade un nuevo producto
  agregar(producto: Producto): Observable<Producto> {
    // Si no tiene código, puedes generar uno simple
    if (!producto.codigo) {
      producto.codigo = 'P' + (this.productos.length + 1).toString().padStart(3, '0');
    }
    this.productos.push(producto);
    this.guardar();
    return of(producto).pipe(delay(400));
  }

  // 3. ACTUALIZAR: Modifica un producto existente
  actualizar(producto: Producto): Observable<Producto> {
    const idx = this.productos.findIndex(p => p.codigo === producto.codigo);
    if (idx >= 0) this.productos[idx] = producto;
    this.guardar();
    return of(producto).pipe(delay(400));
  }

  // 4. ELIMINAR: Borra un producto por código
  eliminar(codigo: string): Observable<boolean> {
    this.productos = this.productos.filter(p => p.codigo !== codigo);
    this.guardar();
    return of(true).pipe(delay(300));
  }
}