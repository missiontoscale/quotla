'use client'

import { useModal } from '@/contexts/ModalContext'
import { Button } from '@/components/ui/button'
import { Plus } from 'lucide-react'
import { ButtonHTMLAttributes, ReactNode } from 'react'

interface BaseModalButtonProps extends Omit<ButtonHTMLAttributes<HTMLButtonElement>, 'onClick'> {
  children?: ReactNode
  variant?: 'default' | 'outline' | 'ghost' | 'link' | 'destructive' | 'secondary'
  size?: 'default' | 'sm' | 'lg' | 'icon'
  showIcon?: boolean
  itemId?: string
  mode?: 'create' | 'edit'
  onSuccess?: () => void
}

/**
 * Button to open the Customer Modal
 *
 * @example
 * // Create new customer
 * <OpenCustomerButton />
 *
 * @example
 * // View existing customer
 * <OpenCustomerButton itemId="customer-123" mode="view" />
 *
 * @example
 * // Custom styling
 * <OpenCustomerButton variant="outline" size="sm">Add Customer</OpenCustomerButton>
 */
export function OpenCustomerButton({
  children = 'New Customer',
  variant = 'default',
  size = 'default',
  showIcon = true,
  itemId,
  mode = 'create',
  onSuccess,
  ...props
}: BaseModalButtonProps) {
  const { openCustomerModal, setOnSuccess } = useModal()

  const handleClick = () => {
    if (onSuccess) {
      setOnSuccess(onSuccess)
    }
    openCustomerModal(itemId, mode)
  }

  return (
    <Button
      onClick={handleClick}
      variant={variant}
      size={size}
      {...props}
    >
      {showIcon && <Plus className="mr-2 h-4 w-4" />}
      {children}
    </Button>
  )
}

/**
 * Button to open the Vendor Modal
 *
 * @example
 * // Create new vendor
 * <OpenVendorButton />
 *
 * @example
 * // Edit existing vendor with callback
 * <OpenVendorButton
 *   itemId="vendor-123"
 *   mode="edit"
 *   onSuccess={() => console.log('Vendor updated!')}
 * >
 *   Edit Vendor
 * </OpenVendorButton>
 */
export function OpenVendorButton({
  children = 'New Vendor',
  variant = 'default',
  size = 'default',
  showIcon = true,
  itemId,
  mode = 'create',
  onSuccess,
  ...props
}: BaseModalButtonProps) {
  const { openVendorModal, setOnSuccess } = useModal()

  const handleClick = () => {
    if (onSuccess) {
      setOnSuccess(onSuccess)
    }
    openVendorModal(itemId, mode)
  }

  return (
    <Button
      onClick={handleClick}
      variant={variant}
      size={size}
      {...props}
    >
      {showIcon && <Plus className="mr-2 h-4 w-4" />}
      {children}
    </Button>
  )
}

/**
 * Button to open the Expense Modal
 *
 * @example
 * // Create new expense
 * <OpenExpenseButton />
 *
 * @example
 * // Edit existing expense with callback
 * <OpenExpenseButton
 *   itemId="expense-123"
 *   mode="edit"
 *   onSuccess={() => console.log('Expense updated!')}
 * >
 *   Edit Expense
 * </OpenExpenseButton>
 */
export function OpenExpenseButton({
  children = 'New Expense',
  variant = 'default',
  size = 'default',
  showIcon = true,
  itemId,
  mode = 'create',
  onSuccess,
  ...props
}: BaseModalButtonProps) {
  const { openExpenseModal, setOnSuccess } = useModal()

  const handleClick = () => {
    if (onSuccess) {
      setOnSuccess(onSuccess)
    }
    openExpenseModal(itemId, mode)
  }

  return (
    <Button
      onClick={handleClick}
      variant={variant}
      size={size}
      {...props}
    >
      {showIcon && <Plus className="mr-2 h-4 w-4" />}
      {children}
    </Button>
  )
}

/**
 * Button to open the Product Modal
 *
 * @example
 * // Create new product
 * <OpenProductButton />
 *
 * @example
 * // Without icon
 * <OpenProductButton showIcon={false}>Add Product</OpenProductButton>
 */
export function OpenProductButton({
  children = 'New Product',
  variant = 'default',
  size = 'default',
  showIcon = true,
  itemId,
  mode = 'create',
  onSuccess,
  ...props
}: BaseModalButtonProps) {
  const { openProductModal, setOnSuccess } = useModal()

  const handleClick = () => {
    if (onSuccess) {
      setOnSuccess(onSuccess)
    }
    openProductModal(itemId, mode)
  }

  return (
    <Button
      onClick={handleClick}
      variant={variant}
      size={size}
      {...props}
    >
      {showIcon && <Plus className="mr-2 h-4 w-4" />}
      {children}
    </Button>
  )
}
