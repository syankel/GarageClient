import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatTableModule } from '@angular/material/table';
import { MatSelectModule } from '@angular/material/select';
import { MatOptionModule } from '@angular/material/core';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatButtonModule } from '@angular/material/button';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { GarageService, Garage } from '../../services/garage.service';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    MatTableModule,
    MatSelectModule,
    MatOptionModule,
    MatFormFieldModule,
    MatButtonModule,
    MatProgressSpinnerModule
  ],
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.scss']
})
export class HomeComponent implements OnInit {
  garages: Garage[] = []; 
  selectedGarages: Garage[] = [];
  displayedColumns: string[] = ['name', 'city', 'address', 'phone'];
  isLoading = false;
  isAdding = false;
  errorMessage = '';
  successMessage = '';

  constructor(private garageService: GarageService, private router: Router) {
  }

  ngOnInit(): void {
    this.loadGarages();
  }

  loadGarages(): void {
    this.isLoading = true;
    this.errorMessage = '';
    
    this.garageService.getGarages().subscribe({
      next: (data: any[]) => {
        this.garages = data.map(g => ({
          id: g.id != null ? String(g.id) : undefined,
          name: g.garageName ?? g.name ?? '',
          city: g.city ?? g.town ?? '',
          phone: g.phone ?? g.phoneNumber ?? g.telephone ?? g.mobile ?? '',
          address: g.address ?? ''
        }));
        this.isLoading = false;
      },
      error: (error: any) => {
        console.error('Full error object:', error);
        console.error('Status:', error.status);
        console.error('Message:', error.message);
        this.errorMessage = "שגיאה בטעינת המוסכים. אנא נסה שוב.";
        this.isLoading = false;
      }
    });
  }

  addGarages(): void {
    if (this.selectedGarages.length === 0) {
      this.errorMessage = "לא נבחרו מוסכים להוספה.";
      return;
    }

    const existingIds = new Set(this.garages.map(g => g.id));
    const newGarages = this.selectedGarages.filter(g => !existingIds.has(g.id));
    const duplicateCount = this.selectedGarages.length - newGarages.length;

    if (newGarages.length === 0) {
      this.errorMessage = `כל ${this.selectedGarages.length} המוסכים שנבחרו כבר קיימים בטבלה.`;
      return;
    }

    if (duplicateCount > 0) {
      this.errorMessage = `${duplicateCount} מוסכים כבר קיימים בטבלה. הוספת ${newGarages.length} חדשים בלבד.`;
    }

    this.isAdding = true;
    this.successMessage = '';

    this.garageService.addGarages(newGarages).subscribe({
      next: (response: any) => {
        this.successMessage = `${newGarages.length} מוסך נוסף בהצלחה!`;
        this.selectedGarages = [];
        this.isAdding = false;
        this.loadGarages();
      },
      error: (error: any) => {
        console.error('שגיאה בהוספת מוסכים', error);
        this.errorMessage = "שגיאה בהוספת המוסכים. אנא נסה שוב.";
        this.isAdding = false;
      }
    });
  }
  
  isSelected(garage: Garage): boolean {
    return this.selectedGarages.some(g => g.id === garage.id);
  }

  getUniqueGarages(): Garage[] {
    const seen = new Set<string>();
    const unique: Garage[] = [];
    for (const garage of this.garages) {
      const key = (garage.name || '').toLowerCase().trim();
      if (key === '') continue;
      if (!seen.has(key)) {
        seen.add(key);
        unique.push(garage);
      }
    }
    return unique;
  }

  formatPhone(raw?: string): string {
    if (!raw) return '';
    const digits = raw.replace(/\D/g, '');
    if (!digits) return '';

    if (digits.length === 10 && digits.startsWith('0')) {
      return digits.slice(0, 3) + '-' + digits.slice(3, 6) + '-' + digits.slice(6);
    }

    if (digits.length === 9) {
      return '0' + digits.slice(0, 2) + '-' + digits.slice(2, 5) + '-' + digits.slice(5);
    }

    return digits.replace(/(\d{3})(?=\d)/g, '$1-');
  }
}

