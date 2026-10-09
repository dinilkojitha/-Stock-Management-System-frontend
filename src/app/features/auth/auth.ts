import { Component, inject, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ApiService } from '../../core/services/api.service';
import {
  BranchResponse,
  DepartmentResponse,
  Role,
  UserRequest,
  UserResponse,
} from '../../models/domain.models';

@Component({
  selector: 'app-Auth',
  standalone: true,
  imports: [CommonModule, FormsModule],
  styleUrl: './auth.css',
  templateUrl: './auth.html',
})
export class Auth implements OnInit {
  private api = inject(ApiService);

  activeTab = signal<'users' | 'roles'>('users');
  activeModal = signal<'none' | 'user' | 'role'>('none');
  isEditing = signal(false);
  editId = signal<number>(0);

  // Data
  users = signal<UserResponse[]>([]);
  roles = signal<Role[]>([]);
  branches = signal<BranchResponse[]>([]);
  departments = signal<DepartmentResponse[]>([]);
  selectedBranchId: number | null = null;

  // Forms
  userForm: UserRequest = {
    fullName: '',
    email: '',
    phoneNumber: '',
    roleId: 0,
    branchId: null,
    departmentId: null,
    password: '',
  };
  roleForm: Role = { name: '', accessLevel: 50 };

  ngOnInit() {
    this.loadData();
    this.api.getAllDepartments().subscribe((deps) => this.departments.set(deps));
    this.api.getAllBranches().subscribe((branches) => this.branches.set(branches));
  }

  setTab(tab: 'users' | 'roles') {
    this.activeTab.set(tab);
    this.loadData();
  }

  loadData() {
    if (this.activeTab() === 'users') {
      this.api.getUsers().subscribe((res) => this.users.set(res));
      this.api.getRoles().subscribe((res) => this.roles.set(res)); // Needed for dropdowns
    } else {
      this.api.getRoles().subscribe((res) => this.roles.set(res));
    }
  }

  // --- User Operations ---
  openUserModal(user?: UserResponse) {
    if (user) {
      this.isEditing.set(true);
      this.editId.set(user.id);
      this.userForm = {
        fullName: user.fullName,
        email: user.email,
        phoneNumber: user.phoneNumber,
        roleId: user.roleId,
        branchId: user.branchId,
        departmentId: user.departmentId,
        password: '', // Backend ignores blank passwords on update
      };
      this.selectedBranchId =
        user.branchId ??
        this.departments().find((department) => department.id === user.departmentId)?.branchId ??
        null;
    } else {
      this.isEditing.set(false);
      this.userForm = {
        fullName: '',
        email: '',
        phoneNumber: '',
        roleId: 0,
        branchId: null,
        departmentId: null,
        password: '',
      };
      this.selectedBranchId = null;
    }
    this.activeModal.set('user');
  }

  get departmentsForSelectedBranch(): DepartmentResponse[] {
    return this.departments().filter(
      (department) => department.branchId === Number(this.selectedBranchId),
    );
  }

  onUserBranchChange(branchId: number | null) {
    this.selectedBranchId = branchId === null ? null : Number(branchId);
    this.userForm.branchId = this.selectedBranchId;
    this.userForm.departmentId = null;
  }

  isAdminRole(roleId = this.userForm.roleId): boolean {
    const role = this.roles().find((candidate) => candidate.id === Number(roleId));
    return role?.name.trim().toLowerCase() === 'admin';
  }

  onUserRoleChange(roleId: number) {
    this.userForm.roleId = Number(roleId);
    if (this.isAdminRole()) {
      this.selectedBranchId = null;
      this.userForm.branchId = null;
      this.userForm.departmentId = null;
    }
  }

  saveUser() {
    if (
      !this.userForm.roleId ||
      (!this.isAdminRole() && !this.selectedBranchId)
    ) {
      alert('Select a role and branch for non-admin users.');
      return;
    }

    const requestBody: UserRequest = {
      ...this.userForm,
      branchId: this.isAdminRole() ? null : Number(this.selectedBranchId),
      departmentId: this.isAdminRole()
        ? null
        : this.userForm.departmentId
          ? Number(this.userForm.departmentId)
          : null,
    };
    const request = this.isEditing()
      ? this.api.updateUser(this.editId(), requestBody)
      : this.api.createUser(requestBody);

    request.subscribe({
      next: () => {
        this.activeModal.set('none');
        this.loadData();
      },
      error: (err) => alert('Failed to save user: ' + err.message),
    });
  }

  deleteUser(id: number) {
    if (confirm('Permanently delete this user?')) {
      this.api.deleteUser(id).subscribe(() => this.loadData());
    }
  }

  // --- Role Operations ---
  openRoleModal(role?: Role) {
    if (role) {
      this.isEditing.set(true);
      this.editId.set(role.id!);
      this.roleForm = { name: role.name, accessLevel: role.accessLevel };
    } else {
      this.isEditing.set(false);
      this.roleForm = { name: '', accessLevel: 50 };
    }
    this.activeModal.set('role');
  }

  saveRole() {
    const request = this.isEditing()
      ? this.api.updateRole(this.editId(), this.roleForm)
      : this.api.createRole(this.roleForm);

    request.subscribe({
      next: () => {
        this.activeModal.set('none');
        this.loadData();
      },
      error: (err) => alert('Failed to save role: ' + err.message),
    });
  }

  deleteRole(id: number) {
    if (confirm('Delete this role? This will fail if users are assigned to it.')) {
      this.api.deleteRole(id).subscribe({
        next: () => this.loadData(),
        error: (err) => alert('Cannot delete role: It is currently assigned to one or more users.'),
      });
    }
  }
}
