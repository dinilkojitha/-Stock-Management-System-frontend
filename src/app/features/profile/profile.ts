import { CommonModule } from '@angular/common';
import { Component, inject, OnInit, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { switchMap } from 'rxjs';
import { ApiService } from '../../core/services/api.service';
import { AuthService } from '../../core/services/auth.service';
import { UserRequest, UserResponse } from '../../models/domain.models';

@Component({
  selector: 'app-profile',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './profile.html',
})
export class Profile implements OnInit {
  private readonly api = inject(ApiService);
  private readonly auth = inject(AuthService);

  profile = signal<UserResponse | null>(null);
  loading = signal(true);
  savingProfile = signal(false);
  changingPassword = signal(false);
  profileMessage = signal('');
  profileError = signal('');
  passwordMessage = signal('');
  passwordError = signal('');

  profileForm = { fullName: '', email: '', phoneNumber: '' };
  passwordForm = { currentPassword: '', newPassword: '', confirmPassword: '' };

  ngOnInit() {
    const userId = this.auth.session()?.id;
    if (!userId) {
      this.loading.set(false);
      this.profileError.set('Your login session is missing a user ID. Sign in again.');
      return;
    }

    this.api.getUserById(userId).subscribe({
      next: (profile) => {
        this.profile.set(profile);
        this.profileForm = {
          fullName: profile.fullName,
          email: profile.email,
          phoneNumber: profile.phoneNumber || '',
        };
        this.loading.set(false);
      },
      error: (error) => {
        this.profileError.set(this.getError(error, 'Could not load your profile.'));
        this.loading.set(false);
      },
    });
  }

  saveProfile() {
    const current = this.profile();
    if (!current) return;
    if (!this.profileForm.fullName.trim() || !this.profileForm.email.trim()) {
      this.profileError.set('Name and email are required.');
      return;
    }

    const request: UserRequest = {
      fullName: this.profileForm.fullName.trim(),
      email: this.profileForm.email.trim(),
      phoneNumber: this.profileForm.phoneNumber.trim(),
      roleId: current.roleId,
      branchId: current.branchId,
      departmentId: current.departmentId,
    };

    this.savingProfile.set(true);
    this.profileError.set('');
    this.profileMessage.set('');
    this.api.updateUser(current.id, request).subscribe({
      next: (updated) => {
        this.profile.set(updated);
        this.profileForm = {
          fullName: updated.fullName,
          email: updated.email,
          phoneNumber: updated.phoneNumber || '',
        };
        this.auth.session.update((session) =>
          session
            ? {
                ...session,
                fullName: updated.fullName,
                email: updated.email,
                phoneNumber: updated.phoneNumber,
              }
            : session,
        );
        this.profileMessage.set('Your profile has been updated.');
        this.savingProfile.set(false);
      },
      error: (error) => {
        this.profileError.set(this.getError(error, 'Could not update your profile.'));
        this.savingProfile.set(false);
      },
    });
  }

  changePassword() {
    const current = this.profile();
    if (!current) return;
    const { currentPassword, newPassword, confirmPassword } = this.passwordForm;
    if (!currentPassword || !newPassword) {
      this.passwordError.set('Enter your current password and a new password.');
      return;
    }
    if (newPassword.length < 8) {
      this.passwordError.set('Your new password must contain at least 8 characters.');
      return;
    }
    if (newPassword !== confirmPassword) {
      this.passwordError.set('The new password and confirmation do not match.');
      return;
    }
    if (currentPassword === newPassword) {
      this.passwordError.set('Choose a new password different from your current password.');
      return;
    }

    const request: UserRequest = {
      fullName: current.fullName,
      email: current.email,
      phoneNumber: current.phoneNumber || '',
      roleId: current.roleId,
      branchId: current.branchId,
      departmentId: current.departmentId,
      password: newPassword,
    };

    this.changingPassword.set(true);
    this.passwordError.set('');
    this.passwordMessage.set('');
    this.auth
      .login({ email: current.email, password: currentPassword })
      .pipe(switchMap(() => this.api.updateUser(current.id, request)))
      .subscribe({
        next: () => {
          this.passwordForm = { currentPassword: '', newPassword: '', confirmPassword: '' };
          this.passwordMessage.set('Your password has been changed.');
          this.changingPassword.set(false);
        },
        error: (error) => {
          this.passwordError.set(this.getError(error, 'Could not change your password.'));
          this.changingPassword.set(false);
        },
      });
  }

  private getError(error: any, fallback: string): string {
    const detail = typeof error?.error === 'string' ? error.error : error?.error?.message;
    return detail || error?.message || fallback;
  }
}
