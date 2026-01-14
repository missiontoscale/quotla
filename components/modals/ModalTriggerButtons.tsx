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
  mode?: 'create' | 'view' | 'edit'
  onSuccess?: () => void
}

/**
 * Button to open the Invoice Modal
 *
 * @example
 * // Create new invoice
 * <OpenInvoiceButton />
 *
 * @example
 * // View existing invoice
 * <OpenInvoiceButton itemId="invoice-123" mode="view" />
 *
 * @example
 * // Edit existing invoice
 * <OpenInvoiceButton itemId="invoice-123" mode="edit">Edit Invoice</OpenInvoiceButton>
 */
export function OpenInvoiceButton({
  children = 'New Invoice',
  variant = 'default',
  size = 'default',
  showIcon = true,
  itemId,
  mode = 'create',
  onSuccess,
  ...props
}: BaseModalButtonProps) {
  const { openInvoiceModal, setOnSuccess } = useModal()

  const handleClick = () => {
    if (onSuccess) {
      setOnSuccess(onSuccess)
    }
    openInvoiceModal(itemId, mode)
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
 * Button to open the Supplier Modal
 *
 * @example
 * // Create new supplier
 * <OpenSupplierButton />
 *
 * @example
 * // Edit existing supplier with callback
 * <OpenSupplierButton
 *   itemId="supplier-123"
 *   mode="edit"
 *   onSuccess={() => console.log('Supplier updated!')}
 * >
 *   Edit Supplier
 * </OpenSupplierButton>
 */
export function OpenSupplierButton({
  children = 'New Supplier',
  variant = 'default',
  size = 'default',
  showIcon = true,
  itemId,
  mode = 'create',
  onSuccess,
  ...props
}: BaseModalButtonProps) {
  const { openSupplierModal, setOnSuccess } = useModal()

  const handleClick = () => {
    if (onSuccess) {
      setOnSuccess(onSuccess)
    }
    openSupplierModal(itemId, mode)
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
