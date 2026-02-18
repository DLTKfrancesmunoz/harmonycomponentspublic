import { Component, input, output } from '@angular/core';
import { CommonModule } from '@angular/common';

export type ButtonVariant =
  | 'primary'
  | 'secondary'
  | 'tertiary'
  | 'outline'
  | 'ghost'
  | 'destructive'
  | 'dela'
  | 'dela-pill';
export type ButtonSize = 'xs' | 'sm' | 'md' | 'lg';
export type ButtonType = 'theme' | 'pageHeader';

@Component({
  selector: 'app-button',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './button.html',
  host: {
    '[class.app-button--full]': 'fullWidth()',
  },
})
export class Button {
  variant = input<ButtonVariant>('primary');
  buttonType = input<ButtonType>('theme');
  size = input<ButtonSize>('md');
  orientation = input<'horizontal' | 'vertical'>('horizontal');
  disabled = input<boolean>(false);
  loading = input<boolean>(false);
  loadingText = input<string>();
  icon = input<string>();
  iconPosition = input<'left' | 'right'>('left');
  type = input<'button' | 'submit' | 'reset'>('button');
  fullWidth = input<boolean>(false);
  href = input<string>();
  ariaLabel = input<string>();
  isIconOnly = input<boolean>(false);

  click = output<void>();

  get _isIconOnly(): boolean {
    return this.isIconOnly();
  }

  get isDelaVariant(): boolean {
    const v = this.variant();
    return v === 'dela' || v === 'dela-pill';
  }

  get buttonClasses(): string {
    const variant = this.variant();
    const buttonType = this.buttonType();
    const size = this.size();
    const isIconOnly = this._isIconOnly;
    const isDelaVariant = this.isDelaVariant;
    const disabled = this.disabled();
    const loading = this.loading();
    const orientation = this.orientation();
    const fullWidth = this.fullWidth();
    return [
      'btn',
      `btn--${variant}`,
      buttonType === 'pageHeader' && !isDelaVariant && 'btn--page-header',
      isIconOnly ? `btn--icon-${size}` : `btn--${size}`,
      orientation === 'vertical' && 'btn--vertical',
      (disabled || loading) && 'btn--disabled',
      loading && 'btn--loading',
      fullWidth && 'btn--full',
    ]
      .filter(Boolean)
      .join(' ');
  }

  handleClick(e: Event): void {
    (e as MouseEvent).preventDefault();
    if (this.disabled() || this.loading()) return;
    this.click.emit();
  }
}
