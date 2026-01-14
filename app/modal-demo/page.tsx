'use client'

import {
  OpenInvoiceButton,
  OpenCustomerButton,
  OpenSupplierButton,
  OpenProductButton,
  useModal
} from '@/components/modals'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'

/**
 * Modal System Demo Page
 *
 * This page demonstrates all the ways to use the Global Modal System.
 * Use this to test that the modal system is working correctly.
 */
export default function ModalDemoPage() {
  const { openInvoiceModal, openCustomerModal, setOnSuccess } = useModal()

  const handleSuccess = () => {
    alert('Success callback triggered!')
    console.log('Modal operation completed successfully')
  }

  return (
    <div className="container mx-auto p-8 space-y-8">
      <div className="text-center">
        <h1 className="text-4xl font-bold mb-2">Global Modal System Demo</h1>
        <p className="text-gray-600">
          Test all modal triggers and behaviors
        </p>
      </div>

      {/* Pre-built Button Components */}
      <Card>
        <CardHeader>
          <CardTitle>1. Pre-built Button Components</CardTitle>
          <CardDescription>
            The easiest way to open modals - just drop in a button component
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <h4 className="font-semibold mb-2">Create Mode (Default)</h4>
            <div className="flex flex-wrap gap-2">
              <OpenInvoiceButton />
              <OpenCustomerButton />
              <OpenSupplierButton />
              <OpenProductButton />
            </div>
          </div>

          <div>
            <h4 className="font-semibold mb-2">Custom Text</h4>
            <div className="flex flex-wrap gap-2">
              <OpenInvoiceButton>Create Invoice</OpenInvoiceButton>
              <OpenCustomerButton>Add Customer</OpenCustomerButton>
              <OpenSupplierButton>Add Supplier</OpenSupplierButton>
              <OpenProductButton>Add Product</OpenProductButton>
            </div>
          </div>

          <div>
            <h4 className="font-semibold mb-2">Different Variants</h4>
            <div className="flex flex-wrap gap-2">
              <OpenInvoiceButton variant="default">Default</OpenInvoiceButton>
              <OpenInvoiceButton variant="outline">Outline</OpenInvoiceButton>
              <OpenInvoiceButton variant="ghost">Ghost</OpenInvoiceButton>
              <OpenInvoiceButton variant="secondary">Secondary</OpenInvoiceButton>
            </div>
          </div>

          <div>
            <h4 className="font-semibold mb-2">Different Sizes</h4>
            <div className="flex flex-wrap gap-2 items-center">
              <OpenInvoiceButton size="sm">Small</OpenInvoiceButton>
              <OpenInvoiceButton size="default">Default</OpenInvoiceButton>
              <OpenInvoiceButton size="lg">Large</OpenInvoiceButton>
            </div>
          </div>

          <div>
            <h4 className="font-semibold mb-2">Without Icon</h4>
            <div className="flex flex-wrap gap-2">
              <OpenInvoiceButton showIcon={false}>
                No Icon Invoice
              </OpenInvoiceButton>
              <OpenCustomerButton showIcon={false}>
                No Icon Customer
              </OpenCustomerButton>
            </div>
          </div>

          <div>
            <h4 className="font-semibold mb-2">With Success Callback</h4>
            <div className="flex flex-wrap gap-2">
              <OpenInvoiceButton onSuccess={handleSuccess}>
                Invoice with Callback
              </OpenInvoiceButton>
              <OpenCustomerButton onSuccess={handleSuccess}>
                Customer with Callback
              </OpenCustomerButton>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Using the Hook */}
      <Card>
        <CardHeader>
          <CardTitle>2. Using the useModal Hook</CardTitle>
          <CardDescription>
            For custom implementations where you need more control
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <h4 className="font-semibold mb-2">Basic Hook Usage</h4>
            <div className="flex flex-wrap gap-2">
              <Button onClick={() => openInvoiceModal()}>
                Open Invoice Modal
              </Button>
              <Button onClick={() => openCustomerModal()}>
                Open Customer Modal
              </Button>
            </div>
          </div>

          <div>
            <h4 className="font-semibold mb-2">With Success Callback</h4>
            <div className="flex flex-wrap gap-2">
              <Button
                onClick={() => {
                  setOnSuccess(handleSuccess)
                  openInvoiceModal()
                }}
              >
                Invoice with Callback (Hook)
              </Button>
              <Button
                onClick={() => {
                  setOnSuccess(() => {
                    console.log('Custom callback executed!')
                    alert('Customer modal success!')
                  })
                  openCustomerModal()
                }}
              >
                Customer with Custom Callback
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* View/Edit Modes */}
      <Card>
        <CardHeader>
          <CardTitle>3. View & Edit Modes</CardTitle>
          <CardDescription>
            Test viewing and editing existing items (requires actual data)
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="bg-yellow-50 border border-yellow-200 rounded p-4 text-sm text-yellow-800">
            <strong>Note:</strong> These buttons require actual invoice/customer IDs from your database.
            Replace the example IDs with real ones to test view/edit functionality.
          </div>

          <div>
            <h4 className="font-semibold mb-2">View Mode</h4>
            <div className="flex flex-wrap gap-2">
              <OpenInvoiceButton
                itemId="replace-with-real-id"
                mode="view"
                variant="outline"
              >
                View Invoice
              </OpenInvoiceButton>
              <OpenCustomerButton
                itemId="replace-with-real-id"
                mode="view"
                variant="outline"
              >
                View Customer
              </OpenCustomerButton>
            </div>
          </div>

          <div>
            <h4 className="font-semibold mb-2">Edit Mode</h4>
            <div className="flex flex-wrap gap-2">
              <OpenInvoiceButton
                itemId="replace-with-real-id"
                mode="edit"
                variant="outline"
              >
                Edit Invoice
              </OpenInvoiceButton>
              <OpenCustomerButton
                itemId="replace-with-real-id"
                mode="edit"
                variant="outline"
              >
                Edit Customer
              </OpenCustomerButton>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Advanced Patterns */}
      <Card>
        <CardHeader>
          <CardTitle>4. Advanced Patterns</CardTitle>
          <CardDescription>
            Complex use cases and patterns
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <h4 className="font-semibold mb-2">Chained Modals</h4>
            <p className="text-sm text-gray-600 mb-2">
              Open one modal, and when it succeeds, open another
            </p>
            <Button
              onClick={() => {
                setOnSuccess(() => {
                  alert('Customer created! Now opening invoice modal...')
                  setTimeout(() => {
                    openInvoiceModal()
                  }, 500)
                })
                openCustomerModal()
              }}
            >
              Create Customer → Then Invoice
            </Button>
          </div>

          <div>
            <h4 className="font-semibold mb-2">Conditional Opening</h4>
            <p className="text-sm text-gray-600 mb-2">
              Check conditions before opening
            </p>
            <Button
              onClick={() => {
                const hasPermission = confirm('Do you have permission to create invoices?')
                if (hasPermission) {
                  openInvoiceModal()
                } else {
                  alert('Permission denied!')
                }
              }}
            >
              Conditional Invoice Create
            </Button>
          </div>

          <div>
            <h4 className="font-semibold mb-2">With State Updates</h4>
            <p className="text-sm text-gray-600 mb-2">
              Update component state after modal operations
            </p>
            <Button
              onClick={() => {
                let operationCount = 0
                setOnSuccess(() => {
                  operationCount++
                  console.log(`Operations completed: ${operationCount}`)
                  alert(`This is operation #${operationCount}`)
                })
                openInvoiceModal()
              }}
            >
              Track Operations
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Documentation Links */}
      <Card className="bg-blue-50 border-blue-200">
        <CardHeader>
          <CardTitle>📚 Documentation</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          <div className="text-sm">
            <strong>Complete Guide:</strong>{' '}
            <code className="bg-white px-2 py-1 rounded">docs/MODAL_SYSTEM.md</code>
          </div>
          <div className="text-sm">
            <strong>Migration Examples:</strong>{' '}
            <code className="bg-white px-2 py-1 rounded">docs/MODAL_MIGRATION_EXAMPLE.md</code>
          </div>
          <div className="text-sm">
            <strong>Quick Start:</strong>{' '}
            <code className="bg-white px-2 py-1 rounded">docs/QUICK_START_EXAMPLES.md</code>
          </div>
          <div className="text-sm">
            <strong>Component README:</strong>{' '}
            <code className="bg-white px-2 py-1 rounded">components/modals/README.md</code>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
