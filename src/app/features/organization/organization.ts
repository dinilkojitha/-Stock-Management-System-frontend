import { Component, inject, OnInit, signal } from '@angular/core';
import { ApiService } from '../../core/services/api.service';
import {
  BranchResponse,
  DepartmentResponse,
  BranchPerformanceResponse,
  BranchRequest,
  DepartmentRequest,
} from '../../models/domain.models';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-organization',
  standalone: true,
  imports: [FormsModule], // Removed NgClass as it is no longer needed
  styleUrl: './organization.css',
  templateUrl: './organization.html',
})
export class Organization implements OnInit {
  private api = inject(ApiService);

  // State Signals
  branches = signal<BranchResponse[]>([]);
  departments = signal<DepartmentResponse[]>([]);
  performances = signal<BranchPerformanceResponse[]>([]);

  // Simple form models
  newBranch: BranchRequest = { branchName: '', location: '' };
  newDept: DepartmentRequest = { departmentName: '', location: '', branchId: 0 };

  ngOnInit() {
    this.loadAllData();
  }

  loadAllData() {
    this.loadBranches();
    this.loadDepartments();
    this.loadPerformances();
  }

  // --- Branch Operations ---
  loadBranches() {
    this.api.getAllBranches().subscribe({
      next: (d) => {
        console.log(d);
        this.branches.set(d)},
      error: (err) => console.error('Failed to load branches', err),
    });
  }

  loadPerformances() {
    this.api.getAllBranchPerformance().subscribe({
      next: (d) => this.performances.set(d),
    });
  }

  createBranch() {
    if (!this.newBranch.branchName) return;
    this.api.createBranch(this.newBranch).subscribe({
      next: () => {
        this.loadBranches();
        this.newBranch = { branchName: '', location: '' }; // reset
      },
    });
  }

  deleteBranch(id: number) {
    if (confirm('Are you sure you want to delete this branch?')) {
      this.api.deleteBranch(id).subscribe({
        next: () => this.loadAllData(),
        error: (err) => alert('Cannot delete branch: ' + err.message),
      });
    }
  }

  // --- Department Operations ---
  loadDepartments() {
    this.api.getAllDepartments().subscribe({
      next: (d) => this.departments.set(d),
    });
  }

  createDepartment() {
    if (!this.newDept.departmentName || !this.newDept.branchId) return;
    this.api.createDepartment(this.newDept).subscribe({
      next: () => {
        this.loadDepartments();
        this.newDept = { departmentName: '', location: '', branchId: 0 }; // reset
      },
    });
  }

  deleteDepartment(id: number) {
    if (confirm('Are you sure you want to delete this department?')) {
      this.api.deleteDepartment(id).subscribe({
        next: () => this.loadDepartments(),
        error: (err) => alert('Cannot delete department: ' + err.message),
      });
    }
  }
}
