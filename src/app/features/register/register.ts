import { CommonModule } from '@angular/common';
import { Component, inject, OnInit, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { forkJoin } from 'rxjs';
import { ApiService } from '../../core/services/api.service';
import { DepartmentResponse, Role, UserRequest } from '../../models/domain.models';

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  styleUrl: '../login/login.css',
  templateUrl: './register.html',
})
export class Register implements OnInit {
  private api = inject(ApiService);

  departments = signal<DepartmentResponse[]>([]);
  staffRole = signal<Role | null>(null);
  loadingReferences = signal(true);
  isSubmitting = signal(false);
  errorMessage = signal<string | null>(null);
  registered = signal(false);
  passwordConfirmation = '';

  form: UserRequest = {
    fullName: '',
    email: '',
    phoneNumber: '',
    roleId: 0,
    departmentId: 0,
    password: '',
  };

  ngOnInit() {
    forkJoin({
      roles: this.api.getRoles(),
      departments: this.api.getAllDepartments(),
    }).subscribe({
      next: ({ roles, departments }) => {
        const staff = roles.find((role) => role.name.trim().toLowerCase() === 'staff');
        this.staffRole.set(staff ?? null);
        this.departments.set(departments);
        if (staff) this.form.roleId = staff.id ?? 0;
        this.loadingReferences.set(false);
      },
      error: (error: unknown) => {
        console.error('Failed to load registration options:', error);
        this.errorMessage.set(
          'Could not load registration options. Refresh the page and try again.',
        );
        this.loadingReferences.set(false);
      },
    });
  }

  submit() {
    if (this.isSubmitting() || this.loadingReferences() || !this.staffRole()) return;

    if (!this.form.departmentId) {
      this.errorMessage.set('Select your department.');
      return;
    }
    if (!this.form.password?.trim()) {
      this.errorMessage.set('Enter a password.');
      return;
    }
    if (this.form.password !== this.passwordConfirmation) {
      this.errorMessage.set('The passwords do not match.');
      return;
    }

    this.errorMessage.set(null);
    this.isSubmitting.set(true);
    this.api.createUser({ ...this.form, roleId: this.staffRole()!.id! }).subscribe({
      next: () => {
        this.registered.set(true);
        this.isSubmitting.set(false);
      },
      error: (error: unknown) => {
        console.error('Account registration failed:', error);
        this.errorMessage.set(this.getErrorMessage(error));
        this.isSubmitting.set(false);
      },
    });
  }

  private getErrorMessage(error: unknown): string {
    if (typeof error !== 'object' || error === null || !('error' in error)) {
      return 'Could not create your account. Please try again.';
    }

    const body = error.error;
    if (typeof body === 'string' && body.trim()) return body;
    if (typeof body === 'object' && body !== null) {
      if ('detail' in body && typeof body.detail === 'string') return body.detail;
      if ('message' in body && typeof body.message === 'string') return body.message;
    }
    return 'Could not create your account. Please try again.';
  }
}
