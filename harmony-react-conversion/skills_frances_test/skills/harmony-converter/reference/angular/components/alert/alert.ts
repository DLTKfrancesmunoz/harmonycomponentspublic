import { Component, input, output } from '@angular/core';
import { CommonModule } from '@angular/common';

export type AlertVariant = 'info' | 'success' | 'warning' | 'error';
export type AlertStyle = 'default' | 'enhanced';
export interface AlertButtonConfig {
  text: string;
  href?: string;
  onClick?: () => void;
}

@Component({
  selector: 'app-alert',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './alert.html',
})
export class Alert {
  variant = input<AlertVariant>('info');
  alertStyle = input<AlertStyle>('default');
  title = input<string>();
  dismissible = input<boolean>(false);
  primaryButton = input<AlertButtonConfig>();
  secondaryButton = input<AlertButtonConfig>();
  linkText = input<string>();
  linkHref = input<string>();
  progressValue = input<number>();

  dismiss = output<void>();

  private readonly defaultIcons: Record<AlertVariant, string> = {
    info: 'information-circle',
    success: 'check-circle',
    warning: 'exclamation-triangle',
    error: 'exclamation-circle',
  };

  get iconName(): string {
    return this.defaultIcons[this.variant()];
  }

  get hasActions(): boolean {
    return !!this.primaryButton() || !!this.secondaryButton() || (!!this.linkText() && !!this.linkHref());
  }

  get progressValueClamped(): number | null {
    const v = this.progressValue();
    return v != null ? Math.min(100, Math.max(0, v)) : null;
  }

  get alertClasses(): string {
    const variant = this.variant();
    const style = this.alertStyle();
    return [
      'alert',
      `alert--${variant}`,
      style === 'enhanced' && 'alert--enhanced',
    ]
      .filter(Boolean)
      .join(' ');
  }

  handleClose(): void {
    this.dismiss.emit();
  }
}
